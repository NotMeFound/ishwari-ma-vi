<?php
declare(strict_types=1);

/**
 * Ishwari Secondary School - Official Institutional Web Portal
 * Primary Web Root Entry & Front Controller
 */

require_once __DIR__ . '/main.php';

// Dispatch request to AppKernel
\App\AppKernel::run();
