/**
 * Ishwari Secondary School - Same-Origin API URL Resolver
 * 
 * In this single-origin full-stack architecture, the public website,
 * admin portals, API endpoints, and uploads are all hosted together on the same origin.
 * All API and media requests use clean, same-origin relative URLs.
 */

/**
 * Resolves any API or asset path to a safe, same-origin relative path
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
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Returns the base API URL (empty string for same-origin relative requests)
 */
export function getApiBaseUrl(): string {
  return '';
}

/**
 * Normalization helper (returns empty string for same-origin architecture)
 */
export function normalizeApiBaseUrl(_raw?: string): string {
  return '';
}

export function isRemoteHost(): boolean {
  return false;
}

export function isApiConfigured(): boolean {
  return true;
}

export function isVercelHost(): boolean {
  return false;
}

export function setStoredApiBaseUrl(_url: string): void {
  // Same-origin architecture does not require stored host overrides
}
