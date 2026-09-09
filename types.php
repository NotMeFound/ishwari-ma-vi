<?php
declare(strict_types=1);

namespace App\Types;

enum Language: string {
    case EN = 'en';
    case NP = 'np';

    public function label(): string {
        return match($this) {
            self::EN => 'English',
            self::NP => 'नेपाली',
        };
    }
}

enum ThemeMode: string {
    case LIGHT = 'light';
    case DARK = 'dark';
}

enum NoticeCategory: string {
    case ALL = 'all';
    case ACADEMIC = 'academic';
    case EXAM = 'exam';
    case ADMIN = 'admin';
    case EVENT = 'event';
    case SCHOLARSHIP = 'scholarship';

    public function label(Language $lang = Language::EN): string {
        return match($this) {
            self::ALL => $lang === Language::NP ? 'सबै' : 'All',
            self::ACADEMIC => $lang === Language::NP ? 'शैक्षिक' : 'Academic',
            self::EXAM => $lang === Language::NP ? 'परीक्षा' : 'Examination',
            self::ADMIN => $lang === Language::NP ? 'प्रशासनिक' : 'Administrative',
            self::EVENT => $lang === Language::NP ? 'कार्यक्रम' : 'Events',
            self::SCHOLARSHIP => $lang === Language::NP ? 'छात्रवृत्ति' : 'Scholarship',
        };
    }
}

enum StaffRole: string {
    case PRINCIPAL = 'principal';
    case TEACHER = 'teacher';
    case ADMIN = 'admin';
    case SUPPORT = 'support';

    public function label(Language $lang = Language::EN): string {
        return match($this) {
            self::PRINCIPAL => $lang === Language::NP ? 'प्रधानाध्यापक' : 'Principal',
            self::TEACHER => $lang === Language::NP ? 'शिक्षक' : 'Teacher',
            self::ADMIN => $lang === Language::NP ? 'प्रशासनिक कर्मचारी' : 'Administrative Staff',
            self::SUPPORT => $lang === Language::NP ? 'सहयोगी कर्मचारी' : 'Support Staff',
        };
    }
}

class SchoolInfo {
    public function __construct(
        public string $nameEn,
        public string $nameNp,
        public string $affiliationEn,
        public string $affiliationNp,
        public string $code,
        public string $establishedBs,
        public string $addressEn,
        public string $addressNp,
        public string $phone,
        public string $email,
        public string $principalEn,
        public string $principalNp
    ) {}
}
