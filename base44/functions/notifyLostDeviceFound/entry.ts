import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { device_code, finder_name, finder_phone, finder_email, finder_location, finder_message } = await req.json();

    if (!device_code) {
      return Response.json({ error: 'Missing required field: device_code' }, { status: 400 });
    }

    // ── Security: resolve the owner email server-side from the device record ──
    // Never trust caller-provided owner_email — prevents arbitrary email abuse.
    const normalizedCode = String(device_code).toUpperCase().trim();
    const nfcDevices = await base44.asServiceRole.entities.NFCDevice.filter({ device_code: normalizedCode });
    const device = nfcDevices[0] || null;

    if (!device) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }
    if (device.status !== 'lost') {
      return Response.json({ error: 'Device is not reported as lost' }, { status: 403 });
    }

    // Resolve owner email + name from the device's linked profile
    let owner_email = null;
    let owner_name = null;
    if (device.profile_id) {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: device.profile_id });
      const profile = profiles[0] || null;
      if (profile) {
        owner_email = profile.email || null;
        owner_name = profile.display_name || profile.company_name || null;
      }
    }

    if (!owner_email) {
      console.log('[notifyLostDeviceFound] No owner email on profile — cannot notify.');
      return Response.json({ skipped: true, reason: 'Owner email not available' });
    }

    // Sanitize finder inputs (length limits to prevent abuse)
    const sanitize = (val, max = 500) => String(val || '').slice(0, max);
    const f_name = sanitize(finder_name, 100);
    const f_phone = sanitize(finder_phone, 50);
    const f_email = sanitize(finder_email, 200);
    const f_location = sanitize(finder_location, 300);
    const f_message = sanitize(finder_message, 2000);

    const subject = `🔍 Your lost item (${normalizedCode}) has been found!`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">🎉 Good News!</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Someone found your lost item</p>
        </div>
        <div style="padding:28px">
          <p style="color:#334155;font-size:16px">Hi ${owner_name || 'there'},</p>
          <p style="color:#64748b">Someone scanned your lost NFC device <strong>${normalizedCode}</strong> and left a report:</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #3b82f6">
            <p style="margin:4px 0;color:#334155"><strong>Finder Name:</strong> ${f_name || 'Anonymous'}</p>
            ${f_phone ? `<p style="margin:4px 0;color:#334155"><strong>Phone:</strong> ${f_phone}</p>` : ''}
            ${f_email ? `<p style="margin:4px 0;color:#334155"><strong>Email:</strong> ${f_email}</p>` : ''}
            ${f_location ? `<p style="margin:4px 0;color:#334155"><strong>Location Found:</strong> ${f_location}</p>` : ''}
            ${f_message ? `<p style="margin:4px 0;color:#334155"><strong>Message:</strong> ${f_message}</p>` : ''}
          </div>
          <p style="color:#64748b;font-size:14px">Log into your Bingoo dashboard to view the full report and mark your device as recovered.</p>
          <div style="text-align:center;margin-top:24px">
            <a href="https://bingooconnect.com/bingoo" style="background:#0B2E6B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">View Dashboard</a>
          </div>
        </div>
        <div style="background:#f1f5f9;padding:16px;text-align:center">
          <p style="color:#94a3b8;font-size:12px;margin:0">Bingoo Connect — Smart NFC Business Cards</p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: owner_email,
      subject,
      body: html,
    });

    console.log(`Lost device notification sent to ${owner_email} for device ${normalizedCode}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyLostDeviceFound error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});