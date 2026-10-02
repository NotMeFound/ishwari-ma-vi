import {
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  AboutSection,
  CurriculumGuideline,
  Vacancy,
  PublicationItem
} from '../types';
import { safeStorage, safeSessionStorage } from '../utils/storage';
import {
  getApiUrl,
  getApiBaseUrl,
  isVercelHost,
  isRemoteHost,
  isApiConfigured,
  normalizeApiBaseUrl,
  setStoredApiBaseUrl
} from '../utils/apiUrl';

export {
  getApiUrl,
  getApiBaseUrl,
  isVercelHost,
  isRemoteHost,
  isApiConfigured,
  normalizeApiBaseUrl,
  setStoredApiBaseUrl
};

export interface ApiHealthStatus {
  status: 'connected' | 'unreachable' | 'invalid_endpoint' | 'config_missing';
  message: string;
  version?: number;
  lastModified?: string;
  uptime?: number;
  timestamp?: string;
}

export interface AuthoritativeCMSData {
  school: SchoolData;
  aboutSections?: AboutSection[];
  notices: Notice[];
  vacancies?: Vacancy[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  publications?: PublicationItem[];
  curriculumGuidelines?: CurriculumGuideline[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  auditLogs: SecurityAuditLogEntry[];
  adminAccounts: AdminAccount[];
}

export interface CMSStateResponse {
  success: boolean;
  authenticated?: boolean;
  role?: string;
  version: number;
  lastModified: string;
  data: AuthoritativeCMSData;
}

export interface AuthLoginResponse {
  success: boolean;
  token?: string;
  account?: AdminAccount;
  sessionExpiresAt?: number;
  error?: string;
  isLocked?: boolean;
  lockoutSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Safely extracts a displayable string from any error representation,
 * including objects like `{ code, message }` or standard Error instances.
 * Guarantees that raw objects are never passed into React children.
 */
export function formatErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as any;
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message;
    }
    if (typeof obj.error === 'string' && obj.error.trim().length > 0) {
      return obj.error;
    }
    if (typeof obj.error === 'object' && obj.error !== null) {
      if (typeof obj.error.message === 'string') return obj.error.message;
      if (typeof obj.error.code === 'string') return obj.error.code;
    }
    if (typeof obj.code === 'string') {
      return obj.code;
    }
  }
  return fallback;
}

/**
 * Safely parses response as JSON only if Content-Type indicates JSON.
 * Avoids uncaught syntax errors when reverse proxy or server returns HTML.
 */
async function safeParseJson<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

class APIClient {
  private currentVersion = 0;
  private isFetching = false;
  private listeners: Set<(data: AuthoritativeCMSData, version: number) => void> = new Set();
  private sessionToken: string | null = null;

  constructor() {
    this.sessionToken = safeSessionStorage.getItem('ishwari_server_token') || safeStorage.getItem('ishwari_server_token') || null;
  }

  public setToken(token: string | null) {
    this.sessionToken = token;
    if (token) {
      safeSessionStorage.setItem('ishwari_server_token', token);
      safeStorage.setItem('ishwari_server_token', token);
    } else {
      safeSessionStorage.removeItem('ishwari_server_token');
      safeStorage.removeItem('ishwari_server_token');
    }
  }

  public getToken(): string | null {
    return (
      this.sessionToken ||
      safeSessionStorage.getItem('ishwari_server_token') ||
      safeStorage.getItem('ishwari_server_token') ||
      null
    );
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Test internal same-origin backend health status
   */
  public async testHealth(): Promise<ApiHealthStatus> {
    try {
      const res = await fetch(getApiUrl('/api/health'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        const json = await safeParseJson<{ success?: boolean; status?: string; version?: number; uptime?: number; timestamp?: string }>(res);
        if (json && (json.status === 'ok' || typeof json.version !== 'undefined')) {
          return {
            status: 'connected',
            message: `Connected: Same-origin API is healthy (${json.version ? `CMS DB v${json.version}` : 'Online'}).`,
            version: json.version,
            uptime: json.uptime,
            timestamp: json.timestamp
          };
        }
      }

      return {
        status: 'unreachable',
        message: `API returned HTTP ${res.status}. Expected JSON health response.`
      };
    } catch (err: any) {
      return {
        status: 'unreachable',
        message: `API connection failed: ${err?.message || 'Server unreachable'}.`
      };
    }
  }

  /**
   * Authenticate against authoritative server API (Normal Password or Master Key)
   */
  public async login(payload: {
    username: string;
    password?: string;
    loginType?: 'password' | 'master_key';
    masterKey?: string;
  }): Promise<AuthLoginResponse> {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await safeParseJson<any>(res);
      if (!data) {
        const contentType = res.headers.get('content-type') || '';
        if (res.status === 404 || (res.ok && contentType.includes('text/html'))) {
          return {
            success: false,
            error: 'Authentication service is unavailable. Configure VITE_API_URL to point to the deployed backend, then redeploy the frontend.'
          };
        }
        if (res.status === 401) {
          return {
            success: false,
            error: 'Invalid username or password.'
          };
        }
        if (res.status === 403) {
          return {
            success: false,
            error: 'Access denied: account inactive or restricted.'
          };
        }
        if (res.status === 404) {
          return {
            success: false,
            error: 'Authentication endpoint not found (HTTP 404). Please verify the backend service is running.'
          };
        }
        if (res.status >= 500) {
          return {
            success: false,
            error: `Server error (HTTP ${res.status}). The authentication server encountered an internal error.`
          };
        }
        return {
          success: false,
          error: `Authentication failed (HTTP ${res.status}). Server returned an unexpected response.`
        };
      }

      // Strictly normalize any server error response (whether string, { code, message }, etc.)
      const normalizedError = data.error ? formatErrorMessage(data.error, 'Authentication failed.') : undefined;

      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return {
        ...data,
        error: normalizedError
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the authentication service. Verify VITE_API_URL and the backend server, then try again.'
      };
    }
  }

  /**
   * Check active authenticated session against server
   */
  public async checkAuth(): Promise<{ authenticated: boolean; account?: AdminAccount; sessionExpiresAt?: number }> {
    try {
      const url = getApiUrl('/api/auth/me');
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });
      if (!res.ok) return { authenticated: false };
      const data = await safeParseJson(res);
      return data || { authenticated: false };
    } catch {
      return { authenticated: false };
    }
  }

  /**
   * Terminate active session on server and invalidate tokens
   */
  public async logout(): Promise<boolean> {
    try {
      const url = getApiUrl('/api/auth/logout');
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.setToken(null);
    }
    return true;
  }

  /**
   * Secure Password Change on Server
   */
  public async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const url = getApiUrl('/api/auth/change-password');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await safeParseJson<{ success: boolean; error?: string; message?: string }>(res);
      return data || { success: false, error: 'Password change failed. Server returned non-JSON response.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating password.' };
    }
  }

  /**
   * Independent authoritative database fetch.
   * Never relies on admin browser state or local-only storage.
   */
  public async fetchAuthoritativeState(): Promise<CMSStateResponse | null> {
    if (this.isFetching) return null;
    this.isFetching = true;

    try {
      const url = getApiUrl('/api/cms/state');
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await safeParseJson<CMSStateResponse>(res);
      if (json && json.success && json.data) {
        this.currentVersion = json.version;

        // Save a resilient offline backup snapshot
        try {
          safeStorage.setJSON('ishwari_offline_backup_state', {
            version: json.version,
            lastModified: json.lastModified,
            data: json.data
          });
        } catch {
          // Ignore storage quota
        }

        // Notify subscribers
        this.notifyListeners(json.data, json.version);
        return json;
      }
      return null;
    } catch (err) {
      console.warn('[CMS Sync] Backend fetch error, checking offline snapshot:', err);
      // Offline fallback
      const cached = safeStorage.getJSON<{ version: number; data: AuthoritativeCMSData } | null>('ishwari_offline_backup_state', null);
      if (cached && cached.data) {
        return {
          success: true,
          version: cached.version || 1,
          lastModified: new Date().toISOString(),
          data: cached.data
        };
      }
      return null;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Ultra lightweight version check to test whether new content was published.
   */
  public async checkVersion(): Promise<{ version: number; lastModified: string; hasUpdate: boolean } | null> {
    try {
      const url = getApiUrl('/api/cms/version');
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      });
      if (!res.ok) return null;
      const json = await safeParseJson<{ version: number; lastModified: string }>(res);
      if (!json) return null;
      const hasUpdate = json.version > this.currentVersion;
      return {
        version: json.version,
        lastModified: json.lastModified,
        hasUpdate
      };
    } catch {
      return null;
    }
  }

  /**
   * Persist a module update directly to the backend database with server-side authorization check.
   */
  public async syncModule(module: string, data: any, actor = 'Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No active session' };
    }

    try {
      const url = getApiUrl('/api/cms/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ module, data, actor })
      });

      const json = await safeParseJson(res);
      if (res.ok && json?.success) {
        this.currentVersion = json.version;
        // Immediately trigger authoritative fetch so UI synchronizes with database
        await this.fetchAuthoritativeState();
        return { success: true };
      }
      return { success: false, error: json?.error || `Failed with status ${res.status}` };
    } catch (err: any) {
      console.error(`[CMS Sync] Failed to sync module [${module}]:`, err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Persist multiple modules in a single atomic transaction.
   */
  public async syncBatch(batch: Partial<AuthoritativeCMSData>, actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No active session' };
    }

    try {
      const url = getApiUrl('/api/cms/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ batch, actor })
      });

      const json = await safeParseJson(res);
      if (res.ok && json?.success) {
        this.currentVersion = json.version;
        // Immediately trigger authoritative fetch so UI synchronizes with database
        await this.fetchAuthoritativeState();
        return { success: true };
      }
      return { success: false, error: json?.error || `Failed with status ${res.status}` };
    } catch (err: any) {
      console.error('[CMS Sync] Failed to sync batch:', err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Public contact message submission.
   */
  public async submitContactMessage(payload: {
    name: string;
    email?: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const url = getApiUrl('/api/contact/submit');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await safeParseJson(res);
      return !!json?.success;
    } catch (err) {
      console.error('[Contact] Failed to submit message to backend:', err);
      return false;
    }
  }

  /**
   * Reset backend database to authoritative factory defaults (Strict Super Admin only).
   */
  public async resetToDefaults(actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Super Admin session required' };
    }

    try {
      const url = getApiUrl('/api/cms/reset');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ actor })
      });
      const json = await safeParseJson(res);
      if (res.ok && json?.success) {
        await this.fetchAuthoritativeState();
        return { success: true };
      }
      return { success: false, error: json?.error || 'Failed to reset database' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Real-time Server-Sent Events (SSE) subscriber + Polling fallback.
   * Listens for backend changes published by Admin on another device.
   */
  public setupLiveSync(onDataChanged: (data: AuthoritativeCMSData, version: number) => void): () => void {
    this.listeners.add(onDataChanged);

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    const connectSSE = () => {
      try {
        if (typeof window === 'undefined' || !window.EventSource) return;

        const streamUrl = getApiUrl('/api/cms/stream');
        eventSource = new EventSource(streamUrl, { withCredentials: true } as any);

        eventSource.addEventListener('update', async (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && payload.version > this.currentVersion) {
              await this.fetchAuthoritativeState();
            }
          } catch (err) {
            console.error('[LiveSync] Error handling SSE message:', err);
          }
        });

        eventSource.onerror = () => {
          // If SSE closes or reconnects, safely retry in background
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('[LiveSync] SSE initialization fallback:', err);
      }
    };

    // 1. Start SSE stream
    connectSSE();

    // 2. Auxiliary Polling Fallback (Runs every 8 seconds to guarantee freshness even behind restrictive proxies)
    pollInterval = setInterval(async () => {
      const check = await this.checkVersion();
      if (check && check.hasUpdate) {
        await this.fetchAuthoritativeState();
      }
    }, 8000);

    // 3. Focus / Visibility Resumption
    const handleVisibilityChange = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const check = await this.checkVersion();
        if (check && check.hasUpdate) {
          await this.fetchAuthoritativeState();
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);
    }

    return () => {
      this.listeners.delete(onDataChanged);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleVisibilityChange);
      }
    };
  }

  private notifyListeners(data: AuthoritativeCMSData, version: number) {
    for (const listener of this.listeners) {
      try {
        listener(data, version);
      } catch (e) {
        console.error('[LiveSync] Listener error:', e);
      }
    }
  }

  public getCurrentVersion(): number {
    return this.currentVersion;
  }
}

export const apiClient = new APIClient();
