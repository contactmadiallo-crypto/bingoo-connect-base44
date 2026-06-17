/**
 * repairProfileOwnership
 *
 * Admin-only diagnostic and repair tool for account/profile mismatches.
 *
 * ─── HOW TO RUN A SAFE DRY-RUN FIRST ────────────────────────────────────────
 *
 *  1. Go to your app dashboard → Code → Functions → repairProfileOwnership
 *  2. In the "Test" panel, paste this payload (replace with your real email):
 *
 *     {
 *       "target_email": "you@youremail.com",
 *       "dry_run": true
 *     }
 *
 *  3. Review the report. Check:
 *     - profiles_by_created_by_id  → your profiles found by normal ownership
 *     - profiles_by_email_match    → profiles whose contact email matches you
 *     - subscriptions_found        → your active subscription (case-insensitive)
 *     - current_owned_profile_ids  → what's currently mapped on your user record
 *     - recommended_actions        → what WOULD be changed on dry_run=false
 *
 *  4. If the report looks correct, run again with dry_run=false to apply:
 *
 *     {
 *       "target_email": "you@youremail.com",
 *       "dry_run": false
 *     }
 *
 *  5. Refresh your dashboard — profiles and features should be restored.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── 1. Require admin ──────────────────────────────────────────────────────
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // ── 2. Parse input ────────────────────────────────────────────────────────
    let body = {};
    try { body = await req.json(); } catch { /* no body is fine */ }

    const { target_email, profile_username, dry_run = true } = body;

    if (!target_email) {
      return Response.json({ error: 'target_email is required' }, { status: 400 });
    }

    const targetEmailNorm = target_email.trim().toLowerCase();
    console.log(`[repairProfileOwnership] caller=${caller.email}, target=${targetEmailNorm}, dry_run=${dry_run}`);

    // ── 3. Find target user ───────────────────────────────────────────────────
    // Use service role to bypass any RLS on User listing
    const allUsers = await base44.asServiceRole.entities.User.list();
    const targetUser = allUsers.find(u =>
      u.email && u.email.trim().toLowerCase() === targetEmailNorm
    );

    if (!targetUser) {
      return Response.json({
        error: `No user found with email: ${target_email}`,
        searched_users_count: allUsers.length,
      }, { status: 404 });
    }

    console.log(`[repairProfileOwnership] target user found: id=${targetUser.id}`);

    // ── 4. Gather profiles via multiple strategies ────────────────────────────

    // Strategy A: created_by_id = target user id (normal ownership)
    const profilesByCreatedBy = await base44.asServiceRole.entities.Profile.filter({
      created_by_id: targetUser.id,
    });

    // Strategy B: Profile contact email field matches target email (case-insensitive match done in JS)
    // Profile has an `email` field (contact email)
    const allProfiles = await base44.asServiceRole.entities.Profile.list('created_date', 200);
    const profilesByEmailMatch = allProfiles.filter(p => {
      const profileEmail = (p.email || '').trim().toLowerCase();
      return profileEmail === targetEmailNorm && !profilesByCreatedBy.find(x => x.id === p.id);
    });

    // Strategy C: username match (if provided)
    let profilesByUsername = [];
    if (profile_username) {
      const usernameLower = profile_username.trim().toLowerCase();
      const usernameMatch = allProfiles.find(p =>
        (p.username || '').trim().toLowerCase() === usernameLower
      );
      if (usernameMatch && !profilesByCreatedBy.find(x => x.id === usernameMatch.id)) {
        profilesByUsername = [usernameMatch];
      }
    }

    // All candidate profiles (deduplicated)
    const seenIds = new Set();
    const allCandidates = [...profilesByCreatedBy, ...profilesByEmailMatch, ...profilesByUsername]
      .filter(p => { if (seenIds.has(p.id)) return false; seenIds.add(p.id); return true; });

    // ── 5. Find subscriptions (case-insensitive) ──────────────────────────────
    const allSubs = await base44.asServiceRole.entities.Subscription.list('-created_date', 100);
    const matchingSubs = allSubs.filter(s =>
      s.customer_email && s.customer_email.trim().toLowerCase() === targetEmailNorm
    );

    // Find the best active subscription
    const activeSub = matchingSubs.find(s => s.status === 'active')
      || matchingSubs.find(s => s.status === 'past_due')
      || null;

    // ── 6. Build the before report ────────────────────────────────────────────
    const currentOwnedIds = targetUser.owned_profile_ids || [];

    const profileSummary = (p, source) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      created_by_id: p.created_by_id,
      created_by_id_matches_target: p.created_by_id === targetUser.id,
      plan: p.plan,
      is_active: p.is_active,
      contact_email: p.email || null,
      source,
    });

    // ── 7. Determine recommended actions ─────────────────────────────────────
    const actions = [];

    // owned_profile_ids repair
    const idsToAdd = allCandidates
      .filter(p => p.created_by_id === targetUser.id) // only safe to add if owned by target
      .map(p => p.id)
      .filter(id => !currentOwnedIds.includes(id));

    if (idsToAdd.length > 0) {
      actions.push({
        type: 'add_to_owned_profile_ids',
        description: `Add ${idsToAdd.length} profile ID(s) to User.owned_profile_ids`,
        profile_ids: idsToAdd,
        safe: true,
      });
    }

    // created_by_id repair — only for email-matched profiles where created_by_id is clearly wrong
    const createdByRepairs = [];
    for (const p of [...profilesByEmailMatch, ...profilesByUsername]) {
      if (p.created_by_id !== targetUser.id) {
        // Only safe if contact email is an exact match AND profile has no other clear owner
        const isEmailMatch = (p.email || '').trim().toLowerCase() === targetEmailNorm;
        if (isEmailMatch) {
          createdByRepairs.push({
            type: 'repair_created_by_id',
            description: `Update Profile "${p.username}" created_by_id from ${p.created_by_id} to ${targetUser.id} (contact email matches)`,
            profile_id: p.id,
            old_created_by_id: p.created_by_id,
            new_created_by_id: targetUser.id,
            safe: true,
          });
        }
      }
    }
    actions.push(...createdByRepairs);

    // Plan sync from active subscription
    if (activeSub) {
      const targetProfiles = allCandidates.filter(p => p.created_by_id === targetUser.id);
      for (const p of targetProfiles) {
        if (p.plan !== activeSub.plan) {
          actions.push({
            type: 'sync_profile_plan',
            description: `Sync Profile "${p.username}" plan from "${p.plan}" → "${activeSub.plan}" (active subscription)`,
            profile_id: p.id,
            old_plan: p.plan,
            new_plan: activeSub.plan,
            safe: true,
          });
        }
      }
    }

    const report = {
      dry_run,
      caller_email: caller.email,
      target_user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        full_name: targetUser.full_name,
        current_owned_profile_ids: currentOwnedIds,
      },
      profiles_by_created_by_id: profilesByCreatedBy.map(p => profileSummary(p, 'created_by_id')),
      profiles_by_email_match: profilesByEmailMatch.map(p => profileSummary(p, 'contact_email')),
      profiles_by_username: profilesByUsername.map(p => profileSummary(p, 'username')),
      total_candidates: allCandidates.length,
      subscriptions_found: matchingSubs.map(s => ({
        id: s.id,
        plan: s.plan,
        status: s.status,
        customer_email: s.customer_email,
        stripe_customer_id: s.stripe_customer_id,
        stripe_subscription_id: s.stripe_subscription_id,
        current_period_end: s.current_period_end,
      })),
      active_subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        customer_email: activeSub.customer_email,
      } : null,
      recommended_actions: actions,
      changes_applied: [],
    };

    // ── 8. Apply repairs if dry_run = false ───────────────────────────────────
    if (!dry_run) {
      const applied = [];

      for (const action of actions) {
        if (!action.safe) {
          console.warn(`[repairProfileOwnership] SKIPPING unsafe action: ${action.type}`);
          continue;
        }

        try {
          if (action.type === 'add_to_owned_profile_ids') {
            const newIds = [...new Set([...currentOwnedIds, ...action.profile_ids])];
            // updateMe only works for the current user; use service role for other users
            await base44.asServiceRole.entities.User.update(targetUser.id, {
              owned_profile_ids: newIds,
            });
            applied.push({ ...action, result: 'success', new_owned_profile_ids: newIds });
            console.log(`[repairProfileOwnership] Updated owned_profile_ids → ${JSON.stringify(newIds)}`);
          }

          if (action.type === 'repair_created_by_id') {
            await base44.asServiceRole.entities.Profile.update(action.profile_id, {
              created_by_id: action.new_created_by_id,
            });
            applied.push({ ...action, result: 'success' });
            console.log(`[repairProfileOwnership] Updated Profile ${action.profile_id} created_by_id → ${action.new_created_by_id}`);
          }

          if (action.type === 'sync_profile_plan') {
            await base44.asServiceRole.entities.Profile.update(action.profile_id, {
              plan: action.new_plan,
            });
            applied.push({ ...action, result: 'success' });
            console.log(`[repairProfileOwnership] Updated Profile ${action.profile_id} plan → ${action.new_plan}`);
          }
        } catch (actionErr) {
          applied.push({ ...action, result: 'error', error: actionErr.message });
          console.error(`[repairProfileOwnership] Action ${action.type} failed:`, actionErr.message);
        }
      }

      report.changes_applied = applied;
    }

    return Response.json(report);

  } catch (error) {
    console.error('[repairProfileOwnership] ERROR:', error?.message, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});