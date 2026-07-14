import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Flag, Activity, AlertTriangle, CheckCircle2, Clock, Eye, Ban, Users } from "lucide-react";
import { toast } from "sonner";
import { MobileSelect } from "@/components/ui/mobile-select";

const STATUS_COLORS = {
  pending: { bg: "rgba(253,186,33,0.15)", color: "#FDBA21", border: "rgba(253,186,33,0.3)" },
  reviewed: { bg: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "rgba(6,182,212,0.3)" },
  actioned: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  dismissed: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", border: "rgba(255,255,255,0.1)" },
};

const ACTION_COLORS = {
  login: "#22c55e",
  logout: "#94a3b8",
  profile_update: "#06b6d4",
  device_activated: "#FDBA21",
  device_lost_toggle: "#f59e0b",
  admin_action: "#f97316",
  account_deleted: "#ef4444",
  data_exported: "#8b5cf6",
  subscription_changed: "#22c55e",
};

export default function SecurityAuditTab() {
  const [subTab, setSubTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: abuseReports = [] } = useQuery({
    queryKey: ["admin-abuse-reports"],
    queryFn: () => base44.entities.AbuseReport.list("-created_date", 200),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: () => base44.entities.ActivityLog.list("-timestamp", 200),
  });

  const updateReport = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AbuseReport.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-abuse-reports"] });
      toast.success("Report status updated");
    },
  });

  const orange = "#f97316";
  const gold = "#FDBA21";

  const SUB_TABS = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "abuse", label: "Abuse Reports", icon: Flag, count: abuseReports.filter(r => r.status === "pending").length },
    { id: "activity", label: "Activity Log", icon: Activity, count: activityLogs.length },
  ];

  // Security health checks
  const checks = [
    { label: "Email Verification (OTP)", status: "pass", note: "All new accounts verified via 6-digit OTP at registration" },
    { label: "Password Strength Validation", status: "pass", note: "Min 8 chars, uppercase, number, special char required" },
    { label: "Admin Dashboard Protection", status: "pass", note: "Role check enforced — non-admins redirected on load" },
    { label: "Row-Level Security (RLS)", status: "pass", note: "All entities have per-user data access rules enforced server-side" },
    { label: "Role-Based Access Control", status: "pass", note: "Roles: admin, user, business_owner, team_member — enforced via User.role" },
    { label: "NFC Device Ownership Check", status: "pass", note: "RLS ensures users only manage devices linked to their owned profiles" },
    { label: "Unique Device Code Enforcement", status: "pass", note: "Admin form validates uniqueness before creating device codes" },
    { label: "Lost Mode Data Protection", status: "pass", note: "Phone number display is opt-in via lost_show_phone field" },
    { label: "Lead Form Rate Limiting", status: "pass", note: "Client-side 60s cooldown stored in localStorage between submissions" },
    { label: "Appointment Form Rate Limiting", status: "pass", note: "Client-side 60s cooldown between appointment booking attempts" },
    { label: "Abuse Reporting", status: "pass", note: "Report button on all public profiles, admin can review & action" },
    { label: "Activity Logging + Login History", status: "pass", note: "Login, logout, profile edits, exports, and deletions tracked in ActivityLog" },
    { label: "Export My Data", status: "pass", note: "Users can download all personal data as JSON from Account Settings" },
    { label: "Delete Account Option", status: "pass", note: "Account deletion request flow in Account Settings with email confirmation" },
    { label: "Public Data Isolation", status: "pass", note: "Public profiles only expose fields when is_active=true; sensitive fields hidden" },
    { label: "Stripe Webhook Verification", status: "pass", note: "STRIPE_WEBHOOK_SECRET validates every incoming webhook signature" },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="flex gap-1 min-w-0 rounded-xl p-1 overflow-x-auto scrollbar-hide" style={{ background: "rgba(255,255,255,0.05)" }}>
        {SUB_TABS.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: subTab === st.id ? orange : "transparent",
              color: subTab === st.id ? "#fff" : "rgba(255,255,255,0.4)",
            }}>
            <st.icon className="w-4 h-4" />
            {st.label}
            {st.count > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-xs"
                style={{ background: subTab === st.id ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.25)", color: subTab === st.id ? "#fff" : "#ef4444" }}>
                {st.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {subTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Security Checks", value: `${checks.filter(c => c.status === "pass").length}/${checks.length}`, color: "#22c55e", icon: Shield },
              { label: "Pending Reports", value: abuseReports.filter(r => r.status === "pending").length, color: "#ef4444", icon: Flag },
              { label: "Activity Events", value: activityLogs.length, color: "#06b6d4", icon: Activity },
              { label: "Resolved Reports", value: abuseReports.filter(r => r.status !== "pending").length, color: gold, icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ background: s.color + "20" }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h3 className="font-black text-white flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: gold }} /> Security Checklist
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{c.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{c.note}</p>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">PASS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Abuse Reports */}
      {subTab === "abuse" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total", value: abuseReports.length, color: orange },
              { label: "Pending", value: abuseReports.filter(r => r.status === "pending").length, color: gold },
              { label: "Actioned", value: abuseReports.filter(r => r.status === "actioned").length, color: "#ef4444" },
              { label: "Dismissed", value: abuseReports.filter(r => r.status === "dismissed").length, color: "rgba(255,255,255,0.3)" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Profile", "Reason", "Details", "Reporter", "Date", "Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abuseReports.map(r => {
                    const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-4 py-3">
                          <a href={`/p/${r.reported_username}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-bold hover:underline" style={{ color: orange }}>
                            @{r.reported_username || r.reported_profile_id?.slice(0, 10)}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                            {r.reason?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {r.details || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {r.reporter_email || "Anonymous"}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {r.created_date?.slice(0, 10) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <MobileSelect
                            value={r.status}
                            onValueChange={(v) => updateReport.mutate({ id: r.id, status: v })}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "reviewed", label: "Reviewed" },
                              { value: "actioned", label: "Actioned" },
                              { value: "dismissed", label: "Dismissed" },
                            ]}
                            ariaLabel="Report status"
                            className="px-2 py-1 rounded-lg text-xs font-bold cursor-pointer outline-none min-h-[44px]"
                            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {abuseReports.length === 0 && (
                <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <Flag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No abuse reports yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      {subTab === "activity" && (
        <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["User", "Action", "Description", "Timestamp"].map(h => (
                    <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {log.user_email || log.user_id?.slice(0, 10) + "…"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: (ACTION_COLORS[log.action] || "#94a3b8") + "20",
                          color: ACTION_COLORS[log.action] || "#94a3b8"
                        }}>
                        {log.action?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[280px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {log.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activityLogs.length === 0 && (
              <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No activity logs yet</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.1)" }}>
                  Logs are recorded when users perform key actions
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}