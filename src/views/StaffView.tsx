import React, { useState } from 'react';
import { Language, StaffMember } from '../types';
import {
  Users,
  GraduationCap,
  Award,
  User,
  ShieldCheck,
  Search,
  Briefcase
} from 'lucide-react';

interface StaffViewProps {
  lang: Language;
  staff: StaffMember[];
}

export const StaffView: React.FC<StaffViewProps> = ({ lang, staff }) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const filteredStaff = roleFilter === 'all'
    ? staff
    : staff.filter(s => s.role === roleFilter);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
              <Users className="w-3.5 h-3.5" />
              <span>{t('Faculty & Administration Directory', 'शिक्षक तथा कर्मचारी विवरण')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Our Leadership & Educators', 'हाम्रा शिक्षक तथा नेतृत्व')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {t(
                'Meet our experienced and dedicated team of certified education officers, department heads, and instructors shaping young minds.',
                'दक्ष, अनुभवी र समर्पित शिक्षक तथा प्रशासनिक कर्मचारीहरूको नेतृत्वमा अनुशासित शैक्षिक यात्रा।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', en: 'All Members', np: 'सबै' },
              { id: 'principal', en: 'Principal', np: 'प्रधानाध्यापक' },
              { id: 'teacher', en: 'Faculty', np: 'शिक्षक' },
              { id: 'admin', en: 'Administration', np: 'प्रशासन' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  roleFilter === tab.id
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(tab.en, tab.np)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-4 shadow-2xs hover:border-[#1E40AF]/40 transition group"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-[#1E40AF] flex items-center justify-center text-[#1E40AF] shadow-sm group-hover:scale-105 transition">
                {member.role === 'principal' ? (
                  <GraduationCap className="w-10 h-10" />
                ) : member.role === 'admin' ? (
                  <ShieldCheck className="w-10 h-10" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t(member.name_en, member.name_np)}
                </h2>
                <p className="text-xs font-semibold text-[#1E40AF] mt-1">
                  {t(member.designation_en, member.designation_np)}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>{member.experience}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
