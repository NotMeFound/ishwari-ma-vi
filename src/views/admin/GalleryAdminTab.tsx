import React, { useState } from 'react';
import { Language, GalleryItem } from '../../types';
import {
  Image,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Sparkles,
  FlaskConical,
  Trophy,
  BookOpen,
  Users,
  Building2,
  Camera
} from 'lucide-react';

interface GalleryAdminTabProps {
  lang: Language;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const GalleryAdminTab: React.FC<GalleryAdminTabProps> = ({
  lang,
  gallery,
  onUpdateGallery,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<GalleryItem>({
    id: 0,
    title_en: '',
    title_np: '',
    category: 'academics',
    iconType: 'academics',
  });

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en || !form.title_np) {
      alert(t('Please fill in both titles.', 'शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    if (form.id && form.id !== 0) {
      const updated = gallery.map(g => g.id === form.id ? form : g);
      onUpdateGallery(updated);
      onShowToast(t('Gallery item updated.', 'तस्बिर विवरण अद्यावधिक गरियो।'));
    } else {
      const newItem: GalleryItem = {
        ...form,
        id: Date.now(),
      };
      onUpdateGallery([newItem, ...gallery]);
      onShowToast(t('New photo record added to gallery.', 'ग्यालरीमा नयाँ तस्बिर थपियो।'));
    }
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('Delete this gallery photo record?', 'यो तस्बिर रेकर्ड मेटाउन निश्चित हुनुहुन्छ?'))) {
      onUpdateGallery(gallery.filter(g => g.id !== id));
      onShowToast(t('Gallery record removed.', 'तस्बिर रेकर्ड मेटाइयो।'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-[#4D6BFE]" />
            <span>{t('Manage Campus Photo & Media Gallery', 'विद्यालय फोटो ग्यालरी व्यवस्थापन')}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('Add, edit, categorise and manage photographic exhibitions.', 'फोटो प्रदर्शनी, अतिरिक्त क्रियाकलाप र शैक्षिक क्षणहरूको विवरण व्यवस्थापन।')}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setForm({
                id: 0,
                title_en: '',
                title_np: '',
                category: 'academics',
                iconType: 'academics',
              });
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4D6BFE] hover:bg-[#3A54E8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Add Gallery Photo', 'नयाँ तस्बिर थप्नुहोस्')}</span>
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-[#4D6BFE]">
              {form.id ? t('Edit Photo Record', 'तस्बिर सम्पादन') : t('Add Photo to Gallery', 'नयाँ तस्बिर थप्नुहोस्')}
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Photo Title (English)</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm(prev => ({ ...prev, title_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                placeholder="e.g. Modern Physics Lab Experiment"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Photo Title (Nepali)</label>
              <input
                type="text"
                value={form.title_np}
                onChange={(e) => setForm(prev => ({ ...prev, title_np: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                placeholder="उदा: भौतिक विज्ञान प्रयोगशाला प्रयोग"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as GalleryItem['category'] }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              >
                <option value="academics">Academics (शैक्षिक)</option>
                <option value="science">Science & Lab (विज्ञान)</option>
                <option value="sports">Sports & Athletics (खेलकुद)</option>
                <option value="culture">Culture & Arts (सांस्कृतिक)</option>
                <option value="community">Community (समुदाय)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vector Icon Archetype</label>
              <select
                value={form.iconType}
                onChange={(e) => setForm(prev => ({ ...prev, iconType: e.target.value as GalleryItem['iconType'] }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              >
                <option value="academics">Academic Book / Classroom</option>
                <option value="science">Science Flask / Lab</option>
                <option value="sports">Sports Trophy</option>
                <option value="culture">Cultural Stage / Arts</option>
                <option value="community">Community Assembly</option>
                <option value="camera">Standard Camera</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs rounded-lg bg-[#4D6BFE] text-white font-bold"
            >
              Save Photo
            </button>
          </div>
        </form>
      )}

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#4D6BFE]/10 text-[#4D6BFE]">
                  {item.category}
                </span>
                <span className="text-slate-400 text-xs font-mono">#{item.id}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t(item.title_en, item.title_np)}</h4>
            </div>

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setForm(item); setIsEditing(true); }}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Edit"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
