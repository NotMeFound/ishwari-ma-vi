/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Language,
  ThemeMode,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry
} from './types';
import {
  initialSchoolData,
  initialNotices,
  initialStaff,
  initialFacilities,
  initialEvents,
  initialAchievements,
  initialHistory,
  initialDocuments,
  initialPrograms,
  initialMessages,
  initialGallery,
  initialSiteConfig,
  initialSecurityConfig,
  initialAuditLogs
} from './data/schoolData';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';

import { HomeView } from './views/HomeView';
import { AboutView } from './views/AboutView';
import { AcademicsView } from './views/AcademicsView';
import { FacilitiesView } from './views/FacilitiesView';
import { StaffView } from './views/StaffView';
import { NoticesView } from './views/NoticesView';
import { EventsView } from './views/EventsView';
import { AchievementsView } from './views/AchievementsView';
import { HistoryView } from './views/HistoryView';
import { DocumentsView } from './views/DocumentsView';
import { GalleryView } from './views/GalleryView';
import { CommunityView } from './views/CommunityView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';

export default function App() {
  // 1. Language State
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ishwari_lang');
    return (saved as Language) || 'np';
  });

  // 2. Theme State - Strictly defaults to 'light' mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ishwari_theme_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // 3. Active Route with URL hash synchronization
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || 'home';
  });

  // 4. Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // 5. Managed School Data & Records
  const [school, setSchool] = useState<SchoolData>(() => {
    const saved = localStorage.getItem('ishwari_school_data');
    return saved ? JSON.parse(saved) : initialSchoolData;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('ishwari_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('ishwari_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem('ishwari_facilities');
    return saved ? JSON.parse(saved) : initialFacilities;
  });

  const [programs, setPrograms] = useState<AcademicProgram[]>(() => {
    const saved = localStorage.getItem('ishwari_programs');
    return saved ? JSON.parse(saved) : initialPrograms;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('ishwari_documents');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('ishwari_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    const saved = localStorage.getItem('ishwari_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('ishwari_achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('ishwari_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('ishwari_gallery');
    return saved ? JSON.parse(saved) : initialGallery;
  });

  const [siteConfig, setSiteConfig] = useState<SiteCustomizerConfig>(() => {
    const saved = localStorage.getItem('ishwari_site_config');
    const parsed = saved ? JSON.parse(saved) : initialSiteConfig;
    return {
      ...parsed,
      primaryColor: '#1E3A8A',
      primaryColorName: 'Academic Navy',
    };
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem('ishwari_security_config');
    return saved ? JSON.parse(saved) : initialSecurityConfig;
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogEntry[]>(() => {
    const saved = localStorage.getItem('ishwari_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Listen to hashchange for direct linking (e.g., #admin, #notices, #admin-portal)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setActiveRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('ishwari_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ishwari_theme_mode', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ishwari_school_data', JSON.stringify(school));
  }, [school]);

  useEffect(() => {
    localStorage.setItem('ishwari_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('ishwari_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('ishwari_facilities', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('ishwari_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('ishwari_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ishwari_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ishwari_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ishwari_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('ishwari_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ishwari_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('ishwari_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('ishwari_security_config', JSON.stringify(securityConfig));
  }, [securityConfig]);

  useEffect(() => {
    localStorage.setItem('ishwari_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Global Ctrl+K hotkey for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'np' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleRouteChange = (route: string) => {
    setActiveRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = () => {
    setSchool(initialSchoolData);
    setNotices(initialNotices);
    setStaff(initialStaff);
    setFacilities(initialFacilities);
    setPrograms(initialPrograms);
    setDocuments(initialDocuments);
    setMessages(initialMessages);
    setEvents(initialEvents);
    setAchievements(initialAchievements);
    setHistory(initialHistory);
    setGallery(initialGallery);
    setSiteConfig(initialSiteConfig);
    setSecurityConfig(initialSecurityConfig);
    setAuditLogs(initialAuditLogs);

    localStorage.removeItem('ishwari_school_data');
    localStorage.removeItem('ishwari_notices');
    localStorage.removeItem('ishwari_staff');
    localStorage.removeItem('ishwari_facilities');
    localStorage.removeItem('ishwari_programs');
    localStorage.removeItem('ishwari_documents');
    localStorage.removeItem('ishwari_messages');
    localStorage.removeItem('ishwari_events');
    localStorage.removeItem('ishwari_achievements');
    localStorage.removeItem('ishwari_history');
    localStorage.removeItem('ishwari_gallery');
    localStorage.removeItem('ishwari_site_config');
    localStorage.removeItem('ishwari_security_config');
    localStorage.removeItem('ishwari_audit_logs');
  };

  const handleAddMessage = (msg: ContactMessage) => {
    setMessages((prev) => [msg, ...prev]);
  };

  const handleAddAuditLog = (entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem('ishwari_audit_logs');
  };

  const handleRestoreAllData = (data: any) => {
    if (data.school) setSchool(data.school);
    if (data.notices) setNotices(data.notices);
    if (data.staff) setStaff(data.staff);
    if (data.facilities) setFacilities(data.facilities);
    if (data.programs) setPrograms(data.programs);
    if (data.documents) setDocuments(data.documents);
    if (data.messages) setMessages(data.messages);
    if (data.events) setEvents(data.events);
    if (data.achievements) setAchievements(data.achievements);
    if (data.history) setHistory(data.history);
    if (data.gallery) setGallery(data.gallery);
    if (data.siteConfig) setSiteConfig(data.siteConfig);
    if (data.securityConfig) setSecurityConfig(data.securityConfig);
  };

  const adminSlug = securityConfig?.adminRouteSlug || 'admin-portal';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
      {/* Universal Header with Lang & Dark Mode Toggles + Admin Link */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        school={school}
        siteConfig={siteConfig}
        securityConfig={securityConfig}
      />

      {/* Main Content View Switcher with Smooth Route Transitions */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoute}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {activeRoute === 'home' && (
              <HomeView
                lang={lang}
                school={school}
                notices={notices}
                facilities={facilities}
                staff={staff}
                siteConfig={siteConfig}
                onNavigate={handleRouteChange}
              />
            )}
            {activeRoute === 'about' && (
              <AboutView lang={lang} school={school} onNavigate={handleRouteChange} />
            )}
            {activeRoute === 'academics' && (
              <AcademicsView lang={lang} programs={programs} />
            )}
            {activeRoute === 'facilities' && (
              <FacilitiesView lang={lang} facilities={facilities} />
            )}
            {activeRoute === 'staff' && <StaffView lang={lang} staff={staff} />}
            {activeRoute === 'notices' && <NoticesView lang={lang} notices={notices} />}
            {activeRoute === 'events' && <EventsView lang={lang} events={events} />}
            {activeRoute === 'achievements' && (
              <AchievementsView lang={lang} achievements={achievements} />
            )}
            {activeRoute === 'history' && <HistoryView lang={lang} history={history} />}
            {activeRoute === 'documents' && (
              <DocumentsView lang={lang} documents={documents} />
            )}
            {activeRoute === 'gallery' && <GalleryView lang={lang} items={gallery} />}
            {activeRoute === 'community' && <CommunityView lang={lang} />}
            {activeRoute === 'contact' && (
              <ContactView lang={lang} school={school} onSendMessage={handleAddMessage} />
            )}
            {(activeRoute === 'admin' || activeRoute === adminSlug) && (
              <AdminView
                lang={lang}
                school={school}
                onUpdateSchool={setSchool}
                notices={notices}
                onUpdateNotices={setNotices}
                staff={staff}
                onUpdateStaff={setStaff}
                facilities={facilities}
                onUpdateFacilities={setFacilities}
                programs={programs}
                onUpdatePrograms={setPrograms}
                documents={documents}
                onUpdateDocuments={setDocuments}
                messages={messages}
                onUpdateMessages={setMessages}
                events={events}
                onUpdateEvents={setEvents}
                achievements={achievements}
                onUpdateAchievements={setAchievements}
                history={history}
                onUpdateHistory={setHistory}
                gallery={gallery}
                onUpdateGallery={setGallery}
                siteConfig={siteConfig}
                onUpdateSiteConfig={setSiteConfig}
                securityConfig={securityConfig}
                onUpdateSecurityConfig={setSecurityConfig}
                auditLogs={auditLogs}
                onClearAuditLogs={handleClearAuditLogs}
                onAddAuditLog={handleAddAuditLog}
                onRestoreAllData={handleRestoreAllData}
                onResetData={handleResetData}
                onNavigateHome={() => handleRouteChange('home')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Institutional Footer */}
      <Footer lang={lang} school={school} onRouteChange={handleRouteChange} />

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        onNavigate={handleRouteChange}
        notices={notices}
        staff={staff}
        facilities={facilities}
      />
    </div>
  );
}
