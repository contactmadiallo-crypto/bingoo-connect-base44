import { useRef, useEffect, useState, useCallback } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function WheelColumn({ items, value, onChange, isDark }) {
  const ref = useRef(null);
  const itemH = 28;
  const visibleCount = 3;
  const paddingItems = Math.floor(visibleCount / 2);

  const padded = [
    ...Array(paddingItems).fill(null),
    ...items,
    ...Array(paddingItems).fill(null),
  ];

  const selectedIndex = items.indexOf(value);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = selectedIndex * itemH;
    }
  }, [value]);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / itemH);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (items[clamped] !== value) onChange(items[clamped]);
  }, [items, value, onChange]);

  return (
    <div className="relative flex-1" style={{ height: itemH * visibleCount }}>
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10 rounded-xl"
        style={{
          top: itemH * paddingItems,
          height: itemH,
          background: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.12)",
          border: "1.5px solid rgba(59,130,246,0.5)",
        }}
      />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
        style={{ background: isDark ? "linear-gradient(to bottom, #1e293b, transparent)" : "linear-gradient(to bottom, white, transparent)" }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
        style={{ background: isDark ? "linear-gradient(to top, #1e293b, transparent)" : "linear-gradient(to top, white, transparent)" }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="overflow-y-scroll h-full scrollbar-hide snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {padded.map((item, i) => (
          <div
            key={i}
            onClick={() => item && onChange(item)}
            className="snap-center flex items-center justify-center font-bold text-lg cursor-pointer select-none"
            style={{
              height: itemH,
              color: item === value
                ? (isDark ? "#60a5fa" : "#2563eb")
                : item === null
                ? "transparent"
                : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"),
              fontSize: item === value ? "1.1rem" : "0.95rem",
              transition: "all 0.15s",
            }}
          >
            {item ?? "·"}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimeWheelPicker({ value = "09:00", onChange, isDark }) {
  const [hour, setHour] = useState(value?.split(":")[0] || "09");
  const [minute, setMinute] = useState(() => {
    const m = value?.split(":")[1] || "00";
    // snap to nearest quarter
    const num = parseInt(m);
    const snapped = MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - num) < Math.abs(parseInt(prev) - num) ? cur : prev
    );
    return snapped;
  });

  useEffect(() => {
    const h = value?.split(":")[0] || "09";
    const m = value?.split(":")[1] || "00";
    setHour(h);
    const num = parseInt(m);
    const snapped = MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - num) < Math.abs(parseInt(prev) - num) ? cur : prev
    );
    setMinute(snapped);
  }, [value]);

  const handleHour = (h) => {
    setHour(h);
    onChange(`${h}:${minute}`);
  };

  const handleMinute = (m) => {
    setMinute(m);
    onChange(`${hour}:${m}`);
  };

  return (
    <div
      className="flex items-center gap-1 rounded-xl overflow-hidden px-2"
      style={{
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        width: 90,
      }}
    >
      <WheelColumn items={HOURS} value={hour} onChange={handleHour} isDark={isDark} />
      <span className="font-black text-lg" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>:</span>
      <WheelColumn items={MINUTES} value={minute} onChange={handleMinute} isDark={isDark} />
    </div>
  );
}