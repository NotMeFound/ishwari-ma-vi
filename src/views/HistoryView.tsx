import React, { useState } from 'react';
import { Language, HistoryItem } from '../types';
import {
  History,
  Clock,
  Calendar,
  Building2,
  Award,
  GraduationCap,
  Users,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface HistoryViewProps {
  lang: Language;
  history: HistoryItem[];
}

interface HistoricalLeader {
  name_en: string;
  name_np: string;
  tenure_bs: string;
  role_en: string;
  role_np: string;
  key_achievement_en: string;
  key_achievement_np: string;
}

const historicalLeaders: HistoricalLeader[] = [
  {
    name_en: "Late Pt. Dilaram Adhikari",
    name_np: "स्व. पं. डिल्लीराम अधिकारी",
    tenure_bs: "२०३५ - २०४३",
    role_en: "Founding Headmaster",
    role_np: "संस्थापक प्रधानाध्यापक",
    key_achievement_en: "Established the primary schooling foundation under community thatch roof with 45 village children.",
    key_achievement_np: "४५ जना गाउँका बालबालिकालाई खरको छानामुनि प्रारम्भिक अक्षरारम्भ गराउँदै जग बसाल्नुभएको।"
  },
  {
    name_en: "Mr. Ram Prasad Sharma",
    name_np: "श्री रामप्रसाद शर्मा",
    tenure_bs: "२०४३ - २०५५",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Expanded the school to Lower Secondary level, secured government teacher quotas, and built stone masonry classrooms.",
    key_achievement_np: "निम्न माध्यमिक तहमा स्तरोन्नति, सरकारी शिक्षक दरबन्दी व्यवस्थापन र ढुङ्गा-माटोको पक्की भवन निर्माण।"
  },
  {
    name_en: "Mr. Khem Bahadur KC",
    name_np: "श्री खेमबहादुर केसी",
    tenure_bs: "२०५५ - २०६९",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Upgraded to Secondary High School, guided the historic first batch of SLC examinees to 100% pass result.",
    key_achievement_np: "माध्यमिक तह (SLC) सम्म विस्तार र पहिलो ब्याचमै शतप्रतिशत सफलता हासिल।"
  },
  {
    name_en: "Mr. Narayan Prasad Koirala",
    name_np: "श्री नारायणप्रसाद कोइराला",
    tenure_bs: "२०६९ - २०७८",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Introduced Higher Secondary (+2) Science, Management & Education streams; laid foundation for Model School status.",
    key_achievement_np: "+२ विज्ञान, व्यवस्थापन र शिक्षा संकायको सम्बन्धन तथा नमुना विद्यालय अवधारणाको जग निर्माण।"
  },
  {
    name_en: "Mr. Ram Bahadur Thapa",
    name_np: "श्री रामबहादुर थापा",
    tenure_bs: "२०७८ - हालसम्म",
    role_en: "Current Principal",
    role_np: "वर्तमान प्रधानाध्यापक",
    key_achievement_en: "Steering the modern Digital Smart Campus, integrated STEAM laboratories, and nationwide Model School excellence.",
    key_achievement_np: "आधुनिक डिजिटल स्मार्ट क्याम्पस, स्टिम प्रयोगशाला तथा राष्ट्रिय नमुना विद्यालयको सफल नेतृत्व।"
  }
];

const foundingPillars = [
  {
    title_en: "Community Land Donors",
    title_np: "जग्गादाता तथा समाजसेवीहरू",
    desc_en: "Generous local village families who gifted 18 Ropanis of fertile community land in 2035 B.S. to ensure education for all children.",
    desc_np: "वि.सं. २०३५ मा आफ्ना बालबालिकाको उज्ज्वल भविष्यका लागि १८ रोपनी बहुमूल्य जग्गा निःशुल्क दान गर्ने स्थानीय महानुभावहरू।"
  },
  {
    title_en: "Voluntary Laborers (Shramadan)",
    title_np: "श्रमदानी ग्रामीण समुदाय",
    desc_en: "Hundreds of villagers and guardians who carried river stone, timber, and red bricks on their backs to construct the earliest classrooms.",
    desc_np: "नदीबाट ढुङ्गा, बालुवा र जंगलबाट काठ-दाउरा बोकेर विद्यालयको पहिलो भवन निर्माणमा पसिना बगाउने सम्पूर्ण गाउँले जनसमुदाय।"
  },
  {
    title_en: "Pioneer Teachers & Gurus",
    title_np: "प्रारम्भिक शिक्षक तथा गुरुवर्ग",
    desc_en: "Selfless educators who taught for years on minimal community grain stipends, driven purely by devotion to literacy.",
    desc_np: "न्यूनतम अन्न-मुठीदानमा वर्षौंसम्म निरन्तर ज्ञानको दीप प्रज्वलित गर्ने त्यागी र निष्ठावान गुरुजनहरू।"
  }
];

export const HistoryView: React.FC<HistoryViewProps> = ({ lang, history }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [activeEra, setActiveEra] = useState<string>('all');

  // Filter history by era if desired
  const filteredHistory = history.filter(item => {
    if (activeEra === 'all') return true;
    const yearNum = parseInt(item.year.replace(/[^0-9]/g, ''), 10);
    if (activeEra === 'foundation') return yearNum <= 2045;
    if (activeEra === 'expansion') return yearNum > 2045 && yearNum <= 2065;
    if (activeEra === 'modern') return yearNum > 2065;
    return true;
  });

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. HERO INSTITUTIONAL HERITAGE BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-[#0B1528] via-[#1E3A8A] to-[#172554] text-white p-8 sm:p-12 border border-blue-900/40 shadow-xl">
          {/* Subtle watermark background crest */}
          <div className="absolute -right-8 -bottom-10 opacity-10 text-[180px] font-serif font-black select-none pointer-events-none">
            २०३५
          </div>

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold tracking-wide border border-amber-400/30">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Established 2035 B.S. (1978 A.D.)', 'स्थापना: वि.सं. २०३५ (सन् १९७८)')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t('Four Decades of Educational Heritage', 'गौरवमय चार दशकको ऐतिहासिक यात्रा')}
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              {t(
                'From a modest community-funded hut with thatch roofing in 2035 B.S. to one of the nation’s highest-ranked Government Model Secondary Schools, Ishwari Secondary School has illuminated thousands of lives with knowledge, virtue, and resilience.',
                'वि.सं. २०३५ मा समुदायको अगाध निष्ठा र श्रमदानबाट स्थापित सानो प्राथमिक पाठशालादेखि आजको अत्याधुनिक, प्रविधिमैत्री नमुना माध्यमिक विद्यालयसम्मको संघर्ष, समर्पण र सफलताको अविस्मरणीय इतिहास।'
              )}
            </p>

            {/* Heritage Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-blue-800/60 text-xs">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">४८+ वर्ष</span>
                <span className="text-blue-200">{t('Years of Service', 'निरन्तर सेवा')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">१०,०००+</span>
                <span className="text-blue-200">{t('Graduated Alumni', 'उत्कृष्ट पूर्व विद्यार्थी')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">१००%</span>
                <span className="text-blue-200">{t('SEE Success Track', 'एसईई निरन्तर सफलता')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">नमुना</span>
                <span className="text-blue-200">{t('Govt Model Status', 'नेपाल सरकार नमुना मावि')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CHRONOLOGICAL TIMELINE OF MILESTONES */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
                <History className="w-3.5 h-3.5" />
                <span>{t('Chronicle of Milestones', 'ऐतिहासिक कालखण्डहरू')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {t('From Inception to Modern Excellence', 'स्थापनादेखि नमुना विद्यालयसम्म')}
              </h2>
            </div>

            {/* Era Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
              {[
                { id: 'all', en: 'All Eras', np: 'सबै कालखण्ड' },
                { id: 'foundation', en: '2035–2045', np: '२०३५–२०४५' },
                { id: 'expansion', en: '2046–2065', np: '२०४६–२०६५' },
                { id: 'modern', en: '2066–Present', np: '२०६६–हालसम्म' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveEra(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeEra === tab.id
                      ? 'bg-[#1E40AF] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(tab.en, tab.np)}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Timeline Tree */}
          <div className="relative border-l-2 border-[#1E40AF]/30 ml-4 sm:ml-6 space-y-10 pb-6">
            {filteredHistory.map((item, index) => (
              <div key={index} className="relative pl-6 sm:pl-8 group">
                {/* Visual Dot on Spine */}
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#1E40AF] border-2 border-white dark:border-slate-950 shadow-md transition group-hover:scale-125" />

                <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs hover:border-[#1E40AF]/50 hover:shadow-md transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#1E40AF] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.year}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {t(`Milestone #${index + 1}`, `ऐतिहासिक कोशेढुङ्गा #${index + 1}`)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {t(item.title_en, item.title_np)}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(item.desc_en, item.desc_np)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. FOUNDING PILLARS & COMMUNITY VISIONARIES */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('Sacrifice & Service', 'त्याग र समर्पणको कदर')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Founding Pillars & Community Visionaries', 'संस्थापक स्तम्भ तथा जग्गादाताहरू')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'We pay perpetual tribute to the benevolent leaders whose foresight gave birth to this temple of learning.',
                'विद्यालय स्थापनामा निःस्वार्थ योगदान पुर्याउनुहुने सम्पूर्ण अभिभावक, जग्गादाता तथा अग्रजहरूप्रति हार्दिक नमन।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {foundingPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-300 flex items-center justify-center font-bold text-base">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(pillar.title_en, pillar.title_np)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(pillar.desc_en, pillar.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CHRONOLOGY OF INSTITUTIONAL LEADERSHIP (HEADMASTERS) */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
              <span>{t('Leadership Roll of Honor', 'नेतृत्वको नामावली')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t("Principals' Historic Chronology", 'प्रधानाध्यापकहरूको ऐतिहासिक नामावली')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'Distinguished educators who navigated and enriched Ishwari Secondary School across various developmental eras.',
                'विद्यालयको शैक्षिक तथा भौतिक विकासमा दिशानिर्देश गर्नुहुने आदरणीय प्रधानाध्यापकहरू।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {historicalLeaders.map((leader, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    {leader.tenure_bs}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {t(leader.role_en, leader.role_np)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(leader.name_en, leader.name_np)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(`Tenure: ${leader.tenure_bs}`, `कार्यकाल: ${leader.tenure_bs}`)}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                  {t(leader.key_achievement_en, leader.key_achievement_np)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. INSTITUTIONAL PLEDGE & ENDURING LEGACY */}
        <section className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('Enduring Institutional Pledge', 'संस्थागत प्रतिबद्धता')}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('Preserving Heritage While Embracing the Future', 'गौरवशाली इतिहासको जगमा प्रविधिमैत्री भविष्य')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'As Ishwari Secondary School strides towards its golden jubilee, we stand resolute in our mission: providing equitable, world-class community education rooted in Nepali culture, moral values, and global competence.',
                'स्वर्ण महोत्सवको संघारमा उभिएर ईश्वरी माध्यमिक विद्यालय स्थानीय संस्कार, राष्ट्रिय गौरव र विश्वस्तरीय प्रतिस्पर्धात्मक शिक्षाको संगमस्थल बन्ने संकल्प गर्दछ।'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="block text-2xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">२०३५</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('Origin Year', 'स्थापना वर्ष')}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="block text-2xl font-black text-amber-500 font-mono">२०८३</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('Current Session', 'वर्तमान सत्र')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
