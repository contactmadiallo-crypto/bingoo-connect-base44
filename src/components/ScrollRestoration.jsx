import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// In-memory map of scroll positions per route key (pathname + search + hash).
// On POP (back/forward), restores the saved position so users return to where they were.
// On PUSH/REPLACE, scrolls to top for a fresh view.
const scrollPositions = new Map();

export default function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevKey = useRef(null);

  useEffect(() => {
    const key = location.pathname + location.search + location.hash;

    // Save scroll position of the route we're leaving
    if (prevKey.current != null) {
      scrollPositions.set(prevKey.current, window.scrollY);
    }

    if (navType === "POP" && scrollPositions.has(key)) {
      // Back/forward — restore saved scroll position after content renders
      const saved = scrollPositions.get(key);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.scrollTo(0, saved));
      });
    } else {
      // New navigation — scroll to top
      window.scrollTo(0, 0);
    }

    prevKey.current = key;
  }, [location.pathname, location.search, location.hash, navType]);

  return null;
}