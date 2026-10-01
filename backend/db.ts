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
  AboutSection,
  CurriculumGuideline,
  Vacancy
} from './types';
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
  initialAuditLogs,
  initialCurriculumGuidelines,
  initialVacancies
} from '../frontend/data/schoolData';
import { initialAdminAccounts, ALL_PERMISSIONS } from '../frontend/utils/security';

export const defaultAboutSections: AboutSection[] = [
  {
    id: 'about-intro',
    title_en: 'About Ishwari Secondary School',
    title_np: 'ईश्वरी माध्यमिक विद्यालयको बारेमा',
    category: 'overview',
    content_en: `Shree Ishwari Secondary School was established in 2035 B.S. and has continued to provide quality, accessible education to students across the community.

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:Main School Academic Block|caption:Shree Ishwari Secondary School Academic Campus Block]]

Over the decades, the institution has steadily expanded its educational programs, infrastructure, and learning environment. Through generous community collaboration and dedicated governmental support, the school has developed modern multimedia classrooms, fully-equipped science and computer laboratories, and sports grounds.

Today, Ishwari Secondary School stands as a model community learning center where academic rigor, ethical discipline, and scientific inquiry are nurtured together.`,
    content_np: `श्री ईश्वरी माध्यमिक विद्यालय वि.सं. २०३५ सालमा स्थापित भई यस भेगका बालबालिकाहरूलाई गुणस्तरीय, सुलभ र व्यावहारिक शिक्षा प्रदान गर्दै आइरहेको एक ऐतिहासिक सामुदायिक शैक्षिक संस्था हो।

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:विद्यालयको मुख्य शैक्षिक भवन|caption:श्री ईश्वरी माध्यमिक विद्यालयको शैक्षिक परिसर]]

स्थापनाकालदेखि नै विद्यालयले आफ्ना शैक्षिक कार्यक्रमहरू, आधुनिक भौतिक पूर्वाधार तथा प्रविधिमैत्री सिकाइ वातावरणलाई निरन्तर सुदृढ बनाउँदै लगेको छ। समुदायको प्रत्यक्ष सहभागिता, अनुभवी शिक्षक मण्डली र विद्यार्थीहरूको लगनशीलताले विद्यालयलाई नमुना विद्यालयको रूपमा स्थापित गरेको छ।

आज यस विद्यालयमा आधुनिक विज्ञान प्रयोगशाला, कम्प्युटर ल्याब, सुसज्जित पुस्तकालय तथा खेलकुद मैदान उपलब्ध छन् जहाँ विद्यार्थीहरूको सर्वाङ्गीण विकासलाई प्राथमिकता दिइन्छ।`,
    image: '',
    image_caption_en: 'Main Academic Campus & Grounds',
    image_caption_np: 'विद्यालयको मुख्य शैक्षिक भवन तथा प्राङ्गण',
    display_order: 1,
    status: 'published',
    is_enabled: true,
    icon: 'Compass'
  },
  {
    id: 'about-mission',
    title_en: 'Our Mission',
    title_np: 'हाम्रो उद्देश्य',
    category: 'mission',
    content_en: 'To empower every learner with strong academic foundations, critical thinking abilities, digital literacy, and civic values.',
    content_np: 'प्रत्येक विद्यार्थीलाई आधारभूत शैक्षिक ज्ञान, सिर्जनशीलता, प्रविधिमैत्री सीप र उच्च नैतिक संस्कार प्रदान गर्नु।',
    display_order: 2,
    status: 'published',
    is_enabled: true,
    icon: 'Target'
  },
  {
    id: 'about-vision',
    title_en: 'Our Vision',
    title_np: 'हाम्रो दृष्टिकोण',
    category: 'vision',
    content_en: 'To establish Ishwari as a premier national model school delivering accessible, internationally competitive education in Nepal.',
    content_np: 'नेपालको अग्रणी नमुना सामुदायिक विद्यालयको रूपमा विकास गरी राष्ट्रिय तथा अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धी जनशक्ति तयार पार्नु।',
    display_order: 3,
    status: 'published',
    is_enabled: true,
    icon: 'Eye'
  },
  {
    id: 'about-values',
    title_en: 'Core Values',
    title_np: 'हाम्रा मुख्य मान्यताहरू',
    category: 'values',
    content_en: 'Academic Integrity, Social Inclusion, Scientific Temper, Environmental Stewardship, and Community Trust.',
    content_np: 'शैक्षिक निष्ठा, सामाजिक समावेशिता, वैज्ञानिक चेतना, वातावरण संरक्षण र पूर्ण अनुशासन।',
    display_order: 4,
    status: 'published',
    is_enabled: true,
    icon: 'Scale'
  },
  {
    id: 'about-governance',
    title_en: 'School Management Committee (SMC) & Governance',
    title_np: 'विद्यालय व्यवस्थापन समिति (SMC) तथा सुशासन',
    category: 'governance',
    content_en: 'Under the Education Act of Nepal, the School Management Committee oversees institutional policy, educational equity, resource allocation, and annual social audits with active community participation.',
    content_np: 'शिक्षा ऐन तथा नियमावली अनुसार अभिभावक, स्थानीय तहका प्रतिनिधि र शिक्षाप्रेमीहरूको सहभागितामा गठित विद्यालय व्यवस्थापन समितिले नीतिगत निर्णय, पारदर्शिता र शैक्षिक गुणस्तर अभिवृद्धिमा नेतृत्वदायी भूमिका निर्वाह गर्दछ।',
    display_order: 5,
    status: 'published',
    is_enabled: true,
    icon: 'Building2'
  }
];

export interface CMSDatabaseState {
  version: number;
  lastModified: string;
  school: SchoolData;
  aboutSections: AboutSection[];
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  curriculumGuidelines: CurriculumGuideline[];
  vacancies: Vacancy[];
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
  role: 'super_admin' | 'admin';
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
    const backendDataDir = path.join(process.cwd(), 'backend', 'database');
    const fallbackDataDir = path.join(process.cwd(), 'data');
    const dataDir = fs.existsSync(backendDataDir) ? backendDataDir : fallbackDataDir;
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
      aboutSections: [...defaultAboutSections],
      notices: [...initialNotices],
      staff: [...initialStaff],
      facilities: [...initialFacilities],
      programs: [...initialPrograms],
      documents: [...initialDocuments],
      curriculumGuidelines: [...initialCurriculumGuidelines],
      vacancies: [...initialVacancies],
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
          // Verify and upgrade any plaintext passwords to bcrypt hashes and ensure account usernames match authoritative configuration
          let accountsModified = false;
          const accounts: AdminAccount[] = (parsed.adminAccounts || initialAdminAccounts).map(
            (acc: AdminAccount) => {
              let updatedAcc = { ...acc };
              if (updatedAcc.id === 'usr_superadmin' && updatedAcc.username === 'superadmin') {
                accountsModified = true;
                updatedAcc.username = 'ishwari-superadmin';
                updatedAcc.role = 'super_admin';
              }
              if (updatedAcc.id === 'usr_admin' && updatedAcc.username === 'admin') {
                accountsModified = true;
                updatedAcc.username = 'ishwari';
                updatedAcc.role = 'admin';
              }

              const isBcrypt = updatedAcc.passwordHash?.startsWith('$2b$') || updatedAcc.passwordHash?.startsWith('$2a$');
              if (!isBcrypt) {
                accountsModified = true;
                updatedAcc.passwordHash = hashPasswordBcrypt(updatedAcc.passwordHash || 'Ishwari12@');
              }
              return updatedAcc;
            }
          );

          this.state = {
            version: parsed.version || 1,
            lastModified: parsed.lastModified || new Date().toISOString(),
            school: parsed.school || initialSchoolData,
            aboutSections: parsed.aboutSections || defaultAboutSections,
            notices: parsed.notices || initialNotices,
            staff: parsed.staff || initialStaff,
            facilities: parsed.facilities || initialFacilities,
            programs: parsed.programs || initialPrograms,
            documents: parsed.documents || initialDocuments,
            curriculumGuidelines: parsed.curriculumGuidelines || initialCurriculumGuidelines,
            vacancies: parsed.vacancies || initialVacancies,
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
      aboutSections: s.aboutSections || defaultAboutSections,
      notices: (s.notices || initialNotices).filter((item: any) => item.published !== false && item.is_published !== false),
      staff: s.staff,
      facilities: s.facilities,
      programs: s.programs,
      documents: s.documents,
      curriculumGuidelines: (s.curriculumGuidelines || []).filter((item) => item.status === 'published'),
      vacancies: (s.vacancies || initialVacancies).filter((item: any) => item.status === 'published' && item.is_open !== false),
      messages: s.messages,
      events: s.events,
      achievements: s.achievements,
      history: (s.history || []).filter((item: any) => item.status !== 'unpublished' && item.is_enabled !== false),
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

    // Role-based restrictions for 'admin'
    if (session.role === 'admin') {
      // Super Admin exclusive modules
      if (moduleKey === 'adminAccounts') {
        return { allowed: false, reason: 'Super Admin privilege required to manage administrator accounts.' };
      }
      if (moduleKey === 'securityConfig') {
        return { allowed: false, reason: 'Super Admin privilege required to modify security configuration.' };
      }
      if (moduleKey === 'reset') {
        return { allowed: false, reason: 'Super Admin privilege required to reset CMS data.' };
      }

      // Check granular 3-tier hierarchical module permissions (Main Menu + Submenu + Action)
      const perms = session.permissions || [];
      const hasExplicitMenus = perms.some((p) => p.startsWith('menu.'));

      // Helper to check hierarchical gate
      const checkHierarchy = (menuKey: PermissionKey, submenuKey: PermissionKey, actionCheck: () => boolean): boolean => {
        if (hasExplicitMenus) {
          if (!perms.includes(menuKey)) return false;
          if (!perms.includes(submenuKey)) return false;
        }
        return actionCheck();
      };

      if (moduleKey === 'notices') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_notices', () =>
          perms.some((p) => p.startsWith('notice.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Notice management permissions required.' };
      }

      if (moduleKey === 'vacancies' || moduleKey === 'career') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_career', () =>
          perms.some((p) => p.startsWith('career.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Career management permissions required.' };
      }

      if (moduleKey === 'documents') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_documents', () =>
          perms.some((p) => p.startsWith('document.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Document management permissions required.' };
      }

      if (moduleKey === 'curriculumGuidelines' || moduleKey === 'curriculum') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_curriculum', () =>
          perms.some((p) => p.startsWith('curriculum.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Curriculum guidelines permissions required.' };
      }

      if (moduleKey === 'events') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_events', () =>
          perms.some((p) => p.startsWith('event.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Events management permissions required.' };
      }

      if (moduleKey === 'achievements') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_achievements', () =>
          perms.some((p) => p.startsWith('achievement.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Achievements permissions required.' };
      }

      if (moduleKey === 'history') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_history', () =>
          perms.some((p) => p.startsWith('history.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and History permissions required.' };
      }

      if (moduleKey === 'aboutSections' || moduleKey === 'about' || moduleKey === 'facilities' || moduleKey === 'programs') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_about', () =>
          perms.some((p) => p.startsWith('about.') || p.startsWith('facility.') || p.startsWith('program.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and School profile permissions required.' };
      }

      if (moduleKey === 'staff') {
        const allowed = checkHierarchy('menu.governance', 'submenu.gov_staff', () =>
          perms.some((p) => p.startsWith('teacher.') || p.startsWith('staff.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Governance menu and Faculty / staff permissions required.' };
      }

      if (moduleKey === 'gallery') {
        const allowed = checkHierarchy('menu.media', 'submenu.media_gallery', () =>
          perms.some((p) => p.startsWith('gallery.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Media menu and Gallery permissions required.' };
      }

      if (moduleKey === 'messages') {
        const allowed = checkHierarchy('menu.communication', 'submenu.comm_contact', () =>
          perms.some((p) => p.startsWith('message.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Communication menu and Contact inquiries permissions required.' };
      }

      if (moduleKey === 'siteConfig' || moduleKey === 'school') {
        if (hasExplicitMenus && !perms.includes('menu.website') && !perms.includes('menu.system')) {
          return { allowed: false, reason: 'Website or System menu permission required.' };
        }
        const hasSettings = perms.includes('settings.update') || perms.includes('settings.view');
        return hasSettings ? { allowed: true } : { allowed: false, reason: 'Site configuration permission required.' };
      }

      if (moduleKey === 'auditLogs') {
        const allowed = checkHierarchy('menu.system', 'submenu.sys_audit', () =>
          perms.includes('audit.view')
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'System menu and Audit log viewing permissions required.' };
      }
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
