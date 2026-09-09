import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db, ServerSession, verifyPasswordBcrypt } from './db';
import { AdminAccount, DocumentItem } from '../src/types';

export const apiRouter = express.Router();

// Strict Cache-Control headers for all dynamic API responses
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Helper to extract session token from cookies or Authorization header
function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.ishwari_session;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return undefined;
}

// Authentication middleware for privileged operations
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const session = db.validateSession(token);

  if (!session) {
    res.status(401).json({
      success: false,
      error: 'Authentication session expired or invalid. Please log in to proceed.'
    });
    return;
  }

  (req as any).session = session;
  next();
}

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  const versionInfo = db.getVersion();
  res.json({
    status: 'ok',
    version: versionInfo.version,
    lastModified: versionInfo.lastModified,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 2. Authoritative Database State
apiRouter.get('/cms/state', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = db.validateSession(token);
  const state = db.getState();

  const etag = `W/"v${state.version}-${new Date(state.lastModified).getTime()}"`;
  res.setHeader('ETag', etag);

  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }

  // If authenticated admin session, provide full operational data (sanitizing password hashes)
  if (session) {
    const sanitizedAccounts = state.adminAccounts.map((acc) => ({
      ...acc,
      passwordHash: '[PROTECTED_BCRYPT_HASH]'
    }));

    res.json({
      success: true,
      authenticated: true,
      role: session.role,
      version: state.version,
      lastModified: state.lastModified,
      data: {
        school: state.school,
        notices: state.notices,
        staff: state.staff,
        facilities: state.facilities,
        programs: state.programs,
        documents: state.documents,
        messages: state.messages,
        events: state.events,
        achievements: state.achievements,
        history: state.history,
        gallery: state.gallery,
        siteConfig: state.siteConfig,
        securityConfig: state.securityConfig,
        auditLogs: state.auditLogs,
        adminAccounts: sanitizedAccounts
      }
    });
    return;
  }

  // Unauthenticated public visitors receive sanitized public state
  const publicData = db.getPublicState();
  res.json({
    success: true,
    authenticated: false,
    version: publicData.version,
    lastModified: publicData.lastModified,
    data: publicData
  });
});

// 3. Ultra-lightweight Version Check (For Polling & Tab Resumption)
apiRouter.get('/cms/version', (req: Request, res: Response) => {
  const versionInfo = db.getVersion();
  res.json({
    success: true,
    version: versionInfo.version,
    lastModified: versionInfo.lastModified
  });
});

// 4. Real-time Synchronization Stream (Server-Sent Events)
apiRouter.get('/cms/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for nginx

  res.flushHeaders?.();

  // Send initial handshake
  const current = db.getVersion();
  res.write(`event: handshake\ndata: ${JSON.stringify({ version: current.version, lastModified: current.lastModified })}\n\n`);

  // Subscribe to database changes
  const unsubscribe = db.subscribe((change) => {
    try {
      res.write(`event: update\ndata: ${JSON.stringify(change)}\n\n`);
    } catch {
      // Stream closed
    }
  });

  // Keep connection alive with pings every 20 seconds
  const pingTimer = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingTimer);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingTimer);
    unsubscribe();
  });
});

/* ---------------- AUTHENTICATION & SESSION APIS ---------------- */

// 5. Admin Authentication (Normal Password & Master Key)
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password, loginType, masterKey } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  const trimmedUser = String(username || '').trim().toLowerCase();
  const rateLimitId = `${clientIp}:${trimmedUser || 'anon'}`;

  // Check brute force & rate limiting
  const rateCheck = db.checkRateLimit(rateLimitId);
  if (rateCheck.isLocked) {
    await db.appendAuditLog({
      action: 'LOGIN_RATE_LIMIT_BLOCKED',
      actor: trimmedUser || 'unknown',
      role: 'unknown',
      module: 'AUTH',
      status: 'danger',
      result: 'denied',
      details: `Request blocked: Rate limit lockout active for ${rateCheck.remainingSeconds} seconds.`,
      ipAddress: clientIp
    });

    res.status(429).json({
      success: false,
      isLocked: true,
      remainingSeconds: rateCheck.remainingSeconds,
      error: `Security lockout active. Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds.`
    });
    return;
  }

  if (!trimmedUser) {
    res.status(400).json({ success: false, error: 'Username or email is required.' });
    return;
  }

  const state = db.getState();
  const matchingAccount = state.adminAccounts.find(
    (a) => a.username.toLowerCase() === trimmedUser || a.email.toLowerCase() === trimmedUser
  );

  if (!matchingAccount) {
    const rateResult = db.recordFailedAttempt(rateLimitId);
    await db.appendAuditLog({
      action: 'ADMIN_LOGIN_FAILED',
      actor: trimmedUser,
      role: 'unknown',
      module: 'AUTH',
      status: 'warning',
      result: 'denied',
      details: `Invalid login attempt: Account not found. Remaining attempts: ${rateResult.remainingAttempts}`,
      ipAddress: clientIp
    });

    res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials.',
      remainingAttempts: rateResult.remainingAttempts,
      isLocked: rateResult.isLocked,
      lockoutSeconds: rateResult.remainingSeconds
    });
    return;
  }

  // Suspended account check
  if (matchingAccount.status !== 'active') {
    await db.appendAuditLog({
      action: 'ADMIN_LOGIN_SUSPENDED',
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: 'AUTH',
      status: 'danger',
      result: 'denied',
      details: `Access denied: Account @${matchingAccount.username} is suspended.`,
      ipAddress: clientIp
    });

    res.status(403).json({
      success: false,
      error: 'This administrator account has been suspended by the Super Admin.'
    });
    return;
  }

  let isAuthenticated = false;
  const isMasterKeyAttempt = loginType === 'master_key' || (masterKey && masterKey.trim().length > 0);

  if (isMasterKeyAttempt) {
    // Admin Master Key Authentication:
    // Requires Username + Master Key
    // Master Key must NEVER by itself authenticate a user.
    // The role identity MUST come from the authoritative user/account record.
    // A Master Key login MUST NEVER downgrade or upgrade roles!
    const enteredPin = String(masterKey || password || '').trim();
    const authoritativeRecoveryPin = (state.securityConfig?.recoveryPin || '325800').trim();

    if (enteredPin === authoritativeRecoveryPin) {
      isAuthenticated = true;
    } else {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: 'MASTER_KEY_LOGIN_FAILED',
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: 'AUTH',
        status: 'danger',
        result: 'denied',
        details: `Invalid Master Key entered for account @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });

      res.status(401).json({
        success: false,
        error: 'Invalid Master Recovery Key.',
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  } else {
    // Normal password authentication using modern bcrypt verification
    const enteredPass = String(password || '');
    isAuthenticated = verifyPasswordBcrypt(enteredPass, matchingAccount.passwordHash);

    if (!isAuthenticated) {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: 'ADMIN_LOGIN_FAILED',
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: 'AUTH',
        status: 'warning',
        result: 'denied',
        details: `Incorrect password attempt for @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });

      res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.',
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  }

  if (isAuthenticated) {
    // Reset rate limiter on success
    db.recordSuccessfulAttempt(rateLimitId);

    // Update account lastLogin timestamp in database
    const nowStr = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updatedAccounts = state.adminAccounts.map((a) =>
      a.id === matchingAccount.id ? { ...a, lastLogin: nowStr } : a
    );
    await db.updateModule('adminAccounts', updatedAccounts, 'System Auth', clientIp);

    // Create secure server-side session with ID regeneration
    const session = db.createSession(matchingAccount, clientIp, userAgent);

    // Set secure HttpOnly cookie
    const timeoutMinutes = state.securityConfig?.sessionTimeoutMinutes || 30;
    res.cookie('ishwari_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: timeoutMinutes * 60 * 1000
    });

    await db.appendAuditLog({
      action: isMasterKeyAttempt ? 'ADMIN_MASTER_KEY_LOGIN_SUCCESS' : 'ADMIN_LOGIN_SUCCESS',
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: `Successful login as ${matchingAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'} (${matchingAccount.fullName}) via ${isMasterKeyAttempt ? 'Master Key' : 'password'}.`,
      ipAddress: clientIp
    });

    res.json({
      success: true,
      token: session.token,
      account: {
        id: matchingAccount.id,
        username: matchingAccount.username,
        fullName: matchingAccount.fullName,
        email: matchingAccount.email,
        role: matchingAccount.role,
        permissions: session.permissions,
        status: matchingAccount.status,
        lastLogin: nowStr
      },
      sessionExpiresAt: session.expiresAt
    });
  }
});

// 6. Current Session Validation Endpoint
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = db.validateSession(token);

  if (!session) {
    res.json({ authenticated: false });
    return;
  }

  const state = db.getState();
  const account = state.adminAccounts.find((a) => a.id === session.userId);

  if (!account || account.status !== 'active') {
    db.destroySession(token);
    res.json({ authenticated: false, reason: 'Account deactivated or deleted' });
    return;
  }

  res.json({
    authenticated: true,
    account: {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
      permissions: session.permissions,
      status: account.status,
      lastLogin: account.lastLogin
    },
    sessionExpiresAt: session.expiresAt
  });
});

// 7. Secure Logout & Invalidation
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = db.validateSession(token);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (session) {
    db.destroySession(token);
    db.appendAuditLog({
      action: 'ADMIN_LOGOUT',
      actor: session.username,
      role: session.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: `Administrative session terminated by @${session.username}.`,
      ipAddress: clientIp
    });
  }

  res.clearCookie('ishwari_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

/* ---------------- AUTHORITATIVE CMS DATA OPERATIONS ---------------- */

// 8. Authorized CMS Module Sync with Backend RBAC Enforcement
apiRouter.post('/cms/sync', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const { module, data, batch, actor } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const effectiveActor = actor || `@${session.username} (${session.role})`;

  try {
    if (batch && typeof batch === 'object') {
      // Check permissions for every module in batch
      for (const moduleKey of Object.keys(batch)) {
        const check = db.checkPermission(session, moduleKey);
        if (!check.allowed) {
          await db.appendAuditLog({
            action: 'RBAC_PERMISSION_DENIED',
            actor: session.username,
            role: session.role,
            module: moduleKey,
            status: 'danger',
            result: 'denied',
            details: `Unauthorized batch modification attempted on module [${moduleKey}]: ${check.reason}`,
            ipAddress: clientIp
          });

          res.status(403).json({
            success: false,
            error: `Permission denied for module [${moduleKey}]: ${check.reason}`
          });
          return;
        }
      }

      const result = await db.updateBatch(batch, effectiveActor, clientIp);
      res.json({ success: true, ...result });
      return;
    }

    if (!module || data === undefined) {
      res.status(400).json({ success: false, error: 'Module name and data payload are required' });
      return;
    }

    // Backend RBAC enforcement for the specific module
    const permCheck = db.checkPermission(session, module);
    if (!permCheck.allowed) {
      await db.appendAuditLog({
        action: 'RBAC_PERMISSION_DENIED',
        actor: session.username,
        role: session.role,
        module,
        status: 'danger',
        result: 'denied',
        details: `Unauthorized update attempt on module [${module}]: ${permCheck.reason}`,
        ipAddress: clientIp
      });

      res.status(403).json({
        success: false,
        error: `Permission denied: ${permCheck.reason}`
      });
      return;
    }

    // Privilege Escalation Prevention & Super Admin Protection
    if (module === 'adminAccounts' && session.role !== 'super_admin') {
      const currentState = db.getState();
      const existingSuperAdmins = currentState.adminAccounts.filter((a) => a.role === 'super_admin');

      if (Array.isArray(data)) {
        // 1. Ensure all existing Super Admin accounts are preserved without modification or demotion
        for (const sa of existingSuperAdmins) {
          const matchingNew = data.find(
            (a) => a.id === sa.id || a.username?.toLowerCase() === sa.username?.toLowerCase()
          );
          if (!matchingNew || matchingNew.role !== 'super_admin' || matchingNew.status !== 'active') {
            await db.appendAuditLog({
              action: 'PRIVILEGE_ESCALATION_BLOCKED',
              actor: session.username,
              role: session.role,
              module: 'adminAccounts',
              status: 'danger',
              result: 'denied',
              details: `Blocked attempt to modify, suspend, or demote protected Super Admin account @${sa.username}.`,
              ipAddress: clientIp
            });
            res.status(403).json({
              success: false,
              error: 'Forbidden: Protected Super Admin accounts cannot be modified, suspended, or deleted.'
            });
            return;
          }
        }

        // 2. Prevent creating new Super Admin accounts or promoting standard accounts
        const newSuperAdmins = data.filter((a) => a.role === 'super_admin');
        if (newSuperAdmins.length > existingSuperAdmins.length) {
          await db.appendAuditLog({
            action: 'PRIVILEGE_ESCALATION_BLOCKED',
            actor: session.username,
            role: session.role,
            module: 'adminAccounts',
            status: 'danger',
            result: 'denied',
            details: 'Blocked attempt by standard administrator to create or promote account to Super Admin.',
            ipAddress: clientIp
          });
          res.status(403).json({
            success: false,
            error: 'Forbidden: Standard administrators cannot create or grant Super Admin privileges.'
          });
          return;
        }
      }
    }

    const result = await db.updateModule(module, data, effectiveActor, clientIp);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error during CMS sync:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to update CMS database' });
  }
});

// 9. Factory Reset Database (Strict Super Admin Only)
apiRouter.post('/cms/reset', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (session.role !== 'super_admin') {
    await db.appendAuditLog({
      action: 'SECURITY_VIOLATION_ATTEMPT',
      actor: session.username,
      role: session.role,
      module: 'SYSTEM',
      status: 'danger',
      result: 'denied',
      details: 'Unauthorized attempt by standard admin to execute database factory reset.',
      ipAddress: clientIp
    });

    res.status(403).json({
      success: false,
      error: 'Access denied. Database factory reset is restricted exclusively to the Super Administrator.'
    });
    return;
  }

  try {
    const result = await db.resetToDefaults(`@${session.username} (Super Admin)`, clientIp);
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to reset database' });
  }
});

// 10. Append Audit Log Endpoint
apiRouter.post('/audit/log', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const { action, module, status, details, result } = req.body;

  try {
    const logEntry = await db.appendAuditLog({
      action: action || 'OPERATIONAL_EVENT',
      actor: session.username,
      role: session.role,
      module: module || 'SYSTEM',
      status: status || 'success',
      result: result || 'success',
      details: details || '',
      ipAddress: clientIp
    });

    res.json({ success: true, log: logEntry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to record audit log' });
  }
});

// 11. Clear Audit Logs (Strict Super Admin Only)
apiRouter.post('/audit/clear', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (session.role !== 'super_admin') {
    await db.appendAuditLog({
      action: 'SECURITY_VIOLATION_ATTEMPT',
      actor: session.username,
      role: session.role,
      module: 'AUDIT',
      status: 'danger',
      result: 'denied',
      details: 'Unauthorized attempt to clear audit logs.',
      ipAddress: clientIp
    });
    res.status(403).json({ success: false, error: 'Forbidden: Super Admin privilege required to clear audit logs.' });
    return;
  }

  try {
    await db.updateModule('auditLogs', [], `@${session.username} (super_admin)`, clientIp);
    await db.appendAuditLog({
      action: 'AUDIT_LOGS_PURGED',
      actor: session.username,
      role: session.role,
      module: 'AUDIT',
      status: 'warning',
      result: 'success',
      details: 'All historical audit log entries were cleared by Super Administrator.',
      ipAddress: clientIp
    });

    res.json({ success: true, message: 'Audit logs purged successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to clear audit logs' });
  }
});

// 12. Public Contact Message Submission
apiRouter.post('/contact/submit', async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ success: false, error: 'Name, phone, and message are required fields' });
    return;
  }

  try {
    const newMsg = await db.addContactMessage({
      name: String(name).trim(),
      email: String(email || '').trim(),
      phone: String(phone).trim(),
      subject: String(subject || 'general').trim(),
      message: String(message).trim()
    });

    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    console.error('Failed to submit contact message:', err);
    res.status(500).json({ success: false, error: 'Failed to record message in database' });
  }
});

// 11. Secure File Upload Validator (Images & PDF documents)
apiRouter.post('/cms/upload', requireAuth, (req: Request, res: Response) => {
  const { fileName, fileType, base64Data, category } = req.body;

  if (!base64Data || !fileName) {
    res.status(400).json({ success: false, error: 'Missing file data or file name' });
    return;
  }

  // Calculate approximate file size from base64 string
  const stringLength = base64Data.length - (base64Data.indexOf(',') + 1);
  const sizeInBytes = Math.ceil(stringLength * 0.75);

  if (category === 'document') {
    // Must be PDF and <= 200 KB
    if (!fileName.toLowerCase().endsWith('.pdf') && !fileType?.includes('pdf')) {
      res.status(400).json({ success: false, error: 'Official documents must be PDF format only (.pdf)' });
      return;
    }
    if (sizeInBytes > 200 * 1024) {
      res.status(400).json({ success: false, error: 'Document size exceeds maximum 200 KB threshold' });
      return;
    }
  } else {
    // Images: JPG, PNG, WebP <= 5 MB
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (fileType && !allowed.includes(fileType.toLowerCase())) {
      res.status(400).json({ success: false, error: 'Image must be JPG, PNG, or WebP' });
      return;
    }
    if (sizeInBytes > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'Image size exceeds maximum 5 MB limit' });
      return;
    }
  }

  res.json({
    success: true,
    url: base64Data,
    fileName,
    size: sizeInBytes
  });
});

/* ---------------- AUTHORITATIVE PDF DOCUMENTS CMS ENDPOINTS ---------------- */

// PDF Buffer Validator & Magic-Byte Verification (RFC 8118 / ISO 32000)
interface PDFValidationResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  sizeBytes?: number;
  formattedSize?: string;
}

function validatePDFPayload(base64Data: string, originalFileName: string, fileType?: string): PDFValidationResult {
  if (!base64Data) {
    return { valid: false, error: 'No PDF file data provided.' };
  }

  // 1. Strict Extension Validation
  const ext = path.extname(originalFileName || '').toLowerCase();
  if (ext !== '.pdf') {
    return { valid: false, error: 'Only PDF files are allowed.' };
  }

  // 2. MIME Type Validation
  if (fileType && !fileType.toLowerCase().includes('pdf')) {
    return { valid: false, error: 'Only PDF files are allowed.' };
  }

  // 3. Decode base64 payload safely
  const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(pureBase64, 'base64');
  } catch {
    return { valid: false, error: 'Unable to decode uploaded file data. Invalid base64 format.' };
  }

  // 4. Empty file check
  if (buffer.length === 0) {
    return { valid: false, error: 'The uploaded file is empty.' };
  }

  // 5. Authoritative 200 KB Maximum File Size Limit Check
  const MAX_ALLOWED_BYTES = 200 * 1024; // 204,800 bytes
  if (buffer.length > MAX_ALLOWED_BYTES) {
    return {
      valid: false,
      error: 'The selected PDF exceeds the 200 KB maximum size.'
    };
  }

  // 6. Authoritative PDF Magic-Byte Validation (%PDF- : 0x25 0x50 0x44 0x46 0x2D)
  const magic = buffer.subarray(0, 5).toString('ascii');
  if (magic !== '%PDF-') {
    return {
      valid: false,
      error: 'The uploaded file is not a valid PDF.'
    };
  }

  const formattedSize = `${Math.max(1, Math.round(buffer.length / 1024))} KB`;

  return {
    valid: true,
    buffer,
    sizeBytes: buffer.length,
    formattedSize
  };
}

// Fallback minimal compliant PDF generator for initial seed documents
function generateSeedDocumentPDF(titleEn: string, titleNp: string, date: string): Buffer {
  const safeEn = (titleEn || 'Official Institutional Document').replace(/[\(\)\\]/g, ' ');
  const safeDate = date || '2083-01-01';
  const content = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 260 >> stream
BT
/F1 16 Tf
50 720 Td
(Ishwari Secondary School - Official Document Repository) Tj
0 -30 Td
/F1 12 Tf
(Document Title: ${safeEn}) Tj
0 -20 Td
(Publication Date: ${safeDate}) Tj
0 -20 Td
(Verification: Certified Institutional Record - Ishwari Secondary School) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000557 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
638
%%EOF`;
  return Buffer.from(content, 'utf-8');
}

// Helper to serve document file safely with security headers
function serveDocumentFile(req: Request, res: Response, asAttachment: boolean) {
  const docId = Number(req.params.id);
  const state = db.getState();
  const doc = (state.documents || []).find((d: DocumentItem) => d.id === docId);

  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }

  const isDraft = doc.is_published === false || doc.status === 'draft';
  if (isDraft) {
    const token = extractToken(req);
    const session = db.validateSession(token);
    if (!session || (session.role !== 'super_admin' && !session.permissions.some((p) => p.startsWith('document.')))) {
      res.status(403).json({ success: false, error: 'Access denied to unpublished draft document.' });
      return;
    }
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const rawFilename = doc.original_filename || `${(doc.title_en || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  const safeFilename = path.basename(rawFilename.endsWith('.pdf') ? rawFilename : `${rawFilename}.pdf`);
  const encodedFilename = encodeURIComponent(safeFilename);

  res.setHeader(
    'Content-Disposition',
    `${asAttachment ? 'attachment' : 'inline'}; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`
  );

  // If a physical file is stored on disk
  if (doc.stored_filename) {
    const uploadsDocsDir = path.join(process.cwd(), 'uploads', 'documents');
    const filePath = path.join(uploadsDocsDir, doc.stored_filename);
    if (fs.existsSync(filePath)) {
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Fallback for seed records without physical file
  const fallbackPdf = generateSeedDocumentPDF(doc.title_en, doc.title_np, doc.date);
  res.setHeader('Content-Length', fallbackPdf.length);
  res.send(fallbackPdf);
}

// GET /api/documents - Authoritative Documents Query (Public & Admin)
apiRouter.get('/documents', (req: Request, res: Response) => {
  const state = db.getState();
  const token = extractToken(req);
  const session = db.validateSession(token);
  const showAll = req.query.all === 'true' && !!session && (session.role === 'super_admin' || session.permissions.some((p) => p.startsWith('document.')));

  let list = state.documents || [];
  if (!showAll) {
    // Only published documents
    list = list.filter((d: DocumentItem) => d.is_published !== false && d.status !== 'draft');
  }

  res.json({
    success: true,
    documents: list,
    total: list.length,
    timestamp: new Date().toISOString()
  });
});

// GET /api/documents/:id - Single Document Detail
apiRouter.get('/documents/:id', (req: Request, res: Response) => {
  const docId = Number(req.params.id);
  const state = db.getState();
  const doc = (state.documents || []).find((d: DocumentItem) => d.id === docId);

  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  const isDraft = doc.is_published === false || doc.status === 'draft';
  if (isDraft) {
    const token = extractToken(req);
    const session = db.validateSession(token);
    if (!session || (session.role !== 'super_admin' && !session.permissions.some((p) => p.startsWith('document.')))) {
      res.status(403).json({ success: false, error: 'Access denied: Draft document requires administrative privileges.' });
      return;
    }
  }

  res.json({ success: true, document: doc });
});

// GET /api/documents/:id/file - View PDF inline
apiRouter.get('/documents/:id/file', (req: Request, res: Response) => {
  serveDocumentFile(req, res, false);
});

// GET /api/documents/:id/download - Download PDF attachment
apiRouter.get('/documents/:id/download', (req: Request, res: Response) => {
  serveDocumentFile(req, res, true);
});

// POST /api/documents/upload - Upload & Record New PDF Document
apiRouter.post('/documents/upload', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  // Authorization check
  const hasPerm = session.role === 'super_admin' || session.permissions.includes('document.create');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: document.create required' });
    return;
  }

  const {
    title_en,
    title_np,
    description_en,
    description_np,
    fileName,
    fileType,
    base64Data,
    status = 'published'
  } = req.body;

  if (!title_en || !String(title_en).trim()) {
    res.status(400).json({ success: false, error: 'Document Title is required.' });
    return;
  }

  if (!fileName || !base64Data) {
    res.status(400).json({ success: false, error: 'PDF File is required.' });
    return;
  }

  // Authoritative Backend Validation (Format, Size <= 200KB, Magic Bytes %PDF-)
  const validation = validatePDFPayload(base64Data, fileName, fileType);
  if (!validation.valid || !validation.buffer) {
    res.status(400).json({ success: false, error: validation.error || 'Invalid PDF document.' });
    return;
  }

  try {
    // Secure Unique Filename Generation
    const uniqueId = crypto.randomUUID();
    const storedFilename = `doc_${Date.now()}_${uniqueId.replace(/-/g, '').slice(0, 16)}.pdf`;
    const uploadsDocsDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDocsDir)) {
      fs.mkdirSync(uploadsDocsDir, { recursive: true });
    }
    const destPath = path.join(uploadsDocsDir, storedFilename);
    fs.writeFileSync(destPath, validation.buffer);

    const isPublished = status === 'published';
    const state = db.getState();
    const currentDocs = state.documents || [];
    const nextId = currentDocs.length > 0 ? Math.max(...currentDocs.map((d: DocumentItem) => d.id || 0)) + 1 : 1;

    const newDoc: DocumentItem = {
      id: nextId,
      title_en: String(title_en).trim(),
      title_np: String(title_np || title_en).trim(),
      description_en: String(description_en || '').trim(),
      description_np: String(description_np || '').trim(),
      original_filename: path.basename(String(fileName)),
      stored_filename: storedFilename,
      file_path: `/uploads/documents/${storedFilename}`,
      url: `/uploads/documents/${storedFilename}`,
      mime_type: 'application/pdf',
      file_size: validation.sizeBytes || validation.buffer.length,
      size: validation.formattedSize || `${Math.round(validation.buffer.length / 1024)} KB`,
      type: 'Official PDF',
      status: isPublished ? 'published' : 'draft',
      is_published: isPublished,
      created_by: session.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    const updatedList = [newDoc, ...currentDocs];
    await db.updateModule('documents', updatedList, session.username, clientIp);

    await db.appendAuditLog({
      action: 'DOCUMENT_UPLOADED',
      actor: session.username,
      role: session.role,
      module: 'DOCUMENTS',
      status: 'success',
      result: 'success',
      severity: 'info',
      details: `Uploaded PDF "${newDoc.title_en}" (${newDoc.size}, Status: ${newDoc.status}).`,
      ipAddress: clientIp
    });

    res.json({
      success: true,
      document: newDoc,
      message: 'Document uploaded successfully.'
    });
  } catch (err: any) {
    console.error('Failed to save uploaded document:', err);
    res.status(500).json({ success: false, error: 'Unable to upload document. Please try again.' });
  }
});

// PUT /api/documents/:id - Update Document Metadata & Optional PDF Replacement
apiRouter.put('/documents/:id', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  // Authorization check
  const hasPerm = session.role === 'super_admin' || session.permissions.includes('document.update');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: document.update required' });
    return;
  }

  const docId = Number(req.params.id);
  const state = db.getState();
  const currentDocs = state.documents || [];
  const existing = currentDocs.find((d: DocumentItem) => d.id === docId);

  if (!existing) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }

  const {
    title_en,
    title_np,
    description_en,
    description_np,
    status,
    is_published,
    fileName,
    fileType,
    base64Data
  } = req.body;

  let newStoredFilename = existing.stored_filename;
  let newOriginalFilename = existing.original_filename;
  let newFilePath = existing.file_path;
  let newUrl = existing.url;
  let newSize = existing.size;
  let newSizeBytes = existing.file_size;

  // Handle optional PDF replacement with identical stringent validation
  if (base64Data && fileName) {
    const validation = validatePDFPayload(base64Data, fileName, fileType);
    if (!validation.valid || !validation.buffer) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid replacement PDF file.' });
      return;
    }

    const uniqueId = crypto.randomUUID();
    const replacementStoredFilename = `doc_${Date.now()}_${uniqueId.replace(/-/g, '').slice(0, 16)}.pdf`;
    const uploadsDocsDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDocsDir)) {
      fs.mkdirSync(uploadsDocsDir, { recursive: true });
    }
    const destPath = path.join(uploadsDocsDir, replacementStoredFilename);
    fs.writeFileSync(destPath, validation.buffer);

    // Remove old stored file
    if (existing.stored_filename) {
      const oldPath = path.join(uploadsDocsDir, existing.stored_filename);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    newStoredFilename = replacementStoredFilename;
    newOriginalFilename = path.basename(fileName);
    newFilePath = `/uploads/documents/${replacementStoredFilename}`;
    newUrl = `/uploads/documents/${replacementStoredFilename}`;
    newSizeBytes = validation.sizeBytes;
    newSize = validation.formattedSize;
  }

  const updatedPublished = is_published !== undefined
    ? Boolean(is_published)
    : status !== undefined
      ? status === 'published'
      : (existing.is_published ?? true);

  const updatedDoc: DocumentItem = {
    ...existing,
    title_en: title_en !== undefined ? String(title_en).trim() : existing.title_en,
    title_np: title_np !== undefined ? String(title_np).trim() : existing.title_np,
    description_en: description_en !== undefined ? String(description_en).trim() : existing.description_en,
    description_np: description_np !== undefined ? String(description_np).trim() : existing.description_np,
    original_filename: newOriginalFilename,
    stored_filename: newStoredFilename,
    file_path: newFilePath,
    url: newUrl,
    file_size: newSizeBytes,
    size: newSize || existing.size,
    status: updatedPublished ? 'published' : 'draft',
    is_published: updatedPublished,
    updated_at: new Date().toISOString()
  };

  const updatedList = currentDocs.map((d: DocumentItem) => d.id === docId ? updatedDoc : d);
  await db.updateModule('documents', updatedList, session.username, clientIp);

  await db.appendAuditLog({
    action: 'DOCUMENT_UPDATED',
    actor: session.username,
    role: session.role,
    module: 'DOCUMENTS',
    status: 'success',
    result: 'success',
    severity: 'info',
    details: `Updated document "${updatedDoc.title_en}" (Status: ${updatedDoc.status}).`,
    ipAddress: clientIp
  });

  res.json({ success: true, document: updatedDoc, message: 'Document updated successfully.' });
});

// DELETE /api/documents/:id - Delete Document & Remove Physical File
apiRouter.delete('/documents/:id', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  // Authorization check
  const hasPerm = session.role === 'super_admin' || session.permissions.includes('document.delete');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: document.delete required' });
    return;
  }

  const docId = Number(req.params.id);
  const state = db.getState();
  const currentDocs = state.documents || [];
  const existing = currentDocs.find((d: DocumentItem) => d.id === docId);

  if (!existing) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }

  // Safely delete physical file
  if (existing.stored_filename) {
    const uploadsDocsDir = path.join(process.cwd(), 'uploads', 'documents');
    const filePath = path.join(uploadsDocsDir, existing.stored_filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.warn('Could not remove file:', e); }
    }
  }

  const updatedList = currentDocs.filter((d: DocumentItem) => d.id !== docId);
  await db.updateModule('documents', updatedList, session.username, clientIp);

  await db.appendAuditLog({
    action: 'DOCUMENT_DELETED',
    actor: session.username,
    role: session.role,
    module: 'DOCUMENTS',
    status: 'warning',
    result: 'success',
    severity: 'warning',
    details: `Deleted document "${existing.title_en}" (ID: ${existing.id}).`,
    ipAddress: clientIp
  });

  res.json({ success: true, message: 'Document deleted successfully.' });
});

// POST /api/documents/:id/publish - Toggle Publish / Unpublish Status
apiRouter.post('/documents/:id/publish', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  // Authorization check
  const hasPerm = session.role === 'super_admin' || session.permissions.includes('document.update');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: document.update required' });
    return;
  }

  const docId = Number(req.params.id);
  const state = db.getState();
  const currentDocs = state.documents || [];
  const existing = currentDocs.find((d: DocumentItem) => d.id === docId);

  if (!existing) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }

  const willPublish = req.body.publish !== undefined ? Boolean(req.body.publish) : !(existing.is_published ?? true);
  const updatedDoc: DocumentItem = {
    ...existing,
    is_published: willPublish,
    status: willPublish ? 'published' : 'draft',
    updated_at: new Date().toISOString()
  };

  const updatedList = currentDocs.map((d: DocumentItem) => d.id === docId ? updatedDoc : d);
  await db.updateModule('documents', updatedList, session.username, clientIp);

  await db.appendAuditLog({
    action: willPublish ? 'DOCUMENT_PUBLISHED' : 'DOCUMENT_UNPUBLISHED',
    actor: session.username,
    role: session.role,
    module: 'DOCUMENTS',
    status: 'success',
    result: 'success',
    severity: 'info',
    details: `${willPublish ? 'Published' : 'Unpublished'} document "${existing.title_en}".`,
    ipAddress: clientIp
  });

  res.json({
    success: true,
    document: updatedDoc,
    message: `Document ${willPublish ? 'published' : 'unpublished'} successfully.`
  });
});

/* ---------------- DEDICATED FACILITIES CMS ENDPOINTS ---------------- */

// GET /api/facilities
apiRouter.get('/facilities', (req: Request, res: Response) => {
  const state = db.getState();
  const token = extractToken(req);
  const session = db.validateSession(token);
  const showAll = req.query.all === 'true' && session && (session.role === 'super_admin' || session.permissions.some(p => p.startsWith('facility.')));

  let list = state.facilities || [];
  if (!showAll) {
    list = list.filter((f: any) => f.published !== false);
  }
  // Sort by order ascending
  list.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
  res.json({ success: true, facilities: list });
});

// POST /api/facilities
apiRouter.post('/facilities', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  const hasPerm = session.role === 'super_admin' || session.permissions.includes('facility.create');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: facility.create required' });
    return;
  }

  const state = db.getState();
  const facilities = [...(state.facilities || [])];
  const {
    title_en,
    title_np,
    desc_en,
    desc_np,
    icon,
    category,
    order,
    published,
    backgroundImage,
    backgroundImageEnabled,
    backgroundImageAltEn,
    backgroundImageAltNp
  } = req.body;

  if (!title_en || !title_np) {
    res.status(400).json({ success: false, error: 'Bilingual title (English & Nepali) is required' });
    return;
  }

  const nextId = facilities.length > 0 ? Math.max(...facilities.map(f => f.id || 0)) + 1 : 1;
  const newFacility = {
    id: nextId,
    title_en: String(title_en).trim(),
    title_np: String(title_np).trim(),
    desc_en: String(desc_en || '').trim(),
    desc_np: String(desc_np || '').trim(),
    icon: String(icon || '🔬').trim(),
    category: String(category || 'general').trim(),
    order: typeof order === 'number' ? order : facilities.length + 1,
    published: published !== false,
    backgroundImage: backgroundImage || '',
    backgroundImageEnabled: backgroundImageEnabled !== false,
    backgroundImageAltEn: backgroundImageAltEn || '',
    backgroundImageAltNp: backgroundImageAltNp || ''
  };

  facilities.push(newFacility);
  await db.updateModule('facilities', facilities, `@${session.username} (${session.role})`, clientIp);

  await db.appendAuditLog({
    action: 'FACILITY_CREATED',
    actor: session.username,
    role: session.role,
    module: 'FACILITIES',
    status: 'success',
    result: 'success',
    details: `Created new facility: "${newFacility.title_en}" (ID: ${newFacility.id}) with background image: ${newFacility.backgroundImage ? 'YES' : 'NO'}.`,
    ipAddress: clientIp
  });

  res.json({ success: true, facility: newFacility, facilities });
});

// PUT /api/facilities/:id
apiRouter.put('/facilities/:id', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  const hasPerm = session.role === 'super_admin' || session.permissions.includes('facility.update');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: facility.update required' });
    return;
  }

  const id = parseInt(req.params.id, 10);
  const state = db.getState();
  const facilities = [...(state.facilities || [])];
  const idx = facilities.findIndex(f => f.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }

  const existing = facilities[idx];
  const updated = {
    ...existing,
    ...req.body,
    id // preserve id
  };

  facilities[idx] = updated;
  await db.updateModule('facilities', facilities, `@${session.username} (${session.role})`, clientIp);

  await db.appendAuditLog({
    action: 'FACILITY_UPDATED',
    actor: session.username,
    role: session.role,
    module: 'FACILITIES',
    status: 'success',
    result: 'success',
    details: `Updated facility #${id} ("${updated.title_en}"): background enabled=${updated.backgroundImageEnabled}, published=${updated.published}.`,
    ipAddress: clientIp
  });

  res.json({ success: true, facility: updated, facilities });
});

// DELETE /api/facilities/:id
apiRouter.delete('/facilities/:id', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  const hasPerm = session.role === 'super_admin' || session.permissions.includes('facility.delete');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: facility.delete required' });
    return;
  }

  const id = parseInt(req.params.id, 10);
  const state = db.getState();
  const facilities = [...(state.facilities || [])];
  const target = facilities.find(f => f.id === id);

  if (!target) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }

  const filtered = facilities.filter(f => f.id !== id);
  await db.updateModule('facilities', filtered, `@${session.username} (${session.role})`, clientIp);

  await db.appendAuditLog({
    action: 'FACILITY_DELETED',
    actor: session.username,
    role: session.role,
    module: 'FACILITIES',
    status: 'warning',
    result: 'success',
    details: `Deleted facility #${id} ("${target.title_en}").`,
    ipAddress: clientIp
  });

  res.json({ success: true, facilities: filtered });
});

// POST /api/facilities/reorder
apiRouter.post('/facilities/reorder', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  const hasPerm = session.role === 'super_admin' || session.permissions.includes('facility.update');
  if (!hasPerm) {
    res.status(403).json({ success: false, error: 'Permission denied: facility.update required' });
    return;
  }

  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, error: 'orderedIds array required' });
    return;
  }

  const state = db.getState();
  const map = new Map((state.facilities || []).map(f => [f.id, f]));
  const reordered: any[] = [];

  orderedIds.forEach((id: number, index: number) => {
    const f = map.get(id);
    if (f) {
      reordered.push({ ...f, order: index + 1 });
      map.delete(id);
    }
  });

  // Append any remaining
  map.forEach(f => {
    reordered.push({ ...f, order: reordered.length + 1 });
  });

  await db.updateModule('facilities', reordered, `@${session.username} (${session.role})`, clientIp);

  await db.appendAuditLog({
    action: 'FACILITIES_REORDERED',
    actor: session.username,
    role: session.role,
    module: 'FACILITIES',
    status: 'success',
    result: 'success',
    details: `Updated display order for ${reordered.length} facilities.`,
    ipAddress: clientIp
  });

  res.json({ success: true, facilities: reordered });
});
