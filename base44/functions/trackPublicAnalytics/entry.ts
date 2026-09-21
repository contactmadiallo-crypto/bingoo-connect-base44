import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_EVENTS = new Set([
  'profile_view', 'whatsapp_click', 'phone_click', 'email_click',
  'instagram_click', 'facebook_click', 'tiktok_click', 'linkedin_click',
  'youtube_click', 'website_click', 'payment_click', 'location_click',
  'save_contact_click', 'lead_submitted', 'appointment_booked', 'qr_scan',
  'nfc_tap', 'prospect_popup_shown', 'request_info_click',
]);

const DEVICE_TYPES = new Set(['mobile', 'desktop']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const profileId = String(body.profile_id || '').trim();
    const eventType = String(body.event_type || '').trim();
    const deviceCode = String(body.device_code || '').trim().toUpperCase();
    const visitorDevice = DEVICE_TYPES.has(body.visitor_device) ? body.visitor_device : 'desktop';

    if (!profileId || !ALLOWED_EVENTS.has(eventType)) {
      return Response.json({ error: 'Invalid analytics event.' }, { status: 400 });
    }

    const profile = await base44.asServiceRole.entities.Profile.get(profileId).catch(() => null);
    if (!profile || profile.is_active !== true) {
      return Response.json({ error: 'Profile not found.' }, { status: 404 });
    }

    let deviceId = null;
    if (deviceCode) {
      const devices = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: deviceCode }, '-created_date', 5);
      const device = devices.find((d) => d.status !== 'retired') || null;
      if (!device) return Response.json({ error: 'Device not found.' }, { status: 404 });
      const belongsToProfile = device.profile_id === profileId;
      let belongsViaAsset = false;
      if (!belongsToProfile && device.assigned_asset_id) {
        const asset = await base44.asServiceRole.entities.AssetItem.get(device.assigned_asset_id).catch(() => null);
        belongsViaAsset = asset?.profile_id === profileId;
      }
      if (!belongsToProfile && !belongsViaAsset) {
        return Response.json({ error: 'Device/profile mismatch.' }, { status: 400 });
      }
      deviceId = device.id;
    }

    const event = await base44.asServiceRole.entities.Analytics.create({
      profile_id: profileId,
      ...(deviceId ? { device_id: deviceId } : {}),
      event_type: eventType,
      visitor_device: visitorDevice,
      created_at: new Date().toISOString(),
    });

    return Response.json({ success: true, event_id: event.id });
  } catch (error) {
    console.error('trackPublicAnalytics error:', error.message);
    return Response.json({ error: 'Unable to record analytics.' }, { status: 500 });
  }
});
