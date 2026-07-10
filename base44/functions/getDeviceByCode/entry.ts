import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE OF TRUTH: NFCDevice entity (checked first, always)
// LEGACY FALLBACK: Device entity (read-only, kept for rollback only)
//   All 4 active legacy Device records were migrated to NFCDevice on 2026-06-20.
//   The Device fallback below should never be hit in production.
//   Do NOT write new records to Device. Do NOT remove this fallback until
//   the Device entity is formally archived/deleted.
//
// ASSET PRECEDENCE: If an AssetItem has this device's ID as its nfc_device_id,
//   the scan resolves to the public asset finder — NOT the profile.
//   This ensures pet collars, luggage tags, etc. show recovery info.
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { device_code, code } = body;
    const rawCode = device_code || code;

    if (!rawCode) {
      return Response.json({ error: 'device_code or code is required' }, { status: 400 });
    }

    const normalizedCode = rawCode.toUpperCase().trim();

    // Check NFCDevice first (new system)
    const nfcDevices = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: normalizedCode });
    const nfcDevice = nfcDevices[0] || null;

    if (nfcDevice) {
      // ── ASSET CHECK: Does an AssetItem reference this device? ──
      // Asset assignment takes precedence over profile assignment.
      let asset = null;
      if (nfcDevice.id) {
        try {
          const assets = await base44.asServiceRole.entities.AssetItem.filter({ nfc_device_id: nfcDevice.id });
          asset = assets[0] || null;
        } catch (e) {
          console.error('Asset lookup error:', e);
        }
      }

      // If asset found, return asset info — asset finder handles lost/normal states
      if (asset) {
        return Response.json({
          device: {
            ...nfcDevice,
            _source: 'nfc',
            activation_status: nfcDevice.status,
          },
          asset,
          profile: null,
          is_asset: true,
          is_claimed: true,
          is_lost: nfcDevice.status === 'lost',
          is_unclaimed: false,
        });
      }

      // ── PROFILE ROUTE (existing behavior) ──
      let profile = null;
      if (nfcDevice.profile_id) {
        const profiles = await base44.asServiceRole.entities.Profile.filter({ id: nfcDevice.profile_id });
        profile = profiles[0] || null;
      }
      return Response.json({
        device: {
          ...nfcDevice,
          _source: 'nfc',
          activation_status: nfcDevice.status,
        },
        asset: null,
        profile,
        is_asset: false,
        is_claimed: !!(nfcDevice.profile_id && profile),
        is_lost: nfcDevice.status === 'lost',
        is_unclaimed: !nfcDevice.profile_id,
      });
    }

    // LEGACY FALLBACK (read-only — do not write here): Device entity
    const legacyDevices = await base44.asServiceRole.entities.Device.filter({ device_code: normalizedCode });
    const legacyDevice = legacyDevices[0] || null;

    let profile = null;
    if (legacyDevice?.assigned_profile) {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: legacyDevice.assigned_profile });
      profile = profiles[0] || null;
    }

    if (legacyDevice) {
      return Response.json({
        device: {
          ...legacyDevice,
          _source: 'legacy',
          status: legacyDevice.activation_status,
        },
        asset: null,
        profile,
        is_asset: false,
        is_claimed: !!(legacyDevice.assigned_profile && profile),
        is_lost: legacyDevice.activation_status === 'inactive' && legacyDevice.description === 'lost',
        is_unclaimed: legacyDevice.activation_status === 'available',
      });
    }

    return Response.json({ device: null, profile: null, asset: null, is_asset: false, is_claimed: false, is_lost: false, is_unclaimed: false });
  } catch (error) {
    console.error('getDeviceByCode error:', error);
    return Response.json({ device: null, error: error.message }, { status: 200 });
  }
});