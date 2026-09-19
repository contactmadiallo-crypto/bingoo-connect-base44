import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED = new Set(['account_deletion','data_export','data_correction','document_deletion']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const requestType = String(body.request_type || '').trim();
    if (!ALLOWED.has(requestType)) return Response.json({ error: 'Invalid request type' }, { status: 400 });

    const user = await base44.auth.me().catch(() => null);
    const email = String(user?.email || body.email || '').trim().toLowerCase();
    const fullName = String(user?.full_name || body.full_name || '').trim();
    const details = String(body.details || '').trim().slice(0, 5000);
    if (!email || !/\S+@\S+\.\S+/.test(email)) return Response.json({ error: 'Valid email is required' }, { status: 400 });

    const identityVerified = !!user;
    const record = await base44.asServiceRole.entities.PrivacyRequest.create({
      request_type: requestType,
      status: identityVerified ? 'verified' : 'identity_verification_required',
      user_id: user?.id || '',
      email,
      full_name: fullName,
      details,
      identity_verified: identityVerified,
      submitted_at: new Date().toISOString(),
      source: user ? 'account_settings' : 'public_privacy_form',
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: 'privacy@bingooconnect.com',
        subject: `Privacy Request — ${requestType} — ${email}`,
        body: `Request ID: ${record.id}\nType: ${requestType}\nEmail: ${email}\nName: ${fullName}\nAuthenticated: ${identityVerified ? 'Yes' : 'No - verify identity before processing'}\n\nDetails:\n${details}`,
      });
    } catch (e) { console.warn('Privacy notification email failed:', e?.message); }

    return Response.json({ ok: true, request_id: record.id, identity_verified: identityVerified });
  } catch (error) {
    console.error('submitPrivacyRequest:', error?.message, error?.stack);
    return Response.json({ error: 'Unable to submit privacy request' }, { status: 500 });
  }
});
