import React, { useState } from 'react';
import { Language, Notice } from '../types';
import {
  Bell,
  Download,
  Calendar,
  Pin,
  FileText,
  Search,
  CheckCircle2,
  X,
  Eye,
  ChevronDown,
  AlertCircle,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface NoticesViewProps {
  lang: Language;
  notices: Notice[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({ lang, notices }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null);

  // Modals state
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);
  const [downloadConfirmNotice, setDownloadConfirmNotice] = useState<Notice | null>(null);
  const [closeConfirmNotice, setCloseConfirmNotice] = useState<Notice | null>(null);

  // Hidden/Dismissed notices by visitor in current session
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<number[]>([]);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const categories = [
    { id: 'all', labelEn: 'All Notices', labelNp: 'सबै सूचनाहरू' },
    { id: 'academic', labelEn: 'Academic', labelNp: 'शैक्षिक' },
    { id: 'exam', labelEn: 'Examination', labelNp: 'परीक्षा' },
    { id: 'scholarship', labelEn: 'Scholarship', labelNp: 'छात्रवृत्ति' },
    { id: 'administrative', labelEn: 'Administration', labelNp: 'प्रशासनिक' },
  ];

  const handleCardClick = (noticeId: number) => {
    // If clicked the already active notice, toggle it off without modal, or keep active
    if (activeNoticeId === noticeId) {
      setActiveNoticeId(null);
    } else {
      setActiveNoticeId(noticeId);
    }
  };

  // Trigger download after confirmation
  const executeDownload = (notice: Notice) => {
    setDownloadConfirmNotice(null);

    if (notice.file_data) {
      const link = document.createElement('a');
      link.href = notice.file_data;
      link.download = notice.file_name?.toLowerCase().endsWith('.pdf')
        ? notice.file_name
        : `${notice.file_name || 'notice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadToast(t(`Downloaded PDF: ${notice.file_name}`, `PDF कागजात डाउनलोड भयो: ${notice.file_name}`));
      setTimeout(() => setDownloadToast(null), 3500);
      return;
    }

    const content = `=====================================================
ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Government Model Secondary School • EMIS: 48012004
=====================================================
Document Reference: ${notice.file_name || `NOTICE-${notice.id}`}
Subject: ${isNp ? notice.title_np : notice.title_en}
Published Date: ${isNp ? notice.date_np : notice.date_en}
Category: ${notice.category.toUpperCase()}

OFFICIAL BULLETIN DETAILS:
-----------------------------------------------------
${isNp ? notice.description_np : notice.description_en}

Certified By:
Principal / Examination Controller
Ishwari Secondary School Administration
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (notice.file_name || `notice-${notice.id}`).replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(t(`Downloaded: ${notice.file_name || 'Notice Document'}`, `कागजात सुरक्षित भयो: ${notice.file_name || 'सूचना कागजात'}`));
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Confirm dismissal/closing of a notice card
  const confirmCloseOrDismiss = () => {
    if (closeConfirmNotice) {
      // Collapse expanded card and hide from session view
      setActiveNoticeId(null);
      setDismissedNoticeIds(prev => [...prev, closeConfirmNotice.id]);
      setCloseConfirmNotice(null);
      setDownloadToast(t('Notice dismissed from view.', 'सूचना हटाइयो।'));
      setTimeout(() => setDownloadToast(null), 3000);
    }
  };

  const filteredNotices = notices
    .filter(n => !dismissedNoticeIds.includes(n.id))
    .filter(n => {
      const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        n.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.title_np.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description_en.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950 min-h-[75vh] relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* 1. Monochromatic Download Confirmation Modal */}
      {downloadConfirmNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mx-auto">
              <Download className="w-6 h-6 stroke-[1.75]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Download Notice Document?', 'सूचना डाउनलोड गर्न चाहनुहुन्छ?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-2">
                "{t(downloadConfirmNotice.title_en, downloadConfirmNotice.title_np)}"
              </p>
              {downloadConfirmNotice.file_size_kb && (
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {t('File size:', 'साइज:')} {downloadConfirmNotice.file_size_kb} KB • PDF
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDownloadConfirmNotice(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                onClick={() => executeDownload(downloadConfirmNotice)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm cursor-pointer"
              >
                {t('Download', 'डाउनलोड')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Monochromatic Close/Dismiss Confirmation Modal */}
      {closeConfirmNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mx-auto">
              <X className="w-6 h-6 stroke-[1.75]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Close or Dismiss Notice?', 'सूचना बन्द वा हटाउन चाहनुहुन्छ?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-2">
                {t(
                  'Are you sure you want to close and dismiss this notice from your current view?',
                  'के तपाईं यो सूचना आफ्नो स्क्रिनबाट बन्द गरी हटाउन निश्चित हुनुहुन्छ?'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCloseConfirmNotice(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                onClick={confirmCloseOrDismiss}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm cursor-pointer"
              >
                {t('Confirm', 'निश्चित गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Monochromatic View Notice Details Modal */}
      {previewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                    {previewNotice.category.toUpperCase()}
                  </span>
                  {previewNotice.pinned && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                      PINNED
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {t(previewNotice.title_en, previewNotice.title_np)}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t(previewNotice.date_en, previewNotice.date_np)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Ref: ISS-NOTICE-{previewNotice.id}-2083</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {previewNotice.file_size_kb ? `${previewNotice.file_size_kb} KB` : 'Verified Bulletin'}
                  </span>
                </div>
                <p className="truncate text-slate-500">{previewNotice.file_name || 'Official Bulletin Document'}</p>
              </div>

              <div className="whitespace-pre-line">
                {t(previewNotice.description_en, previewNotice.description_np)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t('Close', 'बन्द')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const toDownload = previewNotice;
                  setPreviewNotice(null);
                  setDownloadConfirmNotice(toDownload);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[1.75]" />
                <span>{t('Download Attachment', 'कागजात डाउनलोड')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header and Filter Controls */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Bell className="w-3.5 h-3.5 stroke-[2]" />
              <span>{t('Public Circulars & Bulletins', 'सार्वजनिक सूचना पाटी')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {t('Official Circulars & Notices', 'आधिकारिक सूचना तथा परिपत्रहरू')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('Tap any notice box to reveal actions (View, Download, or Close).', 'विवरण हेर्न वा डाउनलोड गर्न सूचना बाकसमा ट्याप गर्नुहोस्।')}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search notices...', 'सूचना खोज्नुहोस्...')}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Category Filter Pills & Reset Dismissed */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer select-none ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t(c.labelEn, c.labelNp)}
              </button>
            ))}
          </div>

          {dismissedNoticeIds.length > 0 && (
            <button
              type="button"
              onClick={() => setDismissedNoticeIds([])}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 underline cursor-pointer"
            >
              {t(`Reset ${dismissedNoticeIds.length} hidden notices`, `लुकाइएका सूचनाहरू देखाउनुहोस्`)}
            </button>
          )}
        </div>

        {/* Notices Small & Perfect Size Box Grid */}
        {filteredNotices.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {t('No circulars found matching your filter.', 'खोजिए अनुसारको कुनै सूचना भेटिएन।')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotices.map((notice) => {
              const isSelected = activeNoticeId === notice.id;

              return (
                <div
                  key={notice.id}
                  onClick={() => handleCardClick(notice.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(notice.id);
                    }
                  }}
                  aria-expanded={isSelected}
                  className={`relative rounded-xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer select-none overflow-hidden ${
                    isSelected
                      ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/10 shadow-md translate-y-[-1px]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar inside Box: Category & Date */}
                  <div className="p-3.5 pb-2 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {notice.category}
                      </span>
                      {notice.pinned && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>PIN</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{t(notice.date_en, notice.date_np)}</span>
                    </span>
                  </div>

                  {/* Body: Small & Perfect Size Box Info */}
                  <div className="p-3.5 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {t(notice.title_en, notice.title_np)}
                    </h3>

                    {/* Metadata Pill */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {notice.file_size_kb ? `${notice.file_size_kb} KB • PDF` : 'PDF Notice'}
                        </span>
                      </span>

                      {!isSelected && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 group-hover:text-slate-700">
                          <span>Actions</span>
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Monochromatic Action Icons Toolbar: Appears only when notice is clicked/tapped */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 bg-slate-100/90 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-medium">
                        {t('Actions', 'कार्यहरू')}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* 1. Close/Hide icon with confirmation */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCloseConfirmNotice(notice);
                          }}
                          title={t('Close / Dismiss notice', 'सूचना बन्द / हटाउनुहोस्')}
                          aria-label="Close / dismiss notice"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        {/* 2. Eye icon for view details */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewNotice(notice);
                          }}
                          title={t('View full notice', 'पूर्ण सूचना हेर्नुहोस्')}
                          aria-label="View full notice"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        {/* 3. Download icon with confirmation */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDownloadConfirmNotice(notice);
                          }}
                          title={t('Download notice attachment', 'सूचना डाउनलोड गर्नुहोस्')}
                          aria-label="Download notice attachment"
                          className="p-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
