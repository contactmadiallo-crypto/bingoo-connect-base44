import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { profile_id, visitor_name, visitor_email, visitor_phone, date, time_slot, notes } = body;

    if (!profile_id || !visitor_name || !visitor_email) {
      return Response.json({ error: 'profile_id, visitor_name, and visitor_email are required' }, { status: 400 });
    }

    // Use service role so unauthenticated visitors can book appointments
    const appointment = await base44.asServiceRole.entities.Appointment.create({
      profile_id,
      visitor_name,
      visitor_email,
      visitor_phone: visitor_phone || '',
      date,
      time_slot,
      notes: notes || '',
      status: 'pending',
    });

    // Look up the profile owner to notify them
    try {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: profile_id });
      const profile = profiles?.[0];
      if (profile?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          subject: `📅 New Appointment Request from ${visitor_name}`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">📅 New Appointment Request</h1>
    <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">Someone wants to book time with you!</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 16px;font-size:16px;color:#1e293b;">Booking Details</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">👤 Visitor</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${visitor_name}</td></tr>
      <tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📧 Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${visitor_email}" style="color:#3b82f6;">${visitor_email}</a></td></tr>
      ${visitor_phone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📞 Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${visitor_phone}" style="color:#3b82f6;">${visitor_phone}</a></td></tr>` : ''}
      ${date ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📆 Date</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${date}</td></tr>` : ''}
      ${time_slot ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">⏰ Time</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${time_slot}</td></tr>` : ''}
      ${notes ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📝 Notes</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${notes}</td></tr>` : ''}
    </table>
  </div>
  <div style="text-align:center;">
    <a href="${Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com'}/bingoo?tab=appointments" 
       style="display:inline-block;background:#0B2E6B;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
      View in Dashboard →
    </a>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect · Reply to this email to contact the visitor directly</p>
</div>
          `,
        });
      }
    } catch (notifErr) {
      console.error('Notification email failed (non-blocking):', notifErr.message);
    }

    return Response.json({ success: true, appointment });
  } catch (error) {
    console.error('createPublicAppointment error:', error.message, JSON.stringify(error));
    return Response.json({ error: error.message }, { status: 500 });
  }
});