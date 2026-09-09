import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  ContactMessage,
  PermissionKey
} from '../../types';
import {
  Mail,
  Phone,
  Clock,
  Trash2,
  CheckCircle2,
  Save,
  MessageSquare,
  Search,
  Eye,
  Reply,
  Send,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface AdminCommunicationTabProps {
  lang: Language;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => Promise<{ success: boolean; error?: string }> | void;
  messages: ContactMessage[];
  onUpdateMessages: (msgs: ContactMessage[]) => Promise<{ success: boolean; error?: string }> | void;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const AdminCommunicationTab: React.FC<AdminCommunicationTabProps> = ({
  lang,
  school,
  onUpdateSchool,
  messages,
  onUpdateMessages,
  onShowToast,
  can
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const canUpdate = !can || can('message.update');
  const canDelete = !can || can('message.delete');
  const canUpdateSchool = !can || can('school.update') || can('settings.update');

  const [activeSection, setActiveSection] = useState<'inbox' | 'coordinates'>('inbox');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected message for viewing details modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Reply modal state
  const [replyingMessage, setReplyingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // School contact form state
  const [contactForm, setContactForm] = useState({
    phone: school.phone || '',
    email: school.email || '',
    address_en: school.address_en || '',
    address_np: school.address_np || '',
    location_en: school.location_en || 'Ward No. 4, Bagmati Province, Nepal',
    location_np: school.location_np || 'वडा नं. ४, बागमती प्रदेश, नेपाल'
  });

  const [isSavingCoordinates, setIsSavingCoordinates] = useState(false);

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

  // Calculate stats
  const unreadCount = messages.filter((m) => m.status === 'new').length;
  const reviewedCount = messages.filter((m) => m.status === 'reviewed').length;
  const resolvedCount = messages.filter((m) => m.status === 'resolved').length;

  // Filter and search
  const filteredMessages = messages.filter((m) => {
    const matchesFilter = filterStatus === 'all' || m.status === filterStatus;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / itemsPerPage));
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateMessageStatus = async (id: number, status: 'new' | 'reviewed' | 'resolved') => {
    if (!canUpdate) {
      onShowToast(t('Permission denied: You cannot update message status.', 'अनुमति छैन: स्थिति परिवर्तन गर्न मिल्दैन।'));
      return;
    }
    const updated = messages.map((m) => (m.id === id ? { ...m, status } : m));
    const res = await onUpdateMessages(updated);
    if (res && res.success === false) {
      onShowToast(t(`Update failed: ${res.error}`, `विफल भयो: ${res.error}`));
      return;
    }
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
    }
    const statusLabels = {
      new: t('Marked as Unread', 'नपढिएको चिह्नित गरियो'),
      reviewed: t('Marked as Reviewed', 'समीक्षा गरिएको चिह्नित गरियो'),
      resolved: t('Marked as Resolved', 'समाधान गरिएको चिह्नित गरियो')
    };
    onShowToast(statusLabels[status]);
  };

  const handleDeleteMessage = (id: number) => {
    if (!canDelete) {
      onShowToast(t('Permission denied: You cannot delete messages.', 'अनुमति छैन: सन्देश मेटाउन मिल्दैन।'));
      return;
    }
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Message', 'सन्देश मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this contact message from the inbox? This action will remove it permanently.', 'के तपाईं यस सन्देशलाई इनबक्सबाट स्थायी रूपमा हटाउन चाहनुहुन्छ?'),
      itemName: t('Contact Message', 'सम्पर्क सन्देश'),
      confirmText: t('Delete Permanently', 'स्थायी रूपमा मेटाउनुहोस्'),
      action: async () => {
        const updated = messages.filter((m) => m.id !== id);
        const res = await onUpdateMessages(updated);
        if (res && res.success === false) {
          onShowToast(t(`Delete failed: ${res.error}`, `मेटाउन असफल भयो: ${res.error}`));
          return;
        }
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        onShowToast(t('Message permanently removed from database.', 'सन्देश स्थायी रूपमा हटाइयो।'));
      }
    });
  };

  const handleOpenReplyModal = (msg: ContactMessage) => {
    setReplyingMessage(msg);
    setReplyText(msg.replyNotes || '');
  };

  const handleSendReply = async () => {
    if (!replyingMessage || !replyText.trim()) return;
    setIsSubmittingReply(true);

    const updated = messages.map((m) =>
      m.id === replyingMessage.id
        ? {
            ...m,
            status: 'resolved' as const,
            replyNotes: replyText.trim(),
            repliedAt: new Date().toISOString()
          }
        : m
    );

    const res = await onUpdateMessages(updated);
    setIsSubmittingReply(false);

    if (res && res.success === false) {
      onShowToast(t(`Reply recording failed: ${res.error}`, `जवाफ सुरक्षित गर्न असफल: ${res.error}`));
      return;
    }

    // Launch mailto client
    const mailtoSubject = encodeURIComponent(`Re: ${replyingMessage.subject} - Ishwari Ma. Vi.`);
    const mailtoBody = encodeURIComponent(`Dear ${replyingMessage.name},\n\n${replyText}\n\nWarm regards,\nIshwari Secondary School Administration\nBaijanath-5, Banke`);
    window.location.href = `mailto:${replyingMessage.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setReplyingMessage(null);
    onShowToast(t('Reply recorded and mail client opened.', 'जवाफ सुरक्षित भयो र इमेल खोलियो।'));
  };

  const handleSaveContactCoordinates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdateSchool) {
      onShowToast(t('Permission denied: You cannot edit school coordinates.', 'अनुमति छैन: विद्यालय विवरण सम्पादन गर्न मिल्दैन।'));
      return;
    }

    setIsSavingCoordinates(true);
    const updatedSchool = {
      ...school,
      ...contactForm
    };

    const res = await onUpdateSchool(updatedSchool);
    setIsSavingCoordinates(false);

    if (res && res.success === false) {
      onShowToast(t(`Failed to update coordinates: ${res.error}`, `विवरण अद्यावधिक गर्न असफल: ${res.error}`));
      return;
    }

    onShowToast(t('Official contact coordinates updated on public portal!', 'सम्पर्क विवरण सफलतापूर्वक अद्यावधिक गरियो!'));
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

      {/* Sub navigation pills */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('inbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSection === 'inbox'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t('Inquiries Inbox', 'सन्देश इनबक्स')}</span>
            {unreadCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-white font-bold">
                {unreadCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {messages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('coordinates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSection === 'coordinates'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('Official Contact Details', 'आधिकारिक सम्पर्क विवरण')}</span>
          </button>
        </div>

        {activeSection === 'inbox' && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {t('Total Inquiries:', 'कुल सन्देश:')} <span className="font-bold text-slate-900 dark:text-white">{messages.length}</span> | {t('Unread:', 'नपढिएको:')} <span className="font-bold text-amber-600">{unreadCount}</span>
          </div>
        )}
      </div>

      {/* 1. INBOX SECTION */}
      {activeSection === 'inbox' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Public Contact & Admission Inquiries Inbox', 'सार्वजनिक सोधपुछ तथा सन्देशहरू')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Submissions received from students, parents, and visitors through the website contact portal.', 'सार्वजनिक पोर्टलबाट प्राप्त सन्देशहरूको आधिकारिक व्यवस्थापन।')}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: t('All', 'सबै'), count: messages.length },
                  { id: 'new', label: t('New / Unread', 'नयाँ'), count: unreadCount },
                  { id: 'reviewed', label: t('Reviewed', 'समीक्षित'), count: reviewedCount },
                  { id: 'resolved', label: t('Resolved', 'समाधानित'), count: resolvedCount }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFilterStatus(f.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold font-mono transition ${
                    filterStatus === f.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1 py-0.2 rounded-full text-[10px] ${
                    filterStatus === f.id
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('Search by sender name, email, phone, subject or message text...', 'नाम, इमेल, फोन, विषय वा सन्देश अनुसार खोज्नुहोस्...')}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#1E40AF]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Message List Table */}
          {paginatedMessages.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Mail className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {searchQuery || filterStatus !== 'all'
                  ? t('No inquiries match your criteria', 'खोजिएको मापदण्ड अनुसार कुनै सन्देश भेटिएन')
                  : t('No inquiries in the inbox', 'इनबक्समा कुनै सन्देश छैन')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('New contact form submissions from the public website will appear here in real-time.', 'वेबसाइटको सम्पर्क फारमबाट आउने नयाँ सन्देशहरू यहाँ स्वतः देखा पर्नेछन्।')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {paginatedMessages.map((msg) => {
                const isNew = msg.status === 'new';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isNew
                        ? 'bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/20'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        msg.status === 'new'
                          ? 'bg-amber-500'
                          : msg.status === 'reviewed'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`} />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {msg.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            &bull; {msg.phone}
                          </span>
                          {msg.email && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              &bull; {msg.email}
                            </span>
                          )}
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            msg.status === 'new'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : msg.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}>
                            {msg.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {msg.subject || t('General Inquiry', 'सामान्य सोधपुछ')}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {msg.message}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {msg.date || 'Recently'}
                          </span>
                          {msg.repliedAt && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('Replied', 'जवाफ पठाइयो')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(msg)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title={t('View Full Message Details', 'पूर्ण विवरण हेर्नुहोस्')}
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('View', 'हेर्नुहोस्')}</span>
                      </button>

                      {canUpdate && (
                        <>
                          {msg.status === 'new' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateMessageStatus(msg.id, 'reviewed')}
                              className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition"
                              title={t('Mark as Reviewed', 'समीक्षा गरिएको चिह्नित गर्नुहोस्')}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('Mark Read', 'पढियो')}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateMessageStatus(msg.id, 'new')}
                              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 transition"
                              title={t('Mark as Unread', 'नपढिएको चिह्नित गर्नुहोस्')}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="hidden sm:inline">{t('Unread', 'नपढिएको')}</span>
                            </button>
                          )}

                          {msg.email && (
                            <button
                              type="button"
                              onClick={() => handleOpenReplyModal(msg)}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition"
                              title={t('Reply to Sender', 'जवाफ पठाउनुहोस्')}
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>{t('Reply', 'जवाफ')}</span>
                            </button>
                          )}
                        </>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title={t('Delete message', 'सन्देश मेटाउनुहोस्')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredMessages.length)} of ${filteredMessages.length} inquiries`,
                  `कुल ${filteredMessages.length} मध्ये ${(currentPage - 1) * itemsPerPage + 1} देखि ${Math.min(currentPage * itemsPerPage, filteredMessages.length)} सम्म देखाइएको`
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
      )}

      {/* 2. OFFICIAL COORDINATES SECTION */}
      {activeSection === 'coordinates' && (
        <form onSubmit={handleSaveContactCoordinates} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Official School Contact Information & Location', 'आधिकारिक सम्पर्क विवरण तथा स्थान')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('These coordinates are displayed across the public website header, footer, contact page, and admission inquiries.', 'यहाँ राखिएको सम्पर्क विवरण सार्वजनिक वेबसाइटको हेडर, फुटर र सम्पर्क पृष्ठमा प्रदर्शित हुन्छ।')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Primary Office Phone / Mobile', 'मुख्य सम्पर्क फोन / मोबाइल')}
              </label>
              <input
                type="text"
                disabled={!canUpdateSchool}
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="081-XXXXXX, 98XXXXXXXX"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Email Address', 'आधिकारिक इमेल ठेगाना')}
              </label>
              <input
                type="email"
                disabled={!canUpdateSchool}
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="info@ishwari.edu.np"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Physical Address (English)', 'भौगोलिक ठेगाना (अंग्रेजी)')}
              </label>
              <input
                type="text"
                disabled={!canUpdateSchool}
                value={contactForm.address_en}
                onChange={(e) => setContactForm({ ...contactForm, address_en: e.target.value })}
                placeholder="Baijanath Rural Municipality–5, H Gaun, Banke, Nepal"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Physical Address (Nepali)', 'भौगोलिक ठेगाना (नेपाली)')}
              </label>
              <input
                type="text"
                disabled={!canUpdateSchool}
                value={contactForm.address_np}
                onChange={(e) => setContactForm({ ...contactForm, address_np: e.target.value })}
                placeholder="बैजनाथ गाउँपालिका–५, एच गाउँ, बाँके, नेपाल"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Province / District Location (English)', 'प्रदेश तथा जिल्ला (अंग्रेजी)')}
              </label>
              <input
                type="text"
                disabled={!canUpdateSchool}
                value={contactForm.location_en}
                onChange={(e) => setContactForm({ ...contactForm, location_en: e.target.value })}
                placeholder="Lumbini Province, Banke, Nepal"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Province / District Location (Nepali)', 'प्रदेश तथा जिल्ला (नेपाली)')}
              </label>
              <input
                type="text"
                disabled={!canUpdateSchool}
                value={contactForm.location_np}
                onChange={(e) => setContactForm({ ...contactForm, location_np: e.target.value })}
                placeholder="लुम्बिनी प्रदेश, बाँके, नेपाल"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={!canUpdateSchool || isSavingCoordinates}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingCoordinates ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Coordinates to Database', 'सम्पर्क विवरण सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Inquiry Details', 'सन्देश पूर्ण विवरण')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <div className="text-xs text-slate-400 font-medium">{t('Sender', 'पठाउने व्यक्ति')}</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedMessage.name}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  selectedMessage.status === 'new'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    : selectedMessage.status === 'reviewed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  {selectedMessage.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('Phone Number', 'फोन नम्बर')}</span>
                  <a href={`tel:${selectedMessage.phone}`} className="font-semibold text-[#1E40AF] hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">{t('Email Address', 'इमेल ठेगाना')}</span>
                  {selectedMessage.email ? (
                    <a href={`mailto:${selectedMessage.email}`} className="font-semibold text-[#1E40AF] hover:underline truncate block">
                      {selectedMessage.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-italic">Not provided</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">{t('Subject', 'विषय')}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  {selectedMessage.subject || t('General Inquiry', 'सामान्य सोधपुछ')}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">{t('Full Message Text', 'सन्देश सामग्री')}</div>
                <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.replyNotes && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('School Response Recorded', 'विद्यालयको जवाफ दर्ता गरिएको')}</span>
                    {selectedMessage.repliedAt && (
                      <span className="font-normal font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        ({new Date(selectedMessage.repliedAt).toLocaleString()})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                    {selectedMessage.replyNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {canUpdate && (
                  <>
                    {selectedMessage.status === 'new' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'reviewed')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        {t('Mark Reviewed', 'समीक्षित चिह्नित गर्नुहोस्')}
                      </button>
                    )}
                    {selectedMessage.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      >
                        {t('Mark Resolved', 'समाधानित चिह्नित गर्नुहोस्')}
                      </button>
                    )}
                    {selectedMessage.status !== 'new' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'new')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                      >
                        {t('Mark Unread', 'नपढिएको बनाउनुहोस्')}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedMessage.email && canUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      const m = selectedMessage;
                      setSelectedMessage(null);
                      handleOpenReplyModal(m);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] text-white hover:bg-blue-700 flex items-center gap-1.5 transition"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{t('Reply via Email', 'इमेल जवाफ')}</span>
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('Delete', 'मेटाउनुहोस्')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-[#1E40AF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t(`Reply to ${replyingMessage.name}`, `${replyingMessage.name}लाई जवाफ दिनुहोस्`)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReplyingMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div><span className="text-slate-400">Recipient:</span> <span className="font-bold text-slate-900 dark:text-white">{replyingMessage.name} &lt;{replyingMessage.email}&gt;</span></div>
                <div><span className="text-slate-400">Subject:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">Re: {replyingMessage.subject}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Official Response Message', 'आधिकारिक जवाफ सामग्री')}
                </label>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('Type your formal response here...', 'यहाँ आधिकारिक जवाफ लेख्नुहोस्...')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#1E40AF]"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                {t(
                  'Saving will mark this inquiry as resolved, save your reply in the institutional records, and launch your mail client with pre-filled details.',
                  'जवाफ सुरक्षित गरेपछि यो सन्देश समाधानित चिह्नित हुनेछ र इमेल क्लाइन्ट खुल्नेछ।'
                )}
              </p>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingMessage(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                disabled={!replyText.trim() || isSubmittingReply}
                onClick={handleSendReply}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReply ? t('Saving...', 'सुरक्षित हुँदैछ...') : t('Save Response & Open Mail', 'जवाफ सुरक्षित गर्नुहोस् र पठाउनुहोस्')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
