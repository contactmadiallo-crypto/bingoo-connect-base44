import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { profile_id, name, phone, email, message, preferred_contact_method } = body;

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Use service role so unauthenticated visitors can submit leads
    const lead = await base44.asServiceRole.entities.Lead.create({
      profile_id,
      name: name || '',
      phone: phone || '',
      email: email || '',
      message: message || '',
      preferred_contact_method: preferred_contact_method || 'WhatsApp',
    });

    // Look up the profile owner to notify them
    try {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: profile_id });
      const profile = profiles?.[0];
      if (profile?.email) {
        const contactIcon = preferred_contact_method === 'WhatsApp' ? '💬' : preferred_contact_method === 'Phone' ? '📞' : '📧';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          subject: `⭐ New Lead from ${name || 'Someone'} via your Bingoo profile`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">⭐ New Lead!</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Someone filled out your Request Info form</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 16px;font-size:16px;color:#1e293b;">Contact Details</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">👤 Name</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${name || 'Not provided'}</td></tr>
      ${email ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📧 Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#3b82f6;">${email}</a></td></tr>` : ''}
      ${phone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📞 Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${phone}" style="color:#3b82f6;">${phone}</a></td></tr>` : ''}
      ${preferred_contact_method ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">Prefers</td><td style="padding:8px 0;font-size:14px;">${contactIcon} ${preferred_contact_method}</td></tr>` : ''}
      ${message ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;vertical-align:top;">💬 Message</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${message}</td></tr>` : ''}
    </table>
  </div>
  ${phone ? `
  <div style="display:flex;gap:12px;margin-bottom:16px;text-align:center;">
    <a href="https://wa.me/${phone.replace(/[^0-9]/g,'')}" 
       style="flex:1;display:block;background:#25D366;color:white;padding:10px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
      💬 WhatsApp
    </a>
    <a href="tel:${phone}" 
       style="flex:1;display:block;background:#3b82f6;color:white;padding:10px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
      📞 Call
    </a>
  </div>` : ''}
  <div style="text-align:center;">
    <a href="${Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com'}/bingoo?tab=leads" 
       style="display:inline-block;background:#0B2E6B;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
      View All Leads →
    </a>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect · This lead came from your public profile</p>
</div>
          `,
        });
      }
    } catch (notifErr) {
      console.error('Lead notification email failed (non-blocking):', notifErr.message);
    }

    return Response.json({ success: true, lead });
  } catch (error) {
    console.error('createPublicLead error:', error.message, JSON.stringify(error));
    return Response.json({ error: error.message }, { status: 500 });
  }
});