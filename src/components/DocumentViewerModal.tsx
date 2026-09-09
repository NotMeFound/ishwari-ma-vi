import React from 'react';
import {
  FileText,
  Download,
  X,
  Calendar,
  ShieldCheck,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
  lang?: 'en' | 'np';
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  onClose,
  onDownload,
  lang = 'en'
}) => {
  if (!doc) return null;

  const t = (en: string, np: string) => (lang === 'np' ? np : en);
  const title = lang === 'np' ? (doc.title_np || doc.title_en) : doc.title_en;
  const description = lang === 'np' ? (doc.description_np || doc.description_en) : doc.description_en;

  const pdfUrl = doc.file_path || doc.url || `/api/documents/${doc.id}/file`;

  return (
    <div
      id={`document-viewer-modal-${doc.id}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {doc.type || 'Official PDF'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{doc.date || new Date().toISOString().split('T')[0]}</span>
              </span>
              {doc.status && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    doc.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  }`}
                >
                  {doc.status === 'published' ? t('Published', 'प्रकाशित') : t('Draft', 'मस्यौदा')}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Document Details Body */}
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span className="truncate pr-2">Ref: ISS-DOC-{doc.id}-2083</span>
              <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">{doc.size || 'PDF Document'}</span>
            </div>

            {doc.original_filename && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] truncate">
                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{doc.original_filename}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('Verified Institutional Record • Authoritative Repository', 'प्रमाणित अभिलेख • आधिकारिक भण्डार')}</span>
            </div>
          </div>

          {description ? (
            <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {description}
            </p>
          ) : (
            <p className="leading-relaxed">
              {t(
                'This official document is published by Ishwari Secondary School for administrative record, academic regulation, and institutional transparency.',
                'यो आधिकारिक कागजात ईश्वरी माध्यमिक विद्यालयद्वारा प्रशासनिक अभिलेख, शैक्षिक नियमन र पारदर्शिताका लागि प्रकाशित गरिएको हो।'
              )}
            </p>
          )}

          {/* Direct PDF View Option */}
          <div className="pt-1">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('Open PDF in new tab for full reading', 'पूर्ण पढ्नका लागि नयाँ ट्याबमा PDF खोल्नुहोस्')}</span>
            </a>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {/* Bottom-left: monochromatic close icon */}
          <button
            type="button"
            id="document-modal-close-btn"
            onClick={onClose}
            title={t('Close Document', 'कागजात बन्द गर्नुहोस्')}
            aria-label={t('Close Document', 'कागजात बन्द गर्नुहोस्')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Bottom-right: vivid purple/blue-purple download icon */}
          <button
            type="button"
            id="document-modal-download-btn"
            onClick={() => onDownload(doc)}
            title={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
            aria-label={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
            className="p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
          >
            <Download className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
