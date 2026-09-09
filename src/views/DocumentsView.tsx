import React, { useState } from 'react';
import { Language, DocumentItem } from '../types';
import {
  FileText,
  Download,
  Search,
  FolderArchive,
  Calendar,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

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

  const filteredDocs = documents.filter(d => {
    // Only published documents appear on public view
    if (d.is_published === false || d.status === 'draft') return false;
    return (
      d.title_en.toLowerCase().includes(query.toLowerCase()) ||
      d.title_np.toLowerCase().includes(query.toLowerCase()) ||
      (d.type && d.type.toLowerCase().includes(query.toLowerCase()))
    );
  });

  const executeDownload = (doc: DocumentItem) => {
    // Authoritative direct download endpoint
    const downloadUrl = `/api/documents/${doc.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    const rawName = doc.original_filename || `${(doc.title_en || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const safeName = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`;
    link.setAttribute('download', safeName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadToast(
      t(
        `Downloaded official document: ${doc.title_en}`,
        `कागजात डाउनलोड भयो: ${doc.title_np || doc.title_en}`
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

      {/* Shared Medium-sized Centered Document Viewer Modal */}
      <DocumentViewerModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={(doc) => {
          setPreviewDoc(null);
          setPendingDownloadDoc(doc);
        }}
        lang={lang}
      />

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
