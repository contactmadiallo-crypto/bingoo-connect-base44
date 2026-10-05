import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { notifyOwner } from '../../shared/notifyOwner.ts';
import { clip, escapeHtml, exceedsRate, TOO_MANY_REQUESTS } from '../../shared/publicGuards.ts';

// Public endpoint: a visitor (often anonymous) saw someone's Bingoo profile and wants
// their own. Creates a ProspectLead plus an in-app notification for the profile owner and
// (optionally) an owner email. Uses the service role so the owner notification is created
// reliably regardless of the visitor's auth state.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const source_profile_id = clip(body.source_profile_id, 64);
    const source_device_code = clip(body.source_device_code, 64);
    const visitor_name = clip(body.visitor_name, 200);
    const visitor_email = clip(body.visitor_email, 200);
    const visitor_phone = clip(body.visitor_phone, 50);
    const interested_in = clip(body.interested_in, 100) || 'NFC Card';

    if (!source_profile_id) {
      return Response.json({ error: 'source_profile_id is required' }, { status: 400 });
    }

    // Look up the profile to find its owner
    let profile = null;
    try {
      profile = await base44.asServiceRole.entities.Profile.get(source_profile_id);
    } catch (e) {
      console.error('Prospect profile lookup failed:', e.message);
    }
    if (!profile || profile.is_active !== true) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 });
    }

    // Throttle (DB-backed): per source profile
    if (await exceedsRate(base44.asServiceRole.entities.ProspectLead, { source_profile_id }, 20, 10 * 60 * 1000)) {
      return Response.json(TOO_MANY_REQUESTS, { status: 429 });
    }

    const ownerUserId = profile?.created_by_id || null;
    const appOrigin = Deno.env.get('APP_ORIGIN') || 'https://bingooconnect.com';

    // Idempotency: skip if an identical prospect was created in the last 60 seconds
    try {
      const recent = await base44.asServiceRole.entities.ProspectLead.filter(
        { source_profile_id, visitor_email: visitor_email || '' },
        '-created_date',
        1
      );
      if (recent.length > 0) {
        const ageMs = Date.now() - new Date(recent[0].created_date).getTime();
        if (ageMs < 60000) {
          console.log('Duplicate prospect suppressed:', recent[0].id);
          return Response.json({ success: true, prospect: recent[0], duplicate: true });
        }
      }
    } catch (e) {
      console.error('Prospect idempotency check failed (non-blocking):', e.message);
    }

    const prospect = await base44.asServiceRole.entities.ProspectLead.create({
      source_profile_id,
      source_device_code: source_device_code || '',
      visitor_name: visitor_name || '',
      visitor_email: visitor_email || '',
      visitor_phone: visitor_phone || '',
      interested_in,
      status: 'new',
      created_at: new Date().toISOString(),
    });
    console.log(`ProspectLead created: ${prospect.id} for profile ${source_profile_id}`);

    const actionUrl = `/bingoo?view=leads&profileId=${source_profile_id}&leadId=${prospect.id}`;

    // Owner in-app + push notification (previously in-app only), localized to the owner
    await notifyOwner(base44, {
      userId: ownerUserId,
      profileId: source_profile_id,
      eventType: 'new_lead',
      template: 'new_prospect',
      vars: { name: visitor_name, interest: interested_in, email: visitor_email },
      actionUrl,
      relatedId: prospect.id,
      actorName: visitor_name || 'Anonymous',
    });

    // Owner email (concise — no sensitive visitor details beyond name + interest)
    try {
      if (profile?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.email,
          from_name: 'Bingoo Connect',
          subject: `✨ Someone wants their own Bingoo profile after viewing yours`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:20px;">✨ New Prospect</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Someone liked your profile and wants their own</p>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;"><strong>${escapeHtml(visitor_name) || 'A visitor'}</strong> is interested in: <strong>${escapeHtml(interested_in)}</strong>.</p>
    <p style="margin:0;color:#64748b;font-size:14px;">They've been directed to create their own free profile. This is a great sign your profile is getting noticed!</p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Bingoo Connect</p>
</div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Prospect owner email failed (non-blocking):', emailErr.message);
    }

    return Response.json({ success: true, prospect });
  } catch (error) {
    console.error('createPublicProspect error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});