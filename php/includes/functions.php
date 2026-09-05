<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function getDb(): ?PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            return null; // Graceful fallback
        }
    }
    return $pdo;
}

function getActiveLanguage(): string {
    if (isset($_GET['lang'])) {
        $l = strtolower(trim((string)$_GET['lang']));
        if (in_array($l, ['en', 'np'], true)) {
            $_SESSION['lang'] = $l;
            setcookie('lang', $l, time() + (86400 * 30), '/');
            return $l;
        }
    }
    return $_SESSION['lang'] ?? $_COOKIE['lang'] ?? 'np';
}

function isNp(): bool {
    return getActiveLanguage() === 'np';
}

function t(string $en, string $np): string {
    return isNp() ? $np : $en;
}

function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(?string $token): bool {
    return !empty($token) && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
