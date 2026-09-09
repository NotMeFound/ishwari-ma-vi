import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  RefreshCw,
  Loader2,
  Globe2,
  Lock,
  FileUp,
  AlertTriangle
} from 'lucide-react';
import { DocumentItem, Language } from '../../types';
import { apiClient } from '../../services/apiClient';
import { DocumentViewerModal } from '../DocumentViewerModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface AdminDocumentsManagerProps {
  documents: DocumentItem[];
  onUpdateDocuments: (updatedDocs: DocumentItem[]) => void;
  lang?: Language;
  canManage?: boolean;
}

export const AdminDocumentsManager: React.FC<AdminDocumentsManagerProps> = ({
  documents: initialDocuments,
  onUpdateDocuments,
  lang = 'en',
  canManage = true
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload & Edit Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Form State
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleNp, setFormTitleNp] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescNp, setFormDescNp] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileValidationSuccess, setFileValidationSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action Modals State
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [togglingPublishDoc, setTogglingPublishDoc] = useState<DocumentItem | null>(null);

  // Sync state if props change
  useEffect(() => {
    if (initialDocuments) {
      setDocuments(initialDocuments);
    }
  }, [initialDocuments]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Refresh latest documents from authoritative API
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await apiClient.fetchDocuments(true);
      if (res.success && res.documents) {
        setDocuments(res.documents);
        onUpdateDocuments(res.documents);
        showToast('Document list refreshed from server database.', 'success');
      } else {
        showToast(res.error || 'Failed to refresh documents from server.', 'error');
      }
    } catch {
      showToast('Network error while refreshing documents.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Client-side Strict PDF Validation: Format, Max 200 KB, and %PDF- Magic Bytes
  const validateAndProcessFile = async (file: File) => {
    setFileError(null);
    setFileValidationSuccess(false);
    setSelectedFile(null);
    setSelectedFileBase64('');

    // 1. Strict Extension Check
    const fileNameLower = file.name.toLowerCase();
    if (!fileNameLower.endsWith('.pdf')) {
      setFileError('Only PDF files (.pdf) are allowed. Format rejected.');
      return;
    }

    // 2. MIME type check
    if (file.type && !file.type.toLowerCase().includes('pdf') && file.type !== 'application/pdf') {
      setFileError('Only PDF files (.pdf) are allowed. Format rejected.');
      return;
    }

    // 3. Strict 200 KB Size Check
    const MAX_SIZE_BYTES = 200 * 1024; // 204,800 bytes
    if (file.size > MAX_SIZE_BYTES) {
      const currentSizeKb = (file.size / 1024).toFixed(1);
      setFileError(`The selected PDF exceeds the 200 KB maximum size (Current: ${currentSizeKb} KB).`);
      return;
    }

    if (file.size === 0) {
      setFileError('The uploaded PDF file is empty.');
      return;
    }

    // 4. Client-side Magic-Byte Verification (First 5 bytes must be %PDF-)
    try {
      const slice = file.slice(0, 5);
      const buffer = await slice.arrayBuffer();
      const header = new TextDecoder('ascii').decode(buffer);
      if (header !== '%PDF-') {
        setFileError('The uploaded file is not a valid PDF. File signature check failed (missing %PDF- header).');
        return;
      }
    } catch (e) {
      console.warn('Could not read file header:', e);
    }

    // Convert file to Base64 for upload
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedFile(file);
      setSelectedFileBase64(base64);
      setFileValidationSuccess(true);
      setFileError(null);
    };
    reader.onerror = () => {
      setFileError('Failed to read selected PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  // Open Upload Modal
  const openUploadModal = () => {
    setEditingDoc(null);
    setFormTitleEn('');
    setFormTitleNp('');
    setFormDescEn('');
    setFormDescNp('');
    setFormStatus('published');
    setSelectedFile(null);
    setSelectedFileBase64('');
    setFileError(null);
    setFileValidationSuccess(false);
    setIsUploadModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setFormTitleEn(doc.title_en || '');
    setFormTitleNp(doc.title_np || '');
    setFormDescEn(doc.description_en || '');
    setFormDescNp(doc.description_np || '');
    setFormStatus((doc.status as any) || (doc.is_published === false ? 'draft' : 'published'));
    setSelectedFile(null);
    setSelectedFileBase64('');
    setFileError(null);
    setFileValidationSuccess(false);
    setIsUploadModalOpen(true);
  };

  // Submit Upload or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitleEn.trim()) {
      setFileError('Document Title (English) is required.');
      return;
    }

    if (!editingDoc && (!selectedFile || !selectedFileBase64)) {
      setFileError('Please select a valid PDF file under 200 KB.');
      return;
    }

    setIsLoading(true);
    setFileError(null);

    try {
      if (editingDoc) {
        // Update Document
        const res = await apiClient.updateDocument(editingDoc.id, {
          title_en: formTitleEn.trim(),
          title_np: formTitleNp.trim() || formTitleEn.trim(),
          description_en: formDescEn.trim(),
          description_np: formDescNp.trim(),
          status: formStatus,
          is_published: formStatus === 'published',
          fileName: selectedFile?.name,
          fileType: selectedFile?.type,
          base64Data: selectedFileBase64 || undefined
        });

        if (res.success && res.document) {
          const updated = documents.map((d) => (d.id === res.document!.id ? res.document! : d));
          setDocuments(updated);
          onUpdateDocuments(updated);
          showToast(`Document "${res.document.title_en}" updated successfully.`);
          setIsUploadModalOpen(false);
        } else {
          setFileError(res.error || 'Failed to update document.');
        }
      } else {
        // Upload New Document
        const res = await apiClient.uploadDocument({
          title_en: formTitleEn.trim(),
          title_np: formTitleNp.trim() || formTitleEn.trim(),
          description_en: formDescEn.trim(),
          description_np: formDescNp.trim(),
          status: formStatus,
          fileName: selectedFile!.name,
          fileType: selectedFile!.type,
          base64Data: selectedFileBase64
        });

        if (res.success && res.document) {
          const updated = [res.document, ...documents];
          setDocuments(updated);
          onUpdateDocuments(updated);
          showToast(`Document "${res.document.title_en}" uploaded successfully!`);
          setIsUploadModalOpen(false);
        } else {
          setFileError(res.error || 'Failed to upload document.');
        }
      }
    } catch (err: any) {
      setFileError(err?.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (doc: DocumentItem) => {
    const nextStatus = !(doc.is_published ?? (doc.status !== 'draft'));
    try {
      const res = await apiClient.togglePublishDocument(doc.id, nextStatus);
      if (res.success && res.document) {
        const updated = documents.map((d) => (d.id === doc.id ? res.document! : d));
        setDocuments(updated);
        onUpdateDocuments(updated);
        showToast(
          `Document "${doc.title_en}" ${nextStatus ? 'published' : 'moved to draft'} successfully.`,
          'success'
        );
      } else {
        showToast(res.error || 'Failed to change publish status.', 'error');
      }
    } catch {
      showToast('Network error updating publish status.', 'error');
    } finally {
      setTogglingPublishDoc(null);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (doc: DocumentItem) => {
    try {
      const res = await apiClient.deleteDocument(doc.id);
      if (res.success) {
        const updated = documents.filter((d) => d.id !== doc.id);
        setDocuments(updated);
        onUpdateDocuments(updated);
        showToast(`Document "${doc.title_en}" deleted permanently.`, 'success');
      } else {
        showToast(res.error || 'Failed to delete document.', 'error');
      }
    } catch {
      showToast('Network error deleting document.', 'error');
    } finally {
      setDeletingDoc(null);
    }
  };

  // Direct Download Trigger
  const handleDownload = (doc: DocumentItem) => {
    const downloadUrl = `/api/documents/${doc.id}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    const safeName = doc.original_filename || `${doc.title_en.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    link.setAttribute('download', safeName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading: ${doc.title_en}`);
  };

  // Filtered documents list
  const filteredDocuments = documents.filter((d) => {
    const matchesSearch =
      d.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title_np?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isPublished = d.is_published !== false && d.status !== 'draft';
    if (statusFilter === 'published') return isPublished;
    if (statusFilter === 'draft') return !isPublished;
    return true;
  });

  return (
    <div className="space-y-6" id="admin-documents-section">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-500'
              : 'bg-red-950 text-red-100 border-red-500'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Official PDF Document Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload, publish, inspect, and maintain certified institutional records (PDF only • Max 200 KB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh documents from server"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              type="button"
              id="btn-upload-document"
              onClick={openUploadModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, filename..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'published', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-mono ml-2">
            ({filteredDocuments.length} items)
          </span>
        </div>
      </div>

      {/* Document Records Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No documents found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No documents matched your query. Try different keywords.'
                : 'No official PDF documents uploaded yet. Click "+ Upload Document" to get started.'}
            </p>
            {canManage && !searchQuery && (
              <button
                type="button"
                onClick={openUploadModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First PDF Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-4 py-3.5">Format & Size</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredDocuments.map((doc) => {
                  const isPub = doc.is_published !== false && doc.status !== 'draft';
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Document Details */}
                      <td className="px-5 py-4 min-w-[260px]">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white leading-snug">
                            {doc.title_en}
                          </div>
                          {doc.title_np && doc.title_np !== doc.title_en && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              {doc.title_np}
                            </div>
                          )}
                          {doc.original_filename && (
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <FileCheck2 className="w-3 h-3 text-emerald-500" />
                              <span className="truncate max-w-[220px]">{doc.original_filename}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Format & Size */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1 font-mono text-[11px]">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                            PDF
                          </span>
                          <div className="text-slate-500 text-[10px]">{doc.size || 'Official PDF'}</div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {doc.date || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={!canManage}
                          onClick={() => setTogglingPublishDoc(doc)}
                          title={canManage ? 'Click to toggle status' : 'Status'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            isPub
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100'
                          } ${canManage ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPub ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          <span>{isPub ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setViewingDoc(doc)}
                            title="View Document"
                            aria-label="View Document"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Trigger */}
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            title="Download Document"
                            aria-label="Download Document"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Edit Trigger */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              title="Edit Metadata or Replace PDF"
                              aria-label="Edit Document"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Trigger */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setDeletingDoc(doc)}
                              title="Delete Document"
                              aria-label="Delete Document"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload & Edit Document Modal Form */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => !isLoading && setIsUploadModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingDoc ? 'Edit Document' : 'Upload Official PDF Document'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDoc
                      ? 'Update document details or attach a replacement PDF'
                      : 'Add an authenticated institutional document (Max 200 KB)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isLoading && setIsUploadModalOpen(false)}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Box */}
            {fileError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{fileError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* English Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Citizen Charter & Institutional Service Standards"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nepali Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title (Nepali)
                </label>
                <input
                  type="text"
                  value={formTitleNp}
                  onChange={(e) => setFormTitleNp(e.target.value)}
                  placeholder="e.g. नागरिक बडापत्र तथा सेवा प्रवाह मापदण्ड"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description / Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Summary / Institutional Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  placeholder="Brief summary regarding the purpose, scope, or applicability of this document..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Drag and Drop PDF File Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    PDF File {editingDoc ? '(Optional replacement)' : <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    Format: .pdf • Max: 200 KB
                  </span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                      : fileValidationSuccess
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                      : fileError
                      ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-left font-mono text-xs">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Valid PDF Signature
                        </p>
                      </div>
                    </div>
                  ) : editingDoc?.original_filename ? (
                    <div className="space-y-1.5">
                      <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Current: <span className="font-mono">{editingDoc.original_filename}</span> ({editingDoc.size})
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        Click or drop a new .pdf to replace this file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to browse or drag & drop PDF here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Strict validation: Only .pdf files up to 200 KB accepted
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Radio / Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publishing Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      formStatus === 'published'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formStatus === 'published'}
                      onChange={() => setFormStatus('published')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Published</div>
                      <div className="text-[10px] text-slate-500">Visible on public website</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      formStatus === 'draft'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formStatus === 'draft'}
                      onChange={() => setFormStatus('draft')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Draft</div>
                      <div className="text-[10px] text-slate-500">Internal admin only</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDoc ? 'Save Changes' : 'Upload Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onDownload={handleDownload}
        lang={lang}
      />

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeletingDoc(null)}
          onConfirm={() => handleDeleteDocument(deletingDoc)}
          variant="delete"
          title="Delete PDF Document?"
          description={`Are you sure you want to permanently delete "${deletingDoc.title_en}"? This will remove both the database record and the stored file from server storage.`}
          confirmText="Delete Permanently"
        />
      )}

      {/* Toggle Publish Confirmation Modal */}
      {togglingPublishDoc && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setTogglingPublishDoc(null)}
          onConfirm={() => handleTogglePublish(togglingPublishDoc)}
          variant="info"
          title={
            togglingPublishDoc.is_published !== false && togglingPublishDoc.status !== 'draft'
              ? 'Unpublish Document to Draft?'
              : 'Publish Document Live?'
          }
          description={
            togglingPublishDoc.is_published !== false && togglingPublishDoc.status !== 'draft'
              ? `Moving "${togglingPublishDoc.title_en}" to Draft will immediately hide it from the public school website.`
              : `Publishing "${togglingPublishDoc.title_en}" will make it immediately visible and downloadable to all website visitors.`
          }
          confirmText={
            togglingPublishDoc.is_published !== false && togglingPublishDoc.status !== 'draft'
              ? 'Move to Draft'
              : 'Publish Live'
          }
        />
      )}
    </div>
  );
};
