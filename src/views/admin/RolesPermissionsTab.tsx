import React, { useState } from 'react';
import {
  Language,
  AdminAccount,
  AdminRole,
  PermissionKey
} from '../../types';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Users,
  Check,
  X,
  Info,
  Lock,
  Search,
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '../../utils/security';
import { apiClient } from '../../services/apiClient';

interface RolesPermissionsTabProps {
  lang: Language;
  accounts: AdminAccount[];
  onUpdateAccounts: (accounts: AdminAccount[]) => any;
  currentAccount: AdminAccount;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const RolesPermissionsTab: React.FC<RolesPermissionsTabProps> = ({
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
  const canUpdateRoles = isSuperAdmin || (can && can('role.update'));

  const [selectedRole, setSelectedRole] = useState<AdminRole>('admin');
  const [activeTab, setActiveTab] = useState<'matrix' | 'role_editor'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');

  // Editable permission matrix for roles (allows updating role defaults across existing accounts of that role)
  const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, PermissionKey[]>>({
    super_admin: ALL_PERMISSIONS.map((p) => p.key),
    admin: [...(ROLE_DEFAULT_PERMISSIONS['admin'] || [])],
    editor: [...(ROLE_DEFAULT_PERMISSIONS['editor'] || [])],
    viewer: [...(ROLE_DEFAULT_PERMISSIONS['viewer'] || [])]
  });

  const [isSaving, setIsSaving] = useState(false);

  // Group all permissions by module category
  const permissionGroups = React.useMemo(() => {
    const groups: Record<string, typeof ALL_PERMISSIONS> = {};
    ALL_PERMISSIONS.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  // Filter permissions by search
  const filteredPermissions = ALL_PERMISSIONS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.key.toLowerCase().includes(q) ||
      p.labelEn.toLowerCase().includes(q) ||
      p.labelNp.toLowerCase().includes(q) ||
      p.group.toLowerCase().includes(q) ||
      p.descEn.toLowerCase().includes(q)
    );
  });

  const roleDefinitions: {
    role: AdminRole;
    nameEn: string;
    nameNp: string;
    level: string;
    descEn: string;
    descNp: string;
    badgeClass: string;
  }[] = [
    {
      role: 'super_admin',
      nameEn: 'Super Administrator',
      nameNp: 'सुपर एडमिनिस्ट्रेटर',
      level: 'Tier 1 — Full System Sovereignty',
      descEn: 'Unrestricted control over the server, database schemas, RBAC assignments, audit trails, and security configurations.',
      descNp: 'प्रणाली, डाटाबेस, सुरक्षा, र अडिट लगमा पूर्ण नियन्त्रण।',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
    },
    {
      role: 'admin',
      nameEn: 'School Administrator',
      nameNp: 'विद्यालय प्रशासक',
      level: 'Tier 2 — Operational Management',
      descEn: 'Responsible for day-to-day institutional administration, student notices, staff roster, curriculum, inquiries, and gallery.',
      descNp: 'दैनिक प्रशासनिक कार्यहरू, सूचना, शिक्षक कर्मचारी, र सन्देश व्यवस्थापन।',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
    },
    {
      role: 'editor',
      nameEn: 'Content Editor',
      nameNp: 'सामग्री सम्पादक',
      level: 'Tier 3 — Media & Announcements',
      descEn: 'Authorized to publish notices, academic events, photo galleries, and update general institutional announcements.',
      descNp: 'सूचना, कार्यक्रम, र तस्बिर ग्यालरी प्रकाशन गर्ने अधिकार।',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
    },
    {
      role: 'viewer',
      nameEn: 'Viewer / Auditor',
      nameNp: 'अवलोकनकर्ता',
      level: 'Tier 4 — Read Only',
      descEn: 'Read-only visibility across institutional records, admission inquiries, and system dashboards without modification rights.',
      descNp: 'सामग्री हेर्न मात्र मिल्ने, कुनै परिमार्जन अधिकार नभएको।',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
    }
  ];

  // Count accounts assigned to each role
  const getAccountCountForRole = (role: AdminRole) => {
    return accounts.filter((a) => a.role === role).length;
  };

  // Toggle permission for selected role in editor
  const handleToggleRolePermission = (permKey: PermissionKey) => {
    if (selectedRole === 'super_admin') {
      onShowToast(t('Super Admin role must retain all system permissions.', 'सुपर एडमिनबाट कुनै पनि अनुमति हटाउन मिल्दैन।'));
      return;
    }
    if (!canUpdateRoles) {
      onShowToast(t('Permission denied: You cannot alter role permission sets.', 'अनुमति छैन: भूमिका अनुमति परिवर्तन गर्न मिल्दैन।'));
      return;
    }

    const currentPerms = rolePermissions[selectedRole] || [];
    const hasPerm = currentPerms.includes(permKey);
    const updated = hasPerm
      ? currentPerms.filter((k) => k !== permKey)
      : [...currentPerms, permKey];

    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: updated
    });
  };

  // Reset to factory defaults for selected role
  const handleResetRoleToDefaults = () => {
    if (selectedRole === 'super_admin') return;
    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: [...(ROLE_DEFAULT_PERMISSIONS[selectedRole] || [])]
    });
    onShowToast(t(`Reset permissions for ${selectedRole} to defaults.`, `${selectedRole} को पूर्वनिर्धारित अनुमति पुनर्स्थापित गरियो।`));
  };

  // Apply role permissions to all existing accounts of that role
  const handleApplyPermissionsToAccounts = async () => {
    if (!canUpdateRoles) {
      onShowToast(t('Permission denied: You cannot update role definitions.', 'अनुमति छैन: भूमिका अनुमति लागू गर्न मिल्दैन।'));
      return;
    }

    setIsSaving(true);
    const targetPerms = rolePermissions[selectedRole] || [];

    const updatedAccounts = accounts.map((acc) => {
      if (acc.role === selectedRole && acc.role !== 'super_admin') {
        return {
          ...acc,
          permissions: [...targetPerms]
        };
      }
      return acc;
    });

    const res = await onUpdateAccounts(updatedAccounts);
    setIsSaving(false);

    if (res && res.success === false) {
      onShowToast(t(`Failed to sync accounts: ${res.error}`, `अद्यावधिक असफल: ${res.error}`));
      return;
    }

    await apiClient.recordAuditLog({
      action: 'ROLE_PERMISSIONS_SYNCED',
      module: 'RBAC',
      status: 'success',
      details: `Role [${selectedRole}] permissions synchronized across ${getAccountCountForRole(selectedRole)} administrator accounts by @${currentAccount.username}.`
    });

    onShowToast(
      t(
        `Permissions synchronized across all ${getAccountCountForRole(selectedRole)} accounts with role "${selectedRole}".`,
        `"${selectedRole}" भूमिका भएका सबै ${getAccountCountForRole(selectedRole)} खाताहरूमा अनुमति लागू गरियो।`
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-nav */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#1E40AF]" />
              <span>{t('Roles & Permissions Matrix (RBAC)', 'भूमिका तथा अनुमति म्याट्रिक्स')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Define security role hierarchies, examine capability matrices across tiers, and enforce principle of least privilege.',
                'विद्यालय प्रणालीको सुरक्षा भूमिका, अधिकार म्याट्रिक्स तथा पहुँच नियमहरूको व्यवस्थापन।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('Permission Matrix', 'अनुमति म्याट्रिक्स')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('role_editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'role_editor'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('Role Template Editor', 'भूमिका सम्पादक')}
            </button>
          </div>
        </div>

        {/* Roles Overview Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {roleDefinitions.map((rd) => {
            const count = getAccountCountForRole(rd.role);
            const isSelected = selectedRole === rd.role;

            return (
              <div
                key={rd.role}
                onClick={() => setSelectedRole(rd.role)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1E40AF] bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-[#1E40AF]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${rd.badgeClass}`}>
                      {rd.role.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{isNp ? rd.nameNp : rd.nameEn}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {isNp ? rd.descNp : rd.descEn}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-slate-400">
                  {rd.level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. PERMISSION MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('System Capability & Role Access Matrix', 'प्रणाली अधिकार तथा भूमिका म्याट्रिक्स')}
              </h4>
              <p className="text-xs text-slate-500">
                {t('Overview of which roles are permitted to execute operations across Ishwari School modules.', 'प्रत्येक भूमिकाले कुन मोड्युलमा के कार्य गर्न पाउँछ भन्ने पूर्ण विवरण।')}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Filter capabilities...', 'अधिकार खोज्नुहोस्...')}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4 min-w-[220px]">{t('Module & Action', 'मोड्युल र कार्य')}</th>
                  <th className="py-3 px-3 text-center">{t('Key Identifier', 'अधिकार कोड')}</th>
                  <th className="py-3 px-3 text-center bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300">
                    Super Admin
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                    School Admin
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                    Editor
                  </th>
                  <th className="py-3 px-3 text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300">
                    Viewer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPermissions.map((perm) => {
                  const inSuper = true; // Super admin has all
                  const inAdmin = (rolePermissions.admin || []).includes(perm.key);
                  const inEditor = (rolePermissions.editor || []).includes(perm.key);
                  const inViewer = (rolePermissions.viewer || []).includes(perm.key);

                  return (
                    <tr key={perm.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {perm.group}
                          </span>
                          <span>{isNp ? perm.labelNp : perm.labelEn}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {perm.descEn}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                        {perm.key}
                      </td>

                      <td className="py-2.5 px-3 text-center bg-purple-50/20 dark:bg-purple-950/10">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          <Check className="w-3 h-3" />
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center bg-blue-50/20 dark:bg-blue-950/10">
                        {inAdmin ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center bg-emerald-50/20 dark:bg-emerald-950/10">
                        {inEditor ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center bg-amber-50/20 dark:bg-amber-950/10">
                        {inViewer ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ROLE TEMPLATE EDITOR */}
      {activeTab === 'role_editor' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t(`Customizing Permissions for: ${selectedRole.toUpperCase()}`, `${selectedRole.toUpperCase()} को अधिकार सम्पादन`)}</span>
                {selectedRole === 'super_admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED (FULL ACCESS)
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Select or unselect capabilities below. You can synchronize these permissions across all administrators holding this role.',
                  'तलका अधिकारहरू छान्नुहोस् र यो भूमिका भएका सबै खाताहरूमा एकसाथ लागू गर्नुहोस्।'
                )}
              </p>
            </div>

            {selectedRole !== 'super_admin' && canUpdateRoles && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetRoleToDefaults}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('Reset Defaults', 'पूर्वनिर्धारित')}</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleApplyPermissionsToAccounts}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs disabled:opacity-50 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {isSaving
                      ? t('Saving...', 'लागू हुँदैछ...')
                      : t(`Apply to All ${getAccountCountForRole(selectedRole)} Accounts`, `सबै ${getAccountCountForRole(selectedRole)} खातामा लागू गर्नुहोस्`)}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Grouped Permission Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(permissionGroups).map(([groupName, perms]) => {
              const currentRolePerms = rolePermissions[selectedRole] || [];
              const groupPermKeys = perms.map((p) => p.key);
              const allCheckedInGroup = groupPermKeys.every((k) => currentRolePerms.includes(k));

              return (
                <div
                  key={groupName}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{groupName}</span>
                    </h5>

                    {selectedRole !== 'super_admin' && canUpdateRoles && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = allCheckedInGroup
                            ? currentRolePerms.filter((k) => !groupPermKeys.includes(k))
                            : Array.from(new Set([...currentRolePerms, ...groupPermKeys]));
                          setRolePermissions({
                            ...rolePermissions,
                            [selectedRole]: updated
                          });
                        }}
                        className="text-[11px] text-[#1E40AF] hover:underline font-medium"
                      >
                        {allCheckedInGroup ? t('Unselect Group', 'हटाउनुहोस्') : t('Select Group', 'सबै छान्नुहोस्')}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {perms.map((p) => {
                      const isChecked = currentRolePerms.includes(p.key);
                      const isLocked = selectedRole === 'super_admin' || !canUpdateRoles;

                      return (
                        <label
                          key={p.key}
                          className={`flex items-start gap-2.5 text-xs p-1.5 rounded-lg transition ${
                            isLocked ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={isChecked}
                            onChange={() => handleToggleRolePermission(p.key)}
                            className="rounded text-[#1E40AF] mt-0.5"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {isNp ? p.labelNp : p.labelEn}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {p.descEn}
                            </div>
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
    </div>
  );
};
