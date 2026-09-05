import React from 'react';
import { Language, SchoolData } from '../types';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  lang: Language;
  school: SchoolData;
  onRouteChange: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, school, onRouteChange }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-8 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#1E40AF]/20">
                ई
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{t(school.name_en, school.name_np)}</h3>
                <p className="text-[11px] text-blue-400 font-medium">{t(school.affiliation_en, school.affiliation_np)}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t(
                'Committed to excellence, integrity, and social responsibility in public secondary education since 2035 B.S.',
                'वि.सं. २०३५ देखि गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको अग्रणी नमुना सामुदायिक विद्यालय।'
              )}
            </p>
          </div>

          {/* Col 2: Academic Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>{t('Academic Streams', 'शैक्षिक कार्यक्रम')}</span>
            </h4>
            <ul className="space-y-2">
              {[
                { en: 'Basic Education (Grades 1 to 8)', np: 'आधारभूत तह (कक्षा १ - ८)' },
                { en: 'Secondary School (SEE / Grades 9 - 10)', np: 'माध्यमिक तह (कक्षा ९ - १०)' },
                { en: 'Higher Secondary (+2 Science Stream)', np: '+२ विज्ञान संकाय' },
                { en: 'Higher Secondary (+2 Management)', np: '+२ व्यवस्थापन संकाय' },
                { en: 'Higher Secondary (+2 Education)', np: '+२ शिक्षाशास्त्र संकाय' },
              ].map((prog, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => onRouteChange('academics')}
                    className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                    <span>{t(prog.en, prog.np)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Institutional Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              {t('Quick Access', 'छिटो पहुँच')}
            </h4>
            <ul className="space-y-2">
              {[
                { id: 'notices', en: 'Circulars & Public Notices', np: 'सार्वजनिक सूचना पाटी' },
                { id: 'documents', en: 'Citizen Charter & Downloads', np: 'नागरिक वडापत्र तथा फारम' },
                { id: 'facilities', en: 'Laboratories & Infrastructure', np: 'प्रयोगशाला तथा पूर्वाधार' },
                { id: 'staff', en: 'Faculty Directory', np: 'शिक्षक तथा कर्मचारी विवरण' },
                { id: 'contact', en: 'Inquiry & Helpdesk', np: 'सम्पर्क तथा सोधपुछ' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onRouteChange(link.id)}
                    className="hover:text-blue-400 transition flex items-center gap-1.5 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                    <span>{t(link.en, link.np)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Coordinates */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              {t('Official Coordinates', 'सम्पर्क ठेगाना')}
            </h4>
            <p className="text-slate-300 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{t(school.address_en, school.address_np)}</span>
            </p>
            <p className="text-slate-300 font-mono flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{school.phone}</span>
            </p>
            <p className="text-slate-300 font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{school.email}</span>
            </p>
            <div className="pt-2 text-slate-400 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('Office Hours: Sunday - Friday', 'कार्यालय समय: आइतबार - शुक्रबार')}</span>
              </div>
              <p className="pl-5 text-slate-400">{t('9:30 AM – 4:30 PM (Regular Routine)', 'बिहान ९:३० - अपराह्न ४:३०')}</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line - English only with institutional credentials */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>
            © {new Date().getFullYear()} {school.name_en}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
            <span>EMIS Code: {school.code}</span>
            <span>•</span>
            <span>Government Model Secondary School</span>
            <span>•</span>
            <span>Estd. {school.estd_bs} B.S. ({school.estd_ad} A.D.)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
