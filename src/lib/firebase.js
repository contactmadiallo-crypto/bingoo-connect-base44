/**
 * Firebase SDK initialization — Bingoo Connect Firebase POC
 *
 * All config values come from Vite environment variables — no credentials hardcoded.
 * If the firebase package is not installed or env vars are missing, db = null
 * and the app continues to work entirely via Base44.
 *
 * Required env vars:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_MEASUREMENT_ID  (optional)
 */

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

// db is null until initFirebase() resolves. Callers (useFirestoreNotifications)
// already guard on !db before doing anything with it.
let db = null;
let firebaseApp = null;

/**
 * Lazily initialize Firebase using dynamic imports so the build never fails
 * if the `firebase` npm package has not been installed yet.
 * Returns { db, firebaseApp } or { db: null, firebaseApp: null } on any error.
 */
export async function initFirebase() {
  if (db) return { db, firebaseApp };
  if (!isConfigured) {
    if (import.meta.env.DEV) {
      console.info("[Firebase] VITE_FIREBASE_* env vars missing — Base44 is active.");
    }
    return { db: null, firebaseApp: null };
  }

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore } = await import("firebase/firestore");
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
  } catch (e) {
    console.warn("[Firebase] Init failed — Base44 remains active:", e.message);
    db = null;
    firebaseApp = null;
  }

  return { db, firebaseApp };
}

export { db, firebaseApp, isConfigured };