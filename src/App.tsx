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
  SecurityAuditLogEntry,
  AdminAccount
} from './types';
import { loadAdminAccounts, saveAdminAccounts } from './utils/security';
import { safeStorage } from './utils/storage';
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
    const saved = safeStorage.getItem('ishwari_lang');
    return (saved as Language) || 'np';
  });

  // 2. Theme State - Strictly defaults to 'light' mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem('ishwari_theme_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // 3. Active Route with URL hash synchronization
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    try {
      const hash = window.location.hash.replace('#', '').trim();
      return hash || 'home';
    } catch {
      return 'home';
    }
  });

  // 4. Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // 5. Managed School Data & Records
  const [school, setSchool] = useState<SchoolData>(() => {
    return safeStorage.getJSON('ishwari_school_data', initialSchoolData);
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    return safeStorage.getJSON('ishwari_notices', initialNotices);
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    return safeStorage.getJSON('ishwari_staff', initialStaff);
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    return safeStorage.getJSON('ishwari_facilities', initialFacilities);
  });

  const [programs, setPrograms] = useState<AcademicProgram[]>(() => {
    return safeStorage.getJSON('ishwari_programs', initialPrograms);
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    return safeStorage.getJSON('ishwari_documents', initialDocuments);
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    return safeStorage.getJSON('ishwari_messages', initialMessages);
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    return safeStorage.getJSON('ishwari_events', initialEvents);
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return safeStorage.getJSON('ishwari_achievements', initialAchievements);
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    return safeStorage.getJSON('ishwari_history', initialHistory);
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    return safeStorage.getJSON('ishwari_gallery', initialGallery);
  });

  const [siteConfig, setSiteConfig] = useState<SiteCustomizerConfig>(() => {
    const parsed = safeStorage.getJSON('ishwari_site_config', initialSiteConfig);
    return {
      ...parsed,
      primaryColor: '#1E3A8A',
      primaryColorName: 'Academic Navy',
    };
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    return safeStorage.getJSON('ishwari_security_config', initialSecurityConfig);
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogEntry[]>(() => {
    return safeStorage.getJSON('ishwari_audit_logs', initialAuditLogs);
  });

  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    return loadAdminAccounts();
  });

  // Listen to hashchange for direct linking (e.g., #admin, #notices, #admin-portal)
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash) {
          setActiveRoute(hash);
        }
      } catch {
        // Ignore hash change errors
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save to LocalStorage on modifications
  useEffect(() => {
    safeStorage.setItem('ishwari_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeStorage.setItem('ishwari_theme_mode', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_school_data', school);
  }, [school]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_notices', notices);
  }, [notices]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_staff', staff);
  }, [staff]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_facilities', facilities);
  }, [facilities]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_programs', programs);
  }, [programs]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_documents', documents);
  }, [documents]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_messages', messages);
  }, [messages]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_events', events);
  }, [events]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_achievements', achievements);
  }, [achievements]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_history', history);
  }, [history]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_gallery', gallery);
  }, [gallery]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_site_config', siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_security_config', securityConfig);
  }, [securityConfig]);

  useEffect(() => {
    safeStorage.setJSON('ishwari_audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveAdminAccounts(adminAccounts);
  }, [adminAccounts]);

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
    try {
      window.location.hash = route;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed iframes
    }
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

    safeStorage.removeItem('ishwari_school_data');
    safeStorage.removeItem('ishwari_notices');
    safeStorage.removeItem('ishwari_staff');
    safeStorage.removeItem('ishwari_facilities');
    safeStorage.removeItem('ishwari_programs');
    safeStorage.removeItem('ishwari_documents');
    safeStorage.removeItem('ishwari_messages');
    safeStorage.removeItem('ishwari_events');
    safeStorage.removeItem('ishwari_achievements');
    safeStorage.removeItem('ishwari_history');
    safeStorage.removeItem('ishwari_gallery');
    safeStorage.removeItem('ishwari_site_config');
    safeStorage.removeItem('ishwari_security_config');
    safeStorage.removeItem('ishwari_audit_logs');
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
  const isAdminRoute = activeRoute === 'admin' || activeRoute === adminSlug;

  // When on Admin Route, isolate the view completely (no public header, footer, or search modal)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
        <AdminView
          lang={lang}
          theme={theme}
          onToggleLang={handleToggleLang}
          onToggleTheme={handleToggleTheme}
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
          adminAccounts={adminAccounts}
          onUpdateAdminAccounts={setAdminAccounts}
          onRestoreAllData={handleRestoreAllData}
          onResetData={handleResetData}
          onNavigateHome={() => handleRouteChange('home')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
      {/* Universal Header with Lang & Dark Mode Toggles */}
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
        notices={notices}
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
