<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string)($_POST['email'] ?? ''));
    $pass = trim((string)($_POST['password'] ?? ''));

    if ($email === ADMIN_EMAIL && $pass === ADMIN_PASS) {
        $_SESSION['is_admin'] = true;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = "Invalid credentials. Please use default administrative login.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Login | Ishwari Secondary School</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-sm w-full p-8 rounded-lg bg-slate-800 border border-slate-700 shadow-xl space-y-6">
        <div class="text-center space-y-2">
            <div class="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto text-xl font-bold">
                🔒
            </div>
            <h1 class="text-xl font-bold">Admin Portal</h1>
            <p class="text-xs text-slate-400">Ishwari Secondary School CMS</p>
        </div>

        <?php if ($error): ?>
            <div class="p-3 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form action="login.php" method="POST" class="space-y-4 text-xs">
            <div class="space-y-1">
                <label class="text-slate-300 font-semibold">Email</label>
                <input type="email" name="email" value="admin@ishwari.edu.np" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500">
            </div>
            <div class="space-y-1">
                <label class="text-slate-300 font-semibold">Password</label>
                <input type="password" name="password" value="admin123" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500">
            </div>
            <button type="submit" class="w-full py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
                Sign In to Dashboard →
            </button>
            <div class="p-2.5 rounded bg-slate-900 border border-slate-700/50 text-[11px] text-slate-400">
                Default: <code>admin@ishwari.edu.np</code> / <code>admin123</code>
            </div>
        </form>
    </div>
</body>
</html>
