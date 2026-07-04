import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Trash2, Loader2, Smartphone, Send, Info } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function detectDevice() {
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\/|Chromium\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";

  let platform = "Device";
  if (/iPhone|iPad|iPod/.test(ua)) platform = "iOS";
  else if (/Android/.test(ua)) platform = "Android";
  else if (/Mac/.test(ua)) platform = "macOS";
  else if (/Windows/.test(ua)) platform = "Windows";

  return { browser, platform, label: `${platform} · ${browser}` };
}

export default function PhoneAlertsSection({ user }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [testing, setTesting] = useState(false);
  // Robust push support detection: PushManager may be exposed on window OR only on
  // ServiceWorkerRegistration.prototype (Safari/iOS). Check both to avoid false negatives.
  const hasSW = typeof navigator !== "undefined" && "serviceWorker" in navigator;
  const hasPushGlobal = typeof window !== "undefined" && "PushManager" in window;
  const hasPushProto = typeof ServiceWorkerRegistration !== "undefined" && "pushManager" in ServiceWorkerRegistration.prototype;
  const supported = hasSW && (hasPushGlobal || hasPushProto);
  const inIframe = typeof window !== "undefined" && window.self !== window.top;
  // iOS requires "Add to Home Screen" (PWA install) for web push to actually work
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  const fetchSubs = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const list = await base44.entities.PushSubscription.filter({ user_id: user.id });
      setSubs(list);
    } catch (e) {
      console.error("Fetch push subs error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const handleEnable = async () => {
    if (!supported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }
    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("Notification permission was denied. Enable it in your browser settings to get alerts.");
        setSubscribing(false);
        return;
      }

      // Register the service worker (the published app already serves /sw.js)
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const reg = await navigator.serviceWorker.ready;

      // Fetch VAPID public key
      const res = await base44.functions.invoke("getVapidPublicKey", {});
      const vapidKey = res.data?.publicKey;
      if (!vapidKey) throw new Error("VAPID public key not available");

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const subJson = subscription.toJSON();

      const { browser, platform, label } = detectDevice();

      await base44.entities.PushSubscription.create({
        user_id: user.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        device_label: label,
        browser,
        platform,
        enabled: true,
        created_at: new Date().toISOString(),
      });

      toast.success("Phone alerts enabled! You'll be notified of new leads and appointment reminders.");
      fetchSubs();
    } catch (e) {
      console.error("Push subscribe error:", e);
      toast.error("Could not enable push notifications: " + (e.message || "Unknown error"));
    } finally {
      setSubscribing(false);
    }
  };

  const handleToggle = async (sub) => {
    try {
      await base44.entities.PushSubscription.update(sub.id, { enabled: !sub.enabled });
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, enabled: !s.enabled } : s)));
      toast.success(sub.enabled ? "Alerts paused for this device" : "Alerts resumed for this device");
    } catch (e) {
      toast.error("Could not update device");
    }
  };

  const handleRemove = async (sub) => {
    // Unsubscribe from the browser push manager if this is the current device
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing && existing.endpoint === sub.endpoint) {
        await existing.unsubscribe();
      }
    } catch (e) {
      /* ignore */
    }
    try {
      await base44.entities.PushSubscription.delete(sub.id);
      setSubs((prev) => prev.filter((s) => s.id !== sub.id));
      toast.success("Device removed");
    } catch (e) {
      toast.error("Could not remove device");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke("sendPushNotification", {
        user_id: user.id,
        title: "🔔 Test alert from Bingoo",
        body: "Phone alerts are working! You'll get new lead and appointment reminders here.",
        url: "/bingoo",
      });
      if (res.data?.sent > 0) toast.success("Test push sent — check your device!");
      else toast.info("No enabled devices found. Enable alerts first.");
    } catch (e) {
      toast.error("Test failed: " + (e.message || "Unknown error"));
    } finally {
      setTesting(false);
    }
  };

  const activeCount = subs.filter((s) => s.enabled).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          {activeCount > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-900">Phone Alerts</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Get instant push notifications on your phone for new leads and upcoming appointment reminders.
          </p>
        </div>
      </div>

      {!supported && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Push notifications aren't supported in this browser. Try Chrome, Safari, or Edge on a mobile device or desktop.</span>
        </div>
      )}

      {supported && inIframe && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Push notifications only work in the published app, not inside this preview. Open your live site to enable them.</span>
        </div>
      )}

      {supported && isIOS && !inIframe && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>On iPhone/iPad, tap the Share button and choose <strong>Add to Home Screen</strong> first — Apple only allows web push from installed apps.</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={handleEnable} disabled={!supported || subscribing || permission === "denied"}>
          {subscribing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enabling…
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" /> Enable on this device
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={testing || subs.length === 0}>
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send test
            </>
          )}
        </Button>
      </div>

      {/* Device list */}
      <div className="mt-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading devices…
          </div>
        ) : subs.length === 0 ? (
          <p className="text-sm text-slate-400">No devices connected yet. Enable alerts above to add this device.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {subs.map((sub) => (
              <li key={sub.id} className="flex items-center gap-3 px-3 py-2.5">
                <Smartphone className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {sub.device_label || sub.platform || sub.browser || "Device"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    Added {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(sub)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    sub.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {sub.enabled ? "On" : "Paused"}
                </button>
                <button
                  onClick={() => handleRemove(sub)}
                  className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove device"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}