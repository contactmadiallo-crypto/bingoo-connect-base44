import { useEffect, useRef, useState } from 'react';

/**
 * ScreenPullToRefresh — page-level pull-to-refresh that works on native
 * window/body scroll (no nested overflow container, so it never traps page
 * scroll or horizontal tab bars).
 *
 * Only activates when the page is scrolled to the very top, so it won't fire
 * while a form is scrolled down or a modal is open. Pass `disabled` to turn
 * it off entirely on form/modal views.
 */
export default function ScreenPullToRefresh({ onRefresh, disabled = false }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const activeRef = useRef(false);
  const pullingRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e) => {
      if (refreshing || window.scrollY > 0) { activeRef.current = false; return; }
      startYRef.current = e.touches[0].clientY;
      activeRef.current = true;
      pullingRef.current = false;
    };

    const onTouchMove = (e) => {
      if (!activeRef.current || refreshing) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0 && window.scrollY <= 0) {
        pullingRef.current = true;
        setPull(Math.min(dy * 0.5, 72));
        if (e.cancelable) e.preventDefault();
      } else {
        pullingRef.current = false;
        setPull(0);
      }
    };

    const onTouchEnd = async () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      const shouldRefresh = pullingRef.current && pull > 48 && !refreshing;
      pullingRef.current = false;
      if (shouldRefresh) {
        setRefreshing(true);
        setPull(56);
        try { await onRefresh(); } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, refreshing, onRefresh, pull]);

  if (disabled) return null;
  const show = pull > 0 || refreshing;
  if (!show) return null;
  const pct = Math.min(pull / 56, 1);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: Math.max(pull, refreshing ? 56 : 0),
        pointerEvents: 'none',
        transition: refreshing ? 'none' : 'height 0.12s ease-out',
      }}
    >
      <svg
        width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{
          marginBottom: 6,
          transform: `rotate(${refreshing ? 360 : pct * 180}deg)`,
          transition: refreshing ? 'transform 0.9s linear infinite' : 'none',
        }}
      >
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    </div>
  );
}