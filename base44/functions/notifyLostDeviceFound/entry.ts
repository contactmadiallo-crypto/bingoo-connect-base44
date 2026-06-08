import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { owner_email, owner_name, device_code, finder_name, finder_phone, finder_email, finder_location, finder_message } = await req.json();

    if (!owner_email || !device_code) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = `🔍 Your lost item (${device_code}) has been found!`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#0B2E6B,#1a4a9e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">🎉 Good News!</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Someone found your lost item</p>
        </div>
        <div style="padding:28px">
          <p style="color:#334155;font-size:16px">Hi ${owner_name || 'there'},</p>
          <p style="color:#64748b">Someone scanned your lost NFC device <strong>${device_code}</strong> and left a report:</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #3b82f6">
            <p style="margin:4px 0;color:#334155"><strong>Finder Name:</strong> ${finder_name || 'Anonymous'}</p>
            ${finder_phone ? `<p style="margin:4px 0;color:#334155"><strong>Phone:</strong> ${finder_phone}</p>` : ''}
            ${finder_email ? `<p style="margin:4px 0;color:#334155"><strong>Email:</strong> ${finder_email}</p>` : ''}
            ${finder_location ? `<p style="margin:4px 0;color:#334155"><strong>Location Found:</strong> ${finder_location}</p>` : ''}
            ${finder_message ? `<p style="margin:4px 0;color:#334155"><strong>Message:</strong> ${finder_message}</p>` : ''}
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

    console.log(`Lost device notification sent to ${owner_email} for device ${device_code}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyLostDeviceFound error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});