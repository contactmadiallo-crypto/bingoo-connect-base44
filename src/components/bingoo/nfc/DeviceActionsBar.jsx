import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Unlink, RefreshCw, Trash2, Package, User, ChevronDown } from "lucide-react";

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`${btnBase} bg-blue-600 text-white hover:bg-blue-500`}>
              <User className="w-3.5 h-3.5" /> Link Profile
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
            <DropdownMenuLabel>Select Profile</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profiles.length === 0 ? (
              <DropdownMenuItem disabled>No profiles available</DropdownMenuItem>
            ) : profiles.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => onLinkProfile(device.id, p.id)}>
                {p.display_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Link to Asset */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`${btnBase} bg-purple-600 text-white hover:bg-purple-500`}>
              <Package className="w-3.5 h-3.5" /> Link Asset
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
            <DropdownMenuLabel>Select Asset</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {assets.length === 0 ? (
              <DropdownMenuItem disabled>No assets available</DropdownMenuItem>
            ) : assets.map((a) => (
              <DropdownMenuItem key={a.id} onClick={() => onLinkAsset(device.id, a.id)}>
                {a.name} <span className="text-xs opacity-60 capitalize">({a.asset_type})</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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