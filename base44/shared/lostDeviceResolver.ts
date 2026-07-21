/**
 * Shared owner-resolution logic for lost-device flows.
 *
 * Given an NFCDevice code, resolves the full recovery context:
 *  - the NFCDevice record
 *  - the assigned asset (if any) via assigned_asset_id, then reverse lookup
 *  - the owner profile (for profile-assigned devices)
 *  - the owner user id + owner email + owner display name (server-side,
 *    never trusting caller-supplied owner identity)
 *
 * Used by logLostDeviceScan and notifyLostDeviceFound so both resolve the
 * owner the same way — no duplicate logic.
 */

/**
 * @param {object} base44  - base44 client (service role expected)
 * @param {string} normalizedCode - uppercase trimmed device_code
 * @returns {Promise<{
 *   device: object|null,
 *   asset: object|null,
 *   profile: object|null,
 *   ownerUserId: string|null,
 *   ownerEmail: string|null,
 *   ownerName: string|null,
 *   assignedTargetName: string|null,
 *   isAssetLost: boolean,
 *   isDeviceLost: boolean
 * }>}
 */
export async function resolveLostDeviceContext(base44, normalizedCode) {
  const devices = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: normalizedCode });
  const device = devices[0] || null;
  if (!device) {
    return { device: null, asset: null, profile: null, ownerUserId: null, ownerEmail: null, ownerName: null, assignedTargetName: null, isAssetLost: false, isDeviceLost: false };
  }

  // ── Asset resolution: direct assigned_asset_id first, then reverse lookup ──
  let asset = null;
  if (device.assigned_asset_id) {
    try {
      const assets = await base44.asServiceRole.entities.AssetItem.filter({ id: device.assigned_asset_id });
      asset = assets[0] || null;
    } catch (_e) { /* best-effort */ }
  }
  if (!asset && device.id) {
    try {
      const assets = await base44.asServiceRole.entities.AssetItem.filter({ nfc_device_id: device.id });
      asset = assets[0] || null;
    } catch (_e) { /* best-effort */ }
  }

  // ── Profile resolution ──
  let profile = null;
  if (device.profile_id) {
    try {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: device.profile_id });
      profile = profiles[0] || null;
    } catch (_e) { /* best-effort */ }
  }

  // ── Owner identity (server-side, authoritative) ──
  let ownerUserId = null;
  let ownerEmail = null;
  let ownerName = null;
  let assignedTargetName = null;

  if (asset) {
    ownerUserId = asset.owner_user_id || null;
    assignedTargetName = asset.name || null;
    if (asset.profile_id) {
      try {
        const profiles = await base44.asServiceRole.entities.Profile.filter({ id: asset.profile_id });
        const p = profiles[0] || null;
        if (p) {
          ownerEmail = ownerEmail || p.email || null;
          ownerName = ownerName || p.display_name || p.company_name || null;
        }
      } catch (_e) { /* best-effort */ }
    }
    // Fallback to user email if profile didn't yield one
    if (!ownerEmail && ownerUserId) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: ownerUserId });
        if (users && users.length > 0) ownerEmail = users[0].email || null;
      } catch (_e) { /* best-effort */ }
    }
  } else if (profile) {
    ownerEmail = profile.email || null;
    ownerName = profile.display_name || profile.company_name || null;
    assignedTargetName = profile.display_name || profile.company_name || null;
    // account_id on NFCDevice is the activating owner user id; fall back to it
    ownerUserId = device.account_id || null;
    if (!ownerEmail && ownerUserId) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: ownerUserId });
        if (users && users.length > 0) ownerEmail = users[0].email || null;
      } catch (_e) { /* best-effort */ }
    }
  }

  const isAssetLost = !!(asset && asset.lost_mode_enabled);
  const isDeviceLost = device.status === "lost";

  return {
    device,
    asset,
    profile,
    ownerUserId,
    ownerEmail,
    ownerName,
    assignedTargetName,
    isAssetLost,
    isDeviceLost,
  };
}

/** Friendly device label — prefers product_name then device_type. */
export function deviceDisplayLabel(device) {
  if (!device) return "Bingoo Device";
  return device.product_name || device.device_type || "Bingoo Device";
}