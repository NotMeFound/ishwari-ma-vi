import React, { useState } from 'react';
import { Language, SiteCustomizerConfig } from '../../types';
import {
  Eye,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Bell,
  BarChart3,
  Layers,
  Layout
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface SiteCustomizerTabProps {
  lang: Language;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  onShowToast: (msg: string) => void;
}

export const SiteCustomizerTab: React.FC<SiteCustomizerTabProps> = ({
  lang,
  siteConfig,
  onUpdateSiteConfig,
  onShowToast,
}) => {
  // Default fixed institutional dim navy (#1E3A8A)
  const [form, setForm] = useState<SiteCustomizerConfig>({
    ...siteConfig,
    primaryColor: '#1E3A8A',
    primaryColorName: 'Academic Navy',
  });
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

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
    variant: 'warning',
    action: () => {}
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Confirm Configuration Update', 'सेटिङ अद्यावधिक पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to apply and save these website customization changes across the portal?', 'के तपाईं वेबसाइटको रूपरेखा र सामग्रीका नयाँ सेटिङहरू सुरक्षित गर्न चाहनुहुन्छ?'),
      itemName: t('Site Layout & Appearance Settings', 'वेबसाइट बनावट तथा प्रदर्शन सेटिङ'),
      confirmText: t('Save Configuration', 'सेटिङ सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(form);
        onShowToast(t('Site content and customizer settings saved successfully!', 'वेबसाइटको रूपरेखा र सामग्रीहरू सुरक्षित गरियो!'));
      }
    });
  };

  const handleReset = () => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Customizer Reset', 'डिफल्ट सेटिङ रिसेट पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to reset all site customization parameters back to defaults?', 'के तपाईं वेबसाइट सेटिङहरू डिफल्टमा फर्काउन चाहनुहुन्छ?'),
      itemName: t('Customizer Settings', 'कस्टमाइजर सेटिङ'),
      confirmText: t('Reset to Defaults', 'डिफल्टमा फर्काउनुहोस्'),
      action: () => {
        const resetConfig: SiteCustomizerConfig = {
          ...siteConfig,
          primaryColor: '#1E3A8A',
          primaryColorName: 'Academic Navy',
        };
        setForm(resetConfig);
        onUpdateSiteConfig(resetConfig);
        onShowToast(t('Reset to default settings.', 'डिफल्ट सेटिङहरूमा फिर्ता गरियो।'));
      }
    });
  };

  const toggleSection = (key: keyof SiteCustomizerConfig['sectionVisibility']) => {
    setForm(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [key]: !prev.sectionVisibility[key]
      }
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 relative">
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
      {/* 1. TOP ANNOUNCEMENT TICKER CUSTOMIZER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1E40AF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Top Header Alert Ticker', 'शीर्ष सूचना पट्टी (Alert Ticker)')}
            </h3>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.showAlertTicker}
              onChange={(e) => setForm(prev => ({ ...prev, showAlertTicker: e.target.checked }))}
              className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
            />
            <span>{t('Display Ticker on Public Website', 'वेबसाइटमा सूचना पट्टी देखाउनुहोस्')}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Ticker Text (English)', 'सूचना पाठ (अंग्रेजी)')}
            </label>
            <input
              type="text"
              value={form.alertTickerEn}
              onChange={(e) => setForm(prev => ({ ...prev, alertTickerEn: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Ticker Text (Nepali)', 'सूचना पाठ (नेपाली)')}
            </label>
            <input
              type="text"
              value={form.alertTickerNp}
              onChange={(e) => setForm(prev => ({ ...prev, alertTickerNp: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. HERO BANNER COPY CUSTOMIZER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <Sparkles className="w-4 h-4 text-[#1E40AF]" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('Hero Section Headline & Messaging', 'गृहपृष्ठ मुख्य ब्यानर (Hero Section)')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Badge Pill Text (English)', 'ब्याड्ज पाठ (अंग्रेजी)')}
            </label>
            <input
              type="text"
              value={form.heroBadgeEn}
              onChange={(e) => setForm(prev => ({ ...prev, heroBadgeEn: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Badge Pill Text (Nepali)', 'ब्याड्ज पाठ (नेपाली)')}
            </label>
            <input
              type="text"
              value={form.heroBadgeNp}
              onChange={(e) => setForm(prev => ({ ...prev, heroBadgeNp: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Main Headline (English)', 'मुख्य शीर्षक (अंग्रेजी)')}
            </label>
            <input
              type="text"
              value={form.heroTitleEn}
              onChange={(e) => setForm(prev => ({ ...prev, heroTitleEn: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Main Headline (Nepali)', 'मुख्य शीर्षक (नेपाली)')}
            </label>
            <input
              type="text"
              value={form.heroTitleNp}
              onChange={(e) => setForm(prev => ({ ...prev, heroTitleNp: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Subtitle / Mission Statement (English)', 'उपशीर्षक / ध्येय (अंग्रेजी)')}
            </label>
            <textarea
              rows={2}
              value={form.heroSubtitleEn}
              onChange={(e) => setForm(prev => ({ ...prev, heroSubtitleEn: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Subtitle / Mission Statement (Nepali)', 'उपशीर्षक / ध्येय (नेपाली)')}
            </label>
            <textarea
              rows={2}
              value={form.heroSubtitleNp}
              onChange={(e) => setForm(prev => ({ ...prev, heroSubtitleNp: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. KEY METRICS & STATS NUMBERS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <BarChart3 className="w-4 h-4 text-[#1E40AF]" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('Key Institutional Metrics & Statistics', 'विद्यालयका मुख्य तथ्याङ्क तथा सूचकहरू')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Students Count', 'विद्यार्थी संख्या')}</label>
            <input
              type="text"
              value={form.stats.students}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, students: e.target.value } }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              value={form.stats.studentsLabelEn}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, studentsLabelEn: e.target.value } }))}
              placeholder="Label (EN)"
              className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Teachers & Staff', 'शिक्षक/कर्मचारी')}</label>
            <input
              type="text"
              value={form.stats.staff}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, staff: e.target.value } }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              value={form.stats.staffLabelEn}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, staffLabelEn: e.target.value } }))}
              placeholder="Label (EN)"
              className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Years in Service', 'सेवाको वर्ष')}</label>
            <input
              type="text"
              value={form.stats.years}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, years: e.target.value } }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              value={form.stats.yearsLabelEn}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, yearsLabelEn: e.target.value } }))}
              placeholder="Label (EN)"
              className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Pass Success Rate', 'सफलता प्रतिशत')}</label>
            <input
              type="text"
              value={form.stats.successRate}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, successRate: e.target.value } }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              value={form.stats.successLabelEn}
              onChange={(e) => setForm(prev => ({ ...prev, stats: { ...prev.stats, successLabelEn: e.target.value } }))}
              placeholder="Label (EN)"
              className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 5. HOMEPAGE SECTION VISIBILITY CONTROLLER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <Layout className="w-4 h-4 text-[#1E40AF]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Homepage Section Visibility & Toggles', 'गृहपृष्ठ सेक्सन नियन्त्रण')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Turn individual modules on or off across the public homepage.', 'गृहपृष्ठमा कुनै पनि सेक्सन सक्रिय वा निष्क्रिय गर्नुहोस्।')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { key: 'hero' as const, label: 'Hero Banner' },
            { key: 'stats' as const, label: 'Metrics Bar' },
            { key: 'notices' as const, label: 'Circulars Panel' },
            { key: 'principal' as const, label: 'Principal Desk' },
            { key: 'facilities' as const, label: 'Facilities Grid' },
            { key: 'academics' as const, label: 'Academics Stream' },
            { key: 'events' as const, label: 'Events Calendar' },
            { key: 'achievements' as const, label: 'Achievements' },
            { key: 'history' as const, label: 'School History' },
            { key: 'documents' as const, label: 'Downloads' },
            { key: 'gallery' as const, label: 'Photo Gallery' },
            { key: 'contact' as const, label: 'Contact Desk' },
          ].map(sec => {
            const isVisible = form.sectionVisibility[sec.key];
            return (
              <button
                type="button"
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isVisible
                    ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold">{sec.label}</span>
                <span className={`w-2 h-2 rounded-full ${isVisible ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Reset Defaults', 'डिफल्टमा फर्काउनुहोस्')}</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#1E40AF]/25 transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t('Save All Customizer Settings', 'सबै परिवर्तन सुरक्षित गर्नुहोस्')}</span>
        </button>
      </div>
    </form>
  );
};
