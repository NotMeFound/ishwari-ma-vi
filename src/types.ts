export type Language = 'en' | 'np';
export type ThemeMode = 'light' | 'dark';

export interface SchoolData {
  name_en: string;
  name_np: string;
  tagline_en: string;
  tagline_np: string;
  affiliation_en: string;
  affiliation_np: string;
  code: string;
  estd_bs: string;
  estd_ad: string;
  estd?: string;
  school_code?: string;
  timing_en?: string;
  timing_np?: string;
  emergency_contact?: string;
  phone: string;
  email: string;
  address_en: string;
  address_np: string;
  location_en?: string;
  location_np?: string;
  principal_name_en: string;
  principal_name_np: string;
  principal_designation_en?: string;
  principal_designation_np?: string;
  principal_message_en: string;
  principal_message_np: string;
  principal_image?: string;
  chairman_name_en?: string;
  chairman_name_np?: string;
  chairman_designation_en?: string;
  chairman_designation_np?: string;
  chairman_message_en?: string;
  chairman_message_np?: string;
  chairman_image?: string;
  home_bg_image?: string;
  home_bg_enabled?: boolean;
  logo_url?: string;
}

export interface Notice {
  id: number;
  title_en: string;
  title_np: string;
  date_en: string;
  date_np: string;
  category: 'academic' | 'exam' | 'scholarship' | 'admin' | 'event';
  pinned: boolean;
  file_name: string;
  file_data?: string;
  file_size_kb?: number;
  description_en: string;
  description_np: string;
}

export interface StaffMember {
  id: number;
  name_en: string;
  name_np: string;
  role: 'principal' | 'teacher' | 'admin' | 'support' | 'smc_chair' | 'smc_member';
  designation_en: string;
  designation_np: string;
  experience: string;
  image?: string; // passport-size photograph (base64 or URL)
  department_en?: string;
  department_np?: string;
  qualification_en?: string;
  qualification_np?: string;
  isActive?: boolean;
}

export interface Facility {
  id: number;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
  icon: string;
  category?: 'science' | 'ict' | 'library' | 'sports' | 'amenity' | 'general' | string;
  order?: number;
  published?: boolean;
  backgroundImage?: string;
  backgroundImageEnabled?: boolean;
  backgroundImageAltEn?: string;
  backgroundImageAltNp?: string;
}

export interface SchoolEvent {
  id: number;
  title_en: string;
  title_np: string;
  date_en: string;
  date_np: string;
  time: string;
  venue_en: string;
  venue_np: string;
  desc_en: string;
  desc_np: string;
}

export interface Achievement {
  id: number;
  year: string;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
}

export interface HistoryItem {
  year: string;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
}

export interface DocumentItem {
  id: number;
  title_en: string;
  title_np: string;
  type: string;
  size: string;
  date: string;
  description_en?: string;
  description_np?: string;
  original_filename?: string;
  stored_filename?: string;
  file_path?: string;
  url?: string;
  mime_type?: string;
  file_size?: number;
  status?: 'draft' | 'published';
  is_published?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicProgram {
  id: number;
  title_en: string;
  title_np: string;
  level: string;
  duration: string;
  intake: number;
  desc_en: string;
  desc_np: string;
  streams?: string[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed' | 'resolved';
  replyNotes?: string;
  repliedAt?: string;
}

export interface GalleryItem {
  id: number;
  title_en: string;
  title_np: string;
  category: 'science' | 'sports' | 'academics' | 'culture' | 'community';
  iconType?: 'science' | 'sports' | 'academics' | 'culture' | 'community' | 'camera';
  image?: string; // base64 or URL (< 1MB)
  date?: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export type PermissionKey =
  | 'notice.view'
  | 'notice.create'
  | 'notice.update'
  | 'notice.delete'
  | 'teacher.view'
  | 'teacher.create'
  | 'teacher.update'
  | 'teacher.delete'
  | 'staff.view'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'gallery.view'
  | 'gallery.create'
  | 'gallery.update'
  | 'gallery.delete'
  | 'program.view'
  | 'program.create'
  | 'program.update'
  | 'program.delete'
  | 'facility.view'
  | 'facility.create'
  | 'facility.update'
  | 'facility.delete'
  | 'facility.publish'
  | 'event.view'
  | 'event.create'
  | 'event.update'
  | 'event.delete'
  | 'achievement.view'
  | 'achievement.create'
  | 'achievement.update'
  | 'achievement.delete'
  | 'document.view'
  | 'document.create'
  | 'document.update'
  | 'document.delete'
  | 'message.view'
  | 'message.update'
  | 'message.delete'
  | 'school.view'
  | 'school.update'
  | 'settings.view'
  | 'settings.update'
  | 'admin.view'
  | 'admin.create'
  | 'admin.update'
  | 'admin.delete'
  | 'role.view'
  | 'role.update'
  | 'audit.view'
  | 'audit.delete'
  | 'security.view'
  | 'security.update'
  | 'backup.create'
  | 'backup.restore';

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  passwordHash: string;
  salt: string;
  status: 'active' | 'suspended' | 'inactive';
  isActive?: boolean;
  permissions: PermissionKey[];
  lastLogin?: string;
  createdAt: string;
}

export interface SiteCustomizerConfig {
  primaryColor: string; // e.g. '#1E40AF'
  primaryColorName: string;
  showAlertTicker: boolean;
  tickerMode?: 'auto_pinned' | 'custom';
  alertTickerEn: string;
  alertTickerNp: string;
  heroBadgeEn: string;
  heroBadgeNp: string;
  heroTitleEn: string;
  heroTitleNp: string;
  heroSubtitleEn: string;
  heroSubtitleNp: string;
  homeBgImage?: string;
  homeBgEnabled?: boolean;
  homeBgOverlayOpacity?: number; // 0 to 100
  hero_background_image?: string;
  hero_background_enabled?: boolean;
  hero_background_alt_en?: string;
  hero_background_alt_np?: string;
  heroBackgroundImage?: string;
  heroBackgroundEnabled?: boolean;
  heroBackgroundAltEn?: string;
  heroBackgroundAltNp?: string;
  stats: {
    students: string;
    studentsLabelEn: string;
    studentsLabelNp: string;
    staff: string;
    staffLabelEn: string;
    staffLabelNp: string;
    years: string;
    yearsLabelEn: string;
    yearsLabelNp: string;
    successRate: string;
    successLabelEn: string;
    successLabelNp: string;
  };
  sectionVisibility: {
    hero: boolean;
    stats: boolean;
    notices: boolean;
    principal: boolean;
    facilities: boolean;
    academics: boolean;
    events: boolean;
    achievements: boolean;
    history: boolean;
    documents: boolean;
    gallery: boolean;
    community: boolean;
    contact: boolean;
  };
  footerDescEn?: string;
  footerDescNp?: string;
  copyrightTextEn?: string;
  copyrightTextNp?: string;
}

export type SiteConfig = SiteCustomizerConfig;

export interface SecurityConfig {
  adminUsername: string;
  adminPassword?: string;
  adminPasswordHash: string;
  recoveryPin: string;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  adminRouteSlug: string; // default 'admin-portal'
  hideAdminLinkInHeader: boolean;
  maxFailedAttempts?: number;
  forcePasswordChangePeriodDays?: number;
  maintenanceMode?: boolean;
  allowedIPs?: string[];
}

export interface ActiveSessionLock {
  sessionId: string;
  userId: string;
  username: string;
  role: AdminRole;
  fullName: string;
  loginTimestamp: number;
  lastHeartbeat: number;
}

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role?: string;
  module?: string;
  result?: 'success' | 'failed' | 'denied';
  ipAddress?: string;
  status: 'success' | 'warning' | 'danger' | 'failed' | 'denied';
  severity?: 'success' | 'warning' | 'danger' | 'info';
  details: string;
}

