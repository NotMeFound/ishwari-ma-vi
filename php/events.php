<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Events & Activities Calendar', 'वार्षिक कार्यक्रम क्यालेन्डर') ?></h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
            <span class="text-amber-600 font-bold">📅 Aswin 02, 2083 • 10:00 AM</span>
            <h2 class="font-bold text-sm"><?= t('District Science & Innovation Olympiad', 'जिल्लास्तरीय विज्ञान प्रदर्शनी') ?></h2>
            <p class="text-slate-500"><?= t('Venue: Ishwari Multipurpose Hall', 'स्थान: ईश्वरी बहुउद्देश्यीय हल') ?></p>
        </div>
        <div class="p-5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
            <span class="text-amber-600 font-bold">📅 Kartik 14, 2083 • 08:30 AM</span>
            <h2 class="font-bold text-sm"><?= t('Annual Athletic Championships', 'वार्षिक खेलकुद प्रतियोगिता') ?></h2>
            <p class="text-slate-500"><?= t('Venue: School Sports Ground', 'स्थान: विद्यालय खेल मैदान') ?></p>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
