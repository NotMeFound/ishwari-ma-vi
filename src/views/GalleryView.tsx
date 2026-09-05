import React, { useState } from 'react';
import { Language, GalleryItem } from '../types';
import {
  Image as ImageIcon,
  Camera,
  FlaskConical,
  Trophy,
  BookOpen,
  Heart,
  Cpu,
  Layers
} from 'lucide-react';

interface GalleryViewProps {
  lang: Language;
  items?: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ lang, items = [] }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const safeItems = items || [];
  const renderIcon = (type: string) => {
    switch (type) {
      case 'science':
        return <FlaskConical className="w-12 h-12 text-[#1E40AF]" />;
      case 'sports':
        return <Trophy className="w-12 h-12 text-[#1E40AF]" />;
      case 'academics':
        return <BookOpen className="w-12 h-12 text-[#1E40AF]" />;
      case 'culture':
        return <Heart className="w-12 h-12 text-[#1E40AF]" />;
      case 'community':
        return <Layers className="w-12 h-12 text-[#1E40AF]" />;
      default:
        return <Camera className="w-12 h-12 text-[#1E40AF]" />;
    }
  };

  const filtered = activeCategory === 'all' ? safeItems : safeItems.filter(i => i.category === activeCategory);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('Visual Archive & Photo Gallery', 'तस्बिर पुस्तिका')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Campus Life & Activities Gallery', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका झलकहरू')}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', en: 'All Media', np: 'सबै' },
              { id: 'science', en: 'Science & Tech', np: 'विज्ञान' },
              { id: 'sports', en: 'Sports', np: 'खेलकुद' },
              { id: 'academics', en: 'Academics', np: 'शिक्षा' },
              { id: 'culture', en: 'Culture', np: 'संस्कृति' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(cat.en, cat.np)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xs flex flex-col hover:border-[#1E40AF]/40 transition group"
            >
              <div className="h-44 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 group-hover:scale-[1.02] transition">
                {renderIcon(item.iconType)}
              </div>
              <div className="p-5 space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t(item.title_en, item.title_np)}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
