import React from 'react';
import { Language, Achievement } from '../types';
import { Trophy, Award, Sparkles, Medal, Star } from 'lucide-react';

interface AchievementsViewProps {
  lang: Language;
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ lang, achievements }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t('Student Honors & Distinctions', 'हाम्रा गौरवमय उपलब्धिहरू')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Academic & Co-Curricular Recognitions', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका सफलता')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'Celebrating our students consistently leading district board examinations, sports tournaments, and innovation challenges.',
              'एसईई परीक्षामा जिल्ला प्रथम, राष्ट्रपति रनिङ शिल्ड तथा विज्ञान प्रदर्शनीहरूमा हाम्रा विद्यार्थीहरूको उत्कृष्ट नतिजा।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((ach, idx) => {
            // Curated warm honors palette (Amber, Royal Blue, Emerald, Crimson)
            const cardStyles = [
              { border: 'hover:border-amber-400 dark:hover:border-amber-600', badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', iconColor: 'text-amber-600 dark:text-amber-400' },
              { border: 'hover:border-blue-400 dark:hover:border-blue-600', badge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', iconColor: 'text-blue-600 dark:text-blue-400' },
              { border: 'hover:border-emerald-400 dark:hover:border-emerald-600', badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', iconColor: 'text-emerald-600 dark:text-emerald-400' },
              { border: 'hover:border-rose-400 dark:hover:border-rose-600', badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800', iconColor: 'text-rose-600 dark:text-rose-400' },
            ][idx % 4];

            return (
              <div
                key={ach.id}
                className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs ${cardStyles.border} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${cardStyles.badge}`}>
                    <Medal className="w-3.5 h-3.5" />
                    <span>{ach.year}</span>
                  </span>
                  <Award className={`w-5 h-5 ${cardStyles.iconColor}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {t(ach.title_en, ach.title_np)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(ach.desc_en, ach.desc_np)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

