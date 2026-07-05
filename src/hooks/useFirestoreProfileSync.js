/**
 * useFirestoreProfileSync — fire-and-forget Firestore shadow write for profiles.
 *
 * Write-only. Never reads from Firestore. Never blocks the Base44 save.
 * Only runs when VITE_ENABLE_FIREBASE_PROFILE_SYNC=true (or localStorage override).
 *
 * Tier 1 fields only — no complex arrays/objects/QR blobs.
 */

import { getFirebaseDb, isConfigured } from "@/lib/firebase";
import { PROFILES_COLLECTION } from "@/lib/firestorePaths";

const TIER1_FIELDS = [
  "id", "username", "display_name", "job_title", "company_name", "bio",
  "profile_photo", "cover_photo", "cover_color", "layout", "profile_layout",
  "bg_style", "button_style", "phone", "whatsapp_number", "email", "website",
  "location", "show_location", "plan", "is_active", "updated_date",
];

// Evaluate localStorage at call-time (not module load time), so setting the key
// in DevTools and re-saving the profile immediately picks it up without a page reload.
function isSyncEnabled() {
  const localOverride =
    typeof window !== "undefined" &&
    window.localStorage.getItem("bingoo_firebase_profile_sync") === "true";
  return localOverride || import.meta.env.VITE_ENABLE_FIREBASE_PROFILE_SYNC === "true";
}

export const PROFILE_SYNC_ENABLED = isSyncEnabled; // export for inspection

/**
 * Silently syncs a saved Base44 profile to Firestore.
 * Fire-and-forget — never throws, never awaited by caller.
 *
 * @param {object} savedProfile — the profile object returned by Base44 after save
 */
export async function syncProfileToFirestore(savedProfile) {
  // [DEBUG] Step 2: function was called
  console.log("[FirestoreProfileSync:DEBUG] syncProfileToFirestore() called. savedProfile.id:", savedProfile?.id);

  // [DEBUG] Step 4+5: flag state at call time
  const lsValue = typeof window !== "undefined"
    ? window.localStorage.getItem("bingoo_firebase_profile_sync")
    : null;
  const envValue = import.meta.env.VITE_ENABLE_FIREBASE_PROFILE_SYNC;
  console.log("[FirestoreProfileSync:DEBUG] flag check — localStorage 'bingoo_firebase_profile_sync':", lsValue, "| VITE_ENABLE_FIREBASE_PROFILE_SYNC:", envValue, "| isSyncEnabled():", isSyncEnabled());

  if (!isSyncEnabled()) {
    console.warn("[FirestoreProfileSync:DEBUG] STOPPED — isSyncEnabled() is false. Set localStorage key or env var.");
    return;
  }

  // [DEBUG] Step 7+8: Firebase config state
  console.log("[FirestoreProfileSync:DEBUG] isConfigured:", isConfigured);

  if (!isConfigured) {
    console.warn("[FirestoreProfileSync:DEBUG] STOPPED — Firebase not configured. Check [Firebase:DEBUG] logs above.");
    return;
  }

  const db = await getFirebaseDb();
  if (!db) {
    console.warn("[FirestoreProfileSync:DEBUG] STOPPED — Firebase db is null after init.");
    return;
  }

  if (!savedProfile?.id) {
    console.warn("[FirestoreProfileSync:DEBUG] STOPPED — savedProfile.id is missing:", savedProfile);
    return;
  }

  try {
    // [DEBUG] Step 9: about to call setDoc
    console.log("[FirestoreProfileSync:DEBUG] Reached setDoc. Writing to profiles/" + savedProfile.id);
    const { doc, setDoc } = await import("firebase/firestore");

    const payload = {};
    for (const field of TIER1_FIELDS) {
      if (savedProfile[field] !== undefined) {
        payload[field] = savedProfile[field];
      }
    }
    payload._synced_at = new Date().toISOString();

    await setDoc(
      doc(db, PROFILES_COLLECTION, savedProfile.id),
      payload,
      { merge: true }
    );
    console.log("[FirestoreProfileSync:DEBUG] setDoc SUCCESS — profiles/" + savedProfile.id + " written.");
  } catch (err) {
    // [DEBUG] Step 10: exact Firestore error
    console.warn("[FirestoreProfileSync:DEBUG] STOPPED — setDoc FAILED:", err.code, err.message, err);
  }
}