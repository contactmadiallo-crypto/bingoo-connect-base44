// tracePracticeAreaSave — READ-ONLY diagnostic.
//
// Previously this function created + deleted a test PracticeArea to trace the
// RLS save lifecycle. That was a direct executable mutation of a gated entity,
// which violated the "zero executable direct writes for gated entities" policy.
// It has been rewritten as a pure read-only trace: it inspects the caller's
// identity, owned profile ids, profile lookup, and the PracticeArea read path
// (filter + count) WITHOUT creating, updating, or deleting any record.
//
// No executable direct writes to gated entities exist in this function.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Admin-only diagnostic.
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: user.id });
    const profile = profiles[0] ?? null;

    const step1 = {
      user_id: user.id,
      user_email: user.email,
      role: user.role,
      owned_profile_ids: user.owned_profile_ids ?? [],
      rls_ok: (user.owned_profile_ids || []).length > 0,
    };

    const step2 = {
      profiles_found: profiles.length,
      active_profile_id: profile?.id ?? null,
      username: profile?.username ?? null,
      plan: profile?.plan ?? null,
      profile_id_in_owned: profile ? (user.owned_profile_ids || []).includes(profile.id) : false,
    };

    if (!profile) {
      return Response.json({ step1, step2, abort: 'No profile found', final_verdict: 'READ-ONLY TRACE: no profile to inspect' });
    }

    const profileId = profile.id;

    // READ-ONLY: count existing practice areas (no insert/delete).
    let readOk = null, readError = null, rows = [];
    try {
      rows = await base44.asServiceRole.entities.PracticeArea.filter({ profile_id: profileId }, 'order');
      readOk = true;
    } catch (err) {
      readError = { message: err?.message, http_status: err?.response?.status ?? null };
      readOk = false;
    }

    const step3 = {
      read_path: 'filter',
      rows_returned: rows.length,
      existing_ids: rows.map((a) => a.id),
      read_ok: readOk,
      read_error: readError,
    };

    const final_verdict = readOk
      ? '✅ READ-ONLY TRACE PASS — read path healthy; no mutations performed'
      : '❌ READ-ONLY TRACE FAIL — read path error: ' + JSON.stringify(readError);

    return Response.json({ step1, step2, step3, final_verdict, note: 'No create/update/delete performed (read-only diagnostic).' });
  } catch (error) {
    console.error('[tracePracticeAreaSave]', error?.message);
    return Response.json({ fatal_error: error.message }, { status: 500 });
  }
});