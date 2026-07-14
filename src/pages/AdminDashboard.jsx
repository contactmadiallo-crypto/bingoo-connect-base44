import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, BarChart3, Star, Shield, Search, CreditCard, Clock, AlertTriangle,
  CheckCircle2, XCircle, UserPlus2, Globe, QrCode, Smartphone, Factory, MapPin,
  Headphones, ScrollText, Settings, LayoutDashboard, RotateCcw,
} from "lucide-react";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { isAdminUser } from "@/lib/auth";
import SecurityAuditTab from "@/components/bingoo/SecurityAuditTab";
import AdminPricingTab from "@/components/bingoo/AdminPricingTab";
import NFCDeviceManager from "@/components/bingoo/NFCDeviceManager";
import AdminAccountsTab from "@/components/admin/AdminAccountsTab";
import AdminManufacturingTab from "@/components/admin/AdminManufacturingTab";
import AdminLostReportsTab from "@/components/admin/AdminLostReportsTab";
import AdminTicketsTab from "@/components/admin/AdminTicketsTab";
import AdminAuditLogTab from "@/components/admin/AdminAuditLogTab";
import { PLAN_LABELS } from "@/lib/planPermissions";

const PLAN_COLORS = {
  free: "bg-slate-100 text-slate-600",
  professional: "bg-blue-100 text-blue-700",
  pro: "bg-blue-100 text-blue-700",
  salon: "bg-pink-100 text-pink-700",
  restaurant: "bg-orange-100 text-orange-700",
  lawfirm: "bg-sky-100 text-sky-700",
  business: "bg-orange-100 text-orange-700",
  corporate: "bg-violet-100 text-violet-700",
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("accounts");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // ── Auth: non-admin redirect ──
  useEffect(() => {
    base44.auth.me().then(u => {
      if (!isAdminUser(u)) {
        window.location.href = "/bingoo";
        return;
      }
      setUser(u);
      setAuthChecked(true);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  // ── Data ──
  const { data: profiles = [] } = useQuery({ queryKey: ["admin-profiles"], queryFn: () => base44.entities.Profile.list() });
  const { data: devices = [] } = useQuery({ queryKey: ["admin-devices"], queryFn: () => base44.entities.NFCDevice.list() });
  const { data: leads = [] } = useQuery({ queryKey: ["admin-leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: allAppointments = [] } = useQuery({ queryKey: ["admin-appointments"], queryFn: () => base44.entities.Appointment.list("-created_date", 500) });
  const { data: analytics = [] } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => base44.entities.Analytics.list("-created_date", 500) });
  const { data: subscriptions = [] } = useQuery({ queryKey: ["admin-subscriptions"], queryFn: () => base44.entities.Subscription.list("-created_date", 200) });
  const { data: allUsers = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => base44.entities.User.list("-created_date", 200) });

  // ── Plan override mutation ──
  const updatePlan = useMutation({
    mutationFn: async ({ profile, plan }) => {
      const owner = allUsers.find(u => u.id === profile.created_by_id || (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(profile.id)));
      const email = profile.email || owner?.email;
      if (!email) throw new Error("No email found for this profile — cannot grant entitlement.");
      const existingSubs = await base44.entities.Subscription.filter({ customer_email: email });
      const existing = existingSubs?.[0];
      if (existing?.stripe_subscription_id) {
        await base44.entities.Subscription.update(existing.id, { plan, plan_source: "admin_override" });
      } else if (existing) {
        const status = plan === "free" ? "free" : "active";
        await base44.entities.Subscription.update(existing.id, { plan, status, plan_source: "admin_override" });
      } else {
        const status = plan === "free" ? "free" : "active";
        await base44.entities.Subscription.create({ customer_email: email, customer_name: profile.display_name || owner?.full_name || "", plan, status, plan_source: "admin_override" });
      }
      // Subscription is the single source of truth — do NOT write to Profile.plan.
      // Profile.plan is owner-writable and must never be used for entitlement.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Plan updated!");
    },
    onError: (err) => toast.error(err.message || "Failed to update plan"),
  });

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  // ── Derived: subscription data ──
  const subsByEmail = new Map(subscriptions.map(s => [s.customer_email?.toLowerCase(), s]));
  const stripeSubs = subscriptions;
  const manualPaidProfiles = profiles.filter(p => p.plan && p.plan !== "free");
  const stripeEmails = new Set(stripeSubs.map(s => s.customer_email?.toLowerCase()));
  const manualRows = manualPaidProfiles
    .filter(p => !stripeEmails.has((p.email || "").toLowerCase()))
    .map(p => {
      const owner = allUsers.find(u => u.id === p.created_by_id || (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id)));
      return { id: p.id, customer_name: p.display_name || owner?.full_name || "—", customer_email: p.email || owner?.email || "—", username: p.username, plan: p.plan, status: "active", source: "Manual/Profile Plan", stripe_subscription_id: "", stripe_customer_id: "", created_date: p.created_date };
    });
  const allSubRows = [
    ...stripeSubs.map(s => ({ ...s, username: profiles.find(p => p.email === s.customer_email)?.username || null, source: s.plan_source === "admin_override" ? "Admin Override" : (s.stripe_subscription_id || s.stripe_customer_id) ? "Stripe" : "Manual" })),
    ...manualRows,
  ];
  const filteredSubRows = allSubRows
    .filter(s => subSearch ? s.customer_email?.toLowerCase().includes(subSearch.toLowerCase()) || s.customer_name?.toLowerCase().includes(subSearch.toLowerCase()) : true)
    .filter(s => subStatusFilter === "all" || s.status === subStatusFilter);

  const totalPaidAccess = allSubRows.filter(s => s.status === "active" || s.status === "past_due").length;
  const activeStripeSubs = stripeSubs.filter(s => s.status === "active").length;

  // ── Derived: device stats ──
  const deviceStats = {
    active: devices.filter(d => d.status === "active").length,
    lost: devices.filter(d => d.status === "lost").length,
    available: devices.filter(d => d.status === "available").length,
    replaced: devices.filter(d => d.status === "replaced").length,
  };
  const recentActivations = devices.filter(d => d.assigned_at).sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at)).slice(0, 20);

  // ── Derived: analytics ──
  const recentEvents = [...analytics].sort((a, b) => new Date(b.created_at || b.created_date) - new Date(a.created_at || a.created_date)).slice(0, 25);
  const profileEventCounts = {};
  analytics.forEach(a => { if (a.profile_id) profileEventCounts[a.profile_id] = (profileEventCounts[a.profile_id] || 0) + 1; });
  const topProfiles = Object.entries(profileEventCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pid, count]) => ({ profile: profiles.find(p => p.id === pid), count })).filter(t => t.profile);

  // ── Derived: filtered profiles ──
  const filteredProfiles = profiles.filter(p => {
    const owner = allUsers.find(u => u.id === p.created_by_id || (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id)));
    const subPlan = subsByEmail.get((p.email || owner?.email || "").toLowerCase())?.plan;
    const effectivePlan = subPlan || p.plan || "free";
    const planMatch = planFilter === "all" || effectivePlan === planFilter;
    const term = search.toLowerCase();
    const searchMatch = !term || [p.display_name, p.username, p.company_name, p.email].some(v => v?.toLowerCase().includes(term));
    return planMatch && searchMatch;
  });

  // ── Tabs ──
  const TABS = [
    { id: "overview", label: "Overview", short: "Home", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts", short: "Users", icon: Users, count: allUsers.length },
    { id: "profiles", label: "Profiles", short: "Profiles", icon: QrCode, count: profiles.length },
    { id: "subscriptions", label: "Subscriptions", short: "Subs", icon: CreditCard, count: allSubRows.length },
    { id: "nfc_inventory", label: "NFC Inventory", short: "NFC", icon: Smartphone, count: devices.length },
    { id: "manufacturing", label: "Orders / Mfg", short: "Orders", icon: Factory },
    { id: "asset_recovery", label: "Asset Recovery", short: "Recovery", icon: MapPin },
    { id: "support", label: "Support", short: "Support", icon: Headphones },
    { id: "audit", label: "Audit Logs", short: "Audit", icon: ScrollText },
    { id: "settings", label: "Settings", short: "Settings", icon: Settings },
  ];

  const orange = "#f97316";
  const gold = "#FDBA21";

  return (
    <BingooLayout>
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #071A3D 0%, #0b2149 50%, #0f3d8c 100%)" }}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pt-2">
            <div className="h-8 w-px bg-white/10" />
            <div>
              <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
              <p className="text-white/40 text-sm">Unified Control Panel</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.3)" }}>
              <Shield className="w-4 h-4" style={{ color: gold }} />
              <span className="text-xs font-black" style={{ color: gold }}>ADMIN</span>
            </div>
          </div>

          {/* Lost Devices Alert */}
          {deviceStats.lost > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#ef4444" }} />
              <p className="text-sm" style={{ color: "rgba(239,68,68,0.9)" }}>
                <strong>{deviceStats.lost} device{deviceStats.lost > 1 ? "s" : ""} reported lost.</strong> Review in Asset Recovery tab.
              </p>
              <button onClick={() => setTab("asset_recovery")} className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>Review →</button>
            </div>
          )}

          {/* Tabs */}
          <div className="relative rounded-2xl p-1.5 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-full min-w-0 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="flex w-max min-w-full gap-1 px-1 whitespace-nowrap">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all"
                    style={{ background: tab === t.id ? orange : "transparent", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    <t.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="md:hidden">{t.short}</span>
                    <span className="hidden md:inline">{t.label}</span>
                    {t.count !== undefined && <span className="rounded-full px-1.5 py-0.5 text-xs flex-shrink-0" style={{ background: tab === t.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)" }}>{t.count}</span>}
                  </button>
                ))}
              </div>
            </div>
            {/* Edge fade indicators */}
            <div className="absolute right-0 top-1 bottom-1 w-8 pointer-events-none rounded-r-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(7,26,61,0.6))" }} />
            <div className="absolute left-0 top-1 bottom-1 w-8 pointer-events-none rounded-l-2xl" style={{ background: "linear-gradient(270deg, transparent, rgba(7,26,61,0.6))" }} />
          </div>

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: allUsers.length, icon: Users, accent: orange },
                  { label: "Total Profiles", value: profiles.length, icon: QrCode, accent: gold },
                  { label: "Paid Access", value: totalPaidAccess, icon: Star, accent: "#22c55e" },
                  { label: "Analytics Events", value: analytics.length, icon: BarChart3, accent: "#06b6d4" },
                  { label: "NFC Devices", value: devices.length, icon: Smartphone, accent: "#8b5cf6" },
                  { label: "Active Devices", value: deviceStats.active, icon: CheckCircle2, accent: "#22c55e" },
                  { label: "Lost Devices", value: deviceStats.lost, icon: AlertTriangle, accent: "#ef4444" },
                  { label: "Available", value: deviceStats.available, icon: RotateCcw, accent: "#06b6d4" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: s.accent + "20" }}>
                      <s.icon className="w-5 h-5" style={{ color: s.accent }} />
                    </div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-xs mt-0.5 text-white/40">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Two-column: activity feed + top profiles */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Activity Feed
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentEvents.length === 0 ? (
                      <div className="text-center py-10" style={{ color: "rgba(255,255,255,0.2)" }}><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-sm">No events yet</p></div>
                    ) : recentEvents.map(e => {
                      const linkedProfile = profiles.find(p => p.id === e.profile_id);
                      return (
                        <div key={e.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "rgba(255,255,255,0.06)" }}>
                            {e.event_type === "profile_view" ? "👁️" : e.event_type === "nfc_tap" ? "📲" : e.event_type?.includes("whatsapp") ? "💬" : e.event_type?.includes("phone") ? "📞" : "⚡"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate capitalize">{(e.event_type || "event").replace(/_/g, " ")}</p>
                            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{linkedProfile?.display_name || e.profile_id?.slice(0, 10) + "…"}</p>
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{new Date(e.created_at || e.created_date).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <h3 className="text-sm font-black text-white">🏆 Top Profiles by Activity</h3>
                  </div>
                  <div>
                    {topProfiles.length === 0 ? (
                      <div className="text-center py-10" style={{ color: "rgba(255,255,255,0.2)" }}><Star className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-sm">No activity yet</p></div>
                    ) : topProfiles.map((t, i) => (
                      <div key={t.profile.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span className="text-lg font-black flex-shrink-0" style={{ color: i === 0 ? gold : "rgba(255,255,255,0.3)" }}>#{i + 1}</span>
                        {t.profile.profile_photo
                          ? <img src={t.profile.profile_photo} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                          : <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0" style={{ background: t.profile.cover_color || "#334155" }}>{t.profile.display_name?.charAt(0) || "?"}</div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{t.profile.display_name}</p>
                          <a href={`/p/${t.profile.username}`} target="_blank" rel="noopener" className="text-xs font-mono hover:underline" style={{ color: "#f97316" }}>/{t.profile.username}</a>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>{t.count} events</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ACCOUNTS ══ */}
          {tab === "accounts" && (
            <AdminAccountsTab
              users={allUsers}
              profiles={profiles}
              devices={devices}
              subscriptions={subscriptions}
              leads={leads}
              appointments={allAppointments}
            />
          )}

          {/* ══ PROFILES ══ */}
          {tab === "profiles" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input className="pl-9" placeholder="Search profiles..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all","free","professional","business","salon","lawfirm","corporate"].map(p => (
                    <button key={p} onClick={() => setPlanFilter(p)}
                      className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background: planFilter === p ? orange : "rgba(255,255,255,0.07)", color: planFilter === p ? "#fff" : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {p === "all" ? "All" : (PLAN_LABELS[p] || p)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Profile", "Username", "Plan", "Company", "Owner", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredProfiles.map(p => {
                        const owner = allUsers.find(u => u.id === p.created_by_id || (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id)));
                        const email = (p.email || owner?.email || "").toLowerCase();
                        const sub = subsByEmail.get(email);
                        const realPlan = sub?.plan || p.plan || "free";
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {p.profile_photo ? <img src={p.profile_photo} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                                  : <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: p.cover_color || "#334155" }}>{p.display_name?.charAt(0) || "?"}</div>}
                                <p className="font-bold text-white text-sm">{p.display_name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <a href={`/p/${p.username}`} target="_blank" rel="noopener" className="text-sm font-mono hover:underline" style={{ color: "#f97316" }}>/{p.username}</a>
                            </td>
                            <td className="px-5 py-4">
                              <Select value={realPlan} onValueChange={v => updatePlan.mutate({ profile: p, plan: v })} disabled={updatePlan.isPending}>
                                <SelectTrigger className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer h-7"
                                  style={{ background: "rgba(253,186,33,0.15)", color: "#FDBA21", border: "1px solid rgba(253,186,33,0.3)" }}><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="professional">Professional</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="salon">Salon</SelectItem>
                                  <SelectItem value="lawfirm">Law Firm</SelectItem>
                                  <SelectItem value="corporate">Corporate</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{p.company_name || "—"}</td>
                            <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{owner?.email || p.email || "—"}</td>
                            <td className="px-5 py-4">
                              <a href={`/p/${p.username}`} target="_blank" rel="noopener">
                                <Button size="sm" className="text-xs h-7 px-3 font-bold" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>View</Button>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredProfiles.length === 0 && <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}><QrCode className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No profiles found</p></div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ SUBSCRIPTIONS ══ */}
          {tab === "subscriptions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Total Paid", value: totalPaidAccess, color: "#22c55e" },
                  { label: "Stripe Active", value: activeStripeSubs, color: "#06b6d4" },
                  { label: "Manual", value: manualRows.length, color: gold },
                  { label: "Past Due", value: allSubRows.filter(s => s.status === "past_due").length, color: "#f59e0b" },
                  { label: "Canceled", value: allSubRows.filter(s => s.status === "canceled").length, color: "#ef4444" },
                  { label: "Free Users", value: allUsers.length - totalPaidAccess, color: "rgba(255,255,255,0.4)" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" placeholder="Search by email..." value={subSearch} onChange={e => setSubSearch(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all","active","past_due","canceled"].map(s => (
                    <button key={s} onClick={() => setSubStatusFilter(s)} className="px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap" style={{ background: subStatusFilter === s ? gold : "rgba(255,255,255,0.07)", color: subStatusFilter === s ? "#071A3D" : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.replace("_"," ").slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Customer", "Profile", "Plan", "Status", "Source", "Stripe ID", "Since"].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredSubRows.map((s, i) => {
                        const statusColors = { active: "#22c55e", past_due: "#f59e0b", canceled: "#ef4444" };
                        const isStripe = s.source === "Stripe";
                        return (
                          <tr key={s.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td className="px-4 py-4">
                              <p className="font-bold text-white text-sm">{s.customer_name || s.customer_email?.split("@")[0]}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.customer_email}</p>
                            </td>
                            <td className="px-4 py-4">
                              {s.username ? <a href={`/p/${s.username}`} target="_blank" rel="noopener" className="text-xs font-mono hover:underline" style={{ color: "#f97316" }}>/{s.username}</a> : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                            </td>
                            <td className="px-4 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(253,186,33,0.15)", color: gold, border: "1px solid rgba(253,186,33,0.25)" }}>{PLAN_LABELS[s.plan] || s.plan || "—"}</span></td>
                            <td className="px-4 py-4"><span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusColors[s.status] || "rgba(255,255,255,0.4)" }}>{s.status === "active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.status === "canceled" ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}{s.status?.charAt(0).toUpperCase() + s.status?.replace("_"," ").slice(1)}</span></td>
                            <td className="px-4 py-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: isStripe ? "rgba(6,182,212,0.15)" : "rgba(253,186,33,0.1)", color: isStripe ? "#06b6d4" : gold, border: `1px solid ${isStripe ? "rgba(6,182,212,0.3)" : "rgba(253,186,33,0.2)"}` }}>{s.source}</span></td>
                            <td className="px-4 py-4 text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{s.stripe_subscription_id ? s.stripe_subscription_id.slice(0, 14) + "…" : "—"}</td>
                            <td className="px-4 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.created_date ? new Date(s.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredSubRows.length === 0 && <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}><CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No records match your filters</p></div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ NFC INVENTORY ══ */}
          {tab === "nfc_inventory" && <NFCDeviceManager profiles={profiles} currentUser={user} />}

          {/* ══ ORDERS / MANUFACTURING ══ */}
          {tab === "manufacturing" && <AdminManufacturingTab />}

          {/* ══ ASSET RECOVERY ══ */}
          {tab === "asset_recovery" && <AdminLostReportsTab />}

          {/* ══ SUPPORT ══ */}
          {tab === "support" && <AdminTicketsTab activeTab="support" />}

          {/* ══ AUDIT LOGS ══ */}
          {tab === "audit" && <AdminAuditLogTab />}

          {/* ══ SETTINGS ══ */}
          {tab === "settings" && (
            <div className="space-y-6">
              <SecurityAuditTab />
              <AdminPricingTab />
            </div>
          )}
        </div>
      </div>
    </BingooLayout>
  );
}