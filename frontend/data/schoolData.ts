import {
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  SchoolEvent,
  Achievement,
  HistoryItem,
  DocumentItem,
  AcademicProgram,
  ContactMessage,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AboutSection,
  CurriculumGuideline,
  Vacancy,
  SocialMediaLink,
  UsefulLink,
  HomepageSectionItem,
  QuickAccessItem
} from '../types';

export const initialSchoolData: SchoolData = {
  name_en: "Ishwari Secondary School",
  name_np: "ईश्वरी माध्यमिक विद्यालय",
  tagline_en: "Center for Academic Excellence & Character Building",
  tagline_np: "शैक्षिक उत्कृष्टता र चरित्र निर्माणको अग्रणी केन्द्र",
  affiliation_en: "Center for Academic Excellence & Character Building",
  affiliation_np: "शैक्षिक उत्कृष्टता र चरित्र निर्माणको केन्द्र",
  code: "EMIS: 48012004",
  estd_bs: "2035 B.S.",
  estd_ad: "1978 A.D.",
  phone: "+977-01-5542109 / 9851234567",
  email: "info@ishwari.edu.np",
  address_en: "Ward No. 4, Nepal",
  address_np: "वडा नं. ४, नेपाल",
  map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.899890123456!2d85.324!3d27.700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzAwLjAiTiA4NcKwMTknMjYuNCJF!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp",
  map_url: "https://maps.google.com/?q=Ishwari+Secondary+School+Nepal",
  principal_name_en: "Mr. Narayan Prasad Koirala",
  principal_name_np: "श्री नारायण प्रसाद कोइराला",
  principal_designation_en: "Headmaster / Principal (M.Ed, M.A.)",
  principal_designation_np: "प्रधानाध्यापक",
  principal_image: "",
  principal_message_en: "Welcome to Ishwari Secondary School. For over four decades, our institution has stood as a beacon of public education, blending academic rigor with compassionate moral values. We are committed to fostering critical inquiry, digital literacy, and community leadership in every student.",
  principal_message_np: "ईश्वरी माध्यमिक विद्यालयको आधिकारिक डिजिटल पोर्टलमा यहाँहरूलाई हार्दिक स्वागत छ। वि.सं. २०३५ सालदेखि यस भेगकै अग्रणी सामुदायिक नमुना विद्यालयको रूपमा हामीले विद्यार्थीहरूको चौतर्फी विकासमा जोड दिँदै आएका छौं।",
  home_bg_image: "",
  home_bg_enabled: false,
};

export const initialNotices: Notice[] = [
  {
    id: 1,
    title_en: "Annual Examination Routine (Grades 1 to 9) Published for Session 2083",
    title_np: "शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका (कक्षा १ देखि ९ सम्म) प्रकाशित गरिएको बारे",
    date_en: "Bhadra 18, 2083",
    date_np: "२०८३ भाद्र १८",
    category: "exam",
    pinned: true,
    file_name: "annual_exam_routine_2083.pdf",
    description_en: "All students and guardians are hereby notified that the final examinations for Grades 1 through 9 will commence from Chaitra 08, 2083. Admit cards are available at the administration counter.",
    description_np: "कक्षा १ देखि ९ सम्मका विद्यार्थीहरूको वार्षिक परीक्षा आगामी चैत्र ०८ गतेदेखि सञ्चालन हुने भएकाले सम्पूर्ण विद्यार्थी तथा अभिभावकहरूलाई सूचित गरिन्छ।"
  },
  {
    id: 2,
    title_en: "Grade 11 Admission Open for Science & Management Streams (2083-2084)",
    title_np: "कक्षा ११ विज्ञान तथा व्यवस्थापन संकायमा नयाँ भर्ना खुला सम्बन्धी अत्यन्त जरुरी सूचना",
    date_en: "Bhadra 15, 2083",
    date_np: "२०८३ भाद्र १५",
    category: "academic",
    pinned: true,
    file_name: "grade11_admission_notice.pdf",
    description_en: "Applications are invited from qualifying SEE graduates for entrance examination and scholarship evaluation in Science and Management streams. Limited seats available.",
    description_np: "एसईई (SEE) उत्तीर्ण विद्यार्थीहरूका लागि कक्षा ११ विज्ञान र व्यवस्थापन संकायमा छात्रवृत्ति तथा भर्ना आवेदन फारम वितरण सुरु भएको छ।"
  },
  {
    id: 3,
    title_en: "Merit Scholarship Distribution Ceremony & Parent-Teacher Assembly",
    title_np: "जेहेन्दार छात्रवृत्ति वितरण कार्यक्रम तथा अभिभावक भेला आयोजना सम्बन्धमा",
    date_en: "Bhadra 10, 2083",
    date_np: "२०८३ भाद्र १०",
    category: "scholarship",
    pinned: false,
    file_name: "scholarship_assembly_notice.pdf",
    description_en: "The quarterly PTA gathering along with the distribution of alumni-sponsored merit and underprivileged scholarships will take place this Sunday at the school auditorium.",
    description_np: "आगामी आइतबार विद्यालयको सभाहलमा त्रैमासिक अभिभावक भेला तथा छात्रवृत्ति वितरण कार्यक्रम आयोजना हुने भएको छ।"
  }
];

export const initialStaff: StaffMember[] = [
  {
    id: 1,
    name_en: "Mr. Narayan Prasad Koirala",
    name_np: "श्री नारायण प्रसाद कोइराला",
    role: "principal",
    designation_en: "Headmaster / Principal (M.Ed, M.A.)",
    designation_np: "प्रधानाध्यापक (एम.एड, एम.ए.)",
    experience: "26 Years in Educational Leadership"
  },
  {
    id: 2,
    name_en: "Mrs. Sharada Devi Sharma",
    name_np: "श्रीमती शारदा देवी शर्मा",
    role: "teacher",
    designation_en: "Senior Science Coordinator (M.Sc. Physics)",
    designation_np: "वरिष्ठ विज्ञान संयोजक (एम.एससी.)",
    experience: "18 Years Experience"
  },
  {
    id: 3,
    name_en: "Mr. Rameshwor Gautam",
    name_np: "श्री रामेश्वर गौतम",
    role: "teacher",
    designation_en: "Head of Mathematics (M.Sc. Mathematics)",
    designation_np: "गणित विभाग प्रमुख (एम.एससी.)",
    experience: "21 Years Experience"
  },
  {
    id: 4,
    name_en: "Ms. Binita Thapa",
    name_np: "सुश्री बिनिता थापा",
    role: "teacher",
    designation_en: "ICT & Computer Science Lead (B.Sc. CSIT)",
    designation_np: "कम्प्युटर तथा सूचना प्रविधि विभाग प्रमुख",
    experience: "8 Years Experience"
  }
];

export const initialFacilities: Facility[] = [
  {
    id: 1,
    title_en: "Modern Science Laboratories",
    title_np: "अत्याधुनिक विज्ञान प्रयोगशाला (भौतिक, रसायन र जीवविज्ञान)",
    desc_en: "Fully equipped secondary and higher secondary laboratories with precision apparatus for individual experimentation under certified instructor supervision.",
    desc_np: "नेपाल सरकारको नमुना विद्यालय मापदण्ड अनुसार निर्मित भौतिकशास्त्र, रसायनशास्त्र र जीवविज्ञानका आधुनिक प्रयोगात्मक उपकरणयुक्त प्रयोगशाला।",
    icon: "🔬"
  },
  {
    id: 2,
    title_en: "Advanced ICT & Computer Learning Center",
    title_np: "सूचना तथा सञ्चार प्रविधि (ICT) केन्द्र",
    desc_en: "Air-conditioned 45-terminal computer lab connected to dedicated optical fiber broadband with smart interactive display systems.",
    desc_np: "४५ थान अत्याधुनिक कम्प्युटर, तीव्र गतिको इन्टरनेट र डिजिटल स्मार्ट बोर्डसहितको कम्प्युटर ल्याब।",
    icon: "💻"
  },
  {
    id: 3,
    title_en: "E-Pustakalaya & Reference Library",
    title_np: "पुस्तकालय तथा इ-पुस्तकालय (ई-पुस्तकालय)",
    desc_en: "Over 6,500 curriculum texts, reference encyclopedias, competitive exam materials, and local digital archives.",
    desc_np: "६,५०० भन्दा बढी पुस्तकहरू, पत्रपत्रिका र डिजिटल शैक्षिक स्रोतहरूले सुसज्जित समृद्ध पुस्तकालय।",
    icon: "📚"
  },
  {
    id: 4,
    title_en: "Athletics & Sports Complex",
    title_np: "खेलकुद पूर्वाधार तथा खुला मैदान",
    desc_en: "Full-sized volleyball court, badminton courts, table tennis hall, and athletic track ground hosting annual zonal tournaments.",
    desc_np: "भलिबल, टेबलटेनिस, ब्याडमिन्टन तथा एथलेटिक्सका लागि व्यवस्थित खेल मैदान।",
    icon: "🏐"
  }
];

export const initialEvents: SchoolEvent[] = [
  {
    id: 1,
    title_en: "Annual Science, Robotics & Innovation Olympiad",
    title_np: "वार्षिक विज्ञान, रोबोटिक्स तथा सिर्जनात्मक प्रदर्शनी",
    date_en: "Aswin 02, 2083",
    date_np: "२०८३ असोज ०२",
    time: "10:00 AM - 4:00 PM",
    venue_en: "Ishwari Multipurpose Hall",
    venue_np: "ईश्वरी बहुउद्देश्यीय हल",
    desc_en: "Student-built practical demonstrations in sustainable energy, robotics, automation, and botanical models open to parents and public.",
    desc_np: "विद्यार्थीहरूले निर्माण गरेका रोबोटिक्स, ऊर्जा बचत प्रविधि तथा विज्ञान परियोजनाहरूको प्रदर्शनी।"
  },
  {
    id: 2,
    title_en: "Inter-House Athletics Championship (President Running Shield Selection)",
    title_np: "अन्तर-सदन खेलकुद प्रतियोगिता (राष्ट्रपति रनिङ शिल्ड छनोट)",
    date_en: "Kartik 14, 2083",
    date_np: "२०८३ कार्तिक १४",
    time: "08:30 AM - 05:00 PM",
    venue_en: "School Sports Ground",
    venue_np: "विद्यालय खेलकुद मैदान",
    desc_en: "Track and field events, volleyball championships, and martial arts demonstrations across Red, Blue, Green, and Gold student houses.",
    desc_np: "सदनस्तरीय भलिबल, १०० मिटर दौड, हाइजम्प र कराँते प्रतियोगिता।"
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 1,
    year: "2082 B.S.",
    title_en: "District Board Topper in SEE Examination (GPA 4.0)",
    title_np: "एसईई (SEE) परीक्षामा जिल्लाभर प्रथम (GPA 4.0)",
    desc_en: "Miss Anjali Sharma secured a perfect 4.0 GPA in the national Secondary Education Examination, maintaining our 100% pass record in first division.",
    desc_np: "छात्रा अञ्जली शर्माद्वारा एसईई परीक्षामा उत्कृष्ट ४.० जिपिए हासिल।"
  },
  {
    id: 2,
    year: "2081 B.S.",
    title_en: "Champions: President Running Shield Regional Athletics",
    title_np: "राष्ट्रपति रनिङ शिल्ड क्षेत्रीय खेलकुद प्रतियोगितामा प्रथम",
    desc_en: "School athletic squad lifted the district running shield securing 12 Gold, 8 Silver, and 5 Bronze medals in track and field.",
    desc_np: "१२ स्वर्ण पदकसहित समग्र च्याम्पियन ट्रफी जित्न सफल।"
  }
];

export const initialHistory: HistoryItem[] = [
  {
    id: 1,
    year: "2035 B.S. (1978 A.D.)",
    title_en: "Founding as Community Primary School",
    title_np: "प्राथमिक विद्यालयको रूपमा स्थापना",
    desc_en: "Inaugurated through community patronage to provide accessible education to rural youths with thatch roofing and dedicated local educators.",
    desc_np: "स्थानीय शिक्षाप्रेमीहरूको सक्रियता, मुठीदान र श्रमदानबाट प्राथमिक तहको रूपमा स्थापना।",
    display_order: 1,
    status: 'published',
    is_enabled: true
  },
  {
    id: 2,
    year: "2052 B.S. (1995 A.D.)",
    title_en: "Upgraded to Secondary High School (SLC / Class 10)",
    title_np: "माध्यमिक तह (कक्षा १०) मा स्तरोन्नति",
    desc_en: "Authorized by Ministry of Education to conduct SLC board examinations with masonry stone classrooms and expanded faculty.",
    desc_np: "शिक्षा मन्त्रालयबाट स्वीकृति प्राप्त गरी पहिलो पटक एसएलसी परीक्षामा शतप्रतिशत सफलतासहित सहभागिता।",
    display_order: 2,
    status: 'published',
    is_enabled: true
  },
  {
    id: 3,
    year: "2068 B.S. (2011 A.D.)",
    title_en: "Higher Secondary (+2) Science & Management Inaugurated",
    title_np: "उच्च माध्यमिक (+२) विज्ञान तथा व्यवस्थापन संकाय सुरु",
    desc_en: "Expanded into high school streams with science laboratories, computer learning center, and commerce faculty.",
    desc_np: "कक्षा ११ र १२ का विज्ञान, व्यवस्थापन र शिक्षाशास्त्र कक्षाहरू तथा आधुनिक प्रयोगशालाहरूको सञ्चालन।",
    display_order: 3,
    status: 'published',
    is_enabled: true
  },
  {
    id: 4,
    year: "2076 B.S. (2019 A.D.)",
    title_en: "Designated as Government of Nepal Model School (नमुना विद्यालय)",
    title_np: "नेपाल सरकारबाट 'नमुना विद्यालय' घोषणा",
    desc_en: "Selected under the National Model School Infrastructure Development Masterplan with smart interactive panels and comprehensive STEM campus.",
    desc_np: "अत्याधुनिक भौतिक पूर्वाधार, डिजिटल स्मार्ट बोर्ड, बहुउद्देश्यीय प्रयोगशाला तथा डिजिटल सिकाइ प्रविधि विस्तार।",
    display_order: 4,
    status: 'published',
    is_enabled: true
  }
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    title_en: "Citizen Charter & Institutional Service Standards (नागरिक बडापत्र)",
    title_np: "नागरिक बडापत्र तथा सेवा प्रवाह मापदण्ड",
    type: "Official Charter (PDF)",
    size: "1.8 MB",
    date: "2083-01-15"
  },
  {
    id: 2,
    title_en: "Grade 11 Entrance & Scholarship Application Form",
    title_np: "कक्षा ११ भर्ना तथा छात्रवृत्ति आवेदन फारम",
    type: "Application Form (PDF)",
    size: "640 KB",
    date: "2083-04-20"
  },
  {
    id: 3,
    title_en: "Annual Social Audit & Financial Statement Report (2082-2083)",
    title_np: "वार्षिक सामाजिक परीक्षण तथा आर्थिक आय-व्यय विवरण",
    type: "Audit Report (PDF)",
    size: "2.4 MB",
    date: "2083-03-30"
  }
];

export const initialPrograms: AcademicProgram[] = [
  {
    id: 1,
    title_en: "Early Childhood Development (ECD / Pre-Primary)",
    title_np: "प्रारम्भिक बाल विकास (ECD / पूर्व-प्राथमिक)",
    level: "ECD - Montessori Base",
    duration: "1 - 2 Years",
    intake: 45,
    desc_en: "Play-based sensorial learning framework supporting motor coordination, social empathy, and bilingual communication in joyful child-friendly rooms.",
    desc_np: "बालमैत्री वातावरणमा खेलकुद, चित्रकला र बालगीतको माध्यमबाट सिकाइको जग बसाल्ने प्रारम्भिक कार्यक्रम।"
  },
  {
    id: 2,
    title_en: "Basic Level Education (Grades 1 to 8)",
    title_np: "आधारभूत तह शिक्षा (कक्षा १ - ८)",
    level: "Basic Level (National Curriculum)",
    duration: "8 Years",
    intake: 320,
    desc_en: "Competency-based foundational academics featuring continuous assessment (CAS), practical mathematics, basic sciences, and ICT fundamentals.",
    desc_np: "निरन्तर विद्यार्थी मूल्याङ्कन प्रणाली, व्यवहारिक गणित, आधारभूत विज्ञान र सूचना प्रविधिमा आधारित अध्ययन।"
  },
  {
    id: 3,
    title_en: "Secondary Level (SEE / Grades 9 - 10)",
    title_np: "माध्यमिक तह (एसईई / कक्षा ९ - १०)",
    level: "Secondary School Examination",
    duration: "2 Years",
    intake: 180,
    desc_en: "Rigorous curriculum preparing candidates for the National Secondary Education Examination (SEE) with dedicated physics, chemistry, biology and computer labs.",
    desc_np: "एसईई परीक्षामा उत्कृष्ट नतिजाका लागि प्रयोगात्मक विज्ञान, ऐच्छिक गणित र कम्प्युटर विज्ञानको विशेष कक्षा।"
  },
  {
    id: 4,
    title_en: "Higher Secondary (+2 Science Stream)",
    title_np: "उच्च माध्यमिक (+२ विज्ञान संकाय)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 90,
    desc_en: "NEB-affiliated higher secondary stream preparing future doctors, engineers, and researchers with state-of-the-art lab exposure and medical/engineering entrance coaching.",
    desc_np: "भौतिकशास्त्र, रसायनशास्त्र र जीवविज्ञानका आधुनिक उपकरणयुक्त ल्याब तथा प्रवेश परीक्षा तयारी कक्षाहरू।"
  },
  {
    id: 5,
    title_en: "Higher Secondary (+2 Management Stream)",
    title_np: "उच्च माध्यमिक (+२ व्यवस्थापन संकाय)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 120,
    desc_en: "Comprehensive business studies, computer science, accounting, and economics equipping students for banking, chartered accountancy, and entrepreneurship.",
    desc_np: "लेखाविधि, कम्प्युटर विज्ञान, अर्थशास्त्र र व्यवसाय अध्ययनसहितको आधुनिक व्यवस्थापन शिक्षा।"
  },
  {
    id: 6,
    title_en: "Higher Secondary (+2 Education & Humanities)",
    title_np: "उच्च माध्यमिक (+२ शिक्षाशास्त्र संकाय)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 60,
    desc_en: "Pedagogy, psychology, English, and Nepali major courses training future educators, public administrators, and civil servants.",
    desc_np: "शैक्षिक सिद्धान्त, शिक्षण विधि, समाजशास्त्र तथा भाषा विज्ञानको अध्यापन।"
  }
];

export const initialMessages: ContactMessage[] = [
  {
    id: 1,
    name: "Subash Thapa",
    email: "subash.thapa@gmail.com",
    phone: "9841238901",
    subject: "Grade 11 Science Stream Admission & Scholarship Test",
    message: "Namaste, I would like to inquire about the entrance exam syllabus and available merit scholarship quotas for SEE students joining Grade 11 Science.",
    date: "2083-05-10",
    status: "new"
  },
  {
    id: 2,
    name: "Sunita Adhikari",
    email: "sunita.adhikari@yahoo.com",
    phone: "9812345678",
    subject: "Transfer Certificate (TC) and Character Certificate Verification",
    message: "Respected administration, my daughter completed Grade 8 from Ishwari. We need her official character certificate for transfer documentation.",
    date: "2083-05-08",
    status: "reviewed"
  }
];

export const initialGallery: GalleryItem[] = [
  { id: 1, title_en: 'Secondary Science Lab Practical Examination', title_np: 'विज्ञान प्रयोगशालामा विद्यार्थीहरूको प्रयोगात्मक अभ्यास', category: 'science', iconType: 'science' },
  { id: 2, title_en: 'Annual Inter-House Athletics & Volleyball Championship', title_np: 'वार्षिक अन्तर-सदन भलिबल तथा एथलेटिक्स प्रतियोगिता', category: 'sports', iconType: 'sports' },
  { id: 3, title_en: 'Digital Smart Classroom Pedagogy Session', title_np: 'डिजिटल स्मार्ट बोर्डबाट पठनपाठन', category: 'academics', iconType: 'academics' },
  { id: 4, title_en: 'Saraswati Puja Cultural Assembly & Exhibition', title_np: 'श्रीपञ्चमी तथा सरस्वती पूजा महोत्सव', category: 'culture', iconType: 'culture' },
  { id: 5, title_en: 'Community Cleanliness & Eco Tree Plantation Drive', title_np: 'सामुदायिक सरसफाइ तथा वृक्षारोपण कार्यक्रम', category: 'community', iconType: 'community' },
  { id: 6, title_en: 'District Student STEM & Robotics Demonstration', title_np: 'रोबोटिक्स परियोजनाको सफल प्रदर्शन', category: 'science', iconType: 'science' },
];

export const initialSiteConfig: SiteCustomizerConfig = {
  primaryColor: '#1E3A8A',
  primaryColorName: 'Academic Navy',
  header: {
    showTopBar: true,
    showNationalFlag: true,
    flagMode: 'default_nepal',
    customFlagImage: '',
    flagSize: 'normal',
    flagPosition: 'after_theme',
    showWavingStand: true,
    showAlertTicker: true,
    tickerMode: 'auto_pinned',
    tickerTitleEn: 'Latest News',
    tickerTitleNp: 'ताजा समाचार',
    selectedNoticeId: '',
    showAcademicYear: true,
    academicYearLabelEn: 'Annual',
    academicYearLabelNp: 'वार्षिक',
    academicYearValue: '2083',
    academicYearSeparator: '|',
    showBsClock: true,
    showDate: true,
    dateFormat: 'full',
    showTime: true,
    timeFormat: '12h',
    showSeconds: true,
    showWeekday: true,
    showNepaliDate: true,
    timezone: 'Asia/Kathmandu',
    showSearchButton: true,
    searchPlaceholderEn: 'Search website...',
    searchPlaceholderNp: 'वेबसाइटमा खोज्नुहोस्...',
    showSearchShortcut: true,
    showLanguageToggle: true,
    defaultLanguage: 'en',
    langLabelEn: 'EN',
    langLabelNp: 'नेपा',
    langDisplayMode: 'compact',
    showThemeSwitch: true,
    defaultTheme: 'light',
    showSchoolBadges: true,
    showTagline: true,
    showAddress: true,
    showAdmissionCta: true,
    admissionCtaTextEn: 'Admission 2083',
    admissionCtaTextNp: 'नयाँ भर्ना २०८३',
    admissionCtaRoute: 'academics',
    showHelpline: true,
    helplinePhone: '+977-21-420123',
    stickyHeader: true,
    showLogo: true,
    showSchoolIdentity: true,
    showEmis: true,
    showEstd: true,
    showNepaliName: true,
    logoSize: 'medium',
    schoolNameSize: 'medium',
    nepaliNameSize: 'medium',
    headerIdentityAlignment: 'center',
  },
  showAlertTicker: true,
  alertTickerEn: 'Annual Examination Routine (Grades 1 to 9) Published for Session 2083',
  alertTickerNp: 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका (कक्षा १ देखि ९ सम्म) प्रकाशित गरिएको बारे',
  heroBadgeEn: 'CENTER FOR ACADEMIC EXCELLENCE & CHARACTER BUILDING',
  heroBadgeNp: 'शैक्षिक उत्कृष्टता र चरित्र निर्माणको केन्द्र',
  heroTitleEn: 'Cultivating Academic Excellence & Responsible Citizens Since 2035 B.S.',
  heroTitleNp: 'शैक्षिक उत्कृष्टता र नैतिक चरित्र निर्माणको चार दशक लामो यात्रा।',
  heroSubtitleEn: 'A premier community educational institution offering experiential STEM pedagogy, digital classrooms, high-standard laboratories, and holistic secondary and higher secondary education.',
  heroSubtitleNp: 'अनुभवी शिक्षक, आधुनिक विज्ञान तथा कम्प्युटर प्रयोगशाला र डिजिटल स्मार्ट कक्षाकोठाका माध्यमबाट विद्यार्थीहरूको चौतर्फी विकासमा समर्पित।',
  homeBgImage: '',
  homeBgEnabled: false,
  homeBgPosition: 'center',
  homeBgSize: 'cover',
  homeBgOverlayEnabled: true,
  homeBgOverlayOpacity: 85,
  historyBgImage: '',
  historyBgEnabled: false,
  historyBgPosition: 'center',
  historyBgSize: 'cover',
  historyBgOverlayEnabled: true,
  historyBgOverlayOpacity: 80,
  stats: {
    students: '1,240+',
    studentsLabelEn: 'Enrolled Students',
    studentsLabelNp: 'अध्ययनरत विद्यार्थी',
    staff: '52',
    staffLabelEn: 'Faculty & Staff',
    staffLabelNp: 'शिक्षक तथा कर्मचारी',
    years: '48',
    yearsLabelEn: 'Years of Service',
    yearsLabelNp: 'वर्षको गौरवमय इतिहास',
    successRate: '100%',
    successLabelEn: 'SEE Success Rate',
    successLabelNp: 'एसईई परीक्षा सफलता',
  },
  sectionVisibility: {
    hero: true,
    stats: true,
    notices: true,
    principal: true,
    facilities: true,
    academics: true,
    events: true,
    achievements: true,
    history: true,
    documents: true,
    gallery: true,
    community: true,
    contact: true,
  },
  footerDescEn: 'Committed to excellence, integrity, and social responsibility in public secondary education since 2035 B.S.',
  footerDescNp: 'वि.सं. २०३५ देखि गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको अग्रणी नमुना सामुदायिक विद्यालय।',
  copyrightTextEn: 'Ishwari Secondary School. All rights reserved.',
  copyrightTextNp: 'ईश्वरी माध्यमिक विद्यालय। सर्वाधिकार सुरक्षित।',
  socialLinks: [
    {
      id: 'soc-fb-1',
      platform: 'facebook',
      url: 'https://facebook.com/ishwari.secondary.school',
      labelEn: 'Facebook',
      labelNp: 'फेसबुक',
      enabled: true,
      order: 1
    },
    {
      id: 'soc-yt-2',
      platform: 'youtube',
      url: 'https://youtube.com/@ishwari.secondary.school',
      labelEn: 'YouTube',
      labelNp: 'युट्युब',
      enabled: true,
      order: 2
    },
    {
      id: 'soc-x-3',
      platform: 'x',
      url: 'https://x.com/ishwari_school',
      labelEn: 'X (formerly Twitter)',
      labelNp: 'एक्स (ट्विटर)',
      enabled: true,
      order: 3
    },
    {
      id: 'soc-ig-4',
      platform: 'instagram',
      url: 'https://instagram.com/ishwari.secondary.school',
      labelEn: 'Instagram',
      labelNp: 'इन्स्टाग्राम',
      enabled: false,
      order: 4
    }
  ],
  usefulLinks: [
    {
      id: 'ul-1',
      titleEn: 'Ministry of Education, Science & Technology',
      titleNp: 'शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय',
      url: 'https://moest.gov.np',
      descriptionEn: 'Government of Nepal Federal Ministry',
      descriptionNp: 'नेपाल सरकार संघीय मन्त्रालय',
      enabled: true,
      order: 1
    },
    {
      id: 'ul-2',
      titleEn: 'Curriculum Development Centre (CDC)',
      titleNp: 'पाठ्यक्रम विकास केन्द्र',
      url: 'https://moecdc.gov.np',
      descriptionEn: 'National curricula, syllabi & textbooks',
      descriptionNp: 'राष्ट्रिय पाठ्यक्रम तथा पाठ्यपुस्तक',
      enabled: true,
      order: 2
    },
    {
      id: 'ul-3',
      titleEn: 'National Examination Board (NEB)',
      titleNp: 'राष्ट्रिय परीक्षा बोर्ड',
      url: 'https://neb.gov.np',
      descriptionEn: 'National secondary board & examinations',
      descriptionNp: 'राष्ट्रिय परीक्षा तथा मूल्याङ्कन',
      enabled: true,
      order: 3
    },
    {
      id: 'ul-4',
      titleEn: 'Center for Education & Human Resource (CEHRD)',
      titleNp: 'शिक्षा तथा मानव स्रोत विकास केन्द्र',
      url: 'https://cehrd.gov.np',
      descriptionEn: 'Educational planning & resource hub',
      descriptionNp: 'शैक्षिक योजना तथा तथ्याङ्क केन्द्र',
      enabled: true,
      order: 4
    }
  ],
  showFooterMap: true,
  footerMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.899890123456!2d85.324!3d27.700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzAwLjAiTiA4NcKwMTknMjYuNCJF!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp',
  footerMapUrl: 'https://maps.google.com/?q=Ishwari+Secondary+School+Nepal',
  showPrivacyPolicy: true,
  showTermsPolicy: true,
  educationalBgGlobalStyle: 'subtle',
  educationalBgGlobalInteraction: 'interactive',
  educationalBackgrounds: {
    hero: {
      enabled: true,
      mode: 'preset',
      preset: 'school_building',
      opacity: 4,
      placement: 'right',
      style: 'subtle',
      interaction: 'interactive'
    },
    principal: {
      enabled: true,
      mode: 'preset',
      preset: 'classroom',
      opacity: 4,
      placement: 'top-right',
      style: 'subtle',
      interaction: 'interactive'
    },
    facilities: {
      enabled: true,
      mode: 'preset',
      preset: 'science_lab',
      opacity: 4,
      placement: 'bottom-right',
      style: 'subtle',
      interaction: 'interactive'
    },
    academics: {
      enabled: true,
      mode: 'preset',
      preset: 'open_books',
      opacity: 4,
      placement: 'right',
      style: 'subtle',
      interaction: 'interactive'
    },
    about_intro: {
      enabled: true,
      mode: 'preset',
      preset: 'library_books',
      opacity: 4,
      placement: 'right',
      style: 'subtle',
      interaction: 'interactive'
    },
    footer: {
      enabled: true,
      mode: 'preset',
      preset: 'graduation_cap',
      opacity: 3,
      placement: 'bottom-right',
      style: 'subtle',
      interaction: 'interactive'
    }
  },
  academicYear: {
    currentYear: '2083 B.S.',
    previousYear: '2082 B.S.',
    startDate: '2083-01-01',
    endDate: '2083-12-30',
    isActive: true
  },
  homepageSections: [
    {
      id: 'hero',
      nameEn: 'Institutional Hero Banner',
      nameNp: 'मुख्य ब्यानर',
      title_en: 'Cultivating Academic Excellence & Responsible Citizens',
      title_np: 'शैक्षिक उत्कृष्टता र नैतिक चरित्र निर्माण',
      subtitle_en: 'A premier community educational institution offering experiential STEM pedagogy and holistic education.',
      subtitle_np: 'अनुभवी शिक्षक र आधुनिक प्रयोगशालाका माध्यमबाट विद्यार्थीहरूको चौतर्फी विकास।',
      enabled: true,
      order: 1,
      layout: 'default'
    },
    {
      id: 'notices',
      nameEn: 'Latest News & Digital Notice Board',
      nameNp: 'ताजा समाचार तथा सूचना पाटी',
      title_en: 'Official Circulars & Announcements',
      title_np: 'आधिकारिक सूचना तथा परिपत्रहरू',
      subtitle_en: 'Stay updated with school administrative notices, exam schedules, and circulars.',
      subtitle_np: 'विद्यालयका प्रशासनिक सूचना, परीक्षा तालिका र परिपत्रहरू।',
      enabled: true,
      order: 2,
      layout: 'cards'
    },
    {
      id: 'quick_access',
      nameEn: 'Quick Access / Information Hub',
      nameNp: 'द्रुत पहुँच / सूचना केन्द्र',
      title_en: 'Information Hub & Direct Services',
      title_np: 'सूचना केन्द्र तथा प्रत्यक्ष सेवाहरू',
      subtitle_en: 'Fast access to notices, curriculum, calendar, downloads, and admissions.',
      subtitle_np: 'सूचना, पाठ्यक्रम, क्यालेन्डर, डाउनलोड र भर्ना सम्बन्धी द्रुत सेवाहरू।',
      enabled: true,
      order: 3,
      layout: 'grid'
    },
    {
      id: 'about',
      nameEn: 'About School & Educational Pillars',
      nameNp: 'विद्यालय परिचय तथा स्तम्भहरू',
      title_en: 'Four Decades of Academic Distinction',
      title_np: 'शैक्षिक उत्कृष्टताको चार दशक लामो यात्रा',
      subtitle_en: 'Dedicated to moral character, modern pedagogy, and equal learning opportunity.',
      subtitle_np: 'नैतिक चरित्र, आधुनिक शिक्षण र समान अवसरमा समर्पित।',
      enabled: true,
      order: 4,
      layout: 'default'
    },
    {
      id: 'principal',
      nameEn: "Principal's Desk Message",
      nameNp: 'प्रधानाध्यापकको सन्देश',
      title_en: "Principal's Institutional Address",
      title_np: 'प्रधानाध्यापकको सन्देश',
      subtitle_en: 'Guiding vision from the academic leadership of Ishwari Secondary School.',
      subtitle_np: 'शैक्षिक नेतृत्व तथा मार्गदर्शक सन्देश।',
      enabled: true,
      order: 5,
      layout: 'default'
    },
    {
      id: 'stats',
      nameEn: 'School Institutional Statistics',
      nameNp: 'विद्यालयका मुख्य तथ्याङ्कहरू',
      title_en: 'Our Academic Milestone by Numbers',
      title_np: 'हाम्रो शैक्षिक उपलब्धि तथ्याङ्कमा',
      subtitle_en: 'Real figures representing student strength, faculty qualifications, and academic success.',
      subtitle_np: 'विद्यार्थी सङ्ख्या, शिक्षक दक्षता र सफलताको वास्तविक तथ्याङ्क।',
      enabled: true,
      order: 6,
      layout: 'default'
    },
    {
      id: 'facilities',
      nameEn: 'Model Infrastructure & Facilities',
      nameNp: 'नमुना पूर्वाधार तथा प्रयोगशाला',
      title_en: 'State-of-the-Art Learning Environment',
      title_np: 'आधुनिक सिकाइ वातावरण तथा पूर्वाधार',
      subtitle_en: 'High-tech science laboratories, smart computer labs, and comprehensive library.',
      subtitle_np: 'सुविधासम्पन्न प्रयोगशाला, कम्प्युटर ल्याब र बृहत् पुस्तकालय।',
      enabled: true,
      order: 7,
      layout: 'grid'
    },
    {
      id: 'events',
      nameEn: 'Upcoming Events & Calendar',
      nameNp: 'आगामी कार्यक्रम तथा क्यालेन्डर',
      title_en: 'Upcoming Programs & Key Dates',
      title_np: 'आगामी कार्यक्रम तथा महत्त्वपूर्ण मितिहरू',
      subtitle_en: 'Academic examinations, sports tournaments, and co-curricular programs.',
      subtitle_np: 'शैक्षिक परीक्षा, खेलकुद तथा अतिरिक्त क्रियाकलापका कार्यक्रमहरू।',
      enabled: true,
      order: 8,
      layout: 'cards'
    },
    {
      id: 'achievements',
      nameEn: 'Student Achievements Wall',
      nameNp: 'विद्यार्थी उपलब्धि तथा सम्मान',
      title_en: 'Student Honors & Board Distinctions',
      title_np: 'विद्यार्थी सम्मान तथा उत्कृष्ट सफलता',
      subtitle_en: 'Celebrating district board toppers, athletic champions, and creative talent.',
      subtitle_np: 'बोर्ड परीक्षा, खेलकुद तथा सिर्जनात्मक क्षेत्रका उत्कृष्ट सफलताहरू।',
      enabled: true,
      order: 9,
      layout: 'cards'
    },
    {
      id: 'curriculum',
      nameEn: 'Curriculum & Digital Resources',
      nameNp: 'पाठ्यक्रम तथा डिजिटल स्रोतहरू',
      title_en: 'Curriculum Guidelines & Syllabi',
      title_np: 'पाठ्यक्रम निर्देशिका तथा अध्ययन सामग्री',
      subtitle_en: 'Official CDC & NEB curriculum frameworks and learning resources.',
      subtitle_np: 'पाठ्यक्रम विकास केन्द्र तथा NEB द्वारा निर्धारित पाठ्यक्रम सामग्री।',
      enabled: true,
      order: 10,
      layout: 'compact'
    },
    {
      id: 'gallery',
      nameEn: 'Campus Photo Gallery',
      nameNp: 'तस्बिर ग्यालरी',
      title_en: 'Moments of Joy & Academic Life',
      title_np: 'शैक्षिक गतिविधि तथा जीवनका झलकहरू',
      subtitle_en: 'A glimpse into assemblies, science fairs, sports, and celebrations.',
      subtitle_np: 'प्रार्थना सभा, विज्ञान प्रदर्शनी र खेलकुदका अविस्मरणीय झलकहरू।',
      enabled: true,
      order: 11,
      layout: 'grid'
    },
    {
      id: 'contact',
      nameEn: 'Contact & Institutional Helpdesk',
      nameNp: 'सम्पर्क तथा सोधपुछ केन्द्र',
      title_en: 'Connect With School Administration',
      title_np: 'विद्यालय प्रशासनसँग सम्पर्क गर्नुहोस्',
      subtitle_en: 'Have inquiries regarding admissions, examinations, or student welfare?',
      subtitle_np: 'भर्ना, परीक्षा वा विद्यार्थी सेवा सम्बन्धी कुनै जिज्ञासा भए सम्पर्क गर्नुहोस्।',
      enabled: true,
      order: 12,
      layout: 'default'
    }
  ],
  quickAccessItems: [
    {
      id: 'qa-notices',
      icon: 'Bell',
      title_en: 'Digital Notices',
      title_np: 'डिजिटल सूचना',
      desc_en: 'Official circulars, urgent announcements, and exam schedules',
      desc_np: 'प्रशासनिक सूचना, परिपत्र तथा परीक्षा कार्यतालिका',
      route: 'notices',
      enabled: true,
      order: 1
    },
    {
      id: 'qa-calendar',
      icon: 'Calendar',
      title_en: 'Academic Calendar',
      title_np: 'शैक्षिक क्यालेन्डर',
      desc_en: 'Annual schedule, holidays, exam dates, and school programs',
      desc_np: 'वार्षिक क्यालेन्डर, बिदा, परीक्षा र कार्यक्रमहरू',
      route: 'academic-calendar',
      enabled: true,
      order: 2
    },
    {
      id: 'qa-curriculum',
      icon: 'BookMarked',
      title_en: 'Curriculum & Syllabi',
      title_np: 'पाठ्यक्रम निर्देशिका',
      desc_en: 'Grade-wise learning outcomes, guidelines, and reference notes',
      desc_np: 'तहगत सिकाइ उपलब्धि, निर्देशिका तथा अध्ययन सामग्री',
      route: 'curriculum',
      enabled: true,
      order: 3
    },
    {
      id: 'qa-downloads',
      icon: 'Download',
      title_en: 'Downloads Center',
      title_np: 'डाउनलोड केन्द्र',
      desc_en: 'Application forms, citizen charter, publications, and reports',
      desc_np: 'फारम, नागरिक वडापत्र, वार्षिक मुखपत्र र दस्तावेजहरू',
      route: 'documents',
      enabled: true,
      order: 4
    },
    {
      id: 'qa-events',
      icon: 'Clock',
      title_en: 'Events & Routines',
      title_np: 'कार्यक्रम तालिका',
      desc_en: 'Assemblies, sports competitions, science fairs, and parent meetings',
      desc_np: 'सांस्कृतिक कार्यक्रम, खेलकुद सप्ताह र अभिभावक भेला',
      route: 'events',
      enabled: true,
      order: 5
    },
    {
      id: 'qa-vacancies',
      icon: 'Briefcase',
      title_en: 'Career & Vacancies',
      title_np: 'रोजगारी तथा विज्ञापन',
      desc_en: 'Open teaching and administrative recruitment circulars',
      desc_np: 'शिक्षक तथा कर्मचारी पदपूर्ति विज्ञापनहरू',
      route: 'notice',
      enabled: true,
      order: 6
    },
    {
      id: 'qa-achievements',
      icon: 'Award',
      title_en: 'Student Honors',
      title_np: 'उपलब्धि पर्खाल',
      desc_en: 'District board distinctions, trophies, and student laurels',
      desc_np: 'बोर्ड परीक्षामा उत्कृष्ट नतिजा, पदक तथा सम्मानहरू',
      route: 'achievements',
      enabled: true,
      order: 7
    },
    {
      id: 'qa-staff',
      icon: 'Users',
      title_en: 'Faculty Directory',
      title_np: 'शिक्षक विवरण',
      desc_en: 'Certified teachers, departmental leads, and school administration',
      desc_np: 'दक्ष शिक्षक, विषयगत प्रमुख तथा कर्मचारी विवरण',
      route: 'staff',
      enabled: true,
      order: 8
    },
    {
      id: 'qa-facilities',
      icon: 'Building2',
      title_en: 'Campus Facilities',
      title_np: 'भौतिक पूर्वाधार',
      desc_en: 'STEM laboratories, smart computer room, and digital library',
      desc_np: 'विज्ञान प्रयोगशाला, कम्प्युटर ल्याब र पुस्तकालय',
      route: 'facilities',
      enabled: true,
      order: 9
    },
    {
      id: 'qa-contact',
      icon: 'PhoneCall',
      title_en: 'Helpdesk & Contact',
      title_np: 'सोधपुछ केन्द्र',
      desc_en: 'Direct contact with administration office and student helpline',
      desc_np: 'प्रशासन कार्यालय, फोन नम्बर र लोकेसन नक्सा',
      route: 'contact',
      enabled: true,
      order: 10
    }
  ]
};

export const defaultHomepageSections = initialSiteConfig.homepageSections!;
export const defaultQuickAccessItems = initialSiteConfig.quickAccessItems!;

export const initialUsefulLinks: UsefulLink[] = [
  {
    id: 'ul-1',
    titleEn: 'Ministry of Education, Science & Technology',
    titleNp: 'शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय',
    url: 'https://moest.gov.np',
    descriptionEn: 'Government of Nepal Federal Ministry',
    descriptionNp: 'नेपाल सरकार संघीय मन्त्रालय',
    enabled: true,
    order: 1
  },
  {
    id: 'ul-2',
    titleEn: 'Curriculum Development Centre (CDC)',
    titleNp: 'पाठ्यक्रम विकास केन्द्र',
    url: 'https://moecdc.gov.np',
    descriptionEn: 'National curricula, syllabi & textbooks',
    descriptionNp: 'राष्ट्रिय पाठ्यक्रम तथा पाठ्यपुस्तक',
    enabled: true,
    order: 2
  },
  {
    id: 'ul-3',
    titleEn: 'National Examination Board (NEB)',
    titleNp: 'राष्ट्रिय परीक्षा बोर्ड',
    url: 'https://neb.gov.np',
    descriptionEn: 'National secondary board & examinations',
    descriptionNp: 'राष्ट्रिय परीक्षा तथा मूल्याङ्कन',
    enabled: true,
    order: 3
  },
  {
    id: 'ul-4',
    titleEn: 'Center for Education & Human Resource (CEHRD)',
    titleNp: 'शिक्षा तथा मानव स्रोत विकास केन्द्र',
    url: 'https://cehrd.gov.np',
    descriptionEn: 'Educational planning & resource hub',
    descriptionNp: 'शैक्षिक योजना तथा तथ्याङ्क केन्द्र',
    enabled: true,
    order: 4
  }
];

export const initialSocialLinks: SocialMediaLink[] = [
  {
    id: 'soc-fb-1',
    platform: 'facebook',
    url: 'https://facebook.com/ishwari.secondary.school',
    labelEn: 'Facebook',
    labelNp: 'फेसबुक',
    enabled: true,
    order: 1
  },
  {
    id: 'soc-yt-2',
    platform: 'youtube',
    url: 'https://youtube.com/@ishwari.secondary.school',
    labelEn: 'YouTube',
    labelNp: 'युट्युब',
    enabled: true,
    order: 2
  },
  {
    id: 'soc-x-3',
    platform: 'x',
    url: 'https://x.com/ishwari_school',
    labelEn: 'X (formerly Twitter)',
    labelNp: 'एक्स (ट्विटर)',
    enabled: true,
    order: 3
  },
  {
    id: 'soc-ig-4',
    platform: 'instagram',
    url: 'https://instagram.com/ishwari.secondary.school',
    labelEn: 'Instagram',
    labelNp: 'इन्स्टाग्राम',
    enabled: false,
    order: 4
  }
];

export const initialSecurityConfig: SecurityConfig = {
  adminUsername: 'admin',
  adminPassword: 'Ishwari@Secure2026',
  adminPasswordHash: 'Ishwari@Secure2026',
  recoveryPin: '782035',
  lockoutThreshold: 5,
  lockoutDurationMinutes: 5,
  sessionTimeoutMinutes: 30,
  adminRouteSlug: 'admin-portal',
  hideAdminLinkInHeader: false,
};

export const initialAuditLogs: SecurityAuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2083-05-12 09:15:22',
    action: 'SYSTEM_BOOT',
    actor: 'SYSTEM',
    status: 'success',
    severity: 'success',
    details: 'Institutional security sandbox and database initialized successfully.'
  },
  {
    id: 'log-2',
    timestamp: '2083-05-12 09:20:00',
    action: 'ADMIN_LOGIN_SUCCESS',
    actor: 'admin',
    status: 'success',
    severity: 'success',
    details: 'Authorized master administrator session started.'
  }
];

export const initialAboutSections: AboutSection[] = [
  {
    id: 'about-intro',
    title_en: 'About Ishwari Secondary School',
    title_np: 'ईश्वरी माध्यमिक विद्यालयको बारेमा',
    category: 'overview',
    content_en: `Shree Ishwari Secondary School was established in 2035 B.S. and has continued to provide quality, accessible education to students across the community.

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:Main School Academic Block|caption:Shree Ishwari Secondary School Academic Campus Block]]

Over the decades, the institution has steadily expanded its educational programs, infrastructure, and learning environment. Through generous community collaboration and dedicated governmental support, the school has developed modern multimedia classrooms, fully-equipped science and computer laboratories, and sports grounds.

Today, Ishwari Secondary School stands as a model community learning center where academic rigor, ethical discipline, and scientific inquiry are nurtured together.`,
    content_np: `श्री ईश्वरी माध्यमिक विद्यालय वि.सं. २०३५ सालमा स्थापित भई यस भेगका बालबालिकाहरूलाई गुणस्तरीय, सुलभ र व्यावहारिक शिक्षा प्रदान गर्दै आइरहेको एक ऐतिहासिक सामुदायिक शैक्षिक संस्था हो।

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:विद्यालयको मुख्य शैक्षिक भवन|caption:श्री ईश्वरी माध्यमिक विद्यालयको शैक्षिक परिसर]]

स्थापनाकालदेखि नै विद्यालयले आफ्ना शैक्षिक कार्यक्रमहरू, आधुनिक भौतिक पूर्वाधार तथा प्रविधिमैत्री सिकाइ वातावरणलाई निरन्तर सुदृढ बनाउँदै लगेको छ। समुदायको प्रत्यक्ष सहभागिता, अनुभवी शिक्षक मण्डली र विद्यार्थीहरूको लगनशीलताले विद्यालयलाई नमुना विद्यालयको रूपमा स्थापित गरेको छ।

आज यस विद्यालयमा आधुनिक विज्ञान प्रयोगशाला, कम्प्युटर ल्याब, सुसज्जित पुस्तकालय तथा खेलकुद मैदान उपलब्ध छन् जहाँ विद्यार्थीहरूको सर्वाङ्गीण विकासलाई प्राथमिकता दिइन्छ।`,
    image: '',
    image_caption_en: 'Academic Campus Grounds',
    image_caption_np: 'विद्यालयको मुख्य शैक्षिक प्राङ्गण',
    display_order: 1,
    status: 'published',
    is_enabled: true,
    icon: 'Compass'
  },
  {
    id: 'about-mission',
    title_en: 'Our Mission',
    title_np: 'हाम्रो उद्देश्य',
    category: 'mission',
    content_en: 'To empower every learner with strong academic foundations, critical thinking abilities, digital literacy, and civic values.',
    content_np: 'प्रत्येक विद्यार्थीलाई आधारभूत शैक्षिक ज्ञान, सिर्जनशीलता, प्रविधिमैत्री सीप र उच्च नैतिक संस्कार प्रदान गर्नु।',
    display_order: 2,
    status: 'published',
    is_enabled: true,
    icon: 'Target'
  },
  {
    id: 'about-vision',
    title_en: 'Our Vision',
    title_np: 'हाम्रो दृष्टिकोण',
    category: 'vision',
    content_en: 'To establish Ishwari as a premier national model school delivering accessible, internationally competitive education in Nepal.',
    content_np: 'नेपालको अग्रणी नमुना सामुदायिक विद्यालयको रूपमा विकास गरी राष्ट्रिय तथा अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धी जनशक्ति तयार पार्नु।',
    display_order: 3,
    status: 'published',
    is_enabled: true,
    icon: 'Eye'
  },
  {
    id: 'about-values',
    title_en: 'Core Values',
    title_np: 'हाम्रा मुख्य मान्यताहरू',
    category: 'values',
    content_en: 'Academic Integrity, Social Inclusion, Scientific Temper, Environmental Stewardship, and Community Trust.',
    content_np: 'शैक्षिक निष्ठा, सामाजिक समावेशिता, वैज्ञानिक चेतना, वातावरण संरक्षण र पूर्ण अनुशासन।',
    display_order: 4,
    status: 'published',
    is_enabled: true,
    icon: 'Scale'
  },
  {
    id: 'about-governance',
    title_en: 'School Management Committee (SMC) & Governance',
    title_np: 'विद्यालय व्यवस्थापन समिति (SMC) तथा सुशासन',
    category: 'governance',
    content_en: 'Under the Education Act of Nepal, the School Management Committee oversees institutional policy, educational equity, resource allocation, and annual social audits with active community participation.',
    content_np: 'शिक्षा ऐन तथा नियमावली अनुसार अभिभावक, स्थानीय तहका प्रतिनिधि र शिक्षाप्रेमीहरूको सहभागितामा गठित विद्यालय व्यवस्थापन समितिले नीतिगत निर्णय, पारदर्शिता र शैक्षिक गुणस्तर अभिवृद्धिमा नेतृत्वदायी भूमिका निर्वाह गर्दछ।',
    display_order: 5,
    status: 'published',
    is_enabled: true,
    icon: 'Building2'
  }
];

export const initialCurriculumGuidelines: CurriculumGuideline[] = [
  {
    id: 1,
    title_en: 'Grade 10 Compulsory Mathematics Curriculum Guideline & Specification Grid',
    title_np: 'कक्षा १० अनिवार्य गणित पाठ्यक्रम निर्देशिका तथा विशिष्टीकरण तालिका',
    subject: 'Mathematics',
    academic_level_id: 'secondary_9_10',
    class_level: 'Grade 10',
    description_en: 'National Curriculum Development Centre (CDC) curriculum framework, unit-wise learning outcomes, internal assessment modalities, and SEE specification grid.',
    description_np: 'पाठ्यक्रम विकास केन्द्र (CDC) द्वारा निर्धारित कक्षा १० को अनिवार्य गणित विषयको सिकाइ उपलब्धि, प्रयोगात्मक मूल्याङ्कन र विशिष्टीकरण तालिका।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-math-grade10.pdf',
    original_filename: 'Grade10_Compulsory_Mathematics_Guideline_2083.pdf',
    file_size_bytes: 3840000,
    file_size_formatted: '3.8 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 1,
    created_at: '2026-04-10',
    updated_at: '2026-08-15'
  },
  {
    id: 2,
    title_en: 'Grade 9-10 Science & Technology Practical Laboratory Curriculum',
    title_np: 'कक्षा ९-१० विज्ञान तथा प्रविधि प्रयोगात्मक प्रयोगशाला पाठ्यक्रम',
    subject: 'Science & Technology',
    academic_level_id: 'secondary_9_10',
    class_level: 'Grade 9-10',
    description_en: 'Laboratory practical experiments, scientific investigation steps, project work guidelines, and continuous assessment rubric.',
    description_np: 'विज्ञान प्रयोगशाला अभ्यास, प्रयोगात्मक कार्य, परियोजना कार्य र निरन्तर विद्यार्थी मूल्याङ्कन निर्देशिका।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-science-grade9-10.pdf',
    original_filename: 'Grade9_10_Science_Tech_Lab_Manual_2083.pdf',
    file_size_bytes: 5242880,
    file_size_formatted: '5.2 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 2,
    created_at: '2026-04-12',
    updated_at: '2026-08-14'
  },
  {
    id: 3,
    title_en: 'Grade 11-12 Physics Practical Curriculum & Experimental Manual',
    title_np: 'कक्षा ११-१२ भौतिकशास्त्र प्रयोगात्मक पाठ्यक्रम तथा प्रयोगशाला निर्देशिका',
    subject: 'Physics',
    academic_level_id: 'higher_secondary_11_12',
    class_level: 'Grade 11-12',
    description_en: 'National Examinations Board (NEB) Class 11 and 12 physics experiments, error analysis instructions, and viva-voce guide.',
    description_np: 'राष्ट्रिय परीक्षा बोर्ड (NEB) कक्षा ११ र १२ भौतिक विज्ञान प्रयोगात्मक परीक्षा निर्देशिका र नमुना अभ्यास।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-physics-grade11-12.pdf',
    original_filename: 'NEB_Grade11_12_Physics_Practical_Manual.pdf',
    file_size_bytes: 7864320,
    file_size_formatted: '7.5 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 3,
    created_at: '2026-04-15',
    updated_at: '2026-08-10'
  },
  {
    id: 4,
    title_en: 'Basic Level (Grade 6-8) English Communicative Curriculum & Listening Materials',
    title_np: 'आधारभूत तह (कक्षा ६-८) अंग्रेजी सञ्चार सीप पाठ्यक्रम तथा सुनाइ अभ्यास',
    subject: 'English',
    academic_level_id: 'basic_6_8',
    class_level: 'Grade 6-8',
    description_en: 'Four-strand language competencies: Listening, Speaking, Reading, and Writing with internal assessment weightage.',
    description_np: 'सुनाइ, बोलाइ, पढाइ र लेखाइ सम्बन्धी चारवटै भाषिक सीप र आन्तरिक मूल्याङ्कनको ढाँचा।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-english-grade6-8.pdf',
    original_filename: 'Grade6_8_English_Language_Competencies.pdf',
    file_size_bytes: 2621440,
    file_size_formatted: '2.5 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 4,
    created_at: '2026-04-18',
    updated_at: '2026-08-12'
  },
  {
    id: 5,
    title_en: 'Grade 10 Compulsory Nepali Curriculum Framework & Creative Writing Guidelines',
    title_np: 'कक्षा १० अनिवार्य नेपाली पाठ्यक्रम संरचना तथा सिर्जनात्मक लेखन निर्देशिका',
    subject: 'Nepali',
    academic_level_id: 'secondary_9_10',
    class_level: 'Grade 10',
    description_en: 'Grammar, comprehension, essay writing guidelines, literature appreciation, and CDC model question specifications.',
    description_np: 'व्याकरण, बोध तथा अभिव्यक्ति, सिर्जनात्मक लेखन, साहित्य विधा र एसईई नमुना प्रश्न निर्देशिका।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-nepali-grade10.pdf',
    original_filename: 'Grade10_Nepali_Curriculum_Guidelines_2083.pdf',
    file_size_bytes: 3145728,
    file_size_formatted: '3.0 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 5,
    created_at: '2026-04-20',
    updated_at: '2026-08-10'
  },
  {
    id: 6,
    title_en: 'Grade 11-12 Computer Science & ICT Practical Curriculum Manual',
    title_np: 'कक्षा ११-१२ कम्प्युटर विज्ञान तथा सूचना प्रविधि प्रयोगात्मक पाठ्यक्रम',
    subject: 'Computer Science',
    academic_level_id: 'higher_secondary_11_12',
    class_level: 'Grade 11-12',
    description_en: 'Programming in C, Python basics, Web Development (HTML/CSS/JS), Database Management (SQL), and Project work guidelines.',
    description_np: 'सी प्रोग्रामिङ, वेब विकास, डाटाबेस व्यवस्थापन (SQL) र परियोजना कार्य निर्देशिका।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-cs-grade11-12.pdf',
    original_filename: 'NEB_Grade11_12_Computer_Science_Practical_Manual.pdf',
    file_size_bytes: 4718592,
    file_size_formatted: '4.5 MB',
    mime_type: 'application/pdf',
    status: 'published',
    display_order: 6,
    created_at: '2026-04-22',
    updated_at: '2026-08-08'
  },
  {
    id: 7,
    title_en: 'Primary Level (Grade 1-5) Integrated Curriculum Draft Guideline',
    title_np: 'आधारभूत तह (कक्षा १-५) एकीकृत पाठ्यक्रम मस्यौदा निर्देशिका',
    subject: 'Integrated Curriculum',
    academic_level_id: 'primary_1_5',
    class_level: 'Grade 1-5',
    description_en: 'Internal committee review draft for integrated theme-based lessons across languages, math, and environmental studies.',
    description_np: 'आन्तरिक समिति समीक्षाको क्रममा रहेको एकीकृत पाठ्यक्रम मस्यौदा।',
    academic_year: '2083 B.S.',
    pdf_path: '/api/curriculum/file/curr-primary-draft.pdf',
    original_filename: 'Primary_Integrated_Curriculum_Draft_Review.pdf',
    file_size_bytes: 2097152,
    file_size_formatted: '2.0 MB',
    mime_type: 'application/pdf',
    status: 'unpublished',
    display_order: 7,
    created_at: '2026-05-01',
    updated_at: '2026-05-01'
  }
];

export const initialVacancies: Vacancy[] = [
  {
    id: 'vac-comp-sec-01',
    title_en: 'Secondary Level Computer Teacher',
    title_np: 'माध्यमिक तह कम्प्युटर शिक्षक',
    department: 'Science & Computer',
    employment_type: 'Full Time',
    positions_count: 1,
    academic_level: 'Secondary Level (Grade 9-12)',
    location: 'Main Academic Campus, Bhotewodar, Lamjung',
    short_description_en: "Seeking a dedicated Computer Teacher to lead Computer Science and ICT courses for secondary grades with hands-on lab practicals.",
    short_description_np: 'माध्यमिक तह (कक्षा ९-१२) का विद्यार्थीहरूलाई कम्प्युटर विज्ञान तथा सूचना प्रविधि विषय अध्यापन गराउन दक्ष शिक्षकको आवश्यकता।',
    description_en: 'Ishwari Secondary School invites applications from qualified, passionate, and energetic Nepalese educators for the post of Secondary Level Computer Science Teacher. The ideal candidate will be responsible for teaching prescribed curriculum guidelines, maintaining our high-tech multimedia computer laboratory, and mentoring students in practical technological skills.',
    description_np: 'यस श्री ईश्वरी माध्यमिक विद्यालयमा माध्यमिक तह (कक्षा ९-१२) का लागि योग्य तथा अनुभवी कम्प्युटर शिक्षक पदपूर्ति गर्नुपर्ने भएकाले योग्यता पुगेका इच्छुक नेपाली नागरिकहरूबाट रीतपूर्वक दरखास्त आह्वान गरिन्छ।',
    responsibilities: [
      'Deliver engaging classroom lectures and hands-on laboratory exercises for Grades 9 through 12 Computer Science curriculum.',
      'Maintain hardware, operating systems, and network readiness of the student computer laboratory.',
      'Administer unit examinations, practical assessments, and maintain continuous assessment records.',
      'Facilitate extracurricular coding clubs, student IT exhibitions, and digital literacy initiatives.',
      'Participate actively in staff academic meetings and institutional developmental activities.'
    ],
    qualifications: [
      'Bachelor’s Degree in Computer Science / IT (B.Sc. CSIT / BIT / BCA / B.E. Computer) or B.Ed. in ICT from an officially recognized university.',
      'Valid Secondary Level Teaching License issued by the Teachers Service Commission (TSC / शिक्षक सेवा आयोग), Nepal.',
      'Nepali citizenship with minimum age criteria as per government education regulations.'
    ],
    experience: 'Minimum 1 year of proven teaching experience in secondary level computer science or educational ICT preferred.',
    skills: [
      'Proficiency in Python programming, C basics, HTML/CSS, Web development principles, and Database concepts.',
      'Troubleshooting computer hardware, local area networks, and laboratory operating systems.',
      'Strong bilingual communication skills in English and Nepali.',
      'Patient, student-centered classroom management approach.'
    ],
    application_method: 'google_form',
    application_url: 'https://forms.gle/7vNq8xK9pLm2W3aB7',
    application_deadline: '2026-09-25',
    application_instructions: 'Please fill out the official Google Form application link before the deadline. Keep scanned digital copies of your Nepali citizenship, academic transcripts, character certificates, teaching license, and updated curriculum vitae (CV) ready for upload.',
    status: 'published',
    publish_date: '2026-09-01',
    display_order: 1,
    featured: true,
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-10T14:30:00.000Z'
  },
  {
    id: 'vac-eng-basic-02',
    title_en: 'Basic Level English Teacher',
    title_np: 'आधारभूत तह अंग्रेजी शिक्षक',
    department: 'Languages & Humanities',
    employment_type: 'Full Time',
    positions_count: 1,
    academic_level: 'Basic Level (Grade 6-8)',
    location: 'Main Academic Campus, Bhotewodar, Lamjung',
    short_description_en: 'Looking for a communicative English educator to teach middle-grade learners with child-friendly modern pedagogies.',
    short_description_np: 'आधारभूत तह (कक्षा ६-८) का लागि विद्यार्थीकेन्द्रित र व्यावहारिक पद्धतिबाट अध्यापन गराउन अंग्रेजी शिक्षकको आवश्यकता।',
    description_en: 'Applications are invited for the position of Basic Level English Teacher to guide students through grammar, comprehension, spoken communication, and literature as per the National Curriculum Framework.',
    description_np: 'आधारभूत तहका विद्यार्थीहरूको भाषिक दक्षता, व्याकरण तथा सिर्जनात्मक लेखन कला अभिवृद्धि गर्न योग्य शिक्षकबाट अनलाइन दरखास्त माग गरिन्छ।',
    responsibilities: [
      'Conduct daily classroom teaching for Grades 6-8 English curriculum.',
      'Prepare weekly lesson plans, audio-visual interactive listening exercises, and vocabulary worksheets.',
      'Organize school literary events including spelling bees, debates, and poetry recitations.',
      'Assess homework and guide learners with constructive feedback.'
    ],
    qualifications: [
      'Bachelor’s Degree with Major English (B.A. English / B.Ed. English) from a recognized university.',
      'Basic or Secondary level valid Teaching License.',
      'Sound pedagogical understanding of child psychology and communicative language teaching.'
    ],
    experience: 'Prior teaching experience in basic level or secondary schools is strongly preferred.',
    skills: [
      'High fluency in spoken and written English.',
      'Interactive phonetics and grammar teaching capabilities.',
      'Proficiency with multimedia classroom tools.'
    ],
    application_method: 'google_form',
    application_url: 'https://forms.gle/9xK2Lm5pQq4vW8yC1',
    application_deadline: '2026-10-15',
    application_instructions: 'Submit your credentials and statement of purpose via the designated Google Form link before 5:00 PM on 15 October 2026.',
    status: 'published',
    publish_date: '2026-09-05',
    display_order: 2,
    featured: false,
    created_at: '2026-09-05T09:00:00.000Z',
    updated_at: '2026-09-05T09:00:00.000Z'
  },
  {
    id: 'vac-acc-staff-03',
    title_en: 'Senior School Accountant / Finance Officer',
    title_np: 'वरिष्ठ विद्यालय लेखापाल / लेखा अधिकृत',
    department: 'Administration & Finance',
    employment_type: 'Full Time',
    positions_count: 1,
    academic_level: 'Administrative Staff',
    location: 'Administrative Block, Ishwari Secondary School',
    short_description_en: 'Experienced accountant required to manage school accounts, financial statements, and government audit reconciliations.',
    short_description_np: 'विद्यालयको आर्थिक हरहिसाब, तलबभत्ता, सरकारी लेखा प्रणाली र लेखापरीक्षण सञ्चालन गर्न अनुभवी लेखापाल आवश्यक।',
    description_en: 'Ishwari Secondary School requires a dependable, detail-oriented School Accountant to handle overall financial administration, fee collections, payroll, bank reconciliations, and regulatory compliance under community school financial bylaws.',
    description_np: 'विद्यालयको सम्पूर्ण आर्थिक कारोबार, बजेट निर्माण, खर्च विवरण, बैंक हिसाब मिलान तथा सामाजिक लेखापरीक्षण व्यवस्थापनका लागि दरखास्त आह्वान।',
    responsibilities: [
      'Maintain daily cash books, vouchers, ledgers, and bank reconciliations.',
      'Prepare quarterly and annual balance sheets and expenditure statements for the SMC and Local Government Education Section.',
      'Process monthly staff payroll and provident fund contributions.',
      'Facilitate external statutory and social audits.'
    ],
    qualifications: [
      'Bachelor’s Degree in Business Studies (BBS), BBA, or equivalent with Accountancy/Finance major.',
      'Good understanding of Nepalese community school financial rules and tax guidelines.'
    ],
    experience: 'Minimum 2 years of bookkeeping experience in educational institutions or reputable organizations.',
    skills: [
      'Expertise in Tally ERP, Swastik or modern accounting software packages.',
      'Advanced skills in Microsoft Excel and data entry.',
      'Fluent in Devnagari typing (Preeti / Unicode) and English documentation.'
    ],
    application_method: 'google_form',
    application_url: 'https://forms.gle/3mKp8xV2yZ1wQ4uD9',
    application_deadline: '2026-09-30',
    application_instructions: 'Complete the Google Form with personal details, educational documents, work experience certificates, and reference contacts.',
    status: 'published',
    publish_date: '2026-09-08',
    display_order: 3,
    featured: false,
    created_at: '2026-09-08T11:00:00.000Z',
    updated_at: '2026-09-08T11:00:00.000Z'
  }
];




