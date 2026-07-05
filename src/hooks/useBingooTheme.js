import { useState, useEffect } from "react";

/**
 * useBingooTheme
 *
 * Dark mode follows the Android/system preference when no explicit user choice
 * is stored in localStorage. When the user manually toggles, their choice is
 * persisted and takes precedence over the system preference.
 *
 * The dark/light state is applied by toggling the `dark` class on
 * document.documentElement so Tailwind's `darkMode: ['class']` config activates.
 */
export function useBingooTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem("bingoo-theme");
      if (stored) return stored === "dark";
      // No explicit user choice — follow system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return true;
    }
  });

  // Apply the dark class to <html> so Tailwind dark: variants activate
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  // Listen for system theme changes — only when no explicit user choice is stored
  useEffect(() => {
    let hasExplicitChoice = false;
    try { hasExplicitChoice = !!localStorage.getItem("bingoo-theme"); } catch {}

    if (hasExplicitChoice) return; // user override takes precedence

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Sync across hook instances when the manual toggle fires
  useEffect(() => {
    const handler = () => {
      try {
        const stored = localStorage.getItem("bingoo-theme");
        if (stored) {
          setIsDark(stored === "dark");
        } else {
          setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      } catch {}
    };
    window.addEventListener("bingoo-theme-change", handler);
    return () => window.removeEventListener("bingoo-theme-change", handler);
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    try { localStorage.setItem("bingoo-theme", next); } catch {}
    window.dispatchEvent(new Event("bingoo-theme-change"));
  };

  return { isDark, toggle };
}