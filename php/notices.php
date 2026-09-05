<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';

$notices = [
    [
        'title_en' => 'Annual Examination Routine (Grades 1 to 9) Published for Session 2083',
        'title_np' => 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका प्रकाशित गरिएको सम्बन्धमा',
        'date' => 'Bhadra 18, 2083',
        'category' => 'EXAM',
        'file' => 'routine_2083.pdf'
    ],
    [
        'title_en' => 'Grade 11 Admission Open for Science & Management Streams',
        'title_np' => 'कक्षा ११ विज्ञान तथा व्यवस्थापन संकायमा नयाँ भर्ना खुला',
        'date' => 'Bhadra 15, 2083',
        'category' => 'ACADEMIC',
        'file' => 'grade11_admission.pdf'
    ]
];
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Official Notices & Circulars', 'आधिकारिक सूचना पाटी') ?></h1>
    <div class="space-y-4 text-xs">
        <?php foreach ($notices as $n): ?>
            <div class="p-5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div class="flex items-center justify-between text-slate-500">
                    <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold uppercase"><?= $n['category'] ?></span>
                    <span><?= $n['date'] ?></span>
                </div>
                <h2 class="text-sm font-bold text-slate-900 dark:text-white"><?= t($n['title_en'], $n['title_np']) ?></h2>
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <a href="#" onclick="alert('Downloading: <?= $n['file'] ?>'); return false;" class="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                        <?= t('Download Document', 'डाउनलोड गर्नुहोस्') ?> (PDF)
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
