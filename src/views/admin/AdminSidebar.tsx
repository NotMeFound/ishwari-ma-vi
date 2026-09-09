import React, { useState } from 'react';
import { Language, AdminRole, PermissionKey } from '../../types';
import {
  LayoutDashboard,
  Globe,
  Building2,
  Layout,
  PanelTop,
  Menu as MenuIcon,
  PanelBottom,
  FileText,
  Bell,
  FileDown,
  Calendar,
  Award,
  History,
  Users,
  UserCheck,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  ShieldCheck,
  KeyRound,
  Settings,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';

export type AdminNavTabId =
  | 'dashboard'
  // Website
  | 'website_identity'
  | 'website_homepage'
  | 'website_header'
  | 'website_navigation'
  | 'website_footer'
  // Content
  | 'content_about'
  | 'content_notices'
  | 'content_documents'
  | 'content_events'
  | 'content_achievements'
  | 'content_history'
  // Governance
  | 'gov_smc'
  | 'gov_chairman'
  | 'gov_principal'
  | 'gov_staff'
  // Media
  | 'media_gallery'
  // Communication
  | 'comm_contact'
  // System
  | 'sys_admins'
  | 'sys_roles'
  | 'sys_settings'
  | 'sys_audit'
  // Account
  | 'account_profile';

export interface AdminSidebarProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername: string;
  activeTab: AdminNavTabId;
  onSelectTab: (tabId: AdminNavTabId) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  unreadMessagesCount?: number;
  noticesCount?: number;
  can?: (perm: PermissionKey) => boolean;
  onLockConsole?: () => void;
  badgeCounts?: {
    notices?: number;
    documents?: number;
    staff?: number;
    messages?: number;
    admins?: number;
  };
}

interface NavItem {
  id: AdminNavTabId;
  labelEn: string;
  labelNp: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  superAdminOnly?: boolean;
  requiredPermission?: PermissionKey;
}

interface NavGroup {
  id: string;
  titleEn: string;
  titleNp: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  superAdminOnly?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  lang,
  currentRole,
  currentUsername,
  activeTab,
  onSelectTab,
  onLogout,
  onNavigateHome,
  isOpenMobile = false,
  onCloseMobile = () => {},
  unreadMessagesCount,
  noticesCount,
  can,
  onLockConsole,
  badgeCounts = {}
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const resolvedBadges = {
    notices: badgeCounts.notices ?? noticesCount,
    messages: badgeCounts.messages ?? unreadMessagesCount,
    documents: badgeCounts.documents,
    staff: badgeCounts.staff,
    admins: badgeCounts.admins
  };

  // Automatically expand group that contains activeTab
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    website: true,
    content: true,
    governance: true,
    media: true,
    communication: true,
    system: isSuperAdmin,
    account: true
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'website',
      titleEn: 'Website',
      titleNp: 'वेबसाइट',
      icon: Globe,
      items: [
        { id: 'website_identity', labelEn: 'Site Identity', labelNp: 'वेबसाइट पहिचान', icon: Building2 },
        { id: 'website_homepage', labelEn: 'Homepage', labelNp: 'गृहपृष्ठ', icon: Layout },
        { id: 'website_header', labelEn: 'Header', labelNp: 'हेडर / सूचना पट्टी', icon: PanelTop },
        { id: 'website_navigation', labelEn: 'Navigation', labelNp: 'नेभिगेसन मेनु', icon: MenuIcon },
        { id: 'website_footer', labelEn: 'Footer', labelNp: 'फुटर', icon: PanelBottom }
      ]
    },
    {
      id: 'content',
      titleEn: 'Content',
      titleNp: 'सामग्री',
      icon: FileText,
      items: [
        { id: 'content_about', labelEn: 'About', labelNp: 'परिचय तथा कार्यक्रम', icon: Building2 },
        { id: 'content_notices', labelEn: 'Notices', labelNp: 'सूचनाहरू', icon: Bell, badge: resolvedBadges.notices },
        { id: 'content_documents', labelEn: 'Documents', labelNp: 'दस्तावेज तथा फारम', icon: FileDown, badge: resolvedBadges.documents },
        { id: 'content_events', labelEn: 'Events & Routines', labelNp: 'कार्यक्रम तथा तालिका', icon: Calendar },
        { id: 'content_achievements', labelEn: 'Honors & Achievements', labelNp: 'उपलब्धि तथा पुरस्कार', icon: Award },
        { id: 'content_history', labelEn: 'History & Milestones', labelNp: 'इतिहास तथा कोसेढुङ्गा', icon: History }
      ]
    },
    {
      id: 'governance',
      titleEn: 'Governance',
      titleNp: 'प्रशासन तथा नेतृत्व',
      icon: Users,
      items: [
        { id: 'gov_smc', labelEn: 'School Management Committee', labelNp: 'विद्यालय व्यवस्थापन समिति', icon: Users },
        { id: 'gov_chairman', labelEn: 'Chairman', labelNp: 'अध्यक्ष सन्देश', icon: UserCheck },
        { id: 'gov_principal', labelEn: 'Principal', labelNp: 'प्रधानाध्यापक कक्ष', icon: GraduationCap },
        { id: 'gov_staff', labelEn: 'Teachers & Staff', labelNp: 'शिक्षक तथा कर्मचारी', icon: Users, badge: resolvedBadges.staff }
      ]
    },
    {
      id: 'media',
      titleEn: 'Media',
      titleNp: 'मिडिया',
      icon: ImageIcon,
      items: [
        { id: 'media_gallery', labelEn: 'Photo Gallery', labelNp: 'फोटो ग्यालरी', icon: ImageIcon }
      ]
    },
    {
      id: 'communication',
      titleEn: 'Communication',
      titleNp: 'सञ्चार',
      icon: Mail,
      items: [
        { id: 'comm_contact', labelEn: 'Contact', labelNp: 'सम्पर्क तथा सन्देश', icon: Mail, badge: resolvedBadges.messages, requiredPermission: 'message.view' }
      ]
    },
    {
      id: 'system',
      titleEn: 'System',
      titleNp: 'प्रणाली सेटिङ',
      icon: Settings,
      superAdminOnly: false,
      items: [
        { id: 'sys_admins', labelEn: 'Administrators', labelNp: 'प्रशासक खाताहरू', icon: ShieldCheck, badge: resolvedBadges.admins, requiredPermission: 'admin.view' },
        { id: 'sys_roles', labelEn: 'Roles & Permissions', labelNp: 'भूमिका र अनुमतिहरू', icon: KeyRound, requiredPermission: 'role.view' },
        { id: 'sys_settings', labelEn: 'Site Settings', labelNp: 'साइट सेटिङ तथा सुरक्षा', icon: Settings, requiredPermission: 'settings.view' },
        { id: 'sys_audit', labelEn: 'Audit Logs', labelNp: 'सुरक्षा अडिट लग', icon: ClipboardList, requiredPermission: 'audit.view' }
      ]
    }
  ];

  const isItemVisible = (item: NavItem) => {
    if (isSuperAdmin) return true;
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.requiredPermission && can && !can(item.requiredPermission)) return false;
    return true;
  };

  const handleItemClick = (id: AdminNavTabId) => {
    onSelectTab(id);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {isSuperAdmin ? 'Superadmin' : 'Admin Panel'}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              @{currentUsername}
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
              isSuperAdmin
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
            }`}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar text-xs">
        {/* 1. Dashboard top-level */}
        <button
          onClick={() => handleItemClick('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
            <span>{t('Dashboard', 'ड्यासबोर्ड')}</span>
          </div>
        </button>

        {/* Hierarchical Groups */}
        {navGroups.map((group) => {
          if (group.superAdminOnly && !isSuperAdmin) return null;
          const visibleItems = group.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = group.icon;
          const hasActiveChild = visibleItems.some(it => it.id === activeTab);

          return (
            <div key={group.id} className="pt-2">
              {/* Group Header / Accordion Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  hasActiveChild
                    ? 'text-[#1E40AF] dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{t(group.titleEn, group.titleNp)}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>

              {/* Group Sub-Items */}
              {isExpanded && (
                <div className="mt-0.5 space-y-0.5 pl-2 border-l border-slate-200 dark:border-slate-800 ml-3">
                  {visibleItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          isActive
                            ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{t(item.labelEn, item.labelNp)}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Account Section */}
        <div className="pt-3">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('Account', 'खाता')}
          </div>
          <div className="mt-0.5 space-y-0.5 pl-2 border-l border-slate-200 dark:border-slate-800 ml-3">
            <button
              type="button"
              onClick={() => handleItemClick('account_profile')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                activeTab === 'account_profile'
                  ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'account_profile' ? 'text-white' : 'text-slate-400'}`} />
                <span>{t('Profile', 'प्रोफाइल')}</span>
              </div>
            </button>

            {onLockConsole && (
              <button
                type="button"
                onClick={onLockConsole}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{t('Lock Console', 'कन्सोल लक')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{t('Logout', 'लगआउट')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer Quick Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('Public Website', 'सार्वजनिक वेबसाइट')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
