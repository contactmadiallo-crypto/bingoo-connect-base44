import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function StepperColumn({ items, value, onChange, isDark }) {
  const idx = Math.max(0, items.indexOf(value));

  const step = (dir) => {
    const next = (idx + dir + items.length) % items.length;
    onChange(items[next]);
  };

  const btnCls = isDark
    ? "text-white/40 hover:text-white hover:bg-white/10 active:bg-white/15"
    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200";

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: 38 }}>
      <button
        type="button"
        onClick={() => step(-1)}
        className={`w-full flex items-center justify-center py-0.5 rounded-md transition-colors ${btnCls}`}
        aria-label="Increase"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <div
        className="font-black text-lg leading-tight text-center select-none"
        style={{ color: isDark ? "#60a5fa" : "#2563eb", minWidth: 30 }}
      >
        {items[idx]}
      </div>
      <button
        type="button"
        onClick={() => step(1)}
        className={`w-full flex items-center justify-center py-0.5 rounded-md transition-colors ${btnCls}`}
        aria-label="Decrease"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TimeWheelPicker({ value = "09:00", onChange, isDark }) {
  const [hour, setHour] = useState(value?.split(":")[0] || "09");
  const [minute, setMinute] = useState(() => {
    const m = value?.split(":")[1] || "00";
    const num = parseInt(m);
    return MINUTES.reduce((prev, cur) =>
      Math.abs(parseInt(cur) - num) < Math.abs(parseInt(prev) - num) ? cur : prev
    );
  });

  useEffect(() => {
    const h = value?.split(":")[0] || "09";
    const m = value?.split(":")[1] || "00";
    setHour(h);
    const num = parseInt(m);
    setMinute(
      MINUTES.reduce((prev, cur) =>
        Math.abs(parseInt(cur) - num) < Math.abs(parseInt(prev) - num) ? cur : prev
      )
    );
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
      className="flex items-center gap-1 rounded-xl overflow-hidden px-2 py-1"
      style={{
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
      }}
    >
      <StepperColumn items={HOURS} value={hour} onChange={handleHour} isDark={isDark} />
      <span className="font-black text-lg" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>:</span>
      <StepperColumn items={MINUTES} value={minute} onChange={handleMinute} isDark={isDark} />
    </div>
  );
}