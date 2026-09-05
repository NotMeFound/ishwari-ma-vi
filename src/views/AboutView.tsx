import React from 'react';
import { Language, SchoolData } from '../types';
import {
  Target,
  Eye,
  Scale,
  Building2,
  ArrowRight,
  FileText,
  History,
  ShieldCheck,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface AboutViewProps {
  lang: Language;
  school: SchoolData;
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, school, onNavigate }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('Institutional Profile & Heritage', 'विद्यालयको चिनारी तथा ऐतिहासिक पृष्ठभूमि')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('About Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालयको बारेमा')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'A landmark community institution dedicated to democratic, inclusive, and scientific secondary education since 2035 B.S.',
              'वि.सं. २०३५ मा स्थापित यस विद्यालयले गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको छ।'
            )}
          </p>
        </div>

        {/* Mission, Vision & Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Our Mission', 'हाम्रो उद्देश्य')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'To empower every learner with strong academic foundations, critical thinking abilities, digital literacy, and civic values.',
                'प्रत्येक विद्यार्थीलाई आधारभूत शैक्षिक ज्ञान, सिर्जनशीलता, प्रविधिमैत्री सीप र उच्च नैतिक संस्कार प्रदान गर्नु।'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Our Vision', 'हाम्रो दृष्टिकोण')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'To establish Ishwari as a premier national model school delivering accessible, internationally competitive education in Nepal.',
                'नेपालको अग्रणी नमुना सामुदायिक विद्यालयको रूपमा विकास गरी राष्ट्रिय तथा अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धी जनशक्ति तयार पार्नु।'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Core Values', 'हाम्रा मुख्य मान्यताहरू')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Academic Integrity, Social Inclusion, Scientific Temper, Environmental Stewardship, and Discipline.',
                'शैक्षिक निष्ठा, सामाजिक समावेशिता, वैज्ञानिक चेतना, वातावरण संरक्षण र पूर्ण अनुशासन।'
              )}
            </p>
          </div>
        </div>

        {/* SMC & Governance */}
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Building2 className="w-5 h-5 text-[#1E40AF]" />
            <h2 className="text-lg font-bold">
              {t('School Management Committee (SMC) & Governance', 'विद्यालय व्यवस्थापन समिति (SMC) तथा सुशासन')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t(
              'Under the Education Act of Nepal, the School Management Committee oversees institutional policy, educational equity, resource allocation, and annual social audits with active community participation.',
              'शिक्षा ऐन तथा नियमावली अनुसार अभिभावक, स्थानीय तहका प्रतिनिधि र शिक्षाप्रेमीहरूको सहभागितामा गठित विद्यालय व्यवस्थापन समितिले नीतिगत निर्णय, पारदर्शिता र शैक्षिक गुणस्तर अभिवृद्धिमा नेतृत्वदायी भूमिका निर्वाह गर्दछ।'
            )}
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('documents')}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-[#1E40AF] text-white hover:bg-[#1D4ED8] shadow-sm shadow-[#1E40AF]/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('View Citizen Charter & Audit Reports', 'नागरिक बडापत्र तथा सामाजिक प्रतिवेदन')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('Read Complete History Timeline', 'ऐतिहासिक समयरेखा हेर्नुहोस्')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
