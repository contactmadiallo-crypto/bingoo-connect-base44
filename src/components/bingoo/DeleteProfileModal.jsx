import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, AlertTriangle, Loader2, Shield, Nfc, Calendar, Users, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * DeleteProfileModal — safe confirmation flow before removing a profile.
 *
 * Steps:
 *  1. Fetches a dependency summary from the backend (devices, leads, appointments, other profiles).
 *  2. If NFC devices are attached, requires the user to choose:
 *     - Reassign devices to another existing profile, OR
 *     - Unassign devices (mark available, keep the physical device record), OR
 *     - Cancel.
 *  3. On confirm, calls deleteProfile backend which deletes child records + the profile,
 *     handling devices per the chosen action. Analytics + audit history are kept.
 *
 * After deletion, calls onDeleted() so the parent returns to My Profiles.
 */
export default function DeleteProfileModal({ profile, isDark, onClose, onDeleted }) {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [deviceAction, setDeviceAction] = useState("unassign"); // "reassign" | "unassign"
  const [reassignTo, setReassignTo] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/10" : "border-slate-200";

  // Fetch dependency summary when the modal opens
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("deleteProfile", { profile_id: profile.id, mode: "check" });
        if (cancelled) return;
        const data = res.data || res;
        setSummary(data);
        if (data.other_profiles?.length > 0) {
          setReassignTo(data.other_profiles[0].id);
          setDeviceAction("reassign");
        } else {
          setDeviceAction("unassign");
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load profile dependencies");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile.id]);

  const hasDevices = (summary?.device_count || 0) > 0;
  const canConfirm = !deleting && (!hasDevices || deviceAction !== "reassign" || reassignTo) && confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    setError("");
    try {
      const payload = { profile_id: profile.id, mode: "delete" };
      if (hasDevices) {
        payload.device_action = deviceAction;
        if (deviceAction === "reassign") payload.reassign_to_profile_id = reassignTo;
      }
      await base44.functions.invoke("deleteProfile", payload);
      onDeleted();
    } catch (e) {
      setError(e?.message || "Failed to delete profile");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}>
      <div className={`w-full max-w-lg rounded-3xl border ${panelBorder} ${panelBg} shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-red-300/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/15">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${headText}`}>Delete Profile</h3>
            <p className={`text-xs ${mutedText}`}>This action cannot be undone.</p>
          </div>
          <button onClick={onClose} className={`ml-auto p-2 rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
            <span className={`text-xl ${mutedText}`}>×</span>
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <p className={`text-sm ${mutedText}`}>Checking profile dependencies…</p>
          </div>
        ) : error && !summary ? (
          <div className="p-6">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={onClose} className="mt-4 text-sm font-bold text-red-600">Close</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* What will happen */}
            <div className={`rounded-2xl p-4 border ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"}`}>
              <p className={`text-sm font-bold mb-2 ${isDark ? "text-red-300" : "text-red-700"}`}>
                "{profile.display_name}" will be permanently deleted.
              </p>
              <p className={`text-xs ${isDark ? "text-red-200/70" : "text-red-600"}`}>
                The public URL <span className="font-mono">/p/{profile.username}</span> will stop resolving and show a
                "profile unavailable" page. QR codes & wallet passes pointing here will show that page too.
              </p>
            </div>

            {/* Dependency summary */}
            <div className="space-y-2">
              <p className={`text-xs font-bold uppercase tracking-widest ${mutedText}`}>What gets removed</p>
              <SummaryRow icon={Users} label="Leads / CRM contacts" count={summary?.lead_count || 0} isDark={isDark} />
              <SummaryRow icon={Calendar} label="Appointments" count={summary?.appointment_count || 0} isDark={isDark} />
              <SummaryRow icon={Nfc} label="NFC devices attached" count={summary?.device_count || 0} isDark={isDark} warn />
            </div>

            {/* Device action — only if devices attached */}
            {hasDevices && (
              <div className={`rounded-2xl p-4 border ${panelBorder} ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <p className={`text-sm font-bold mb-3 ${headText}`}>
                  Choose what happens to {summary.device_count} NFC device{summary.device_count > 1 ? "s" : ""}:
                </p>
                <div className="space-y-2">
                  {summary.other_profiles?.length > 0 && (
                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${deviceAction === "reassign" ? "border-blue-500 bg-blue-50/50" : isDark ? "border-white/10" : "border-slate-200"}`}>
                      <input type="radio" name="deviceAction" checked={deviceAction === "reassign"} onChange={() => setDeviceAction("reassign")} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${headText}`}>Reassign to another profile</p>
                        <p className={`text-xs ${mutedText} mb-2`}>Devices keep working — they'll point to the selected profile.</p>
                        <Select value={reassignTo} onValueChange={setReassignTo}>
                          <SelectTrigger className={`w-full rounded-lg text-sm ${isDark ? "bg-[#1a2235] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                            <SelectValue placeholder="Select a profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {summary.other_profiles.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.display_name} — /p/{p.username}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </label>
                  )}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${deviceAction === "unassign" ? "border-amber-500 bg-amber-50/50" : isDark ? "border-white/10" : "border-slate-200"}`}>
                    <input type="radio" name="deviceAction" checked={deviceAction === "unassign"} onChange={() => setDeviceAction("unassign")} className="mt-1" />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${headText}`}>Unassign devices</p>
                      <p className={`text-xs ${mutedText}`}>Devices are marked available but NOT deleted. Reassign them later from My NFC Devices.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Kept for audit */}
            <div className={`flex items-start gap-2 text-xs ${mutedText}`}>
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>Analytics history & device audit logs are kept for admin/support records. Wallet passes already on phones can't be auto-removed, but their QR will show "profile unavailable".</p>
            </div>

            {/* Type to confirm */}
            <div>
              <p className={`text-xs font-bold mb-1.5 ${headText}`}>Type <span className="text-red-500 font-mono">DELETE</span> to confirm:</p>
              <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-mono border-2 ${confirmText === "DELETE" ? "border-red-500" : isDark ? "border-white/10 bg-[#1a2235] text-white" : "border-slate-200 bg-white text-slate-800"}`} />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} disabled={deleting}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border ${panelBorder} ${isDark ? "text-white/70 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"}`}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={!canConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#dc2626" }}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting…" : "Delete Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, count, isDark, warn }) {
  const mutedText = isDark ? "text-white/50" : "text-slate-500";
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${warn && count > 0 ? "text-amber-500" : "text-slate-400"}`} />
      <span className={`text-sm flex-1 ${isDark ? "text-white/80" : "text-slate-700"}`}>{label}</span>
      <span className={`text-sm font-bold ${count > 0 ? (warn ? "text-amber-500" : "text-red-500") : mutedText}`}>
        {count}
      </span>
    </div>
  );
}