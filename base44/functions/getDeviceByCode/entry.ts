import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { device_code } = body;

    if (!device_code) {
      return Response.json({ error: 'device_code is required' }, { status: 400 });
    }

    const normalizedCode = device_code.toUpperCase().trim();

    // Check NFCDevice first (new system)
    const nfcDevices = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: normalizedCode });
    const nfcDevice = nfcDevices[0] || null;

    if (nfcDevice) {
      let profile = null;
      if (nfcDevice.profile_id) {
        const profiles = await base44.asServiceRole.entities.Profile.filter({ id: nfcDevice.profile_id });
        profile = profiles[0] || null;
      }
      return Response.json({
        device: {
          ...nfcDevice,
          // normalize to a common shape
          _source: 'nfc',
          activation_status: nfcDevice.status, // map status -> activation_status for compat
        },
        profile,
        is_claimed: !!(nfcDevice.profile_id && profile),
        is_lost: nfcDevice.status === 'lost',
        is_unclaimed: !nfcDevice.profile_id,
      });
    }

    // Fallback: legacy Device entity
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
        profile,
        is_claimed: !!(legacyDevice.assigned_profile && profile),
        is_lost: legacyDevice.activation_status === 'inactive' && legacyDevice.description === 'lost',
        is_unclaimed: legacyDevice.activation_status === 'available',
      });
    }

    return Response.json({ device: null, profile: null, is_claimed: false, is_lost: false, is_unclaimed: false });
  } catch (error) {
    console.error('getDeviceByCode error:', error);
    return Response.json({ device: null, error: error.message }, { status: 200 });
  }
});