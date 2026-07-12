import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";

/**
 * Lost Mode toggle for an NFC device card.
 * - Toggle ON → calls onTurnOn (opens confirmation dialog)
 * - Toggle OFF → calls onTurnOff directly (with built-in confirmation if found reports exist)
 */
export default function LostModeToggle({ device, reportCount, isDark, isPending, onTurnOn, onTurnOff }) {
  const isLost = device.status === "lost";
  const isDisabled = device.status === "disabled" || device.status === "replaced";
  if (isDisabled) return null;

  const handleToggle = (checked) => {
    if (checked) {
      onTurnOn();
    } else {
      if (reportCount > 0) {
        const ok = window.confirm(
          `${reportCount} found report${reportCount > 1 ? "s" : ""} exist for this device.\n\nTurning off Lost Mode will return the device to normal scanning. Continue?`
        );
        if (!ok) return;
      }
      onTurnOff();
    }
  };

  return (
    <div className={`rounded-xl p-4 ${isLost ? (isDark ? "bg-red-500/10 border border-red-500/25" : "bg-red-50 border border-red-200") : (isDark ? "bg-white/5" : "bg-slate-50")}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLost ? "text-red-400" : (isDark ? "text-white/40" : "text-slate-400")}`}>
            🔒 Lost Mode
          </p>
          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {isLost ? "Lost Mode is ON" : "Lost Mode is OFF"}
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
            {isLost ? "Scans show recovery page with finder form" : "Scans route normally to your profile or asset"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className={`text-[10px] font-bold uppercase ${isLost ? "text-red-500" : (isDark ? "text-white/40" : "text-slate-400")}`}>
            Lost Mode
          </span>
          <Switch checked={isLost} onCheckedChange={handleToggle} disabled={isPending} />
        </div>
      </div>
      {isLost && reportCount > 0 && (
        <div className={`mt-3 flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${isDark ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {reportCount} found report{reportCount > 1 ? "s" : ""} received — check below for finder details
        </div>
      )}
    </div>
  );
}