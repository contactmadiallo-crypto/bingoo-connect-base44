import { User, Package, AlertTriangle, MapPin, Link2 } from "lucide-react";

/**
 * Visual badges shown on each NFC device card header.
 * Shows: Linked to Profile, Linked to Asset, Lost Mode On, Found Report, Needs Assignment
 */
export default function DeviceBadges({ device, hasProfile, hasAsset, reportCount, isDark }) {
  const isLost = device.status === "lost";
  const isDisabled = device.status === "disabled" || device.status === "replaced";
  const needsAssignment = !hasProfile && !hasAsset && !isDisabled;

  const badges = [];
  if (hasProfile)
    badges.push({ icon: User, label: "Profile", cls: isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600" });
  if (hasAsset)
    badges.push({ icon: Package, label: "Asset", cls: isDark ? "bg-purple-500/15 text-purple-400" : "bg-purple-50 text-purple-600" });
  if (isLost)
    badges.push({ icon: AlertTriangle, label: "Lost Mode On", cls: isDark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600" });
  if (reportCount > 0)
    badges.push({ icon: MapPin, label: `Found Report${reportCount > 1 ? "s" : ""} (${reportCount})`, cls: isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600" });
  if (needsAssignment)
    badges.push({ icon: Link2, label: "Needs Assignment", cls: isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500" });

  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
      {badges.map((b, i) => (
        <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${b.cls}`}>
          <b.icon className="w-2.5 h-2.5" />
          {b.label}
        </span>
      ))}
    </div>
  );
}