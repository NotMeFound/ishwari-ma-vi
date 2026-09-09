import React, { useState } from 'react';
import {
  Language,
  SecurityAuditLogEntry,
  AdminAccount,
  PermissionKey
} from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Trash2,
  Download,
  Clock,
  Shield,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { apiClient } from '../../services/apiClient';

interface AuditLogsTabProps {
  lang: Language;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs?: () => void;
  currentAccount: AdminAccount;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  lang,
  auditLogs,
  onClearAuditLogs,
  currentAccount,
  onShowToast,
  can
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const isSuperAdmin = currentAccount.role === 'super_admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLogEntry | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Extract unique modules for filter dropdown
  const availableModules = React.useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.module) set.add(l.module.toUpperCase());
    });
    return Array.from(set);
  }, [auditLogs]);

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    if (selectedModule !== 'all' && (log.module || '').toUpperCase() !== selectedModule) return false;
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (log.action || '').toLowerCase().includes(q) ||
      (log.actor || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').includes(q) ||
      (log.module || '').toLowerCase().includes(q) ||
      (log.result || '').toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all logs (Super Admin only)
  const handleClearLogs = () => {
    if (!isSuperAdmin) {
      onShowToast(t('Security rule: Only Super Administrator can clear system audit logs.', 'सुपर एडमिनले मात्र अडिट लग खाली गर्न पाउँछ।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Purge Audit History', 'अडिट लग खाली गर्नुहोस्'),
      description: t(
        'Are you sure you want to permanently clear all security and operational audit logs from the database? This audit trail cannot be recovered.',
        'के तपाईं सबै सुरक्षा तथा कार्य विवरण लगहरू स्थायी रूपमा मेटाउन चाहनुहुन्छ? यो अडिट विवरण पुनः प्राप्त गर्न सकिँदैन।'
      ),
      itemName: t('All Security Audit Records', 'सम्पूर्ण अडिट अभिलेख'),
      confirmText: t('Purge All Logs', 'सबै लग मेटाउनुहोस्'),
      action: async () => {
        const res = await apiClient.clearAuditLogs();
        if (res.success) {
          if (onClearAuditLogs) onClearAuditLogs();
          onShowToast(t('Audit logs purged successfully.', 'अडिट लगहरू सफलतापूर्वक हटाइयो।'));
        } else {
          onShowToast(t(`Failed to clear logs: ${res.error}`, `लग खाली गर्न असफल: ${res.error}`));
        }
      }
    });
  };

  // Export audit logs as CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      onShowToast(t('No logs to export.', 'निर्यात गर्न कुनै लग छैन।'));
      return;
    }

    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Module', 'Action', 'Status', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actor}"`,
      `"${l.role || ''}"`,
      `"${l.module || ''}"`,
      `"${l.action}"`,
      `"${l.status}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ishwari_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onShowToast(t('Audit logs CSV exported!', 'अडिट लग CSV फाइल डाउनलोड भयो!'));
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'danger':
      case 'failed':
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
            <XCircle className="w-3 h-3" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-800 uppercase">
            {status}
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

      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#1E40AF]" />
              <span>{t('Institutional Security & Operational Audit Trail', 'सुरक्षा तथा कार्य अडिट लग')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Tamper-evident record of administrative sign-ins, content updates, RBAC role alterations, and system events.',
                'प्रशासकीय गतिविधि, लगइन, सामग्री अद्यावधिक तथा प्रणाली परिवर्तनहरूको आधिकारिक अडिट अभिलेख।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Export CSV', 'CSV डाउनलोड')}</span>
            </button>

            {isSuperAdmin && auditLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('Clear Logs', 'लग खाली गर्नुहोस्')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('Search by actor, action, details or IP address...', 'प्रयोगकर्ता, कार्य वा विवरण अनुसार खोज्नुहोस्...')}
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
            {/* Module dropdown */}
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">{t('All Modules', 'सबै मोड्युल')}</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Severity dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="all">{t('All Status', 'सबै अवस्था')}</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger / Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">{t('Timestamp', 'समय')}</th>
                <th className="py-3 px-4">{t('Actor', 'कर्ता')}</th>
                <th className="py-3 px-4">{t('Module', 'मोड्युल')}</th>
                <th className="py-3 px-4">{t('Action', 'कार्य')}</th>
                <th className="py-3 px-4">{t('Status', 'अवस्था')}</th>
                <th className="py-3 px-4">{t('Details', 'विवरण')}</th>
                <th className="py-3 px-4 text-right">{t('View', 'हेर्नुहोस्')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {t('No audit records found', 'कुनै अडिट अभिलेख भेटिएन')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('System and administrative events will appear here automatically.', 'प्रणाली र प्रशासनिक कार्यहरू यहाँ स्वतः दर्ता हुनेछन्।')}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.actor}</span>
                      </div>
                      {log.role && (
                        <div className="text-[10px] font-mono text-slate-400">{log.role}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.module || 'SYSTEM'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>

                    <td className="py-3 px-4">
                      {renderStatusBadge(log.status)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details || log.result || '-'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                        title={t('View Full Log Entry', 'पूर्ण लग हेर्नुहोस्')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              {t(
                `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredLogs.length)} of ${filteredLogs.length} entries`,
                `कुल ${filteredLogs.length} मध्ये ${(currentPage - 1) * itemsPerPage + 1} देखि ${Math.min(currentPage * itemsPerPage, filteredLogs.length)} सम्म`
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Audit Log Entry Details', 'अडिट लग पूर्ण विवरण')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-mono text-[10px]">LOG ID: {selectedLog.id}</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white font-mono mt-0.5">{selectedLog.action}</div>
                </div>
                {renderStatusBadge(selectedLog.status)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('Actor', 'कर्ता')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLog.actor}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('Module', 'मोड्युल')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLog.module || 'SYSTEM'}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('Timestamp', 'समय')}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('IP Address', 'आईपी ठेगाना')}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.ipAddress || 'Internal Container'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('Event Description & Details', 'घटना विवरण')}</span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.details || 'No additional details provided.'}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
              >
                {t('Close', 'बन्द गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
