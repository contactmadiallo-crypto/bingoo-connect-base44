/**
 * Bingoo Connect — Database Persistence Audit Utility
 * Wraps entity operations with structured console logging.
 * Import this in any panel to get full visibility into DB calls.
 */

const LOG_PREFIX = "[DB-AUDIT]";

function fmt(obj) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

/**
 * Wraps a base44 entity mutation (create/update/delete) with full debug logging.
 * Returns the same promise so it can be used transparently in mutationFn.
 *
 * Usage:
 *   mutationFn: (data) => dbOp("PracticeArea", "create", profileId,
 *     () => base44.entities.PracticeArea.create({ profile_id: profileId, ...data })
 *   )
 */
export async function dbOp(entity, operation, profileId, fn) {
  const label = `${LOG_PREFIX} [${entity}] ${operation.toUpperCase()}`;
  console.group(label);
  console.log("▶ Entity   :", entity);
  console.log("▶ Operation:", operation);
  console.log("▶ ProfileID:", profileId ?? "⚠️ MISSING");

  if (!profileId && operation === "create") {
    console.error("🚨 CRITICAL: profile_id is missing — insert will be unscoped or rejected by RLS");
  }

  let result;
  try {
    result = await fn();
    console.log("✅ Success  :", fmt(result));
    console.log("✅ Saved ID :", result?.id ?? "(no id in response)");
    if (result?.profile_id !== undefined) {
      const ok = result.profile_id === profileId;
      console.log(`✅ profile_id check: ${ok ? "PASS ✓" : "FAIL ✗"} (expected=${profileId}, got=${result.profile_id})`);
    }
  } catch (err) {
    console.error("❌ DB ERROR :", err?.message ?? err);
    console.error("❌ Full error:", fmt(err));
    if (err?.response) {
      console.error("❌ HTTP status:", err.response.status);
      console.error("❌ Response body:", fmt(err.response.data));
    }
    console.groupEnd();
    throw err; // re-throw so React Query sees the error
  }

  console.groupEnd();
  return result;
}

/**
 * Log a successful cache invalidation so we can verify the right key is cleared.
 */
export function logInvalidate(queryKey) {
  console.log(`${LOG_PREFIX} 🔄 Cache invalidated → key: ${JSON.stringify(queryKey)}`);
}

/**
 * Run once on page load to print the RLS / user context.
 * Also calls repairProfileOwnership backend function to auto-fix missing mappings.
 */
export async function auditUserContext(base44) {
  console.group(`${LOG_PREFIX} 👤 USER CONTEXT AUDIT`);
  try {
    const user = await base44.auth.me();
    console.log("User ID          :", user?.id);
    console.log("User Email       :", user?.email);
    console.log("User Role        :", user?.role);
    console.log("owned_profile_ids (before repair):", user?.owned_profile_ids ?? "⚠️ NOT SET");

    if (!user?.owned_profile_ids?.length) {
      console.warn("⚠️ owned_profile_ids is empty — triggering ownership repair...");
    }

    // Call backend repair function for full diagnostic + auto-fix
    try {
      const res = await base44.functions.invoke('repairProfileOwnership', {});
      const report = res?.data ?? res;
      console.group(`${LOG_PREFIX} 🔧 OWNERSHIP REPAIR REPORT`);
      console.log("Profiles found   :", report.profile_count);
      console.log("Profiles         :", report.profiles_found?.map(p => `${p.username} (${p.id})`).join(", ") || "none");
      console.log("owned_profile_ids before:", JSON.stringify(report.owned_profile_ids_before));
      console.log("owned_profile_ids after :", JSON.stringify(report.owned_profile_ids_after));
      console.log("Missing IDs      :", JSON.stringify(report.missing_ids));
      console.log("Stale IDs        :", JSON.stringify(report.stale_ids));
      console.log("Repaired?        :", report.repaired ? `✅ YES — ${report.repair_action}` : "✅ No repair needed");
      if (report.rls_status?.warning) {
        console.warn("⚠️ RLS Warning   :", report.rls_status.warning);
      }
      if (!report.rls_status?.owned_profile_ids_populated) {
        console.error("❌ owned_profile_ids is STILL empty after repair — user has no profiles yet.");
      } else {
        console.log("✅ RLS OK        : owned_profile_ids is populated");
      }
      console.groupEnd();
      return report;
    } catch (repairErr) {
      console.error("❌ Repair function failed:", repairErr?.message);
    }
  } catch (e) {
    console.error("Could not load user:", e?.message);
  }
  console.groupEnd();
}