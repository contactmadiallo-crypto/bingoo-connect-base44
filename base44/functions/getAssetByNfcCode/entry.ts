import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildFinderSafeAssetResponse } from '../../shared/lostDeviceResolver.ts';

/**
 * getAssetByNfcCode
 * Public lookup of the asset linked to an NFC device by device_code.
 * Finder-safe response built by the shared buildFinderSafeAssetResponse helper.
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const rawCode = body.device_code || url.searchParams.get('device_code') || url.pathname.split('/').pop();

    if (!rawCode) {
      return Response.json({ error: 'Missing device_code parameter' }, { status: 400 });
    }

    const deviceCode = String(rawCode).toUpperCase().trim();
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
    return Response.json(await buildFinderSafeAssetResponse(base44, asset, device));
  } catch (error) {
    console.error('getAssetByNfcCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});