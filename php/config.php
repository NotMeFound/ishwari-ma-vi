<?php
declare(strict_types=1);

/**
 * Production Site Configuration & Database Credentials
 * XAMPP / LAMP / cPanel Environment
 */

define('SITE_NAME_EN', 'Ishwari Secondary School');
define('SITE_NAME_NP', 'ईश्वरी माध्यमिक विद्यालय');
define('SITE_CODE', 'EMIS: 48012004');
define('ESTD_BS', '2035 B.S.');
define('ESTD_AD', '1978 A.D.');
define('SITE_BASE_URL', '/ishwari');

// Database Connection Constants (XAMPP Defaults)
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'ishwari_school');
define('DB_USER', 'root');
define('DB_PASS', '');

// Default Administrative Credentials
define('ADMIN_EMAIL', 'admin@ishwari.edu.np');
define('ADMIN_PASS', 'admin123'); // Change immediately in production

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
