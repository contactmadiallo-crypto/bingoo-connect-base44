import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_id, profile_id, user_id, user_name, profile_name, old_status } = await req.json();

    if (!device_id || !profile_id) {
      return Response.json({ error: 'device_id and profile_id are required' }, { status: 400 });
    }

    // Verify the profile actually belongs to the requesting user
    const profile = await base44.asServiceRole.entities.Profile.get(profile_id);
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (profile.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'You do not own this profile' }, { status: 403 });
    }

    // Re-check device is still unclaimed (race condition guard)
    const device = await base44.asServiceRole.entities.NFCDevice.get(device_id);
    if (!device) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }
    if (device.profile_id && device.profile_id !== profile_id) {
      return Response.json({ error: 'Device was just claimed by another account' }, { status: 409 });
    }

    // Perform the update using service role (bypasses RLS)
    await base44.asServiceRole.entities.NFCDevice.update(device_id, {
      profile_id: profile_id,
      status: 'active',
      assigned_at: new Date().toISOString(),
    });

    // Audit log (non-blocking)
    base44.asServiceRole.entities.DeviceAuditLog.create({
      device_id: device_id,
      device_code: device.device_code,
      action: 'activated',
      performed_by: user.id,
      performed_by_name: user_name || user.full_name,
      profile_id: profile_id,
      profile_name: profile_name || profile.display_name,
      old_status: old_status || device.status,
      new_status: 'active',
      notes: 'Activated by user via /activate-device',
    }).catch(e => console.warn('Audit log failed (non-blocking):', e.message));

    console.log(`[activateNfcDevice] Device ${device.device_code} activated for profile ${profile_id} by user ${user.id}`);
    return Response.json({ success: true, device_code: device.device_code });

  } catch (error) {
    console.error('[activateNfcDevice] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});