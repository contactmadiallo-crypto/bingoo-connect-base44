import { BottomSheetSelect } from "@/components/ui/BottomSheetSelect";
import { Unlink, RefreshCw, Trash2, Package, User } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

/**
 * Device action buttons: Link to Profile, Link to Asset, Unlink, Replace, Delete.
 * Shown only for non-disabled/replaced devices.
 */
export default function DeviceActionsBar({
  device, profiles, assets, hasProfile, hasAsset, isDark,
  onLinkProfile, onLinkAsset, onUnlink, onReplace, onDelete,
}) {
  const { language } = useI18n();
  const isDisabled = device.status === "disabled" || device.status === "replaced";
  if (isDisabled) return null;

  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const btnBase = "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors";

  return (
    <div className={`rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${mutedText}`}>{t("device_actions", language)}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

        {/* Link to Profile */}
        {profiles.length === 0 ? (
          <button disabled className={`${btnBase} bg-blue-600/50 text-white/60 cursor-not-allowed`}>
            <User className="w-3.5 h-3.5" /> {t("device_no_profiles", language)}
          </button>
        ) : (
          <BottomSheetSelect
            value=""
            onValueChange={(pid) => onLinkProfile(device.id, pid)}
            placeholder={t("device_link_profile", language)}
            ariaLabel={t("device_link_profile", language)}
            options={profiles.map(p => ({ value: p.id, label: p.display_name }))}
            className="w-full rounded-xl text-xs font-bold"
            style={isDark ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" } : {}}
          />
        )}

        {/* Link to Asset */}
        {assets.length === 0 ? (
          <button disabled className={`${btnBase} bg-purple-600/50 text-white/60 cursor-not-allowed`}>
            <Package className="w-3.5 h-3.5" /> {t("device_no_assets", language)}
          </button>
        ) : (
          <BottomSheetSelect
            value=""
            onValueChange={(aid) => onLinkAsset(device.id, aid)}
            placeholder={t("device_link_asset", language)}
            ariaLabel={t("device_link_asset", language)}
            options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_type})` }))}
            className="w-full rounded-xl text-xs font-bold"
            style={isDark ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" } : {}}
          />
        )}

        {/* Unlink — clears both profile and asset */}
        {(hasProfile || hasAsset) && (
          <button onClick={() => {
            if (window.confirm(t("device_unlink_confirm", language))) {
              onUnlink(device);
            }
          }} className={`${btnBase} ${isDark ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
            <Unlink className="w-3.5 h-3.5" /> {t("assets_unlink", language)}
          </button>
        )}

        {/* Replace Device */}
        <button onClick={() => onReplace(device)}
          className={`${btnBase}`}
          style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>
          <RefreshCw className="w-3.5 h-3.5" /> {t("assets_replace", language)}
        </button>

        {/* Delete Device */}
        <button onClick={() => {
          if (window.confirm(`${t("device_delete_confirm_prefix", language)} ${device.device_code}? ${t("device_delete_confirm_suffix", language)}`)) {
            onDelete(device);
          }
        }} className={`${btnBase} text-red-500 border border-red-200 hover:bg-red-50`}>
          <Trash2 className="w-3.5 h-3.5" /> {t("assets_delete", language)}
        </button>
      </div>
    </div>
  );
}