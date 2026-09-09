import bcrypt from 'bcryptjs';
import { AdminAccount, PermissionKey, AdminRole } from '../types';
import { safeStorage, safeSessionStorage } from './storage';

// Modern bcrypt password hashing using 10 rounds
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

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = generateSalt(16);
  const hash = hashPasswordBcrypt(password);
  return { hash, salt };
}

// SHA-256 password hashing with salt using standard Web Crypto API (legacy helper)
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for non-crypto environments
    let hash = 0;
    const str = password + ':' + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
export function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const ALL_PERMISSIONS: { key: PermissionKey; group: string; labelEn: string; labelNp: string; descEn: string }[] = [
  // Notices
  { key: 'notice.view', group: 'Notices', labelEn: 'View Notices', labelNp: 'सूचनाहरू हेर्नुहोस्', descEn: 'Can view notices in admin panel' },
  { key: 'notice.create', group: 'Notices', labelEn: 'Create Notice', labelNp: 'सूचना सिर्जना गर्नुहोस्', descEn: 'Can publish new official notices and PDF circulars' },
  { key: 'notice.update', group: 'Notices', labelEn: 'Edit Notice', labelNp: 'सूचना सम्पादन गर्नुहोस्', descEn: 'Can modify notice title, dates, attachments, and pinned status' },
  { key: 'notice.delete', group: 'Notices', labelEn: 'Delete Notice', labelNp: 'सूचना मेटाउनुहोस्', descEn: 'Can remove notices from portal' },

  // Teachers & Staff
  { key: 'teacher.view', group: 'Teachers & Staff', labelEn: 'View Faculty', labelNp: 'शिक्षक विवरण हेर्नुहोस्', descEn: 'Can view teacher and staff directory' },
  { key: 'teacher.create', group: 'Teachers & Staff', labelEn: 'Add Faculty', labelNp: 'नयाँ शिक्षक थप्नुहोस्', descEn: 'Can add teachers with passport photo uploads' },
  { key: 'teacher.update', group: 'Teachers & Staff', labelEn: 'Edit Faculty', labelNp: 'शिक्षक विवरण सम्पादन', descEn: 'Can update teacher records and photos' },
  { key: 'teacher.delete', group: 'Teachers & Staff', labelEn: 'Delete Faculty', labelNp: 'शिक्षक रेकर्ड मेटाउनुहोस्', descEn: 'Can remove staff profiles' },

  { key: 'staff.view', group: 'Teachers & Staff', labelEn: 'View Admin Staff', labelNp: 'कर्मचारी विवरण हेर्नुहोस्', descEn: 'Can view administration personnel' },
  { key: 'staff.create', group: 'Teachers & Staff', labelEn: 'Add Admin Staff', labelNp: 'कर्मचारी थप्नुहोस्', descEn: 'Can add administration staff members' },
  { key: 'staff.update', group: 'Teachers & Staff', labelEn: 'Edit Admin Staff', labelNp: 'कर्मचारी सम्पादन', descEn: 'Can edit administration staff profiles' },
  { key: 'staff.delete', group: 'Teachers & Staff', labelEn: 'Delete Admin Staff', labelNp: 'कर्मचारी मेटाउनुहोस्', descEn: 'Can delete administration staff members' },

  // Photo Gallery
  { key: 'gallery.view', group: 'Photo Gallery', labelEn: 'View Gallery', labelNp: 'ग्यालरी हेर्नुहोस्', descEn: 'Can browse gallery management archive' },
  { key: 'gallery.create', group: 'Photo Gallery', labelEn: 'Upload Photos', labelNp: 'तस्बिर अपलोड गर्नुहोस्', descEn: 'Can upload JPG/PNG photos (< 1 MB)' },
  { key: 'gallery.update', group: 'Photo Gallery', labelEn: 'Edit Photo Records', labelNp: 'तस्बिर विवरण सम्पादन', descEn: 'Can edit photo captions and categories' },
  { key: 'gallery.delete', group: 'Photo Gallery', labelEn: 'Delete Photos', labelNp: 'तस्बिर मेटाउनुहोस्', descEn: 'Can remove photo records' },

  // Campus Facilities
  { key: 'facility.view', group: 'Facilities', labelEn: 'View Facilities', labelNp: 'भौतिक सुविधा हेर्नुहोस्', descEn: 'Can view campus infrastructure' },
  { key: 'facility.create', group: 'Facilities', labelEn: 'Add Facility', labelNp: 'सुविधा थप्नुहोस्', descEn: 'Can add campus facilities' },
  { key: 'facility.update', group: 'Facilities', labelEn: 'Edit Facility', labelNp: 'सुविधा सम्पादन', descEn: 'Can edit campus facility descriptions' },
  { key: 'facility.delete', group: 'Facilities', labelEn: 'Delete Facility', labelNp: 'सुविधा मेटाउनुहोस्', descEn: 'Can remove facility entries' },
  { key: 'facility.publish', group: 'Facilities', labelEn: 'Publish / Unpublish Facility', labelNp: 'सुविधा प्रकाशन / अप्रकाशन', descEn: 'Can publish or hide facility from public website' },

  // Academic Programs
  { key: 'program.view', group: 'Academic Programs', labelEn: 'View Programs', labelNp: 'शैक्षिक कार्यक्रम हेर्नुहोस्', descEn: 'Can view academic curriculum' },
  { key: 'program.create', group: 'Academic Programs', labelEn: 'Add Program', labelNp: 'कार्यक्रम थप्नुहोस्', descEn: 'Can add academic offerings' },
  { key: 'program.update', group: 'Academic Programs', labelEn: 'Edit Program', labelNp: 'कार्यक्रम सम्पादन', descEn: 'Can edit academic program curriculum' },
  { key: 'program.delete', group: 'Academic Programs', labelEn: 'Delete Program', labelNp: 'कार्यक्रम मेटाउनुहोस्', descEn: 'Can remove academic programs' },

  // Events & Routines
  { key: 'event.view', group: 'Events & Routines', labelEn: 'View Events', labelNp: 'कार्यक्रम तालिका हेर्नुहोस्', descEn: 'Can view academic calendar events' },
  { key: 'event.create', group: 'Events & Routines', labelEn: 'Add Event', labelNp: 'कार्यक्रम थप्नुहोस्', descEn: 'Can schedule school events' },
  { key: 'event.update', group: 'Events & Routines', labelEn: 'Edit Event', labelNp: 'कार्यक्रम सम्पादन', descEn: 'Can update event timings and dates' },
  { key: 'event.delete', group: 'Events & Routines', labelEn: 'Delete Event', labelNp: 'कार्यक्रम मेटाउनुहोस्', descEn: 'Can remove event entries' },

  // Achievements & Honors
  { key: 'achievement.view', group: 'Achievements', labelEn: 'View Achievements', labelNp: 'उपलब्धि हेर्नुहोस्', descEn: 'Can view student awards and honors' },
  { key: 'achievement.create', group: 'Achievements', labelEn: 'Add Achievement', labelNp: 'उपलब्धि थप्नुहोस्', descEn: 'Can record new academic/sports honors' },
  { key: 'achievement.update', group: 'Achievements', labelEn: 'Edit Achievement', labelNp: 'उपलब्धि सम्पादन', descEn: 'Can modify achievement records' },
  { key: 'achievement.delete', group: 'Achievements', labelEn: 'Delete Achievement', labelNp: 'उपलब्धि मेटाउनुहोस्', descEn: 'Can remove achievement records' },

  // Official Documents
  { key: 'document.view', group: 'Documents', labelEn: 'View Documents', labelNp: 'दस्तावेज हेर्नुहोस्', descEn: 'Can view uploaded official PDF documents' },
  { key: 'document.create', group: 'Documents', labelEn: 'Upload Document', labelNp: 'दस्तावेज अपलोड गर्नुहोस्', descEn: 'Can upload official PDF circulars and forms' },
  { key: 'document.update', group: 'Documents', labelEn: 'Edit Document', labelNp: 'दस्तावेज सम्पादन', descEn: 'Can modify document titles and metadata' },
  { key: 'document.delete', group: 'Documents', labelEn: 'Delete Document', labelNp: 'दस्तावेज मेटाउनुहोस्', descEn: 'Can remove official documents' },

  // Contact & Inquiries
  { key: 'message.view', group: 'Contact & Inquiries', labelEn: 'View Inquiries', labelNp: 'सन्देश हेर्नुहोस्', descEn: 'Can read public inquiries and messages' },
  { key: 'message.update', group: 'Contact & Inquiries', labelEn: 'Update Status / Reply', labelNp: 'स्थिति फेर्नुहोस् / जवाफ दिनुहोस्', descEn: 'Can mark read/unread and reply to inquiries' },
  { key: 'message.delete', group: 'Contact & Inquiries', labelEn: 'Delete Inquiries', labelNp: 'सन्देश मेटाउनुहोस्', descEn: 'Can remove inquiry records' },

  // School Identity & Settings
  { key: 'school.view', group: 'Site Settings', labelEn: 'View School Profile', labelNp: 'विद्यालय विवरण हेर्नुहोस्', descEn: 'Can view school coordinates and info' },
  { key: 'school.update', group: 'Site Settings', labelEn: 'Edit School Profile', labelNp: 'विद्यालय विवरण सम्पादन', descEn: 'Can update name, contact details, coordinates' },
  { key: 'settings.view', group: 'Site Settings', labelEn: 'View Site Settings', labelNp: 'सेटिङ हेर्नुहोस्', descEn: 'Can view UI themes, tickers, and layout config' },
  { key: 'settings.update', group: 'Site Settings', labelEn: 'Modify Site Settings', labelNp: 'सेटिङ सम्पादन गर्नुहोस्', descEn: 'Can change layout, ticker text, and theme colors' },

  // Access Control (RBAC)
  { key: 'admin.view', group: 'Access Control (RBAC)', labelEn: 'View Admin Accounts', labelNp: 'प्रशासक खाता हेर्नुहोस्', descEn: 'Can view list of administrators' },
  { key: 'admin.create', group: 'Access Control (RBAC)', labelEn: 'Create Admin Account', labelNp: 'नयाँ प्रशासक बनाउनुहोस्', descEn: 'Can create administrator accounts with roles' },
  { key: 'admin.update', group: 'Access Control (RBAC)', labelEn: 'Edit Admin Account', labelNp: 'प्रशासक सम्पादन / स्थिति फेर्नुहोस्', descEn: 'Can modify permissions, reset passwords, and suspend accounts' },
  { key: 'admin.delete', group: 'Access Control (RBAC)', labelEn: 'Delete Admin Account', labelNp: 'प्रशासक खाता मेटाउनुहोस्', descEn: 'Can delete subordinate administrator accounts' },
  { key: 'role.view', group: 'Access Control (RBAC)', labelEn: 'View Roles & Matrix', labelNp: 'भूमिका र अनुमति हेर्नुहोस्', descEn: 'Can view role definitions and permissions matrix' },
  { key: 'role.update', group: 'Access Control (RBAC)', labelEn: 'Assign Roles & Permissions', labelNp: 'भूमिका र अनुमति तोक्नुहोस्', descEn: 'Can configure role permissions and assign to accounts' },

  // Security & Audit Logs
  { key: 'audit.view', group: 'Security & Audit', labelEn: 'View Audit Logs', labelNp: 'अडिट लग हेर्नुहोस्', descEn: 'Can inspect security and operational audit logs' },
  { key: 'audit.delete', group: 'Security & Audit', labelEn: 'Clear Audit Logs', labelNp: 'अडिट लग खाली गर्नुहोस्', descEn: 'Can purge historical audit log records' },
  { key: 'security.view', group: 'Security & Audit', labelEn: 'View Security Policy', labelNp: 'सुरक्षा नीति हेर्नुहोस्', descEn: 'Can inspect lockout and session policies' },
  { key: 'security.update', group: 'Security & Audit', labelEn: 'Modify Security Policy', labelNp: 'सुरक्षा नीति सम्पादन', descEn: 'Can update session timeout and lockout settings' },
  { key: 'backup.create', group: 'Security & Audit', labelEn: 'Export Backup', labelNp: 'ब्याकअप डाउनलोड गर्नुहोस्', descEn: 'Can export database snapshots' },
  { key: 'backup.restore', group: 'Security & Audit', labelEn: 'Restore Backup', labelNp: 'ब्याकअप पुनःस्थापना', descEn: 'Can restore database snapshots' }
];

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  super_admin: ALL_PERMISSIONS.map(p => p.key),
  admin: [
    'notice.view', 'notice.create', 'notice.update', 'notice.delete',
    'teacher.view', 'teacher.create', 'teacher.update',
    'staff.view', 'staff.create', 'staff.update',
    'gallery.view', 'gallery.create', 'gallery.update', 'gallery.delete',
    'facility.view', 'facility.create', 'facility.update', 'facility.delete', 'facility.publish',
    'program.view', 'program.create', 'program.update',
    'event.view', 'event.create', 'event.update',
    'achievement.view', 'achievement.create', 'achievement.update',
    'document.view', 'document.create', 'document.update',
    'message.view', 'message.update',
    'school.view', 'school.update',
    'settings.view', 'settings.update',
    'admin.view',
    'role.view',
    'audit.view'
  ],
  editor: [
    'notice.view', 'notice.create', 'notice.update',
    'gallery.view', 'gallery.create', 'gallery.update',
    'document.view', 'document.create', 'document.update',
    'event.view', 'event.create', 'event.update',
    'achievement.view', 'achievement.create', 'achievement.update',
    'facility.view', 'facility.update',
    'program.view', 'program.update',
    'message.view'
  ],
  viewer: [
    'notice.view',
    'teacher.view',
    'staff.view',
    'gallery.view',
    'facility.view',
    'program.view',
    'event.view',
    'achievement.view',
    'document.view',
    'message.view',
    'school.view',
    'settings.view',
    'admin.view',
    'role.view',
    'audit.view',
    'security.view'
  ]
};

// Initial seeded accounts with modern bcrypt password hashes
export const initialAdminAccounts: AdminAccount[] = [
  {
    id: 'usr_superadmin',
    username: 'superadmin',
    fullName: 'Master System Administrator (विद्यालय प्रमुख / प्रणाली प्रशासक)',
    email: 'superadmin@ishwari.edu.np',
    role: 'super_admin',
    // bcrypt hash for 'SuperAdmin@2026!'
    passwordHash: '$2b$10$h0huMTl4IqnCsZ7UfcQPMeYeHznt0NQ03g2QYfjTBNfkppOPk/hhm',
    salt: 'salt_ishwari_super',
    status: 'active',
    permissions: ALL_PERMISSIONS.map(p => p.key),
    createdAt: '2083-01-01',
    lastLogin: '2083-05-15 09:30 AM',
  },
  {
    id: 'usr_admin',
    username: 'admin',
    fullName: 'School Operations Officer (प्रशासन अधिकृत)',
    email: 'admin@ishwari.edu.np',
    role: 'admin',
    // bcrypt hash for 'Ishwari@Secure2026'
    passwordHash: '$2b$10$hgU1eV9gZM4ixM4YTgBIb.gtrlu8EqQi8i/4OXh08q/IIvsLcuahW',
    salt: 'salt_ishwari_admin',
    status: 'active',
    permissions: [
      'notice.view', 'notice.create', 'notice.update', 'notice.delete',
      'teacher.view', 'teacher.create', 'teacher.update',
      'staff.view', 'staff.create', 'staff.update',
      'gallery.view', 'gallery.create', 'gallery.update', 'gallery.delete',
      'settings.view'
    ],
    createdAt: '2083-02-10',
    lastLogin: '2083-05-14 04:15 PM',
  },
];

export function hasPermission(account: AdminAccount | null, permission: PermissionKey): boolean {
  if (!account) return false;
  if (account.status !== 'active') return false;
  if (account.role === 'super_admin') return true;
  return account.permissions.includes(permission);
}

// Verify input password using bcrypt
export async function verifyPassword(inputPassword: string, storedHashOrPlain: string, salt: string): Promise<boolean> {
  if (!inputPassword || !storedHashOrPlain) return false;
  if (storedHashOrPlain.startsWith('$2a$') || storedHashOrPlain.startsWith('$2b$') || storedHashOrPlain.startsWith('$2y$')) {
    return verifyPasswordBcrypt(inputPassword, storedHashOrPlain);
  }
  if (inputPassword === storedHashOrPlain) {
    return true;
  }
  const hashedInput = await hashPasswordWithSalt(inputPassword, salt);
  return hashedInput === storedHashOrPlain;
}

// Storage helpers
export function loadAdminAccounts(): AdminAccount[] {
  try {
    const parsed = safeStorage.getJSON<AdminAccount[]>('ishwari_admin_accounts', initialAdminAccounts);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error('Failed to parse admin accounts from storage', e);
  }
  return initialAdminAccounts;
}

// Single Active Session Lock Helpers (Ensures only ONE admin / superadmin can be logged in at once)
export interface ActiveSessionLock {
  sessionId: string;
  userId: string;
  username: string;
  role: AdminRole;
  fullName: string;
  loginTimestamp: number;
  lastHeartbeat: number;
}

const SESSION_LOCK_KEY = 'ishwari_active_session_lock';
const SESSION_HEARTBEAT_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins timeout if inactive

export function getActiveSessionLock(): ActiveSessionLock | null {
  try {
    const raw = safeStorage.getItem(SESSION_LOCK_KEY);
    if (!raw) return null;
    const session: ActiveSessionLock = JSON.parse(raw);
    if (Date.now() - session.lastHeartbeat > SESSION_HEARTBEAT_TIMEOUT_MS) {
      safeStorage.removeItem(SESSION_LOCK_KEY);
      return null;
    }
    return session;
  } catch (e) {
    safeStorage.removeItem(SESSION_LOCK_KEY);
    return null;
  }
}

export function acquireSessionLock(account: AdminAccount): {
  success: boolean;
  activeSession?: ActiveSessionLock;
  sessionId?: string;
} {
  const current = getActiveSessionLock();
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');

  // If there's an active session belonging to someone else or another tab
  if (current && (!mySessionId || current.sessionId !== mySessionId)) {
    return {
      success: false,
      activeSession: current
    };
  }

  const newSessionId =
    mySessionId ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

  const newLock: ActiveSessionLock = {
    sessionId: newSessionId,
    userId: account.id,
    username: account.username,
    role: account.role,
    fullName: account.fullName,
    loginTimestamp: Date.now(),
    lastHeartbeat: Date.now()
  };

  safeStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(newLock));
  safeSessionStorage.setItem('ishwari_my_session_id', newSessionId);
  return { success: true, sessionId: newSessionId };
}

export function refreshSessionHeartbeat(): boolean {
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (current && mySessionId && current.sessionId === mySessionId) {
    current.lastHeartbeat = Date.now();
    safeStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(current));
    return true;
  }
  return false;
}

export function releaseSessionLock(): void {
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (!current || !mySessionId || current.sessionId === mySessionId) {
    safeStorage.removeItem(SESSION_LOCK_KEY);
  }
  safeSessionStorage.removeItem('ishwari_my_session_id');
}

export function forceClearSessionLock(): void {
  safeStorage.removeItem(SESSION_LOCK_KEY);
  safeSessionStorage.removeItem('ishwari_my_session_id');
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  safeStorage.setJSON('ishwari_admin_accounts', accounts);
}



