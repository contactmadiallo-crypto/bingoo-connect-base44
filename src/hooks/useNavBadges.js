import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Maps notification event_type → sidebar nav item id
const EVENT_TO_NAV = {
  new_lead: "leads",
  new_appointment: "appointments",
  appointment_confirmed: "appointments",
  appointment_cancelled: "appointments",
  appointment_rescheduled: "appointments",
  appointment_reminder: "appointments",
  nfc_activated: "devices",
  lost_device_reported: "lostmode",
  subscription_created: "billing",
  subscription_updated: "billing",
  subscription_canceled: "billing",
  payment_failed: "billing",
  new_contact: "connections",
  new_review: "analytics",
};

/**
 * Fetches unread BingooNotification records for the current user and maps them
 * to sidebar nav item IDs. Returns { badgeMap, totalUnread }.
 * badgeMap: { leads: 2, appointments: 1, ... }
 * totalUnread: total count of all unread notifications
 */
export function useNavBadges(userId) {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["bingoo-notifications", userId],
    queryFn: () =>
      base44.entities.BingooNotification.filter(
        { user_id: userId, is_read: false },
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
    const navId = EVENT_TO_NAV[n.event_type];
    if (navId) {
      badgeMap[navId] = (badgeMap[navId] || 0) + 1;
    }
  }

  return { badgeMap, totalUnread };
}