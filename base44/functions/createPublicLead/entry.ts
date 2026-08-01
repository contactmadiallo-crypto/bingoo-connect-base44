import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
    const { profile_id, ...formData } = body;

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Look up profile to get owner
    let profile = null;
    try {
      profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    } catch (e) {
      console.error('Profile lookup failed:', e.message);
    }

    const ownerUserId = profile?.created_by_id || null;
    const appOrigin = Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com';

    // ── Entitlement: owner must have lead_collection feature ──
    const ownerPlan = await getOwnerPlan(base44, ownerUserId);
    if (!PRO_TIER_PLANS.has(ownerPlan)) {
      return Response.json({
        error: 'This profile does not support lead collection. The owner needs a Professional plan or above.',
      }, { status: 403 });
    }

    // ── Idempotency: if an identical lead was created in the last 5 seconds,
    //    return it instead of creating a duplicate (double-submit / retry guard).
    try {
      const recent = await base44.asServiceRole.entities.Lead.filter(
        { profile_id, email: formData.email || '', phone: formData.phone || '' },
        '-created_date',
        1
      );
      if (recent.length > 0) {
        const ageMs = Date.now() - new Date(recent[0].created_date).getTime();
        if (ageMs < 5000) {
          console.log('Duplicate lead suppressed (recent identical lead):', recent[0].id);
          return Response.json({ success: true, lead: recent[0], duplicate: true });
        }
      }
    } catch (e) {
      console.error('Idempotency check failed (non-blocking):', e.message);
    }

    // Create the lead (unauthenticated visitors allowed via service role)
    const lead = await base44.asServiceRole.entities.Lead.create({
      ...formData,
      profile_id,
      owner_user_id: ownerUserId,
      status: 'new',
      source: formData.source || 'profile',
      preferred_contact_method: formData.preferred_contact_method || 'WhatsApp',
    });

    console.log(`Lead created: ${lead.id} for profile ${profile_id}, owner: ${ownerUserId}`);

    // Deep link to the Leads page with the profile selected and the lead highlighted
    const actionUrl = `/bingoo?view=leads&profileId=${profile_id}&leadId=${lead.id}`;

    // Create in-app notification for the profile owner
    if (ownerUserId) {
      try {
        await base44.asServiceRole.entities.BingooNotification.create({
          user_id: ownerUserId,
          profile_id,
          event_type: 'new_lead',
          title: `New lead from ${formData.name || 'Someone'}`,
          message: formData.message || (formData.phone ? `📞 ${formData.phone}` : formData.email || ''),
          is_read: false,
          action_url: actionUrl,
          related_id: lead.id,
          actor_name: formData.name || 'Anonymous',
        });
        console.log(`Notification created for user ${ownerUserId}`);
      } catch (notifErr) {
        console.error('Notification creation failed (non-blocking):', notifErr.message);
      }
    }

    // Send web push notification to the profile owner (if opted in)
    if (ownerUserId) {
      try {
        await base44.asServiceRole.functions.invoke('sendPushNotification', {
          user_id: ownerUserId,
          title: `⭐ New lead from ${formData.name || 'Someone'}`,
          body: formData.message || (formData.phone ? `📞 ${formData.phone}` : formData.email || 'Tap to view details'),
          url: actionUrl,
          _internalToken: Deno.env.get('VAPID_PRIVATE_KEY'),
        });
      } catch (pushErr) {
        console.error('Push notification failed (non-blocking):', pushErr.message);
      }
    }

    // Send email notification to the profile owner
    try {
      const { name, email, phone, message, preferred_contact_method } = formData;

      // HTML-escape all user-supplied values before interpolating into email HTML
      const eName = escapeHtml(name || 'Not provided');
      const eEmail = escapeHtml(email);
      const ePhone = escapeHtml(phone);
      const ePref = escapeHtml(preferred_contact_method);
      const eMessage = escapeHtml(message);
      const eSubjectName = escapeHtml(name || 'Someone');
      // phone with non-digits stripped — safe for wa.me URL
      const waPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

      if (profile?.email) {
        const contactIcon = preferred_contact_method === 'WhatsApp' ? '💬' : preferred_contact_method === 'Phone' ? '📞' : '📧';
        const ctaUrl = `${appOrigin}${actionUrl}`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          subject: `⭐ New Lead from ${eSubjectName} via your Bingoo profile`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">⭐ New Lead!</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Someone filled out your Request Info form</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 16px;font-size:16px;color:#1e293b;">Contact Details</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">👤 Name</td><td style="padding:8px 0;font-weight:600;color:#1e293b;font-size:14px;">${eName}</td></tr>
      ${email ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📧 Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${eEmail}" style="color:#3b82f6;">${eEmail}</a></td></tr>` : ''}
      ${phone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">📞 Phone</td><td style="padding:8px 0;font-size:14px;"><a href="tel:${ePhone}" style="color:#3b82f6;">${ePhone}</a></td></tr>` : ''}
      ${preferred_contact_method ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">Prefers</td><td style="padding:8px 0;font-size:14px;">${contactIcon} ${ePref}</td></tr>` : ''}
      ${message ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;vertical-align:top;">💬 Message</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">${eMessage}</td></tr>` : ''}
    </table>
  </div>
  ${phone ? `
  <div style="display:flex;gap:12px;margin-bottom:16px;text-align:center;">
    <a href="https://wa.me/${waPhone}" 
       style="flex:1;display:block;background:#25D366;color:white;padding:10px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
      💬 WhatsApp
    </a>
    <a href="tel:${ePhone}" 
       style="flex:1;display:block;background:#3b82f6;color:white;padding:10px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
      📞 Call
    </a>
  </div>` : ''}
  <div style="text-align:center;">
    <a href="${ctaUrl}" 
       style="display:inline-block;background:#0B2E6B;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
      View Lead in Dashboard →
    </a>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect · This lead came from your public profile</p>
</div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Lead email notification failed (non-blocking):', emailErr.message);
    }

    return Response.json({ success: true, lead });
  } catch (error) {
    console.error('createPublicLead error:', error.message, JSON.stringify(error));
    return Response.json({ error: error.message }, { status: 500 });
  }
});