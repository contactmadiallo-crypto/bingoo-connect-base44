import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const ROOT_DASHBOARD = "/bingoo";

// The "root dashboard" is the home view of the Bingoo dashboard. Sub-views
// (connections, analytics, leads, appointments…) are NOT root, so the back
// button navigates between them instead of exiting the app.
function isRootDashboard(location) {
  if (location.pathname !== ROOT_DASHBOARD) return false;
  const view = new URLSearchParams(location.search).get("view");
  return !view || view === "home";
}

/**
 * useAndroidBackButton
 *
 * Top-level hook that listens to Capacitor's App `backButton` event. When the
 * hardware back button is pressed:
 *   - If there is navigation history AND the current page is not the root
 *     dashboard, navigate back through the app's view history.
 *   - Otherwise exit the app.
 *
 * No-op on web; only active on Capacitor native (Android) builds.
 */
export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  // Ref so the long-lived listener always reads the latest location without
  // re-registering on every navigation.
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
    let disposed = false;
    let handle = null;

    const register = async () => {
      handle = await CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (disposed) return;
        const current = locationRef.current;
        const view = current.pathname === ROOT_DASHBOARD ? new URLSearchParams(current.search).get("view") : null;

        // Edit Profile and account settings always return to the Profiles card hub.
        // This keeps Android back consistent with the visible in-app Back control.
        if ((current.pathname === ROOT_DASHBOARD && view === "workspace") || current.pathname === "/account-settings") {
          navigate("/bingoo?view=hub");
          return;
        }

        const hasHistory = canGoBack || window.history.length > 1;
        if (hasHistory && !isRootDashboard(current)) {
          navigate(-1);
        } else {
          CapacitorApp.exitApp();
        }
      });
    };

    register().catch((e) => console.warn("[useAndroidBackButton]", e));
    return () => {
      disposed = true;
      handle?.remove?.();
    };
  }, [navigate]);
}