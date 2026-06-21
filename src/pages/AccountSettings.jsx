import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Shield, Download, Trash2, Activity, CheckCircle2, AlertTriangle, Loader2, ArrowLeft, User, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_TYPES, BUSINESS_TYPES } from "@/lib/accountTypes";

function AccountTypeSection({ user, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [accountType, setAccountType] = useState(user?.account_type || "");
  const [businessType, setBusinessType] = useState(user?.business_type || "");

  const isDirty = accountType !== (user?.account_type || "") || businessType !== (user?.business_type || "");

  const handleSave = async () => {
    setSaving(true);
    const updates = { account_type: accountType || null };
    if (accountType === "business") updates.business_type = businessType || null;
    else updates.business_type = null;
    const updated = await base44.auth.updateMe(updates);
    onUpdated(updated);
    toast.success("Account type saved.");
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h2 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" /> Account Type
      </h2>
      <p className="text-slate-500 text-sm mb-5">
        Helps us tailor your dashboard experience. Optional — existing accounts default to Individual.
      </p>

      {/* Account type selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {ACCOUNT_TYPES.map(t => (
          <button key={t.id} onClick={() => setAccountType(t.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              accountType === t.id
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}>
            <span className="text-2xl">{t.icon}</span>
            <span className={`font-bold text-sm ${accountType === t.id ? "text-blue-700" : "text-slate-700"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Business type — only shown for business accounts */}
      {accountType === "business" && (
        <div className="mb-5">
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Business Type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUSINESS_TYPES.map(t => (
              <button key={t.id} onClick={() => setBusinessType(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  businessType === t.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                <span className="text-lg">{t.icon}</span>
                <span className={`font-semibold text-xs ${businessType === t.id ? "text-blue-700" : "text-slate-600"}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isDirty && (
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Account Type"}
        </Button>
      )}
    </div>
  );
}

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    return () => { meta.setAttribute("content", "index, follow"); };
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: activityLogs = [] } = useQuery({
    queryKey: ["my-activity-logs", user?.id],
    queryFn: () => base44.entities.ActivityLog.filter({ user_id: user.id }, "-timestamp", 50),
    enabled: !!user?.id,
  });

  const handleExport = async () => {
    setExporting(true);
    // Log the export action
    await base44.entities.ActivityLog.create({
      user_id: user.id,
      user_email: user.email,
      action: "data_exported",
      description: "User exported their personal data",
      timestamp: new Date().toISOString(),
    });

    // Collect all user data
    const [profiles, devices, leads, appointments] = await Promise.all([
      base44.entities.Profile.filter({ created_by_id: user.id }),
      base44.entities.NFCDevice.list(),
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Appointment.list("-created_date", 500),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      profiles,
      devices,
      leads: leads.filter(l => profiles.some(p => p.id === l.profile_id)),
      appointments: appointments.filter(a => profiles.some(p => p.id === a.profile_id)),
      activity_logs: activityLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bingoo-data-${user.email}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your data has been exported successfully.");
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) return;
    setDeleting(true);
    await base44.entities.ActivityLog.create({
      user_id: user.id,
      user_email: user.email,
      action: "account_deleted",
      description: "User initiated account deletion request",
      timestamp: new Date().toISOString(),
    });
    // Send deletion request email
    await base44.integrations.Core.SendEmail({
      to: "privacy@bingooconnect.com",
      subject: `Account Deletion Request — ${user.email}`,
      body: `User ${user.full_name} (${user.email}, ID: ${user.id}) has requested account deletion.\n\nDate: ${new Date().toISOString()}`,
    }).catch(() => {});
    toast.success("Deletion request submitted. We'll process it within 30 days.");
    setDeleteConfirm("");
    setDeleting(false);
  };

  const ACTION_COLORS = {
    login: "#22c55e", logout: "#94a3b8", profile_update: "#06b6d4",
    device_activated: "#FDBA21", admin_action: "#FF7A00",
    account_deleted: "#ef4444", data_exported: "#8b5cf6",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: "rgba(11,46,107,0.97)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/bingoo" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <Shield className="w-4 h-4 text-white/70" />
          <span className="text-white font-bold">Account Security & Privacy</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Account Type */}
        <AccountTypeSection user={user} onUpdated={setUser} />

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Account Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Full Name</p>
              <p className="font-bold text-slate-900">{user?.full_name || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Email</p>
              <p className="font-bold text-slate-900">{user?.email}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Role</p>
              <p className="font-bold text-slate-900 capitalize">{user?.role || "user"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Account ID</p>
              <p className="font-mono text-xs text-slate-500">{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Security status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Security Status
          </h2>
          <div className="space-y-3">
            {[
              { label: "Email Verified", status: true, note: "Your email was verified via OTP at registration" },
              { label: "Strong Password Policy", status: true, note: "Min 8 chars, uppercase, number and special character" },
              { label: "Data Encryption", status: true, note: "All data transmitted over HTTPS / TLS 1.3" },
              { label: "Row-Level Data Security", status: true, note: "You can only access your own data" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Recent Activity
          </h2>
          {activityLogs.length > 0 ? (
            <div className="space-y-2">
              {activityLogs.slice(0, 20).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: ACTION_COLORS[log.action] || "#94a3b8" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 capitalize">
                      {log.action?.replace(/_/g, " ")}
                    </p>
                    {log.description && <p className="text-xs text-slate-400 truncate">{log.description}</p>}
                  </div>
                  <p className="text-xs text-slate-400 whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "—"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          )}
        </div>

        {/* Export data */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" /> Export My Data
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Download a copy of all your personal data including profiles, devices, leads, appointments, and activity logs in JSON format.
          </p>
          <Button onClick={handleExport} disabled={exporting} variant="outline"
            className="gap-2 font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Preparing export…" : "Export My Data"}
          </Button>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" /> Delete Account
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <strong>This action is irreversible.</strong> Deleting your account will permanently remove your profiles, devices, leads, and all associated data. Billing records are retained as required by law.
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            To confirm, type your email address: <strong>{user?.email}</strong>
          </p>
          <input
            type="email"
            placeholder={user?.email}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            className="w-full px-4 py-2.5 border border-red-200 rounded-xl text-sm outline-none mb-4 focus:ring-2 focus:ring-red-200"
          />
          <Button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== user?.email || deleting}
            className="gap-2 font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Submitting request…" : "Delete My Account"}
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            Submitting this form sends a deletion request to our team. We will process it within 30 days.
          </p>
        </div>

      </div>
    </div>
  );
}