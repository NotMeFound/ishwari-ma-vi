<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<section class="bg-slate-900 text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span class="inline-block px-3 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <?= t('EXCELLENCE IN PUBLIC PEDAGOGY', 'गुणस्तरीय सामुदायिक शिक्षाको आधार') ?>
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white">
            <?= t('Empowering Students. Building Tomorrow.', 'विद्यार्थी सशक्तिकरण, समुन्नत भविष्य निर्माण।') ?>
        </h1>
        <p class="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            <?= t('Providing high-standard government secondary education from Early Childhood Development through Grade 12 (+2 Science & Management) since 2035 B.S.', 'वि.सं. २०३५ देखि गुणस्तरीय तथा जीवनोपयोगी शिक्षा प्रदान गर्दै आइरहेको अग्रणी नमुना विद्यालय।') ?>
        </p>
        <div class="flex gap-3 pt-2">
            <a href="notices.php" class="px-4 py-2 rounded bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition">
                <?= t('View Notices', 'सूचनाहरू हेर्नुहोस्') ?> →
            </a>
            <a href="about.php" class="px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 font-semibold text-xs hover:bg-slate-700 transition">
                <?= t('About School', 'हाम्रो बारेमा') ?>
            </a>
        </div>
    </div>
</section>

<!-- Stats Strip -->
<section class="py-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">1,240+</div>
            <div class="text-xs text-slate-500"><?= t('Students', 'विद्यार्थी') ?></div>
        </div>
        <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">52</div>
            <div class="text-xs text-slate-500"><?= t('Faculty Members', 'शिक्षक तथा कर्मचारी') ?></div>
        </div>
        <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">48</div>
            <div class="text-xs text-slate-500"><?= t('Glorious Years', 'वर्षको गौरवमय इतिहास') ?></div>
        </div>
        <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div class="text-xs text-slate-500"><?= t('SEE Success Rate', 'एसईई सफलता') ?></div>
        </div>
    </div>
</section>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
