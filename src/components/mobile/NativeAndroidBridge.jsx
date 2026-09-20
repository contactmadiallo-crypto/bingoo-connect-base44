import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { PushNotifications } from "@capacitor/push-notifications";

const PROD_HOSTS = new Set(["bingooconnect.com", "www.bingooconnect.com"]);

function internalDestination(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (!PROD_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

function notificationDestination(notification) {
  const data = notification?.data || {};
  return internalDestination(data.url || data.action_url || data.route || "/bingoo");
}

/**
 * Android-native navigation bridge.
 * - Converts verified bingooconnect.com App Links (NFC /d/*, profiles /p/*,
 *   assets /a/*, lost mode, auth/checkout returns) into React Router navigation.
 * - Makes the Android system Back button follow browser history before exiting.
 * - Does not intercept external URLs such as Stripe or Google Wallet.
 */
export default function NativeAndroidBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;

    let disposed = false;
    const handles = [];

    const register = async () => {
      handles.push(await CapacitorApp.addListener("appUrlOpen", ({ url }) => {
        if (disposed) return;
        const destination = internalDestination(url);
        if (destination) navigate(destination, { replace: false });
      }));

      handles.push(await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (disposed) return;
        if (canGoBack || window.history.length > 1) {
          navigate(-1);
        } else {
          CapacitorApp.exitApp();
        }
      }));

      // Native FCM notification taps must land inside the signed-in Bingoo app,
      // not open a second browser window or fall back to the marketing page.
      handles.push(await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
        if (disposed) return;
        const destination = notificationDestination(notification);
        if (destination) navigate(destination, { replace: false });
      }));

      const launch = await CapacitorApp.getLaunchUrl();
      if (!disposed && launch?.url) {
        const destination = internalDestination(launch.url);
        const current = location.pathname + location.search + location.hash;
        if (destination && destination !== current) navigate(destination, { replace: true });
      }
    };

    register().catch((error) => console.warn("[NativeAndroidBridge]", error));

    return () => {
      disposed = true;
      handles.forEach((handle) => handle?.remove?.());
    };
  }, [navigate]);

  return null;
}
