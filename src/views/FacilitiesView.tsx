import React from 'react';
import { Language, Facility } from '../types';
import {
  Building2,
  Droplet,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BookOpen,
  FlaskConical,
  Award,
  Layers
} from 'lucide-react';

interface FacilitiesViewProps {
  lang: Language;
  facilities: Facility[];
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ lang, facilities }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Map icon strings to colored Lucide icons
  const getFacilityTheme = (iconStr: string) => {
    switch (iconStr) {
      case '🔬':
        return {
          icon: <FlaskConical className="w-5 h-5" />,
          colorClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
          badgeText: 'text-emerald-700 dark:text-emerald-400'
        };
      case '💻':
        return {
          icon: <Cpu className="w-5 h-5" />,
          colorClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
          badgeText: 'text-blue-700 dark:text-blue-400'
        };
      case '📚':
        return {
          icon: <BookOpen className="w-5 h-5" />,
          colorClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
          badgeText: 'text-amber-700 dark:text-amber-400'
        };
      case '⚽':
        return {
          icon: <Award className="w-5 h-5" />,
          colorClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
          hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
          badgeText: 'text-rose-700 dark:text-rose-400'
        };
      default:
        return {
          icon: <Building2 className="w-5 h-5" />,
          colorClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
          hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
          badgeText: 'text-indigo-700 dark:text-indigo-400'
        };
    }
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-400">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('Infrastructure & Equipment', 'पूर्वाधार तथा प्रविधि')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Campus Infrastructure & Facilities', 'विद्यालयका भौतिक पूर्वाधारहरू')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'Designed to meet national Model School guidelines, prioritizing experiential scientific experiments, computer literacy, and physical wellness.',
              'नेपाल सरकारको नमुना विद्यालय मापदण्ड बमोजिम निर्मित अत्याधुनिक प्रयोगशाला, सूचना प्रविधि केन्द्र र खेलकुद पूर्वाधारहरू।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => {
            const theme = getFacilityTheme(fac.icon);
            return (
              <div
                key={fac.id}
                className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs ${theme.hoverBorder} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${theme.colorClass}`}>
                    {theme.icon}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {t(fac.title_en, fac.title_np)}
                    </h2>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${theme.badgeText}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('Certified Campus Facility', 'सत्यापित पूर्वाधार')}</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(fac.desc_en, fac.desc_np)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Health & Safety Amenities with semantic color highlights */}
        <div className="p-8 rounded-2xl bg-slate-900 text-slate-200 space-y-6 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {t('Health, Safety & Sustainable Amenities', 'स्वास्थ्य, सुरक्षा तथा दिगो पूर्वाधार')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-sky-500/50 transition">
              <p className="font-bold text-sky-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>{t('UV Purified Drinking Water', 'शुद्ध पिउने पानी')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Automated multi-stage filtration system accessible in all blocks.', 'प्रत्येक भवनमा युरोगार्ड र फिल्टरयुक्त पिउने पानीको व्यवस्था।')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-amber-500/50 transition">
              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                <span>{t('Solar Power & UPS Backup', 'सौर्य ऊर्जा तथा ब्याकअप')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Continuous electric power for computer labs and digital boards.', 'कम्प्युटर ल्याब र डिजिटल बोर्डका लागि २४सै घण्टा विद्युत् सुविधा।')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-emerald-500/50 transition">
              <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('CCTV Security Surveillance', 'सीसीटिभी सुरक्षा निगरानी')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Comprehensive campus boundary monitoring for student safety.', 'विद्यार्थीहरूको सुरक्षाका लागि क्याम्पस परिसरभर क्यामेरा निगरानी।')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

