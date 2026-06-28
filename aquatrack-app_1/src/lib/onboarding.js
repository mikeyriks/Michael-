// ═════════════════════════════════════════════════════════════════════════
//   Onboarding state — local persistence
//
//   In production: replace with calls to the auth service.
//   The mock uses localStorage so a returning user skips onboarding.
//
//   Schema:
//     aquatrack:user   — { phone, swimmer, relationship, completedAt }
// ═════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'aquatrack:user';

export function getOnboardedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOnboardedUser(user) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...user, completedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearOnboardedUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function isOnboarded() {
  return Boolean(getOnboardedUser());
}

// ─── Guest mode ───────────────────────────────────────────────────────────
//   Lets a prospective parent explore the app on sample data without
//   signing up. Persisted so a refresh keeps them in the journey.
//   "Create account" clears this and returns them to the Welcome screen.
export function startGuestSession() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ guest: true, startedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function isGuestUser(user) {
  return Boolean(user && user.guest);
}
