import React, { useState } from 'react';
import { Language, Notice } from '../types';
import {
  Bell,
  Download,
  Calendar,
  Tag,
  Pin,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  X,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

interface NoticesViewProps {
  lang: Language;
  notices: Notice[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({ lang, notices }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Notice | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const categories = [
    { id: 'all', labelEn: 'All Circulars', labelNp: 'सबै सूचनाहरू' },
    { id: 'academic', labelEn: 'Academic', labelNp: 'शैक्षिक' },
    { id: 'exam', labelEn: 'Examinations', labelNp: 'परीक्षा' },
    { id: 'scholarship', labelEn: 'Scholarships', labelNp: 'छात्रवृत्ति' },
    { id: 'administrative', labelEn: 'Administrative', labelNp: 'प्रशासनिक' },
  ];

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'exam':
        return 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'scholarship':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'administrative':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      default:
        return 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
  };

  const handleDownloadNotice = (notice: Notice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const content = `=====================================================
ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Government Model Secondary School • EMIS: 48012004
=====================================================
Document Reference: ${notice.file_name}
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
    link.download = notice.file_name.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(t(`Downloaded: ${notice.file_name}`, `कागजात सुरक्षित भयो: ${notice.file_name}`));
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const filteredNotices = notices.filter(n => {
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      n.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title_np.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-white dark:bg-slate-950 relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Notice Preview Modal */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getCategoryStyle(selectedNoticeModal.category)}`}>
                  {selectedNoticeModal.category.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {t(selectedNoticeModal.title_en, selectedNoticeModal.title_np)}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t(selectedNoticeModal.date_en, selectedNoticeModal.date_np)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/50">
              <p>{t(selectedNoticeModal.description_en, selectedNoticeModal.description_np)}</p>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300">
                <p className="font-semibold">{t('Official Institutional Reference', 'आधिकारिक विद्यालय सन्दर्भ:')}</p>
                <p className="font-mono text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                  Ref: ISS-NOTICE-{selectedNoticeModal.id}-2083 • {selectedNoticeModal.file_name}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t('Close Window', 'बन्द गर्नुहोस्')}
              </button>
              <button
                onClick={() => handleDownloadNotice(selectedNoticeModal)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('Download Circular Copy', 'कागजात डाउनलोड')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-400">
              <Bell className="w-3.5 h-3.5" />
              <span>{t('Public Circulars & Bulletins', 'सार्वजनिक सूचना पाटी')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Official Circulars & Notices', 'आधिकारिक सूचना तथा परिपत्रहरू')}
            </h1>
          </div>

          {/* Search in notices */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Filter notices...', 'सूचना खोज्नुहोस्...')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t(c.labelEn, c.labelNp)}
            </button>
          ))}
        </div>

        {/* Notices Listing */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              {t('No circulars found matching your filter.', 'खोजिए अनुसारको कुनै सूचना भेटिएन।')}
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <article
                key={notice.id}
                onClick={() => setSelectedNoticeModal(notice)}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3.5 hover:border-blue-400/50 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getCategoryStyle(notice.category)}`}>
                      {notice.category.toUpperCase()}
                    </span>
                    {notice.pinned && (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1 shadow-2xs">
                        <Pin className="w-2.5 h-2.5" />
                        <span>PINNED</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t(notice.date_en, notice.date_np)}</span>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition">
                  {t(notice.title_en, notice.title_np)}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(notice.description_en, notice.description_np)}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>{notice.file_name}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoticeModal(notice);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('View Details', 'विवरण')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDownloadNotice(notice, e)}
                      className="inline-flex items-center gap-1.5 font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('Download Circular', 'कागजात डाउनलोड')}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

