import React, { useState, useEffect } from 'react';
import { Language, Notice, StaffMember, Facility } from '../types';
import {
  Search,
  ArrowRight,
  FileText,
  Users,
  Building2,
  X
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (route: string) => void;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigate,
  notices,
  staff,
  facilities,
}) => {
  const [query, setQuery] = useState('');
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Close on Escape or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedNotices = q ? notices.filter(n =>
    n.title_en.toLowerCase().includes(q) ||
    n.title_np.includes(q) ||
    n.description_en.toLowerCase().includes(q) ||
    n.description_np.includes(q)
  ) : [];

  const matchedStaff = q ? staff.filter(s =>
    s.name_en.toLowerCase().includes(q) ||
    s.name_np.includes(q) ||
    s.designation_en.toLowerCase().includes(q) ||
    s.designation_np.includes(q)
  ) : [];

  const matchedFacilities = q ? facilities.filter(f =>
    f.title_en.toLowerCase().includes(q) ||
    f.title_np.includes(q) ||
    f.desc_en.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search notices, faculty, curriculum, facilities...', 'सूचना, शिक्षक, पाठ्यक्रम, पूर्वाधार खोज्नुहोस्...')}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            autoFocus
          />
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-mono hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {!q ? (
            <div className="text-center py-8 text-slate-400 space-y-3">
              <p>{t('Type a keyword to begin searching the institutional database.', 'खोजी गर्न शब्द टाइप गर्नुहोस्।')}</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['exam', 'admission', 'science', 'scholarship'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 hover:bg-[#1E40AF]/10 font-mono text-xs transition cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : matchedNotices.length === 0 && matchedStaff.length === 0 && matchedFacilities.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {t('No matching records found for', 'कुनै नतिजा फेला परेन:')} "{query}"
            </div>
          ) : (
            <>
              {matchedNotices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('Circulars & Notices', 'सूचनाहरू')} ({matchedNotices.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedNotices.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNavigate('notices');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#1E40AF]/10 dark:hover:bg-[#1E40AF]/10 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">{t(n.title_en, n.title_np)}</p>
                          <p className="text-[11px] text-slate-400">{t(n.date_en, n.date_np)} • {n.category.toUpperCase()}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedStaff.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('Faculty Members', 'शिक्षक तथा कर्मचारी')} ({matchedStaff.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedStaff.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('staff');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#1E40AF]/10 dark:hover:bg-[#1E40AF]/10 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">{t(s.name_en, s.name_np)}</p>
                          <p className="text-[11px] text-slate-400">{t(s.designation_en, s.designation_np)}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedFacilities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t('Campus Facilities', 'पूर्वाधार')} ({matchedFacilities.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedFacilities.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onNavigate('facilities');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#1E40AF]/10 dark:hover:bg-[#1E40AF]/10 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">{t(f.title_en, f.title_np)}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
