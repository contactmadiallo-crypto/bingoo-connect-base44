import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_id, status } = await req.json();

    if (!device_id || !status) {
      return Response.json({ error: 'device_id and status are required' }, { status: 400 });
    }

    // Only allow safe status values
    const allowedStatuses = ['active', 'lost', 'disabled'];
    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch the device using service role
    const device = await base44.asServiceRole.entities.NFCDevice.get(device_id);
    if (!device) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    // Verify the user owns the profile assigned to this device
    if (device.profile_id) {
      const profile = await base44.asServiceRole.entities.Profile.get(device.profile_id);
      if (!profile) {
        return Response.json({ error: 'Profile not found' }, { status: 404 });
      }
      if (profile.created_by_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'You do not own this device' }, { status: 403 });
      }
    } else {
      // No profile assigned — only admin can change unassigned devices
      if (user.role !== 'admin') {
        return Response.json({ error: 'You do not own this device' }, { status: 403 });
      }
    }

    const oldStatus = device.status;

    // Update using service role (bypasses RLS)
    await base44.asServiceRole.entities.NFCDevice.update(device_id, {
      status,
      ...(status === 'active' && { assigned_at: device.assigned_at || new Date().toISOString() }),
    });

    // Audit log (non-blocking)
    const action = status === 'lost' ? 'lost_reported' : status === 'active' ? 'activated' : 'disabled';
    base44.asServiceRole.entities.DeviceAuditLog.create({
      device_id: device_id,
      device_code: device.device_code,
      action,
      performed_by: user.id,
      performed_by_name: user.full_name,
      profile_id: device.profile_id,
      old_status: oldStatus,
      new_status: status,
      notes: status === 'active' ? 'Reactivated by owner' : `Status changed to ${status} by owner`,
    }).catch(e => console.warn('Audit log failed (non-blocking):', e.message));

    return Response.json({ success: true, device_id, old_status: oldStatus, new_status: status });
  } catch (error) {
    console.error('[updateNfcDeviceStatus] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});