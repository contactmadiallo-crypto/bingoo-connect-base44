import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { base44 } from "@/api/base44Client";
import { scheduleAppointmentReminders } from "@/lib/nativeLocalNotifications";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

const PROD_HOSTS = new Set(["bingooconnect.com", "www.bingooconnect.com"]);

function internalDestination(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (url.protocol === "bingooconnect:" && url.hostname === "auth") {
      // OAuth returns to bingooconnect://auth/auth?...; keep the complete app path.
      return url.pathname + url.search + url.hash;
    }
    if (!PROD_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}

function absorbAuthParams(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const token = url.searchParams.get("access_token");
    if (token) localStorage.setItem("base44_access_token", token);
    for (const key of ["app_id", "server_url", "functions_version", "from_url"]) {
      const value = url.searchParams.get(key);
      if (value) localStorage.setItem(`base44_${key}`, value);
    }
    return !!token;
  } catch { return false; }
}

async function syncNativeState(queryClient) {
  try {
    const user = await base44.auth.me();
    if (!user?.id) return;
    const appointments = await base44.entities.Appointment.filter({ owner_user_id: user.id }, "-date", 200);
    await scheduleAppointmentReminders(appointments);
    queryClient.invalidateQueries({ queryKey: ["bingoo-notifications", user.id] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["appointments-owner", user.id] });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  } catch (error) { console.warn("[NativeAndroidBridge sync]", error); }
}

export default function NativeAndroidBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  // Hardware back button is handled by the dedicated top-level hook.
  useAndroidBackButton();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    let disposed = false;
    const handles = [];

    const register = async () => {
      handles.push(await CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
        if (disposed) return;
        const destination = internalDestination(url);
        const hasFreshToken = absorbAuthParams(url);
        if (hasFreshToken) {
          // Reload once so Base44/AuthContext initializes from the newly returned OAuth token.
          window.location.replace(destination || "/auth");
          return;
        }
        if (destination) navigate(destination, { replace: false });
      }));
      handles.push(await CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (!disposed && isActive) syncNativeState(queryClient);
      }));
      handles.push(await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
        if (disposed) return;
        const destination = internalDestination(notification?.extra?.route || "/bingoo?view=appointments");
        if (destination) navigate(destination, { replace: false });
      }));

      const launch = await CapacitorApp.getLaunchUrl();
      if (!disposed && launch?.url) {
        const destination = internalDestination(launch.url);
        const current = location.pathname + location.search + location.hash;
        if (destination && destination !== current) navigate(destination, { replace: true });
      }
      if (!disposed) await syncNativeState(queryClient);
    };

    register().catch((error) => console.warn("[NativeAndroidBridge]", error));
    return () => {
      disposed = true;
      handles.forEach((handle) => handle?.remove?.());
    };
  }, [navigate, queryClient]);

  return null;
}