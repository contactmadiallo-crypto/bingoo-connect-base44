import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { device_code } = body;

    if (!device_code) {
      return Response.json({ error: 'device_code is required' }, { status: 400 });
    }

    const devices = await base44.asServiceRole.entities.Device.filter({ device_code });
    const device = devices[0] || null;

    // Also return the linked profile so NFCRedirect and LostDevicePage can use it
    let profile = null;
    if (device?.assigned_profile) {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: device.assigned_profile });
      profile = profiles[0] || null;
    }

    return Response.json({ device, profile });
  } catch (error) {
    return Response.json({ device: null, error: error.message }, { status: 200 });
  }
});