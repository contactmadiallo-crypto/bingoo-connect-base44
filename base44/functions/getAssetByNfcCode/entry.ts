import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const deviceCode = url.searchParams.get('device_code') || url.pathname.split('/').pop();

    if (!deviceCode) {
      return Response.json({ error: 'Missing device_code parameter' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Look up the NFC device by device_code (service role — public endpoint)
    const devices = await base44.asServiceRole.entities.NFCDevice.filter({
      device_code: deviceCode
    });

    if (!devices || devices.length === 0) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    const device = devices[0];

    // Look up any asset linked to this device
    const assets = await base44.asServiceRole.entities.AssetItem.filter({
      nfc_device_id: device.id,
      lost_mode_enabled: true
    });

    if (!assets || assets.length === 0) {
      return Response.json({ error: 'No lost asset linked to this device' }, { status: 404 });
    }

    const asset = assets[0];

    // Fetch owner profile for safe contact info
    let ownerProfile = null;
    if (asset.profile_id) {
      try {
        const profiles = await base44.asServiceRole.entities.Profile.filter({ id: asset.profile_id });
        if (profiles && profiles.length > 0) {
          ownerProfile = profiles[0];
        }
      } catch (e) {
        // Profile lookup is best-effort
      }
    }

    // Return only finder-safe fields — never expose owner-private data
    const contactInfo = {};
    if (asset.safe_contact_preference === 'phone' && ownerProfile?.phone) {
      contactInfo.phone = ownerProfile.phone;
    }
    if (asset.safe_contact_preference === 'email' && ownerProfile?.email) {
      contactInfo.email = ownerProfile.email;
    }
    if (asset.safe_contact_preference === 'whatsapp' && ownerProfile?.whatsapp_number) {
      contactInfo.whatsapp = ownerProfile.whatsapp_number;
    }

    return Response.json({
      asset: {
        name: asset.name,
        asset_type: asset.asset_type,
        photo_url: asset.photo_url,
        description: asset.description,
        finder_message: asset.finder_message,
        recovery_instructions: asset.recovery_instructions,
        safe_contact_preference: asset.safe_contact_preference
      },
      owner: {
        display_name: ownerProfile?.display_name || 'Owner',
        contact: contactInfo
      },
      device: {
        device_code: device.device_code,
        device_type: device.device_type
      }
    });
  } catch (error) {
    console.error('getAssetByNfcCode error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});