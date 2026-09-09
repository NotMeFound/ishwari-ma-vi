import React from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  DocumentItem,
  ContactMessage,
  GalleryItem,
  AdminRole
} from '../../types';
import {
  Bell,
  FileDown,
  Users,
  UserCheck,
  Mail,
  Image as ImageIcon,
  ShieldCheck,
  Building2,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Pin
} from 'lucide-react';
import { AdminNavTabId } from './AdminSidebar';

interface AdminDashboardTabProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername: string;
  school: SchoolData;
  notices: Notice[];
  documents: DocumentItem[];
  staff: StaffMember[];
  messages: ContactMessage[];
  gallery: GalleryItem[];
  adminCount: number;
  onNavigateTab: (tabId: AdminNavTabId) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  lang,
  currentRole,
  currentUsername,
  school,
  notices,
  documents,
  staff,
  messages,
  gallery,
  adminCount,
  onNavigateTab
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const smcMembers = staff.filter(s => s.role === 'smc_chair' || s.role === 'smc_member');
  const teachersCount = staff.filter(s => s.role === 'teacher').length;
  const unreadMessages = messages.filter(m => m.status === 'new').length;
  const pinnedNotices = notices.filter(n => n.pinned).length;

  const statCards = [
    {
      labelEn: 'Published Notices',
      labelNp: 'प्रकाशित सूचनाहरू',
      value: notices.length,
      subtext: `${pinnedNotices} ${t('pinned to homepage', 'गृहपृष्ठमा पिन')}`,
      icon: Bell,
      tabId: 'content_notices' as AdminNavTabId,
      actionText: t('Manage Notices', 'सूचना व्यवस्थापन')
    },
    {
      labelEn: 'Official Documents',
      labelNp: 'दस्तावेज तथा फारम',
      value: documents.length,
      subtext: t('Charter & Downloadables', 'बडापत्र र फारमहरू'),
      icon: FileDown,
      tabId: 'content_documents' as AdminNavTabId,
      actionText: t('Manage Documents', 'दस्तावेज व्यवस्थापन')
    },
    {
      labelEn: 'Faculty & Staff',
      labelNp: 'शिक्षक तथा कर्मचारी',
      value: staff.length,
      subtext: `${teachersCount} ${t('teaching coordinators', 'शिक्षकहरू')}`,
      icon: Users,
      tabId: 'gov_staff' as AdminNavTabId,
      actionText: t('Manage Staff', 'कर्मचारी व्यवस्थापन')
    },
    {
      labelEn: 'SMC Members',
      labelNp: 'वि.व्य.स. सदस्यहरू',
      value: smcMembers.length,
      subtext: t('Management committee', 'व्यवस्थापन समिति'),
      icon: UserCheck,
      tabId: 'gov_smc' as AdminNavTabId,
      actionText: t('View Committee', 'समिति हेर्नुहोस्')
    },
    {
      labelEn: 'Contact Inquiries',
      labelNp: 'सोधपुछ तथा सन्देश',
      value: messages.length,
      subtext: unreadMessages > 0 ? `${unreadMessages} ${t('new unread', 'नयाँ अपठित')}` : t('All reviewed', 'सबै समीक्षा गरियो'),
      icon: Mail,
      tabId: 'comm_contact' as AdminNavTabId,
      actionText: t('Open Inbox', 'इनबक्स खोल्नुहोस्')
    },
    {
      labelEn: 'Photo Gallery',
      labelNp: 'फोटो ग्यालरी',
      value: gallery.length,
      subtext: t('Campus & events photos', 'तस्वीर तथा कार्यक्रम'),
      icon: ImageIcon,
      tabId: 'media_gallery' as AdminNavTabId,
      actionText: t('Manage Gallery', 'ग्यालरी व्यवस्थापन')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E40AF]" />
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {t(school.name_en, school.name_np)}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t(school.tagline_en, school.tagline_np)} • {school.code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('Central Database Active', 'केन्द्रीकृत डाटाबेस सक्रिय')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t(card.labelEn, card.labelNp)}
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {card.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {card.subtext}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab(card.tabId)}
                className="inline-flex items-center justify-between text-xs font-semibold text-[#1E40AF] dark:text-blue-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
              >
                <span>{card.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {t('Quick Actions', 'द्रुत कार्यहरू')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('content_notices')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <Bell className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('New Notice', 'सूचना जारी')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Upload circular', 'परिपत्र थप्नुहोस्')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('content_documents')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <FileDown className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('New Document', 'दस्तावेज थप')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Charter & forms', 'बडापत्र र फारम')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('gov_staff')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <Users className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('Faculty / Staff', 'कर्मचारी सूची')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Add faculty member', 'नयाँ शिक्षक थप्नुहोस्')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('media_gallery')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <ImageIcon className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('Upload Photo', 'तस्वीर थप')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Campus albums', 'एल्बम व्यवस्थापन')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('comm_contact')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <Mail className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('Check Inquiries', 'सोधपुछ हेर्नुहोस्')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Parent messages', 'अभिभावक सन्देश')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('website_identity')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1E40AF] dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left space-y-1.5 transition group"
          >
            <Building2 className="w-4 h-4 text-slate-500 group-hover:text-[#1E40AF]" />
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t('Site Identity', 'विद्यालय पहिचान')}
            </div>
            <div className="text-[10px] text-slate-400">
              {t('Logo & details', 'लोगो र विवरण')}
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Notices & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Recent Notices', 'हालसालै जारी सूचनाहरू')}</span>
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('content_notices')}
              className="text-xs font-semibold text-[#1E40AF] hover:underline"
            >
              {t('View All', 'सबै हेर्नुहोस्')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.slice(0, 4).map((notice) => (
              <div key={notice.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1E40AF] text-white uppercase">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">{t(notice.date_en, notice.date_np)}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white truncate mt-0.5">
                    {t(notice.title_en, notice.title_np)}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                  {notice.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Recent Inquiries', 'हालसालै प्राप्त सोधपुछ')}</span>
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('comm_contact')}
              className="text-xs font-semibold text-[#1E40AF] hover:underline"
            >
              {t('View Inbox', 'इनबक्स खोल्नुहोस्')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                {t('No contact inquiries received yet.', 'हाल कुनै सोधपुछ छैन।')}
              </div>
            ) : (
              messages.slice(0, 4).map((msg) => (
                <div key={msg.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                        msg.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        msg.status === 'reviewed' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {msg.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{msg.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {msg.subject}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{msg.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
