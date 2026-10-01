/**
 * Ishwari Secondary School - Authoritative API URL Resolver
 * 
 * In standard single-origin full-stack architecture, all API and media requests
 * use clean same-origin relative URLs (e.g. /api/auth/login).
 * If a separate backend URL is configured via VITE_API_URL or local storage,
 * it is automatically prepended to all API requests.
 */

/**
 * Normalization helper for base URLs
 */
export function normalizeApiBaseUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '/' || trimmed === 'undefined' || trimmed === 'null') {
    return '';
  }
  return trimmed.replace(/\/+$/, '');
}

/**
 * Returns the base API URL (empty string for same-origin relative requests)
 */
export function getApiBaseUrl(): string {
  // 1. Check environment variable VITE_API_URL if configured
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    const envUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
    if (envUrl) return envUrl;
  }

  // 2. Check explicitly stored API override
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ishwari_api_base_url');
      if (stored) {
        const normalized = normalizeApiBaseUrl(stored);
        if (normalized && (normalized.startsWith('http://') || normalized.startsWith('https://'))) {
          return normalized;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  // 3. Default to same-origin relative requests
  return '';
}

/**
 * Resolves any API or asset path to a safe path (with base URL if configured)
 */
export function getApiUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function isRemoteHost(): boolean {
  return Boolean(getApiBaseUrl());
}

export function isApiConfigured(): boolean {
  return true;
}

export function isVercelHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.vercel.app');
}

export function setStoredApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeApiBaseUrl(url);
    if (normalized) {
      localStorage.setItem('ishwari_api_base_url', normalized);
    } else {
      localStorage.removeItem('ishwari_api_base_url');
    }
  } catch {
    // Ignore storage errors
  }
}
