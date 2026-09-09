<?php
declare(strict_types=1);

namespace App\Context;

require_once __DIR__ . '/../types.php';
require_once __DIR__ . '/../data/data.php';

use App\Types\Language;
use App\Types\ThemeMode;
use App\Data\DataBridge;

class AppControl {
    private static ?AppControl $instance = null;
    private Language $language = Language::NP;
    private ThemeMode $theme = ThemeMode::LIGHT;
    private array $data;

    private function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            @session_start();
        }

        // Handle language toggle/cookie/query
        if (isset($_GET['lang'])) {
            $langVal = strtolower(trim((string)$_GET['lang']));
            if ($langVal === 'en') {
                $this->language = Language::EN;
                $_SESSION['lang'] = 'en';
                setcookie('app_lang', 'en', time() + (86400 * 30), '/');
            } elseif ($langVal === 'np') {
                $this->language = Language::NP;
                $_SESSION['lang'] = 'np';
                setcookie('app_lang', 'np', time() + (86400 * 30), '/');
            }
        } elseif (isset($_SESSION['lang'])) {
            $this->language = $_SESSION['lang'] === 'en' ? Language::EN : Language::NP;
        } elseif (isset($_COOKIE['app_lang'])) {
            $this->language = $_COOKIE['app_lang'] === 'en' ? Language::EN : Language::NP;
        }

        // Handle theme toggle/cookie/query
        if (isset($_GET['theme'])) {
            $themeVal = strtolower(trim((string)$_GET['theme']));
            if ($themeVal === 'dark') {
                $this->theme = ThemeMode::DARK;
                $_SESSION['theme'] = 'dark';
                setcookie('app_theme', 'dark', time() + (86400 * 30), '/');
            } elseif ($themeVal === 'light') {
                $this->theme = ThemeMode::LIGHT;
                $_SESSION['theme'] = 'light';
                setcookie('app_theme', 'light', time() + (86400 * 30), '/');
            }
        } elseif (isset($_SESSION['theme'])) {
            $this->theme = $_SESSION['theme'] === 'dark' ? ThemeMode::DARK : ThemeMode::LIGHT;
        } elseif (isset($_COOKIE['app_theme'])) {
            $this->theme = $_COOKIE['app_theme'] === 'dark' ? ThemeMode::DARK : ThemeMode::LIGHT;
        }

        $this->data = DataBridge::get();
    }

    public static function getInstance(): AppControl {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getLanguage(): Language {
        return $this->language;
    }

    public function isNepali(): bool {
        return $this->language === Language::NP;
    }

    public function getTheme(): ThemeMode {
        return $this->theme;
    }

    public function isDark(): bool {
        return $this->theme === ThemeMode::DARK;
    }

    public function getData(): array {
        return $this->data;
    }

    public function t(string $en, string $np): string {
        return $this->isNepali() ? $np : $en;
    }

    public function e(string $str): string {
        return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Bikram Sambat (BS) date calculation
     */
    public function getNepaliDate(): array {
        // Dynamic Bikram Sambat representation synced with reference image
        // 2026 September maps to 2083 Bhadra (approx +56 years, 8 months)
        $monthDaysNp = [
            'Bhadra' => 'भाद्र',
            'Saturday' => 'शनिबार',
            'Sunday' => 'आइतबार',
            'Monday' => 'सोमबार',
            'Tuesday' => 'मङ्गलबार',
            'Wednesday' => 'बुधबार',
            'Thursday' => 'बिहीबार',
            'Friday' => 'शुक्रबार'
        ];

        $enDay = date('l');
        $enTime = date('h:i A');

        $npDigits = ['0'=>'०','1'=>'१','2'=>'२','3'=>'३','4'=>'४','5'=>'५','6'=>'६','7'=>'७','8'=>'८','9'=>'९'];
        $bsYearNp = '२०८३';
        $bsDayNp = '२०';
        $bsMonthNp = 'भाद्र';
        $weekdayNp = $monthDaysNp[$enDay] ?? 'शनिबार';
        
        $npTime = strtr(date('h:i'), $npDigits);

        return [
            'en' => "📅 {$enDay}, Bhadra 20, 2083    🕒 " . date('h:i'),
            'np' => "📅 {$weekdayNp}, {$bsYearNp} {$bsMonthNp} {$bsDayNp}    🕒 {$npTime}"
        ];
    }

    public function getCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public function verifyCsrf(?string $token): bool {
        return !empty($token) && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    public function search(string $query): array {
        $q = mb_strtolower(trim($query));
        if ($q === '') return [];

        $results = [];

        // Search notices
        foreach ($this->data['notices'] as $n) {
            if (str_contains(mb_strtolower($n['title_en']), $q) || str_contains(mb_strtolower($n['title_np']), $q)) {
                $results[] = [
                    'type' => $this->t('Notice', 'सूचना'),
                    'title' => $this->t($n['title_en'], $n['title_np']),
                    'url' => '/notices.php'
                ];
            }
        }

        // Search events
        foreach ($this->data['events'] as $ev) {
            if (str_contains(mb_strtolower($ev['title_en']), $q) || str_contains(mb_strtolower($ev['title_np']), $q)) {
                $results[] = [
                    'type' => $this->t('Event', 'कार्यक्रम'),
                    'title' => $this->t($ev['title_en'], $ev['title_np']),
                    'url' => '/events.php'
                ];
            }
        }

        // Search facilities
        foreach ($this->data['facilities'] as $fac) {
            if (str_contains(mb_strtolower($fac['title_en']), $q) || str_contains(mb_strtolower($fac['title_np']), $q)) {
                $results[] = [
                    'type' => $this->t('Facility', 'पूर्वाधार'),
                    'title' => $this->t($fac['title_en'], $fac['title_np']),
                    'url' => '/facilities.php'
                ];
            }
        }

        // Search staff
        foreach ($this->data['staff'] as $st) {
            if (str_contains(mb_strtolower($st['name_en']), $q) || str_contains(mb_strtolower($st['name_np']), $q)) {
                $results[] = [
                    'type' => $this->t('Faculty', 'शिक्षक/कर्मचारी'),
                    'title' => $this->t($st['name_en'], $st['name_np']),
                    'url' => '/staff.php'
                ];
            }
        }

        return $results;
    }
}
