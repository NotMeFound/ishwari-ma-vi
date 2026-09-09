import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  SiteCustomizerConfig
} from '../../types';
import {
  Building2,
  Layout,
  PanelTop,
  Menu as MenuIcon,
  PanelBottom,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Bell,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { HeroBackgroundManager } from '../../components/admin/HeroBackgroundManager';
import { AdminNavTabId } from './AdminSidebar';

interface AdminWebsiteTabProps {
  lang: Language;
  activeSubTab: 'website_identity' | 'website_homepage' | 'website_header' | 'website_navigation' | 'website_footer';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  onShowToast: (msg: string) => void;
}

export const AdminWebsiteTab: React.FC<AdminWebsiteTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  siteConfig,
  onUpdateSiteConfig,
  onShowToast
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...school });
  const [siteForm, setSiteForm] = useState<SiteCustomizerConfig>({ ...siteConfig });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    confirmText: string;
    variant: ConfirmationVariant;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirm',
    variant: 'update',
    action: () => {}
  });

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Site Identity', 'वेबसाइट पहिचान सुरक्षित गर्नुहोस्'),
      description: t('Apply school name, motto, code and logo changes to the public portal?', 'विद्यालयको नाम, आदर्श वाक्य, कोड तथा लोगोका परिवर्तनहरू लागू गर्न चाहनुहुन्छ?'),
      itemName: t('Site Identity Configuration', 'वेबसाइट पहिचान सेटिङ'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSchool(schoolForm);
        onShowToast(t('Site identity updated successfully!', 'विद्यालय पहिचान सफलतापूर्वक अद्यावधिक गरियो!'));
      }
    });
  };

  const handleSaveHomepage = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Homepage Configuration', 'गृहपृष्ठ सेटिङ सुरक्षित गर्नुहोस्'),
      description: t('Apply headline, hero background, and section visibility changes to the public homepage?', 'गृहपृष्ठको ब्यानर, पृष्ठभूमि र सेक्सन भिजिबिलिटी लागू गर्न चाहनुहुन्छ?'),
      itemName: t('Homepage Configuration', 'गृहपृष्ठ बनावट'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onUpdateSchool(schoolForm);
        onShowToast(t('Homepage settings saved successfully!', 'गृहपृष्ठ सेटिङ सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Header Settings', 'हेडर सेटिङ सुरक्षित गर्नुहोस्'),
      description: t('Update the top announcement ticker and header contact information?', 'शीर्ष सूचना पट्टी र हेडर सम्पर्क विवरण अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t('Header & Announcement Ticker', 'हेडर तथा सूचना पट्टी'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onUpdateSchool(schoolForm);
        onShowToast(t('Header settings updated successfully!', 'हेडर सेटिङ सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Footer Settings', 'फुटर सेटिङ सुरक्षित गर्नुहोस्'),
      description: t('Update the institutional footer description, copyright, and accreditation details?', 'फुटर विवरण, प्रतिलिपि अधिकार र मान्यता विवरण अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t('Footer Configuration', 'फुटर सेटिङ'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onShowToast(t('Footer configuration saved successfully!', 'फुटर विवरण सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      onShowToast(t('Logo image must be under 800KB', 'लोगो फाइल ८००KB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSchoolForm(prev => ({ ...prev, logo_url: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      onShowToast(t('Background image must be under 1.5MB', 'पृष्ठभूमि फाइल १.५MB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSchoolForm(prev => ({ ...prev, home_bg_image: dataUrl, home_bg_enabled: true }));
      setSiteForm(prev => ({ ...prev, heroBackgroundImage: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const toggleSection = (key: keyof SiteCustomizerConfig['sectionVisibility']) => {
    setSiteForm(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [key]: !prev.sectionVisibility[key]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        variant={confirmState.variant}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
      />

      {/* 1. SITE IDENTITY SUB-TAB */}
      {activeSubTab === 'website_identity' && (
        <form onSubmit={handleSaveIdentity} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Site Identity & Institutional Branding', 'वेबसाइट पहिचान तथा संस्थागत ब्रान्डिङ')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure school name, official motto, EMIS identification code, and emblem', 'विद्यालयको आधिकारिक नाम, नारा, कोड र लोगो व्यवस्थापन')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Identity', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (English) *', 'विद्यालयको नाम (अंग्रेजी) *')}
              </label>
              <input
                type="text"
                required
                value={schoolForm.name_en}
                onChange={e => setSchoolForm({ ...schoolForm, name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (Nepali) *', 'विद्यालयको नाम (नेपाली) *')}
              </label>
              <input
                type="text"
                required
                value={schoolForm.name_np}
                onChange={e => setSchoolForm({ ...schoolForm, name_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Motto / Tagline (English)', 'आदर्श वाक्य / नारा (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={schoolForm.tagline_en}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Motto / Tagline (Nepali)', 'आदर्श वाक्य / नारा (नेपाली)')}
              </label>
              <input
                type="text"
                value={schoolForm.tagline_np}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('EMIS Identification Code', 'आधिकारिक EMIS कोड')}
              </label>
              <input
                type="text"
                value={schoolForm.code}
                onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Affiliation / Accreditation', 'सम्बन्धन / मान्यता')}
              </label>
              <input
                type="text"
                value={schoolForm.affiliation_en}
                onChange={e => setSchoolForm({ ...schoolForm, affiliation_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            {/* Official Logo Upload */}
            <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {schoolForm.logo_url ? (
                  <img src={schoolForm.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('Official Institutional Emblem / Crest', 'विद्यालयको आधिकारिक लोगो')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t('Upload PNG or JPG format (Square recommended, max 800KB)', 'PNG वा JPG ढाँचा (अधिकतम ८००KB)')}
                </div>
                <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('Upload Logo', 'लोगो अपलोड')}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {schoolForm.logo_url && (
                    <button
                      type="button"
                      onClick={() => setSchoolForm(prev => ({ ...prev, logo_url: '' }))}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      {t('Remove', 'हटाउनुहोस्')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 2. HOMEPAGE SUB-TAB */}
      {activeSubTab === 'website_homepage' && (
        <form onSubmit={handleSaveHomepage} className="space-y-6">
          {/* Hero Section Copy */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Hero Section Headline & Messaging', 'गृहपृष्ठ मुख्य ब्यानर (Hero Section)')}</span>
                </h3>
                <p className="text-xs text-slate-500">{t('Customize primary welcoming copy and calls to action', 'मुख्य शीर्षक र उपशीर्षक व्यवस्थापन')}</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Homepage', 'सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Badge Pill Text (English)', 'ब्याड्ज पाठ (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={siteForm.heroBadgeEn}
                  onChange={e => setSiteForm({ ...siteForm, heroBadgeEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Badge Pill Text (Nepali)', 'ब्याड्ज पाठ (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={siteForm.heroBadgeNp}
                  onChange={e => setSiteForm({ ...siteForm, heroBadgeNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Main Headline (English) *', 'मुख्य शीर्षक (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={siteForm.heroTitleEn}
                  onChange={e => setSiteForm({ ...siteForm, heroTitleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Main Headline (Nepali) *', 'मुख्य शीर्षक (नेपाली) *')}
                </label>
                <input
                  type="text"
                  required
                  value={siteForm.heroTitleNp}
                  onChange={e => setSiteForm({ ...siteForm, heroTitleNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Subtitle / Mission Description (English)', 'उपशीर्षक / ध्येय (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitleEn}
                  onChange={e => setSiteForm({ ...siteForm, heroSubtitleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Subtitle / Mission Description (Nepali)', 'उपशीर्षक / ध्येय (नेपाली)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitleNp}
                  onChange={e => setSiteForm({ ...siteForm, heroSubtitleNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* DEDICATED HOMEPAGE HERO BACKGROUND MANAGEMENT */}
          <HeroBackgroundManager
            lang={lang}
            siteConfig={siteConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            onShowToast={onShowToast}
          />

          {/* Section Visibility Toggles */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('Homepage Section Visibility Controls', 'गृहपृष्ठ सेक्सन प्रदर्शन नियन्त्रण')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'hero' as const, label: t('Hero Banner', 'मुख्य ब्यानर') },
                { key: 'notices' as const, label: t('Pinned Circulars & Notices', 'सूचना तथा परिपत्र') },
                { key: 'stats' as const, label: t('Statistics Counters', 'तथ्याङ्क सूचक') },
                { key: 'academics' as const, label: t('Academic Programs', 'शैक्षिक कार्यक्रम') },
                { key: 'principal' as const, label: t("Principal's Desk Message", 'प्रधानाध्यापकको सन्देश') },
                { key: 'facilities' as const, label: t('Laboratories & Facilities', 'पूर्वाधार र प्रयोगशाला') },
                { key: 'events' as const, label: t('Upcoming Events & Routines', 'कार्यक्रम तथा तालिका') },
                { key: 'achievements' as const, label: t('Honors & Achievements', 'उपलब्धि र सम्मान') },
                { key: 'history' as const, label: t('Historical Milestones', 'इतिहासका कोसेढुङ्गा') },
                { key: 'documents' as const, label: t('Official Documents & Forms', 'दस्तावेज तथा फारम') },
                { key: 'gallery' as const, label: t('Photo Gallery Preview', 'फोटो ग्यालरी') },
                { key: 'community' as const, label: t('Community & SMC', 'समुदाय तथा विव्यस') },
                { key: 'contact' as const, label: t('Contact & Location Map', 'सम्पर्क र नक्सा') }
              ].map(sec => (
                <label
                  key={sec.key}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    siteForm.sectionVisibility[sec.key]
                      ? 'border-[#1E40AF]/40 bg-blue-50/40 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold">{sec.label}</span>
                  <input
                    type="checkbox"
                    checked={siteForm.sectionVisibility[sec.key]}
                    onChange={() => toggleSection(sec.key)}
                    className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                  />
                </label>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* 3. HEADER SUB-TAB */}
      {activeSubTab === 'website_header' && (
        <form onSubmit={handleSaveHeader} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PanelTop className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Top Header Alert Ticker & Topbar Details', 'शीर्ष सूचना पट्टी र हेडर सम्पर्क')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure the public emergency marquee and topbar phone/email details', 'आपतकालीन सूचना पट्टी र माथिल्लो सम्पर्क विवरण')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Header', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Ticker Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Display Alert Ticker on Public Portal', 'वेबसाइटको शीर्ष भागमा सूचना पट्टी देखाउनुहोस्')}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('Displays urgent announcements, admissions, or weather closures at the very top of the website', 'अत्यन्त जरुरी सूचना, भर्ना वा बिदा सम्बन्धी जानकारी शीर्ष पट्टीमा प्रदर्शन गर्दछ')}
                </p>
              </div>
              <input
                type="checkbox"
                checked={siteForm.showAlertTicker}
                onChange={e => setSiteForm({ ...siteForm, showAlertTicker: e.target.checked })}
                className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Ticker Text (English)', 'सूचना पट्टी पाठ (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={siteForm.alertTickerEn}
                  onChange={e => setSiteForm({ ...siteForm, alertTickerEn: e.target.value })}
                  placeholder="e.g., Admissions open for Class 11 Science & Management 2083"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Ticker Text (Nepali)', 'सूचना पट्टी पाठ (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={siteForm.alertTickerNp}
                  onChange={e => setSiteForm({ ...siteForm, alertTickerNp: e.target.value })}
                  placeholder="जस्तै: कक्षा ११ विज्ञान तथा व्यवस्थापन संकायमा नयाँ भर्ना खुल्यो।"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('Header Contact Phone', 'सम्पर्क फोन नम्बर')}</span>
                </label>
                <input
                  type="text"
                  value={schoolForm.phone}
                  onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('Header Official Email', 'आधिकारिक इमेल')}</span>
                </label>
                <input
                  type="email"
                  value={schoolForm.email}
                  onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. NAVIGATION SUB-TAB */}
      {activeSubTab === 'website_navigation' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MenuIcon className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Public Navigation Bar Structure', 'वेबसाइटको मुख्य मेनु (Navigation)')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Standard institutional navigation bar items visible to students and public visitors', 'सार्वजनिक पोर्टलमा देखिने मुख्य मेनु लिङ्कहरू')}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { id: 'home', labelEn: 'Home', labelNp: 'गृहपृष्ठ', path: '/' },
              { id: 'about', labelEn: 'About Us', labelNp: 'हाम्रो बारेमा', path: '/about' },
              { id: 'notices', labelEn: 'Notices', labelNp: 'सूचनाहरू', path: '/notices' },
              { id: 'academics', labelEn: 'Academics', labelNp: 'शैक्षिक कार्यक्रम', path: '/academics' },
              { id: 'staff', labelEn: 'Faculty & Staff', labelNp: 'शिक्षक तथा कर्मचारी', path: '/staff' },
              { id: 'governance', labelEn: 'Governance (SMC)', labelNp: 'व्यवस्थापन समिति', path: '/governance' },
              { id: 'documents', labelEn: 'Downloads & Charter', labelNp: 'दस्तावेज तथा फारम', path: '/documents' },
              { id: 'gallery', labelEn: 'Gallery', labelNp: 'ग्यालरी', path: '/gallery' },
              { id: 'contact', labelEn: 'Contact', labelNp: 'सम्पर्क', path: '/contact' }
            ].map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t(item.labelEn, item.labelNp)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Target Anchor: {item.path}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FOOTER SUB-TAB */}
      {activeSubTab === 'website_footer' && (
        <form onSubmit={handleSaveFooter} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PanelBottom className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Footer Copy, Accreditation & Copyright', 'फुटर विवरण, सम्बन्धन र प्रतिलिपि अधिकार')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure institutional footer narrative and legal copyright lines', 'फुटरमा देखिने संस्थागत परिचय र कानुनी विवरण')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Footer', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Footer Description (English)', 'फुटर संस्थागत परिचय (अंग्रेजी)')}
              </label>
              <textarea
                rows={3}
                value={siteForm.footerDescEn}
                onChange={e => setSiteForm({ ...siteForm, footerDescEn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Footer Description (Nepali)', 'फुटर संस्थागत परिचय (नेपाली)')}
              </label>
              <textarea
                rows={3}
                value={siteForm.footerDescNp}
                onChange={e => setSiteForm({ ...siteForm, footerDescNp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Copyright Line (English)', 'प्रतिलिपि अधिकार (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={siteForm.copyrightTextEn}
                onChange={e => setSiteForm({ ...siteForm, copyrightTextEn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Copyright Line (Nepali)', 'प्रतिलिपि अधिकार (नेपाली)')}
              </label>
              <input
                type="text"
                value={siteForm.copyrightTextNp}
                onChange={e => setSiteForm({ ...siteForm, copyrightTextNp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
