import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const VALID_VERIFICATION_TYPES = new Set(['identity', 'business', 'both']);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const profile_id = body?.profile_id;
    const verification_type = body?.verification_type;
    const evidence = body?.evidence || {};

    if (!profile_id) return Response.json({ error: 'profile_id required' }, { status: 400 });
    if (!VALID_VERIFICATION_TYPES.has(verification_type)) {
      return Response.json({ error: 'invalid verification_type' }, { status: 400 });
    }
    // Required evidence: at least a non-empty description or document_urls.
    const docUrls = Array.isArray(evidence.document_urls) ? evidence.document_urls.filter((u) => typeof u === 'string' && u) : [];
    const description = typeof evidence.description === 'string' ? evidence.description.trim() : '';
    if (docUrls.length === 0 && description.length === 0) {
      return Response.json({ error: 'evidence required (document_urls or description)' }, { status: 400 });
    }

    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const access = (await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id }))[0];
    if (!access || access.owner_user_id !== user.id) {
      return Response.json({ error: 'Access record mismatch' }, { status: 403 });
    }
    if (access.access_status !== 'active') {
      return Response.json({ error: `Profile is ${access.access_status}` }, { status: 403 });
    }

    // Owner may only set status to pending. Never is_verified, never approved.
    // verification_type is recorded in the ticket for admin review; Profile.verification_type
    // stays untouched until an admin approval function acts.
    await base44.asServiceRole.entities.SupportTicket.create({
      user_id: user.id,
      user_email: (user.email || '').toLowerCase(),
      user_name: user.full_name || profile.display_name || '',
      subject: `Verification Request (${verification_type})`,
      message: `Profile: ${profile.display_name} (@${profile.username}). Type: ${verification_type}. Description: ${description || '(none)'}. Documents: ${docUrls.join(', ') || '(none)'}`,
      category: 'verification',
      priority: 'medium',
      status: 'open',
    });

    await base44.asServiceRole.entities.Profile.update(profile_id, { verification_status: 'pending' });

    await base44.asServiceRole.entities.AdminAuditLog.create({
      action: 'verification_request_submitted',
      performed_by: user.id,
      performed_by_name: user.full_name || '',
      performed_by_email: (user.email || '').toLowerCase(),
      target_type: 'Profile',
      target_id: profile_id,
      new_value: JSON.stringify({ verification_type, status: 'pending' }),
      notes: 'Owner submitted verification request',
    }).catch(() => {});

    return Response.json({ success: true, verification_status: 'pending' });
  } catch (error) {
    console.error('submitVerificationRequest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});