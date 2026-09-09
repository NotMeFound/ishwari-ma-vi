import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { EventEmitter } from 'events';
import {
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  PermissionKey,
  AdminRole
} from '../src/types';
import {
  initialSchoolData,
  initialNotices,
  initialStaff,
  initialFacilities,
  initialEvents,
  initialAchievements,
  initialHistory,
  initialDocuments,
  initialPrograms,
  initialMessages,
  initialGallery,
  initialSiteConfig,
  initialSecurityConfig,
  initialAuditLogs
} from '../src/data/schoolData';
import { initialAdminAccounts, ALL_PERMISSIONS } from '../src/utils/security';

export interface CMSDatabaseState {
  version: number;
  lastModified: string;
  school: SchoolData;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  auditLogs: SecurityAuditLogEntry[];
  adminAccounts: AdminAccount[];
}

export interface ServerSession {
  token: string;
  userId: string;
  username: string;
  fullName: string;
  role: AdminRole;
  permissions: PermissionKey[];
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

export interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockoutUntil: number;
}

export function hashPasswordBcrypt(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPasswordBcrypt(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch {
      return false;
    }
  }
  return password === hash;
}

class CMSDatabaseManager {
  private dbPath: string;
  private state: CMSDatabaseState | null = null;
  private emitter = new EventEmitter();
  private writeQueue: Promise<void> = Promise.resolve();

  // In-memory Server Sessions
  private activeSessions = new Map<string, ServerSession>();

  // Rate-limiting / brute force protection
  private loginAttempts = new Map<string, RateLimitEntry>();

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Error creating data directory:', err);
      }
    }
    this.dbPath = path.join(dataDir, 'cms_database.json');
    this.init();
  }

  private getDefaultState(): CMSDatabaseState {
    // Seed initial admin accounts with bcrypt hashes
    const secureAdminAccounts: AdminAccount[] = initialAdminAccounts.map((acc) => {
      const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
      return {
        ...acc,
        passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash)
      };
    });

    return {
      version: 1,
      lastModified: new Date().toISOString(),
      school: { ...initialSchoolData },
      notices: [...initialNotices],
      staff: [...initialStaff],
      facilities: [...initialFacilities],
      programs: [...initialPrograms],
      documents: [...initialDocuments],
      messages: [...initialMessages],
      events: [...initialEvents],
      achievements: [...initialAchievements],
      history: [...initialHistory],
      gallery: [...initialGallery],
      siteConfig: { ...initialSiteConfig },
      securityConfig: { ...initialSecurityConfig },
      auditLogs: [...initialAuditLogs],
      adminAccounts: secureAdminAccounts
    };
  }

  public init(): CMSDatabaseState {
    if (this.state) return this.state;

    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.school) {
          // Verify and upgrade any plaintext passwords to bcrypt hashes
          let accountsModified = false;
          const accounts: AdminAccount[] = (parsed.adminAccounts || initialAdminAccounts).map(
            (acc: AdminAccount) => {
              const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
              if (!isBcrypt) {
                accountsModified = true;
                return {
                  ...acc,
                  passwordHash: hashPasswordBcrypt(acc.passwordHash || 'Ishwari@Secure2026')
                };
              }
              return acc;
            }
          );

          this.state = {
            version: parsed.version || 1,
            lastModified: parsed.lastModified || new Date().toISOString(),
            school: parsed.school || initialSchoolData,
            notices: parsed.notices || initialNotices,
            staff: parsed.staff || initialStaff,
            facilities: parsed.facilities || initialFacilities,
            programs: parsed.programs || initialPrograms,
            documents: parsed.documents || initialDocuments,
            messages: parsed.messages || initialMessages,
            events: parsed.events || initialEvents,
            achievements: parsed.achievements || initialAchievements,
            history: parsed.history || initialHistory,
            gallery: parsed.gallery || initialGallery,
            siteConfig: parsed.siteConfig || initialSiteConfig,
            securityConfig: parsed.securityConfig || initialSecurityConfig,
            auditLogs: parsed.auditLogs || initialAuditLogs,
            adminAccounts: accounts
          };

          if (accountsModified) {
            this.persistSync();
          }
          return this.state;
        }
      }
    } catch (err) {
      console.error('Error reading CMS database file, initializing fresh state:', err);
    }

    // Initialize fresh default database state
    this.state = this.getDefaultState();
    this.persistSync();
    return this.state;
  }

  private persistSync(): void {
    if (!this.state) return;
    try {
      const tempPath = this.dbPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.state, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('Failed to sync write CMS database:', err);
    }
  }

  private async persistAsync(): Promise<void> {
    if (!this.state) return;
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        const tempPath = this.dbPath + '.tmp.' + Date.now();
        await fs.promises.writeFile(tempPath, JSON.stringify(this.state, null, 2), 'utf8');
        await fs.promises.rename(tempPath, this.dbPath);
      } catch (err) {
        console.error('Failed to async write CMS database:', err);
      }
    });
    await this.writeQueue;
  }

  public getState(): CMSDatabaseState {
    if (!this.state) this.init();
    return this.state!;
  }

  public getVersion(): { version: number; lastModified: string } {
    const s = this.getState();
    return { version: s.version, lastModified: s.lastModified };
  }

  /**
   * Sanitized state for public visitors:
   * Strips password hashes, salts, and secret recovery PINs.
   */
  public getPublicState(): Omit<CMSDatabaseState, 'adminAccounts' | 'securityConfig'> & {
    securityConfig: Partial<SecurityConfig>;
  } {
    const s = this.getState();
    const { recoveryPin, ...publicSecConfig } = s.securityConfig;
    return {
      version: s.version,
      lastModified: s.lastModified,
      school: s.school,
      notices: s.notices,
      staff: s.staff,
      facilities: s.facilities,
      programs: s.programs,
      documents: (s.documents || []).filter((d) => d.is_published !== false && d.status !== 'draft'),
      messages: s.messages,
      events: s.events,
      achievements: s.achievements,
      history: s.history,
      gallery: s.gallery,
      siteConfig: s.siteConfig,
      securityConfig: publicSecConfig,
      auditLogs: s.auditLogs
    };
  }

  public subscribe(listener: (payload: { module: string; version: number; lastModified: string }) => void) {
    this.emitter.on('change', listener);
    return () => {
      this.emitter.off('change', listener);
    };
  }

  /* ---------------- SESSION MANAGEMENT ---------------- */

  public createSession(account: AdminAccount, ip: string, userAgent: string): ServerSession {
    const timeoutMinutes = this.getState().securityConfig?.sessionTimeoutMinutes || 30;
    const now = Date.now();
    const expiresAt = now + timeoutMinutes * 60 * 1000;

    // Cryptographically secure session token (32 bytes hex)
    const token = crypto.randomBytes(32).toString('hex');

    const session: ServerSession = {
      token,
      userId: account.id,
      username: account.username,
      fullName: account.fullName,
      role: account.role,
      permissions: account.role === 'super_admin' ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      ip,
      userAgent
    };

    // Store session (keyed by token)
    this.activeSessions.set(token, session);

    // Clean up expired sessions
    this.cleanExpiredSessions();

    return session;
  }

  public validateSession(token: string | undefined): ServerSession | null {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.activeSessions.delete(token);
      return null;
    }

    // Verify account still exists and is active in authoritative database
    const s = this.getState();
    const account = s.adminAccounts.find((a) => a.id === session.userId);
    if (!account || account.status !== 'active') {
      this.activeSessions.delete(token);
      return null;
    }

    // Refresh permissions and role directly from database to prevent stale state
    session.role = account.role;
    session.permissions = account.role === 'super_admin' ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions;
    session.lastActivity = now;

    // Slide expiration window
    const timeoutMinutes = s.securityConfig?.sessionTimeoutMinutes || 30;
    session.expiresAt = now + timeoutMinutes * 60 * 1000;

    return session;
  }

  public destroySession(token: string | undefined): boolean {
    if (!token) return false;
    return this.activeSessions.delete(token);
  }

  public getActiveSessions(): ServerSession[] {
    this.cleanExpiredSessions();
    return Array.from(this.activeSessions.values());
  }

  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(token);
      }
    }
  }

  /* ---------------- BRUTE FORCE & RATE LIMITING ---------------- */

  public checkRateLimit(identifier: string): { isLocked: boolean; remainingSeconds: number } {
    const entry = this.loginAttempts.get(identifier);
    if (!entry) return { isLocked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (entry.lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((entry.lockoutUntil - now) / 1000)
      };
    }

    // If lockout has passed, reset counter
    if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
      this.loginAttempts.delete(identifier);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(identifier: string): {
    isLocked: boolean;
    remainingAttempts: number;
    remainingSeconds: number;
  } {
    const s = this.getState();
    const threshold = s.securityConfig?.lockoutThreshold || 5;
    const durationMinutes = s.securityConfig?.lockoutDurationMinutes || 5;
    const now = Date.now();

    const entry = this.loginAttempts.get(identifier) || {
      attempts: 0,
      lastAttempt: now,
      lockoutUntil: 0
    };

    entry.attempts += 1;
    entry.lastAttempt = now;

    if (entry.attempts >= threshold) {
      entry.lockoutUntil = now + durationMinutes * 60 * 1000;
      this.loginAttempts.set(identifier, entry);
      return {
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: durationMinutes * 60
      };
    }

    this.loginAttempts.set(identifier, entry);
    return {
      isLocked: false,
      remainingAttempts: Math.max(0, threshold - entry.attempts),
      remainingSeconds: 0
    };
  }

  public recordSuccessfulAttempt(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /* ---------------- SERVER-SIDE RBAC CHECKS ---------------- */

  public checkPermission(session: ServerSession, moduleKey: string): { allowed: boolean; reason?: string } {
    if (session.role === 'super_admin') {
      return { allowed: true };
    }

    const perms = session.permissions || [];

    // Privilege-sensitive modules
    if (moduleKey === 'reset') {
      return { allowed: false, reason: 'Super Admin privilege required to reset CMS data.' };
    }

    if (moduleKey === 'securityConfig') {
      return perms.includes('security.update')
        ? { allowed: true }
        : { allowed: false, reason: 'Security configuration permission required.' };
    }

    if (moduleKey === 'adminAccounts') {
      return perms.includes('admin.update') || perms.includes('admin.create')
        ? { allowed: true }
        : { allowed: false, reason: 'Administrator account management permission required.' };
    }

    if (moduleKey === 'auditLogs') {
      return perms.includes('audit.delete')
        ? { allowed: true }
        : { allowed: false, reason: 'Permission to modify audit logs required.' };
    }

    // Granular content modules
    if (moduleKey === 'notices') {
      const hasNotice = perms.some((p) => p.startsWith('notice.'));
      return hasNotice ? { allowed: true } : { allowed: false, reason: 'Notice management permission required.' };
    }
    if (moduleKey === 'staff') {
      const hasStaff = perms.some((p) => p.startsWith('teacher.') || p.startsWith('staff.'));
      return hasStaff ? { allowed: true } : { allowed: false, reason: 'Faculty / staff management permission required.' };
    }
    if (moduleKey === 'gallery') {
      const hasGallery = perms.some((p) => p.startsWith('gallery.'));
      return hasGallery ? { allowed: true } : { allowed: false, reason: 'Gallery management permission required.' };
    }
    if (moduleKey === 'facilities') {
      const hasFacility = perms.some((p) => p.startsWith('facility.'));
      return hasFacility ? { allowed: true } : { allowed: false, reason: 'Facility management permission required.' };
    }
    if (moduleKey === 'programs') {
      const hasProgram = perms.some((p) => p.startsWith('program.'));
      return hasProgram ? { allowed: true } : { allowed: false, reason: 'Academic program management permission required.' };
    }
    if (moduleKey === 'events') {
      const hasEvent = perms.some((p) => p.startsWith('event.'));
      return hasEvent ? { allowed: true } : { allowed: false, reason: 'Event management permission required.' };
    }
    if (moduleKey === 'achievements') {
      const hasAchieve = perms.some((p) => p.startsWith('achievement.'));
      return hasAchieve ? { allowed: true } : { allowed: false, reason: 'Achievement management permission required.' };
    }
    if (moduleKey === 'documents') {
      const hasDoc = perms.some((p) => p.startsWith('document.'));
      return hasDoc ? { allowed: true } : { allowed: false, reason: 'Document management permission required.' };
    }
    if (moduleKey === 'messages') {
      const hasMsg = perms.includes('message.update') || perms.includes('message.delete') || perms.includes('message.view');
      return hasMsg ? { allowed: true } : { allowed: false, reason: 'Contact communication management permission required.' };
    }
    if (moduleKey === 'siteConfig') {
      return perms.includes('settings.update')
        ? { allowed: true }
        : { allowed: false, reason: 'Site configuration permission required.' };
    }
    if (moduleKey === 'school') {
      return perms.includes('settings.update') || perms.includes('school.update')
        ? { allowed: true }
        : { allowed: false, reason: 'School profile modification permission required.' };
    }
    if (moduleKey === 'history') {
      return perms.some((p) => p.startsWith('history.')) || perms.includes('settings.update')
        ? { allowed: true }
        : { allowed: false, reason: 'History management permission required.' };
    }

    return { allowed: false, reason: 'Insufficient privileges for this action.' };
  }

  /* ---------------- CMS DATABASE OPERATIONS ---------------- */

  public async updateModule(
    moduleKey: keyof Omit<CMSDatabaseState, 'version' | 'lastModified'>,
    data: any,
    actor = 'Admin',
    ipAddress = '127.0.0.1'
  ): Promise<{ version: number; lastModified: string }> {
    const s = this.getState();

    // If updating adminAccounts, ensure all accounts have bcrypt-hashed passwords
    if (moduleKey === 'adminAccounts' && Array.isArray(data)) {
      data = data.map((acc: AdminAccount) => {
        const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || 'Ishwari@Secure2026')
        };
      });
    }

    (s as any)[moduleKey] = data;
    s.version = (s.version || 1) + 1;
    s.lastModified = new Date().toISOString();

    // Automatically append an audit log entry if it wasn't the auditLogs themselves
    if (moduleKey !== 'auditLogs') {
      const newLog: SecurityAuditLogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: s.lastModified.replace('T', ' ').substring(0, 19),
        action: `CMS Module Update [${String(moduleKey)}]`,
        actor,
        ipAddress,
        status: 'success',
        result: 'success',
        severity: 'info',
        details: `Updated ${String(moduleKey)} content in authoritative database`
      };
      s.auditLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];
    }

    await this.persistAsync();
    this.emitter.emit('change', { module: String(moduleKey), version: s.version, lastModified: s.lastModified });
    return { version: s.version, lastModified: s.lastModified };
  }

  public async updateBatch(
    batch: Partial<Omit<CMSDatabaseState, 'version' | 'lastModified'>>,
    actor = 'Super Admin',
    ipAddress = '127.0.0.1'
  ): Promise<{ version: number; lastModified: string }> {
    const s = this.getState();

    if (batch.adminAccounts && Array.isArray(batch.adminAccounts)) {
      batch.adminAccounts = batch.adminAccounts.map((acc: AdminAccount) => {
        const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || 'Ishwari@Secure2026')
        };
      });
    }

    for (const key of Object.keys(batch) as (keyof typeof batch)[]) {
      if (key in s && batch[key] !== undefined) {
        (s as any)[key] = batch[key];
      }
    }
    s.version = (s.version || 1) + 1;
    s.lastModified = new Date().toISOString();

    const newLog: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: s.lastModified.replace('T', ' ').substring(0, 19),
      action: `CMS Batch Update [${Object.keys(batch).join(', ')}]`,
      actor,
      ipAddress,
      status: 'success',
      result: 'success',
      severity: 'info',
      details: `Batch synchronization applied across ${Object.keys(batch).length} modules`
    };
    s.auditLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];

    await this.persistAsync();
    this.emitter.emit('change', { module: 'batch', version: s.version, lastModified: s.lastModified });
    return { version: s.version, lastModified: s.lastModified };
  }

  public async addContactMessage(message: Omit<ContactMessage, 'id' | 'date' | 'status'> & { id?: number }): Promise<ContactMessage> {
    const s = this.getState();
    const newMsg: ContactMessage = {
      id: message.id || Date.now(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    s.messages = [newMsg, ...(s.messages || [])];
    s.version = (s.version || 1) + 1;
    s.lastModified = new Date().toISOString();

    await this.persistAsync();
    this.emitter.emit('change', { module: 'messages', version: s.version, lastModified: s.lastModified });
    return newMsg;
  }

  public async appendAuditLog(entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const s = this.getState();
    const newEntry: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry
    };
    s.auditLogs = [newEntry, ...(s.auditLogs || []).slice(0, 199)];
    await this.persistAsync();
  }

  public async resetToDefaults(actor = 'Super Admin', ipAddress = '127.0.0.1'): Promise<{ version: number; lastModified: string }> {
    this.state = this.getDefaultState();
    this.state.version = Date.now();
    this.state.lastModified = new Date().toISOString();

    const newLog: SecurityAuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: this.state.lastModified.replace('T', ' ').substring(0, 19),
      action: 'CMS Database Factory Reset',
      actor,
      ipAddress,
      status: 'warning',
      result: 'success',
      severity: 'warning',
      details: 'All modules restored to initial authoritative baseline'
    };
    this.state.auditLogs = [newLog];

    await this.persistAsync();
    this.emitter.emit('change', { module: 'all', version: this.state.version, lastModified: this.state.lastModified });
    return { version: this.state.version, lastModified: this.state.lastModified };
  }
}

export const db = new CMSDatabaseManager();
