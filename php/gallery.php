<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Photo Gallery', 'फोटो ग्यालरी') ?></h1>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-2">
            <div class="text-4xl py-6">🔬</div>
            <p class="font-bold"><?= t('Science Laboratory Session', 'विज्ञान प्रयोगशाला') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-2">
            <div class="text-4xl py-6">🏐</div>
            <p class="font-bold"><?= t('Inter-House Sports Meet', 'अन्तर-सदन खेलकुद') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-2">
            <div class="text-4xl py-6">💻</div>
            <p class="font-bold"><?= t('Computer Center & ICT', 'कम्प्युटर ल्याब') ?></p>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
