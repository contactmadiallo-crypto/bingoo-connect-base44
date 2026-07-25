/**
 * backfillProductionCatalog
 *
 * Idempotent, admin-only migration that creates the 7 PlanEntitlement catalog
 * records and the 24 ProfileAccess records derived from the approved v2 dry-run
 * manifest. Dry-run is the default and performs ZERO writes.
 *
 * ── Modes ──────────────────────────────────────────────────────────────────
 *   { mode: "dry_run" }                     → (default) read-only manifest + hashes
 *   { mode: "apply", manifest_hash, confirm_token } → admin-only write
 *
 * ── Apply safety ───────────────────────────────────────────────────────────
 *   • admin-only (caller.role === 'admin')
 *   • confirm_token = sha256(manifest_hash + live_state_hash + "v2")
 *   • live-state hash re-verified at apply; mismatch → 409
 *   • unexpected existing PlanEntitlement/ProfileAccess → 409 conflict (never silent skip)
 *     existing records accepted only on EXACT match
 *   • order: catalog → verify → access
 *   • partial access failure: roll back created access by EXACT IDs, retain catalog
 *   • full manifest stored in MigrationManifest (admin-only); audit log notes
 *     carry only {manifest_id, manifest_hash, phase, counts} — no emails, no full manifest
 *
 * ── Resolver authority ────────────────────────────────────────────────────
 *   ProfileAccess.plan_name is authoritative when subscription_id is null
 *   (plan-grandfathered records). The resolver (resolveResourceEntitlement) uses
 *   plan_name directly in that case and never falls back to a conflicting owner
 *   subscription — so plan-grandfathered overrides are preserved at runtime.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MIGRATION_VERSION = 'v2';

// ── Catalog (7 records) — approved v2 ────────────────────────────────────────
const FREE = ['profile','public_profile','qr_code','contact_sharing','social_links','whatsapp_button'];
const PRO = [...FREE,'nfc_devices','lost_mode','lead_collection','analytics','appointment_booking','save_contact','portfolio','custom_branding','qr_download','instagram_integration','calendar','google_wallet_pass','apple_wallet_pass'];
const BIZ = [...PRO,'business_hours','business_profile','design_studio','services','product_showcase','nfc_counter_stand','google_reviews','whatsapp_booking','team_members','staff_cards','customer_inquiry','multi_profile','business_qr_landing','advanced_analytics','lead_export'];
const SALON = [...BIZ,'salon_profile','staff_profiles','instagram_gallery'];
const REST = [...PRO,'business_hours','restaurant_profile','digital_menu','delivery_links','food_ordering','google_reviews','reservations','whatsapp_ordering','whatsapp_booking','nfc_table_stand','nfc_counter_stand','team_members','advanced_analytics','lead_export'];
const LAW = [...BIZ,'law_firm_profile','practice_areas','attorney_profiles','staff_profiles','legal_services','office_locations','lead_intake_forms','crm_pipeline','case_dashboard','admin_roles','immigration_forms','criminal_forms','civil_forms','family_forms'];
const CORP = [...BIZ,'api_access','bulk_nfc_orders','custom_onboarding','employee_profiles','attendance','attendance_dashboard'];
const FREE_LAYOUTS = ['classic','minimal','card'];
const ALL_LAYOUTS = ['classic','minimal','card','image_hero','glassmorphic','dark','aurora','magazine','executive','premium_salon','modern_law','corporate','modern_saas','bold','neon','retro','floating','luxury_gold','ny_championship','lions_teranga'];

const CATALOG = [
  { plan_name:'free', display_name:'Free', maximum_active_profiles:1, maximum_links:5, available_layout_ids:FREE_LAYOUTS, features:FREE, is_active:true },
  { plan_name:'professional', display_name:'Professional', maximum_active_profiles:1, maximum_links:15, available_layout_ids:ALL_LAYOUTS, features:PRO, is_active:true },
  { plan_name:'business', display_name:'Business', maximum_active_profiles:3, maximum_links:30, available_layout_ids:ALL_LAYOUTS, features:BIZ, is_active:true },
  { plan_name:'salon', display_name:'Salon', maximum_active_profiles:3, maximum_links:30, available_layout_ids:ALL_LAYOUTS, features:SALON, is_active:true },
  { plan_name:'restaurant', display_name:'Restaurant', maximum_active_profiles:3, maximum_links:30, available_layout_ids:ALL_LAYOUTS, features:REST, is_active:true },
  { plan_name:'lawfirm', display_name:'Law Firm', maximum_active_profiles:5, maximum_links:50, available_layout_ids:ALL_LAYOUTS, features:LAW, is_active:true },
  { plan_name:'corporate', display_name:'Enterprise / Bulk', maximum_active_profiles:50, maximum_links:-1, available_layout_ids:ALL_LAYOUTS, features:CORP, is_active:true },
];

// ── Subscription IDs ─────────────────────────────────────────────────────────
const S = {
  S1:'6a6156809d654953f0a1e339', S2:'6a5f669de37b7f4d9011b5dc',
  S4:'6a4715ebc265f26aea4564bf', S5:'6a45596cec15dab746f6a686',
  S6:'6a4512e8c623dde11281ac43', S7:'6a44492eb83a494a2282526c',
  S8:'6a41ffc07d1663984bfe003e', S9:'6a335a2a2bc10e3bbd6aae1e',
  S10:'6a335a297890a9d0b060231b',
};

// ── Access manifest (24 records) — approved v2 with corrections ──────────────
// [profile_id, expected_created_by_id, plan_name, subscription_id|null, access_source, is_primary, grandfathered_reason|null]
const ACCESS_MANIFEST = [
  ['6a63fef6b750ac9ef177df61','6a63fd423ced95f285a74ddd','free',null,'legacy',true,null],
  ['6a6073f84c8d050a31b5fdc2','6a32b4d85716525678f8e43c','free',null,'legacy',true,null],
  ['6a5ed233f346169e31d22249','service_4914a353-c48f-41e6-95bd-dc7b58e80c8d','corporate',null,'admin_override',true,'B1: preserve Corporate (QA, no sub)'],
  ['6a5e5c2865bf77a6dfaec6b7','6a4277432c981fb7f67d2c37','professional',S.S2,'admin_override',false,'B7: count-grandfathered (dioplahad1 x3 > Professional 1)'],
  ['6a5239230d5972c06499f324','6a1fa8cb2de8a8fbf946b96f','professional',S.S1,'stripe',false,'B7: count-grandfathered (9ztjvf42zs x2 > Professional 1)'],
  ['6a5052664f3888ac43d5b2ed','692bd9007b93ba81de543347','business',S.S6,'admin_override',false,null],
  ['6a4ff27b5477708e24391f7c','6a4ff17917189b780e33b77f','free',null,'legacy',true,null],
  ['6a455bc4c97b0c57ca477d9d','6a45576a24c8065a765209d5','professional',S.S5,'admin_override',false,'B7: count-grandfathered (mamadousene649 x2 > Professional 1)'],
  ['6a4558a8d0b2a022095f9b35','6a45576a24c8065a765209d5','professional',S.S5,'admin_override',true,null],
  ['6a4277e1ecd9b8f418e44971','6a4277432c981fb7f67d2c37','professional',S.S2,'admin_override',false,'B7: count-grandfathered (dioplahad1 x3 > Professional 1)'],
  ['6a3eb5b24196a63df37a458d','6a1f3ee9035dd8c0f142d5da','professional',null,'admin_override',true,'B3: preserve Professional (no sub)'],
  ['6a3da64802aab2eb2365460c','6a38110fe92c18d670865120','professional',S.S8,'stripe',true,null],
  ['6a35e1a47b483d3bb8185e21','6a23a796eb78fbeaab36f45f','professional',S.S9,'stripe',false,'B7: count-grandfathered (madlaye2511 x2 > Professional 1)'],
  ['6a24dd4286530785cf539ba3','6a24747e49b5829fad7ad171','professional',null,'admin_override',true,'B2: preserve Professional (owner hypemangib; S3 orphan)'],
  ['6a24c32f205e16e27a612402','6a1f45fe34162ee91d5b2ea1','professional',S.S7,'stripe',true,null],
  ['6a24998ea22b9c8259767797','6a2496334adaa5f33a6e3aa3','salon',null,'admin_override',true,'B11: preserve Salon (S10 canceled; protected override)'],
  ['6a24315d41634f1778c02aa5','6a23a796eb78fbeaab36f45f','professional',S.S9,'stripe',true,null],
  ['6a23092bdb902bd36eb55fa7','6a2073271f43b0db7113e3e3','professional',null,'admin_override',true,'B4: preserve Professional (no sub)'],
  ['6a1fad30da749e9b0fb1da5e','6a1fa8cb2de8a8fbf946b96f','professional',S.S1,'stripe',true,null],
  ['6a1f9737716edb1d48d942ec','6a1f923d07bbbdd8e4abaa11','professional',null,'admin_override',true,null],
  ['6a1f75056134ec1f0451b269','6a1f6e7dd28d5b524c2b5a46','lawfirm',S.S4,'admin_override',true,null],
  ['6a1efaf92e9a50c9a7438b06','6a1efa1fb40492667a5314c7','professional',S.S2,'admin_override',true,null],
  ['6a1ef7d31e02666fc810cbf6','6a1ef726a0490522771bb928','professional',null,'admin_override',true,'B5: preserve Professional (no sub)'],
  ['6a1c4da5cd79bdcc6147ce0b','692bd9007b93ba81de543347','lawfirm',null,'admin_override',true,'B6: preserve Law Firm (owner sub S6 is Business)'],
];

const DECISIONS = {
  B1:'preserve_corporate_admin_override_qa',
  B2:'preserve_owner_hypemangib_professional_orphan_S3',
  B3:'preserve_professional_no_sub', B4:'preserve_professional_no_sub', B5:'preserve_professional_no_sub',
  B6:'preserve_lawfirm_admin_override',
  B7:'count_grandfather_excess_preserve_resolved_plan_enforce_on_new_create',
  B8:'catalog_limits_and_registry_layouts_approved',
  B9:'honor_active_status_null_expiry_reconcile_billing',
  B10:'orphan_S3_unassigned_report',
  B11:'preserve_salon_protected_override',
  B12:'separate_layout_migration_preserve_legacy_on_edit',
  policy:'active_recurring_expires_null; admin_override_expires_null; plan_name_authoritative_when_subscription_id_null; no_owner_sub_fallback_for_plan_grandfathered; no_silent_downgrade',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
async function sha256hex(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function entitlementExactMatch(existing, cat) {
  return existing.plan_name === cat.plan_name &&
    existing.display_name === cat.display_name &&
    existing.maximum_active_profiles === cat.maximum_active_profiles &&
    existing.maximum_links === cat.maximum_links &&
    JSON.stringify(existing.available_layout_ids || []) === JSON.stringify(cat.available_layout_ids) &&
    JSON.stringify(existing.features || []) === JSON.stringify(cat.features) &&
    existing.is_active === true;
}

function accessExactMatch(existing, expected) {
  return existing.profile_id === expected.profile_id &&
    existing.access_status === 'active' &&
    existing.plan_name === expected.plan_name &&
    (existing.subscription_id || null) === (expected.subscription_id || null) &&
    existing.access_source === expected.access_source &&
    existing.is_primary === expected.is_primary &&
    (existing.expires_at || null) === null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'dry_run';

    // ── Read live production state ────────────────────────────────────────────
    const [profiles, subs, existingEnts, existingAccess, users] = await Promise.all([
      base44.asServiceRole.entities.Profile.filter({ is_active: true }, '-created_date', 100),
      base44.asServiceRole.entities.Subscription.list('-created_date', 100),
      base44.asServiceRole.entities.PlanEntitlement.filter({ is_active: true }),
      base44.asServiceRole.entities.ProfileAccess.filter({}),
      base44.asServiceRole.entities.User.list('-created_date', 100),
    ]);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const subMap = new Map((subs || []).map((s) => [s.id, s]));
    const userEmailById = new Map((users || []).map((u) => [u.id, (u.email || '').toLowerCase()]));
    // Owner emails of active profiles (resolved via User email by created_by_id) for orphan detection.
    const ownerEmails = new Set();
    for (const p of profiles || []) {
      const em = userEmailById.get(p.created_by_id);
      if (em) ownerEmails.add(em);
    }

    // ── Validate access manifest against live profiles ───────────────────────
    const validationErrors = [];
    const accessRecords = [];
    for (const row of ACCESS_MANIFEST) {
      const [pid, expectedCreatedBy, planName, subId, source, isPrimary, gfReason] = row;
      const p = profileMap.get(pid);
      if (!p) { validationErrors.push({ profile_id: pid, error: 'profile_not_found_or_inactive' }); continue; }
      if (p.created_by_id !== expectedCreatedBy) {
        validationErrors.push({ profile_id: pid, error: 'owner_mismatch', expected_created_by_id: expectedCreatedBy, actual_created_by_id: p.created_by_id });
      }
      if (subId && !subMap.has(subId)) {
        validationErrors.push({ profile_id: pid, error: 'subscription_not_found', subscription_id: subId });
      }
      accessRecords.push({
        profile_id: pid,
        owner_user_id: p.created_by_id,
        access_status: 'active',
        plan_name: planName,
        subscription_id: subId || null,
        entitlement_id: null,
        expires_at: null,
        access_source: source,
        is_primary: isPrimary,
        created_during_trial: false,
        grandfathered_reason: gfReason,
      });
    }

    // ── Conflict detection: unexpected / mismatched existing records ─────────
    const entitlementConflicts = [];
    const expectedEnts = new Set(CATALOG.map((c) => c.plan_name));
    for (const ent of existingEnts || []) {
      const cat = CATALOG.find((c) => c.plan_name === ent.plan_name);
      if (!cat) { entitlementConflicts.push({ plan_name: ent.plan_name, error: 'unexpected_plan' }); continue; }
      if (!entitlementExactMatch(ent, cat)) entitlementConflicts.push({ plan_name: ent.plan_name, error: 'field_mismatch' });
    }
    const accessConflicts = [];
    const expectedPids = new Set(ACCESS_MANIFEST.map((r) => r[0]));
    for (const acc of existingAccess || []) {
      if (!expectedPids.has(acc.profile_id)) { accessConflicts.push({ profile_id: acc.profile_id, error: 'unexpected_access' }); continue; }
      const expected = accessRecords.find((a) => a.profile_id === acc.profile_id);
      if (!expected || !accessExactMatch(acc, expected)) accessConflicts.push({ profile_id: acc.profile_id, error: 'field_mismatch' });
    }
    const unresolvedConflicts = entitlementConflicts.length + accessConflicts.length + validationErrors.length;

    // ── Billing reconciliation + orphan subscriptions (derived from live subs) ─
    const now = Date.now();
    const billingReconciliation = [];
    const orphanSubscriptions = [];
    for (const sub of subs || []) {
      const hasOwner = sub.customer_email && ownerEmails.has(sub.customer_email.toLowerCase());
      const periodEnd = sub.current_period_end ? Date.parse(sub.current_period_end) : NaN;
      if (!hasOwner) orphanSubscriptions.push({ subscription_id: sub.id, customer_email: sub.customer_email, plan: sub.plan, status: sub.status });
      if (sub.status === 'active' && !Number.isNaN(periodEnd) && periodEnd < now) {
        billingReconciliation.push({ subscription_id: sub.id, customer_email: sub.customer_email, plan: sub.plan, period_end: sub.current_period_end, issue: 'active_but_period_end_past' });
      }
      if (sub.status === 'past_due') {
        billingReconciliation.push({ subscription_id: sub.id, customer_email: sub.customer_email, plan: sub.plan, status: 'past_due', issue: 'past_due_requires_review' });
      }
    }

    // ── Hashes ───────────────────────────────────────────────────────────────
    const stateObj = {
      plan_entitlement_active_count: (existingEnts || []).length,
      profile_access_count: (existingAccess || []).length,
      active_profile_count: (profiles || []).length,
      active_profile_ids: (profiles || []).map((p) => p.id).sort(),
      subscription_count: (subs || []).length,
      subscription_ids: (subs || []).map((s) => s.id).sort(),
    };
    const stateHash = await sha256hex(JSON.stringify(stateObj));

    const manifestAccess = ACCESS_MANIFEST.map((r) => ({
      profile_id: r[0], plan_name: r[2], subscription_id: r[3], access_source: r[4], is_primary: r[5], grandfathered_reason: r[6],
    }));
    const manifest = { migration_version: MIGRATION_VERSION, catalog: CATALOG, access: manifestAccess, decisions: DECISIONS };
    const manifestHash = await sha256hex(JSON.stringify(manifest));

    // ── DRY RUN (zero writes) ────────────────────────────────────────────────
    if (mode !== 'apply') {
      return Response.json({
        summary: {
          mode: 'dry_run',
          migration_version: MIGRATION_VERSION,
          catalog_records: CATALOG.length,
          access_records: accessRecords.length,
          grandfathered: accessRecords.filter((a) => a.grandfathered_reason).length,
          unresolved_conflicts: unresolvedConflicts,
          conflicts: { entitlements: entitlementConflicts, access: accessConflicts, validation: validationErrors },
          billing_reconciliation: billingReconciliation,
          orphan_subscriptions: orphanSubscriptions,
          manifest_hash: manifestHash,
          state_hash: stateHash,
          apply_count: { catalog: CATALOG.length, access: accessRecords.length, total: CATALOG.length + accessRecords.length },
          zero_writes: true,
        },
        catalog: CATALOG,
        access: accessRecords,
      });
    }

    // ── APPLY (admin-only, verified) ────────────────────────────────────────
    if (unresolvedConflicts > 0) {
      return Response.json({ error: 'conflicts_block_apply', conflicts: { entitlements: entitlementConflicts, access: accessConflicts, validation: validationErrors } }, { status: 409 });
    }
    if (body.manifest_hash && body.manifest_hash !== manifestHash) {
      return Response.json({ error: 'manifest_hash_mismatch', expected: manifestHash, supplied: body.manifest_hash }, { status: 409 });
    }
    const expectedToken = await sha256hex(manifestHash + stateHash + MIGRATION_VERSION);
    if (body.confirm_token !== expectedToken) {
      return Response.json({ error: 'invalid_confirm_token' }, { status: 403 });
    }

    const manifestId = crypto.randomUUID();
    const createdEntIds = [];
    const createdAccessIds = [];

    try {
      // 1. Catalog (accept exact-match existing; create missing)
      for (const cat of CATALOG) {
        const existing = (existingEnts || []).find((e) => e.plan_name === cat.plan_name);
        if (existing && entitlementExactMatch(existing, cat)) { createdEntIds.push(existing.id); continue; }
        if (existing) { throw new Error(`existing PlanEntitlement ${cat.plan_name} mismatches manifest — refusing to overwrite`); }
        const created = await base44.asServiceRole.entities.PlanEntitlement.create({ ...cat });
        createdEntIds.push(created.id);
      }

      // 2. Verify catalog via filter (exactly one active per plan)
      const freshEnts = await base44.asServiceRole.entities.PlanEntitlement.filter({ is_active: true });
      const byPlan = new Map();
      for (const e of freshEnts) { (byPlan.get(e.plan_name) || byPlan.set(e.plan_name, []).get(e.plan_name)).push(e); }
      for (const cat of CATALOG) {
        const list = byPlan.get(cat.plan_name) || [];
        if (list.length !== 1) throw new Error(`catalog verify failed: plan ${cat.plan_name} has ${list.length} active entitlements`);
      }
      const entIdByPlan = new Map(freshEnts.map((e) => [e.plan_name, e.id]));

      // 3. Access (accept exact-match existing; create missing)
      for (const a of accessRecords) {
        const existing = (existingAccess || []).find((x) => x.profile_id === a.profile_id);
        if (existing && accessExactMatch(existing, a)) continue;
        if (existing) { throw new Error(`existing ProfileAccess ${a.profile_id} mismatches manifest — refusing to overwrite`); }
        const created = await base44.asServiceRole.entities.ProfileAccess.create({
          profile_id: a.profile_id,
          owner_user_id: a.owner_user_id,
          access_status: 'active',
          plan_name: a.plan_name,
          subscription_id: a.subscription_id,
          entitlement_id: entIdByPlan.get(a.plan_name) || null,
          expires_at: null,
          access_source: a.access_source,
          is_primary: a.is_primary,
          created_during_trial: false,
        });
        createdAccessIds.push(created.id);
      }

      // 4. Store manifest (admin-only) + audit
      await base44.asServiceRole.entities.MigrationManifest.create({
        manifest_id: manifestId,
        migration_version: MIGRATION_VERSION,
        manifest_hash: manifestHash,
        state_hash: stateHash,
        status: 'applied',
        manifest_json: JSON.stringify(manifest),
        created_entitlement_ids: createdEntIds,
        created_access_ids: createdAccessIds,
        applied_by: caller.id,
        applied_at: new Date().toISOString(),
      });
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'backfill_catalog_complete',
        performed_by: caller.id,
        notes: JSON.stringify({ manifest_id: manifestId, manifest_hash: manifestHash, entitlements: createdEntIds.length, access: createdAccessIds.length }),
      });

      return Response.json({
        mode: 'apply',
        status: 'complete',
        manifest_id: manifestId,
        created_entitlement_ids: createdEntIds,
        created_access_ids: createdAccessIds,
        counts: { entitlements: createdEntIds.length, access: createdAccessIds.length },
      });
    } catch (e) {
      // Partial-failure rollback: delete created access by EXACT IDs, retain catalog.
      const rolledBack = [];
      for (const id of createdAccessIds) {
        try { await base44.asServiceRole.entities.ProfileAccess.delete(id); rolledBack.push(id); } catch (_) {}
      }
      await base44.asServiceRole.entities.AdminAuditLog.create({
        action: 'backfill_catalog_failed',
        performed_by: caller.id,
        notes: JSON.stringify({ manifest_id: manifestId, manifest_hash: manifestHash, error: String(e.message).slice(0, 200), created_entitlement_ids: createdEntIds, rolled_back_access_ids: rolledBack }),
      });
      return Response.json({
        error: 'apply_failed',
        message: e.message,
        manifest_id: manifestId,
        created_entitlement_ids: createdEntIds,
        rolled_back_access_ids: rolledBack,
        rollback_note: 'catalog retained; access creations rolled back by exact IDs; re-run dry_run then apply to retry',
      }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});