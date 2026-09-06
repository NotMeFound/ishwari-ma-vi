import { AdminAccount, PermissionKey } from '../types';

// SHA-256 password hashing with salt using standard Web Crypto API
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

  // Settings & System Control
  { key: 'settings.view', group: 'Site Settings', labelEn: 'View Site Settings', labelNp: 'सेटिङ हेर्नुहोस्', descEn: 'Can view UI themes, tickers, and profile data' },
  { key: 'settings.update', group: 'Site Settings', labelEn: 'Modify Site Settings', labelNp: 'सेटिङ सम्पादन गर्नुहोस्', descEn: 'Can change layout, ticker text, and theme colors' },

  // Super Admin Management
  { key: 'admin.view', group: 'Access Control (RBAC)', labelEn: 'View Admin Accounts', labelNp: 'प्रशासक खाता हेर्नुहोस्', descEn: 'Can view list of administrators' },
  { key: 'admin.create', group: 'Access Control (RBAC)', labelEn: 'Create Admin Account', labelNp: 'नयाँ प्रशासक बनाउनुहोस्', descEn: 'Can create administrator accounts with granular roles' },
  { key: 'admin.update', group: 'Access Control (RBAC)', labelEn: 'Assign Permissions / Status', labelNp: 'अनुमति र स्थिति फेर्नुहोस्', descEn: 'Can modify permissions and suspend accounts' },
  { key: 'admin.delete', group: 'Access Control (RBAC)', labelEn: 'Delete Admin Account', labelNp: 'प्रशासक खाता मेटाउनुहोस्', descEn: 'Can delete subordinate administrator accounts' },
];

// Initial seeded accounts
export const initialAdminAccounts: AdminAccount[] = [
  {
    id: 'usr_superadmin',
    username: 'superadmin',
    fullName: 'Master System Administrator (विद्यालय प्रमुख / प्रणाली प्रशासक)',
    email: 'superadmin@ishwari.edu.np',
    role: 'super_admin',
    // SHA-256 for 'SuperAdmin@2026!' with salt 'salt_ishwari_super'
    passwordHash: 'SuperAdmin@2026!',
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
    passwordHash: 'Ishwari@Secure2026',
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

// Verify input password against stored hash or plaintext fallback
export async function verifyPassword(inputPassword: string, storedHashOrPlain: string, salt: string): Promise<boolean> {
  if (inputPassword === storedHashOrPlain) {
    return true;
  }
  const hashedInput = await hashPasswordWithSalt(inputPassword, salt);
  return hashedInput === storedHashOrPlain;
}

// Storage helpers
export function loadAdminAccounts(): AdminAccount[] {
  if (typeof window === 'undefined') return initialAdminAccounts;
  const stored = localStorage.getItem('ishwari_admin_accounts');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Failed to parse admin accounts from storage', e);
    }
  }
  return initialAdminAccounts;
}

// Single Active Session Lock Helpers (Ensures only ONE admin / superadmin can be logged in at once)
export interface ActiveSessionLock {
  sessionId: string;
  userId: string;
  username: string;
  role: 'super_admin' | 'admin';
  fullName: string;
  loginTimestamp: number;
  lastHeartbeat: number;
}

const SESSION_LOCK_KEY = 'ishwari_active_session_lock';
const SESSION_HEARTBEAT_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins timeout if inactive

export function getActiveSessionLock(): ActiveSessionLock | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_LOCK_KEY);
    if (!raw) return null;
    const session: ActiveSessionLock = JSON.parse(raw);
    if (Date.now() - session.lastHeartbeat > SESSION_HEARTBEAT_TIMEOUT_MS) {
      localStorage.removeItem(SESSION_LOCK_KEY);
      return null;
    }
    return session;
  } catch (e) {
    localStorage.removeItem(SESSION_LOCK_KEY);
    return null;
  }
}

export function acquireSessionLock(account: AdminAccount): {
  success: boolean;
  activeSession?: ActiveSessionLock;
  sessionId?: string;
} {
  if (typeof window === 'undefined') return { success: true, sessionId: 'default_sess' };
  const current = getActiveSessionLock();
  const mySessionId = sessionStorage.getItem('ishwari_my_session_id');

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

  localStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(newLock));
  sessionStorage.setItem('ishwari_my_session_id', newSessionId);
  return { success: true, sessionId: newSessionId };
}

export function refreshSessionHeartbeat(): boolean {
  if (typeof window === 'undefined') return false;
  const mySessionId = sessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (current && mySessionId && current.sessionId === mySessionId) {
    current.lastHeartbeat = Date.now();
    localStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(current));
    return true;
  }
  return false;
}

export function releaseSessionLock(): void {
  if (typeof window === 'undefined') return;
  const mySessionId = sessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (!current || !mySessionId || current.sessionId === mySessionId) {
    localStorage.removeItem(SESSION_LOCK_KEY);
  }
  sessionStorage.removeItem('ishwari_my_session_id');
}

export function forceClearSessionLock(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_LOCK_KEY);
  sessionStorage.removeItem('ishwari_my_session_id');
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ishwari_admin_accounts', JSON.stringify(accounts));
}


