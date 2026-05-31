import { useState, useEffect } from "react";

export function useBingooTheme() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("bingoo-theme") !== "light"; } catch { return true; }
  });

  useEffect(() => {
    const handler = () => {
      try { setIsDark(localStorage.getItem("bingoo-theme") !== "light"); } catch {}
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