import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function detectDevice() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\/|Chromium\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  let platform = 'Device';
  if (/iPhone|iPad|iPod/.test(ua)) platform = 'iOS';
  else if (/Android/.test(ua)) platform = 'Android';
  else if (/Mac/.test(ua)) platform = 'macOS';
  else if (/Windows/.test(ua)) platform = 'Windows';
  return { browser, platform, label: `${platform} · ${browser}` };
}

// Web Push needs a service worker + PushManager. It does NOT exist inside the installed
// Android/iOS (Capacitor) WebView, so the web toggle must not be offered there.
const webPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  !Capacitor.isNativePlatform();

async function getRegistration() {
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  return navigator.serviceWorker.ready;
}

/**
 * usePushNotifications — browser Web Push opt-in.
 *
 * Previously this hook saved the subscription through a backend function
 * (`savePushSubscription`) that does not exist, so the browser permission was granted but the
 * server never learned about the device and no push could ever arrive. It now stores the
 * subscription in the PushSubscription entity — the same record the Account Settings
 * "Bingoo Notifications" card and `sendPushNotification` use.
 *
 * `error` is a stable code ('unsupported' | 'denied' | 'failed') so the UI can translate it.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const supported = webPushSupported();

  const checkSubscription = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (!sub) { setIsSubscribed(false); return; }
      // Subscribed in the browser AND known/enabled on the server.
      const me = await base44.auth.me();
      const rows = await base44.entities.PushSubscription.filter({ user_id: me.id, endpoint: sub.endpoint });
      setIsSubscribed(rows.some((r) => r.enabled !== false));
    } catch {
      setIsSubscribed(false);
    }
  }, [supported]);

  useEffect(() => { checkSubscription(); }, [checkSubscription]);

  const subscribe = async () => {
    setError(null);
    if (!supported) { setError('unsupported'); return false; }
    setIsLoading(true);
    try {
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      if (permResult !== 'granted') { setError('denied'); return false; }

      const res = await base44.functions.invoke('getVapidPublicKey', {});
      const vapidPublicKey = res?.data?.publicKey;
      if (!vapidPublicKey) throw new Error('VAPID public key not available');

      const reg = await getRegistration();
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const me = await base44.auth.me();

      const existing = await base44.entities.PushSubscription.filter({ user_id: me.id, endpoint: json.endpoint });
      if (existing.length) {
        await base44.entities.PushSubscription.update(existing[0].id, { enabled: true, p256dh: json.keys.p256dh, auth: json.keys.auth });
      } else {
        const { browser, platform, label } = detectDevice();
        await base44.entities.PushSubscription.create({
          user_id: me.id,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          device_label: label,
          browser,
          platform,
          enabled: true,
          created_at: new Date().toISOString(),
        });
      }
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      setError('failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const me = await base44.auth.me();
        const rows = await base44.entities.PushSubscription.filter({ user_id: me.id, endpoint: sub.endpoint });
        await Promise.all(rows.map((r) => base44.entities.PushSubscription.delete(r.id).catch(() => {})));
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      setError('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { permission, isSubscribed, isLoading, supported, error, subscribe, unsubscribe };
}
