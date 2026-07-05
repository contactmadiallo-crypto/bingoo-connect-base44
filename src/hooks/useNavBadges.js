import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Maps notification event_type → array of sidebar nav item ids that should badge
const EVENT_TO_NAV = {
  new_lead: ["leads", "crm"],
  new_appointment: ["appointments"],
  appointment_confirmed: ["appointments"],
  appointment_cancelled: ["appointments"],
  appointment_rescheduled: ["appointments"],
  appointment_reminder: ["appointments"],
  nfc_activated: ["devices"],
  lost_device_reported: ["lostmode"],
  subscription_created: ["billing"],
  subscription_updated: ["billing"],
  subscription_canceled: ["billing"],
  payment_failed: ["billing"],
  new_contact: ["connections"],
  new_review: ["analytics"],
  security_alert: ["analytics"],
};

/**
 * Fetches BingooNotification records for the current user and maps unread ones
 * to sidebar nav item IDs. Returns { badgeMap, totalUnread }.
 *
 * - `totalUnread` counts ALL unread notifications (for the bell icon).
 * - `badgeMap` only counts notifications for the currently selected profile,
 *   so per-nav badges match the data on the page you're viewing.
 *
 * Uses the SAME query key as NotificationCenter so they share one cache.
 */
export function useNavBadges(userId, profileId) {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["bingoo-notifications", userId],
    queryFn: () =>
      base44.entities.BingooNotification.filter(
        { user_id: userId },
        "-created_date",
        50
      ),
    enabled: !!userId,
    refetchInterval: 30000,
    staleTime: 0,
  });

  // Real-time: refetch when a notification event arrives
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.BingooNotification.subscribe((event) => {
      if (event.data?.user_id === userId) {
        qc.invalidateQueries({ queryKey: ["bingoo-notifications", userId] });
      }
    });
    return () => unsub();
  }, [userId, qc]);

  const badgeMap = {};
  let totalUnread = 0;

  for (const n of notifications) {
    if (n.is_read) continue;
    totalUnread++;

    // Per-nav badges: only for the currently selected profile.
    // When no profile is selected (hub view), show badges for all profiles.
    if (profileId && n.profile_id && n.profile_id !== profileId) continue;

    const navIds = EVENT_TO_NAV[n.event_type];
    if (navIds) {
      for (const navId of navIds) {
        badgeMap[navId] = (badgeMap[navId] || 0) + 1;
      }
    }
  }

  return { badgeMap, totalUnread };
}