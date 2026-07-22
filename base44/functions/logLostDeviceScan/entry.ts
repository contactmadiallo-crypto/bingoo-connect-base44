import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveLostDeviceContext, resolveLostAssetContext, deviceDisplayLabel } from '../../shared/lostDeviceResolver.ts';

/**
 * logLostDeviceScan
 * Called automatically when a lost device/asset public page is opened by a
 * finder. Creates a LostItemReport (scan event — no finder details yet) and
 * notifies the owner immediately (BingooNotification + email).
 *
 * Input:
 *   { device_code?, asset_id?, scan_source?: "nfc"|"qr"|"direct", latitude?, longitude? }
 *   Either device_code (NFC scan) or asset_id (asset QR) is required.
 *
 * Returns: { report_id, owner_notified }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { device_code, asset_id, scan_source, latitude, longitude } = body;

    const hasCode = !!device_code;
    const hasAssetId = !!asset_id;
    if (!hasCode && !hasAssetId) {
      return Response.json({ error: 'Missing required field: device_code or asset_id' }, { status: 400 });
    }

    const normalizedCode = hasCode ? String(device_code).toUpperCase().trim() : null;
    const ctx = hasCode
      ? await resolveLostDeviceContext(base44, normalizedCode)
      : await resolveLostAssetContext(base44, String(asset_id).trim());

    if (!ctx.device && !ctx.asset) {
      return Response.json({ error: 'Device or asset not found' }, { status: 404 });
    }
    if (!ctx.isDeviceLost && !ctx.isAssetLost) {
      return Response.json({ skipped: true, reason: 'Item is not in lost state' });
    }

    const scanTime = new Date().toISOString();
    const source = scan_source === 'qr' ? 'qr' : scan_source === 'direct' ? 'direct' : 'nfc';
    const identifier = normalizedCode || ctx.asset?.name || 'your item';
    const label = ctx.device ? deviceDisplayLabel(ctx.device) : (ctx.asset?.name || 'item');

    // Create the scan-event report (no finder details yet).
    const report = await base44.asServiceRole.entities.LostItemReport.create({
      device_code: normalizedCode || null,
      device_id: ctx.device?.id || null,
      device_type: ctx.device?.device_type || null,
      product_name: ctx.device?.product_name || null,
      owner_profile_id: ctx.device?.profile_id || ctx.asset?.profile_id || null,
      owner_user_id: ctx.ownerUserId,
      asset_id: ctx.asset?.id || null,
      asset_name: ctx.asset?.name || null,
      assigned_target_name: ctx.assignedTargetName,
      scan_source: source,
      scan_time: scanTime,
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      precise_location_shared: typeof latitude === 'number',
      status: 'new',
      reward_offered: ctx.asset?.reward_offered || null,
    });

    // Notify the owner (in-app notification + email).
    let ownerNotified = false;
    const notifProfileId = ctx.device?.profile_id || ctx.asset?.profile_id || null;
    if (ctx.ownerUserId || notifProfileId) {
      try {
        await base44.asServiceRole.entities.BingooNotification.create({
          user_id: ctx.ownerUserId || null,
          profile_id: notifProfileId,
          event_type: 'lost_device_reported',
          title: `📍 Lost item scanned: ${identifier}`,
          message: `Someone just scanned your lost ${label}${ctx.asset ? ` (${ctx.asset.name})` : ''} assigned to ${ctx.assignedTargetName || 'you'}.${typeof latitude === 'number' ? ' Location shared.' : ''}`,
          action_url: '/bingoo?view=lost-found',
          related_id: report.id,
          actor_name: 'Finder',
        });
        ownerNotified = true;
      } catch (e) {
        console.error('[logLostDeviceScan] notification create error:', e.message);
      }
    }

    if (ctx.ownerEmail) {
      try {
        const target = ctx.assignedTargetName || 'your item';
        const codePart = normalizedCode ? ` (code <strong>${normalizedCode}</strong>)` : '';
        const subject = `📍 Your lost ${label}${normalizedCode ? ` (${normalizedCode})` : ''} was just scanned`;
        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <div style="background:linear-gradient(135deg,#0b2149,#13284f);padding:28px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px">📍 Lost Item Scanned</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Someone just found your item</p>
            </div>
            <div style="padding:24px">
              <p style="color:#334155;font-size:15px">Hi ${ctx.ownerName || 'there'},</p>
              <p style="color:#64748b">Someone scanned your lost <strong>${label}</strong>${codePart}${ctx.asset ? ` linked to <strong>${ctx.asset.name}</strong>` : ''} assigned to <strong>${target}</strong>.</p>
              <p style="color:#64748b;font-size:14px">If they share their contact details, you'll receive another notification with their information.</p>
              <div style="text-align:center;margin-top:20px">
                <a href="https://bingooconnect.com/bingoo?view=lost-found" style="background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">View Lost &amp; Found</a>
              </div>
            </div>
            <div style="background:#f1f5f9;padding:14px;text-align:center">
              <p style="color:#94a3b8;font-size:12px;margin:0">Bingoo Connect — Smart NFC Recovery</p>
            </div>
          </div>`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ctx.ownerEmail,
          subject,
          body: html,
        });
        ownerNotified = true;
      } catch (e) {
        console.error('[logLostDeviceScan] email error:', e.message);
      }
    }

    console.log(`[logLostDeviceScan] ${identifier} report ${report.id} created. notified=${ownerNotified}`);
    return Response.json({ report_id: report.id, owner_notified: ownerNotified });
  } catch (error) {
    console.error('logLostDeviceScan error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});