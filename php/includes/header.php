<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';

$isNp = isNp();
$isDark = ($_SESSION['theme'] ?? $_COOKIE['theme'] ?? 'light') === 'dark';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="<?= $isNp ? 'ne' : 'en' ?>" class="<?= $isDark ? 'dark' : '' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= t(SITE_NAME_EN, SITE_NAME_NP) ?> | Official Government Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script>
        tailwind.config = { darkMode: 'class' };
    </script>
</head>
<body class="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased">
    <!-- Top Utility Bar -->
    <header class="w-full bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-wrap items-center justify-between py-2 border-b border-slate-800 text-xs gap-3">
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-slate-950 uppercase">
                        <?= t('Notice', 'ताजा सूचना') ?>
                    </span>
                    <a href="notices.php" class="text-slate-300 hover:text-white truncate max-w-xs sm:max-w-md">
                        <?= t('Annual Examination Routine (Grades 1 to 9) Published for Session 2083', 'वार्षिक परीक्षा तालिका प्रकाशित गरिएको सम्बन्धमा') ?>
                    </a>
                </div>

                <div class="flex items-center space-x-3 shrink-0">
                    <!-- Live Bikram Sambat Date & Time Widget -->
                    <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                        <span id="live-bs-date">📅 Saturday, Bhadra 20, 2083    🕒 09:06</span>
                    </div>

                    <!-- Neumorphic Sliding Language Toggle (Flag-only) -->
                    <a href="?lang=<?= $isNp ? 'en' : 'np' ?>" class="relative inline-flex items-center h-7 w-14 rounded-full p-0.5 bg-slate-800 border border-slate-700 shadow-inner" role="button">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full z-10 <?= !$isNp ? 'opacity-100' : 'opacity-40' ?>">
                            <svg class="w-4 h-4 rounded-full" viewBox="0 0 32 32"><clipPath id="uk-p"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#uk-p)"><rect width="32" height="32" fill="#012169"/><path d="M0 0L32 32M32 0L0 32" stroke="#FFFFFF" stroke-width="4.5"/><path d="M0 0L32 32M32 0L0 32" stroke="#C8102E" stroke-width="2.2"/><path d="M16 0V32M0 16H32" stroke="#FFFFFF" stroke-width="7.5"/><path d="M16 0V32M0 16H32" stroke="#C8102E" stroke-width="4.5"/></g></svg>
                        </span>
                        <span class="w-6 h-6 flex items-center justify-center rounded-full z-10 <?= $isNp ? 'opacity-100' : 'opacity-40' ?>">
                            <svg class="w-4 h-4 rounded-full" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#003893"/><path d="M7 5L24 16L12 16L25 27H7V5Z" fill="#DC143C"/><circle cx="13" cy="12" r="3" fill="#FFFFFF"/><circle cx="13" cy="22" r="3.5" fill="#FFFFFF"/></svg>
                        </span>
                        <span class="absolute top-0.5 <?= $isNp ? 'left-[29px]' : 'left-0.5' ?> w-6 h-6 rounded-full bg-amber-500 shadow transition-all duration-300"></span>
                    </a>

                    <!-- Minimalist Flat Theme Switcher -->
                    <a href="?theme=<?= $isDark ? 'light' : 'dark' ?>" class="relative inline-flex items-center h-7 w-13 rounded-full p-0.5 bg-slate-800 border border-slate-700">
                        <span class="inline-block w-5 h-5 rounded-full bg-white shadow transform transition <?= $isDark ? 'translate-x-6' : 'translate-x-0' ?>"></span>
                    </a>

                    <!-- Admin Portal Link -->
                    <a href="admin/login.php" class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700">
                        <span>🔒 <?= t('Admin', 'प्रशासन') ?></span>
                    </a>
                </div>
            </div>

            <!-- Identity Bar -->
            <div class="py-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <a href="index.php" class="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                        ई
                    </a>
                    <div>
                        <span class="text-[10px] text-amber-400 font-semibold tracking-wider uppercase"><?= t('Government of Nepal Model School', 'नेपाल सरकार नमुना विद्यालय') ?></span>
                        <h1 class="text-xl font-bold text-white"><a href="index.php"><?= t(SITE_NAME_EN, SITE_NAME_NP) ?></a></h1>
                    </div>
                </div>
            </div>
        </div>

        <!-- Primary Navigation Grid -->
        <nav class="border-t border-slate-800 bg-slate-900/90">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center space-x-1 h-10 overflow-x-auto no-scrollbar text-xs">
                    <?php
                    $links = [
                        'index' => ['Home', 'गृहपृष्ठ'],
                        'about' => ['About', 'हाम्रो बारेमा'],
                        'academics' => ['Academics', 'शैक्षिक कार्यक्रम'],
                        'facilities' => ['Facilities', 'पूर्वाधार'],
                        'staff' => ['Faculty', 'शिक्षक'],
                        'notices' => ['Notices', 'सूचना पाटी'],
                        'events' => ['Events', 'कार्यक्रम'],
                        'achievements' => ['Achievements', 'उपलब्धि'],
                        'history' => ['History', 'इतिहास'],
                        'documents' => ['Documents', 'कागजात'],
                        'gallery' => ['Gallery', 'तस्बिर'],
                        'contact' => ['Contact', 'सम्पर्क'],
                    ];
                    foreach ($links as $file => $labels) {
                        $active = ($currentPage === $file);
                        echo '<a href="' . $file . '.php" class="px-3 py-1.5 rounded transition whitespace-nowrap ' . ($active ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800') . '">' . t($labels[0], $labels[1]) . '</a>';
                    }
                    ?>
                </div>
            </div>
        </nav>
    </header>
    <main class="flex-grow">
