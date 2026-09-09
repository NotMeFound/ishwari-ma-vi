<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Campus Facilities & Infrastructure', 'विद्यालयका भौतिक पूर्वाधारहरू') ?></h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">🧪 <?= t('Modern Science Laboratories', 'अत्याधुनिक विज्ञान प्रयोगशाला') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('Physics, Chemistry, and Biology practical equipment meeting NEB standards.', 'भौतिकशास्त्र, रसायनशास्त्र र जीवविज्ञानका प्रयोगात्मक सामग्रीहरू।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">💻 <?= t('ICT & Computer Center', 'कम्प्युटर तथा सूचना प्रविधि केन्द्र') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('High-speed broadband, individual terminals, and digital interactive projectors.', 'इन्टरनेट सुविधा सहितको कम्प्युटर ल्याब।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">📚 <?= t('Institutional Library & E-Pustakalaya', 'पुस्तकालय तथा इ-पुस्तकालय') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('Over 6,500 reference texts and open-source educational portals.', 'हजारौं पुस्तक तथा डिजिटल सामग्रीहरू।') ?></p>
        </div>
        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <h2 class="font-bold text-sm">🏐 <?= t('Athletics & Sports Ground', 'खेलकुद मैदान') ?></h2>
            <p class="mt-1 text-slate-500"><?= t('Volleyball court, table tennis, badminton, and track facilities.', 'भलिबल, टेबलटेनिस र एथलेटिक्स मैदान।') ?></p>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
