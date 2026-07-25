import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const VALID_VERIFICATION_TYPES = new Set(['identity', 'business', 'both']);
const WEB_PROTOCOLS = ['http:', 'https:'];
const ALLOWED_DOC_EXT = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'doc', 'docx']);
const MAX_DOCS = 10;
const MAX_DESC = 2000;
const RATE_LIMIT_PENDING = 3;          // max pending requests per profile
const RATE_LIMIT_24H = 5;              // max submissions per profile per 24h

function isUrl(value, protocols) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return false;
  try { const u = new URL(value); return protocols.includes(u.protocol); } catch { return false; }
}

function isAllowedDoc(url) {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const path = u.pathname.toLowerCase();
    const ext = path.split('.').pop();
    return ALLOWED_DOC_EXT.has(ext);
  } catch { return false; }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const profile_id = body?.profile_id;
    const verification_type = body?.verification_type;
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const docUrls = Array.isArray(body?.document_urls) ? body.document_urls : [];
    const idempotencyKey = body?.idempotency_key;

    if (!profile_id) return Response.json({ error: 'profile_id required' }, { status: 400 });
    if (!VALID_VERIFICATION_TYPES.has(verification_type)) {
      return Response.json({ error: 'invalid verification_type' }, { status: 400 });
    }
    if (description.length > MAX_DESC) {
      return Response.json({ error: 'description too long' }, { status: 400 });
    }
    if (docUrls.length > MAX_DOCS) {
      return Response.json({ error: `too many documents (max ${MAX_DOCS})` }, { status: 400 });
    }
    // Validate document URLs + allowed formats.
    const validDocs = [];
    for (const u of docUrls) {
      if (typeof u !== 'string' || !isUrl(u, WEB_PROTOCOLS) || !isAllowedDoc(u)) {
        return Response.json({ error: 'invalid or unsupported document URL', url: u }, { status: 400 });
      }
      validDocs.push(u);
    }
    if (validDocs.length === 0 && description.length === 0) {
      return Response.json({ error: 'evidence required (document_urls or description)' }, { status: 400 });
    }

    // Ownership (owner-only; admin may act on any profile via explicit path).
    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
    const isOwner = profile.created_by_id === user.id;
    if (!isOwner && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const access = (await base44.asServiceRole.entities.ProfileAccess.filter({ profile_id }))[0];
    if (!access || access.access_status !== 'active') {
      return Response.json({ error: `Profile is ${access?.access_status || 'locked'}` }, { status: 403 });
    }
    const ownerId = access.owner_user_id;

    // ── Idempotency: same key → return prior ──────────────────────────────────
    if (idempotencyKey) {
      const prior = await base44.asServiceRole.entities.VerificationRequest.filter({ profile_id, idempotency_key: idempotencyKey });
      if (prior && prior.length) {
        return Response.json({ success: true, status: prior[0].status, request_id: prior[0].id, idempotent: true });
      }
    }

    // ── Reject duplicate pending request ──────────────────────────────────────
    const pending = await base44.asServiceRole.entities.VerificationRequest.filter({ profile_id, status: 'pending' });
    if (pending && pending.length >= RATE_LIMIT_PENDING) {
      return Response.json({ error: 'A pending verification request already exists for this profile' }, { status: 409 });
    }

    // ── Rate limiting: submissions in last 24h ─────────────────────────────────
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = await base44.asServiceRole.entities.VerificationRequest.filter({ profile_id });
    const recentCount = (recent || []).filter((r) => (r.created_date || '') >= cutoff).length;
    if (recentCount >= RATE_LIMIT_24H) {
      return Response.json({ error: 'Too many verification requests. Please try again later.' }, { status: 429 });
    }

    // ── Store evidence in structured fields (not interpolated into a message) ─
    const vr = await base44.asServiceRole.entities.VerificationRequest.create({
      profile_id, owner_user_id: ownerId, verification_type,
      description: description || null, document_urls: validDocs,
      status: 'pending', idempotency_key: idempotencyKey || null,
    });

    // Owner may only set status to pending. Never is_verified / approved.
    await base44.asServiceRole.entities.Profile.update(profile_id, { verification_status: 'pending' });

    // Admin queue ticket (generic, no untrusted interpolation).
    await base44.asServiceRole.entities.SupportTicket.create({
      user_id: user.id,
      user_email: (user.email || '').toLowerCase(),
      user_name: user.full_name || profile.display_name || '',
      subject: `Verification Request (${verification_type})`,
      message: `Verification request submitted for review. See VerificationRequest record.`,
      category: 'verification',
      priority: 'medium',
      status: 'open',
      related_entity_type: 'VerificationRequest',
      related_entity_id: vr.id,
    });

    await base44.asServiceRole.entities.AdminAuditLog.create({
      action: 'verification_request_submitted',
      performed_by: user.id,
      performed_by_name: user.full_name || '',
      performed_by_email: (user.email || '').toLowerCase(),
      target_type: 'VerificationRequest',
      target_id: vr.id,
      new_value: JSON.stringify({ verification_type, status: 'pending' }),
      notes: 'Owner submitted verification request',
    }).catch(() => {});

    return Response.json({ success: true, status: 'pending', request_id: vr.id });
  } catch (error) {
    console.error('submitVerificationRequest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});