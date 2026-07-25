/**
 * tracePracticeAreaSave — split into two phases, returned as separate keys
 * to avoid response truncation.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Admin-only diagnostic: this function directly creates + deletes a test
    // PracticeArea to trace the RLS save flow. Gating to admins prevents regular
    // users from using it to bypass the practice_areas entitlement.
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
    const profile = profiles[0] ?? null;

    const step1 = {
      user_id: user.id,
      user_email: user.email,
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
      return Response.json({ step1, step2, abort: "No profile found" });
    }

    const profileId = profile.id;

    // Step 3: baseline read
    const beforeList = await base44.entities.PracticeArea.filter({ profile_id: profileId }, "order");
    const step3 = {
      rows_before: beforeList.length,
      existing_ids: beforeList.map(a => a.id),
    };

    // Step 4: INSERT
    let insertResponse = null;
    let insertError = null;
    const payload = { profile_id: profileId, name: "Test Practice Area", description: "Save trace test", icon: "⚖️" };
    try {
      insertResponse = await base44.entities.PracticeArea.create(payload);
    } catch (err) {
      insertError = { message: err?.message, http_status: err?.response?.status ?? null, body: err?.response?.data ?? null };
    }

    const insertedId = insertResponse?.id ?? null;
    const step4 = {
      request_payload: payload,
      insert_success: !insertError,
      insert_error: insertError ?? null,
      response_id: insertedId,
      response_profile_id: insertResponse?.profile_id ?? null,
      response_name: insertResponse?.name ?? null,
      response_created_by_id: insertResponse?.created_by_id ?? null,
      response_created_date: insertResponse?.created_date ?? null,
      profile_id_matches: insertResponse?.profile_id === profileId,
    };

    if (!insertedId) {
      return Response.json({ step1, step2, step3, step4, final_verdict: "FAIL: INSERT never executed or was rejected — see step4.insert_error" });
    }

    // Step 5: read back by ID
    let byId = null;
    let byIdError = null;
    try {
      const res = await base44.entities.PracticeArea.filter({ id: insertedId });
      byId = res[0] ?? null;
    } catch (err) {
      byIdError = { message: err?.message, http_status: err?.response?.status ?? null };
    }
    const step5 = {
      query_by_id: insertedId,
      record_found: !!byId,
      record_profile_id: byId?.profile_id ?? null,
      record_name: byId?.name ?? null,
      read_error: byIdError ?? null,
    };

    // Step 6: list query (same filter the panel uses after cache invalidation)
    let afterList = [];
    let listError = null;
    try {
      afterList = await base44.entities.PracticeArea.filter({ profile_id: profileId }, "order");
    } catch (err) {
      listError = { message: err?.message, http_status: err?.response?.status ?? null };
    }
    const newInList = afterList.find(a => a.id === insertedId);
    const step6 = {
      query_filter: { profile_id: profileId },
      rows_returned: afterList.length,
      rows_before: beforeList.length,
      net_new: afterList.length - beforeList.length,
      new_record_in_list: !!newInList,
      all_ids: afterList.map(a => a.id),
      list_error: listError ?? null,
    };

    // Step 7: cleanup
    let deleteError = null;
    try { await base44.entities.PracticeArea.delete(insertedId); } catch (err) { deleteError = err?.message; }

    // Step 8: verify deletion
    const finalList = await base44.entities.PracticeArea.filter({ profile_id: profileId }, "order");
    const step7 = {
      deleted_id: insertedId,
      delete_error: deleteError ?? null,
      rows_after_delete: finalList.length,
      record_still_present: finalList.some(a => a.id === insertedId),
    };

    // Final verdict
    let final_verdict;
    if (!step4.insert_success)          final_verdict = "❌ STEP 4 FAIL — INSERT rejected: " + JSON.stringify(step4.insert_error);
    else if (!step4.profile_id_matches) final_verdict = "❌ STEP 4 FAIL — profile_id mismatch on insert response";
    else if (!step5.record_found)       final_verdict = "❌ STEP 5 FAIL — INSERT succeeded but record unreadable by ID (RLS blocking read-back)";
    else if (!step6.new_record_in_list) final_verdict = "❌ STEP 6 FAIL — INSERT succeeded, readable by ID, but NOT in list query (filter/RLS issue on reads)";
    else                                final_verdict = "✅ FULL LIFECYCLE PASS — insert, read-by-id, and list query all succeed";

    return Response.json({ step1, step2, step3, step4, step5, step6, step7, final_verdict });

  } catch (error) {
    console.error('[tracePracticeAreaSave]', error?.message);
    return Response.json({ fatal_error: error.message }, { status: 500 });
  }
});