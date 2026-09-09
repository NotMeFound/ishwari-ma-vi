import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  SiteConfig,
  SecurityConfig,
  PermissionKey,
  AdminAccount
} from '../../types';
import {
  Settings,
  Shield,
  Clock,
  Lock,
  Download,
  Upload,
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  Server,
  Key,
  Sliders,
  Flame,
  FileText
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { apiClient } from '../../services/apiClient';
import { HeroBackgroundManager } from '../../components/admin/HeroBackgroundManager';
import { Image as ImageIcon } from 'lucide-react';

interface SiteSettingsTabProps {
  lang: Language;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => Promise<{ success: boolean; error?: string }> | void;
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (config: SiteConfig) => Promise<{ success: boolean; error?: string }> | void;
  securityConfig?: SecurityConfig;
  onUpdateSecurityConfig?: (config: SecurityConfig) => Promise<{ success: boolean; error?: string }> | void;
  currentAccount: AdminAccount;
  onResetFactory?: () => void;
  onRestoreAllData?: (data: any) => Promise<{ success: boolean; error?: string }> | void;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const SiteSettingsTab: React.FC<SiteSettingsTabProps> = ({
  lang,
  school,
  onUpdateSchool,
  siteConfig,
  onUpdateSiteConfig,
  securityConfig,
  onUpdateSecurityConfig,
  currentAccount,
  onResetFactory,
  onRestoreAllData,
  onShowToast,
  can
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const isSuperAdmin = currentAccount.role === 'super_admin';
  const canUpdate = isSuperAdmin || (can && can('settings.update'));

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'hero' | 'security' | 'backup'>('general');

  // General Identity & Operational Settings State
  const [generalForm, setGeneralForm] = useState({
    name_en: school.name_en || 'Shree Ishwari Secondary School',
    name_np: school.name_np || 'श्री ईश्वरी माध्यमिक विद्यालय',
    tagline_en: school.tagline_en || '',
    tagline_np: school.tagline_np || '',
    estd: (school as any).estd || school.estd_bs || '2028 B.S.',
    affiliation_en: school.affiliation_en || '',
    affiliation_np: school.affiliation_np || '',
    school_code: (school as any).school_code || school.code || '650040001',
    timing_en: (school as any).timing_en || '10:00 AM - 4:00 PM (Sunday to Friday)',
    timing_np: (school as any).timing_np || 'बिहान १०:०० देखि दिउँसो ४:०० बजेसम्म (आइतबार–शुक्रबार)',
    emergency_contact: (school as any).emergency_contact || school.phone || ''
  });

  // Security Policy State
  const [securityForm, setSecurityForm] = useState<SecurityConfig>({
    adminUsername: securityConfig?.adminUsername || 'admin',
    adminPasswordHash: securityConfig?.adminPasswordHash || '',
    recoveryPin: securityConfig?.recoveryPin || '9848',
    lockoutThreshold: securityConfig?.lockoutThreshold ?? 5,
    adminRouteSlug: securityConfig?.adminRouteSlug || 'admin-portal',
    hideAdminLinkInHeader: securityConfig?.hideAdminLinkInHeader ?? false,
    sessionTimeoutMinutes: securityConfig?.sessionTimeoutMinutes ?? 30,
    maxFailedAttempts: securityConfig?.maxFailedAttempts ?? 5,
    lockoutDurationMinutes: securityConfig?.lockoutDurationMinutes ?? 15,
    forcePasswordChangePeriodDays: securityConfig?.forcePasswordChangePeriodDays ?? 90,
    maintenanceMode: securityConfig?.maintenanceMode ?? false,
    allowedIPs: securityConfig?.allowedIPs || []
  });

  const [ipInput, setIpInput] = useState('');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Backup & Reset state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

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

  // Save General Identity Form
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) {
      onShowToast(t('Permission denied: You cannot modify site settings.', 'अनुमति छैन: साइट सेटिङ परिवर्तन गर्न मिल्दैन।'));
      return;
    }

    setIsSavingGeneral(true);
    const updatedSchool: SchoolData = {
      ...school,
      ...generalForm
    };

    const res = await onUpdateSchool(updatedSchool);
    setIsSavingGeneral(false);

    if (res && res.success === false) {
      onShowToast(t(`Failed to save settings: ${res.error}`, `सेटिङ सुरक्षित गर्न असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'SITE_SETTINGS_UPDATED',
      module: 'SETTINGS',
      status: 'success',
      details: `General institutional settings updated by @${currentAccount.username}.`
    });

    onShowToast(t('Site settings updated successfully!', 'साइट सेटिङहरू सफलतापूर्वक अद्यावधिक गरियो!'));
  };

  // Save Security Configuration Form
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      onShowToast(t('Super Admin required: Only Super Admin can adjust core security policies.', 'सुपर एडमिन मात्रले सुरक्षा नीति परिवर्तन गर्न पाउँछ।'));
      return;
    }

    setIsSavingSecurity(true);
    if (onUpdateSecurityConfig) {
      const res = await onUpdateSecurityConfig(securityForm);
      if (res && res.success === false) {
        setIsSavingSecurity(false);
        onShowToast(t(`Failed to update security: ${res.error}`, `सुरक्षा नीति अद्यावधिक असफल: ${res.error}`));
        return;
      }
    }

    setIsSavingSecurity(false);
    await apiClient.recordAuditLog({
      action: 'SECURITY_POLICIES_UPDATED',
      module: 'SECURITY',
      status: 'warning',
      details: `Security config updated (Timeout: ${securityForm.sessionTimeoutMinutes}m, Max Attempts: ${securityForm.maxFailedAttempts}, Maintenance: ${securityForm.maintenanceMode}) by @${currentAccount.username}.`
    });

    onShowToast(t('Security policies updated successfully!', 'सुरक्षा नीतिहरू सफलतापूर्वक अद्यावधिक गरियो!'));
  };

  // Export full JSON database snapshot
  const handleExportBackup = async () => {
    try {
      const state = await apiClient.fetchAuthoritativeState();
      if (!state) {
        onShowToast(t('Failed to retrieve current database state.', 'डाटाबेस स्थिति प्राप्त गर्न सकिएन।'));
        return;
      }

      const backupBlob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(backupBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ishwari_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await apiClient.recordAuditLog({
        action: 'DATABASE_BACKUP_EXPORTED',
        module: 'SETTINGS',
        status: 'success',
        details: `Full database backup exported by @${currentAccount.username}.`
      });

      onShowToast(t('Database backup downloaded successfully!', 'ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो!'));
    } catch (err) {
      onShowToast(t('Export error occurred.', 'ब्याकअप डाउनलोड गर्दा त्रुटि भयो।'));
    }
  };

  // Trigger factory reset
  const handleTriggerFactoryReset = () => {
    if (!isSuperAdmin) {
      onShowToast(t('Security rule: Only Super Administrator can perform factory reset.', 'सुपर एडमिनले मात्र फ्याक्ट्री रिसेट गर्न सक्छ।'));
      return;
    }
    if (resetConfirmText !== 'RESET ISHWARI') {
      onShowToast(t('Please type "RESET ISHWARI" to verify authorization.', 'पुष्टि गर्न "RESET ISHWARI" टाइप गर्नुहोस्।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('CRITICAL: Reset Entire Database to Authoritative Factory State?', 'गम्भीर: सम्पूर्ण डाटाबेस फ्याक्ट्री रिसेट गर्ने?'),
      description: t(
        'This will reset all notices, staff, messages, curriculum, gallery, and site configurations to the verified institutional defaults. This action cannot be undone.',
        'यसले सम्पूर्ण सूचना, कर्मचारी, सन्देश र सेटिङहरूलाई आधिकारिक पूर्वनिर्धारित अवस्थामा फर्काउनेछ।'
      ),
      itemName: 'Ishwari School Database',
      confirmText: t('CONFIRM FACTORY RESET', 'फ्याक्ट्री रिसेट गर्नुहोस्'),
      action: async () => {
        setIsResetting(true);
        const res = await apiClient.resetToDefaults(currentAccount.username);
        setIsResetting(false);

        if (res.success) {
          await apiClient.recordAuditLog({
            action: 'FACTORY_RESET_EXECUTED',
            module: 'SECURITY',
            status: 'danger',
            details: `Authoritative factory reset executed by @${currentAccount.username}.`
          });
          onShowToast(t('Database successfully restored to institutional factory state!', 'डाटाबेस सफलतापूर्वक फ्याक्ट्री अवस्थामा पुनर्स्थापित भयो!'));
          if (onResetFactory) onResetFactory();
          setResetConfirmText('');
        } else {
          onShowToast(t(`Reset failed: ${res.error}`, `रिसेट असफल: ${res.error}`));
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        variant={confirmState.variant}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
      />

      {/* Header & Sub-tabs */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1E40AF]" />
              <span>{t('Site Configuration & Security Settings', 'साइट सेटिङ तथा सुरक्षा नीतिहरू')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Configure institutional parameters, session timeout limits, maintenance modes, and institutional data snapshots.',
                'विद्यालयको आधिकारिक विवरण, सुरक्षा नियम, ब्याकअप तथा प्रणाली प्यारामिटरहरूको व्यवस्थापन।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'general'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('General Identity', 'सामान्य विवरण')}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('hero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'hero'
                  ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{t('Homepage Hero Background', 'गृहपृष्ठ ब्यानर पृष्ठभूमि')}</span>
              {(siteConfig?.hero_background_enabled || siteConfig?.heroBackgroundEnabled || siteConfig?.homeBgEnabled) && (siteConfig?.hero_background_image || siteConfig?.heroBackgroundImage || siteConfig?.homeBgImage) ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : null}
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveSubTab('security')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeSubTab === 'security'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('Security Policies', 'सुरक्षा नीति')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveSubTab('backup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'backup'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('Backup & Maintenance', 'ब्याकअप र मर्मत')}
            </button>
          </div>
        </div>
      </div>

      {/* 1. GENERAL IDENTITY FORM */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Institutional Identity & Metadata', 'संस्थागत पहिचान तथा विवरण')}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Updates save directly across public headers, footers, meta tags, and institutional documents.', 'सार्वजनिक हेडर, फुटर र आधिकारिक कागजातहरूमा स्वतः अद्यावधिक हुन्छ।')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (English)', 'विद्यालयको नाम (अंग्रेजी)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.name_en}
                onChange={(e) => setGeneralForm({ ...generalForm, name_en: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (Nepali)', 'विद्यालयको नाम (नेपाली)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.name_np}
                onChange={(e) => setGeneralForm({ ...generalForm, name_np: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Motto / Tagline (English)', 'आदर्श वाक्य (अंग्रेजी)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.tagline_en}
                onChange={(e) => setGeneralForm({ ...generalForm, tagline_en: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Motto / Tagline (Nepali)', 'आदर्श वाक्य (नेपाली)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.tagline_np}
                onChange={(e) => setGeneralForm({ ...generalForm, tagline_np: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Year of Establishment', 'स्थापना वर्ष')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.estd}
                onChange={(e) => setGeneralForm({ ...generalForm, estd: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('EMIS / Institutional School Code', 'विद्यालय कोड (EMIS)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.school_code}
                onChange={(e) => setGeneralForm({ ...generalForm, school_code: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Timings (English)', 'विद्यालय सञ्चालन समय (अंग्रेजी)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.timing_en}
                onChange={(e) => setGeneralForm({ ...generalForm, timing_en: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Timings (Nepali)', 'विद्यालय सञ्चालन समय (नेपाली)')}
              </label>
              <input
                type="text"
                disabled={!canUpdate}
                value={generalForm.timing_np}
                onChange={(e) => setGeneralForm({ ...generalForm, timing_np: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={!canUpdate || isSavingGeneral}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingGeneral ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Site Settings', 'सेटिङ सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. HOMEPAGE HERO BACKGROUND SETTINGS */}
      {activeSubTab === 'hero' && (
        <HeroBackgroundManager
          lang={lang}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onShowToast={onShowToast}
        />
      )}

      {/* 3. SECURITY POLICIES FORM (SUPER ADMIN ONLY) */}
      {activeSubTab === 'security' && isSuperAdmin && (
        <form onSubmit={handleSaveSecurity} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>{t('Core Security Policies & Lockout Thresholds', 'सुरक्षा नीति तथा लगइन लकआउट सीमा')}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Configure authentication timeouts, brute-force mitigation, and emergency maintenance controls.', 'प्रमाणीकरण समयसीमा र सुरक्षा व्यवस्थापन।')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Session Inactivity Timeout (Minutes)', 'सत्र निष्क्रियता समय (मिनेट)')}
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={securityForm.sessionTimeoutMinutes}
                onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Recommended: 30 minutes</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Max Failed Login Attempts Before Lockout', 'अधिकतम असफल प्रयास सीमा')}
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={securityForm.maxFailedAttempts}
                onChange={(e) => setSecurityForm({ ...securityForm, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Default: 5 attempts</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Lockout Duration (Minutes)', 'लकआउट अवधि (मिनेट)')}
              </label>
              <input
                type="number"
                min={1}
                max={1440}
                value={securityForm.lockoutDurationMinutes}
                onChange={(e) => setSecurityForm({ ...securityForm, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Default: 15 minutes</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Periodic Password Rotation (Days)', 'पासवर्ड परिवर्तन अवधि (दिन)')}
              </label>
              <input
                type="number"
                min={0}
                max={365}
                value={securityForm.forcePasswordChangePeriodDays}
                onChange={(e) => setSecurityForm({ ...securityForm, forcePasswordChangePeriodDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">0 disables forced rotation</span>
            </div>
          </div>

          {/* Maintenance Mode Switch */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('Emergency Maintenance Mode', 'आपतकालीन मर्मत मोड')}</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                {t(
                  'When enabled, visitors will see a scheduled maintenance notice while administrators retain login capabilities.',
                  'सक्रिय गर्दा सार्वजनिक आगन्तुकहरूले मर्मत सूचना देख्नेछन्, प्रशासकले मात्र लगइन गर्न पाउनेछन्।'
                )}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityForm.maintenanceMode}
                onChange={(e) => setSecurityForm({ ...securityForm, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSavingSecurity}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-800 text-xs font-bold shadow-xs disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingSecurity ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Security Policies', 'सुरक्षा नीति सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. BACKUP & RECOVERY */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          {/* Export section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Export Full Institutional Database Backup', 'सम्पूर्ण डाटाबेस ब्याकअप डाउनलोड')}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'Generate an authoritative JSON archive containing all notices, documents, staff roster, contact inquiries, photo galleries, and settings.',
                    'सम्पूर्ण संस्थागत तथ्यांकको आधिकारिक JSON ब्याकअप फाइल सुरक्षित गर्नुहोस्।'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{t('Download Backup (.json)', 'ब्याकअप डाउनलोड')}</span>
              </button>
            </div>
          </div>

          {/* Super Admin Factory Reset Section */}
          {isSuperAdmin && (
            <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>{t('Authoritative Factory Reset (Danger Zone)', 'आधिकारिक फ्याक्ट्री रिसेट')}</span>
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {t(
                    'Reset the entire Ishwari Ma. Vi. database back to its certified pristine institutional defaults. Type "RESET ISHWARI" below to authorize.',
                    'डाटाबेसलाई आधिकारिक पूर्वनिर्धारित अवस्थामा फर्काउन तल "RESET ISHWARI" टाइप गर्नुहोस्।'
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type 'RESET ISHWARI'"
                  className="px-3 py-2 text-xs rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-red-900 dark:text-red-200 font-mono focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  disabled={resetConfirmText !== 'RESET ISHWARI' || isResetting}
                  onClick={handleTriggerFactoryReset}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 text-xs font-bold shadow-xs transition"
                >
                  {isResetting ? t('Resetting...', 'रिसेट हुँदैछ...') : t('Execute Authoritative Factory Reset', 'फ्याक्ट्री रिसेट गर्नुहोस्')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
