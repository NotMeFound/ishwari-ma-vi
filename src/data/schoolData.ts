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
  SecurityAuditLogEntry
} from '../types';

export const initialSchoolData: SchoolData = {
  name_en: "Ishwari Secondary School",
  name_np: "ईश्वरी माध्यमिक विद्यालय",
  tagline_en: "Center for Academic Excellence & Character Building",
  tagline_np: "शैक्षिक उत्कृष्टता र चरित्र निर्माणको अग्रणी केन्द्र",
  affiliation_en: "Government of Nepal Model Secondary School",
  affiliation_np: "नेपाल सरकार नमुना माध्यमिक विद्यालय",
  code: "EMIS: 48012004",
  estd_bs: "2026 B.S.",
  estd_ad: "1978 A.D.",
  phone: "+977-01-5542109 / 9851234567",
  email: "info@ishwari.edu.np",
  address_en: "Ward No. 6, H Gaun Baijanath Municipality-Banke, Nepal",
  address_np: "वडा नं. ६, एच गाउँ, बैजनाथ गाउँपालिका-बाँके, नेपाल",
  principal_name_en: "Mr. Mangal Khatri",
  principal_name_np: "श्री मङ्गल खत्री)",
  principal_message_en: "Welcome to Ishwari Secondary School. For over four decades, our institution has stood as a beacon of public education, blending academic rigor with compassionate moral values. We are committed to fostering critical inquiry, digital literacy, and community leadership in every student.",
  principal_message_np: "ईश्वरी माध्यमिक विद्यालयको आधिकारिक डिजिटल पोर्टलमा यहाँहरूलाई हार्दिक स्वागत छ। वि.सं. २०२६ सालदेखि यस भेगकै अग्रणी सामुदायिक नमुना विद्यालयको रूपमा हामीले विद्यार्थीहरूको चौतर्फी विकासमा जोड दिँदै आएका छौं।"
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
    name_en: "Mr. Mangal Khatri",
    name_np: "श्री मङ्गल खत्री)",
    role: "principal",
    designation_en: "Headmaster / Principal (M.Ed, M.A.)",
    designation_np: "प्रधानाध्यापक (एम.एड, एम.ए.)",
    experience: "26 Years in Educational Leadership"
  },
  {
    id: 2,
    name_en: "Mrs. Bhim Bahadur Khatri",
    name_np: "श्री भीम बहादुर खत्री",
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
    year: "2035 B.S. (1978 A.D.)",
    title_en: "Founding as Community Primary School",
    title_np: "प्राथमिक विद्यालयको रूपमा स्थापना",
    desc_en: "Inaugurated through community patronage to provide accessible education to rural youths.",
    desc_np: "स्थानीय शिक्षाप्रेमीहरूको सक्रियतामा स्थापना।"
  },
  {
    year: "2052 B.S. (1995 A.D.)",
    title_en: "Upgraded to Secondary High School (SLC / Class 10)",
    title_np: "माध्यमिक तह (कक्षा १०) मा स्तरोन्नति",
    desc_en: "Authorized by Ministry of Education to conduct SLC board examinations.",
    desc_np: "पहिलो पटक एसएलसी परीक्षामा सहभागिता।"
  },
  {
    year: "2068 B.S. (2011 A.D.)",
    title_en: "Higher Secondary (+2) Science & Management Inaugurated",
    title_np: "उच्च माध्यमिक (+२) विज्ञान तथा व्यवस्थापन संकाय सुरु",
    desc_en: "Expanded into high school streams with science laboratories.",
    desc_np: "कक्षा ११ र १२ का कक्षाहरू सञ्चालन।"
  },
  {
    year: "2076 B.S. (2019 A.D.)",
    title_en: "Designated as Government of Nepal Model School (नमुना विद्यालय)",
    title_np: "नेपाल सरकारबाट 'नमुना विद्यालय' घोषणा",
    desc_en: "Selected under the National Model School Infrastructure Development Masterplan.",
    desc_np: "अत्याधुनिक भौतिक पूर्वाधार तथा डिजिटल सिकाइ प्रविधि विस्तार।"
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
  showAlertTicker: true,
  alertTickerEn: 'Annual Examination Routine (Grades 1 to 9) Published for Session 2083',
  alertTickerNp: 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका (कक्षा १ देखि ९ सम्म) प्रकाशित गरिएको बारे',
  heroBadgeEn: 'GOVERNMENT OF NEPAL MODEL SECONDARY SCHOOL',
  heroBadgeNp: 'नेपाल सरकार नमुना माध्यमिक विद्यालय',
  heroTitleEn: 'Cultivating Academic Excellence & Responsible Citizens Since 2035 B.S.',
  heroTitleNp: 'शैक्षिक उत्कृष्टता र नैतिक चरित्र निर्माणको चार दशक लामो यात्रा।',
  heroSubtitleEn: 'A premier community educational institution offering experiential STEM pedagogy, digital classrooms, high-standard laboratories, and holistic secondary and higher secondary education.',
  heroSubtitleNp: 'अनुभवी शिक्षक, आधुनिक विज्ञान तथा कम्प्युटर प्रयोगशाला र डिजिटल स्मार्ट कक्षाकोठाका माध्यमबाट विद्यार्थीहरूको चौतर्फी विकासमा समर्पित।',
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
  }
};

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


