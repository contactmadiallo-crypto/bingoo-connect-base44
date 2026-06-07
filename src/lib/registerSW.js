/**
 * Service Worker registration + push notification helpers
 */

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;

  // Never register in dev — stale SW cache causes duplicate React / null hook errors
  if (import.meta.env.DEV) {
    // Unregister any existing dev workers so they don't serve stale chunks
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) await reg.unregister();
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PWA] Service worker registered:", reg.scope);
    return reg;
  } catch (err) {
    console.warn("[PWA] Service worker registration failed:", err);
    return null;
  }
}

/**
 * Request push notification permission.
 * Returns "granted" | "denied" | "default"
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
}

/**
 * Check if app is running in standalone PWA mode
 */
export function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Subscribe to push notifications.
 * Pass your VAPID public key to enable real push.
 */
export async function subscribeToPush(vapidPublicKey) {
  if (!vapidPublicKey) return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  return subscription;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}