import React, { useState } from 'react';
import { Language, SchoolEvent, Achievement, HistoryItem } from '../../types';
import {
  CalendarDays,
  Trophy,
  History,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface EventsAchievementsHistoryTabProps {
  lang: Language;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const EventsAchievementsHistoryTab: React.FC<EventsAchievementsHistoryTabProps> = ({
  lang,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  onShowToast,
}) => {
  const [subSection, setSubSection] = useState<'events' | 'achievements' | 'history'>('events');

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

  // Event Edit / Create State
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<SchoolEvent>({
    id: 0,
    title_en: '',
    title_np: '',
    date_en: '',
    date_np: '',
    time: '10:00 AM - 04:00 PM',
    venue_en: 'School Main Auditorium',
    venue_np: 'विद्यालयको मुख्य प्रेक्षालय',
    desc_en: '',
    desc_np: '',
  });

  // Achievement Edit / Create State
  const [isEditingAchievement, setIsEditingAchievement] = useState(false);
  const [achievementForm, setAchievementForm] = useState<Achievement>({
    id: 0,
    year: '2082',
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
  });

  // History Edit / Create State
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [historyForm, setHistoryForm] = useState<HistoryItem>({
    year: '2035 BS',
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
  });

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // === EVENT HANDLERS ===
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title_en || !eventForm.title_np) {
      onShowToast(t('Please enter both English and Nepali event titles.', 'कृपया नेपाली र अंग्रेजी दुवै शीर्षकहरू प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(eventForm.id && eventForm.id !== 0);

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Event Update', 'कार्यक्रम अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Event', 'नयाँ कार्यक्रम पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this school event?', 'के तपाईं यस कार्यक्रमका विवरणहरू अद्यावधिक गर्न चाहनुहुन्छ?')
        : t('Are you sure you want to publish this new event to the institutional calendar?', 'के तपाईं यो नयाँ कार्यक्रम पात्रोमा थप्न चाहनुहुन्छ?'),
      itemName: `${eventForm.title_en} (${eventForm.title_np})`,
      confirmText: isUpdate ? t('Save Event', 'कार्यक्रम सुरक्षित गर्नुहोस्') : t('Create Event', 'कार्यक्रम सिर्जना गर्नुहोस्'),
      action: () => {
        if (isUpdate) {
          const updated = events.map(ev => ev.id === eventForm.id ? eventForm : ev);
          onUpdateEvents(updated);
          onShowToast(t('Event updated successfully.', 'कार्यक्रम विवरण अद्यावधिक गरियो।'));
        } else {
          const newEvent: SchoolEvent = {
            ...eventForm,
            id: Date.now(),
          };
          onUpdateEvents([newEvent, ...events]);
          onShowToast(t('New event created.', 'नयाँ कार्यक्रम थपियो।'));
        }
        setIsEditingEvent(false);
      }
    });
  };

  const handleDeleteEvent = (id: number) => {
    const target = events.find(e => e.id !== id ? false : true);
    const itemName = target ? `${target.title_en} (${target.title_np})` : `Event #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Event Deletion', 'कार्यक्रम मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this event? This action cannot be undone.', 'के तपाईं यो कार्यक्रम सदाका लागि मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Event', 'कार्यक्रम मेटाउनुहोस्'),
      action: () => {
        onUpdateEvents(events.filter(e => e.id !== id));
        onShowToast(t('Event deleted.', 'कार्यक्रम मेटाइयो।'));
      }
    });
  };

  // === ACHIEVEMENT HANDLERS ===
  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title_en || !achievementForm.title_np) {
      onShowToast(t('Please enter achievement title.', 'कृपया उपलब्धिको शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(achievementForm.id && achievementForm.id !== 0);

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Achievement Update', 'उपलब्धि अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Achievement', 'नयाँ उपलब्धि पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this achievement award?', 'के तपाईं यो उपलब्धि विवरण सुरक्षित गर्न निश्चित हुनुहुन्छ?')
        : t('Are you sure you want to add this student achievement to the public recognition board?', 'के तपाईं यो नयाँ उपलब्धि सम्मान सूचीमा थप्न चाहनुहुन्छ?'),
      itemName: `${achievementForm.title_en} (${achievementForm.title_np})`,
      confirmText: isUpdate ? t('Save Achievement', 'उपलब्धि सुरक्षित गर्नुहोस्') : t('Add Achievement', 'उपलब्धि थप्नुहोस्'),
      action: () => {
        if (isUpdate) {
          const updated = achievements.map(a => a.id === achievementForm.id ? achievementForm : a);
          onUpdateAchievements(updated);
          onShowToast(t('Achievement updated.', 'उपलब्धि अद्यावधिक गरियो।'));
        } else {
          const newAch: Achievement = {
            ...achievementForm,
            id: Date.now(),
          };
          onUpdateAchievements([newAch, ...achievements]);
          onShowToast(t('New student achievement added.', 'नयाँ उपलब्धि थपियो।'));
        }
        setIsEditingAchievement(false);
      }
    });
  };

  const handleDeleteAchievement = (id: number) => {
    const target = achievements.find(a => a.id === id);
    const itemName = target ? `${target.title_en} (${target.title_np})` : `Achievement #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Achievement Deletion', 'उपलब्धि मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this student achievement?', 'के तपाईं यो उपलब्धि विवरण मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Achievement', 'उपलब्धि मेटाउनुहोस्'),
      action: () => {
        onUpdateAchievements(achievements.filter(a => a.id !== id));
        onShowToast(t('Achievement deleted.', 'उपलब्धि मेटाइयो।'));
      }
    });
  };

  // === HISTORY HANDLERS ===
  const handleSaveHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyForm.title_en || !historyForm.title_np) {
      onShowToast(t('Please enter title.', 'कृपया शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = editingHistoryIndex !== null;

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Milestone Update', 'इतिहास स्तम्भ अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Milestone', 'नयाँ इतिहास स्तम्भ पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this historical milestone?', 'के तपाईं यो ऐतिहासिक कोसेढुङ्गा सम्पादन गर्न चाहनुहुन्छ?')
        : t('Are you sure you want to add this milestone to the school chronology?', 'के तपाईं यो ऐतिहासिक कोसेढुङ्गा विद्यालय इतिहासमा थप्न चाहनुहुन्छ?'),
      itemName: `${historyForm.year}: ${historyForm.title_en}`,
      confirmText: isUpdate ? t('Save Milestone', 'इतिहास सुरक्षित गर्नुहोस्') : t('Add Milestone', 'इतिहास थप्नुहोस्'),
      action: () => {
        if (editingHistoryIndex !== null) {
          const updated = [...history];
          updated[editingHistoryIndex] = historyForm;
          onUpdateHistory(updated);
          onShowToast(t('Historical milestone updated.', 'ऐतिहासिक स्तम्भ अद्यावधिक गरियो।'));
        } else {
          onUpdateHistory([historyForm, ...history]);
          onShowToast(t('New historical milestone added.', 'नयाँ ऐतिहासिक कोसेढुङ्गा थपियो।'));
        }
        setIsEditingHistory(false);
        setEditingHistoryIndex(null);
      }
    });
  };

  const handleDeleteHistory = (idx: number) => {
    const target = history[idx];
    const itemName = target ? `${target.year}: ${target.title_en}` : `Milestone #${idx}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Milestone Deletion', 'इतिहास स्तम्भ मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this milestone from school history?', 'के तपाईं यो ऐतिहासिक विवरण मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Milestone', 'इतिहास मेटाउनुहोस्'),
      action: () => {
        onUpdateHistory(history.filter((_, i) => i !== idx));
        onShowToast(t('Milestone removed.', 'इतिहास मेटाइयो।'));
      }
    });
  };

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
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => { setSubSection('events'); setIsEditingEvent(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'events'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{t('School Events & Routines', 'कार्यक्रम तथा तालिका')} ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSubSection('achievements'); setIsEditingAchievement(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'achievements'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>{t('Student Honors & Achievements', 'गौरवमय उपलब्धिहरू')} ({achievements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSubSection('history'); setIsEditingHistory(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'history'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('Institutional History & Milestones', 'इतिहास तथा कोसेढुङ्गा')} ({history.length})</span>
        </button>
      </div>

      {/* SECTION 1: EVENTS CRUD */}
      {subSection === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Academic Calendar & Events', 'वार्षिक क्यालेन्डर तथा कार्यक्रम व्यवस्थापन')}</span>
            </h3>
            {!isEditingEvent && (
              <button
                type="button"
                onClick={() => {
                  setEventForm({
                    id: 0,
                    title_en: '',
                    title_np: '',
                    date_en: 'April 2026',
                    date_np: 'बैशाख २०८३',
                    time: '10:00 AM - 04:00 PM',
                    venue_en: 'School Main Auditorium',
                    venue_np: 'विद्यालयको मुख्य प्रेक्षालय',
                    desc_en: '',
                    desc_np: '',
                  });
                  setIsEditingEvent(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Event', 'नयाँ कार्यक्रम थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* Event Editor Form */}
          {isEditingEvent && (
            <form onSubmit={handleSaveEvent} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {eventForm.id ? t('Edit Event', 'कार्यक्रम सम्पादन') : t('Create New Event', 'नयाँ कार्यक्रम सिर्जना')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingEvent(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={eventForm.title_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Science Exhibition & Innovation Fair"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={eventForm.title_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: विज्ञान तथा प्रविधि प्रदर्शनी"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date (English)</label>
                  <input
                    type="text"
                    value={eventForm.date_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. May 12, 2026"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date (Nepali / BS)</label>
                  <input
                    type="text"
                    value={eventForm.date_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: २९ वैशाख २०८३"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time / Hours</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 10:00 AM - 04:00 PM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Venue (EN & NP)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={eventForm.venue_en}
                      onChange={(e) => setEventForm(prev => ({ ...prev, venue_en: e.target.value }))}
                      className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                      placeholder="Venue EN"
                    />
                    <input
                      type="text"
                      value={eventForm.venue_np}
                      onChange={(e) => setEventForm(prev => ({ ...prev, venue_np: e.target.value }))}
                      className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                      placeholder="स्थान NP"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (English)</label>
                  <textarea
                    rows={2}
                    value={eventForm.desc_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Nepali)</label>
                  <textarea
                    rows={2}
                    value={eventForm.desc_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEvent(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map(ev => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#1E40AF] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{ev.date_np || ev.date_en}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t(ev.title_en, ev.title_np)}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{t(ev.desc_en, ev.desc_np)}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{t(ev.venue_en, ev.venue_np)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEventForm(ev);
                        setIsEditingEvent(true);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ACHIEVEMENTS CRUD */}
      {subSection === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Student Honors & Board Results', 'उपलब्धि तथा सम्मान व्यवस्थापन')}</span>
            </h3>
            {!isEditingAchievement && (
              <button
                type="button"
                onClick={() => {
                  setAchievementForm({
                    id: 0,
                    year: '2083 BS',
                    title_en: '',
                    title_np: '',
                    desc_en: '',
                    desc_np: '',
                  });
                  setIsEditingAchievement(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Achievement', 'नयाँ उपलब्धि थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* Achievement Editor */}
          {isEditingAchievement && (
            <form onSubmit={handleSaveAchievement} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {achievementForm.id ? t('Edit Achievement', 'उपलब्धि सम्पादन') : t('Add Achievement', 'नयाँ उपलब्धि थप्नुहोस्')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingAchievement(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Year / Session</label>
                  <input
                    type="text"
                    value={achievementForm.year}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 2083 BS / 2026 AD"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={achievementForm.title_en}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. District First in SEE Board Examination"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={achievementForm.title_np}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: एसईई परीक्षामा जिल्लाभर उत्कृष्ट स्थान"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (EN & NP)</label>
                  <textarea
                    rows={2}
                    value={achievementForm.desc_en}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 mb-2"
                    placeholder="Description in English..."
                  />
                  <textarea
                    rows={2}
                    value={achievementForm.desc_np}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="विवरण नेपालीमा..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAchievement(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          )}

          {/* Achievement List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                    {a.year}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">{t(a.title_en, a.title_np)}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{t(a.desc_en, a.desc_np)}</p>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAchievementForm(a); setIsEditingAchievement(true); }}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAchievement(a.id)}
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
      )}

      {/* SECTION 3: HISTORY & MILESTONES CRUD */}
      {subSection === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Institutional Timeline & Milestones', 'इतिहास तथा कोसेढुङ्गा व्यवस्थापन')}</span>
            </h3>
            {!isEditingHistory && (
              <button
                type="button"
                onClick={() => {
                  setHistoryForm({
                    year: '2083 BS',
                    title_en: '',
                    title_np: '',
                    desc_en: '',
                    desc_np: '',
                  });
                  setEditingHistoryIndex(null);
                  setIsEditingHistory(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Milestone', 'नयाँ इतिहास थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* History Editor Form */}
          {isEditingHistory && (
            <form onSubmit={handleSaveHistory} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {editingHistoryIndex !== null ? t('Edit Milestone', 'कोसेढुङ्गा सम्पादन') : t('Add Milestone', 'नयाँ स्तम्भ थप्नुहोस्')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingHistory(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Year / Era</label>
                  <input
                    type="text"
                    value={historyForm.year}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 2035 BS"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={historyForm.title_en}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Upgradation to Secondary Level"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={historyForm.title_np}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: माध्यमिक तहमा स्तरोन्नति"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Historical Description (EN & NP)</label>
                  <textarea
                    rows={2}
                    value={historyForm.desc_en}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 mb-2"
                    placeholder="Description in English..."
                  />
                  <textarea
                    rows={2}
                    value={historyForm.desc_np}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="विवरण नेपालीमा..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingHistory(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          {/* History List */}
          <div className="space-y-3">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1E40AF] px-2 py-0.5 rounded bg-[#1E40AF]/10">
                      {h.year}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t(h.title_en, h.title_np)}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{t(h.desc_en, h.desc_np)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryForm(h);
                      setEditingHistoryIndex(idx);
                      setIsEditingHistory(true);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(idx)}
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
      )}
    </div>
  );
};
