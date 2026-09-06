import React, { useState } from 'react';
import { Language, SchoolData, Notice, Facility, StaffMember, SiteCustomizerConfig } from '../types';
import { initialSiteConfig } from '../data/schoolData';
import {
  GraduationCap,
  Users,
  Award,
  Calendar,
  Bell,
  Download,
  ChevronRight,
  ShieldCheck,
  Building2,
  BookOpen,
  Sparkles,
  ArrowRight,
  Microscope,
  Monitor,
  Library,
  Trophy,
  FileText,
  PhoneCall,
  CheckCircle2,
  X
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface HomeViewProps {
  lang: Language;
  school: SchoolData;
  notices: Notice[];
  facilities: Facility[];
  staff: StaffMember[];
  siteConfig?: SiteCustomizerConfig;
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  school,
  notices,
  facilities,
  staff,
  siteConfig = initialSiteConfig,
  onNavigate,
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [pendingDownloadNotice, setPendingDownloadNotice] = useState<Notice | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const config = siteConfig || initialSiteConfig;
  const visibility = config?.sectionVisibility || initialSiteConfig.sectionVisibility;
  const stats = config?.stats || initialSiteConfig.stats;

  const pinnedNotices = notices.filter(n => n.pinned);

  const handleDownloadNotice = (notice: Notice) => {
    // Generate text blob for institutional circular download
    const content = `ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Public Circular Document
Date: ${notice.date_en} (${notice.date_np})
Category: ${notice.category.toUpperCase()}

Title: ${notice.title_en}
शीर्षक: ${notice.title_np}

Description:
${notice.description_en}

विवरण:
${notice.description_np}

--------------------------------------------------
Ishwari Secondary School Administrative Authority
Affiliation: National Examination Board (NEB) Nepal
Website: Official Institutional Web Portal
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = notice.file_name.endsWith('.pdf') ? notice.file_name.replace('.pdf', '.txt') : `${notice.file_name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(t(`Downloaded ${notice.file_name}`, `${notice.file_name} डाउनलोड भयो`));
    setTimeout(() => setDownloadSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Toast Feedback Notification */}
      {downloadSuccessMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white border border-blue-600 shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Notice Download Confirmation Modal */}
      {pendingDownloadNotice && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingDownloadNotice(null)}
          onConfirm={() => executeDownloadNotice(pendingDownloadNotice)}
          variant="download"
          title={t('Confirm Notice Download', 'सूचना डाउनलोड पुष्टि गर्नुहोस्')}
          description={t(
            'Do you want to download this verified institutional notice circular to your device?',
            'के तपाईं यो आधिकारिक विद्यालय सूचना आफ्नो उपकरणमा डाउनलोड गर्न चाहनुहुन्छ?'
          )}
          itemName={`${t(pendingDownloadNotice.title_en, pendingDownloadNotice.title_np)} (${pendingDownloadNotice.file_name})`}
          confirmText={t('Download Circular', 'सूचना डाउनलोड गर्नुहोस्')}
          cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        />
      )}

      {/* Notice Preview Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E40AF] text-white uppercase">
                  {selectedNotice.category}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {t(selectedNotice.date_en, selectedNotice.date_np)}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t(selectedNotice.title_en, selectedNotice.title_np)}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t(selectedNotice.description_en, selectedNotice.description_np)}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] text-slate-400 truncate">{selectedNotice.file_name}</span>
              <button
                type="button"
                onClick={() => {
                  setPendingDownloadNotice(selectedNotice);
                  setSelectedNotice(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('Download Circular', 'सूचना डाउनलोड')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO INSTITUTIONAL BANNER */}
      {(visibility.hero ?? true) && (
        <section className="relative bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800 overflow-hidden">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E40AF]/25 text-blue-300 border border-[#1E40AF]/40 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{t(config.heroBadgeEn || initialSiteConfig.heroBadgeEn, config.heroBadgeNp || initialSiteConfig.heroBadgeNp)}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
              {t(config.heroTitleEn || initialSiteConfig.heroTitleEn, config.heroTitleNp || initialSiteConfig.heroTitleNp)}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {t(config.heroSubtitleEn || initialSiteConfig.heroSubtitleEn, config.heroSubtitleNp || initialSiteConfig.heroSubtitleNp)}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('academics')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#1E40AF]/30 transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t('Explore Academic Programs', 'शैक्षिक कार्यक्रमहरू')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('notices')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('Public Circulars & Notices', 'ताजा सार्वजनिक सूचना')}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. INSTITUTIONAL METRICS */}
      {(visibility.stats ?? true) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">{stats.students}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(stats.studentsLabelEn, stats.studentsLabelNp)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('ECD to Grade 12', 'शिशुदेखि कक्षा १२ सम्म')}</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">{stats.staff}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(stats.staffLabelEn, stats.staffLabelNp)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('Certified Educators', 'दक्ष तथा तालिमप्राप्त')}</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">{stats.years}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(stats.yearsLabelEn, stats.yearsLabelNp)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t(`Estd. ${school.estd_bs}`, `वि.सं. ${school.estd_bs} मा स्थापित`)}</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
              <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">{stats.successRate}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(stats.successLabelEn, stats.successLabelNp)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('District Board Topper', 'जिल्ला प्रथम नतिजा')}</p>
            </div>
          </div>
        </section>
      )}

      {/* 3. INTERACTIVE QUICK ACCESS INSTITUTIONAL SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
            <span>{t('Direct Student & Parent Services', 'विद्यार्थी तथा अभिभावक सेवाहरू')}</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'academics', icon: BookOpen, en: 'Admission 2083', np: 'भर्ना २०८३' },
            { id: 'notices', icon: Calendar, en: 'Exam Routine', np: 'परीक्षा तालिका' },
            { id: 'documents', icon: FileText, en: 'Citizen Charter', np: 'नागरिक वडापत्र' },
            { id: 'staff', icon: Users, en: 'Faculty Members', np: 'शिक्षक विवरण' },
            { id: 'facilities', icon: Building2, en: 'STEM Labs', np: 'प्रयोगशाला' },
            { id: 'contact', icon: PhoneCall, en: 'Helpdesk', np: 'सोधपुछ केन्द्र' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#1E40AF] dark:hover:border-blue-500 hover:shadow-xs transition-all duration-150 flex flex-col items-center text-center gap-2 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 group-hover:bg-[#1E40AF] group-hover:text-white transition-colors flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                  {t(item.en, item.np)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. URGENT CIRCULARS PANEL */}
      {(visibility.notices ?? true) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('Official Circulars & Announcements', 'आधिकारिक सूचना तथा परिपत्रहरू')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('View All Notices', 'सबै सूचना हेर्नुहोस्')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-6 rounded-xl border border-[#1E40AF]/25 bg-blue-50/40 dark:bg-slate-900/90 space-y-3 relative shadow-2xs hover:border-[#1E40AF]/60 transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#1E40AF] text-white font-bold uppercase tracking-wider text-[10px]">
                    {t('PINNED CIRCULAR', 'मुख्य सूचना')}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#1E40AF] dark:text-blue-400" />
                    <span>{t(notice.date_en, notice.date_np)}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(notice.title_en, notice.title_np)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {t(notice.description_en, notice.description_np)}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="font-bold text-[#1E40AF] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('View Details', 'विस्तृत विवरण')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDownloadNotice(notice)}
                    className="font-bold text-slate-700 dark:text-slate-300 hover:text-[#1E40AF] dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('Download', 'डाउनलोड')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PRINCIPAL'S MESSAGE & LEADERSHIP */}
      {(visibility.principal ?? true) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center space-y-3">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-blue-50 dark:bg-slate-800 border-2 border-[#1E40AF] text-[#1E40AF] dark:text-blue-400 flex items-center justify-center text-4xl shadow-sm">
                <GraduationCap className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(school.principal_name_en, school.principal_name_np)}
                </h3>
                <p className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400">
                  {t('Headmaster / Principal (M.Ed, M.A.)', 'प्रधानाध्यापक')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(school.name_en, school.name_np)}
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("Principal's Institutional Address", 'प्रधानाध्यापकको सन्देश')}</span>
              </div>
              <p className="italic text-base sm:text-lg text-slate-900 dark:text-slate-100 font-serif leading-relaxed">
                "{t(school.principal_message_en, school.principal_message_np)}"
              </p>
              <p>
                {t(
                  'Our focus remains deeply rooted in experiential learning, digital pedagogy, moral character building, and equal opportunity for every child.',
                  'हाम्रो मुख्य उद्देश्य विद्यार्थीहरूलाई सैद्धान्तिक ज्ञानका साथै व्यावहारिक सीप, नैतिक आचरण र प्रतिस्पर्धी क्षमता प्रदान गर्नु हो।'
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. MODEL INFRASTRUCTURE HIGHLIGHTS */}
      {(visibility.facilities ?? true) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('Model School Infrastructure & Facilities', 'नमुना विद्यालयका भौतिक पूर्वाधारहरू')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('facilities')}
              className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('View All Facilities', 'सबै पूर्वाधार हेर्नुहोस्')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.slice(0, 4).map((f) => (
              <div
                key={f.id}
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF] dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center font-bold">
                  {f.id === 1 ? <Microscope className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                   f.id === 2 ? <Monitor className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                   f.id === 3 ? <Library className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                   <Trophy className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t(f.title_en, f.title_np)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {t(f.desc_en, f.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

