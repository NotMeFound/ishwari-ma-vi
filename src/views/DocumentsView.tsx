import React, { useState } from 'react';
import { Language, DocumentItem } from '../types';
import {
  FileText,
  Download,
  Search,
  FolderArchive,
  Calendar,
  CheckCircle2,
  X,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface DocumentsViewProps {
  lang: Language;
  documents: DocumentItem[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ lang, documents }) => {
  const [query, setQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [pendingDownloadDoc, setPendingDownloadDoc] = useState<DocumentItem | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const filteredDocs = documents.filter(d =>
    d.title_en.toLowerCase().includes(query.toLowerCase()) ||
    d.title_np.toLowerCase().includes(query.toLowerCase())
  );

  const executeDownload = (doc: DocumentItem) => {
    const content = `=====================================================
ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Public Institutional Repository & Citizen Charter
EMIS: 48012004 • Affiliated to NEB Nepal
=====================================================
Document Reference: DOC-${doc.id}
Document Title: ${doc.title_en} (${doc.title_np})
Category / Type: ${doc.type}
Certified File Size: ${doc.size}
Verification Date: ${doc.date}

DOCUMENT CERTIFICATION:
This document represents an authenticated institutional record issued by
Ishwari Secondary School, Bheerkot-4, Syangja, Gandaki Province, Nepal.

Certified by:
Office of the Principal / Administration
Ishwari Secondary School
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = doc.title_en.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `ishwari_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(
      t(
        `Downloaded official document: ${doc.title_en}`,
        `कागजात डाउनलोड भयो: ${doc.title_np}`
      )
    );
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950 relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-blue-500 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Medium-sized Centered Document Viewer Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {previewDoc.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{previewDoc.date}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {t(previewDoc.title_en, previewDoc.title_np)}
                </h3>
              </div>
            </div>

            {/* Document Details Body */}
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Ref: ISS-DOC-{previewDoc.id}-2083</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{previewDoc.size}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('Verified Institutional Record • Public Repository', 'प्रमाणित अभिलेख • सार्वजनिक भण्डार')}</span>
                </div>
              </div>

              <p className="leading-relaxed">
                {t(
                  'This official document is published by Ishwari Secondary School for public information, institutional transparency, and administrative reference. You can securely download this verified document to your device.',
                  'यो आधिकारिक कागजात ईश्वरी माध्यमिक विद्यालयद्वारा सार्वजनिक जानकारी, पारदर्शिता र प्रशासनिक प्रयोजनका लागि प्रकाशित गरिएको हो। तपाईं यो दस्तावेज आफ्नो उपकरणमा सुरक्षित डाउनलोड गर्न सक्नुहुन्छ।'
                )}
              </p>
            </div>

            {/* Bottom Controls: Bottom-left: subtle/dim red close icon; Bottom-right: vivid purple download icon */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                title={t('Close Document', 'कागजात बन्द गर्नुहोस्')}
                aria-label={t('Close Document', 'कागजात बन्द गर्नुहोस्')}
                className="p-2 rounded-lg text-red-500/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const toDownload = previewDoc;
                  setPreviewDoc(null);
                  setPendingDownloadDoc(toDownload);
                }}
                title={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
                aria-label={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
                className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {pendingDownloadDoc && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingDownloadDoc(null)}
          onConfirm={() => executeDownload(pendingDownloadDoc)}
          variant="download"
          title={t('Confirm Document Download', 'कागजात डाउनलोड पुष्टि गर्नुहोस्')}
          description={t(
            'Do you want to download this document?',
            'के तपाईं यो कागजात डाउनलोड गर्न चाहनुहुन्छ?'
          )}
          itemName={`${t(pendingDownloadDoc.title_en, pendingDownloadDoc.title_np)} (${pendingDownloadDoc.type} • ${pendingDownloadDoc.size})`}
          confirmText={t('Download', 'डाउनलोड')}
          cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{t('Public Repository & Citizen Charter', 'सार्वजनिक अभिलेख तथा नागरिक बडापत्र')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Official Documents & Downloads', 'आधिकारिक कागजात तथा डाउनलोडहरू')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {t(
                'Download certified admission applications, scholarship forms, social audit publications, and institutional charters.',
                'भर्ना फारम, छात्रवृत्ति निवेदन, सामाजिक परीक्षण प्रतिवेदन तथा विद्यालयको नागरिक बडापत्र यहाँबाट डाउनलोड गर्नुहोस्।'
              )}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Search documents...', 'कागजात खोज्नुहोस्...')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#1E40AF] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              {t('No documents found matching your search.', 'खोजिए अनुसारको कुनै कागजात भेटिएन।')}
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewDoc(doc);
                  }
                }}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t(doc.title_en, doc.title_np)}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1E40AF]" />
                        <span>{doc.date}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc(doc);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                  >
                    <span>{t('View / Download', 'विवरण / डाउनलोड')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
