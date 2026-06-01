import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const isAtTop = () => {
    const el = containerRef.current;
    return !el || el.scrollTop === 0;
  };

  const onTouchStart = useCallback((e) => {
    if (isAtTop()) startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && isAtTop()) {
      e.preventDefault();
      setPullY(Math.min(dy * 0.5, THRESHOLD + 20));
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
            style={{ height: refreshing ? THRESHOLD : pullY }}
          >
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ rotate: refreshing ? 360 : progress * 360 }}
                transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                style={{ opacity: progress }}
              >
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </motion.div>
              {!refreshing && (
                <p className="text-xs font-semibold text-blue-600" style={{ opacity: progress }}>
                  {progress >= 1 ? "Release to refresh" : "Pull to refresh"}
                </p>
              )}
              {refreshing && <p className="text-xs font-semibold text-blue-600">Refreshing…</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ y: pullY > 0 ? pullY : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}