import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  StaffMember
} from '../../types';
import {
  Users,
  UserCheck,
  GraduationCap,
  Save,
  Plus,
  Trash2,
  Edit3,
  Upload,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { StaffAdminTab } from './StaffAdminTab';

interface AdminGovernanceTabProps {
  lang: Language;
  activeSubTab: 'gov_smc' | 'gov_chairman' | 'gov_principal' | 'gov_staff';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  onShowToast: (msg: string) => void;
  canCreateStaff: boolean;
  canUpdateStaff: boolean;
  canDeleteStaff: boolean;
}

export const AdminGovernanceTab: React.FC<AdminGovernanceTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  staff,
  onUpdateStaff,
  onShowToast,
  canCreateStaff,
  canUpdateStaff,
  canDeleteStaff
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Chairman state
  const [chairmanForm, setChairmanForm] = useState({
    name_en: school.chairman_name_en || 'Mr. Lokendra Bahadur Shrestha',
    name_np: school.chairman_name_np || 'श्री लोकेन्द्र बहादुर श्रेष्ठ',
    designation_en: school.chairman_designation_en || 'Chairman, School Management Committee',
    designation_np: school.chairman_designation_np || 'अध्यक्ष, विद्यालय व्यवस्थापन समिति',
    message_en: school.chairman_message_en || 'Ishwari Secondary School remains dedicated to quality, inclusion, and transparent school governance. We work closely with the community, parents, and municipality to ensure an optimal learning environment for every child.',
    message_np: school.chairman_message_np || 'ईश्वरी माध्यमिक विद्यालय गुणस्तरीय, समावेशी र पारदर्शी विद्यालय सुशासनमा सधैं प्रतिबद्ध छ। हामी समुदाय, अभिभावक र स्थानीय सरकारसँग हातेमालो गर्दै प्रत्येक बालबालिकाको उज्ज्वल भविष्यका लागि समर्पित छौं।',
    image: school.chairman_image || ''
  });

  // Principal state
  const [principalForm, setPrincipalForm] = useState({
    name_en: school.principal_name_en,
    name_np: school.principal_name_np,
    designation_en: school.principal_designation_en || 'Headmaster / Principal (M.Ed, M.A.)',
    designation_np: school.principal_designation_np || 'प्रधानाध्यापक',
    message_en: school.principal_message_en,
    message_np: school.principal_message_np,
    image: school.principal_image || ''
  });

  // SMC Member Form state
  const smcMembers = staff.filter(s => s.role === 'smc_chair' || s.role === 'smc_member');

  const [smcForm, setSmcForm] = useState<Partial<StaffMember>>({
    name_en: '',
    name_np: '',
    role: 'smc_member',
    designation_en: '',
    designation_np: '',
    experience: '',
    department_en: 'Management Committee'
  });

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
    variant: 'update',
    action: () => {}
  });

  const handleSaveChairman = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Chairman Profile & Message', 'अध्यक्षको विवरण तथा सन्देश सुरक्षित गर्नुहोस्'),
      description: t('Update the SMC Chairman name, photo, and official address on the public website?', 'विद्यालय व्यवस्थापन समिति अध्यक्षको नाम, तस्वीर र सन्देश अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t('SMC Chairman Details', 'वि.व्य.स. अध्यक्ष विवरण'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSchool({
          ...school,
          chairman_name_en: chairmanForm.name_en,
          chairman_name_np: chairmanForm.name_np,
          chairman_designation_en: chairmanForm.designation_en,
          chairman_designation_np: chairmanForm.designation_np,
          chairman_message_en: chairmanForm.message_en,
          chairman_message_np: chairmanForm.message_np,
          chairman_image: chairmanForm.image
        });
        onShowToast(t('SMC Chairman message updated successfully!', 'अध्यक्षको सन्देश सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSavePrincipal = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t("Save Principal's Desk Message", 'प्रधानाध्यापकको सन्देश सुरक्षित गर्नुहोस्'),
      description: t("Update the Principal's name, designation, photograph, and official message?", 'प्रधानाध्यापकको नाम, पद, तस्वीर र सन्देश अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t("Principal's Desk Details", 'प्रधानाध्यापक विवरण'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSchool({
          ...school,
          principal_name_en: principalForm.name_en,
          principal_name_np: principalForm.name_np,
          principal_designation_en: principalForm.designation_en,
          principal_designation_np: principalForm.designation_np,
          principal_message_en: principalForm.message_en,
          principal_message_np: principalForm.message_np,
          principal_image: principalForm.image
        });
        onShowToast(t("Principal's message and profile updated successfully!", 'प्रधानाध्यापकको विवरण सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSaveSmcMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smcForm.name_en) return;

    if (smcForm.id) {
      // Update existing
      const updated = staff.map(s => s.id === smcForm.id ? ({ ...s, ...smcForm } as StaffMember) : s);
      onUpdateStaff(updated);
      onShowToast(t('SMC Member updated successfully!', 'वि.व्य.स. सदस्य विवरण अद्यावधिक गरियो!'));
    } else {
      // Create new
      const newMember: StaffMember = {
        id: Date.now(),
        name_en: smcForm.name_en || '',
        name_np: smcForm.name_np || smcForm.name_en || '',
        role: smcForm.role || 'smc_member',
        designation_en: smcForm.designation_en || 'SMC Member',
        designation_np: smcForm.designation_np || 'सदस्य, वि.व्य.स.',
        experience: smcForm.experience || 'Tenure: 2081-2084',
        department_en: 'School Management Committee',
        department_np: 'विद्यालय व्यवस्थापन समिति',
        image: smcForm.image || '',
        isActive: true
      };
      onUpdateStaff([newMember, ...staff]);
      onShowToast(t('New SMC Member added successfully!', 'नयाँ वि.व्य.स. सदस्य थपियो!'));
    }

    setSmcForm({
      name_en: '',
      name_np: '',
      role: 'smc_member',
      designation_en: '',
      designation_np: '',
      experience: '',
      image: ''
    });
  };

  const handleDeleteSmcMember = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete SMC Member', 'सदस्य हटाउनुहोस्'),
      description: t('Are you sure you want to remove this member from the School Management Committee roster?', 'के तपाईं यस सदस्यलाई व्यवस्थापन समितिबाट हटाउन निश्चित हुनुहुन्छ?'),
      itemName: t('SMC Member', 'वि.व्य.स. सदस्य'),
      confirmText: t('Delete Member', 'हटाउनुहोस्'),
      action: () => {
        onUpdateStaff(staff.filter(s => s.id !== id));
        onShowToast(t('SMC member removed.', 'वि.व्य.स. सदस्य हटाइयो।'));
      }
    });
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      onShowToast(t('Photo must be under 1MB', 'तस्वीर १MB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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

      {/* 1. SCHOOL MANAGEMENT COMMITTEE (SMC) */}
      {activeSubTab === 'gov_smc' && (
        <div className="space-y-6">
          {/* SMC Member Form */}
          <form onSubmit={handleSaveSmcMember} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E40AF]" />
                  <span>
                    {smcForm.id
                      ? t('Edit SMC Member', 'व्यवस्थापन समिति सदस्य सम्पादन')
                      : t('Add School Management Committee (SMC) Member', 'नयाँ वि.व्य.स. सदस्य थप्नुहोस्')}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Manage institutional leadership, parent delegates, teacher delegates, and ward representatives', 'अभिभावक, शिक्षक, वडा प्रतिनिधि तथा पदाधिकारीहरूको विवरण')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{smcForm.id ? t('Update Member', 'अपडेट गर्नुहोस्') : t('Save Member', 'थप्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Member Full Name (English) *', 'सदस्यको नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={smcForm.name_en || ''}
                  onChange={e => setSmcForm({ ...smcForm, name_en: e.target.value })}
                  placeholder="e.g., Mr. Lokendra Bahadur Shrestha"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सदस्यको नाम (नेपाली) *', 'सदस्यको नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  value={smcForm.name_np || ''}
                  onChange={e => setSmcForm({ ...smcForm, name_np: e.target.value })}
                  placeholder="जस्तै: श्री लोकेन्द्र बहादुर श्रेष्ठ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Designation / Committee Position (English)', 'पद (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={smcForm.designation_en || ''}
                  onChange={e => setSmcForm({ ...smcForm, designation_en: e.target.value })}
                  placeholder="e.g., Parent Representative / Member"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('पद (नेपाली)', 'पद (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={smcForm.designation_np || ''}
                  onChange={e => setSmcForm({ ...smcForm, designation_np: e.target.value })}
                  placeholder="जस्तै: सदस्य (अभिभावक प्रतिनिधि)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Tenure / Period', 'कार्यकाल अवधि')}
                </label>
                <input
                  type="text"
                  value={smcForm.experience || ''}
                  onChange={e => setSmcForm({ ...smcForm, experience: e.target.value })}
                  placeholder="e.g., 2081 - 2084 B.S."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Governance Role', 'समिति भूमिका')}
                </label>
                <select
                  value={smcForm.role || 'smc_member'}
                  onChange={e => setSmcForm({ ...smcForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="smc_chair">{t('SMC Chairperson (अध्यक्ष)', 'वि.व्य.स. अध्यक्ष')}</option>
                  <option value="smc_member">{t('SMC Member (सदस्य)', 'वि.व्य.स. सदस्य')}</option>
                </select>
              </div>
            </div>
          </form>

          {/* SMC Member List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t(`Current SMC Roster (${smcMembers.length})`, `हालको व्यवस्थापन समिति सदस्यहरू (${smcMembers.length})`)}
            </h4>

            {smcMembers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {t('No SMC members added yet. Use the form above to register members.', 'हाल कुनै सदस्य सूचीकृत छैनन्। माथिको फारम प्रयोग गर्नुहोस्।')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {smcMembers.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                          m.role === 'smc_chair' ? 'bg-[#1E40AF] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {m.role === 'smc_chair' ? 'Chairperson' : 'Member'}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t(m.name_en, m.name_np)}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t(m.designation_en, m.designation_np)} {m.experience ? `• ${m.experience}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSmcForm(m);
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Edit member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSmcMember(m.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CHAIRMAN PROFILE & MESSAGE */}
      {activeSubTab === 'gov_chairman' && (
        <form onSubmit={handleSaveChairman} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('School Management Committee Chairman Profile', 'वि.व्य.स. अध्यक्षको सन्देश तथा प्रोफाइल')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure Chairman portrait photograph, formal designation, and official address', 'अध्यक्षको तस्वीर, पद र संस्थागत सन्देश')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Chairman Profile', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Chairman Full Name (English) *', 'अध्यक्षको नाम (अंग्रेजी) *')}
              </label>
              <input
                type="text"
                required
                value={chairmanForm.name_en}
                onChange={e => setChairmanForm({ ...chairmanForm, name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('अध्यक्षको नाम (नेपाली) *', 'अध्यक्षको नाम (नेपाली) *')}
              </label>
              <input
                type="text"
                required
                value={chairmanForm.name_np}
                onChange={e => setChairmanForm({ ...chairmanForm, name_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Designation (English)', 'पद (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={chairmanForm.designation_en}
                onChange={e => setChairmanForm({ ...chairmanForm, designation_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('पद (नेपाली)', 'पद (नेपाली)')}
              </label>
              <input
                type="text"
                value={chairmanForm.designation_np}
                onChange={e => setChairmanForm({ ...chairmanForm, designation_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {chairmanForm.image ? (
                  <img src={chairmanForm.image} alt="Chairman" className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('Chairman Official Portrait Photograph', 'अध्यक्षको आधिकारिक तस्वीर')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t('Upload formal 3:4 portrait photo (max 1MB)', '३:४ ढाँचाको औपचारिक तस्वीर (अधिकतम १MB)')}
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('Upload Photo', 'तस्वीर अपलोड')}</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, url => setChairmanForm({ ...chairmanForm, image: url }))} className="hidden" />
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Address / Message (English)', 'आधिकारिक सन्देश (अंग्रेजी)')}
              </label>
              <textarea
                rows={4}
                value={chairmanForm.message_en}
                onChange={e => setChairmanForm({ ...chairmanForm, message_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('आधिकारिक सन्देश (नेपाली)', 'आधिकारिक सन्देश (नेपाली)')}
              </label>
              <textarea
                rows={4}
                value={chairmanForm.message_np}
                onChange={e => setChairmanForm({ ...chairmanForm, message_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* 3. PRINCIPAL'S DESK */}
      {activeSubTab === 'gov_principal' && (
        <form onSubmit={handleSavePrincipal} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1E40AF]" />
                <span>{t("Principal's Desk Speech & Profile", 'प्रधानाध्यापकको सन्देश तथा प्रोफाइल')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t("Configure Headmaster's message, qualifications, and official portrait", 'प्रधानाध्यापकको सन्देश, योग्यता र तस्वीर व्यवस्थापन')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Principal Profile', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Principal Full Name (English) *', 'प्रधानाध्यापकको नाम (अंग्रेजी) *')}
              </label>
              <input
                type="text"
                required
                value={principalForm.name_en}
                onChange={e => setPrincipalForm({ ...principalForm, name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('प्रधानाध्यापकको नाम (नेपाली) *', 'प्रधानाध्यापकको नाम (नेपाली) *')}
              </label>
              <input
                type="text"
                required
                value={principalForm.name_np}
                onChange={e => setPrincipalForm({ ...principalForm, name_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Qualifications & Designation (English)', 'शैक्षिक योग्यता र पद (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={principalForm.designation_en}
                onChange={e => setPrincipalForm({ ...principalForm, designation_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('शैक्षिक योग्यता र पद (नेपाली)', 'शैक्षिक योग्यता र पद (नेपाली)')}
              </label>
              <input
                type="text"
                value={principalForm.designation_np}
                onChange={e => setPrincipalForm({ ...principalForm, designation_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Principal Photo */}
            <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {principalForm.image ? (
                  <img src={principalForm.image} alt="Principal" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('Principal Official Passport Photo', 'प्रधानाध्यापकको औपचारिक तस्वीर')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t('Upload formal 3:4 portrait photo (max 1MB)', '३:४ ढाँचाको औपचारिक तस्वीर (अधिकतम १MB)')}
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('Upload Photo', 'तस्वीर अपलोड')}</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, url => setPrincipalForm({ ...principalForm, image: url }))} className="hidden" />
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Message (English)', 'आधिकारिक सन्देश (अंग्रेजी)')}
              </label>
              <textarea
                rows={4}
                value={principalForm.message_en}
                onChange={e => setPrincipalForm({ ...principalForm, message_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('आधिकारिक सन्देश (नेपाली)', 'आधिकारिक सन्देश (नेपाली)')}
              </label>
              <textarea
                rows={4}
                value={principalForm.message_np}
                onChange={e => setPrincipalForm({ ...principalForm, message_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* 4. TEACHERS & STAFF */}
      {activeSubTab === 'gov_staff' && (
        <StaffAdminTab
          lang={lang}
          staff={staff}
          onUpdateStaff={onUpdateStaff}
          onShowToast={onShowToast}
          canCreate={canCreateStaff}
          canUpdate={canUpdateStaff}
          canDelete={canDeleteStaff}
        />
      )}
    </div>
  );
};
