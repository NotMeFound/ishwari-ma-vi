import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Link2,
  X,
  FileCheck,
  Globe
} from 'lucide-react';
import { Language, SiteCustomizerConfig } from '../../types';
import { apiClient } from '../../services/apiClient';

interface HeroBackgroundManagerProps {
  lang: Language;
  siteConfig?: SiteCustomizerConfig;
  onUpdateSiteConfig?: (config: SiteCustomizerConfig) => Promise<{ success: boolean; error?: string }> | void;
  onShowToast: (msg: string) => void;
  title?: string;
  subtitle?: string;
}

const PRESET_CAMPUS_IMAGES = [
  {
    nameEn: 'Model Campus & Flagpole Courtyard',
    nameNp: 'नमुना विद्यालय भवन तथा प्रार्थना प्राङ्गण',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Ishwari Secondary School Academic Campus Building and Courtyard',
    altNp: 'ईश्वरी माध्यमिक विद्यालयको मुख्य शैक्षिक भवन र प्राङ्गण'
  },
  {
    nameEn: 'Modern Academic Quad & Library Wing',
    nameNp: 'आधुनिक शैक्षिक भवन तथा पुस्तकालय खण्ड',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Ishwari Secondary School Academic Quadrangle',
    altNp: 'ईश्वरी माध्यमिक विद्यालय शैक्षिक परिसर'
  },
  {
    nameEn: 'ICT Center & Interactive Classroom',
    nameNp: 'आधुनिक कम्प्युटर प्रयोगशाला तथा डिजिटल सिकाइ केन्द्र',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Ishwari Secondary School Computer Learning Lab',
    altNp: 'ईश्वरी माध्यमिक विद्यालय सूचना प्रविधि प्रयोगशाला'
  },
  {
    nameEn: 'Science Research & Practical Laboratory',
    nameNp: 'विज्ञान प्रयोगशाला तथा प्रयोगात्मक अनुसन्धान कार्यस्थल',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Ishwari Secondary School Science Laboratory Workbenches',
    altNp: 'ईश्वरी माध्यमिक विद्यालय विज्ञान प्रयोगशाला'
  }
];

export const HeroBackgroundManager: React.FC<HeroBackgroundManagerProps> = ({
  lang,
  siteConfig,
  onUpdateSiteConfig,
  onShowToast,
  title,
  subtitle
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive initial values from siteConfig
  const initialImage =
    siteConfig?.hero_background_image ||
    siteConfig?.heroBackgroundImage ||
    siteConfig?.homeBgImage ||
    '';

  const initialEnabled =
    siteConfig?.hero_background_enabled !== undefined
      ? Boolean(siteConfig.hero_background_enabled)
      : siteConfig?.heroBackgroundEnabled !== undefined
      ? Boolean(siteConfig.heroBackgroundEnabled)
      : siteConfig?.homeBgEnabled !== undefined
      ? Boolean(siteConfig.homeBgEnabled)
      : Boolean(initialImage);

  const initialOverlay =
    siteConfig?.homeBgOverlayOpacity !== undefined
      ? Number(siteConfig.homeBgOverlayOpacity)
      : (siteConfig as any)?.hero_background_overlay !== undefined
      ? Number((siteConfig as any).hero_background_overlay)
      : 85;

  const initialAltEn =
    siteConfig?.hero_background_alt_en ||
    siteConfig?.heroBackgroundAltEn ||
    'Ishwari Secondary School Campus Hero Background';

  const initialAltNp =
    siteConfig?.hero_background_alt_np ||
    siteConfig?.heroBackgroundAltNp ||
    'ईश्वरी माध्यमिक विद्यालय क्याम्पस पृष्ठभूमि';

  const [bgImage, setBgImage] = useState<string>(initialImage);
  const [bgEnabled, setBgEnabled] = useState<boolean>(initialEnabled);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(initialOverlay);
  const [altTextEn, setAltTextEn] = useState<string>(initialAltEn);
  const [altTextNp, setAltTextNp] = useState<string>(initialAltNp);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Sync state if siteConfig prop updates
  useEffect(() => {
    if (siteConfig) {
      const img =
        siteConfig.hero_background_image ||
        siteConfig.heroBackgroundImage ||
        siteConfig.homeBgImage ||
        '';
      const enabled =
        siteConfig.hero_background_enabled !== undefined
          ? Boolean(siteConfig.hero_background_enabled)
          : siteConfig.heroBackgroundEnabled !== undefined
          ? Boolean(siteConfig.heroBackgroundEnabled)
          : siteConfig.homeBgEnabled !== undefined
          ? Boolean(siteConfig.homeBgEnabled)
          : Boolean(img);
      const overlay =
        siteConfig.homeBgOverlayOpacity !== undefined
          ? Number(siteConfig.homeBgOverlayOpacity)
          : 85;

      setBgImage(img);
      setBgEnabled(enabled);
      setOverlayOpacity(overlay);
      if (siteConfig.hero_background_alt_en || siteConfig.heroBackgroundAltEn) {
        setAltTextEn(siteConfig.hero_background_alt_en || siteConfig.heroBackgroundAltEn || '');
      }
      if (siteConfig.hero_background_alt_np || siteConfig.heroBackgroundAltNp) {
        setAltTextNp(siteConfig.hero_background_alt_np || siteConfig.heroBackgroundAltNp || '');
      }
    }
  }, [siteConfig]);

  // Handle file selection or drop
  const processImageFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      onShowToast(t('Allowed image formats: JPG, PNG, or WebP.', 'मान्य ढाँचा: JPG, PNG वा WebP मात्र।'));
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      onShowToast(t('Background image size must be under 5 MB.', 'पृष्ठभूमि फोटो ५MB भन्दा सानो हुनुपर्छ।'));
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await apiClient.uploadFile(file, 'image');
      if (uploadRes.success && uploadRes.url) {
        setBgImage(uploadRes.url);
        setBgEnabled(true);
        onShowToast(t('Hero background image uploaded successfully!', 'ब्यानर पृष्ठभूमि फोटो सफलतापूर्वक अपलोड भयो!'));
      } else {
        // Local FileReader fallback for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setBgImage(result);
          setBgEnabled(true);
          onShowToast(t('Hero image loaded for preview.', 'पृष्ठभूमि फोटो लोड भयो।'));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      onShowToast(t('Failed to process image file.', 'फोटो प्रक्रिया गर्न सकिएन।'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-selecting the same file triggers change
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      setBgImage(urlInput.trim());
      setBgEnabled(true);
      setUrlInput('');
      setShowUrlInput(false);
      onShowToast(t('Hero background URL applied!', 'इन्टरनेट फोटो लिङ्क लागु भयो!'));
    } catch {
      onShowToast(t('Please enter a valid HTTP/HTTPS image URL.', 'कृपया मान्य HTTP/HTTPS लिङ्क प्रविष्ट गर्नुहोस्।'));
    }
  };

  const handleRemoveImage = () => {
    setBgImage('');
    setBgEnabled(false);
    onShowToast(t('Hero background image removed. Default navy pattern active.', 'ब्यानर पृष्ठभूमि हटाइयो। पूर्वनिर्धारित नेभी ढाँचा सक्रिय भयो।'));
  };

  const handleSelectPreset = (preset: typeof PRESET_CAMPUS_IMAGES[0]) => {
    setBgImage(preset.url);
    setBgEnabled(true);
    setAltTextEn(preset.altEn);
    setAltTextNp(preset.altNp);
    onShowToast(t(`Applied preset: ${preset.nameEn}`, `प्रिसेट लागु भयो: ${preset.nameNp}`));
  };

  // Save changes to authoritative CMS siteConfig
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig: SiteCustomizerConfig = {
        ...(siteConfig || ({} as any)),
        // Write both naming conventions for zero-friction compatibility
        homeBgImage: bgImage,
        homeBgEnabled: bgEnabled,
        homeBgOverlayOpacity: overlayOpacity,
        hero_background_image: bgImage,
        hero_background_enabled: bgEnabled,
        hero_background_alt_en: altTextEn,
        hero_background_alt_np: altTextNp,
        heroBackgroundImage: bgImage,
        heroBackgroundEnabled: bgEnabled,
        heroBackgroundAltEn: altTextEn,
        heroBackgroundAltNp: altTextNp
      };

      if (onUpdateSiteConfig) {
        await onUpdateSiteConfig(updatedConfig);
      } else {
        await apiClient.syncModule('siteConfig', updatedConfig, 'Hero Background Admin');
      }

      await apiClient.recordAuditLog({
        action: 'HERO_BACKGROUND_UPDATED',
        module: 'SETTINGS',
        status: 'success',
        details: `Homepage hero background updated: enabled=${bgEnabled}, image=${bgImage ? 'YES' : 'NONE'}, overlay=${overlayOpacity}%.`
      });

      onShowToast(
        t(
          'Homepage hero background settings saved and published to live website!',
          'गृहपृष्ठ ब्यानर पृष्ठभूमि सेटिङ सुरक्षित भयो र वेबसाइटमा तुरुन्त लागु भयो!'
        )
      );
    } catch (err: any) {
      onShowToast(t(`Failed to save settings: ${err?.message || 'Error'}`, `सुरक्षित गर्न सकिएन: ${err?.message}`));
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time overlay calculation for preview
  const previewOpacity = Math.min(Math.max(overlayOpacity / 100, 0), 0.98);

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#1E40AF] shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title || t('Homepage Hero Background Image', 'गृहपृष्ठ ब्यानर पृष्ठभूमि तस्बिर')}</span>
              {bgEnabled && bgImage ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('ACTIVE ON HOMEPAGE', 'गृहपृष्ठमा सक्रिय')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {t('DEFAULT NAVY PATTERN', 'पूर्वनिर्धारित नेभी ढाँचा')}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle ||
                t(
                  'Upload, replace, preview, toggle, and calibrate the overlay darkness of the main institutional hero image.',
                  'मुख्य गृहपृष्ठको ब्यानर फोटो अपलोड, प्रतिस्थापन, पूर्वावलोकन, अन/अफ र ओभरले डार्कनेस व्यवस्थापन।'
                )}
            </p>
          </div>
        </div>

        {/* Action Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] active:scale-98 text-white text-xs font-bold shadow-md shadow-[#1E40AF]/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t('Saving & Broadcasting...', 'सुरक्षित गरिँदैछ...')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('Save Hero Background Settings', 'पृष्ठभूमि सेटिङ सुरक्षित गर्नुहोस्')}</span>
            </>
          )}
        </button>
      </div>

      {/* 2-COLUMN CONTROL WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONTROLS & UPLOADER (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* CONTROL CARD 1: STATUS & TOGGLE */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Hero Background Display Status', 'ब्यानर पृष्ठभूमि प्रदर्शन अवस्था')}</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t(
                    'Toggle whether the custom photo or the default geometric navy pattern displays on the homepage hero.',
                    'गृहपृष्ठको ब्यानरमा आफ्नै तस्बिर देखाउने वा पूर्वनिर्धारित नेभी ग्रिड ढाँचा राख्ने छनोट गर्नुहोस्।'
                  )}
                </p>
              </div>

              {/* Accessible Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={bgEnabled}
                onClick={() => setBgEnabled(!bgEnabled)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] focus:ring-offset-2 ${
                  bgEnabled ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    bgEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                bgEnabled
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {bgEnabled ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span>
                  {bgEnabled
                    ? t(
                        'Background photo enabled: The image will render behind the hero headline with configured dark overlay.',
                        'पृष्ठभूमि फोटो सक्रिय छ: तस्बिर ब्यानरको पछाडि ओभरलेसहित देखिनेछ।'
                      )
                    : t(
                        'Background photo disabled: Default dark navy blueprint grid is actively rendered.',
                        'पृष्ठभूमि फोटो निष्क्रिय छ: पूर्वनिर्धारित गाढा नेभी ग्रिड देखाइनेछ।'
                      )}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70">
                {bgEnabled ? t('ON', 'अन') : t('OFF', 'अफ')}
              </span>
            </div>
          </div>

          {/* CONTROL CARD 2: UPLOAD & REPLACE WORKBENCH */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Upload or Replace Hero Image', 'ब्यानर तस्बिर अपलोड वा प्रतिस्थापन')}</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-[#1E40AF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{showUrlInput ? t('Hide URL Input', 'लिङ्क बन्द') : t('Paste URL', 'लिङ्क राख्नुहोस्')}</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-[11px] text-[#1E40AF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showPresets ? t('Hide Presets', 'प्रिसेट बन्द') : t('Campus Presets', 'नमुना तस्बिरहरू')}</span>
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* URL Input Bar if opened */}
            {showUrlInput && (
              <form onSubmit={handleUrlSubmit} className="flex gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={t('Paste full HTTPS image URL (e.g., https://.../campus.jpg)', 'इन्टरनेटको पूर्ण फोटो लिङ्क (HTTPS) प्रविष्ट गर्नुहोस्')}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer"
                >
                  {t('Apply', 'लागु')}
                </button>
              </form>
            )}

            {/* Presets Grid if opened */}
            {showPresets && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-200">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {t('Curated High-Resolution Campus Photography Presets:', 'नमुना शैक्षिक क्याम्पस फोटोग्राफी प्रिसेटहरू:')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_CAMPUS_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="group p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#1E40AF] text-left transition flex items-center gap-2.5 cursor-pointer"
                    >
                      <img
                        src={preset.url}
                        alt={preset.nameEn}
                        className="w-12 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isNp ? preset.nameNp : preset.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {t('Click to apply', 'क्लिक गरी छान्नुहोस्')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Drag & Drop / Upload Target Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
                isDragging
                  ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50'
              }`}
            >
              {bgImage ? (
                <div className="space-y-4">
                  {/* Thumbnail with overlay bar */}
                  <div className="relative mx-auto max-w-md h-36 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs group">
                    <img
                      src={bgImage}
                      alt={altTextEn || 'Hero background'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-bold shadow-md hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#1E40AF]" />
                        <span>{t('Replace Image', 'फोटो फेर्नुहोस्')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-red-600/95 text-white text-xs font-bold shadow-md hover:bg-red-600 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Remove', 'हटाउनुहोस्')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('Replace with New Image', 'नयाँ तस्बिर प्रतिस्थापन गर्नुहोस्')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Remove / Delete Image', 'तस्बिर पूर्ण रूपमा मेटाउनुहोस्')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-[#1E40AF] mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('Click to upload, or drag and drop photo here', 'तस्बिर अपलोड गर्न यहाँ क्लिक गर्नुहोस् वा ड्र्याग गर्नुहोस्')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('Supports high-resolution JPG, PNG, WebP (up to 5MB)', 'उच्च गुणस्तरको JPG, PNG, WebP समर्थित (५MB सम्म)')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('Select Image from Device', 'उपकरणबाट तस्बिर छान्नुहोस्')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CONTROL CARD 3: OVERLAY & DARKNESS CALIBRATION */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Background Dark Overlay / Opacity', 'पृष्ठभूमि गाढा ओभरले / स्पष्टता')}</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t(
                    'Higher opacity darkens the background image so white headlines and buttons maintain WCAG AAA readability.',
                    'ओभरले बढाउँदा पृष्ठभूमि गाढा भई सेतो अक्षरहरू प्रस्टसँग पढ्न सकिने हुन्छ।'
                  )}
                </p>
              </div>

              {/* Opacity Value Badge */}
              <div className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 text-[#1E40AF] text-xs font-black font-mono">
                {overlayOpacity}%
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1E40AF]"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% ({t('Transparent / Bright', 'पारदर्शी / उज्यालो')})</span>
                <span className="text-[#1E40AF] font-bold">85% ({t('Recommended Default', 'सिफारिस गरिएको')})</span>
                <span>95% ({t('Deep Navy', 'अति गाढा नेभी')})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
              <HelpCircle className="w-4 h-4 text-[#1E40AF] shrink-0" />
              <span>
                {t(
                  'Tip: An overlay between 80% and 90% produces the most elegant contrast for community school portals while highlighting the campus architecture.',
                  'सुझाव: ८०% देखि ९०% सम्मको ओभरलेले क्याम्पसको तस्बिर पनि देखाउँछ र अक्षरलाई पूर्ण रूपमा स्पष्ट बनाउँछ।'
                )}
              </span>
            </div>
          </div>

          {/* CONTROL CARD 4: ACCESSIBILITY & ALT TEXT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Image Accessibility & Descriptive Alt Text', 'तस्बिर विवरण तथा पहुँचयोग्यता (Alt Text)')}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('Alt Text (English)', 'वर्णन (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={altTextEn}
                  onChange={(e) => setAltTextEn(e.target.value)}
                  placeholder="e.g., Ishwari Secondary School Campus Building"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('Alt Text (Nepali)', 'वर्णन (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={altTextNp}
                  onChange={(e) => setAltTextNp(e.target.value)}
                  placeholder="उदा. ईश्वरी माध्यमिक विद्यालयको मुख्य शैक्षिक परिसर"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME HOMEPAGE HERO PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1E40AF]" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('Live Homepage Hero Preview', 'प्रत्यक्ष गृहपृष्ठ ब्यानर पूर्वावलोकन')}
                </h4>
              </div>

              {/* Viewport switch */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    previewMode === 'desktop'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {t('Desktop', 'डेस्कटप')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    previewMode === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {t('Mobile', 'मोबाइल')}
                </button>
              </div>
            </div>

            {/* PREVIEW FRAME */}
            <div
              className={`rounded-2xl border border-slate-800 overflow-hidden relative transition-all duration-300 ${
                previewMode === 'mobile' ? 'max-w-[280px] mx-auto' : 'w-full'
              }`}
              style={{ minHeight: '340px' }}
            >
              {/* Active Image or Geometric Pattern */}
              {bgEnabled && bgImage ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  <div
                    className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
                    style={{ opacity: previewOpacity }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-slate-950">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />
                </div>
              )}

              {/* Simulated Hero Section Content matching HomeView.tsx exactly */}
              <div className="relative z-10 p-5 sm:p-6 space-y-3.5 text-white flex flex-col justify-center min-h-[340px]">
                {/* Badge Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-blue-300 text-[9px] font-bold tracking-wider uppercase backdrop-blur-xs self-start">
                  <span>
                    {isNp
                      ? siteConfig?.heroBadgeNp || 'शैक्षिक उत्कृष्टता र चरित्र निर्माणको केन्द्र'
                      : siteConfig?.heroBadgeEn || 'CENTER FOR ACADEMIC EXCELLENCE'}
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug drop-shadow-sm">
                  {isNp
                    ? siteConfig?.heroTitleNp || 'शैक्षिक उत्कृष्टता र नैतिक चरित्र निर्माणको पाँच दशक लामो यात्रा।'
                    : siteConfig?.heroTitleEn || 'Cultivating Academic Excellence & Responsible Citizens Since 2028 B.S.'}
                </h2>

                {/* Description */}
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {isNp
                    ? siteConfig?.heroSubtitleNp || 'अनुभवी शिक्षक, आधुनिक विज्ञान तथा कम्प्युटर प्रयोगशाला र डिजिटल स्मार्ट कक्षाकोठाका माध्यमबाट विद्यार्थीहरूको चौतर्फी विकासमा समर्पित।'
                    : siteConfig?.heroSubtitleEn || 'A premier community educational institution offering experiential STEM pedagogy, digital classrooms, high-standard laboratories.'}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#1E40AF] text-white shadow-xs">
                    <span>{t('Explore Academic Programs', 'शैक्षिक कार्यक्रमहरू')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    <span>{t('Public Circulars & Notices', 'ताजा सार्वजनिक सूचना')}</span>
                  </span>
                </div>
              </div>

              {/* Live Overlay Status Indicator on top right of preview */}
              <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-mono border border-white/10">
                {bgEnabled && bgImage ? `${overlayOpacity}% Overlay` : 'Default Grid'}
              </div>
            </div>

            {/* Status explanation */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>{t('Live Hero State:', 'वर्तमान ब्यानर अवस्था:')}</span>
                <span className={bgEnabled && bgImage ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                  {bgEnabled && bgImage ? t('Photo + Dark Overlay', 'फोटो + डार्क ओभरले') : t('Default Navy Blueprint', 'पूर्वनिर्धारित नेभी ग्रिड')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {t(
                  'What you see in this live preview corresponds directly to what public visitors see on the homepage hero section.',
                  'यहाँ देखिएको पूर्वावलोकन वेबसाइटमा आउने जो-कोहीले गृहपृष्ठमा देख्ने वास्तविक रूप हो।'
                )}
              </p>
            </div>

            {/* Quick Save Bar */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="w-full py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('Saving...', 'सुरक्षित गरिँदैछ...')}</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{t('Publish Changes to Homepage', 'गृहपृष्ठमा तुरुन्त लागु गर्नुहोस्')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
