import React, { useState } from 'react';
import { Language, AdminAccount, PermissionKey, SecurityAuditLogEntry } from '../../types';
import { ALL_PERMISSIONS } from '../../utils/security';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Key,
  Check,
  X,
  Search,
  Filter,
  Activity,
  Calendar,
  AlertTriangle,
  FileDown,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface RbacAdminTabProps {
  lang: Language;
  currentAccount: AdminAccount;
  accounts: AdminAccount[];
  onUpdateAccounts: (accounts: AdminAccount[]) => void;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onAddAuditLog: (log: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  onShowToast: (msg: string) => void;
}

export const RbacAdminTab: React.FC<RbacAdminTabProps> = ({
  lang,
  currentAccount,
  accounts,
  onUpdateAccounts,
  auditLogs,
  onClearAuditLogs,
  onAddAuditLog,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'accounts' | 'audit_logs'>('accounts');
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin'>('all');

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

  // Form state for new or edited admin
  const [formData, setFormData] = useState<{
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: 'super_admin' | 'admin';
    password: string;
    status: 'active' | 'suspended' | 'inactive';
    permissions: PermissionKey[];
  }>({
    id: '',
    username: '',
    fullName: '',
    email: '',
    role: 'admin',
    password: '',
    status: 'active',
    permissions: [
      'notice.view', 'notice.create', 'notice.update',
      'teacher.view', 'teacher.create', 'teacher.update',
      'staff.view', 'staff.create', 'staff.update',
      'gallery.view', 'gallery.create', 'gallery.update',
      'settings.view'
    ],
  });

  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'success' | 'warning' | 'danger'>('all');

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const isSuperAdmin = currentAccount.role === 'super_admin';

  // Quick Permission Presets
  const applyPreset = (preset: 'content' | 'staff' | 'full_admin' | 'all') => {
    if (preset === 'content') {
      setFormData(prev => ({
        ...prev,
        permissions: [
          'notice.view', 'notice.create', 'notice.update', 'notice.delete',
          'gallery.view', 'gallery.create', 'gallery.update', 'gallery.delete',
          'settings.view'
        ]
      }));
    } else if (preset === 'staff') {
      setFormData(prev => ({
        ...prev,
        permissions: [
          'teacher.view', 'teacher.create', 'teacher.update', 'teacher.delete',
          'staff.view', 'staff.create', 'staff.update', 'staff.delete',
          'notice.view', 'settings.view'
        ]
      }));
    } else if (preset === 'full_admin') {
      setFormData(prev => ({
        ...prev,
        permissions: ALL_PERMISSIONS.map(p => p.key).filter(k => !k.startsWith('admin.'))
      }));
    } else if (preset === 'all') {
      setFormData(prev => ({
        ...prev,
        permissions: ALL_PERMISSIONS.map(p => p.key)
      }));
    }
  };

  const handleTogglePermission = (perm: PermissionKey) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter(p => p !== perm)
          : [...prev.permissions, perm]
      };
    });
  };

  const handleOpenCreate = () => {
    if (!isSuperAdmin) {
      alert(t('Only Super Administrators can provision new accounts.', 'केवल सुपर प्रशासकले नयाँ खाता सिर्जना गर्न सक्दछन्।'));
      return;
    }
    setFormData({
      id: `usr_${Date.now()}`,
      username: '',
      fullName: '',
      email: '',
      role: 'admin',
      password: '',
      status: 'active',
      permissions: [
        'notice.view', 'notice.create', 'notice.update',
        'teacher.view', 'teacher.create',
        'staff.view', 'staff.create',
        'gallery.view', 'gallery.create',
        'settings.view'
      ],
    });
    setIsCreating(true);
    setEditingAccount(null);
  };

  const handleOpenEdit = (acc: AdminAccount) => {
    if (!isSuperAdmin && acc.id !== currentAccount.id) {
      alert(t('Permission denied: You can only edit your own profile.', 'अनुमति छैन: तपाईं केवल आफ्नै प्रोफाइल सम्पादन गर्न सक्नुहुन्छ।'));
      return;
    }
    setFormData({
      id: acc.id,
      username: acc.username,
      fullName: acc.fullName,
      email: acc.email || '',
      role: acc.role,
      password: '',
      status: acc.status,
      permissions: [...acc.permissions],
    });
    setEditingAccount(acc);
    setIsCreating(false);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.fullName.trim()) {
      onShowToast(t('Please provide both Username and Full Name.', 'कृपया प्रयोगकर्ता नाम र पूरा नाम प्रविष्ट गर्नुहोस्।'));
      return;
    }

    if (isCreating) {
      // Check username duplicate
      if (accounts.some(a => a.username.toLowerCase() === formData.username.trim().toLowerCase())) {
        onShowToast(t('Username already exists. Please choose another username.', 'यो प्रयोगकर्ता नाम पहिले नै अवस्थित छ।'));
        return;
      }
      if (!formData.password.trim()) {
        onShowToast(t('Please provide an initial password.', 'कृपया प्रारम्भिक पासवर्ड प्रविष्ट गर्नुहोस्।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'create',
        title: t('Confirm Administrator Provisioning', 'प्रशासक खाता सिर्जना पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to provision this administrative credential with the specified role and system permissions?', 'के तपाईं तोकिएको भूमिका र अनुमतिसहित नयाँ प्रशासक खाता सिर्जना गर्न निश्चित हुनुहुन्छ?'),
        itemName: `${formData.username} (${formData.fullName} • ${formData.role})`,
        confirmText: t('Create Account', 'खाता सिर्जना गर्नुहोस्'),
        action: () => {
          const newAccount: AdminAccount = {
            id: formData.id || `usr_${Date.now()}`,
            username: formData.username.trim().toLowerCase(),
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            role: formData.role,
            passwordHash: formData.password.trim(),
            salt: `salt_${Date.now()}`,
            status: formData.status,
            permissions: formData.role === 'super_admin' ? ALL_PERMISSIONS.map(p => p.key) : formData.permissions,
            createdAt: new Date().toISOString().split('T')[0],
          };

          onUpdateAccounts([...accounts, newAccount]);
          onAddAuditLog({
            action: 'ADMIN_ACCOUNT_CREATED',
            actor: currentAccount.username,
            role: currentAccount.role,
            module: 'RBAC_MANAGEMENT',
            status: 'success',
            result: 'success',
            details: `Created new admin account "${newAccount.username}" with role [${newAccount.role}] and ${newAccount.permissions.length} permissions.`
          });

          onShowToast(t(`Administrator account "${newAccount.username}" created successfully.`, `नयाँ प्रशासक खाता "${newAccount.username}" सिर्जना भयो।`));
          setIsCreating(false);
        }
      });
    } else if (editingAccount) {
      // Cannot demote or suspend oneself if super_admin and last one
      if (editingAccount.id === currentAccount.id && formData.role !== 'super_admin') {
        onShowToast(t('You cannot demote yourself from Super Administrator.', 'तपाईं आफैलाई सुपर प्रशासकबाट हटाउन सक्नुहुन्न।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'update',
        title: t('Confirm Account & Permission Updates', 'खाता र अनुमति अद्यावधिक पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to update the privileges and profile settings for this administrator?', 'के तपाईं यस प्रशासकका अनुमति र सेटिङहरू सुरक्षित गर्न चाहनुहुन्छ?'),
        itemName: `${editingAccount.username} (${formData.role})`,
        confirmText: t('Update Privileges', 'अनुमति अद्यावधिक गर्नुहोस्'),
        action: () => {
          const updatedAccounts = accounts.map(a => {
            if (a.id === editingAccount.id) {
              return {
                ...a,
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                role: formData.role,
                status: formData.status,
                permissions: formData.role === 'super_admin' ? ALL_PERMISSIONS.map(p => p.key) : formData.permissions,
                ...(formData.password.trim() ? { passwordHash: formData.password.trim() } : {})
              };
            }
            return a;
          });

          onUpdateAccounts(updatedAccounts);
          onAddAuditLog({
            action: 'ADMIN_ACCOUNT_UPDATED',
            actor: currentAccount.username,
            role: currentAccount.role,
            module: 'RBAC_MANAGEMENT',
            status: 'success',
            result: 'success',
            details: `Updated permissions and settings for account "${editingAccount.username}". Role: ${formData.role}, Status: ${formData.status}.`
          });

          onShowToast(t(`Account "${editingAccount.username}" updated.`, `खाता "${editingAccount.username}" अद्यावधिक भयो।`));
          setEditingAccount(null);
        }
      });
    }
  };

  const handleDeleteAccount = (acc: AdminAccount) => {
    if (!isSuperAdmin) {
      onShowToast(t('Only Super Administrators can delete accounts.', 'केवल सुपर प्रशासकले खाता मेटाउन सक्दछन्।'));
      return;
    }
    if (acc.id === currentAccount.id) {
      onShowToast(t('You cannot delete your own account.', 'तपाईं आफ्नै खाता मेटाउन सक्नुहुन्न।'));
      return;
    }
    if (acc.role === 'super_admin') {
      const superAdmins = accounts.filter(a => a.role === 'super_admin');
      if (superAdmins.length <= 1) {
        onShowToast(t('Cannot delete the sole Super Administrator account.', 'एकमात्र सुपर प्रशासक खाता मेटाउन सकिँदैन।'));
        return;
      }
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Account Deletion', 'प्रशासक खाता मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently revoke all access and delete this administrator account? This cannot be undone.', 'के तपाईं यो प्रशासक खाता स्थायी रूपमा मेटाउन निश्चित हुनुहुन्छ?'),
      itemName: `${acc.username} (${acc.fullName} • ${acc.role})`,
      confirmText: t('Delete Account', 'खाता मेटाउनुहोस्'),
      action: () => {
        onUpdateAccounts(accounts.filter(a => a.id !== acc.id));
        onAddAuditLog({
          action: 'ADMIN_ACCOUNT_DELETED',
          actor: currentAccount.username,
          role: currentAccount.role,
          module: 'RBAC_MANAGEMENT',
          status: 'danger',
          result: 'success',
          details: `Deleted admin account "${acc.username}" [${acc.role}].`
        });
        onShowToast(t(`Admin account "${acc.username}" deleted.`, `खाता "${acc.username}" मेटाइयो।`));
      }
    });
  };

  const handleToggleStatus = (acc: AdminAccount) => {
    if (!isSuperAdmin) return;
    if (acc.id === currentAccount.id) {
      alert(t('You cannot suspend your own account.', 'तपाईं आफ्नै खाता निलम्बन गर्न सक्नुहुन्न।'));
      return;
    }

    const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
    const updatedAccounts = accounts.map(a => a.id === acc.id ? { ...a, status: nextStatus } : a);
    onUpdateAccounts(updatedAccounts as AdminAccount[]);

    onAddAuditLog({
      action: nextStatus === 'active' ? 'ADMIN_ACCOUNT_ACTIVATED' : 'ADMIN_ACCOUNT_SUSPENDED',
      actor: currentAccount.username,
      role: currentAccount.role,
      module: 'RBAC_MANAGEMENT',
      status: nextStatus === 'active' ? 'success' : 'warning',
      result: 'success',
      details: `Changed account status of "${acc.username}" to ${nextStatus}.`
    });

    onShowToast(t(`Account "${acc.username}" status changed to ${nextStatus}.`, `खाता स्थिति फेरियो: ${nextStatus}`));
  };

  // Grouped permissions for display
  const permissionGroups = ['Notices', 'Teachers & Staff', 'Photo Gallery', 'Site Settings', 'Access Control (RBAC)'];

  const filteredAccounts = accounts
    .filter(a => roleFilter === 'all' || a.role === roleFilter)
    .filter(a => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return a.username.toLowerCase().includes(q) || a.fullName.toLowerCase().includes(q);
    });

  const filteredAuditLogs = auditLogs
    .filter(log => auditFilter === 'all' || log.status === auditFilter)
    .filter(log => {
      if (!auditSearch) return true;
      const q = auditSearch.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.module && log.module.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6 relative">
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

      {/* Sub-tabs: Accounts & Permissions vs Audit Logs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'accounts'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('Admin Accounts & Granular RBAC', 'प्रशासक खाता तथा अनुमति (RBAC)')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800">
              {accounts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('audit_logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'audit_logs'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('Security Audit Logs', 'सुरक्षा लग तथा अडिट')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-800">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {subTab === 'accounts' && isSuperAdmin && !isCreating && !editingAccount && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('Create Administrator', 'नयाँ प्रशासक थप्नुहोस्')}</span>
          </button>
        )}
      </div>

      {/* VIEW 1: ACCOUNTS & GRANULAR PERMISSIONS */}
      {subTab === 'accounts' && (
        <div className="space-y-6">
          {/* Modal / Panel for Creating / Editing Account */}
          {(isCreating || editingAccount) && (
            <form onSubmit={handleSaveAccount} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1E40AF]" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isCreating
                      ? t('Provision New Administrator Account', 'नयाँ प्रशासक खाता सिर्जना गर्नुहोस्')
                      : t(`Configure Permissions: ${formData.username}`, `अनुमति सम्पादन: ${formData.username}`)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingAccount(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Core Credentials Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Username *</label>
                  <input
                    type="text"
                    disabled={!isCreating}
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/50 font-mono"
                    placeholder="e.g. joshi_admin"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Ramesh Chandra Joshi"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="officer@ishwari.edu.np"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Role Designation</label>
                  <select
                    value={formData.role}
                    disabled={!isSuperAdmin}
                    onChange={(e) => {
                      const newRole = e.target.value as 'super_admin' | 'admin';
                      setFormData(prev => ({
                        ...prev,
                        role: newRole,
                        permissions: newRole === 'super_admin' ? ALL_PERMISSIONS.map(p => p.key) : prev.permissions
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="admin">Restricted Admin (नियमित प्रशासक)</option>
                    <option value="super_admin">Super Admin (सर्वोच्च प्रशासक - पूर्ण अधिकार)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {isCreating ? 'Initial Password *' : 'Reset Password (optional)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    placeholder={isCreating ? 'Min 8 chars with symbols' : 'Leave empty to keep current'}
                    required={isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Account Status</label>
                  <select
                    value={formData.status}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AdminAccount['status'] }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="active">Active (सक्रिय - पूर्ण पहुँच)</option>
                    <option value="suspended">Suspended (निलम्बित - अस्थायी रोक)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Matrix (Only for regular Admins) */}
              {formData.role === 'admin' && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#1E40AF]" />
                        <span>{t('Granular Module Permissions Matrix', 'विशिष्ट मोड्युल अनुमतिहरू')}</span>
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {t('Select precise actions this administrator is authorized to execute.', 'यस प्रशासकलाई अनुमति दिइएका कार्यहरू छान्नुहोस्।')}
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono mr-1">Presets:</span>
                      <button
                        type="button"
                        onClick={() => applyPreset('content')}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                      >
                        Content Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('staff')}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                      >
                        Faculty Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('full_admin')}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                      >
                        Full Admin
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissionGroups.map(group => {
                      const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
                      if (groupPerms.length === 0) return null;

                      return (
                        <div
                          key={group}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {group}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {groupPerms.filter(p => formData.permissions.includes(p.key)).length} / {groupPerms.length}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {groupPerms.map(perm => {
                              const checked = formData.permissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700/50 cursor-pointer transition text-xs select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleTogglePermission(perm.key)}
                                    className="mt-0.5 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF]"
                                  />
                                  <div className="min-w-0">
                                    <p className={`font-semibold ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                      {t(perm.labelEn, perm.labelNp)}
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                      {perm.key}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.role === 'super_admin' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">{t('Super Administrator Authority:', 'सर्वोच्च प्रशासकीय अधिकार:')}</span>{' '}
                    <span>{t('Super Admins automatically hold all permissions across all modules and cannot have permissions restricted.', 'सुपर प्रशासकलाई सबै मोड्युलहरूमा पूर्ण अधिकार हुन्छ।')}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {isCreating ? t('Provision Account', 'खाता सिर्जना गर्नुहोस्') : t('Save Permissions', 'अनुमतिहरू सुरक्षित गर्नुहोस्')}
                </button>
              </div>
            </form>
          )}

          {/* Accounts List & Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search administrator by name or username...', 'प्रशासक खोज्नुहोस्...')}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'super_admin', label: 'Super Admins' },
                  { id: 'admin', label: 'Admins' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRoleFilter(r.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      roleFilter === r.id
                        ? 'bg-[#1E40AF] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Role / Scope</th>
                    <th className="py-3 px-4">Permissions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAccounts.map(acc => {
                    const isSelf = acc.id === currentAccount.id;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              acc.role === 'super_admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                            }`}>
                              {acc.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{acc.fullName}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500">
                                @{acc.username} {acc.email ? `• ${acc.email}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                            acc.role === 'super_admin'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}>
                            <Shield className="w-3 h-3" />
                            <span>{acc.role === 'super_admin' ? 'SUPER ADMIN' : 'RESTRICTED ADMIN'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {acc.role === 'super_admin' ? (
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                              ALL ({ALL_PERMISSIONS.length}) AUTHORIZED
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                              {acc.permissions.length} Granted
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            acc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="capitalize">{acc.status}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {acc.lastLogin || 'Never logged in'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {(isSuperAdmin || isSelf) && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(acc)}
                                title={t('Edit Permissions & Role', 'अनुमति सम्पादन')}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isSuperAdmin && !isSelf && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(acc)}
                                  title={acc.status === 'active' ? t('Suspend Account', 'निलम्बन गर्नुहोस्') : t('Activate Account', 'सक्रिय गर्नुहोस्')}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  {acc.status === 'active' ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAccount(acc)}
                                  title={t('Delete Account', 'खाता मेटाउनुहोस्')}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SECURITY AUDIT LOGS */}
      {subTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={t('Search audit records by actor, action, or details...', 'अडिट लग खोज्नुहोस्...')}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'success', 'warning', 'danger'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setAuditFilter(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    auditFilter === sev
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmState({
                      isOpen: true,
                      variant: 'delete',
                      title: t('Confirm Security Audit Log Purge', 'सुरक्षा अडिट लग मेटाउन पुष्टि गर्नुहोस्'),
                      description: t('Are you sure you want to permanently clear all security audit records? This action cannot be reversed.', 'के तपाईं सबै सुरक्षा अडिट लगहरू मेटाउन निश्चित हुनुहुन्छ?'),
                      itemName: `${auditLogs.length} ${t('Audit Records', 'अडिट लगहरू')}`,
                      confirmText: t('Purge Audit Logs', 'लग सफा गर्नुहोस्'),
                      action: () => {
                        onClearAuditLogs();
                        onShowToast(t('Audit logs cleared.', 'अडिट लगहरू मेटाइयो।'));
                      }
                    });
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer"
                >
                  {t('Clear Logs', 'लग सफा गर्नुहोस्')}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User / Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {log.actor}
                        </span>
                        {log.role && (
                          <span className="block text-[10px] text-slate-400 uppercase font-mono">
                            {log.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {log.module || 'SYSTEM'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : log.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                          {log.result || log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No audit records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
