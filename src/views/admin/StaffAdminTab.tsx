import React, { useState, useRef } from 'react';
import { Language, StaffMember } from '../../types';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  AlertCircle,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  User,
  Search,
  CheckCircle2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface StaffAdminTabProps {
  lang: Language;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  onShowToast: (msg: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const StaffAdminTab: React.FC<StaffAdminTabProps> = ({
  lang,
  staff,
  onUpdateStaff,
  onShowToast,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
    variant: 'warning',
    action: () => {}
  });

  const [form, setForm] = useState<StaffMember>({
    id: 0,
    name_en: '',
    name_np: '',
    role: 'teacher',
    designation_en: '',
    designation_np: '',
    department_en: '',
    department_np: '',
    qualification_en: '',
    qualification_np: '',
    experience: '5 Years Experience',
    image: '',
  });

  const [imageError, setImageError] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Automatic crop to passport-size 3:4 aspect ratio canvas
  const cropToPassportAspectRatio = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const targetWidth = 360;
          const targetHeight = 480; // 3:4 passport ratio
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Center crop to 3:4
          const sourceAspect = img.width / img.height;
          const targetAspect = targetWidth / targetHeight; // 0.75

          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
          if (sourceAspect > targetAspect) {
            sWidth = img.height * targetAspect;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / targetAspect;
            // Slight bias towards top for face position
            sy = Math.max(0, (img.height - sHeight) * 0.25);
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = () => reject(new Error('Corrupted or invalid image data'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  // Image upload & strict validation (< 1 MB, JPG/JPEG/PNG only)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File extension validation
    const validExtensions = /\.(jpe?g|png)$/i;
    if (!validExtensions.test(file.name)) {
      setImageError(t('Invalid file extension! Only JPG, JPEG, and PNG are allowed.', 'अमान्य फाइल ढाँचा! केवल JPG, JPEG वा PNG मात्र स्वीकार्य छ।'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. MIME type validation
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      setImageError(t('Invalid MIME type! Please select a valid JPEG or PNG photo.', 'अमान्य MIME प्रकार! कृपया मान्य तस्बिर छान्नुहोस्।'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. File size validation (< 1 MB = 1,048,576 bytes)
    const MAX_SIZE_BYTES = 1024 * 1024;
    if (file.size >= MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageError(t(`File size exceeds 1 MB limit! Selected photo is ${sizeMb} MB.`, `फाइल आकार १ MB भन्दा बढी छ! छनोट गरिएको तस्बिर ${sizeMb} MB छ।`));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 4. Processing & Passport Proportions auto-crop
    try {
      const croppedBase64 = await cropToPassportAspectRatio(file);
      setForm(prev => ({ ...prev, image: croppedBase64 }));
      setImageFileName(file.name);
    } catch (err) {
      setImageError(t('Failed to process image file. Please choose another valid photo.', 'तस्बिर प्रशोधन गर्न सकिएन।'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
    setImageFileName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en) {
      onShowToast(t('Please provide staff name in English.', 'कृपया शिक्षकको नाम अंग्रेजीमा प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(form.id && form.id !== 0);

    if (isUpdate) {
      if (!canUpdate) {
        onShowToast(t('Permission denied: You cannot update faculty profiles.', 'अनुमति छैन: तपाईं शिक्षक विवरण सम्पादन गर्न सक्नुहुन्न।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'update',
        title: t('Confirm Faculty Profile Update', 'शिक्षक विवरण अद्यावधिक पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to save changes to this faculty profile?', 'के तपाईं यस शिक्षकको विवरण सुरक्षित गर्न चाहनुहुन्छ?'),
        itemName: `${form.name_en} (${form.designation_en || 'Faculty'})`,
        confirmText: t('Save Profile', 'विवरण सुरक्षित गर्नुहोस्'),
        action: () => {
          const updated = staff.map(s => s.id === form.id ? form : s);
          onUpdateStaff(updated);
          onShowToast(t('Faculty profile updated successfully.', 'शिक्षक विवरण अद्यावधिक गरियो।'));
          setIsEditing(false);
          handleResetForm();
        }
      });
    } else {
      if (!canCreate) {
        onShowToast(t('Permission denied: You cannot add new faculty profiles.', 'अनुमति छैन: तपाईं नयाँ शिक्षक थप्न सक्नुहुन्न।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'create',
        title: t('Confirm New Faculty Addition', 'नयाँ शिक्षक थप्ने पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to add this educator to the institutional directory?', 'के तपाईं यो नयाँ शिक्षक विवरण संस्थागत सूचीमा थप्न चाहनुहुन्छ?'),
        itemName: `${form.name_en} (${form.designation_en || 'Faculty'})`,
        confirmText: t('Add Faculty', 'शिक्षक थप्नुहोस्'),
        action: () => {
          const newMember: StaffMember = {
            ...form,
            id: Date.now(),
            name_np: form.name_np || form.name_en,
            designation_np: form.designation_np || form.designation_en,
          };
          onUpdateStaff([newMember, ...staff]);
          onShowToast(t('New faculty member added to directory.', 'नयाँ शिक्षक विवरण थपियो।'));
          setIsEditing(false);
          handleResetForm();
        }
      });
    }
  };

  const handleResetForm = () => {
    setForm({
      id: 0,
      name_en: '',
      name_np: '',
      role: 'teacher',
      designation_en: '',
      designation_np: '',
      department_en: '',
      department_np: '',
      qualification_en: '',
      qualification_np: '',
      experience: '5 Years Experience',
      image: '',
    });
    setImageFileName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: number) => {
    if (!canDelete) {
      onShowToast(t('Permission denied: You cannot delete faculty profiles.', 'अनुमति छैन: तपाईं शिक्षक मेटाउन सक्नुहुन्न।'));
      return;
    }
    const target = staff.find(s => s.id === id);
    const itemName = target ? `${target.name_en} (${target.designation_en})` : `Staff #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Staff Profile Deletion', 'शिक्षक विवरण मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently remove this staff profile from the directory? This action cannot be undone.', 'के तपाईं यो विवरण मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Profile', 'विवरण मेटाउनुहोस्'),
      action: () => {
        onUpdateStaff(staff.filter(s => s.id !== id));
        onShowToast(t('Staff profile removed.', 'शिक्षक विवरण हटाइयो।'));
      }
    });
  };

  const filteredStaff = staff
    .filter(s => roleFilter === 'all' || s.role === roleFilter)
    .filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.name_np.toLowerCase().includes(q) ||
        s.designation_en.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 relative">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1E40AF]" />
            <span>{t('Faculty & Staff Directory Management', 'शिक्षक तथा कर्मचारी विवरण व्यवस्थापन')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Manage educator profiles with passport-size photo uploads (JPG/PNG < 1 MB) displayed in academic oval containers.',
              'पासपोर्ट साइज तस्बिर अपलोड (JPG/PNG < १ MB) सहित शिक्षक र प्रशासनिक कर्मचारी व्यवस्थापन।'
            )}
          </p>
        </div>

        {!isEditing && canCreate && (
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Add Faculty Member', 'नयाँ शिक्षक थप्नुहोस्')}</span>
          </button>
        )}
      </div>

      {/* Form Panel (Create / Edit) */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1E40AF]" />
              <span>{form.id ? t('Edit Faculty Profile', 'शिक्षक विवरण सम्पादन') : t('Add New Faculty Member', 'नयाँ शिक्षक विवरण प्रविष्ट गर्नुहोस्')}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                handleResetForm();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Passport Photo Uploader & Oval Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('Passport Profile Photograph', 'पासपोर्ट आकारको तस्बिर')}
              </span>

              {/* Oval Profile Container */}
              <div className="w-24 h-32 rounded-[2rem] border-2 border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center relative group">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Staff Photo Preview"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-mono mt-1 text-slate-400">3:4 OVAL</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="staff-image-input"
                accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="space-y-2 w-full">
                {!form.image ? (
                  <label
                    htmlFor="staff-image-input"
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E40AF] bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>{t('Upload Photo (< 1 MB)', 'तस्बिर छान्नुहोस् (< १ MB)')}</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <label
                      htmlFor="staff-image-input"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
                    >
                      {t('Change Photo', 'फेर्नुहोस्')}
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 cursor-pointer"
                    >
                      {t('Remove', 'हटाउनुहोस्')}
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 font-mono">
                  {t('Accepted: JPG, JPEG, PNG • Auto 3:4 Crop • Max 1 MB', 'स्वीकार्य: JPG, PNG • स्वतः ३:४ क्रप • अधिकतम १ MB')}
                </p>

                {imageError && (
                  <p className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{imageError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Column 2 & 3: Profile Details */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Name (English) *</label>
                <input
                  type="text"
                  required
                  value={form.name_en}
                  onChange={(e) => setForm(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="e.g. Ramesh Chandra Joshi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">नाम (नेपाली)</label>
                <input
                  type="text"
                  value={form.name_np}
                  onChange={(e) => setForm(prev => ({ ...prev, name_np: e.target.value }))}
                  placeholder="उदा. रमेशचन्द्र जोशी"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Role Classification</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="principal">Headmaster / Principal (प्रधानाध्यापक)</option>
                  <option value="teacher">Teaching Faculty (शिक्षक)</option>
                  <option value="admin">Administrative &amp; ICT Staff (प्रशासन)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Experience</label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) => setForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g. 12 Years Experience"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Designation (English)</label>
                <input
                  type="text"
                  value={form.designation_en}
                  onChange={(e) => setForm(prev => ({ ...prev, designation_en: e.target.value }))}
                  placeholder="Senior Secondary Physics Lecturer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">पद (नेपाली)</label>
                <input
                  type="text"
                  value={form.designation_np}
                  onChange={(e) => setForm(prev => ({ ...prev, designation_np: e.target.value }))}
                  placeholder="मावि भौतिकशास्त्र शिक्षक"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Department (English)</label>
                <input
                  type="text"
                  value={form.department_en || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, department_en: e.target.value }))}
                  placeholder="Science &amp; Mathematics Department"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Qualification</label>
                <input
                  type="text"
                  value={form.qualification_en || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, qualification_en: e.target.value }))}
                  placeholder="M.Sc. Physics (Tribhuvan University)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                handleResetForm();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t('Cancel', 'रद्द गर्नुहोस्')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{form.id ? t('Update Profile', 'अद्यावधिक गर्नुहोस्') : t('Save Faculty Member', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Directory Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by name or designation...', 'नाम वा पद खोज्नुहोस्...')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Staff' },
            { id: 'principal', label: 'Principal' },
            { id: 'teacher', label: 'Teachers' },
            { id: 'admin', label: 'Administration' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid with Oval Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStaff.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3 shadow-2xs hover:border-[#1E40AF]/40 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Oval Profile Photo */}
              <div className="w-20 h-28 mx-auto rounded-[1.75rem] border-2 border-slate-200 dark:border-slate-700 group-hover:border-[#1E40AF] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xs flex items-center justify-center transition relative">
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    {s.role === 'principal' ? (
                      <GraduationCap className="w-8 h-8 stroke-[1.5]" />
                    ) : s.role === 'admin' ? (
                      <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                    ) : (
                      <User className="w-8 h-8 stroke-[1.5]" />
                    )}
                    <span className="text-[9px] font-mono mt-0.5 opacity-60">Passport</span>
                  </div>
                )}
              </div>

              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider bg-slate-100 dark:bg-slate-800 text-[#1E40AF]">
                  {s.role}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {t(s.name_en, s.name_np)}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t(s.designation_en, s.designation_np)}
                </p>
                {s.department_en && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {s.department_en}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                {s.experience}
              </span>

              <div className="flex items-center gap-1">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...s });
                      setImageFileName('');
                      setImageError('');
                      setIsEditing(true);
                    }}
                    title={t('Edit Profile', 'सम्पादन गर्नुहोस्')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    title={t('Delete Profile', 'मेटाउनुहोस्')}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
