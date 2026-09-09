import React from 'react';
import { Language, AdminRole, ThemeMode } from '../../types';
import {
  Menu,
  Clock,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { AdminNavTabId } from './AdminSidebar';

export interface AdminHeaderProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername?: string;
  activeTab: AdminNavTabId;
  sessionRemainingSec?: number;
  sessionTimeLeft?: number;
  onOpenMobileSidebar?: () => void;
  onToggleTheme?: () => void;
  theme?: ThemeMode;
  onToggleLang?: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  lang,
  currentRole,
  currentUsername,
  activeTab,
  sessionRemainingSec,
  sessionTimeLeft,
  onOpenMobileSidebar,
  onToggleTheme,
  theme,
  onToggleLang,
  onNavigateHome,
  onLogout
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';
  const remainingSeconds = sessionRemainingSec ?? sessionTimeLeft ?? 0;

  // Format session countdown
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Human friendly section label for the breadcrumb
  const getTabBreadcrumb = (id: AdminNavTabId) => {
    const map: Record<AdminNavTabId, { group: string; item: string }> = {
      dashboard: { group: '', item: t('Dashboard', 'ड्यासबोर्ड') },
      website_identity: { group: t('Website', 'वेबसाइट'), item: t('Site Identity', 'वेबसाइट पहिचान') },
      website_homepage: { group: t('Website', 'वेबसाइट'), item: t('Homepage', 'गृहपृष्ठ') },
      website_header: { group: t('Website', 'वेबसाइट'), item: t('Header', 'हेडर') },
      website_navigation: { group: t('Website', 'वेबसाइट'), item: t('Navigation', 'नेभिगेसन') },
      website_footer: { group: t('Website', 'वेबसाइट'), item: t('Footer', 'फुटर') },
      content_about: { group: t('Content', 'सामग्री'), item: t('About', 'परिचय') },
      content_notices: { group: t('Content', 'सामग्री'), item: t('Notices', 'सूचनाहरू') },
      content_documents: { group: t('Content', 'सामग्री'), item: t('Documents', 'दस्तावेजहरू') },
      content_events: { group: t('Content', 'सामग्री'), item: t('Events & Routines', 'कार्यक्रम तथा तालिका') },
      content_achievements: { group: t('Content', 'सामग्री'), item: t('Honors & Achievements', 'उपलब्धिहरू') },
      content_history: { group: t('Content', 'सामग्री'), item: t('History & Milestones', 'इतिहास') },
      gov_smc: { group: t('Governance', 'प्रशासन'), item: t('School Management Committee', 'विद्यालय व्यवस्थापन समिति') },
      gov_chairman: { group: t('Governance', 'प्रशासन'), item: t('Chairman', 'अध्यक्ष सन्देश') },
      gov_principal: { group: t('Governance', 'प्रशासन'), item: t('Principal', 'प्रधानाध्यापक कक्ष') },
      gov_staff: { group: t('Governance', 'प्रशासन'), item: t('Teachers & Staff', 'शिक्षक तथा कर्मचारी') },
      media_gallery: { group: t('Media', 'मिडिया'), item: t('Photo Gallery', 'फोटो ग्यालरी') },
      comm_contact: { group: t('Communication', 'सञ्चार'), item: t('Contact', 'सम्पर्क तथा सन्देश') },
      sys_admins: { group: t('System', 'प्रणाली'), item: t('Administrators', 'प्रशासकहरू') },
      sys_roles: { group: t('System', 'प्रणाली'), item: t('Roles & Permissions', 'भूमिका र अनुमति') },
      sys_settings: { group: t('System', 'प्रणाली'), item: t('Site Settings', 'साइट सेटिङ') },
      sys_audit: { group: t('System', 'प्रणाली'), item: t('Audit Logs', 'अडिट लग') },
      account_profile: { group: t('Account', 'खाता'), item: t('Profile', 'प्रोफाइल') }
    };
    return map[id] || { group: '', item: id };
  };

  const breadcrumb = getTabBreadcrumb(activeTab);

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 select-none">
      {/* Left side: Mobile Toggle & Simple Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {isSuperAdmin ? 'Superadmin' : 'Admin Panel'}
          </span>
          {breadcrumb.group && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                {breadcrumb.group}
              </span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400 truncate">
            {breadcrumb.item}
          </span>
        </div>
      </div>

      {/* Right side: Operational Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Authoritative DB Status */}
        <div
          title={t('Connected to authoritative CMS backend storage', 'केन्द्रीकृत डाटाबेससँग जोडिएको')}
          className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DB Synced</span>
        </div>

        {/* Session Timeout Countdown */}
        <div
          title={t('Time remaining before session lock expires', 'सत्र समाप्त हुन बाँकी समय')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-200"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatTimer(remainingSeconds)}</span>
        </div>

        {/* Language Switcher */}
        {onToggleLang && (
          <button
            type="button"
            onClick={onToggleLang}
            title={isNp ? 'Switch to English' : 'नेपालीमा हेर्नुहोस्'}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{isNp ? 'EN' : 'नेपाली'}</span>
          </button>
        )}

        {/* Theme Mode Switcher */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>
        )}

        {/* View Public Site */}
        <button
          type="button"
          onClick={onNavigateHome}
          title={t('Open public school portal', 'सार्वजनिक वेबसाइट खोल्नुहोस्')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('View Site', 'वेबसाइट')}</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          title={t('End session and logout', 'सत्र समाप्त गरी बाहिरिनुहोस्')}
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
