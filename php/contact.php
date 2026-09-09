<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Contact School Administration', 'विद्यालय प्रशासनसँग सम्पर्क') ?></h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div class="p-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
            <h2 class="font-bold text-sm"><?= t('Institutional Details', 'सम्पर्क ठेगाना') ?></h2>
            <p>📍 <?= t('Ward No. 4, Nepal', 'वडा नं. ४, नेपाल') ?></p>
            <p>📞 +977-01-5542109 / 9851234567</p>
            <p>✉️ info@ishwari.edu.np</p>
            <p>🕒 <?= t('Sun - Fri: 9:30 AM – 4:30 PM', 'आइतबार - शुक्रबार: बिहान ९:३० - अपराह्न ४:३०') ?></p>
        </div>
        <div class="p-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h2 class="font-bold text-sm"><?= t('Inquiry Form', 'सोधपुछ फारम') ?></h2>
            <input type="text" placeholder="<?= t('Your Name', 'तपाईंको नाम') ?>" class="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <input type="email" placeholder="<?= t('Your Email', 'इमेल ठेगाना') ?>" class="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <textarea placeholder="<?= t('Message', 'सन्देश') ?>" rows="3" class="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"></textarea>
            <button type="button" onclick="alert('Inquiry sent successfully');" class="px-4 py-2 rounded font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                <?= t('Submit Inquiry', 'पठाउनुहोस्') ?>
            </button>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
