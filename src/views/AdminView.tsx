import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  DocumentItem,
  ContactMessage,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  PermissionKey,
  ThemeMode
} from '../types';
import {
  hasPermission,
  verifyPassword,
  initialAdminAccounts,
  acquireSessionLock,
  releaseSessionLock,
  getActiveSessionLock,
  refreshSessionHeartbeat,
  forceClearSessionLock
} from '../utils/security';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Building2,
  Bell,
  Users,
  BookOpen,
  FolderDown,
  MessageSquare,
  Download,
  Trash2,
  Edit3,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  Pin,
  Sparkles,
  Layout,
  ShieldAlert,
  CalendarDays,
  Image,
  Database,
  KeyRound,
  Clock,
  Check,
  Upload,
  FileText,
  X,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

import { SiteCustomizerTab } from './admin/SiteCustomizerTab';
import { SecurityTab } from './admin/SecurityTab';
import { EventsAchievementsHistoryTab } from './admin/EventsAchievementsHistoryTab';
import { GalleryAdminTab } from './admin/GalleryAdminTab';
import { BackupRestoreTab } from './admin/BackupRestoreTab';
import { SuperAdminControlCenter } from './admin/SuperAdminControlCenter';
import { RbacAdminTab } from './admin/RbacAdminTab';
import { StaffAdminTab } from './admin/StaffAdminTab';

interface AdminViewProps {
  lang: Language;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onToggleLang?: () => void;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  facilities: Facility[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  programs: AcademicProgram[];
  onUpdatePrograms: (programs: AcademicProgram[]) => void;
  documents: DocumentItem[];
  onUpdateDocuments: (docs: DocumentItem[]) => void;
  messages: ContactMessage[];
  onUpdateMessages: (msgs: ContactMessage[]) => void;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  securityConfig: SecurityConfig;
  onUpdateSecurityConfig: (config: SecurityConfig) => void;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onAddAuditLog: (entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  adminAccounts?: AdminAccount[];
  onUpdateAdminAccounts?: (accounts: AdminAccount[]) => void;
  onRestoreAllData: (data: any) => void;
  onResetData: () => void;
  onNavigateHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  school,
  onUpdateSchool,
  notices,
  onUpdateNotices,
  staff,
  onUpdateStaff,
  facilities,
  onUpdateFacilities,
  programs,
  onUpdatePrograms,
  documents,
  onUpdateDocuments,
  messages,
  onUpdateMessages,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  gallery,
  onUpdateGallery,
  siteConfig,
  onUpdateSiteConfig,
  securityConfig,
  onUpdateSecurityConfig,
  auditLogs,
  onClearAuditLogs,
  onAddAuditLog,
  adminAccounts,
  onUpdateAdminAccounts,
  onRestoreAllData,
  onResetData,
  onNavigateHome,
}) => {
  const effectiveAccounts = adminAccounts && adminAccounts.length > 0 ? adminAccounts : initialAdminAccounts;

  const [currentAccount, setCurrentAccount] = useState<AdminAccount | null>(() => {
    const saved = sessionStorage.getItem('ishwari_current_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    if (sessionStorage.getItem('ishwari_admin_auth') === 'true') {
      return (adminAccounts && adminAccounts.length > 0 ? adminAccounts : initialAdminAccounts)[0];
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ishwari_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'super_admin_control'
    | 'rbac_admin'
    | 'customizer'
    | 'profile'
    | 'principal'
    | 'notices'
    | 'staff'
    | 'academics'
    | 'facilities'
    | 'events_extra'
    | 'gallery'
    | 'documents'
    | 'messages'
    | 'security'
    | 'system'
    | 'php_export'
  >('super_admin_control');
  const [toastMessage, setToastMessage] = useState('');

  const can = (perm: PermissionKey): boolean => {
    return hasPermission(currentAccount, perm);
  };

  // Security Lockout & Failed Attempts State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return Number(sessionStorage.getItem('ishwari_failed_attempts') || '0');
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return Number(sessionStorage.getItem('ishwari_lockout_until') || '0');
  });
  const [now, setNow] = useState<number>(Date.now());

  // Emergency PIN Modal
  const [showEmergencyPinModal, setShowEmergencyPinModal] = useState(false);
  const [emergencyPinInput, setEmergencyPinInput] = useState('');
  const [emergencyPinError, setEmergencyPinError] = useState('');

  // Single Active Session Lock Heartbeat & Multi-tab/device sync
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshSessionHeartbeat();
    const interval = setInterval(() => {
      refreshSessionHeartbeat();
    }, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ishwari_active_session_lock') {
        if (!e.newValue && isAuthenticated) {
          setIsAuthenticated(false);
          setCurrentAccount(null);
          sessionStorage.removeItem('ishwari_admin_auth');
          sessionStorage.removeItem('ishwari_current_account');
          sessionStorage.removeItem('ishwari_my_session_id');
          setAuthError(
            lang === 'np'
              ? 'प्रशासनिक सत्र लगआउट गरिएको छ।'
              : 'The administrative session was logged out.'
          );
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAuthenticated, lang]);

  // Session Timeout countdown

  // Session Timeout countdown
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(
    (securityConfig?.sessionTimeoutMinutes || 30) * 60
  );

  // Clock ticker for lockout & session timeout
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      if (isAuthenticated) {
        setSessionTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto logout
            setIsAuthenticated(false);
            sessionStorage.removeItem('ishwari_admin_auth');
            setAuthError(
              lang === 'np'
                ? 'निष्क्रियताका कारण सुरक्षा सत्र समाप्त भयो। कृपया पुनः लगइन गर्नुहोस्।'
                : 'Session expired due to inactivity. Please log in again.'
            );
            return (securityConfig?.sessionTimeoutMinutes || 30) * 60;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, lang, securityConfig?.sessionTimeoutMinutes]);

  const isLockedOut = lockoutUntil > now;
  const lockoutSecondsRemaining = isLockedOut ? Math.ceil((lockoutUntil - now) / 1000) : 0;

  // Form states
  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...school });

  // Notice Form State
  const [noticeForm, setNoticeForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    category: Notice['category'];
    pinned: boolean;
    file_name: string;
    file_data?: string;
    file_size_kb?: number;
    description_en: string;
    description_np: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    category: 'academic',
    pinned: false,
    file_name: '',
    file_data: undefined,
    file_size_kb: undefined,
    description_en: '',
    description_np: '',
  });
  const [noticeFileError, setNoticeFileError] = useState<string>('');
  const noticeFileInputRef = useRef<HTMLInputElement>(null);

  // Staff Form State
  const [staffForm, setStaffForm] = useState<{
    id: number | null;
    name_en: string;
    name_np: string;
    role: StaffMember['role'];
    designation_en: string;
    designation_np: string;
    experience: string;
  }>({
    id: null,
    name_en: '',
    name_np: '',
    role: 'teacher',
    designation_en: '',
    designation_np: '',
    experience: '5 Years Experience',
  });

  // Academic Program Form State
  const [programForm, setProgramForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    level: string;
    duration: string;
    intake: number;
    desc_en: string;
    desc_np: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    level: 'Secondary / +2',
    duration: '2 Years',
    intake: 60,
    desc_en: '',
    desc_np: '',
  });

  // Facility Form State
  const [facilityForm, setFacilityForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    desc_en: string;
    desc_np: string;
    icon: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
    icon: '🏫',
  });

  // Document Form State
  const [documentForm, setDocumentForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    type: string;
    size: string;
    date: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    type: 'Official PDF',
    size: '1.5 MB',
    date: '2083-05-01',
  });

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      setAuthError(
        t(
          `Security lockout active. Please wait ${lockoutSecondsRemaining}s or use Master Emergency PIN.`,
          `सुरक्षा लक सक्रिय छ। कृपया ${lockoutSecondsRemaining} सेकेन्ड पर्खनुहोस् वा मास्टर पिन प्रयोग गर्नुहोस्।`
        )
      );
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();
    const recoveryPin = (securityConfig?.recoveryPin || '782035').trim();

    let authenticatedAccount: AdminAccount | null = null;

    // Direct Master PIN verification: authenticates as super admin
    if (trimmedPass === recoveryPin) {
      const superAdminAcc = effectiveAccounts.find((a) => a.role === 'super_admin') || effectiveAccounts[0];
      authenticatedAccount = superAdminAcc;
    } else {
      const account = effectiveAccounts.find(
        (a) => a.username.toLowerCase() === trimmedUser || a.email.toLowerCase() === trimmedUser
      );

      // Legacy fallback check
      const legacyExpectedUser = (securityConfig?.adminUsername || 'admin').toLowerCase();
      const legacyExpectedPass = securityConfig?.adminPassword || securityConfig?.adminPasswordHash || 'Ishwari@Secure2026';

      if (account) {
        if (account.status !== 'active') {
          setAuthError(
            t(
              'This administrator account has been suspended by the Super Admin.',
              'यो प्रशासक खाता सुपर प्रशासकद्वारा निलम्बन गरिएको छ।'
            )
          );
          onAddAuditLog({
            action: 'ADMIN_LOGIN_SUSPENDED',
            actor: account.username,
            role: account.role,
            module: 'AUTH',
            status: 'danger',
            result: 'denied',
            details: `Login rejected: Account "${account.username}" is suspended.`,
          });
          return;
        }

        const isMatch = await verifyPassword(password, account.passwordHash, account.salt);
        if (isMatch) {
          authenticatedAccount = account;
        }
      } else if (trimmedUser === legacyExpectedUser && password === legacyExpectedPass) {
        authenticatedAccount = effectiveAccounts[0] || initialAdminAccounts[0];
      }
    }

    if (authenticatedAccount) {
      // Enforce single active session: Only one admin/superadmin can be logged in at once
      const lockResult = acquireSessionLock(authenticatedAccount);
      if (!lockResult.success) {
        const active = lockResult.activeSession;
        setAuthError(
          t(
            `Another administrative session is currently active (@${active?.username || 'admin'} - ${active?.role === 'super_admin' ? 'Super Admin' : 'Admin'}). Only one admin or superadmin can be logged in at a time. The active user must log out first before another login is permitted.`,
            `अर्को प्रशासनिक सत्र हाल सक्रिय छ (@${active?.username || 'admin'} - ${active?.role === 'super_admin' ? 'सुपर प्रशासक' : 'प्रशासक'})। एक पटकमा केवल एक जना मात्र प्रशासक लगइन हुन सक्दछ। नयाँ लगइन अगाडि सक्रिय प्रयोगकर्ता लगआउट हुनुपर्छ।`
          )
        );
        onAddAuditLog({
          action: 'CONCURRENT_LOGIN_BLOCKED',
          actor: authenticatedAccount.username,
          role: authenticatedAccount.role,
          module: 'AUTH',
          status: 'warning',
          result: 'denied',
          details: `Concurrent login rejected. Active session currently held by @${active?.username} (${active?.role}).`
        });
        return;
      }

      setIsAuthenticated(true);
      setCurrentAccount(authenticatedAccount);
      sessionStorage.setItem('ishwari_admin_auth', 'true');
      sessionStorage.setItem('ishwari_current_account', JSON.stringify(authenticatedAccount));
      setAuthError('');
      setFailedAttempts(0);
      setLockoutUntil(0);
      sessionStorage.removeItem('ishwari_failed_attempts');
      sessionStorage.removeItem('ishwari_lockout_until');
      setSessionTimeLeft((securityConfig?.sessionTimeoutMinutes || 30) * 60);

      // Update lastLogin on account
      if (onUpdateAdminAccounts) {
        const nowStr = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const updatedAccounts = effectiveAccounts.map((a) =>
          a.id === authenticatedAccount!.id ? { ...a, lastLogin: nowStr } : a
        );
        onUpdateAdminAccounts(updatedAccounts);
      }

      onAddAuditLog({
        action: 'ADMIN_LOGIN_SUCCESS',
        actor: authenticatedAccount.username,
        role: authenticatedAccount.role,
        module: 'AUTH',
        status: 'success',
        result: 'success',
        details: `Successful authenticated session by ${authenticatedAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'} (${authenticatedAccount.fullName}).`,
      });

      showToast(
        t(
          `Welcome, ${authenticatedAccount.fullName}! Authenticated as ${authenticatedAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'}.`,
          `स्वागत छ, ${authenticatedAccount.fullName}! (${authenticatedAccount.role === 'super_admin' ? 'सुपर प्रशासक' : 'प्रशासक'})`
        )
      );

      // Default active tab based on account role
      if (authenticatedAccount.role === 'super_admin') {
        setActiveTab('super_admin_control');
      } else if (hasPermission(authenticatedAccount, 'notice.view')) {
        setActiveTab('notices');
      } else if (hasPermission(authenticatedAccount, 'teacher.view')) {
        setActiveTab('staff');
      } else {
        setActiveTab('notices');
      }
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      sessionStorage.setItem('ishwari_failed_attempts', String(nextFailures));

      const threshold = securityConfig?.lockoutThreshold || 5;
      if (nextFailures >= threshold) {
        const lockoutTime = Date.now() + (securityConfig?.lockoutDurationMinutes || 5) * 60 * 1000;
        setLockoutUntil(lockoutTime);
        sessionStorage.setItem('ishwari_lockout_until', String(lockoutTime));

        onAddAuditLog({
          action: 'SECURITY_LOCKOUT_ENFORCED',
          actor: username,
          role: 'unknown',
          module: 'AUTH',
          status: 'danger',
          result: 'denied',
          details: `Security lockout triggered for ${securityConfig?.lockoutDurationMinutes || 5} minutes after ${nextFailures} failed attempts.`,
        });

        setAuthError(
          t(
            `Maximum failed attempts reached (${threshold}). System locked for ${securityConfig?.lockoutDurationMinutes || 5} minutes.`,
            `अधिकतम गलत प्रयासहरू (${threshold}) नाघ्यो। प्रणाली ${securityConfig?.lockoutDurationMinutes || 5} मिनेटका लागि लक गरियो।`
          )
        );
      } else {
        onAddAuditLog({
          action: 'ADMIN_LOGIN_FAILED',
          actor: username,
          role: 'unknown',
          module: 'AUTH',
          status: 'warning',
          result: 'denied',
          details: `Failed credentials attempt #${nextFailures}. Remaining tries: ${threshold - nextFailures}`,
        });

        setAuthError(
          t(
            `Invalid credentials. ${threshold - nextFailures} attempts remaining before security lockout.`,
            `गलत विवरण। सुरक्षा लकअघि ${threshold - nextFailures} प्रयास बाँकी छ।`
          )
        );
      }
    }
  };

  const handleEmergencyPinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = (securityConfig?.recoveryPin || '782035').trim();
    if (emergencyPinInput.trim() === correctPin) {
      const superAdminAcc = effectiveAccounts.find(a => a.role === 'super_admin') || effectiveAccounts[0];
      forceClearSessionLock();
      acquireSessionLock(superAdminAcc);
      setIsAuthenticated(true);
      setCurrentAccount(superAdminAcc);
      sessionStorage.setItem('ishwari_admin_auth', 'true');
      sessionStorage.setItem('ishwari_current_account', JSON.stringify(superAdminAcc));
      setFailedAttempts(0);
      setLockoutUntil(0);
      sessionStorage.removeItem('ishwari_failed_attempts');
      sessionStorage.removeItem('ishwari_lockout_until');
      setShowEmergencyPinModal(false);
      setEmergencyPinInput('');
      setEmergencyPinError('');
      setAuthError('');
      setSessionTimeLeft((securityConfig?.sessionTimeoutMinutes || 30) * 60);

      onAddAuditLog({
        action: 'EMERGENCY_PIN_BYPASS',
        actor: 'MASTER_PIN',
        role: 'super_admin',
        module: 'AUTH',
        status: 'warning',
        result: 'success',
        details: 'Security lockout cleared using verified 6-digit Emergency Master PIN.'
      });

      showToast(t('Master recovery PIN accepted. Console unlocked.', 'मास्टर रिकभरी पिन स्वीकृत। कन्सोल अनलक गरियो।'));
    } else {
      setEmergencyPinError(t('Invalid Master Recovery PIN.', 'गलत रिकभरी पिन। कृपया पुनः प्रयास गर्नुहोस्।'));
    }
  };

  const handleLockConsole = () => {
    releaseSessionLock();
    setIsAuthenticated(false);
    sessionStorage.removeItem('ishwari_admin_auth');
    sessionStorage.removeItem('ishwari_my_session_id');
    onAddAuditLog({
      action: 'ADMIN_CONSOLE_LOCKED',
      actor: currentAccount?.username || username,
      role: currentAccount?.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: 'Administrator manually locked active management session.'
    });
    showToast(t('Console locked. Re-authentication required.', 'कन्सोल सुरक्षित रूपमा लक गरियो।'));
  };

  const handleLogout = () => {
    releaseSessionLock();
    setIsAuthenticated(false);
    setCurrentAccount(null);
    sessionStorage.removeItem('ishwari_admin_auth');
    sessionStorage.removeItem('ishwari_current_account');
    sessionStorage.removeItem('ishwari_my_session_id');
    setPassword('');
    onAddAuditLog({
      action: 'ADMIN_LOGOUT',
      actor: currentAccount?.username || username,
      role: currentAccount?.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: 'Administrator logged out of the session.'
    });
    showToast(t('Logged out successfully.', 'सफलतापूर्वक लगआउट भयो।'));
  };

  // 1. Save School Info
  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(schoolForm);
    showToast(t('Institutional profile updated successfully!', 'विद्यालयको प्रोफाइल सुरक्षित गरियो!'));
  };

  // 2. Notices CRUD
  const handleNoticePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoticeFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type: PDF only
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setNoticeFileError(
        t(
          'Invalid file type! Attachment file type: PDF only (.pdf).',
          'अमान्य फाइल प्रकार! केवल PDF (.pdf) फाइल मात्र अपलोड गर्न सकिन्छ।'
        )
      );
      if (e.target) e.target.value = '';
      return;
    }

    // Validate file size: must be <= 200 KB (204,800 bytes)
    const maxSizeBytes = 200 * 1024;
    const fileSizeKb = Math.round((file.size / 1024) * 10) / 10;
    if (file.size > maxSizeBytes) {
      setNoticeFileError(
        t(
          `File size exceeds limit! The PDF file must be ≤ 200 KB (selected: ${fileSizeKb} KB).`,
          `फाइल आकार बढी भयो! PDF फाइल २०० KB वा सोभन्दा कम हुनुपर्छ (छानिएको: ${fileSizeKb} KB)।`
        )
      );
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNoticeForm(prev => ({
        ...prev,
        file_name: file.name,
        file_data: base64,
        file_size_kb: fileSizeKb,
      }));
      showToast(t(`PDF attached: ${file.name} (${fileSizeKb} KB)`, `PDF संलग्न गरियो: ${file.name} (${fileSizeKb} KB)`));
    };
    reader.onerror = () => {
      setNoticeFileError(t('Failed to read PDF file. Please try again.', 'फाइल पढ्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNoticePdf = () => {
    setNoticeForm(prev => ({
      ...prev,
      file_name: '',
      file_data: undefined,
      file_size_kb: undefined,
    }));
    setNoticeFileError('');
    if (noticeFileInputRef.current) {
      noticeFileInputRef.current.value = '';
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title_en) return;

    const attachmentName = noticeForm.file_name?.trim() || 'notice.pdf';

    if (noticeForm.id) {
      // Edit
      const updated = notices.map(n => n.id === noticeForm.id ? {
        ...n,
        title_en: noticeForm.title_en,
        title_np: noticeForm.title_np || noticeForm.title_en,
        category: noticeForm.category,
        pinned: noticeForm.pinned,
        file_name: attachmentName,
        file_data: noticeForm.file_data,
        file_size_kb: noticeForm.file_size_kb,
        description_en: noticeForm.description_en,
        description_np: noticeForm.description_np || noticeForm.description_en,
      } : n);
      onUpdateNotices(updated);
      showToast(t('Notice updated successfully!', 'सूचना अद्यावधिक गरियो!'));
    } else {
      // Create
      const newNotice: Notice = {
        id: Date.now(),
        title_en: noticeForm.title_en,
        title_np: noticeForm.title_np || noticeForm.title_en,
        date_en: 'Today',
        date_np: 'आज',
        category: noticeForm.category,
        pinned: noticeForm.pinned,
        file_name: attachmentName,
        file_data: noticeForm.file_data,
        file_size_kb: noticeForm.file_size_kb,
        description_en: noticeForm.description_en,
        description_np: noticeForm.description_np || noticeForm.description_en,
      };
      onUpdateNotices([newNotice, ...notices]);
      showToast(t('New notice published successfully!', 'नयाँ सूचना प्रकाशित गरियो!'));
    }

    setNoticeForm({
      id: null,
      title_en: '',
      title_np: '',
      category: 'academic',
      pinned: false,
      file_name: '',
      file_data: undefined,
      file_size_kb: undefined,
      description_en: '',
      description_np: '',
    });
    setNoticeFileError('');
    if (noticeFileInputRef.current) {
      noticeFileInputRef.current.value = '';
    }
  };

  const handleDeleteNotice = (id: number) => {
    if (confirm(t('Are you sure you want to delete this circular?', 'के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?'))) {
      onUpdateNotices(notices.filter(n => n.id !== id));
      showToast(t('Notice deleted.', 'सूचना हटाइयो।'));
    }
  };

  const handleTogglePinNotice = (id: number) => {
    onUpdateNotices(notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    showToast(t('Notice pin status updated.', 'पिन स्थिति परिवर्तन गरियो।'));
  };

  // 3. Staff CRUD
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name_en) return;

    if (staffForm.id) {
      const updated = staff.map(s => s.id === staffForm.id ? {
        ...s,
        name_en: staffForm.name_en,
        name_np: staffForm.name_np || staffForm.name_en,
        role: staffForm.role,
        designation_en: staffForm.designation_en,
        designation_np: staffForm.designation_np || staffForm.designation_en,
        experience: staffForm.experience,
      } : s);
      onUpdateStaff(updated);
      showToast(t('Faculty record updated.', 'शिक्षक विवरण अद्यावधिक गरियो।'));
    } else {
      const newStaff: StaffMember = {
        id: Date.now(),
        name_en: staffForm.name_en,
        name_np: staffForm.name_np || staffForm.name_en,
        role: staffForm.role,
        designation_en: staffForm.designation_en,
        designation_np: staffForm.designation_np || staffForm.designation_en,
        experience: staffForm.experience,
      };
      onUpdateStaff([...staff, newStaff]);
      showToast(t('New staff member added.', 'नयाँ शिक्षक/कर्मचारी थपियो।'));
    }

    setStaffForm({
      id: null,
      name_en: '',
      name_np: '',
      role: 'teacher',
      designation_en: '',
      designation_np: '',
      experience: '5 Years Experience',
    });
  };

  const handleDeleteStaff = (id: number) => {
    if (confirm(t('Are you sure you want to remove this staff member?', 'के तपाईं यो विवरण हटाउन चाहनुहुन्छ?'))) {
      onUpdateStaff(staff.filter(s => s.id !== id));
      showToast(t('Staff member removed.', 'विवरण हटाइयो।'));
    }
  };

  // 4. Academic Programs CRUD
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title_en) return;

    if (programForm.id) {
      const updated = programs.map(p => p.id === programForm.id ? {
        ...p,
        title_en: programForm.title_en,
        title_np: programForm.title_np || programForm.title_en,
        level: programForm.level,
        duration: programForm.duration,
        intake: Number(programForm.intake),
        desc_en: programForm.desc_en,
        desc_np: programForm.desc_np || programForm.desc_en,
      } : p);
      onUpdatePrograms(updated);
      showToast(t('Program updated successfully.', 'शैक्षिक कार्यक्रम अद्यावधिक गरियो।'));
    } else {
      const newProg: AcademicProgram = {
        id: Date.now(),
        title_en: programForm.title_en,
        title_np: programForm.title_np || programForm.title_en,
        level: programForm.level,
        duration: programForm.duration,
        intake: Number(programForm.intake),
        desc_en: programForm.desc_en,
        desc_np: programForm.desc_np || programForm.desc_en,
      };
      onUpdatePrograms([...programs, newProg]);
      showToast(t('New academic program added.', 'नयाँ शैक्षिक कार्यक्रम थपियो।'));
    }

    setProgramForm({
      id: null,
      title_en: '',
      title_np: '',
      level: 'Secondary / +2',
      duration: '2 Years',
      intake: 60,
      desc_en: '',
      desc_np: '',
    });
  };

  const handleDeleteProgram = (id: number) => {
    if (confirm(t('Delete this academic program?', 'के यो शैक्षिक कार्यक्रम हटाउने?'))) {
      onUpdatePrograms(programs.filter(p => p.id !== id));
      showToast(t('Program deleted.', 'कार्यक्रम हटाइयो।'));
    }
  };

  // 5. Facilities CRUD
  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.title_en) return;

    if (facilityForm.id) {
      const updated = facilities.map(f => f.id === facilityForm.id ? {
        ...f,
        title_en: facilityForm.title_en,
        title_np: facilityForm.title_np || facilityForm.title_en,
        desc_en: facilityForm.desc_en,
        desc_np: facilityForm.desc_np || facilityForm.desc_en,
        icon: facilityForm.icon,
      } : f);
      onUpdateFacilities(updated);
      showToast(t('Facility updated.', 'पूर्वाधार विवरण अद्यावधिक गरियो।'));
    } else {
      const newFac: Facility = {
        id: Date.now(),
        title_en: facilityForm.title_en,
        title_np: facilityForm.title_np || facilityForm.title_en,
        desc_en: facilityForm.desc_en,
        desc_np: facilityForm.desc_np || facilityForm.desc_en,
        icon: facilityForm.icon,
      };
      onUpdateFacilities([...facilities, newFac]);
      showToast(t('New facility added.', 'नयाँ पूर्वाधार थपियो।'));
    }

    setFacilityForm({
      id: null,
      title_en: '',
      title_np: '',
      desc_en: '',
      desc_np: '',
      icon: '🏫',
    });
  };

  const handleDeleteFacility = (id: number) => {
    if (confirm(t('Delete this facility?', 'पूर्वाधार हटाउने?'))) {
      onUpdateFacilities(facilities.filter(f => f.id !== id));
      showToast(t('Facility deleted.', 'पूर्वाधार हटाइयो।'));
    }
  };

  // 6. Documents CRUD
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentForm.title_en) return;

    if (documentForm.id) {
      const updated = documents.map(d => d.id === documentForm.id ? {
        ...d,
        title_en: documentForm.title_en,
        title_np: documentForm.title_np || documentForm.title_en,
        type: documentForm.type,
        size: documentForm.size,
        date: documentForm.date,
      } : d);
      onUpdateDocuments(updated);
      showToast(t('Document updated.', 'दस्तावेज अद्यावधिक गरियो।'));
    } else {
      const newDoc: DocumentItem = {
        id: Date.now(),
        title_en: documentForm.title_en,
        title_np: documentForm.title_np || documentForm.title_en,
        type: documentForm.type,
        size: documentForm.size,
        date: documentForm.date,
      };
      onUpdateDocuments([...documents, newDoc]);
      showToast(t('New downloadable document added.', 'नयाँ दस्तावेज थपियो।'));
    }

    setDocumentForm({
      id: null,
      title_en: '',
      title_np: '',
      type: 'Official PDF',
      size: '1.5 MB',
      date: '2083-05-01',
    });
  };

  const handleDeleteDocument = (id: number) => {
    if (confirm(t('Delete this document?', 'दस्तावेज हटाउने?'))) {
      onUpdateDocuments(documents.filter(d => d.id !== id));
      showToast(t('Document removed.', 'दस्तावेज हटाइयो।'));
    }
  };

  // 7. Messages Management
  const handleUpdateMessageStatus = (id: number, status: ContactMessage['status']) => {
    onUpdateMessages(messages.map(m => m.id === id ? { ...m, status } : m));
    showToast(t(`Inquiry status updated to ${status}.`, 'सम्पर्क सन्देशको स्थिति परिवर्तन गरियो।'));
  };

  const handleDeleteMessage = (id: number) => {
    if (confirm(t('Delete this inquiry message?', 'के यो सन्देश मेटाउने?'))) {
      onUpdateMessages(messages.filter(m => m.id !== id));
      showToast(t('Message deleted.', 'सन्देश हटाइयो।'));
    }
  };

  // ----------------------------------------------------
  // RENDER: LOGIN GATE IF NOT AUTHENTICATED
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[78vh] flex items-center justify-center px-4 py-12 relative">
        {/* Emergency PIN Modal */}
        {showEmergencyPinModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-500">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Emergency Master Recovery PIN', 'आपतकालीन मास्टर रिकभरी पिन')}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t(
                  'Enter the 6-digit administrative master recovery PIN configured in institutional security settings.',
                  'संस्थागत सुरक्षा सेटिङमा रहेको ६-अङ्कीय मास्टर रिकभरी पिन प्रविष्ट गर्नुहोस्।'
                )}
              </p>

              <form onSubmit={handleEmergencyPinUnlock} className="space-y-3">
                {emergencyPinError && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                    {emergencyPinError}
                  </div>
                )}
                <input
                  type="password"
                  maxLength={6}
                  value={emergencyPinInput}
                  onChange={(e) => setEmergencyPinInput(e.target.value)}
                  placeholder="e.g. 782035"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center text-lg font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmergencyPinModal(false);
                      setEmergencyPinInput('');
                      setEmergencyPinError('');
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('Cancel', 'रद्द')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs cursor-pointer"
                  >
                    {t('Verify & Unlock', 'प्रमाणीकरण र अनलक')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#1E40AF]/10 text-[#1E40AF] mx-auto flex items-center justify-center shadow-xs border border-[#1E40AF]/30">
              <Lock className="w-7 h-7 text-[#1E40AF]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('Institutional CMS Portal', 'संस्थागत सीएमएस पोर्टल')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Secure access to Ishwari Secondary School CRUD management system', 'ईश्वरी माध्यमिक विद्यालयको आधिकारिक प्रशासनिक लगइन')}
            </p>
          </div>

          {isLockedOut ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>{t('Account Security Lockout Active', 'सुरक्षा लक सक्रिय')}</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-300">
                {t(
                  `Exceeded maximum login attempts (${securityConfig?.lockoutThreshold || 5}). Console locked for ${lockoutSecondsRemaining} seconds.`,
                  `अधिकतम गलत प्रयास नाघ्यो। कन्सोल ${lockoutSecondsRemaining} सेकेन्डका लागि लक गरिएको छ।`
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowEmergencyPinModal(true)}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t('Emergency PIN Master Unlock', 'आपतकालीन मास्टर पिनबाट अनलक')}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Username', 'प्रयोगकर्ता नाम')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Password', 'पासवर्ड')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Use Master PIN"
                    autoComplete="current-password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#1E40AF]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{t('Login', 'लगइन')}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmergencyPinModal(true)}
                  className="text-[11px] text-slate-400 hover:text-[#1E40AF] dark:hover:text-slate-300 transition hover:underline cursor-pointer"
                >
                  {t('Emergency Master Recovery PIN', 'आपतकालीन मास्टर पिन रिकभरी')}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#1E40AF] transition flex items-center gap-1 cursor-pointer"
            >
              <span>←</span>
              <span>{t('Back to Public Portal', 'गृहपृष्ठमा फर्कनुहोस्')}</span>
            </button>
            <span className="font-mono text-[10px] text-slate-400">Strict Auth Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AUTHENTICATED FULL CRUD DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#1E40AF] shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#1E40AF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#1E40AF]/20">
            {currentAccount?.fullName ? currentAccount.fullName.charAt(0) : 'ई'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentAccount ? currentAccount.fullName : t('Ishwari Model School CMS Dashboard', 'ईश्वरी नमुना मावि प्रशासनिक कन्ट्रोल प्यानल')}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                currentAccount?.role === 'super_admin'
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
              }`}>
                {currentAccount?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                @{currentAccount?.username || username}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Role-Based Institutional CMS with Master Audit Logging & Dynamic UI Management', 'भूमिकामा आधारित संस्थागत सीएमएस तथा प्रत्यक्ष व्यवस्थापन प्रणाली')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Session Countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>
              {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Lang Toggle */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Toggle Language / भाषा बदल्नुहोस्"
            >
              <Globe className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{lang === 'en' ? 'नेपाली' : 'EN'}</span>
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          )}

          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>{t('View Public Site', 'वेबसाइट हेर्नुहोस्')}</span>
          </button>

          <button
            onClick={handleLockConsole}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition cursor-pointer"
            title="Lock active session without losing changes"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('Lock Console', 'कन्सोल लक')}</span>
          </button>

          {currentAccount?.role === 'super_admin' && (
            <button
              onClick={() => {
                if (confirm(t('Reset all content back to factory default government data?', 'के सबै डेटा पूर्वनिर्धारित स्थितिमा रिसेट गर्ने?'))) {
                  onResetData();
                  showToast(t('All database tables reset to default.', 'डेटा रिसेट गरियो।'));
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Reset', 'रिसेट')}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>{t('Logout', 'लगआउट')}</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          // 1. Super Admin Master Control
          ...(currentAccount?.role === 'super_admin' ? [
            {
              id: 'super_admin_control',
              labelEn: 'Super Admin Control',
              labelNp: 'सुपर प्रशासक नियन्त्रण',
              icon: Sparkles,
            }
          ] : []),

          // 2. RBAC Management
          ...(currentAccount?.role === 'super_admin' || can('admin.view') ? [
            {
              id: 'rbac_admin',
              labelEn: `RBAC & Admins (${effectiveAccounts.length})`,
              labelNp: `प्रशासक खाताहरू (${effectiveAccounts.length})`,
              icon: ShieldCheck,
            }
          ] : []),

          ...(currentAccount?.role === 'super_admin' || can('settings.view') ? [
            { id: 'customizer', labelEn: 'Site Layout & Content', labelNp: 'वेबसाइट रूपरेखा तथा सामग्री', icon: Layout },
            { id: 'profile', labelEn: 'Institutional Info', labelNp: 'संस्थागत विवरण', icon: Building2 },
            { id: 'principal', labelEn: "Principal's Desk", labelNp: 'प्रअको सन्देश', icon: Sparkles },
          ] : []),

          ...(can('notice.view') ? [
            { id: 'notices', labelEn: `Notices (${notices.length})`, labelNp: `सूचनाहरू (${notices.length})`, icon: Bell },
          ] : []),

          ...(can('teacher.view') || can('staff.view') ? [
            { id: 'staff', labelEn: `Faculty (${staff.length})`, labelNp: `शिक्षक/कर्मचारी (${staff.length})`, icon: Users },
          ] : []),

          ...(can('program.view') ? [
            { id: 'academics', labelEn: `Programs (${programs.length})`, labelNp: `शैक्षिक कार्यक्रम (${programs.length})`, icon: BookOpen },
          ] : []),

          ...(can('facility.view') ? [
            { id: 'facilities', labelEn: `Facilities (${facilities.length})`, labelNp: `पूर्वाधार (${facilities.length})`, icon: Building2 },
          ] : []),

          ...(can('event.view') || can('achievement.view') ? [
            { id: 'events_extra', labelEn: `Events & History (${events.length + achievements.length})`, labelNp: `कार्यक्रम तथा इतिहास`, icon: CalendarDays },
          ] : []),

          ...(can('gallery.view') ? [
            { id: 'gallery', labelEn: `Photo Gallery (${gallery.length})`, labelNp: `फोटो ग्यालरी (${gallery.length})`, icon: Image },
          ] : []),

          ...(can('document.view') ? [
            { id: 'documents', labelEn: `Documents (${documents.length})`, labelNp: `दस्तावेज (${documents.length})`, icon: FolderDown },
          ] : []),

          ...(can('message.view') ? [
            { id: 'messages', labelEn: `Inquiries (${messages.length})`, labelNp: `सन्देश (${messages.length})`, icon: MessageSquare, badge: messages.filter(m => m.status === 'new').length },
          ] : []),

          ...(currentAccount?.role === 'super_admin' ? [
            { id: 'security', labelEn: 'Security & Stealth Link', labelNp: 'सुरक्षा तथा गोप्य मार्ग', icon: ShieldAlert },
            { id: 'system', labelEn: 'Database Backup & Restore', labelNp: 'डाटाबेस ब्याकअप तथा रिस्टोर', icon: Database },
          ] : []),
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1E40AF]'}`} />
              <span>{t(tab.labelEn, tab.labelNp)}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold font-mono">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB: SUPER ADMIN CONTROL CENTER */}
      {activeTab === 'super_admin_control' && (
        <SuperAdminControlCenter
          lang={lang}
          school={school}
          onUpdateSchool={onUpdateSchool}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          currentAccount={currentAccount || effectiveAccounts[0]}
          onAddAuditLog={onAddAuditLog}
          onShowToast={showToast}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {/* TAB: RBAC & ADMIN USERS */}
      {activeTab === 'rbac_admin' && (
        <RbacAdminTab
          lang={lang}
          accounts={effectiveAccounts}
          onUpdateAccounts={(updated) => {
            if (onUpdateAdminAccounts) {
              onUpdateAdminAccounts(updated);
            }
          }}
          currentAccount={currentAccount || effectiveAccounts[0]}
          auditLogs={auditLogs}
          onClearAuditLogs={onClearAuditLogs}
          onAddAuditLog={onAddAuditLog}
          onShowToast={showToast}
        />
      )}

      {/* TAB 0: SITE CUSTOMIZER */}
      {activeTab === 'customizer' && (
        <SiteCustomizerTab
          lang={lang}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onShowToast={showToast}
        />
      )}

      {/* TAB: EVENTS, ACHIEVEMENTS & HISTORY */}
      {activeTab === 'events_extra' && (
        <EventsAchievementsHistoryTab
          lang={lang}
          events={events}
          onUpdateEvents={onUpdateEvents}
          achievements={achievements}
          onUpdateAchievements={onUpdateAchievements}
          history={history}
          onUpdateHistory={onUpdateHistory}
          onShowToast={showToast}
        />
      )}

      {/* TAB: GALLERY */}
      {activeTab === 'gallery' && (
        <GalleryAdminTab
          lang={lang}
          gallery={gallery}
          onUpdateGallery={onUpdateGallery}
          onShowToast={showToast}
        />
      )}

      {/* TAB: SECURITY, STEALTH ROUTING & AUDIT LOGS */}
      {activeTab === 'security' && (
        <SecurityTab
          lang={lang}
          securityConfig={securityConfig}
          onUpdateSecurityConfig={onUpdateSecurityConfig}
          auditLogs={auditLogs}
          onClearAuditLogs={onClearAuditLogs}
          onShowToast={showToast}
        />
      )}

      {/* TAB: SYSTEM BACKUP, RESTORE & PHP DEPLOYMENT */}
      {activeTab === 'system' && (
        <BackupRestoreTab
          lang={lang}
          school={school}
          notices={notices}
          staff={staff}
          facilities={facilities}
          programs={programs}
          documents={documents}
          messages={messages}
          events={events}
          achievements={achievements}
          history={history}
          gallery={gallery}
          siteConfig={siteConfig}
          securityConfig={securityConfig}
          onRestoreAllData={onRestoreAllData}
          onResetFactory={onResetData}
          onShowToast={showToast}
        />
      )}

      {/* TAB 1: INSTITUTIONAL PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSchool} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Institutional Profile & Coordinates', 'संस्थागत प्रोफाइल तथा सम्पर्क विवरण')}</span>
            </h3>
            <p className="text-xs text-slate-500">{t('Changes save immediately across public headers, footers, and institutional meta.', 'यहाँ सम्पादन गरिएको विवरण सम्पूर्ण वेबसाइटभर तत्काल लागु हुनेछ।')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">School Name (English)</label>
              <input
                type="text"
                value={schoolForm.name_en}
                onChange={e => setSchoolForm({ ...schoolForm, name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">विद्यालयको नाम (नेपाली)</label>
              <input
                type="text"
                value={schoolForm.name_np}
                onChange={e => setSchoolForm({ ...schoolForm, name_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline (English)</label>
              <input
                type="text"
                value={schoolForm.tagline_en}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">मूल नारा (नेपाली)</label>
              <input
                type="text"
                value={schoolForm.tagline_np}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official EMIS Code</label>
              <input
                type="text"
                value={schoolForm.code}
                onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliation / Status</label>
              <input
                type="text"
                value={schoolForm.affiliation_en}
                onChange={e => setSchoolForm({ ...schoolForm, affiliation_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Phone Numbers</label>
              <input
                type="text"
                value={schoolForm.phone}
                onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email Address</label>
              <input
                type="email"
                value={schoolForm.email}
                onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address (English)</label>
              <input
                type="text"
                value={schoolForm.address_en}
                onChange={e => setSchoolForm({ ...schoolForm, address_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ठेगाना (नेपाली)</label>
              <input
                type="text"
                value={schoolForm.address_np}
                onChange={e => setSchoolForm({ ...schoolForm, address_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#1E40AF]/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Institutional Profile', 'विवरण सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PRINCIPAL'S DESK */}
      {activeTab === 'principal' && (
        <form onSubmit={handleSaveSchool} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1E40AF]" />
              <span>{t("Principal's Desk & Speech", 'प्रधानाध्यापकको सन्देश सम्पादन')}</span>
            </h3>
            <p className="text-xs text-slate-500">{t('Manage headmaster name and official message shown on homepage.', 'गृहपृष्ठमा देखिने प्रअको सन्देश')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Name (English)</label>
              <input
                type="text"
                value={schoolForm.principal_name_en}
                onChange={e => setSchoolForm({ ...schoolForm, principal_name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">प्रधानाध्यापकको नाम (नेपाली)</label>
              <input
                type="text"
                value={schoolForm.principal_name_np}
                onChange={e => setSchoolForm({ ...schoolForm, principal_name_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Message (English)</label>
              <textarea
                rows={4}
                value={schoolForm.principal_message_en}
                onChange={e => setSchoolForm({ ...schoolForm, principal_message_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">आधिकारिक सन्देश (नेपाली)</label>
              <textarea
                rows={4}
                value={schoolForm.principal_message_np}
                onChange={e => setSchoolForm({ ...schoolForm, principal_message_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#1E40AF]/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{t("Save Principal's Desk", 'सन्देश सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: NOTICES & CIRCULARS CRUD */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          {/* Notice Form */}
          <form onSubmit={handleSaveNotice} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1E40AF]" />
                <span>{noticeForm.id ? t('Edit Notice', 'सूचना सम्पादन') : t('Publish New Circular / Notice', 'नयाँ सूचना जारी गर्नुहोस्')}</span>
              </h3>
              {noticeForm.id && (
                <button
                  type="button"
                  onClick={() => {
                    setNoticeForm({
                      id: null,
                      title_en: '',
                      title_np: '',
                      category: 'academic',
                      pinned: false,
                      file_name: '',
                      file_data: undefined,
                      file_size_kb: undefined,
                      description_en: '',
                      description_np: '',
                    });
                    setNoticeFileError('');
                    if (noticeFileInputRef.current) {
                      noticeFileInputRef.current.value = '';
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  {t('Cancel Edit', 'रद्द गर्नुहोस्')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title_en}
                  onChange={e => setNoticeForm({ ...noticeForm, title_en: e.target.value })}
                  placeholder="e.g., Annual Examination Schedule Published"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">शीर्षक (नेपाली)</label>
                <input
                  type="text"
                  value={noticeForm.title_np}
                  onChange={e => setNoticeForm({ ...noticeForm, title_np: e.target.value })}
                  placeholder="उदा. वार्षिक परीक्षा तालिका प्रकाशित"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={noticeForm.category}
                  onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                >
                  <option value="academic">Academic (शैक्षिक)</option>
                  <option value="administrative">Administrative (प्रशासनिक)</option>
                  <option value="exam">Examination (परीक्षा)</option>
                  <option value="events">Events (कार्यक्रम)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('Attachment File Type: PDF Only', 'संलग्न फाइल प्रकार: केवल PDF')}</span>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-mono">
                    {t('Max size: ≤ 200 KB', 'अधिकतम: ≤ २०० KB')}
                  </span>
                </label>

                <div className="space-y-1.5">
                  <input
                    ref={noticeFileInputRef}
                    type="file"
                    id="notice-pdf-input"
                    accept="application/pdf,.pdf"
                    onChange={handleNoticePdfUpload}
                    className="hidden"
                  />

                  {!noticeForm.file_name ? (
                    <label
                      htmlFor="notice-pdf-input"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E40AF] dark:hover:border-[#1E40AF] bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-xs text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#1E40AF] shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {t('Upload Notice PDF (≤ 200 KB)', 'सूचना PDF फाइल अपलोड गर्नुहोस् (≤ २०० KB)')}
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#1E40AF] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate font-mono text-[11px]">
                            {noticeForm.file_name}
                          </p>
                          <p className="text-[10px] text-blue-700 dark:text-blue-400 font-mono">
                            {noticeForm.file_size_kb ? `${noticeForm.file_size_kb} KB • ` : ''}PDF Ready
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <label
                          htmlFor="notice-pdf-input"
                          title={t('Replace PDF', 'PDF फेर्नुहोस्')}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#1E40AF] cursor-pointer transition"
                        >
                          {t('Change', 'फेर्नुहोस्')}
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveNoticePdf}
                          title={t('Remove PDF', 'हटाउनुहोस्')}
                          className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {noticeFileError && (
                    <p className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{noticeFileError}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={noticeForm.description_en}
                  onChange={e => setNoticeForm({ ...noticeForm, description_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeForm.pinned}
                    onChange={e => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1E40AF] focus:ring-[#1E40AF]"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Pin to Homepage Alert Banner', 'गृहपृष्ठमा मुख्य सूचनाको रूपमा पिन गर्नुहोस्')}
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{noticeForm.id ? t('Update Notice', 'अपडेट गर्नुहोस्') : t('Publish Notice', 'प्रकाशित गर्नुहोस्')}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Notices List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t(`Published Circulars (${notices.length})`, `प्रकाशित सूचनाहरू (${notices.length})`)}
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notices.map((n) => (
                <div key={n.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {n.pinned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E40AF] text-white uppercase">
                          Pinned
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                        {n.category}
                      </span>
                      {n.file_name && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-mono">
                          <FileText className="w-2.5 h-2.5" />
                          <span>PDF{n.file_size_kb ? ` (${n.file_size_kb}KB)` : ''}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{t(n.date_en, n.date_np)}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t(n.title_en, n.title_np)}
                    </h5>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePinNotice(n.id)}
                      title={n.pinned ? 'Unpin' : 'Pin to Homepage'}
                      className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        n.pinned ? 'text-[#1E40AF]' : 'text-slate-400'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setNoticeForm({
                          id: n.id,
                          title_en: n.title_en,
                          title_np: n.title_np,
                          category: n.category,
                          pinned: n.pinned,
                          file_name: n.file_name,
                          file_data: n.file_data,
                          file_size_kb: n.file_size_kb,
                          description_en: n.description_en,
                          description_np: n.description_np,
                        });
                        setNoticeFileError('');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY & STAFF CRUD (PASSPORT PHOTO & 3:4 CROPPING & RBAC) */}
      {activeTab === 'staff' && (
        <StaffAdminTab
          lang={lang}
          staff={staff}
          onUpdateStaff={onUpdateStaff}
          onShowToast={showToast}
          canCreate={can('teacher.create') || can('staff.create')}
          canUpdate={can('teacher.update') || can('staff.update')}
          canDelete={can('teacher.delete') || can('staff.delete')}
        />
      )}

      {/* TAB 5: ACADEMIC PROGRAMS CRUD */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProgram} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-[#1E40AF]" />
              <span>{programForm.id ? t('Edit Academic Program', 'कार्यक्रम सम्पादन') : t('Add Academic Program', 'नयाँ शैक्षिक कार्यक्रम थप्नुहोस्')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program Title (English) *</label>
                <input
                  type="text"
                  required
                  value={programForm.title_en}
                  onChange={e => setProgramForm({ ...programForm, title_en: e.target.value })}
                  placeholder="e.g., Higher Secondary (+2 Computer Science)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">कार्यक्रमको नाम (नेपाली)</label>
                <input
                  type="text"
                  value={programForm.title_np}
                  onChange={e => setProgramForm({ ...programForm, title_np: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Level</label>
                <input
                  type="text"
                  value={programForm.level}
                  onChange={e => setProgramForm({ ...programForm, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Annual Intake Capacity</label>
                <input
                  type="number"
                  value={programForm.intake}
                  onChange={e => setProgramForm({ ...programForm, intake: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Curriculum Overview (English)</label>
                <textarea
                  rows={2}
                  value={programForm.desc_en}
                  onChange={e => setProgramForm({ ...programForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{programForm.id ? t('Update Program', 'अपडेट') : t('Create Program', 'थप्नुहोस्')}</span>
              </button>
            </div>
          </form>

          {/* Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                    Intake: {p.intake} Students
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProgramForm({
                          id: p.id,
                          title_en: p.title_en,
                          title_np: p.title_np,
                          level: p.level,
                          duration: p.duration,
                          intake: p.intake,
                          desc_en: p.desc_en,
                          desc_np: p.desc_np,
                        });
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(p.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(p.title_en, p.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(p.desc_en, p.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FACILITIES CRUD */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveFacility} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-[#1E40AF]" />
              <span>{facilityForm.id ? t('Edit Facility', 'पूर्वाधार सम्पादन') : t('Add Facility / Laboratory', 'नयाँ पूर्वाधार थप्नुहोस्')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Facility Name (English) *</label>
                <input
                  type="text"
                  required
                  value={facilityForm.title_en}
                  onChange={e => setFacilityForm({ ...facilityForm, title_en: e.target.value })}
                  placeholder="e.g., Optical Fiber ICT Studio"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">पूर्वाधारको नाम (नेपाली)</label>
                <input
                  type="text"
                  value={facilityForm.title_np}
                  onChange={e => setFacilityForm({ ...facilityForm, title_np: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Technical Specifications (English)</label>
                <textarea
                  rows={2}
                  value={facilityForm.desc_en}
                  onChange={e => setFacilityForm({ ...facilityForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{facilityForm.id ? t('Update Facility', 'अपडेट') : t('Add Facility', 'थप्नुहोस्')}</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {facilities.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{f.icon}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setFacilityForm({
                          id: f.id,
                          title_en: f.title_en,
                          title_np: f.title_np,
                          desc_en: f.desc_en,
                          desc_np: f.desc_np,
                          icon: f.icon,
                        });
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(f.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(f.title_en, f.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(f.desc_en, f.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CITIZEN CHARTER & DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveDocument} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <FolderDown className="w-4 h-4 text-[#1E40AF]" />
              <span>{documentForm.id ? t('Edit Downloadable Resource', 'दस्तावेज सम्पादन') : t('Upload Downloadable File / Charter', 'नयाँ फारम / नागरिक बडापत्र थप्नुहोस्')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Document Title (English) *</label>
                <input
                  type="text"
                  required
                  value={documentForm.title_en}
                  onChange={e => setDocumentForm({ ...documentForm, title_en: e.target.value })}
                  placeholder="e.g., Scholarship Application Form 2083"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">दस्तावेज शीर्षक (नेपाली)</label>
                <input
                  type="text"
                  value={documentForm.title_np}
                  onChange={e => setDocumentForm({ ...documentForm, title_np: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">File Format Type</label>
                <input
                  type="text"
                  value={documentForm.type}
                  onChange={e => setDocumentForm({ ...documentForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated File Size</label>
                <input
                  type="text"
                  value={documentForm.size}
                  onChange={e => setDocumentForm({ ...documentForm, size: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{documentForm.id ? t('Update Document', 'अपडेट') : t('Save Document', 'सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {documents.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t(d.title_en, d.title_np)}
                  </h5>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {d.type} • {d.size} • {d.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDocumentForm({
                        id: d.id,
                        title_en: d.title_en,
                        title_np: d.title_np,
                        type: d.type,
                        size: d.size,
                        date: d.date,
                      });
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(d.id)}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: CONTACT INQUIRIES INBOX */}
      {activeTab === 'messages' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Contact & Admission Inquiries Inbox', 'प्राप्त सोधपुछ तथा सन्देशहरू')}</span>
              </h3>
              <p className="text-xs text-slate-500">{t('Submissions received from students and parents through contact portal', 'सार्वजनिक सम्पर्क फारमबाट पठाइएका सन्देशहरू')}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1E40AF]/10 text-[#1E40AF]">
              {messages.length} Total Messages
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {t('No inquiries submitted yet.', 'हाल कुनै नयाँ सन्देश छैन।')}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        m.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        m.status === 'reviewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {m.status}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</h5>
                      <span className="text-[11px] text-slate-400 font-mono">({m.email} / {m.phone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#1E40AF]">{m.subject}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {m.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateMessageStatus(m.id, 'reviewed')}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition"
                    >
                      {t('Mark Reviewed', 'समीक्षा गरियो')}
                    </button>
                    <button
                      onClick={() => handleUpdateMessageStatus(m.id, 'resolved')}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white transition"
                    >
                      {t('Mark Resolved', 'समाधान गरियो')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
