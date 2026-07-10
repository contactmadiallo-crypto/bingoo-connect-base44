import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const rawCode = body.device_code || url.searchParams.get('device_code') || url.pathname.split('/').pop();

    if (!rawCode) {
      return Response.json({ error: 'Missing device_code parameter' }, { status: 400 });
    }

    const deviceCode = rawCode.toUpperCase().trim();

    const base44 = createClientFromRequest(req);

    // Look up the NFC device by device_code (service role — public endpoint)
    const devices = await base44.asServiceRole.entities.NFCDevice.filter({
      device_code: deviceCode
    });

    if (!devices || devices.length === 0) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    const device = devices[0];

    // Look up any asset linked to this device (regardless of lost mode)
    const assets = await base44.asServiceRole.entities.AssetItem.filter({
      nfc_device_id: device.id
    });

    if (!assets || assets.length === 0) {
      return Response.json({ error: 'No asset linked to this device' }, { status: 404 });
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

    // Fallback: if no contact from profile, try owner user email
    if (Object.keys(contactInfo).length === 0 && asset.owner_user_id) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: asset.owner_user_id });
        if (users && users.length > 0 && users[0].email) {
          contactInfo.email = users[0].email;
        }
      } catch (e) {
        // User lookup is best-effort
      }
    }

    return Response.json({
      asset: {
        name: asset.name,
        asset_type: asset.asset_type,
        photo_url: asset.photo_url,
        description: asset.description,
        finder_message: asset.finder_message,
        recovery_instructions: asset.recovery_instructions,
        safe_contact_preference: asset.safe_contact_preference,
        lost_mode_enabled: asset.lost_mode_enabled || false
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