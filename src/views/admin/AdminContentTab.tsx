import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  DocumentItem,
  AcademicProgram,
  Facility,
  SchoolEvent,
  Achievement,
  HistoryItem
} from '../../types';
import {
  FileText,
  Bell,
  FileDown,
  Calendar,
  Award,
  History,
  Building2,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Save,
  Pin,
  Upload,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { EventsAchievementsHistoryTab } from './EventsAchievementsHistoryTab';
import { AdminDocumentsManager } from '../../components/admin/AdminDocumentsManager';

interface AdminContentTabProps {
  lang: Language;
  activeSubTab: 'content_about' | 'content_notices' | 'content_documents' | 'content_events' | 'content_achievements' | 'content_history';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  documents: DocumentItem[];
  onUpdateDocuments: (docs: DocumentItem[]) => void;
  programs: AcademicProgram[];
  onUpdatePrograms: (programs: AcademicProgram[]) => void;
  facilities: Facility[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  notices,
  onUpdateNotices,
  documents,
  onUpdateDocuments,
  programs,
  onUpdatePrograms,
  facilities,
  onUpdateFacilities,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  onShowToast
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // NOTICE FORM STATE
  const [noticeForm, setNoticeForm] = useState<Partial<Notice>>({
    title_en: '',
    title_np: '',
    category: 'academic',
    pinned: false,
    file_name: '',
    file_data: '',
    file_size_kb: 0,
    description_en: '',
    description_np: ''
  });
  const [noticeFileError, setNoticeFileError] = useState('');
  const [noticeSearch, setNoticeSearch] = useState('');

  // DOCUMENT FORM STATE
  const [docForm, setDocForm] = useState<Partial<DocumentItem>>({
    title_en: '',
    title_np: '',
    type: 'PDF',
    size: '1.2 MB',
    date: '2083-05-15'
  });

  // PROGRAM FORM STATE
  const [programForm, setProgramForm] = useState<Partial<AcademicProgram>>({
    title_en: '',
    title_np: '',
    level: '+2 Higher Secondary',
    duration: '2 Years',
    intake: 45,
    desc_en: '',
    desc_np: ''
  });

  // FACILITY FORM STATE
  const [facilityForm, setFacilityForm] = useState<Partial<Facility>>({
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
    icon: '🔬'
  });

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    confirmText: string;
    variant: ConfirmationVariant;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirm',
    variant: 'delete',
    action: () => {}
  });

  // NOTICE HANDLERS
  const handleNoticeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setNoticeFileError(t('Only official PDF files allowed.', 'केवल PDF फाइलहरू मात्र स्वीकार्य छन्।'));
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 200) {
      setNoticeFileError(
        t(
          `File size is ${sizeKb}KB. Maximum allowed is 200KB.`,
          `फाइल साइज ${sizeKb}KB छ। अधिकतम २००KB मात्र अनुमति छ।`
        )
      );
      return;
    }

    setNoticeFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setNoticeForm(prev => ({
        ...prev,
        file_name: file.name,
        file_data: event.target?.result as string,
        file_size_kb: sizeKb
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title_en) return;

    if (noticeForm.id) {
      // Update
      const updated = notices.map(n => n.id === noticeForm.id ? ({ ...n, ...noticeForm } as Notice) : n);
      onUpdateNotices(updated);
      onShowToast(t('Notice updated successfully!', 'सूचना अद्यावधिक गरियो!'));
    } else {
      // Create
      const newNotice: Notice = {
        id: Date.now(),
        title_en: noticeForm.title_en || '',
        title_np: noticeForm.title_np || noticeForm.title_en || '',
        category: noticeForm.category || 'academic',
        date_en: 'Bhadra 24, 2083',
        date_np: '२०८३ भाद्र २४',
        pinned: noticeForm.pinned || false,
        file_name: noticeForm.file_name || '',
        file_data: noticeForm.file_data || '',
        file_size_kb: noticeForm.file_size_kb || 0,
        description_en: noticeForm.description_en || '',
        description_np: noticeForm.description_np || ''
      };
      onUpdateNotices([newNotice, ...notices]);
      onShowToast(t('Notice published successfully!', 'सूचना प्रकाशित गरियो!'));
    }

    setNoticeForm({
      title_en: '',
      title_np: '',
      category: 'academic',
      pinned: false,
      file_name: '',
      file_data: '',
      file_size_kb: 0,
      description_en: '',
      description_np: ''
    });
  };

  const handleDeleteNotice = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Notice', 'सूचना मेटाउनुहोस्'),
      description: t('Are you sure you want to permanently delete this notice from the database?', 'के तपाईं यस सूचनालाई हटाउन निश्चित हुनुहुन्छ?'),
      itemName: t('Notice Entry', 'सूचना'),
      confirmText: t('Delete Notice', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateNotices(notices.filter(n => n.id !== id));
        onShowToast(t('Notice deleted.', 'सूचना मेटाइयो।'));
      }
    });
  };

  const handleTogglePinNotice = (id: number) => {
    const updated = notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    onUpdateNotices(updated);
    onShowToast(t('Notice pin status toggled.', 'सूचनाको पिन अवस्था परिवर्तन गरियो।'));
  };

  // DOCUMENT HANDLERS
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title_en) return;

    if (docForm.id) {
      const updated = documents.map(d => d.id === docForm.id ? ({ ...d, ...docForm } as DocumentItem) : d);
      onUpdateDocuments(updated);
      onShowToast(t('Document updated.', 'दस्तावेज अद्यावधिक गरियो।'));
    } else {
      const newDoc: DocumentItem = {
        id: Date.now(),
        title_en: docForm.title_en || '',
        title_np: docForm.title_np || docForm.title_en || '',
        type: docForm.type || 'PDF',
        size: docForm.size || '1.0 MB',
        date: docForm.date || '2083-05-15'
      };
      onUpdateDocuments([newDoc, ...documents]);
      onShowToast(t('New document published.', 'नयाँ दस्तावेज प्रकाशित गरियो।'));
    }

    setDocForm({
      title_en: '',
      title_np: '',
      type: 'PDF',
      size: '1.2 MB',
      date: '2083-05-15'
    });
  };

  const handleDeleteDocument = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Document', 'दस्तावेज मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this downloadable document?', 'के तपाईं यस दस्तावेजलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Document Entry', 'दस्तावेज'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateDocuments(documents.filter(d => d.id !== id));
        onShowToast(t('Document deleted.', 'दस्तावेज मेटाइयो।'));
      }
    });
  };

  // ACADEMIC PROGRAM HANDLERS
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title_en) return;

    if (programForm.id) {
      const updated = programs.map(p => p.id === programForm.id ? ({ ...p, ...programForm } as AcademicProgram) : p);
      onUpdatePrograms(updated);
      onShowToast(t('Academic program updated.', 'शैक्षिक कार्यक्रम अद्यावधिक गरियो।'));
    } else {
      const newProg: AcademicProgram = {
        id: Date.now(),
        title_en: programForm.title_en || '',
        title_np: programForm.title_np || programForm.title_en || '',
        level: programForm.level || '+2 Higher Secondary',
        duration: programForm.duration || '2 Years',
        intake: programForm.intake || 40,
        desc_en: programForm.desc_en || '',
        desc_np: programForm.desc_np || ''
      };
      onUpdatePrograms([...programs, newProg]);
      onShowToast(t('Academic program added.', 'शैक्षिक कार्यक्रम थपियो।'));
    }

    setProgramForm({
      title_en: '',
      title_np: '',
      level: '+2 Higher Secondary',
      duration: '2 Years',
      intake: 45,
      desc_en: '',
      desc_np: ''
    });
  };

  const handleDeleteProgram = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Academic Program', 'कार्यक्रम मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this academic program?', 'के तपाईं यस शैक्षिक कार्यक्रमलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Academic Program', 'शैक्षिक कार्यक्रम'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdatePrograms(programs.filter(p => p.id !== id));
        onShowToast(t('Academic program removed.', 'कार्यक्रम हटाइयो।'));
      }
    });
  };

  // FACILITY HANDLERS
  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.title_en) return;

    if (facilityForm.id) {
      const updated = facilities.map(f => f.id === facilityForm.id ? ({ ...f, ...facilityForm } as Facility) : f);
      onUpdateFacilities(updated);
      onShowToast(t('Facility updated.', 'पूर्वाधार अद्यावधिक गरियो।'));
    } else {
      const newFacility: Facility = {
        id: Date.now(),
        title_en: facilityForm.title_en || '',
        title_np: facilityForm.title_np || facilityForm.title_en || '',
        desc_en: facilityForm.desc_en || '',
        desc_np: facilityForm.desc_np || '',
        icon: facilityForm.icon || '🔬'
      };
      onUpdateFacilities([...facilities, newFacility]);
      onShowToast(t('New facility added.', 'पूर्वाधार थपियो।'));
    }

    setFacilityForm({
      title_en: '',
      title_np: '',
      desc_en: '',
      desc_np: '',
      icon: '🔬'
    });
  };

  const handleDeleteFacility = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Facility', 'पूर्वाधार मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this facility from campus list?', 'के तपाईं यस पूर्वाधारलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Campus Facility', 'पूर्वाधार'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateFacilities(facilities.filter(f => f.id !== id));
        onShowToast(t('Facility removed.', 'पूर्वाधार हटाइयो।'));
      }
    });
  };

  const filteredNotices = notices.filter(n => {
    if (!noticeSearch) return true;
    const q = noticeSearch.toLowerCase();
    return (
      n.title_en.toLowerCase().includes(q) ||
      n.title_np.includes(q) ||
      n.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        variant={confirmState.variant}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
      />

      {/* 1. ABOUT & ACADEMICS & FACILITIES */}
      {activeSubTab === 'content_about' && (
        <div className="space-y-6">
          {/* Facilities CRUD */}
          <form onSubmit={handleSaveFacility} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1E40AF]" />
                  <span>{facilityForm.id ? t('Edit Campus Facility', 'पूर्वाधार सम्पादन') : t('Add Campus Facility / Laboratory', 'नयाँ पूर्वाधार तथा प्रयोगशाला थप्नुहोस्')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Manage specialized science laboratories, ICT labs, library, and sports complexes', 'विज्ञान प्रयोगशाला, कम्प्युटर ल्याब, पुस्तकालय तथा खेल मैदान')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{facilityForm.id ? t('Update Facility', 'अपडेट गर्नुहोस्') : t('Add Facility', 'थप्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Facility Name (English) *', 'पूर्वाधार नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.title_en || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, title_en: e.target.value })}
                  placeholder="e.g., Optical Fiber ICT Studio"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('पूर्वाधार नाम (नेपाली) *', 'पूर्वाधार नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  value={facilityForm.title_np || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, title_np: e.target.value })}
                  placeholder="जस्तै: सूचना तथा प्रविधि (ICT) केन्द्र"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Technical Specifications & Overview (English)', 'विवरण (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={facilityForm.desc_en || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </form>

          {/* Facility Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {facilities.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{f.icon}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFacilityForm(f);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFacility(f.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(f.title_en, f.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(f.desc_en, f.desc_np)}
                </p>
              </div>
            ))}
          </div>

          {/* Academic Programs CRUD */}
          <form onSubmit={handleSaveProgram} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs mt-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1E40AF]" />
                  <span>{programForm.id ? t('Edit Academic Program', 'शैक्षिक कार्यक्रम सम्पादन') : t('Add Academic Program', 'नयाँ शैक्षिक कार्यक्रम थप्नुहोस्')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Curriculum levels: Secondary (Grades 1-10) and Higher Secondary (+2 Science & Management)', 'माध्यमिक तथा उच्च माध्यमिक (+२) शैक्षिक कार्यक्रम व्यवस्थापन')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{programForm.id ? t('Update Program', 'अपडेट गर्नुहोस्') : t('Create Program', 'थप्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Program Title (English) *', 'कार्यक्रमको नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={programForm.title_en || ''}
                  onChange={e => setProgramForm({ ...programForm, title_en: e.target.value })}
                  placeholder="e.g., Higher Secondary (+2 Computer Science)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('कार्यक्रमको नाम (नेपाली) *', 'कार्यक्रमको नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  value={programForm.title_np || ''}
                  onChange={e => setProgramForm({ ...programForm, title_np: e.target.value })}
                  placeholder="जस्तै: उच्च माध्यमिक (+२ कम्प्युटर विज्ञान)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Academic Level', 'तह')}
                </label>
                <input
                  type="text"
                  value={programForm.level || ''}
                  onChange={e => setProgramForm({ ...programForm, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Annual Student Intake Capacity', 'वार्षिक सिट संख्या')}
                </label>
                <input
                  type="number"
                  value={programForm.intake || 40}
                  onChange={e => setProgramForm({ ...programForm, intake: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Curriculum Description (English)', 'पाठ्यक्रम विवरण (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={programForm.desc_en || ''}
                  onChange={e => setProgramForm({ ...programForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </form>

          {/* Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                    Intake: {p.intake} Students
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProgramForm(p);
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProgram(p.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(p.title_en, p.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(p.desc_en, p.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NOTICES & CIRCULARS */}
      {activeSubTab === 'content_notices' && (
        <div className="space-y-6">
          {/* Notice Form */}
          <form onSubmit={handleSaveNotice} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1E40AF]" />
                  <span>{noticeForm.id ? t('Edit Notice', 'सूचना सम्पादन') : t('Publish New Circular / Notice', 'नयाँ सूचना प्रकाशित गर्नुहोस्')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Notices propagate instantly to homepage banner, ticker, and public notices repository', 'सूचना प्रकाशित गर्नासाथ सार्वजनिक गृहपृष्ठ र सूचना खण्डमा तत्काल देखिन्छ')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{noticeForm.id ? t('Update Notice', 'अपडेट गर्नुहोस्') : t('Publish Notice', 'प्रकाशित गर्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Notice Title (English) *', 'सूचना शीर्षक (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={noticeForm.title_en || ''}
                  onChange={e => setNoticeForm({ ...noticeForm, title_en: e.target.value })}
                  placeholder="e.g., Annual Examination Routine 2083"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सूचना शीर्षक (नेपाली) *', 'सूचना शीर्षक (नेपाली) *')}
                </label>
                <input
                  type="text"
                  required
                  value={noticeForm.title_np || ''}
                  onChange={e => setNoticeForm({ ...noticeForm, title_np: e.target.value })}
                  placeholder="जस्तै: वार्षिक परीक्षा तालिका २०८३ प्रकाशित गरिएको बारे"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Category', 'वर्गीकरण')}
                </label>
                <select
                  value={noticeForm.category || 'academic'}
                  onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="academic">{t('Academic (शैक्षिक)', 'शैक्षिक')}</option>
                  <option value="exam">{t('Exam Routine (परीक्षा तालिका)', 'परीक्षा')}</option>
                  <option value="scholarship">{t('Scholarship (छात्रवृत्ति)', 'छात्रवृत्ति')}</option>
                  <option value="admin">{t('Administrative (प्रशासनिक)', 'प्रशासनिक')}</option>
                  <option value="event">{t('Events / Calendar (कार्यक्रम)', 'कार्यक्रम')}</option>
                </select>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Attach PDF Document (Max 200KB)', 'संलग्न PDF फाइल (अधिकतम २००KB)')}
                </label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('Upload PDF', 'PDF छान्नुहोस्')}</span>
                    <input type="file" accept="application/pdf" onChange={handleNoticeFileUpload} className="hidden" />
                  </label>
                  {noticeForm.file_name && (
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                      {noticeForm.file_name} ({noticeForm.file_size_kb}KB)
                    </span>
                  )}
                </div>
                {noticeFileError && (
                  <p className="text-[11px] text-red-500 mt-1">{noticeFileError}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Notice Full Content / Description (English)', 'विस्तृत व्यहोरा (अंग्रेजी)')}
                </label>
                <textarea
                  rows={3}
                  value={noticeForm.description_en || ''}
                  onChange={e => setNoticeForm({ ...noticeForm, description_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('विस्तृत व्यहोरा (नेपाली)', 'विस्तृत व्यहोरा (नेपाली)')}
                </label>
                <textarea
                  rows={3}
                  value={noticeForm.description_np || ''}
                  onChange={e => setNoticeForm({ ...noticeForm, description_np: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeForm.pinned || false}
                    onChange={e => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                    className="w-4 h-4 text-[#1E40AF] rounded"
                  />
                  <span>{t('Pin notice to homepage top alert banner', 'यस सूचनालाई गृहपृष्ठको शीर्ष भागमा पिन गर्नुहोस्')}</span>
                </label>
              </div>
            </div>
          </form>

          {/* Notices List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t(`Published Circulars (${notices.length})`, `प्रकाशित सूचनाहरू (${notices.length})`)}
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={noticeSearch}
                  onChange={e => setNoticeSearch(e.target.value)}
                  placeholder={t('Search notices...', 'सूचना खोज्नुहोस्...')}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotices.map((n) => (
                <div key={n.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {n.pinned && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#1E40AF] text-white uppercase">
                          Pinned
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                        {n.category}
                      </span>
                      {n.file_name && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-mono">
                          <FileText className="w-2.5 h-2.5" />
                          <span>PDF{n.file_size_kb ? ` (${n.file_size_kb}KB)` : ''}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{t(n.date_en, n.date_np)}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t(n.title_en, n.title_np)}
                    </h5>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePinNotice(n.id)}
                      title={n.pinned ? 'Unpin' : 'Pin to Homepage'}
                      className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        n.pinned ? 'text-[#1E40AF]' : 'text-slate-400'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeForm(n);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCUMENTS & CITIZEN'S CHARTER */}
      {activeSubTab === 'content_documents' && (
        <AdminDocumentsManager
          documents={documents}
          onUpdateDocuments={onUpdateDocuments}
          lang={lang}
          canManage={true}
        />
      )}

      {/* 4. EVENTS, ACHIEVEMENTS & HISTORY */}
      {(activeSubTab === 'content_events' || activeSubTab === 'content_achievements' || activeSubTab === 'content_history') && (
        <EventsAchievementsHistoryTab
          lang={lang}
          events={events}
          onUpdateEvents={onUpdateEvents}
          achievements={achievements}
          onUpdateAchievements={onUpdateAchievements}
          history={history}
          onUpdateHistory={onUpdateHistory}
          onShowToast={onShowToast}
          activeCategory={
            activeSubTab === 'content_events' ? 'events' :
            activeSubTab === 'content_achievements' ? 'achievements' : 'history'
          }
        />
      )}
    </div>
  );
};
