import React, { useRef } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  DocumentItem,
  ContactMessage,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig
} from '../../types';
import {
  FileCode,
  Download,
  Upload,
  Database,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  HardDrive,
  FileJson,
  FolderArchive,
  ExternalLink
} from 'lucide-react';

interface BackupRestoreTabProps {
  lang: Language;
  school: SchoolData;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  onRestoreAllData: (data: any) => void;
  onResetFactory: () => void;
  onShowToast: (msg: string) => void;
}

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({
  lang,
  school,
  notices,
  staff,
  facilities,
  programs,
  documents,
  messages,
  events,
  achievements,
  history,
  gallery,
  siteConfig,
  securityConfig,
  onRestoreAllData,
  onResetFactory,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const handleExportJson = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      institution: school.name_en,
      school,
      notices,
      staff,
      facilities,
      programs,
      documents,
      messages,
      events,
      achievements,
      history,
      gallery,
      siteConfig,
      securityConfig,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ishwari_school_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(t('Complete JSON database exported!', 'पूर्ण डाटाबेस JSON फाइल डाउनलोड गरियो!'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.school && !parsed.notices) {
          throw new Error('Invalid schema format');
        }
        onRestoreAllData(parsed);
        onShowToast(t('Full database restored successfully!', 'डाटाबेस सफलतापूर्वक पुनःस्थापना गरियो!'));
      } catch (err) {
        alert(t('Failed to parse JSON file. Please ensure valid database backup file.', 'फाइल पढ्न सकिएन। कृपया मान्य JSON डाटाबेस फाइल छान्नुहोस्।'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: FULL DATA EXPORT & IMPORT */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <Database className="w-4 h-4 text-[#1E40AF]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Institutional Data Backup & Restore Engine', 'डाटाबेस ब्याकअप तथा रिस्टोर इन्जिन')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Export or restore all website content, notices, staff, records, configurations and logs with 1 click.', 'सम्पूर्ण वेबसाइटका सामग्री, सूचना, शिक्षक विवरण र सेटिङ १ क्लिकमा सुरक्षित वा रिस्टोर गर्नुहोस्।')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Export Box */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <FileJson className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Export Complete Database (JSON)', 'पूर्ण डाटाबेस डाउनलोड (JSON)')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Generates a standardized JSON package containing school profiles, notices, faculty, programs, events, gallery, and security settings.',
                'विद्यालयको सम्पूर्ण तथ्याङ्क, सूचना, शिक्षक, फोटो र सुरक्षा कन्फिगरेसनलाई एउटै JSON फाइलमा डाउनलोड गर्दछ।'
              )}
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Download Backup (.json)', 'ब्याकअप डाउनलोड गर्नुहोस्')}</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>{t('Restore Database from Backup', 'ब्याकअपबाट डाटाबेस रिस्टोर')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Upload a previously exported .json file to restore all school records and configurations immediately.',
                'पहिले सुरक्षित गरिएको .json फाइल छनोट गरी सम्पूर्ण तथ्याङ्क तुरुन्त पुनःस्थापना गर्नुहोस्।'
              )}
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('Select & Restore JSON File', 'JSON फाइल छान्नुहोस्')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: PRODUCTION PHP PROJECT DISTRIBUTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Standalone Production PHP 8+ Web Package', 'पूर्ण PHP ८+ प्रोजेक्ट तथा स्रोत कोड')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t(
                'Native PHP web project for deployment on cPanel, XAMPP, Apache, Nginx, or any standard PHP shared hosting.',
                'XAMPP, WAMP, cPanel वा कुनै पनि Apache/Nginx होस्टिङमा चल्ने पूर्ण PHP वेबसाइट कोड।'
              )}
            </p>
          </div>

          <a
            href="/ishwari-school-php-project.zip"
            download="ishwari-school-php-project.zip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#1E40AF]/25 transition shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('Download Complete PHP Project (ZIP)', 'पूरा PHP प्रोजेक्ट (ZIP) डाउनलोड')}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-[#1E40AF] block">📁 Standalone Structure</span>
            <p className="text-slate-600 dark:text-slate-300">
              Native PHP files (`index.php`, `admin.php`, `login.php`, `config.php`) with no external framework dependencies.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-[#1E40AF] block">🔒 Security Hardened</span>
            <p className="text-slate-600 dark:text-slate-300">
              CSRF token protection, password hashing (`password_hash`), session fixation defenses, and input sanitization.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-[#1E40AF] block">🌐 Ready MySQL & JSON</span>
            <p className="text-slate-600 dark:text-slate-300">
              Includes pre-configured JSON database and standard `schema.sql` ready to import into phpMyAdmin.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: FACTORY RESET DANGER ZONE */}
      <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
            {t('Danger Zone: Institutional Factory Reset', 'फ्याक्ट्री रिसेट (सावधानी)')}
          </h3>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
          {t(
            'This action resets all edited notices, staff profiles, facilities, achievements, and custom configurations back to original seed data. This cannot be undone unless you have exported a backup JSON file.',
            'यसले सबै सम्पादित सूचना, शिक्षक, फोटो र सेटिङलाई सुरुवाती अवस्थामा फर्काउँछ। यो कार्य गर्नुअघि माथिको ब्याकअप JSON डाउनलोड गर्न सिफारिस गरिन्छ।'
          )}
        </p>

        <button
          type="button"
          onClick={() => {
            const confirmWord = window.prompt(t('Type "RESET" to confirm resetting all data to initial defaults:', 'सबै तथ्याङ्क रिसेट गर्न "RESET" टाइप गर्नुहोस्:'));
            if (confirmWord === 'RESET') {
              onResetFactory();
              onShowToast(t('All data reset to initial institutional defaults.', 'सबै तथ्याङ्क सुरुवाती अवस्थामा फर्काइयो।'));
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Reset Everything to Defaults', 'सम्पूर्ण डाटा रिसेट गर्नुहोस्')}</span>
        </button>
      </div>
    </div>
  );
};
