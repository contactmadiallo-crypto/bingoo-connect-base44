import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      profile_id, visitor_name, visitor_email, visitor_phone,
      date, time_slot, notes, restricted_emails, duration,
      service_name, stylist_name, guest_count, case_type, a_number, case_number,
      source = "profile"
    } = body;

    if (!profile_id || !visitor_name || !visitor_email) {
      return Response.json({ error: 'profile_id, visitor_name, and visitor_email are required' }, { status: 400 });
    }

    // Email restriction check
    if (restricted_emails?.length && !restricted_emails.includes(visitor_email)) {
      return Response.json({ error: 'Booking is restricted to approved emails only.' }, { status: 403 });
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

    // Create in-app notification for profile owner
    if (ownerUserId) {
      try {
        await base44.asServiceRole.entities.BingooNotification.create({
          user_id: ownerUserId,
          profile_id,
          event_type: 'new_appointment',
          title: `New booking from ${visitor_name}`,
          message: `${date || ''} ${time_slot || ''}${service_name ? ` · ${service_name}` : ''}`.trim(),
          is_read: false,
          action_url: '/bingoo?tab=appointments',
          related_id: appointment.id,
          actor_name: visitor_name,
        });
      } catch (notifErr) {
        console.error('Notification creation failed (non-blocking):', notifErr.message);
      }
    }

    // Notification email to profile owner
    try {
      if (profile?.email) {
        const isRestaurant = profile?.plan === "restaurant";
        const isLawFirm = profile?.plan === "lawfirm";
        const isSalon = profile?.plan === "salon";

        const subjectEmoji = isRestaurant ? "🍽️" : isLawFirm ? "⚖️" : "📅";
        const actionLabel = isRestaurant ? "Reservation" : "Appointment";

        let detailsHtml = `
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">👤 ${isLawFirm ? "Client" : "Visitor"}</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${visitor_name}</td></tr>
          <tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📧 Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${visitor_email}" style="color:#3b82f6;">${visitor_email}</a></td></tr>
          ${visitor_phone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📞 Phone</td><td style="padding:8px 0;font-size:14px;">${visitor_phone}</td></tr>` : ''}
          ${date ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📆 Date</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${date}</td></tr>` : ''}
          ${time_slot ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">⏰ Time</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${time_slot}</td></tr>` : ''}
          ${service_name ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">${isLawFirm ? "⚖️ Case Type" : isSalon ? "✂️ Service" : "🎯 Service"}</td><td style="padding:8px 0;font-size:14px;">${service_name}</td></tr>` : ''}
          ${stylist_name ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">✂️ Stylist</td><td style="padding:8px 0;font-size:14px;">${stylist_name}</td></tr>` : ''}
          ${guest_count ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">👥 Guests</td><td style="padding:8px 0;font-size:14px;">${guest_count}</td></tr>` : ''}
          ${a_number ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">🔢 A-Number</td><td style="padding:8px 0;font-size:14px;">${a_number}</td></tr>` : ''}
          ${case_number ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📋 Case #</td><td style="padding:8px 0;font-size:14px;">${case_number}</td></tr>` : ''}
          ${notes ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📝 Notes</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${notes}</td></tr>` : ''}
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          subject: `${subjectEmoji} New ${actionLabel} Request from ${visitor_name}`,
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
    <a href="${'https://bingooconnect.com'}/bingoo?tab=appointments" 
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
      console.error('Notification email failed (non-blocking):', notifErr.message);
    }

    return Response.json({ success: true, appointment });
  } catch (error) {
    console.error('createPublicAppointment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});