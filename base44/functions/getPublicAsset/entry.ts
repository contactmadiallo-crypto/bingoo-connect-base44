import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildFinderSafeAssetResponse } from '../../shared/lostDeviceResolver.ts';

/**
 * getPublicAsset
 * Public lookup of a registered asset by its id — powers asset QR codes
 * (every asset gets a QR, including Free accounts with no NFC device).
 * Returns the same finder-safe shape as getAssetByNfcCode; `device` is null
 * when the asset has no linked NFC device.
 *
 * Input: { asset_id }  (or ?asset_id= query param)
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const rawId = body.asset_id || url.searchParams.get('asset_id') || url.pathname.split('/').pop();

    if (!rawId) {
      return Response.json({ error: 'Missing asset_id parameter' }, { status: 400 });
    }

    const assetId = String(rawId).trim();
    const base44 = createClientFromRequest(req);

    const assets = await base44.asServiceRole.entities.AssetItem.filter({ id: assetId });
    if (!assets || assets.length === 0) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }
    const asset = assets[0];

    // Optional linked NFC device (may be null for Free accounts).
    let device = null;
    if (asset.nfc_device_id) {
      try {
        const devices = await base44.asServiceRole.entities.NFCDevice.filter({ id: asset.nfc_device_id });
        device = devices?.[0] || null;
      } catch (_e) { /* best-effort */ }
    }

    return Response.json(await buildFinderSafeAssetResponse(base44, asset, device));
  } catch (error) {
    console.error('getPublicAsset error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});