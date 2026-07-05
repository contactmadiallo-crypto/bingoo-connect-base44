/**
 * Firebase SDK initialization — Bingoo Connect
 *
 * Uses lazy initialization so Firebase is only loaded when first needed.
 * If env vars are missing, the Firebase SDK is never imported.
 */

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let _initialized = false;
let app = null;
let db = null;

/**
 * Lazily initializes Firebase Firestore and returns the db instance.
 * Returns null if Firebase is not configured or initialization fails.
 * Safe to call multiple times — only initializes once.
 */
export async function getFirebaseDb() {
  if (_initialized) return db;
  _initialized = true;
  if (!isConfigured) return null;
  try {
    const [{ initializeApp, getApps }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ]);
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.warn("[Firebase] Init failed:", e.message);
    db = null;
  }
  return db;
}

export { db, app };