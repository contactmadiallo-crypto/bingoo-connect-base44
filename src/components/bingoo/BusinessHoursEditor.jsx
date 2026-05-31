import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS = { monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",sunday:"Sun" };

const DEFAULT_HOURS = { enabled: true, start: "09:00", end: "17:00" };

export default function BusinessHoursEditor({ value = {}, onChange }) {
  const hours = value || {};

  const toggle = (day) => {
    const cur = hours[day] || DEFAULT_HOURS;
    onChange({ ...hours, [day]: { ...cur, enabled: !cur.enabled } });
  };

  const setTime = (day, field, val) => {
    const cur = hours[day] || DEFAULT_HOURS;
    onChange({ ...hours, [day]: { ...cur, [field]: val } });
  };

  return (
    <div className="space-y-2">
      {DAYS.map(day => {
        const cfg = hours[day] || { enabled: false, start: "09:00", end: "17:00" };
        return (
          <div key={day} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${cfg.enabled ? "bg-blue-50/60" : "bg-slate-50"}`}>
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative ${cfg.enabled ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${cfg.enabled ? "left-4" : "left-0.5"}`} />
            </button>
            <span className={`w-8 text-sm font-bold flex-shrink-0 ${cfg.enabled ? "text-slate-800" : "text-slate-400"}`}>{DAY_LABELS[day]}</span>
            {cfg.enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <Input type="time" value={cfg.start || "09:00"} onChange={e => setTime(day, "start", e.target.value)} className="h-8 text-sm border-slate-200 flex-1" />
                <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                <Input type="time" value={cfg.end || "17:00"} onChange={e => setTime(day, "end", e.target.value)} className="h-8 text-sm border-slate-200 flex-1" />
              </div>
            ) : (
              <span className="text-slate-400 text-xs italic">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}