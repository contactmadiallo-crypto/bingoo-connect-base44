/**
 * repairProfileOwnership
 *
 * Audits and repairs the profile ownership mapping for the currently logged-in user.
 * Returns a full diagnostic report.
 *
 * Checks:
 *   1. Is the user authenticated?
 *   2. What profiles does the user own (created_by_id = user.id)?
 *   3. What is currently in owned_profile_ids on the User record?
 *   4. Which profile IDs are missing from owned_profile_ids?
 *   5. If any are missing, repairs owned_profile_ids and returns the updated list.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Auth check
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all profiles owned by this user (by created_by_id)
    const ownedProfiles = await base44.entities.Profile.filter({ created_by_id: user.id });

    const ownedProfileIds = ownedProfiles.map(p => p.id);
    const currentMappingIds = user.owned_profile_ids || [];

    // 3. Find any profile IDs missing from the user's owned_profile_ids
    const missing = ownedProfileIds.filter(id => !currentMappingIds.includes(id));
    const stale = currentMappingIds.filter(id => !ownedProfileIds.includes(id));

    let repaired = false;
    let newOwnedIds = [...currentMappingIds];

    // 4. Repair: add any missing profile IDs
    if (missing.length > 0) {
      newOwnedIds = [...new Set([...currentMappingIds, ...ownedProfileIds])];
      await base44.auth.updateMe({ owned_profile_ids: newOwnedIds });
      repaired = true;
      console.log(`[repairProfileOwnership] REPAIRED user ${user.id}: added ${missing.length} missing IDs → ${JSON.stringify(newOwnedIds)}`);
    } else {
      console.log(`[repairProfileOwnership] OK: user ${user.id} has correct owned_profile_ids: ${JSON.stringify(currentMappingIds)}`);
    }

    // 5. Build report
    const report = {
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,

      profiles_found: ownedProfiles.map(p => ({
        id: p.id,
        username: p.username,
        display_name: p.display_name,
        plan: p.plan,
        is_active: p.is_active,
        created_date: p.created_date,
      })),
      profile_count: ownedProfiles.length,

      owned_profile_ids_before: currentMappingIds,
      owned_profile_ids_after: repaired ? newOwnedIds : currentMappingIds,

      missing_ids: missing,
      stale_ids: stale,

      repaired,
      repair_action: repaired
        ? `Added ${missing.length} missing profile ID(s) to owned_profile_ids`
        : "No repair needed — mapping is correct",

      rls_status: {
        owned_profile_ids_populated: (repaired ? newOwnedIds : currentMappingIds).length > 0,
        all_profiles_mapped: missing.length === 0 || repaired,
        warning: stale.length > 0
          ? `${stale.length} ID(s) in owned_profile_ids have no matching Profile record: ${JSON.stringify(stale)}`
          : null,
      },
    };

    return Response.json(report);

  } catch (error) {
    console.error('[repairProfileOwnership] ERROR:', error?.message, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});