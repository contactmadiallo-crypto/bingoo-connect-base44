import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useBingooTheme } from "@/hooks/useBingooTheme";

// Bingoo brand backgrounds — match the CSS token values in src/index.css.
const LIGHT_BACKGROUND = "#ffffff";
const DARK_BACKGROUND = "#0b2149";

/**
 * useThemeStatusBar
 *
 * Observes the active Bingoo theme and applies the native status bar style
 * and background color to match it (light icons on dark navy, or dark icons
 * on white) instead of the hardcoded white background from capacitor.config.ts.
 *
 * No-op on web; runs on iOS and Android native builds.
 */
export function useThemeStatusBar() {
  const { isDark } = useBingooTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const apply = async () => {
      try {
        const isAndroid = Capacitor.getPlatform() === "android";
        // Android 15+ (targetSdk 36) is edge-to-edge: overlay/background calls are ignored and the
        // strip behind the status bar is the navy window background (see styles.xml +
        // android.adjustMarginsForEdgeToEdge in capacitor.config.ts). Icons must therefore always be
        // light on Android, whatever the in-app theme is.
        if (isAndroid) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: DARK_BACKGROUND }).catch(() => {});
          return;
        }
        // iOS: keep the WebView below the status bar and match it to the active theme.
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND });
      } catch (e) {
        console.warn("[useThemeStatusBar]", e);
      }
    };
    apply();
  }, [isDark]);
}