import React, { useState } from 'react';
import {
  Language,
  AdminAccount,
  AdminRole,
  PermissionKey,
  SecurityAuditLogEntry
} from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit2,
  Eye,
  Lock,
  User,
  AlertTriangle,
  X,
  Check,
  Clock,
  Shield,
  Key
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { hashPassword, ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../utils/security';
import { apiClient } from '../../services/apiClient';

interface AdministratorsAdminTabProps {
  lang: Language;
  accounts: AdminAccount[];
  onUpdateAccounts: (accounts: AdminAccount[]) => any;
  currentAccount: AdminAccount;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const AdministratorsAdminTab: React.FC<AdministratorsAdminTabProps> = ({
  lang,
  accounts,
  onUpdateAccounts,
  currentAccount,
  onShowToast,
  can
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const isSuperAdmin = currentAccount.role === 'super_admin';
  const canCreate = isSuperAdmin || (can && can('admin.create'));
  const canUpdate = isSuperAdmin || (can && can('admin.update'));
  const canDelete = isSuperAdmin || (can && can('admin.delete'));

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals state
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [passwordResetAccount, setPasswordResetAccount] = useState<AdminAccount | null>(null);

  // Add Account Form State
  const [addForm, setAddForm] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'admin' as AdminRole,
    password: '',
    confirmPassword: '',
    permissions: [...(ROLE_DEFAULT_PERMISSIONS['admin'] || [])]
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Account Form State
  const [editForm, setEditForm] = useState<{
    fullName: string;
    email: string;
    role: AdminRole;
    status: 'active' | 'suspended';
    permissions: PermissionKey[];
  }>({
    fullName: '',
    email: '',
    role: 'admin',
    status: 'active',
    permissions: []
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Password Reset Form State
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Confirmation Modal
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
    variant: 'delete',
    action: () => {}
  });

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (roleFilter !== 'all' && acc.role !== roleFilter) return false;
    if (statusFilter !== 'all') {
      const isSuspended = acc.status === 'suspended' || acc.isActive === false;
      if (statusFilter === 'suspended' && !isSuspended) return false;
      if (statusFilter === 'active' && isSuspended) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      acc.username.toLowerCase().includes(q) ||
      acc.fullName.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q)
    );
  });

  // Counts
  const totalCount = accounts.length;
  const activeCount = accounts.filter((a) => a.status === 'active' && a.isActive !== false).length;
  const suspendedCount = totalCount - activeCount;

  // Open Edit Modal
  const handleOpenEdit = (acc: AdminAccount) => {
    setEditingAccount(acc);
    setEditForm({
      fullName: acc.fullName,
      email: acc.email,
      role: acc.role,
      status: acc.status === 'suspended' || acc.isActive === false ? 'suspended' : 'active',
      permissions: [...(acc.permissions || [])]
    });
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (acc: AdminAccount) => {
    setPasswordResetAccount(acc);
    setResetPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setShowResetPassword(false);
  };

  // Toggle account status (activate / suspend)
  const handleToggleStatus = (acc: AdminAccount) => {
    if (acc.role === 'super_admin') {
      onShowToast(t('Security policy: Super Admin accounts cannot be suspended.', 'सुरक्षा नीति: सुपर एडमिन खाता निलम्बन गर्न मिल्दैन।'));
      return;
    }
    if (acc.id === currentAccount.id || acc.username === currentAccount.username) {
      onShowToast(t('Self-lockout protection: You cannot suspend your own active account.', 'तपाईं आफ्नै सक्रिय खाता निलम्बन गर्न सक्नुहुन्न।'));
      return;
    }

    const isCurrentlyActive = acc.status === 'active' && acc.isActive !== false;
    const newStatus: 'active' | 'suspended' = isCurrentlyActive ? 'suspended' : 'active';
    const actionText = isCurrentlyActive ? t('Suspend Account', 'खाता निलम्बन') : t('Activate Account', 'खाता सक्रिय');

    setConfirmState({
      isOpen: true,
      variant: isCurrentlyActive ? 'warning' : 'update',
      title: `${actionText} - @${acc.username}`,
      description: isCurrentlyActive
        ? t(`Are you sure you want to suspend administrator @${acc.username}? They will immediately lose login access.`, `के तपाईं @${acc.username} लाई निलम्बन गर्न चाहनुहुन्छ? निजको लगइन तुरुन्त रोकिनेछ।`)
        : t(`Are you sure you want to reactivate administrator @${acc.username}?`, `के तपाईं @${acc.username} को खाता पुनः सक्रिय गर्न चाहनुहुन्छ?`),
      itemName: acc.fullName,
      confirmText: actionText,
      action: async () => {
        const updated = accounts.map((a) =>
          a.id === acc.id
            ? { ...a, status: newStatus, isActive: newStatus === 'active' }
            : a
        );
        const res = await onUpdateAccounts(updated);
        if (res && res.success === false) {
          onShowToast(t(`Action failed: ${res.error}`, `कार्य असफल: ${res.error}`));
          return;
        }
        await apiClient.recordAuditLog({
          action: isCurrentlyActive ? 'ADMIN_SUSPENDED' : 'ADMIN_ACTIVATED',
          module: 'RBAC',
          status: isCurrentlyActive ? 'warning' : 'success',
          details: `Administrator account @${acc.username} status set to [${newStatus}] by @${currentAccount.username}.`
        });
        onShowToast(t(`Administrator @${acc.username} is now ${newStatus}.`, `प्रशासक @${acc.username} को स्थिति ${newStatus} गरियो।`));
      }
    });
  };

  // Delete account
  const handleDeleteAccount = (acc: AdminAccount) => {
    if (acc.role === 'super_admin') {
      onShowToast(t('Critical security rule: Super Admin accounts cannot be deleted.', 'गम्भीर सुरक्षा नियम: सुपर एडमिन खाता मेटाउन मिल्दैन।'));
      return;
    }
    if (acc.id === currentAccount.id || acc.username === currentAccount.username) {
      onShowToast(t('Self-lockout protection: You cannot delete your own account.', 'तपाईं आफ्नै खाता मेटाउन सक्नुहुन्न।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Administrator Account', 'प्रशासक खाता मेटाउनुहोस्'),
      description: t(
        `Are you sure you want to permanently delete administrator @${acc.username} (${acc.fullName})? All access rights will be permanently revoked.`,
        `के तपाईं @${acc.username} (${acc.fullName}) को खाता स्थायी रूपमा मेटाउन चाहनुहुन्छ? सम्पूर्ण पहुँच खारेज हुनेछ।`
      ),
      itemName: `@${acc.username}`,
      confirmText: t('Permanently Delete', 'स्थायी रूपमा मेटाउनुहोस्'),
      action: async () => {
        const updated = accounts.filter((a) => a.id !== acc.id);
        const res = await onUpdateAccounts(updated);
        if (res && res.success === false) {
          onShowToast(t(`Delete failed: ${res.error}`, `मेटाउन असफल: ${res.error}`));
          return;
        }
        await apiClient.recordAuditLog({
          action: 'ADMIN_ACCOUNT_DELETED',
          module: 'RBAC',
          status: 'warning',
          details: `Administrator account @${acc.username} was permanently deleted by @${currentAccount.username}.`
        });
        if (selectedAccount?.id === acc.id) setSelectedAccount(null);
        onShowToast(t(`Administrator @${acc.username} deleted from database.`, `प्रशासक @${acc.username} डाटाबेसबाट हटाइयो।`));
      }
    });
  };

  // Submit Add Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      onShowToast(t('Permission denied: You cannot create administrator accounts.', 'अनुमति छैन: नयाँ प्रशासक बनाउन मिल्दैन।'));
      return;
    }

    const username = addForm.username.trim().toLowerCase();
    if (!username || username.length < 3) {
      onShowToast(t('Username must be at least 3 characters long.', 'प्रयोगकर्ता नाम कम्तिमा ३ अक्षरको हुनुपर्छ।'));
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(username)) {
      onShowToast(t('Username can only contain letters, numbers, dots, and underscores.', 'प्रयोगकर्ता नाममा अक्षर, अंक र अन्डरस्कोर मात्र प्रयोग गर्न मिल्छ।'));
      return;
    }
    if (accounts.some((a) => a.username.toLowerCase() === username)) {
      onShowToast(t('An administrator with this username already exists.', 'यो प्रयोगकर्ता नामको खाता पहिले नै दर्ता छ।'));
      return;
    }
    if (!addForm.fullName.trim()) {
      onShowToast(t('Full Name is required.', 'पूरा नाम अनिवार्य छ।'));
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      onShowToast(t('Password must be at least 6 characters.', 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।'));
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      onShowToast(t('Passwords do not match.', 'पासवर्ड मिलेन।'));
      return;
    }
    if (addForm.role === 'super_admin' && !isSuperAdmin) {
      onShowToast(t('Privilege escalation blocked: Only Super Admin can create Super Admin accounts.', 'विशेषाधिकार उल्लंघन: सुपर एडमिनले मात्र सुपर एडमिन बनाउन सक्छ।'));
      return;
    }

    setIsCreating(true);
    const { hash, salt } = hashPassword(addForm.password);

    const newAccount: AdminAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username,
      fullName: addForm.fullName.trim(),
      email: addForm.email.trim() || `${username}@ishwari.edu.np`,
      role: addForm.role,
      passwordHash: hash,
      salt,
      status: 'active',
      isActive: true,
      permissions: addForm.permissions,
      createdAt: new Date().toISOString()
    };

    const updated = [...accounts, newAccount];
    const res = await onUpdateAccounts(updated);
    setIsCreating(false);

    if (res && res.success === false) {
      onShowToast(t(`Failed to create account: ${res.error}`, `खाता बनाउन असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ADMIN_ACCOUNT_CREATED',
      module: 'RBAC',
      status: 'success',
      details: `New administrator account @${username} (Role: ${addForm.role}) created by @${currentAccount.username}.`
    });

    setIsAddModalOpen(false);
    setAddForm({
      username: '',
      fullName: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
      permissions: [...(ROLE_DEFAULT_PERMISSIONS['admin'] || [])]
    });
    onShowToast(t(`Administrator @${username} created successfully!`, `प्रशासक @${username} सफलतापूर्वक सिर्जना गरियो!`));
  };

  // Submit Edit Account
  const handleUpdateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !canUpdate) return;

    if (editingAccount.role === 'super_admin' && editForm.role !== 'super_admin') {
      onShowToast(t('Security violation: Cannot downgrade Super Admin role.', 'सुरक्षा उल्लंघन: सुपर एडमिनको भूमिका घटाउन मिल्दैन।'));
      return;
    }
    if (editForm.role === 'super_admin' && !isSuperAdmin) {
      onShowToast(t('Privilege escalation blocked: Only Super Admin can grant Super Admin role.', 'विशेषाधिकार उल्लंघन: सुपर एडमिन मात्रले भूमिका दिन सक्छ।'));
      return;
    }

    setIsUpdating(true);
    const updated = accounts.map((a) =>
      a.id === editingAccount.id
        ? {
            ...a,
            fullName: editForm.fullName.trim() || a.fullName,
            email: editForm.email.trim() || a.email,
            role: editForm.role,
            status: editForm.status,
            isActive: editForm.status === 'active',
            permissions: editForm.permissions
          }
        : a
    );

    const res = await onUpdateAccounts(updated);
    setIsUpdating(false);

    if (res && res.success === false) {
      onShowToast(t(`Update failed: ${res.error}`, `अद्यावधिक असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ADMIN_ACCOUNT_UPDATED',
      module: 'RBAC',
      status: 'success',
      details: `Administrator account @${editingAccount.username} profile & permissions updated by @${currentAccount.username}.`
    });

    setEditingAccount(null);
    onShowToast(t(`Administrator @${editingAccount.username} updated!`, `प्रशासक @${editingAccount.username} अद्यावधिक गरियो!`));
  };

  // Submit Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetAccount || !canUpdate) return;

    if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 6) {
      onShowToast(t('Password must be at least 6 characters long.', 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।'));
      return;
    }
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      onShowToast(t('Passwords do not match.', 'पासवर्ड मिलेन।'));
      return;
    }

    setIsResettingPassword(true);
    const { hash, salt } = hashPassword(resetPasswordForm.newPassword);

    const updated = accounts.map((a) =>
      a.id === passwordResetAccount.id
        ? {
            ...a,
            passwordHash: hash,
            salt
          }
        : a
    );

    const res = await onUpdateAccounts(updated);
    setIsResettingPassword(false);

    if (res && res.success === false) {
      onShowToast(t(`Password reset failed: ${res.error}`, `पासवर्ड परिवर्तन असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ADMIN_PASSWORD_RESET',
      module: 'RBAC',
      status: 'warning',
      details: `Password for administrator @${passwordResetAccount.username} was reset by @${currentAccount.username}.`
    });

    setPasswordResetAccount(null);
    onShowToast(t(`Password reset successfully for @${passwordResetAccount.username}!`, `@${passwordResetAccount.username} को पासवर्ड सुरक्षित रूपमा परिवर्तन गरियो!`));
  };

  // Role Badge Formatter
  const renderRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            SUPER ADMIN
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            SCHOOL ADMIN
          </span>
        );
      case 'editor':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            EDITOR
          </span>
        );
      case 'viewer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            VIEWER
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
            {role}
          </span>
        );
    }
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

      {/* Header with Stats & Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1E40AF]" />
              <span>{t('System Administrators & Authorized Personnel', 'प्रणाली प्रशासक तथा अधिकृत खाताहरू')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Manage authorized institutional accounts, assign RBAC security roles, enforce status, and manage secure credentials.',
                'विद्यालयको आधिकारिक व्यवस्थापकीय खाता, सुरक्षा भूमिका र पहुँच अधिकार व्यवस्थापन।'
              )}
            </p>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setAddForm({
                  username: '',
                  fullName: '',
                  email: '',
                  role: 'admin',
                  password: '',
                  confirmPassword: '',
                  permissions: [...(ROLE_DEFAULT_PERMISSIONS['admin'] || [])]
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('Add New Administrator', 'नयाँ प्रशासक थप्नुहोस्')}</span>
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">{t('Total Accounts', 'कुल खाता')}</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-[11px] text-emerald-600 font-medium">{t('Active Accounts', 'सक्रिय')}</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">{activeCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <div className="text-[11px] text-amber-600 font-medium">{t('Suspended / Inactive', 'निलम्बित')}</div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono">{suspendedCount}</div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by username, full name, or email...', 'नाम वा प्रयोगकर्ता नाम अनुसार खोज्नुहोस्...')}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#1E40AF]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">{t('All Roles', 'सबै भूमिका')}</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">School Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">{t('All Status', 'सबै अवस्था')}</option>
              <option value="active">{t('Active Only', 'सक्रिय मात्र')}</option>
              <option value="suspended">{t('Suspended Only', 'निलम्बित मात्र')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Administrators Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">{t('Administrator', 'प्रशासक')}</th>
                <th className="py-3 px-4">{t('Assigned Role', 'भूमिका')}</th>
                <th className="py-3 px-4">{t('Status', 'अवस्था')}</th>
                <th className="py-3 px-4">{t('Permissions', 'अनुमति')}</th>
                <th className="py-3 px-4 text-right">{t('Actions', 'कार्यहरू')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    {t('No administrators found matching criteria', 'मापदण्ड अनुसार कुनै प्रशासक भेटिएन')}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isActive = acc.status === 'active' && acc.isActive !== false;
                  const isCurrent = acc.id === currentAccount.id || acc.username === currentAccount.username;
                  const isSuper = acc.role === 'super_admin';

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                        !isActive ? 'opacity-70 bg-slate-50/30 dark:bg-slate-900/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {acc.fullName ? acc.fullName.charAt(0).toUpperCase() : acc.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{acc.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-100 text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 font-mono text-[11px]">
                              @{acc.username} &bull; {acc.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {renderRoleBadge(acc.role)}
                      </td>

                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {t('Active', 'सक्रिय')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-mono text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {t('Suspended', 'निलम्बित')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {isSuper ? (
                          <span className="text-purple-600 font-bold">{t('Full System Access (All)', 'पूर्ण प्रणाली')}</span>
                        ) : (
                          <span>{(acc.permissions || []).length} {t('capabilities', 'अधिकार')}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setSelectedAccount(acc)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                            title={t('View Full Administrator Profile', 'पूर्ण विवरण हेर्नुहोस्')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit account */}
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(acc)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                              title={t('Edit Administrator Profile & Permissions', 'विवरण र अनुमति सम्पादन')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reset Password */}
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => handleOpenResetPassword(acc)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                              title={t('Reset Administrator Password', 'पासवर्ड परिवर्तन गर्नुहोस्')}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspend / Activate Toggle */}
                          {canUpdate && !isSuper && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(acc)}
                              className={`p-1.5 rounded-lg border transition ${
                                isActive
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/30'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/30'
                              }`}
                              title={isActive ? t('Suspend Account', 'निलम्बन गर्नुहोस्') : t('Reactivate Account', 'पुनः सक्रिय गर्नुहोस्')}
                            >
                              {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete Account */}
                          {canDelete && !isSuper && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              title={t('Delete Administrator Account', 'खाता मेटाउनुहोस्')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ACCOUNT DETAILS MODAL */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Administrator Details', 'प्रशासक पूर्ण विवरण')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-12 h-12 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-lg">
                  {selectedAccount.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">{selectedAccount.fullName}</div>
                  <div className="text-xs font-mono text-slate-500">@{selectedAccount.username} &bull; {selectedAccount.email}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {renderRoleBadge(selectedAccount.role)}
                    <span className={`text-[11px] font-mono font-bold ${
                      selectedAccount.status === 'active' && selectedAccount.isActive !== false
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}>
                      {selectedAccount.status === 'active' && selectedAccount.isActive !== false ? t('ACTIVE', 'सक्रिय') : t('SUSPENDED', 'निलम्बित')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  {t('Granted Granular Permissions:', 'प्रदान गरिएका अधिकारहरू:')}
                </h4>
                {selectedAccount.role === 'super_admin' ? (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 text-xs">
                    {t(
                      'This Super Admin account has unrestricted full-system privileges across all modules, settings, security, and databases.',
                      'यस सुपर एडमिन खातासँग प्रणालीका सम्पूर्ण मोड्युल, सेटिङ, अडिट लग र सुरक्षा नीतिहरूमा पूर्ण अधिकार रहेको छ।'
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedAccount.permissions || []).map((p) => {
                      const meta = ALL_PERMISSIONS.find((perm) => perm.key === p);
                      return (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          title={meta ? `${meta.group}: ${meta.descEn}` : p}
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
              >
                {t('Close', 'बन्द गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMINISTRATOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Create New System Administrator', 'नयाँ प्रणाली प्रशासक बनाउनुहोस्')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Username', 'प्रयोगकर्ता नाम')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.username}
                      onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="e.g. ram_shrestha"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Full Name', 'पूरा नाम')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="e.g. Ram Bahadur Shrestha"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Email Address', 'इमेल ठेगाना')}
                    </label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="ram@ishwari.edu.np"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Security Role', 'सुरक्षा भूमिका')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.role}
                      onChange={(e) => {
                        const nextRole = e.target.value as AdminRole;
                        setAddForm({
                          ...addForm,
                          role: nextRole,
                          permissions: [...(ROLE_DEFAULT_PERMISSIONS[nextRole] || [])]
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="admin">School Administrator (Operational Admin)</option>
                      <option value="editor">Content Editor (Circulars & Media)</option>
                      <option value="viewer">Viewer (Read-only)</option>
                      {isSuperAdmin && <option value="super_admin">Super Administrator (Full System)</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Initial Password', 'पासवर्ड')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Confirm Password', 'पासवर्ड पुष्टि')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      value={addForm.confirmPassword}
                      onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAddPass"
                    checked={showAddPassword}
                    onChange={(e) => setShowAddPassword(e.target.checked)}
                    className="rounded text-[#1E40AF]"
                  />
                  <label htmlFor="showAddPass" className="text-xs text-slate-600 dark:text-slate-400">
                    {t('Show password characters', 'पासवर्ड देखाउनुहोस्')}
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('Granular Module Permissions:', 'मोड्युल अनुमतिहरू:')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const allKeys = ALL_PERMISSIONS.map((p) => p.key);
                        const isAll = addForm.permissions.length === allKeys.length;
                        setAddForm({
                          ...addForm,
                          permissions: isAll ? [] : allKeys
                        });
                      }}
                      className="text-[11px] text-[#1E40AF] hover:underline"
                    >
                      {addForm.permissions.length === ALL_PERMISSIONS.length ? t('Deselect All', 'सबै हटाउनुहोस्') : t('Select All', 'सबै छान्नुहोस्')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    {ALL_PERMISSIONS.map((p) => {
                      const isChecked = addForm.permissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddForm({
                                  ...addForm,
                                  permissions: [...addForm.permissions, p.key]
                                });
                              } else {
                                setAddForm({
                                  ...addForm,
                                  permissions: addForm.permissions.filter((k) => k !== p.key)
                                });
                              }
                            }}
                            className="rounded text-[#1E40AF]"
                          />
                          <span className="truncate">{p.labelEn}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isCreating ? t('Creating...', 'सिर्जना हुँदैछ...') : t('Create Administrator', 'खाता सिर्जना गर्नुहोस्')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMINISTRATOR MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t(`Edit Administrator @${editingAccount.username}`, `प्रशासक @${editingAccount.username} सम्पादन`)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccountSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Full Name', 'पूरा नाम')}
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Email Address', 'इमेल ठेगाना')}
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Assigned Role', 'तोकिएको भूमिका')}
                    </label>
                    <select
                      disabled={editingAccount.role === 'super_admin'}
                      value={editForm.role}
                      onChange={(e) => {
                        const nextRole = e.target.value as AdminRole;
                        setEditForm({
                          ...editForm,
                          role: nextRole,
                          permissions: [...(ROLE_DEFAULT_PERMISSIONS[nextRole] || [])]
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium disabled:opacity-50"
                    >
                      <option value="admin">School Administrator</option>
                      <option value="editor">Content Editor</option>
                      <option value="viewer">Viewer</option>
                      {isSuperAdmin && <option value="super_admin">Super Administrator</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Account Status', 'खाताको अवस्था')}
                    </label>
                    <select
                      disabled={editingAccount.role === 'super_admin' || editingAccount.id === currentAccount.id}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium disabled:opacity-50"
                    >
                      <option value="active">{t('Active (Enabled)', 'सक्रिय')}</option>
                      <option value="suspended">{t('Suspended (Blocked)', 'निलम्बित')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('Granular Permissions:', 'मोड्युल अनुमतिहरू:')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    {ALL_PERMISSIONS.map((p) => {
                      const isChecked = editForm.permissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({
                                  ...editForm,
                                  permissions: [...editForm.permissions, p.key]
                                });
                              } else {
                                setEditForm({
                                  ...editForm,
                                  permissions: editForm.permissions.filter((k) => k !== p.key)
                                });
                              }
                            }}
                            className="rounded text-[#1E40AF]"
                          />
                          <span className="truncate">{p.labelEn}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUpdating ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordResetAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t(`Reset Password: @${passwordResetAccount.username}`, `पासवर्ड परिवर्तन: @${passwordResetAccount.username}`)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordResetAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {t(
                      'Setting a new password will immediately update this administrator credentials in the database.',
                      'नयाँ पासवर्ड राख्दा डाटाबेसमा तत्काल अद्यावधिक हुनेछ।'
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('New Password', 'नयाँ पासवर्ड')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Confirm New Password', 'नयाँ पासवर्ड पुष्टि')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showResetPass"
                    checked={showResetPassword}
                    onChange={(e) => setShowResetPassword(e.target.checked)}
                    className="rounded text-[#1E40AF]"
                  />
                  <label htmlFor="showResetPass" className="text-xs text-slate-600 dark:text-slate-400">
                    {t('Show password characters', 'पासवर्ड देखाउनुहोस्')}
                  </label>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetAccount(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isResettingPassword ? t('Updating...', 'अद्यावधिक हुँदैछ...') : t('Update Password', 'पासवर्ड परिवर्तन गर्नुहोस्')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
