import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ThemeMode, SchoolData, SiteCustomizerConfig, SecurityConfig, Notice } from '../types';
import {
  Sun,
  Moon,
  Lock,
  Search,
  Menu,
  X,
  FileCode,
  Download,
  Calendar,
  Clock,
  Globe,
  Bell,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Users,
  Award,
  BookOpen,
  Image,
  MessageSquare,
  FileText,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

// Institutional Logo & Crest Component with direct CMS logo support and no border container
const InstitutionalCrest: React.FC<{ school: SchoolData }> = ({ school }) => {
  if (school.logo_url && school.logo_url.trim().length > 0) {
    return (
      <img
        src={school.logo_url}
        alt={school.name_en || 'Shree Ishwari Secondary School'}
        className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto max-w-[85px] sm:max-w-[95px] md:max-w-[105px] lg:max-w-[115px] object-contain shrink-0 select-none"
      />
    );
  }

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-xl bg-[#1E3A8A] text-white shrink-0 flex items-center justify-center select-none shadow-xs">
      <div className="flex flex-col items-center justify-center leading-none text-center">
        <span className="font-serif font-black text-2xl sm:text-3xl text-amber-300">ई</span>
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-blue-100 font-bold uppercase mt-1">२०२८</span>
      </div>
    </div>
  );
};

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeRoute: string;
  onRouteChange: (route: string) => void;
  onOpenSearch: () => void;
  school: SchoolData;
  siteConfig?: SiteCustomizerConfig;
  securityConfig?: SecurityConfig;
  notices?: Notice[];
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  activeRoute,
  onRouteChange,
  onOpenSearch,
  school,
  siteConfig,
  securityConfig,
  notices = [],
}) => {
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const moreRef = React.useRef<HTMLDivElement>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Automated Pinned or Latest Notices Ticker
  const activeTickerNotices = notices.filter(n => n.pinned).length > 0
    ? notices.filter(n => n.pinned)
    : notices.slice(0, 4);

  const tickerItems = activeTickerNotices.length > 0
    ? activeTickerNotices.map(n => isNp ? (n.title_np || n.title_en) : (n.title_en || n.title_np))
    : [
        isNp
          ? (siteConfig?.alertTickerNp || 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका तथा नयाँ भर्ना सम्बन्धी सूचना')
          : (siteConfig?.alertTickerEn || 'Notice regarding Academic Session 2083 Annual Examination & Admissions')
      ];

  const tickerKey = `ticker-${activeTickerNotices.map(n => `${n.id}-${n.pinned}`).join('_')}-${isNp ? 'np' : 'en'}`;

  // Close "More" dropdown on route change or clicking outside
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [activeRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compact Bikram Sambat Date & Time
  useEffect(() => {
    const nepaliDigits: Record<string, string> = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };

    const updateClock = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const isAm = rawHours < 12;
      const hours12 = rawHours % 12 || 12;
      const hoursStr = String(hours12).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      if (isNp) {
        const npHours = hoursStr.split('').map(d => nepaliDigits[d] || d).join('');
        const npMinutes = minutes.split('').map(d => nepaliDigits[d] || d).join('');
        const npAmPm = isAm ? 'पूर्वाह्न' : 'अपराह्न';
        setDateStr('२०८३ भाद्र २०');
        setTimeStr(`${npHours}:${npMinutes} ${npAmPm}`);
      } else {
        const enAmPm = isAm ? 'AM' : 'PM';
        setDateStr('Bhadra 20, 2083');
        setTimeStr(`${hoursStr}:${minutes} ${enAmPm}`);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isNp]);

  // Interface for type-safe nav definitions
  interface NavItemDef {
    id: string;
    labelEn: string;
    labelNp: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    descEn?: string;
    descNp?: string;
  }

  // Streamlined Primary Navigation (manageable 6 items)
  const primaryNavItems: NavItemDef[] = [
    { id: 'home', labelEn: 'Home', labelNp: 'गृहपृष्ठ', icon: GraduationCap },
    { id: 'about', labelEn: 'About', labelNp: 'हाम्रो बारेमा', icon: Building2 },
    { id: 'academics', labelEn: 'Academics', labelNp: 'शैक्षिक', icon: BookOpen, badge: '2083', badgeColor: 'bg-emerald-600' },
    { id: 'notices', labelEn: 'Notices', labelNp: 'सूचना पाटी', icon: Bell, badge: '3', badgeColor: 'bg-red-600' },
    { id: 'staff', labelEn: 'Faculty', labelNp: 'शिक्षक/कर्मचारी', icon: Users },
    { id: 'facilities', labelEn: 'Facilities', labelNp: 'पूर्वाधार', icon: Building2 },
  ];

  // Secondary Navigation grouped under "More / थप ▾" dropdown
  const moreNavItems: NavItemDef[] = [
    { id: 'achievements', labelEn: 'Achievements', labelNp: 'उपलब्धिहरू', icon: Award, badge: '★', badgeColor: 'bg-amber-600', descEn: 'Awards & Honors', descNp: 'विद्यालयका गौरवमय सफलता' },
    { id: 'documents', labelEn: 'Citizen Charter', labelNp: 'नागरिक वडापत्र', icon: FileText, descEn: 'Citizen Charter & Rules', descNp: 'सेवा, समय र दस्तुर विवरण' },
    { id: 'gallery', labelEn: 'Photo Gallery', labelNp: 'तस्बिर ग्यालरी', icon: Image, descEn: 'Campus Activities', descNp: 'कार्यक्रम तथा क्रियाकलाप' },
    { id: 'history', labelEn: 'School History', labelNp: 'ऐतिहासिक पृष्ठभूमि', icon: BookOpen, descEn: 'Since 2028 B.S.', descNp: 'वि.सं. २०२८ देखिको यात्रा' },
  ];

  const isMoreActive = moreNavItems.some(item => item.id === activeRoute);

  const contactNavItem: NavItemDef = { id: 'contact', labelEn: 'Contact', labelNp: 'सम्पर्क', icon: MessageSquare };

  // All nav items for mobile drawer
  const allNavItems: NavItemDef[] = [...primaryNavItems, ...moreNavItems, contactNavItem];

  return (
    <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      {/* 1. COMPACT INSTITUTIONAL TOP BAR */}
      <div className="bg-[#0B1528] text-slate-200 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
          {/* Left: Compact Semantic Inline Date & Time */}
          <div className="flex items-center gap-2.5 text-slate-300 text-xs font-medium select-none min-w-0">
            <span className="inline-flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{dateStr}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="tabular-nums font-mono">{timeStr}</span>
            </span>
          </div>

          {/* Right: Compact Search + Language Toggle + Theme Switch */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Search Trigger */}
            <button
              type="button"
              id="topbar-search-btn"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition cursor-pointer select-none"
              title={t('Search website (Ctrl+K)', 'वेबसाइटमा खोज्नुहोस् (Ctrl+K)')}
              aria-label={t('Search website', 'वेबसाइटमा खोज्नुहोस्')}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline text-[11px]">{t('Search', 'खोज्नुहोस्')}</span>
              <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-slate-900 text-[9px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Compact Admin-styled Language Toggle */}
            <button
              type="button"
              id="lang-toggle"
              onClick={onToggleLang}
              title={isNp ? 'Switch to English' : 'नेपाली भाषामा हेर्नुहोस्'}
              aria-label={isNp ? 'Current language Nepali, switch to English' : 'Current language English, switch to Nepali'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 transition cursor-pointer select-none"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isNp ? 'EN' : 'नेपाली'}</span>
            </button>

            {/* Compact Admin-styled Dark/Light Mode Button */}
            <button
              type="button"
              id="theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? t('Switch to Light Mode', 'लाइट मोडमा जानुहोस्') : t('Switch to Dark Mode', 'डार्क मोडमा जानुहोस्')}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center select-none"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN INSTITUTIONAL BRAND HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* School Brand Identity: Logo + Information */}
          <div className="flex items-center gap-3.5 sm:gap-4 md:gap-5">
            <button
              onClick={() => onRouteChange('home')}
              className="cursor-pointer focus:outline-hidden shrink-0"
              aria-label="Go to homepage"
            >
              <InstitutionalCrest school={school} />
            </button>

            <div className="text-left space-y-1">
              {/* Primary School Title */}
              <h1 className="text-lg sm:text-2xl lg:text-[1.65rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                <button
                  onClick={() => onRouteChange('home')}
                  className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition text-left cursor-pointer"
                >
                  <span className="block font-bold">
                    {isNp ? (school.name_np || 'श्री ईश्वरी माध्यमिक विद्यालय') : (school.name_en || 'Shree Ishwari Secondary School')}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans tracking-normal">
                    {isNp ? (school.name_en || 'Shree Ishwari Secondary School') : (school.name_np || 'श्री ईश्वरी माध्यमिक विद्यालय')}
                  </span>
                </button>
              </h1>

              {/* Location & Establishment */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400 shrink-0" />
                  <span>{isNp ? (school.address_np || 'बैजनाथ-५, बाँके, नेपाल') : (school.address_en || 'Baijanath-5, Banke, Nepal')}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {isNp ? `वि.सं. ${school.estd_bs || '२०२८'}` : `Estd. ${school.estd_bs || '2028 B.S.'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Institutional Action Cluster (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Quick Admission CTA */}
            <button
              onClick={() => onRouteChange('academics')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all hover:shadow-sm transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
              </span>
              <span>{t('Admission 2083', 'नयाँ भर्ना २०८३')}</span>
            </button>

            {/* Quick Contact & Helpline */}
            <a
              href={`tel:${school.phone.split('/')[0].trim()}`}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-right text-xs transition cursor-pointer"
              title="Official Phone Hotline"
            >
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-blue-900 dark:text-blue-300">
                <Phone className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
                <span>{school.phone.split('/')[0].trim()}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('Helpdesk Hotline', 'सोधपुछ केन्द्र')}
              </div>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#1E40AF] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. STREAMLINED NAVBAR WITH DEEP ACADEMIC NAVY BACKGROUND & FLUID SPRING ACTIVE INDICATOR */}
      <nav className="bg-[#1E3A8A] dark:bg-[#0A1120] border-t border-blue-500/20 dark:border-slate-800 hidden lg:block shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Primary Nav Items with Smooth Gliding Active Pill */}
            <div className="flex items-center space-x-1 py-1.5" role="tablist">
              {primaryNavItems.map((item) => {
                const isActive = activeRoute === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onRouteChange(item.id)}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
                  >
                    {/* Soft, Faint Translucent Active Indicator with Golden Accent Notch */}
                    {isActive && (
                      <motion.div
                        layoutId="active-navbar-indicator"
                        className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      >
                        {/* Prestigious institutional gold underline accent */}
                        <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                      </motion.div>
                    )}

                    {/* Button Foreground Icon & Label */}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                        isActive
                          ? 'text-white font-bold'
                          : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                      }`}
                    >
                      <IconComponent
                        className={`w-3.5 h-3.5 transition-colors duration-150 ${
                          isActive
                            ? 'text-amber-300'
                            : 'text-blue-200/80 group-hover:text-blue-100'
                        }`}
                      />
                      <span>{t(item.labelEn, item.labelNp)}</span>
                      {item.badge && (
                        <span
                          className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-2xs ${
                            item.badgeColor || 'bg-blue-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}

              {/* "More / थप ▾" Resource Dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  id="nav-more-dropdown"
                  type="button"
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
                >
                  {isMoreActive && (
                    <motion.div
                      layoutId="active-navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                    </motion.div>
                  )}

                  <span
                    className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                      isMoreActive
                        ? 'text-white font-bold'
                        : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                    }`}
                  >
                    <span>{t('More', 'थप')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        moreMenuOpen ? 'rotate-180 text-amber-300' : 'text-blue-200/80 group-hover:text-blue-100'
                      }`}
                    />
                  </span>
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {moreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        {t('Explore School Info', 'थप जानकारी तथा विवरण')}
                      </div>
                      {moreNavItems.map((subItem) => {
                        const isSubActive = activeRoute === subItem.id;
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              onRouteChange(subItem.id);
                              setMoreMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-[#1E3A8A] dark:text-blue-300 font-bold border-l-3 border-[#1E3A8A] dark:border-blue-400'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <SubIcon
                                className={`w-4 h-4 shrink-0 ${
                                  isSubActive ? 'text-[#1E40AF] dark:text-amber-400' : 'text-slate-400 dark:text-slate-400'
                                }`}
                              />
                              <div>
                                <span className="block leading-tight">{t(subItem.labelEn, subItem.labelNp)}</span>
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  {t(subItem.descEn, subItem.descNp)}
                                </span>
                              </div>
                            </div>
                            {subItem.badge && (
                              <span
                                className={`ml-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-2xs ${
                                  subItem.badgeColor || 'bg-amber-600'
                                }`}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Tab */}
              <button
                id={`nav-${contactNavItem.id}`}
                role="tab"
                aria-selected={activeRoute === contactNavItem.id}
                onClick={() => onRouteChange(contactNavItem.id)}
                className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
              >
                {activeRoute === contactNavItem.id && (
                  <motion.div
                    layoutId="active-navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  >
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                  </motion.div>
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                    activeRoute === contactNavItem.id
                      ? 'text-white font-bold'
                      : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 transition-colors duration-150 ${
                      activeRoute === contactNavItem.id
                        ? 'text-amber-300'
                        : 'text-blue-200/80 group-hover:text-blue-100'
                    }`}
                  />
                  <span>{t(contactNavItem.labelEn, contactNavItem.labelNp)}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER / MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-3 shadow-lg">
          {/* Latest News Pill for Mobile */}
          {(siteConfig ? siteConfig.showAlertTicker : true) && (
            <div
              onClick={() => {
                onRouteChange('notices');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-300 cursor-pointer overflow-hidden"
            >
              <span className="px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider shrink-0">
                {t('Latest News', 'ताजा समाचार')}
              </span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                {tickerItems[0]}
              </span>
            </div>
          )}

          {/* Live BS Date & Time Display for Mobile */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{dateStr}</span>
            <span className="text-slate-400">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="tabular-nums">{timeStr}</span>
          </div>

          {/* Quick Search Mobile */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Search site...', 'खोजी गर्नुहोस्...')}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+K</span>
          </button>

          {/* Nav Grid for Mobile */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {allNavItems.map((item) => {
              const isActive = activeRoute === item.id;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white font-bold shadow-xs border-l-4 border-amber-400 pl-2.5'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t(item.labelEn, item.labelNp)}</span>
                  </span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white ${item.badgeColor || 'bg-blue-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onRouteChange('academics');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>{t('Online Admission 2083 Open', 'नयाँ भर्ना २०८३ खुला')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

