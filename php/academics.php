<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Academic Curriculum & Programs', 'शैक्षिक तह तथा पाठ्यक्रम') ?></h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">👶 <?= t('Early Childhood Development (ECD)', 'प्रारम्भिक बाल विकास') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('Play-based foundational learning for young minds.', 'बालमैत्री तथा खेलमा आधारित सिकाइ।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">📖 <?= t('Basic Level (Grades 1 to 8)', 'आधारभूत तह (कक्षा १ - ८)') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('National CDC curriculum with Continuous Assessment System (CAS).', 'पाठ्यक्रम विकास केन्द्रको मापदण्ड बमोजिम।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">🎓 <?= t('Secondary Level (Grades 9 & 10)', 'माध्यमिक तह (कक्षा ९ - १० / SEE)') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('Preparatory coaching for national SEE board examination.', 'एसईई परीक्षाको लागि विशेष तयारी कक्षाहरू।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">🔬 <?= t('Higher Secondary (+2 Science & Management)', 'उच्च माध्यमिक (+२ विज्ञान र व्यवस्थापन)') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('National Examination Board (NEB) affiliated streams with full laboratory access.', 'अत्याधुनिक प्रयोगशाला सहितको +२ अध्यापन।') ?></p>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
