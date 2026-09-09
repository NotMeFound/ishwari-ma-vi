<?php
declare(strict_types=1);

namespace App\Config;

/**
 * Vite asset pipeline & production manifest resolver for PHP
 * Resolves compiled CSS and JS assets in production and provides dev fallbacks.
 */
class ViteConfig {
    private static ?array $manifest = null;

    public static function asset(string $entry): string {
        $manifestPath = __DIR__ . '/dist/.vite/manifest.json';
        if (file_exists($manifestPath) && self::$manifest === null) {
            $content = file_get_contents($manifestPath);
            if ($content !== false) {
                self::$manifest = json_decode($content, true);
            }
        }

        if (isset(self::$manifest[$entry]['file'])) {
            return '/dist/' . self::$manifest[$entry]['file'];
        }

        // Default direct path fallback
        return '/' . ltrim($entry, '/');
    }

    public static function css(): string {
        $distCss = glob(__DIR__ . '/dist/assets/*.css');
        if (!empty($distCss)) {
            return '/dist/assets/' . basename($distCss[0]);
        }
        return '/php/assets/css/style.css';
    }

    public static function js(): string {
        $distJs = glob(__DIR__ . '/dist/assets/*.js');
        if (!empty($distJs)) {
            return '/dist/assets/' . basename($distJs[0]);
        }
        return '/php/assets/js/main.js';
    }
}
