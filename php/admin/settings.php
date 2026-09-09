<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

if (empty($_SESSION['is_admin'])) {
    header('Location: login.php');
    exit;
}

$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $msg = "School contact settings successfully updated.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>School Settings | Ishwari Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
    <nav class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <a href="dashboard.php" class="font-bold text-sm text-amber-400">← Back to Dashboard</a>
        <a href="logout.php" class="text-red-400 text-xs">Sign Out</a>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 class="text-xl font-bold">Portal & Institutional Settings</h1>

        <?php if ($msg): ?>
            <div class="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <form action="settings.php" method="POST" class="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-slate-300 font-semibold">Official Phone</label>
                    <input type="text" name="phone" value="+977-01-5542109" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white">
                </div>
                <div class="space-y-1">
                    <label class="text-slate-300 font-semibold">Official Email</label>
                    <input type="email" name="email" value="info@ishwari.edu.np" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white">
                </div>
            </div>

            <div class="space-y-1">
                <label class="text-slate-300 font-semibold">Principal's Address / Message</label>
                <textarea name="principal_message" rows="3" class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white">Welcome to Ishwari Secondary School, where academic discipline and holistic moral values converge.</textarea>
            </div>

            <button type="submit" class="px-5 py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
                Save Institutional Settings
            </button>
        </form>
    </div>
</body>
</html>
