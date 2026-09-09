import React, { useState } from 'react';
import {
  Language,
  AdminAccount,
  PermissionKey
} from '../../types';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { hashPassword, verifyPassword, ALL_PERMISSIONS } from '../../utils/security';
import { apiClient } from '../../services/apiClient';

interface AdminProfileTabProps {
  lang: Language;
  currentAccount: AdminAccount;
  onUpdateAccount: (updatedAccount: AdminAccount) => any;
  onShowToast: (msg: string) => void;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  lang,
  currentAccount,
  onUpdateAccount,
  onShowToast
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    fullName: currentAccount.fullName || '',
    email: currentAccount.email || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle Save Profile info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      onShowToast(t('Full Name is required.', 'पूरा नाम अनिवार्य छ।'));
      return;
    }

    setIsSavingProfile(true);
    const updated: AdminAccount = {
      ...currentAccount,
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim() || currentAccount.email
    };

    const res = await onUpdateAccount(updated);
    setIsSavingProfile(false);

    if (res && res.success === false) {
      onShowToast(t(`Update failed: ${res.error}`, `अद्यावधिक असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ADMIN_PROFILE_UPDATED',
      module: 'ACCOUNT',
      status: 'success',
      details: `Administrator @${currentAccount.username} updated profile details (Name: ${updated.fullName}, Email: ${updated.email}).`
    });

    onShowToast(t('Profile information updated successfully!', 'प्रोफाइल विवरण सफलतापूर्वक सुरक्षित भयो!'));
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      onShowToast(t('Current password is required to verify your identity.', 'हालको पासवर्ड राख्नुहोस्।'));
      return;
    }

    // Verify current password against stored hash/salt
    if (currentAccount.passwordHash && currentAccount.salt) {
      const isMatch = await verifyPassword(
        passwordForm.currentPassword,
        currentAccount.passwordHash,
        currentAccount.salt
      );
      if (!isMatch) {
        onShowToast(t('Incorrect current password.', 'हालको पासवर्ड गलत छ।'));
        return;
      }
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      onShowToast(t('New password must be at least 6 characters long.', 'नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।'));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onShowToast(t('New password and confirmation do not match.', 'नयाँ पासवर्ड र पुष्टि मिलेन।'));
      return;
    }

    setIsChangingPassword(true);
    const { hash, salt } = hashPassword(passwordForm.newPassword);

    const updated: AdminAccount = {
      ...currentAccount,
      passwordHash: hash,
      salt
    };

    const res = await onUpdateAccount(updated);
    setIsChangingPassword(false);

    if (res && res.success === false) {
      onShowToast(t(`Failed to update password: ${res.error}`, `पासवर्ड परिवर्तन असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ADMIN_PASSWORD_CHANGED',
      module: 'SECURITY',
      status: 'success',
      details: `Administrator @${currentAccount.username} changed their account password.`
    });

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    onShowToast(t('Your password has been changed securely!', 'तपाईंको पासवर्ड सफलतापूर्वक परिवर्तन गरियो!'));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Account Overview Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {currentAccount.fullName ? currentAccount.fullName.charAt(0).toUpperCase() : currentAccount.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentAccount.fullName}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  currentAccount.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                    : 'bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                }`}>
                  {currentAccount.role.toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                @{currentAccount.username} &bull; {currentAccount.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('ACTIVE SESSION', 'सक्रिय सत्र')}
            </span>
          </div>
        </div>

        {/* Permissions Overview */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1E40AF]" />
            <span>{t('Assigned Capabilities & Access Rights:', 'तोकिएका अधिकारहरू:')}</span>
          </h4>
          {currentAccount.role === 'super_admin' ? (
            <p className="text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 p-2.5 rounded-lg">
              {t('Super Administrator: Full system access across all modules, databases, and security policies.', 'सुपर एडमिन: सम्पूर्ण प्रणाली, डाटाबेस र सुरक्षा नीतिमा पूर्ण पहुँच।')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {(currentAccount.permissions || []).map((p) => {
                const meta = ALL_PERMISSIONS.find((perm) => perm.key === p);
                return (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    title={meta ? meta.descEn : p}
                  >
                    {p}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. EDIT PROFILE FORM */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Profile Information', 'व्यक्तिगत विवरण सम्पादन')}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Update your display name and official institutional contact email.', 'प्रदर्शन नाम र इमेल अद्यावधिक गर्नुहोस्।')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Username', 'प्रयोगकर्ता नाम')}
            </label>
            <input
              type="text"
              disabled
              value={currentAccount.username}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Username cannot be altered.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Full Name', 'पूरा नाम')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Official Email Address', 'आधिकारिक इमेल ठेगाना')}
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Profile Details', 'विवरण सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>

        {/* 2. CHANGE PASSWORD FORM */}
        <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>{t('Change Account Password', 'पासवर्ड परिवर्तन')}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Ensure your new password contains at least 6 characters.', 'कम्तिमा ६ अक्षरको बलियो पासवर्ड राख्नुहोस्।')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Current Password', 'हालको पासवर्ड')} <span className="text-red-500">*</span>
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('New Password', 'नयाँ पासवर्ड')} <span className="text-red-500">*</span>
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Confirm New Password', 'नयाँ पासवर्ड पुष्टि')} <span className="text-red-500">*</span>
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPassProfile"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded text-[#1E40AF]"
            />
            <label htmlFor="showPassProfile" className="text-xs text-slate-600 dark:text-slate-400">
              {t('Show password characters', 'पासवर्ड देखाउनुहोस्')}
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? t('Updating...', 'अद्यावधिक हुँदैछ...') : t('Update Password', 'पासवर्ड सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
