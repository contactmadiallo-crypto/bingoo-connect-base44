/**
 * useFirestoreNotifications — Firestore shadow read for notification POC
 *
 * SAFETY RULES:
 * - Never throws to the caller; all errors are caught internally.
 * - Returns { notifications: [], unreadCount: 0 } on any error.
 * - Read-only — never writes to Firestore in this POC.
 * - Only subscribes when userId is present and Firebase is configured.
 * - Uses dynamic import so build succeeds even if firebase npm package is absent.
 *
 * Firestore path: /notificationsFB/{userId}/items/{notifId}
 */

import { useEffect, useState } from "react";
import { initFirebase, isConfigured } from "@/lib/firebase";

export function useFirestoreNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !isConfigured) return;

    let unsubscribe = null;
    let cancelled = false;

    initFirebase().then(({ db }) => {
      if (cancelled || !db) return;

      // Dynamic import of Firestore helpers (safe if package absent)
      return import("firebase/firestore").then(({ collection, query, orderBy, limit, onSnapshot }) => {
        if (cancelled) return;

        try {
          const notifRef = collection(db, "notificationsFB", userId, "items");
          const q = query(notifRef, orderBy("created_date", "desc"), limit(50));

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              if (cancelled) return;
              const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setNotifications(docs);
              setError(null);
            },
            (err) => {
              console.warn("[Firebase Notifications] onSnapshot error:", err.message);
              setError(err.message);
              setNotifications([]);
            }
          );
        } catch (e) {
          console.warn("[Firebase Notifications] Setup error:", e.message);
          setError(e.message);
        }
      });
    }).catch((e) => {
      console.warn("[Firebase Notifications] Package unavailable:", e.message);
      setError(e.message);
    });

    return () => {
      cancelled = true;
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) { /* ignore */ }
      }
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, error };
}