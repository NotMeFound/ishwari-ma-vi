import React from 'react';
import { ArrowRight, BookOpen, Building2, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, SchoolData, AboutSection, SiteCustomizerConfig } from '../types';

interface AboutViewProps {
  lang: Language;
  school: SchoolData;
  aboutSections?: AboutSection[];
  siteConfig?: SiteCustomizerConfig;
  onNavigate?: (route: string) => void;
}

const defaultSections: AboutSection[] = [
  {
    id: 'overview',
    title_en: 'Our Story',
    title_np: 'हाम्रो यात्रा',
    category: 'overview',
    content_en:
      'Ishwari Secondary School is a learner-centered community institution committed to academic excellence, character formation, and meaningful participation in local development.',
    content_np:
      'ईश्वरी माध्यमिक विद्यालय शैक्षिक उत्कृष्टता, चरित्र निर्माण र स्थानीय विकासमा सकारात्मक योगदानमा केन्द्रित सामुदायिक शैक्षिक संस्था हो।',
    image: '',
    display_order: 1,
    status: 'published',
    is_enabled: true,
  },
  {
    id: 'mission',
    title_en: 'Mission',
    title_np: 'लक्ष्य',
    category: 'mission',
    content_en:
      'To provide inclusive, quality education that nurtures critical thinking, creativity, leadership, and responsible citizenship in every learner.',
    content_np:
      'प्रत्येक विद्यार्थीमा आलोचनात्मक सोच, रचनात्मकता, नेतृत्व र जिम्मेवार नागरिकताको विकसित गर्ने समावेशी र गुणस्तरीय शिक्षा प्रदान गर्नु।',
    image: '',
    display_order: 2,
    status: 'published',
    is_enabled: true,
  },
  {
    id: 'vision',
    title_en: 'Vision',
    title_np: 'दृष्टि',
    category: 'vision',
    content_en:
      'To become a trusted center of excellence where students grow into confident, compassionate, and capable citizens for the nation and the world.',
    content_np:
      'विद्यार्थीहरू राष्ट्रिय तथा विश्वव्यापी जिम्मेवारीको साथ आत्मविश्वासी, सहृदय र सक्षम नागरिक बन्ने विश्वासपात्र उत्कृष्टता केन्द्र बन्नु।',
    image: '',
    display_order: 3,
    status: 'published',
    is_enabled: true,
  },
];

export const AboutView: React.FC<AboutViewProps> = ({
  lang,
  school,
  aboutSections,
  siteConfig,
  onNavigate,
}) => {
  const isNp = lang === 'np';
  const themeColor = siteConfig?.primaryColor || '#1E40AF';
  const sections = [...(aboutSections || defaultSections)]
    .filter((section) => section.is_enabled !== false && section.status !== 'draft')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const t = (en: string, np: string) => (isNp ? np || en : en || np);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section
        className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, rgba(15,23,42,0.95) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl space-y-6 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5" />
              {t('About the School', 'विद्यालयको बारेमा')}
            </span>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {t(school.name_en, school.name_np)}
            </h1>

            <p className="max-w-2xl text-lg text-slate-100/90 sm:text-xl">
              {t(school.tagline_en, school.tagline_np) ||
                t('A community-centered institution shaping confident learners and responsible citizens.', 'सामुदायिक मूलतत्वमा आधारित, आत्मविश्वासी विद्यार्थी र जिम्मेवार नागरिक निर्माण गर्ने संस्थान।')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate?.('home')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {t('Back to home', 'गृहपृष्ठमा फर्कनुहोस्')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            {sections.length > 0 ? (
              sections.map((section, index) => (
                <article
                  key={section.id || `${section.title_en}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      {section.category === 'mission' ? (
                        <Compass className="h-5 w-5" />
                      ) : section.category === 'vision' ? (
                        <Sparkles className="h-5 w-5" />
                      ) : section.category === 'values' ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t(section.title_en, section.title_np)}
                    </h2>
                  </div>

                  <div className="prose prose-slate max-w-none dark:prose-invert">
                    <p className="text-base leading-8 text-slate-700 dark:text-slate-300">
                      {t(section.content_en, section.content_np)}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <p className="text-base leading-8 text-slate-700 dark:text-slate-300">
                  {t(
                    'Our institution is built on integrity, care, and academic excellence, helping every learner move toward a bright and purposeful future.',
                    'हाम्रो संस्थामा अनुशासन, माया र शैक्षिक उत्कृष्टता नै सबै विद्यार्थीलाई उज्ज्वल र उद्देश्यपूर्ण भविष्यतर्फ लैजाने आधार हो।'
                  )}
                </p>
              </article>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                {t('School Snapshot', 'विद्यालय संक्षिप्त परिचय')}
              </h3>
              <dl className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start justify-between gap-4">
                  <dt>{t('Affiliation', 'सम्बन्धन')}</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-white">
                    {t(school.affiliation_en || 'School Education', school.affiliation_np || 'शैक्षिक सम्बन्धन')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>{t('Established', 'स्थापना')}</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-white">
                    {t(school.estd_ad || '', school.estd_bs || '')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>{t('Location', 'स्थान')}</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-white">
                    {t(school.address_en || '', school.address_np || '')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm dark:border-slate-700">
              <h3 className="mb-3 text-lg font-bold text-white">
                {t('Our values', 'हाम्रा मूल मानहरू')}
              </h3>
              <ul className="space-y-3 text-sm text-slate-200">
                {[
                  t('Excellence in learning', 'शैक्षिक उत्कृष्टता'),
                  t('Respect and inclusion', 'सम्मान र समावेश'),
                  t('Discipline and responsibility', 'अनुशासन र दायित्व'),
                  t('Innovation and character', 'नवाचार र चरित्र'),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AboutView;
