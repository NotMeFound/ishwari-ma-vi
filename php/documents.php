<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/header.php';
?>
<div class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 class="text-2xl font-bold"><?= t('Citizen Charter & Official Documents', 'नागरिक बडापत्र तथा कागजातहरू') ?></h1>
    <div class="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded text-xs">
        <div class="p-4 flex items-center justify-between">
            <div>
                <p class="font-bold text-sm">Citizen Charter (नागरिक बडापत्र)</p>
                <p class="text-slate-400">PDF • 1.8 MB</p>
            </div>
            <a href="#" onclick="alert('Downloading Citizen Charter'); return false;" class="text-amber-600 font-semibold hover:underline">Download</a>
        </div>
        <div class="p-4 flex items-center justify-between">
            <div>
                <p class="font-bold text-sm">Admission Application Form (कक्षा ११ भर्ना फारम)</p>
                <p class="text-slate-400">PDF • 640 KB</p>
            </div>
            <a href="#" onclick="alert('Downloading Admission Form'); return false;" class="text-amber-600 font-semibold hover:underline">Download</a>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
