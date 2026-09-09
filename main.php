<?php
declare(strict_types=1);

namespace App;

require_once __DIR__ . '/types.php';
require_once __DIR__ . '/context/appcontrol.php';
require_once __DIR__ . '/vite.config.php';

use App\Context\AppControl;

/**
 * Main Application Bootstrapper
 */
class AppKernel {
    public static function run(?string $viewName = null): void {
        $app = AppControl::getInstance();
        $view = $viewName ?? ($_GET['page'] ?? 'home');
        require __DIR__ . '/views/app.php';
    }
}
