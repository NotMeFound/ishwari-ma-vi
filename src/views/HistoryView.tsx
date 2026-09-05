import React from 'react';
import { Language, HistoryItem } from '../types';
import { History, Clock, Calendar } from 'lucide-react';

interface HistoryViewProps {
  lang: Language;
  history: HistoryItem[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ lang, history }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            <History className="w-3.5 h-3.5" />
            <span>{t('Four Decades of Excellence', 'चार दशकको ऐतिहासिक यात्रा')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Institutional History & Heritage', 'विद्यालयको गौरवमय इतिहास')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {t(
              'From a humble community-funded primary school in 2035 B.S. to a prestigious Government Model Secondary Institution.',
              'वि.सं. २०३५ मा समुदायको सहयोगमा स्थापित प्राथमिक पाठशालादेखि आजको अत्याधुनिक नमुना माध्यमिक विद्यालयसम्मको यात्रा।'
            )}
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-[#1E40AF]/30 ml-4 space-y-8 pb-4">
          {history.map((h, index) => (
            <div key={index} className="relative pl-6">
              {/* Dot indicator */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#1E40AF] border-2 border-white dark:border-slate-900 shadow-sm" />
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2 shadow-2xs hover:border-[#1E40AF]/40 transition">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2.5 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3" />
                  <span>{h.year}</span>
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(h.title_en, h.title_np)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(h.desc_en, h.desc_np)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
