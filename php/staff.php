<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';

$staff = [
    ['name_en' => 'Mr. Narayan Prasad Koirala', 'name_np' => 'श्री नारायण प्रसाद कोइराला', 'role' => 'Headmaster (M.Ed, M.A.)', 'role_np' => 'प्रधानाध्यापक', 'exp' => '26 Years'],
    ['name_en' => 'Mrs. Sharada Devi Sharma', 'name_np' => 'श्रीमती शारदा देवी शर्मा', 'role' => 'Senior Science Lead (M.Sc)', 'role_np' => 'वरिष्ठ विज्ञान शिक्षक', 'exp' => '18 Years'],
    ['name_en' => 'Mr. Rameshwor Gautam', 'name_np' => 'श्री रामेश्वर गौतम', 'role' => 'Mathematics Department Head', 'role_np' => 'गणित विभाग प्रमुख', 'exp' => '21 Years'],
    ['name_en' => 'Ms. Binita Thapa', 'name_np' => 'सुश्री बिनिता थापा', 'role' => 'ICT & Computer Instructor (B.Sc CSIT)', 'role_np' => 'कम्प्युटर शिक्षक', 'exp' => '8 Years'],
];
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Faculty & Staff Directory', 'शिक्षक तथा कर्मचारी विवरण') ?></h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <?php foreach ($staff as $s): ?>
            <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-2">
                <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto flex items-center justify-center text-2xl">
                    👨‍🏫
                </div>
                <h2 class="font-bold text-sm text-slate-900 dark:text-white"><?= t($s['name_en'], $s['name_np']) ?></h2>
                <p class="text-amber-600 dark:text-amber-400"><?= t($s['role'], $s['role_np']) ?></p>
                <p class="text-slate-400 text-[11px]"><?= $s['exp'] ?></p>
            </div>
        <?php endforeach; ?>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
