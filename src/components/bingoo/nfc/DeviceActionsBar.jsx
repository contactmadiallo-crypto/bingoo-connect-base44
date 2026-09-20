import { BottomSheetSelect } from "@/components/ui/BottomSheetSelect";
import { Unlink, RefreshCw, Trash2, Package, User } from "lucide-react";

/**
 * Device action buttons: Link to Profile, Link to Asset, Unlink, Replace, Delete.
 * Shown only for non-disabled/replaced devices.
 */
export default function DeviceActionsBar({
  device, profiles, assets, hasProfile, hasAsset, isDark,
  onLinkProfile, onLinkAsset, onUnlink, onReplace, onDelete,
}) {
  const isDisabled = device.status === "disabled" || device.status === "replaced";
  if (isDisabled) return null;

  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const btnBase = "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors";

  return (
    <div className={`rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${mutedText}`}>Device Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

        {/* Link to Profile */}
        {profiles.length === 0 ? (
          <button disabled className={`${btnBase} bg-blue-600/50 text-white/60 cursor-not-allowed`}>
            <User className="w-3.5 h-3.5" /> No Profiles
          </button>
        ) : (
          <BottomSheetSelect
            value=""
            onValueChange={(pid) => onLinkProfile(device.id, pid)}
            placeholder="Link Profile"
            ariaLabel="Link to profile"
            options={profiles.map(p => ({ value: p.id, label: p.display_name }))}
            className="w-full rounded-xl text-xs font-bold"
            style={isDark ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" } : {}}
          />
        )}

        {/* Link to Asset */}
        {assets.length === 0 ? (
          <button disabled className={`${btnBase} bg-purple-600/50 text-white/60 cursor-not-allowed`}>
            <Package className="w-3.5 h-3.5" /> No Assets
          </button>
        ) : (
          <BottomSheetSelect
            value=""
            onValueChange={(aid) => onLinkAsset(device.id, aid)}
            placeholder="Link Asset"
            ariaLabel="Link to asset"
            options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_type})` }))}
            className="w-full rounded-xl text-xs font-bold"
            style={isDark ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" } : {}}
          />
        )}

        {/* Unlink — clears both profile and asset */}
        {(hasProfile || hasAsset) && (
          <button onClick={() => {
            if (window.confirm("Unlink this device from its profile and/or asset? Scans will show an unassigned page until relinked.")) {
              onUnlink(device);
            }
          }} className={`${btnBase} ${isDark ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
            <Unlink className="w-3.5 h-3.5" /> Unlink
          </button>
        )}

        {/* Replace Device */}
        <button onClick={() => onReplace(device)}
          className={`${btnBase}`}
          style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>
          <RefreshCw className="w-3.5 h-3.5" /> Replace
        </button>

        {/* Delete Device */}
        <button onClick={() => {
          if (window.confirm(`Delete device ${device.device_code}? This cannot be undone.`)) {
            onDelete(device);
          }
        }} className={`${btnBase} text-red-500 border border-red-200 hover:bg-red-50`}>
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}