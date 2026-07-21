import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { resolveLostDeviceContext, deviceDisplayLabel } from '../../shared/lostDeviceResolver.ts';

/**
 * notifyLostDeviceFound
 * Called when a finder submits the recovery form on a lost-device/asset page.
 * Attaches finder details (+ precise location if granted) to the scan-event
 * report created earlier by logLostDeviceScan, then notifies the owner again.
 *
 * Input:
 *   {
 *     device_code,
 *     report_id?,            // from logLostDeviceScan — update if provided
 *     finder_name, finder_phone, finder_email, finder_location, finder_message,
 *     latitude?, longitude?,  // precise location only after browser permission
 *     scan_source?
 *   }
 *
 * Security: owner identity is resolved server-side from the device record.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      device_code, report_id,
      finder_name, finder_phone, finder_email, finder_location, finder_message,
      latitude, longitude, scan_source,
    } = body;

    if (!device_code) {
      return Response.json({ error: 'Missing required field: device_code' }, { status: 400 });
    }

    const normalizedCode = String(device_code).toUpperCase().trim();
    const ctx = await resolveLostDeviceContext(base44, normalizedCode);

    if (!ctx.device) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }
    // Allow for both profile-lost devices and asset-lost assets.
    if (!ctx.isDeviceLost && !ctx.isAssetLost) {
      return Response.json({ error: 'Device is not reported as lost' }, { status: 403 });
    }

    // Sanitize finder inputs.
    const sanitize = (val, max = 500) => String(val || '').slice(0, max);
    const f_name = sanitize(finder_name, 100);
    const f_phone = sanitize(finder_phone, 50);
    const f_email = sanitize(finder_email, 200);
    const f_location = sanitize(finder_location, 300);
    const f_message = sanitize(finder_message, 2000);

    let report = null;

    if (report_id) {
      // Update the existing scan-event report with finder details.
      try {
        report = await base44.asServiceRole.entities.LostItemReport.update(report_id, {
          finder_name: f_name,
          finder_phone: f_phone,
          finder_email: f_email,
          finder_location: f_location,
          finder_message: f_message,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
          precise_location_shared: typeof latitude === 'number',
        });
      } catch (e) {
        console.error('[notifyLostDeviceFound] update report error:', e.message);
      }
    }

    if (!report) {
      // Fallback: create a fresh report (backwards compat with old callers).
      try {
        report = await base44.asServiceRole.entities.LostItemReport.create({
          device_code: normalizedCode,
          device_id: ctx.device.id,
          device_type: ctx.device.device_type || null,
          product_name: ctx.device.product_name || null,
          owner_profile_id: ctx.device.profile_id || ctx.asset?.profile_id || null,
          owner_user_id: ctx.ownerUserId,
          asset_id: ctx.asset?.id || null,
          asset_name: ctx.asset?.name || null,
          assigned_target_name: ctx.assignedTargetName,
          scan_source: scan_source === 'qr' ? 'qr' : scan_source === 'direct' ? 'direct' : 'nfc',
          finder_name: f_name,
          finder_phone: f_phone,
          finder_email: f_email,
          finder_location: f_location,
          finder_message: f_message,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
          precise_location_shared: typeof latitude === 'number',
          scan_time: new Date().toISOString(),
          status: 'new',
          reward_offered: ctx.asset?.reward_offered || null,
        });
      } catch (e) {
        console.error('[notifyLostDeviceFound] create report error:', e.message);
      }
    }

    // ── Owner notification: in-app + email ──
    if (ctx.ownerUserId || ctx.device.profile_id) {
      try {
        const label = deviceDisplayLabel(ctx.device);
        const target = ctx.assignedTargetName || 'their item';
        await base44.asServiceRole.entities.BingooNotification.create({
          user_id: ctx.ownerUserId || null,
          profile_id: ctx.device.profile_id || null,
          event_type: 'lost_device_reported',
          title: `🙏 Finder report for ${normalizedCode}`,
          message: `${f_name || 'A finder'} submitted a report for your ${label}${ctx.asset ? ` (${ctx.asset.name})` : ''} assigned to ${target}.${typeof latitude === 'number' ? ' Location shared.' : ''}`,
          action_url: '/bingoo?view=lost-found',
          related_id: report?.id || null,
          actor_name: f_name || 'Finder',
        });
      } catch (e) {
        console.error('[notifyLostDeviceFound] notification error:', e.message);
      }
    }

    if (ctx.ownerEmail) {
      const label = deviceDisplayLabel(ctx.device);
      const subject = `🙏 Your lost ${label} (${normalizedCode}) — finder report`;
      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#0b2149,#13284f);padding:30px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">🙏 Finder Report</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Someone left details for your lost item</p>
          </div>
          <div style="padding:26px">
            <p style="color:#334155;font-size:15px">Hi ${ctx.ownerName || 'there'},</p>
            <p style="color:#64748b">Someone submitted a report for your lost <strong>${label}</strong> (code <strong>${normalizedCode}</strong>)${ctx.asset ? ` linked to <strong>${ctx.asset.name}</strong>` : ''}.</p>
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #f97316">
              <p style="margin:4px 0;color:#334155"><strong>Finder:</strong> ${f_name || 'Anonymous'}</p>
              ${f_phone ? `<p style="margin:4px 0;color:#334155"><strong>Phone:</strong> ${f_phone}</p>` : ''}
              ${f_email ? `<p style="margin:4px 0;color:#334155"><strong>Email:</strong> ${f_email}</p>` : ''}
              ${f_location ? `<p style="margin:4px 0;color:#334155"><strong>Location:</strong> ${f_location}</p>` : ''}
              ${typeof latitude === 'number' ? `<p style="margin:4px 0;color:#334155"><strong>GPS:</strong> <a href="https://maps.google.com/?q=${latitude},${longitude}">View on map</a></p>` : ''}
              ${f_message ? `<p style="margin:4px 0;color:#334155"><strong>Message:</strong> ${f_message}</p>` : ''}
            </div>
            <div style="text-align:center;margin-top:22px">
              <a href="https://bingooconnect.com/bingoo?view=lost-found" style="background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">View Report</a>
            </div>
          </div>
          <div style="background:#f1f5f9;padding:14px;text-align:center">
            <p style="color:#94a3b8;font-size:12px;margin:0">Bingoo Connect — Smart NFC Recovery</p>
          </div>
        </div>`;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ctx.ownerEmail,
          subject,
          body: html,
        });
      } catch (e) {
        console.error('[notifyLostDeviceFound] email error:', e.message);
      }
    }

    console.log(`[notifyLostDeviceFound] ${normalizedCode} finder report ${report?.id || 'n/a'}`);
    return Response.json({ success: true, report_id: report?.id || null });
  } catch (error) {
    console.error('notifyLostDeviceFound error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});