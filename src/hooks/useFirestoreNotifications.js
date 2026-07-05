/**
 * useFirestoreNotifications — real-time Firestore shadow reads for notifications POC.
 * Falls back to { notifications: [], unreadCount: 0 } if Firebase is not configured.
 * Read-only — never writes to Firestore.
 *
 * Firestore path: /notificationsFB/{userId}/items/{notifId}
 */

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, isConfigured } from "@/lib/firebase";

export function useFirestoreNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !isConfigured) return;

    let unsubscribe = null;
    let active = true;

    (async () => {
      const db = await getFirebaseDb();
      if (!active || !db) return;

      try {
        const notifRef = collection(db, "notificationsFB", userId, "items");
        const q = query(notifRef, orderBy("created_date", "desc"), limit(50));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
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
    })();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, error };
}