import { useEffect, useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useLostScanLogger — automatic found-report-on-scan flow for lost
 * device/asset public pages.
 *
 * On mount (when `enabled`), calls logLostDeviceScan to create a scan-event
 * report and notify the owner immediately. Exposes an explicit location
 * permission request the finder must tap — precise coordinates are NEVER
 * collected silently; the browser prompts only after the finder clicks.
 *
 * @param {object} opts
 * @param {string} opts.deviceCode - normalized (uppercase) device code
 * @param {boolean} opts.enabled - only log when the device/asset is actually lost
 * @param {string} [opts.scanSource] - "nfc" | "qr" | "direct"
 */
export function useLostScanLogger({ deviceCode, assetId, enabled, scanSource = 'nfc' }) {
  const [reportId, setReportId] = useState(null);
  const [scanLogged, setScanLogged] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | prompted | granted | denied | unsupported
  const [preciseLocation, setPreciseLocation] = useState(null);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!deviceCode || !enabled || loggedRef.current) return;
    loggedRef.current = true;
    base44.functions.invoke('logLostDeviceScan', { device_code: deviceCode || null, asset_id: assetId || null, scan_source: scanSource })
      .then((res) => {
        if (res?.data?.report_id) setReportId(res.data.report_id);
        setScanLogged(true);
      })
      .catch((err) => {
        console.error('logLostDeviceScan failed', err);
        setScanLogged(true);
      });
  }, [deviceCode, assetId, enabled, scanSource]);

  const requestLocation = useCallback(() => {
    setLocationStatus('prompted');
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPreciseLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { reportId, scanLogged, locationStatus, preciseLocation, requestLocation };
}