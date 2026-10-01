// 1. Safe error normalization import
import { apiClient, formatErrorMessage } from '../services/apiClient';

// 2. In handleLogin: Claim session lock for verified credentials & format error string
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (isLockedOut) {
    setAuthError(
      formatErrorMessage(
        t(
          `Security lockout active. Please wait ${lockoutSecondsRemaining}s or use Master Emergency PIN.`,
          `सुरक्षा लक सक्रिय छ। कृपया ${lockoutSecondsRemaining} सेकेन्ड पर्खनुहोस् वा मास्टर पिन प्रयोग गर्नुहोस्।`
        )
      )
    );
    return;
  }

  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();
  const recoveryPin = (securityConfig?.recoveryPin || '782035').trim();
  const isMasterKey = trimmedPass === recoveryPin;

  if (!trimmedUser) {
    setAuthError(t('Username or email is required.', 'प्रयोगकर्ता नाम वा इमेल आवश्यक छ।'));
    return;
  }

  setIsSubmitting(true);
  try {
    const authRes = await apiClient.login({
      username: trimmedUser,
      password: trimmedPass,
      loginType: isMasterKey ? 'master_key' : 'password',
      masterKey: isMasterKey ? trimmedPass : undefined
    });

    if (authRes.isLocked) {
      const lockoutTime = Date.now() + (authRes.lockoutSeconds || 300) * 1000;
      setLockoutUntil(lockoutTime);
      safeSessionStorage.setItem('ishwari_lockout_until', String(lockoutTime));
      setAuthError(formatErrorMessage(authRes.error, t('Security lockout active.', 'सुरक्षा लक सक्रिय छ।')));
      return;
    }

    if (!authRes.success || !authRes.account) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      safeSessionStorage.setItem('ishwari_failed_attempts', String(nextFailures));
      const errorMsg = formatErrorMessage(authRes.error, t('Invalid username or password.', 'अमान्य प्रयोगकर्ता नाम वा पासवर्ड।'));
      setAuthError(errorMsg);
      return;
    }

    const authenticatedAccount = authRes.account;

    // Claim session lock for this verified authenticated session
    acquireSessionLock(authenticatedAccount, true);

    setIsAuthenticated(true);
    setCurrentAccount(authenticatedAccount);
    safeSessionStorage.setItem('ishwari_admin_auth', 'true');
    safeSessionStorage.setItem('ishwari_current_account', JSON.stringify(authenticatedAccount));
    setAuthError('');
    setFailedAttempts(0);
    setLockoutUntil(0);
    safeSessionStorage.removeItem('ishwari_failed_attempts');
    safeSessionStorage.removeItem('ishwari_lockout_until');

    // ... (rest of session initialization and audit logging)
  } catch (err: any) {
    setAuthError(formatErrorMessage(err, 'Login request error'));
  } finally {
    setIsSubmitting(false);
  }
};

// 3. In JSX rendering: Always format errors as strings before rendering to DOM
{authError && (
  <div
    role="alert"
    className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 leading-relaxed"
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" strokeWidth={2} />
    <span className="flex-1">{formatErrorMessage(authError)}</span>
    <button
      type="button"
      onClick={() => setAuthError('')}
      className="p-0.5 text-red-400 hover:text-red-600 dark:hover:text-red-300"
      aria-label="Dismiss error"
    >
      <X className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
  </div>
)}