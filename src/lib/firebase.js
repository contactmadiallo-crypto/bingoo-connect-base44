/**
 * Firebase — stub until the firebase npm package is installed.
 * All callers check `db !== null` before using it.
 */
export const db = null;
export const firebaseApp = null;
export const isConfigured = false;
export async function initFirebase() { return { db: null, firebaseApp: null }; }