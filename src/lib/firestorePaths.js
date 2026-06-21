/**
 * Firestore path constants — Bingoo Connect Profile Shadow Copy POC
 * Centralizes all Firestore collection/document paths.
 * Read-only reference — never import Firestore SDK here.
 */

/** @param {string} profileId */
export const profileDocPath = (profileId) => `profiles/${profileId}`;

export const PROFILES_COLLECTION = "profiles";