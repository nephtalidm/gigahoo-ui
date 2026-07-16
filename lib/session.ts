// Client-side session policy. The JWT's 7-day lifetime is only the hard CEILING —
// a session is considered DEAD after ~17 minutes without user activity (the idle
// window plus its warning countdown), and that rule must survive tab closes and
// browser restarts. The in-page idle timer alone can't do that (its setTimeout dies
// with the tab, which is why sessions used to last days), so activity is persisted
// to localStorage and re-checked on every app load before trusting a stored token.

export const IDLE_MS = 15 * 60 * 1000; // idle window before the warning dialog
export const WARN_MS = 2 * 60 * 1000; // warning countdown before forced logout

const TOKEN_KEY = "gigahoo_token";
const EXPIRES_KEY = "gigahoo_expires_at";
const ACTIVITY_KEY = "gigahoo_last_activity";

let lastWrite = 0;

/** Record user activity (throttled to one localStorage write per 30s; `force` on login/load). */
export function touchActivity(force = false): void {
  const now = Date.now();
  if (!force && now - lastWrite < 30_000) return;
  lastWrite = now;
  try {
    localStorage.setItem(ACTIVITY_KEY, String(now));
  } catch {
    /* storage unavailable — the API's 401 remains the backstop */
  }
}

/**
 * Is the stored session dead? True when the JWT itself expired, when the last
 * recorded activity is older than the idle policy, or when no activity was ever
 * recorded for an existing token (a pre-policy stale session).
 */
export function sessionExpired(): boolean {
  try {
    const exp = localStorage.getItem(EXPIRES_KEY);
    if (exp) {
      const t = Date.parse(exp);
      if (!Number.isNaN(t) && Date.now() >= t) return true;
    }
    const last = Number(localStorage.getItem(ACTIVITY_KEY) ?? "0");
    if (!last || Date.now() - last > IDLE_MS + WARN_MS) return true;
  } catch {
    /* storage unavailable — fail open; the API's 401 handling backstops */
  }
  return false;
}

/** Remove every trace of the session from storage. */
export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {
    /* nothing to clear */
  }
}
