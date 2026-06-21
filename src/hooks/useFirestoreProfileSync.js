/**
 * useFirestoreProfileSync — fire-and-forget Firestore shadow write for profiles.
 *
 * Write-only. Never reads from Firestore. Never blocks the Base44 save.
 * Only runs when VITE_ENABLE_FIREBASE_PROFILE_SYNC=true (or localStorage override).
 *
 * Tier 1 fields only — no complex arrays/objects/QR blobs.
 */

import { db, isConfigured } from "@/lib/firebase";
import { PROFILES_COLLECTION } from "@/lib/firestorePaths";

const TIER1_FIELDS = [
  "id", "username", "display_name", "job_title", "company_name", "bio",
  "profile_photo", "cover_photo", "cover_color", "layout", "profile_layout",
  "bg_style", "button_style", "phone", "whatsapp_number", "email", "website",
  "location", "show_location", "plan", "is_active", "updated_date",
];

const localOverride =
  typeof window !== "undefined" &&
  window.localStorage.getItem("bingoo_firebase_profile_sync") === "true";

export const PROFILE_SYNC_ENABLED =
  localOverride || import.meta.env.VITE_ENABLE_FIREBASE_PROFILE_SYNC === "true";

/**
 * Silently syncs a saved Base44 profile to Firestore.
 * Fire-and-forget — never throws, never awaited by caller.
 *
 * @param {object} savedProfile — the profile object returned by Base44 after save
 */
export async function syncProfileToFirestore(savedProfile) {
  if (!PROFILE_SYNC_ENABLED) return;
  if (!isConfigured || !db) return;
  if (!savedProfile?.id) return;

  try {
    // Dynamic import keeps firebase/firestore out of the main bundle when flag is off
    const { doc, setDoc } = await import("firebase/firestore");

    const payload = {};
    for (const field of TIER1_FIELDS) {
      if (savedProfile[field] !== undefined) {
        payload[field] = savedProfile[field];
      }
    }
    // Always record when the Firestore copy was last written
    payload._synced_at = new Date().toISOString();

    await setDoc(
      doc(db, PROFILES_COLLECTION, savedProfile.id),
      payload,
      { merge: true }
    );
  } catch (err) {
    // Silent — never surface to user, never block Base44 save
    console.warn("[FirestoreProfileSync] Write failed (non-blocking):", err.message);
  }
}