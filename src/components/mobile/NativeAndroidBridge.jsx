import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const PROD_HOSTS = new Set(["bingooconnect.com", "www.bingooconnect.com"]);

function internalDestination(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!PROD_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
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
