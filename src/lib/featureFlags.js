/**
 * Bingoo Connect — Feature Flags
 *
 * Firebase Notifications POC flag:
 *   Default: FALSE (Base44 is always the production data source)
 *
 *   To enable in your browser only (no deploy required):
 *     localStorage.setItem("bingoo_firebase_notifications", "true")
 *
 *   To enable via build environment:
 *     Set VITE_ENABLE_FIREBASE_NOTIFICATIONS=true in your .env
 *
 *   To disable (revert to Base44):
 *     localStorage.removeItem("bingoo_firebase_notifications")
 *     OR set VITE_ENABLE_FIREBASE_NOTIFICATIONS=false
 *
 * NOTE: localStorage takes precedence over env var so developers can
 * opt-in per browser without a rebuild.
 */

const localOverride = typeof window !== "undefined"
  ? window.localStorage.getItem("bingoo_firebase_notifications")
  : null;

const envFlag = import.meta.env.VITE_ENABLE_FIREBASE_NOTIFICATIONS;

/**
 * True only when explicitly opted in.
 * The default ("false" or missing) always resolves to false.
 */
export const FIREBASE_NOTIFICATIONS_ENABLED =
  localOverride === "true" || envFlag === "true";