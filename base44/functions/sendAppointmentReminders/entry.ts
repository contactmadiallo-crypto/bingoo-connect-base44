import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled task — runs hourly via automation.
// Finds appointments happening in the next 2–26 hours that have not yet been
// reminded, creates an in-app notification, and sends a web push to the owner.
// Uses the service role (no user auth) so it can run from a scheduled trigger.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const windowStart = new Date(now.getTime() + 2 * 3600 * 1000); // 2h from now
    const windowEnd = new Date(now.getTime() + 26 * 3600 * 1000);   // 26h from now

    // Active appointments that might need reminding
    const appointments = await base44.asServiceRole.entities.Appointment.filter({
      status: { $in: ['confirmed', 'accepted', 'pending'] },
    });

    let reminded = 0;
    let skipped = 0;

    for (const appt of appointments) {
      if (!appt.date || !appt.time_slot) { skipped++; continue; }
      if (appt.reminder_sent_at) { skipped++; continue; }

      // Parse appointment time as UTC (date "YYYY-MM-DD" + time_slot "HH:MM")
      const apptTime = new Date(appt.date + 'T' + appt.time_slot + ':00Z');
      if (isNaN(apptTime.getTime())) { skipped++; continue; }

      if (apptTime < windowStart || apptTime > windowEnd) { skipped++; continue; }

      const ownerUserId = appt.owner_user_id;
      if (!ownerUserId) { skipped++; continue; }

      const actionUrl = `/bingoo?view=appointments&profileId=${appt.profile_id}&appointmentId=${appt.id}`;
      const whenStr = `${appt.date} at ${appt.time_slot}`;
      const serviceLabel = appt.service_name || 'Appointment';

      try {
        // In-app notification
        await base44.asServiceRole.entities.BingooNotification.create({
          user_id: ownerUserId,
          profile_id: appt.profile_id,
          event_type: 'appointment_reminder',
          title: '⏰ Appointment reminder',
          message: `${serviceLabel} with ${appt.visitor_name} — ${whenStr}`,
          is_read: false,
          action_url: actionUrl,
          related_id: appt.id,
          actor_name: appt.visitor_name,
        });

        // Web push notification
        await base44.asServiceRole.functions.invoke('sendPushNotification', {
          user_id: ownerUserId,
          title: '⏰ Appointment reminder',
          body: `${serviceLabel} with ${appt.visitor_name} — ${whenStr}`,
          url: actionUrl,
          _internalToken: Deno.env.get('VAPID_PRIVATE_KEY'),
        });

        // Mark reminded so we don't send again
        await base44.asServiceRole.entities.Appointment.update(appt.id, {
          reminder_sent_at: now.toISOString(),
        });

        reminded++;
      } catch (err) {
        console.error(`Reminder failed for appt ${appt.id}:`, err.message);
      }
    }

    return Response.json({ success: true, reminded, skipped, checked: appointments.length, window: { start: windowStart.toISOString(), end: windowEnd.toISOString() } });
  } catch (error) {
    console.error('sendAppointmentReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});