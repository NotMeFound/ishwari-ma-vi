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
  AdminAccount
} from '../types';
import { safeStorage, safeSessionStorage } from '../utils/storage';

export interface AuthoritativeCMSData {
  school: SchoolData;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
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

class APIClient {
  private currentVersion = 0;
  private isFetching = false;
  private listeners: Set<(data: AuthoritativeCMSData, version: number) => void> = new Set();
  private sessionToken: string | null = null;

  constructor() {
    this.sessionToken = safeSessionStorage.getItem('ishwari_server_token') || null;
  }

  public setToken(token: string | null) {
    this.sessionToken = token;
    if (token) {
      safeSessionStorage.setItem('ishwari_server_token', token);
    } else {
      safeSessionStorage.removeItem('ishwari_server_token');
    }
  }

  public getToken(): string | null {
    return this.sessionToken || safeSessionStorage.getItem('ishwari_server_token') || null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const data: AuthLoginResponse = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to authentication service.'
      };
    }
  }

  /**
   * Check active authenticated session against server
   */
  public async checkAuth(): Promise<{ authenticated: boolean; account?: AdminAccount; sessionExpiresAt?: number }> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });
      if (!res.ok) return { authenticated: false };
      return await res.json();
    } catch {
      return { authenticated: false };
    }
  }

  /**
   * Terminate active session on server and invalidate tokens
   */
  public async logout(): Promise<boolean> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.setToken(null);
    }
    return true;
  }

  /**
   * Independent authoritative database fetch.
   * Never relies on admin browser state or local-only storage.
   */
  public async fetchAuthoritativeState(): Promise<CMSStateResponse | null> {
    if (this.isFetching) return null;
    this.isFetching = true;

    try {
      const res = await fetch('/api/cms/state', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json: CMSStateResponse = await res.json();
      if (json.success && json.data) {
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
      const res = await fetch('/api/cms/version', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return null;
      const json = await res.json();
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
    try {
      const res = await fetch('/api/cms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify({ module, data, actor })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        this.currentVersion = json.version;
        return { success: true };
      }
      return { success: false, error: json.error || `Failed with status ${res.status}` };
    } catch (err: any) {
      console.error(`[CMS Sync] Failed to sync module [${module}]:`, err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Fetch documents list (public or all documents if authenticated admin)
   */
  public async fetchDocuments(all = false): Promise<{ success: boolean; documents: DocumentItem[]; error?: string }> {
    try {
      const url = all ? '/api/documents?all=true' : '/api/documents';
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, documents: json.documents || [] };
      }
      return { success: false, documents: [], error: json.error || 'Failed to fetch documents' };
    } catch (err: any) {
      return { success: false, documents: [], error: err?.message || 'Network error' };
    }
  }

  /**
   * Upload a new official PDF document with authoritative server validation
   */
  public async uploadDocument(payload: {
    title_en: string;
    title_np?: string;
    description_en?: string;
    description_np?: string;
    fileName: string;
    fileType?: string;
    base64Data: string;
    status?: 'draft' | 'published';
  }): Promise<{ success: boolean; document?: DocumentItem; error?: string }> {
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, document: json.document };
      }
      return { success: false, error: json.error || `Upload failed with status ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error uploading document' };
    }
  }

  /**
   * Update document metadata or replace attached PDF file
   */
  public async updateDocument(
    id: number,
    payload: {
      title_en?: string;
      title_np?: string;
      description_en?: string;
      description_np?: string;
      fileName?: string;
      fileType?: string;
      base64Data?: string;
      status?: 'draft' | 'published';
      is_published?: boolean;
    }
  ): Promise<{ success: boolean; document?: DocumentItem; error?: string }> {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, document: json.document };
      }
      return { success: false, error: json.error || `Update failed with status ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating document' };
    }
  }

  /**
   * Permanently delete a document and its stored physical file
   */
  public async deleteDocument(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true };
      }
      return { success: false, error: json.error || `Delete failed with status ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error deleting document' };
    }
  }

  /**
   * Toggle published status of a document
   */
  public async togglePublishDocument(id: number, publish?: boolean): Promise<{ success: boolean; document?: DocumentItem; error?: string }> {
    try {
      const res = await fetch(`/api/documents/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify({ publish })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, document: json.document };
      }
      return { success: false, error: json.error || `Status update failed with status ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating document status' };
    }
  }

  /**
   * Persist multiple modules in a single atomic transaction.
   */
  public async syncBatch(batch: Partial<AuthoritativeCMSData>, actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/cms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify({ batch, actor })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        this.currentVersion = json.version;
        return { success: true };
      }
      return { success: false, error: json.error || `Failed with status ${res.status}` };
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
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      return !!json.success;
    } catch (err) {
      console.error('[Contact] Failed to submit message to backend:', err);
      return false;
    }
  }

  /**
   * Upload image or PDF file to backend with base64 conversion and server-side validation.
   */
  public async uploadFile(file: File, category: 'image' | 'document' | string = 'image'): Promise<{
    success: boolean;
    url?: string;
    fileName?: string;
    size?: number;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/cms/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeaders()
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              base64Data,
              category
            })
          });
          const json = await res.json();
          if (res.ok && json.success) {
            resolve({
              success: true,
              url: json.url,
              fileName: json.fileName,
              size: json.size
            });
          } else {
            resolve({ success: false, error: json.error || 'Failed to upload file' });
          }
        } catch (err: any) {
          resolve({ success: false, error: err?.message || 'Upload error' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Could not read file' });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Create a new facility via REST API.
   */
  public async createFacility(data: Partial<Facility>): Promise<{ success: boolean; facility?: Facility; facilities?: Facility[]; error?: string }> {
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Update an existing facility via REST API.
   */
  public async updateFacility(id: number, data: Partial<Facility>): Promise<{ success: boolean; facility?: Facility; facilities?: Facility[]; error?: string }> {
    try {
      const res = await fetch(`/api/facilities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Delete a facility via REST API.
   */
  public async deleteFacility(id: number): Promise<{ success: boolean; facilities?: Facility[]; error?: string }> {
    try {
      const res = await fetch(`/api/facilities/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Reorder facilities.
   */
  public async reorderFacilities(orderedIds: number[]): Promise<{ success: boolean; facilities?: Facility[]; error?: string }> {
    try {
      const res = await fetch('/api/facilities/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify({ orderedIds })
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Record an operational or security audit log directly on the backend server.
   */
  public async recordAuditLog(payload: {
    action: string;
    module?: string;
    status?: 'success' | 'warning' | 'danger';
    details?: string;
    result?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Purge all audit logs from backend database (Super Admin only).
   */
  public async clearAuditLogs(): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/audit/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin'
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to clear audit logs' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Reset backend database to authoritative factory defaults (Strict Super Admin only).
   */
  public async resetToDefaults(actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/cms/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'same-origin',
        body: JSON.stringify({ actor })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await this.fetchAuthoritativeState();
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to reset database' };
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

        eventSource = new EventSource('/api/cms/stream');

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
