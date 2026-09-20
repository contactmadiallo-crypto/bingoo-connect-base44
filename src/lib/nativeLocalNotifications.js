import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

function appointmentDate(appointment) {
  if (!appointment?.date || !appointment?.time_slot) return null;
  const time = String(appointment.time_slot).slice(0, 5);
  const value = new Date(`${appointment.date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function notificationId(appointmentId, offsetMinutes) {
  const raw = `${appointmentId}:${offsetMinutes}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  return Math.abs(hash || 1);
}

export async function ensureLocalNotificationPermission() {
  if (!isNativeAndroid()) return { supported: false, permission: "unsupported" };
  let status = await LocalNotifications.checkPermissions();
  if (status.display === "prompt" || status.display === "prompt-with-rationale") {
    status = await LocalNotifications.requestPermissions();
  }
  return { supported: true, permission: status.display, enabled: status.display === "granted" };
}

export async function scheduleAppointmentReminders(appointments = []) {
  if (!isNativeAndroid()) return { scheduled: 0 };
  const permission = await ensureLocalNotificationPermission();
  if (!permission.enabled) return { scheduled: 0, permission: permission.permission };

  const pending = await LocalNotifications.getPending();
  const managedIds = (pending.notifications || [])
    .filter((n) => n.extra?.bingooType === "appointment")
    .map((n) => n.id);
  if (managedIds.length) {
    await LocalNotifications.cancel({ notifications: managedIds.map((id) => ({ id })) });
  }

  const now = Date.now();
  const notifications = [];
  for (const appointment of appointments) {
    if (["cancelled", "canceled", "declined", "completed", "no_show"].includes(appointment?.status)) continue;
    const start = appointmentDate(appointment);
    if (!start || start.getTime() <= now) continue;

    const reminders = [
      { minutes: 24 * 60, label: "tomorrow" },
      { minutes: 60, label: "in 1 hour" },
    ];
    for (const reminder of reminders) {
      const at = new Date(start.getTime() - reminder.minutes * 60 * 1000);
      if (at.getTime() <= now) continue;
      notifications.push({
        id: notificationId(appointment.id, reminder.minutes),
        title: "Upcoming Bingoo appointment",
        body: `${appointment.visitor_name || "Client"} · ${appointment.service_name || "Appointment"} ${reminder.label}`,
        schedule: { at, allowWhileIdle: true },
        extra: {
          bingooType: "appointment",
          appointmentId: appointment.id,
          profileId: appointment.profile_id || "",
          route: `/bingoo?view=appointments&profileId=${encodeURIComponent(appointment.profile_id || "")}&appointmentId=${encodeURIComponent(appointment.id)}`,
        },
      });
    }
  }

  if (notifications.length) await LocalNotifications.schedule({ notifications });
  return { scheduled: notifications.length, permission: permission.permission };
}
