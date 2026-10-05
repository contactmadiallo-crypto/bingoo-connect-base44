import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { notifyOwner } from '../../shared/notifyOwner.ts';
import { clip, exceedsRate, EMAIL_RE, TOO_MANY_REQUESTS } from '../../shared/publicGuards.ts';

// ── Server-side plan entitlement (mirrors getUserFeatures) ──────────────────
// Professional-tier plans include lead_collection + appointment_booking.
const PRO_TIER_PLANS = new Set(['professional', 'pro', 'business', 'salon', 'restaurant', 'lawfirm', 'corporate']);

// HTML entity escaper — prevents HTML/script injection in email bodies.
function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function normalizePlan(plan) {
  if (!plan) return 'free';
  if (plan === 'pro') return 'professional';
  return PRO_TIER_PLANS.has(plan) ? plan : 'free';
}

async function getOwnerPlan(base44, ownerUserId) {
  if (!ownerUserId) return 'free';
  let ownerEmail = null;
  try {
    const owner = await base44.asServiceRole.entities.User.get(ownerUserId);
    ownerEmail = owner?.email;
  } catch (e) {
    console.error('Owner user lookup failed:', e.message);
  }
  if (!ownerEmail) return 'free';

  const subs = await base44.asServiceRole.entities.Subscription.filter({ customer_email: ownerEmail });
  const sub = subs?.[0];
  if (sub && (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due')) {
    return normalizePlan(sub.plan);
  }
  // Legacy grace: users with existing profiles but no subscription get Professional
  try {
    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: ownerUserId });
    if (profiles.length > 0) return 'professional';
  } catch (e) {}
  return 'free';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    let {
      profile_id, visitor_name, visitor_email, visitor_phone,
      date, time_slot, notes, duration,
      service_name, stylist_name, guest_count, case_type, a_number, case_number,
      source = "profile"
    } = body;

    // Bound every free-text value that reaches the DB, the owner's email and Google Calendar.
    profile_id = clip(profile_id, 64);
    visitor_name = clip(visitor_name, 200);
    visitor_email = clip(visitor_email, 200);
    visitor_phone = clip(visitor_phone, 50);
    date = date ? clip(date, 10) : date;
    time_slot = time_slot ? clip(time_slot, 5) : time_slot;
    notes = clip(notes, 2000);
    service_name = service_name ? clip(service_name, 200) : service_name;
    stylist_name = stylist_name ? clip(stylist_name, 200) : stylist_name;
    case_type = case_type ? clip(case_type, 200) : case_type;
    a_number = a_number ? clip(a_number, 100) : a_number;
    case_number = case_number ? clip(case_number, 100) : case_number;

    if (!profile_id || !visitor_name || !visitor_email) {
      return Response.json({ error: 'profile_id, visitor_name, and visitor_email are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(visitor_email)) {
      return Response.json({ error: 'A valid visitor_email is required' }, { status: 400 });
    }
    if ((date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) || (time_slot && !/^\d{2}:\d{2}$/.test(time_slot))) {
      return Response.json({ error: 'Invalid date or time slot' }, { status: 400 });
    }

    // Fetch profile
    let profile = null;
    let ownerUserId = null;
    try {
      profile = await base44.asServiceRole.entities.Profile.get(profile_id);
      ownerUserId = profile?.created_by_id || null;
    } catch (e) {
      console.error('Profile lookup failed:', e.message);
    }

    if (!profile || profile.is_active !== true) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 });
    }

    // Email restriction: enforced from the stored profile, never from the request body.
    const restricted = (Array.isArray(profile.booking_restricted_emails) ? profile.booking_restricted_emails : [])
      .map((e: unknown) => String(e).trim().toLowerCase())
      .filter(Boolean);
    if (restricted.length && !restricted.includes(visitor_email.toLowerCase())) {
      return Response.json({ error: 'Booking is restricted to approved emails only.' }, { status: 403 });
    }

    // ── Throttle (DB-backed): per profile, and per visitor email ──
    const AppointmentEntity = base44.asServiceRole.entities.Appointment;
    if (await exceedsRate(AppointmentEntity, { profile_id }, 20, 10 * 60 * 1000)
      || await exceedsRate(AppointmentEntity, { profile_id, visitor_email }, 3, 10 * 60 * 1000)) {
      return Response.json(TOO_MANY_REQUESTS, { status: 429 });
    }

    // ── Entitlement: owner must have appointment_booking feature + booking_enabled ──
    const ownerPlan = await getOwnerPlan(base44, ownerUserId);
    if (!PRO_TIER_PLANS.has(ownerPlan)) {
      return Response.json({
        error: 'This profile does not support appointment booking. The owner needs a Professional plan or above.',
      }, { status: 403 });
    }
    if (profile?.booking_enabled !== true) {
      return Response.json({
        error: 'Appointment booking is not enabled for this profile.',
      }, { status: 403 });
    }

    const appOrigin = Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com';

    // Build appointment record
    const appointmentData = {
      profile_id,
      owner_user_id: ownerUserId,
      visitor_name,
      visitor_email,
      visitor_phone: visitor_phone || '',
      date,
      time_slot,
      notes: notes || '',
      source,
      status: 'pending',
    };

    if (duration) appointmentData.duration = duration;
    if (service_name) appointmentData.service_name = service_name;
    if (stylist_name) appointmentData.stylist_name = stylist_name;
    if (guest_count) appointmentData.guest_count = guest_count;
    if (case_type) appointmentData.case_type = case_type;
    if (a_number) appointmentData.a_number = a_number;
    if (case_number) appointmentData.case_number = case_number;

    const appointment = await base44.asServiceRole.entities.Appointment.create(appointmentData);

    // Deep link to the Appointments page with the profile selected and the appointment highlighted
    const actionUrl = `/bingoo?view=appointments&profileId=${profile_id}&appointmentId=${appointment.id}`;

    // Add event to Google Calendar (non-blocking)
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

      // Build start/end datetimes from date + time_slot (e.g. "2026-07-01" + "09:30")
      const durationMins = duration || 30;
      const startDt = date && time_slot ? new Date(`${date}T${time_slot}:00`) : null;
      const endDt = startDt ? new Date(startDt.getTime() + durationMins * 60000) : null;

      const toRfc = (d) => d.toISOString();

      const eventBody = {
        summary: `Booking: ${visitor_name}${service_name ? ` — ${service_name}` : ''}`,
        description: [
          `Profile: ${profile?.display_name || profile_id}`,
          visitor_email ? `Email: ${visitor_email}` : '',
          visitor_phone ? `Phone: ${visitor_phone}` : '',
          stylist_name ? `Stylist: ${stylist_name}` : '',
          guest_count ? `Guests: ${guest_count}` : '',
          case_type ? `Case Type: ${case_type}` : '',
          a_number ? `A-Number: ${a_number}` : '',
          case_number ? `Case #: ${case_number}` : '',
          notes ? `Notes: ${notes}` : '',
          `Source: Bingoo Connect`,
        ].filter(Boolean).join('\n'),
        attendees: [{ email: visitor_email, displayName: visitor_name }],
        ...(startDt && endDt ? {
          start: { dateTime: toRfc(startDt) },
          end: { dateTime: toRfc(endDt) },
        } : {
          start: { date: date },
          end: { date: date },
        }),
      };

      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=externalOnly', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      });

      if (!calRes.ok) {
        const err = await calRes.text();
        console.error('Google Calendar event creation failed:', err);
      } else {
        const calEvent = await calRes.json();
        console.log('Google Calendar event created:', calEvent.id);
      }
    } catch (calErr) {
      console.error('Google Calendar integration failed (non-blocking):', calErr.message);
    }

    // In-app + push notification, written in the owner's language (see shared/notifyOwner.ts).
    // The in-app record stays the durable source of truth; push is best-effort.
    await notifyOwner(base44, {
      userId: ownerUserId,
      profileId: profile_id,
      eventType: 'new_appointment',
      vars: { name: visitor_name, when: `${date || ''} ${time_slot || ''}`.trim(), service: service_name },
      actionUrl,
      relatedId: appointment.id,
      actorName: visitor_name,
    });

    // Use ownerPlan (Subscription-derived) — not profile.plan — for consistent email formatting
    const isRestaurant = ownerPlan === "restaurant";
    const isLawFirm = ownerPlan === "lawfirm";
    const isSalon = ownerPlan === "salon";
    const subjectEmoji = isRestaurant ? "🍽️" : isLawFirm ? "⚖️" : "📅";
    const actionLabel = isRestaurant ? "Reservation" : "Appointment";
    const ownerCtaUrl = `${appOrigin}${actionUrl}`;

    // HTML-escape all user-supplied values before interpolating into email HTML
    const eVisitorName = escapeHtml(visitor_name);
    const eVisitorEmail = escapeHtml(visitor_email);
    const eVisitorPhone = escapeHtml(visitor_phone);
    const eDate = escapeHtml(date);
    const eTimeSlot = escapeHtml(time_slot);
    const eServiceName = escapeHtml(service_name);
    const eStylistName = escapeHtml(stylist_name);
    const eGuestCount = escapeHtml(guest_count);
    const eANumber = escapeHtml(a_number);
    const eCaseNumber = escapeHtml(case_number);
    const eNotes = escapeHtml(notes);

    // Notification email to profile owner
    try {
      if (profile?.email) {
        let detailsHtml = `
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">👤 ${isLawFirm ? "Client" : "Visitor"}</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${eVisitorName}</td></tr>
          <tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📧 Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${eVisitorEmail}" style="color:#3b82f6;">${eVisitorEmail}</a></td></tr>
          ${visitor_phone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📞 Phone</td><td style="padding:8px 0;font-size:14px;">${eVisitorPhone}</td></tr>` : ''}
          ${date ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📆 Date</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${eDate}</td></tr>` : ''}
          ${time_slot ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">⏰ Time</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${eTimeSlot}</td></tr>` : ''}
          ${service_name ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">${isLawFirm ? "⚖️ Case Type" : isSalon ? "✂️ Service" : "🎯 Service"}</td><td style="padding:8px 0;font-size:14px;">${eServiceName}</td></tr>` : ''}
          ${stylist_name ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">✂️ Stylist</td><td style="padding:8px 0;font-size:14px;">${eStylistName}</td></tr>` : ''}
          ${guest_count ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">👥 Guests</td><td style="padding:8px 0;font-size:14px;">${eGuestCount}</td></tr>` : ''}
          ${a_number ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">🔢 A-Number</td><td style="padding:8px 0;font-size:14px;">${eANumber}</td></tr>` : ''}
          ${case_number ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📋 Case #</td><td style="padding:8px 0;font-size:14px;">${eCaseNumber}</td></tr>` : ''}
          ${notes ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📝 Notes</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${eNotes}</td></tr>` : ''}
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          subject: `${subjectEmoji} New ${actionLabel} Request from ${eVisitorName}`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">${subjectEmoji} New ${actionLabel} Request</h1>
    <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">Someone wants to book time with you!</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 16px;font-size:16px;color:#1e293b;">${actionLabel} Details</h2>
    <table style="width:100%;border-collapse:collapse;">${detailsHtml}</table>
  </div>
  <div style="text-align:center;">
    <a href="${ownerCtaUrl}" 
       style="display:inline-block;background:#0B2E6B;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
      View in Dashboard →
    </a>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect</p>
</div>
          `,
        });
      }
    } catch (notifErr) {
      console.error('Owner notification email failed (non-blocking):', notifErr.message);
    }

    // Confirmation email to the visitor (customer-facing)
    try {
      const whenStr = escapeHtml([date, time_slot].filter(Boolean).join(' at '));
      const bizName = escapeHtml(profile?.display_name || profile?.company_name || 'the business');
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: visitor_email,
        from_name: 'Bingoo Connect',
        subject: `${subjectEmoji} Your ${actionLabel} request was received`,
        body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:20px;">${subjectEmoji} ${actionLabel} Request Received</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Hi ${eVisitorName}, we got your request!</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;">You requested a ${actionLabel.toLowerCase()} with <strong>${bizName}</strong>${whenStr ? ` for <strong>${whenStr}</strong>` : ''}${eServiceName ? ` (${eServiceName})` : ''}.</p>
    <p style="margin:0;color:#64748b;font-size:14px;">Your request is pending confirmation. You'll receive an update once it's reviewed.</p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect · Sent on behalf of ${bizName}</p>
</div>
        `,
      });
    } catch (visitorEmailErr) {
      console.error('Visitor confirmation email failed (non-blocking):', visitorEmailErr.message);
    }

    return Response.json({ success: true, appointment });
  } catch (error) {
    console.error('createPublicAppointment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});