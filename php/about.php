<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('About Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालयको बारेमा') ?></h1>
    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <?= t('Established in 2035 B.S., Ishwari Secondary School serves as a premier government model school dedicated to academic discipline, scientific inquiry, and civic contribution.', 'वि.सं. २०३५ मा स्थापित यो विद्यालय नेपाल सरकारको नमुना विद्यालयको रूपमा समग्र शैक्षिक विकासमा समर्पित छ।') ?>
    </p>
    <div class="p-4 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <h2 class="font-bold text-sm"><?= t('School Management Committee (SMC)', 'विद्यालय व्यवस्थापन समिति') ?></h2>
        <p><?= t('Led by local community leaders, the SMC guides institutional governance and educational equity.', 'समुदाय र विद्यालय प्रशासनको सहकार्यमा नीतिगत तथा शैक्षिक सुधारका कार्यहरू।') ?></p>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
