import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Smartphone, BarChart3, Star, Shield, Search, Plus, X, Edit, Ban, CreditCard, Clock, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Scissors, UtensilsCrossed, Building2 } from "lucide-react";
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
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ profile_id: "", device_type: "card", device_code: "", status: "active" });
  const [resetConfirm, setResetConfirm] = useState(null); // device to reset
  const [resetting, setResetting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (u.role !== "admin" && u.role !== "super_admin") window.location.href = "/dashboard";
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: profiles = [] } = useQuery({ queryKey: ["admin-profiles"], queryFn: () => base44.entities.Profile.list() });
  const { data: devices = [] } = useQuery({ queryKey: ["admin-devices"], queryFn: () => base44.entities.NFCDevice.list() });
  const { data: allNfcDevices = [], refetch: refetchNfcDevices } = useQuery({ queryKey: ["admin-nfc-devices"], queryFn: () => base44.entities.Device.list() });
  const { data: leads = [] } = useQuery({ queryKey: ["admin-leads"], queryFn: () => base44.entities.Lead.list() });
  const { data: analytics = [] } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => base44.entities.Analytics.list("-created_at", 500) });
  const { data: subscriptions = [], refetch: refetchSubs } = useQuery({ queryKey: ["admin-subscriptions"], queryFn: () => base44.entities.Subscription.list("-created_date", 200) });
  const [subSearch, setSubSearch] = useState("");
  const [subPlanFilter, setSubPlanFilter] = useState("all");
  const [subStatusFilter, setSubStatusFilter] = useState("all");

  const createDevice = useMutation({
    mutationFn: (data) => base44.entities.NFCDevice.create({ ...data, assigned_at: new Date().toISOString() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-devices"] }); setShowDeviceForm(false); setDeviceForm({ profile_id: "", device_type: "card", device_code: "", status: "active" }); toast.success("Device created!"); },
  });

  const handleForceReset = async (device) => {
    setResetting(true);
    await base44.entities.Device.update(device.id, {
      activation_status: "available",
      assigned_user: "",
      assigned_profile: "",
      activation_date: null,
      nickname: "",
    });
    toast.success(`Device ${device.device_code} has been reset and is now available for a new account.`);
    setResetConfirm(null);
    setResetting(false);
    refetchNfcDevices();
  };

  const updatePlan = useMutation({
    mutationFn: ({ id, plan }) => base44.entities.Profile.update(id, { plan }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }); toast.success("Plan updated!"); },
  });

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  const filteredProfiles = profiles
    .filter(p => planFilter === "all" || p.plan === planFilter)
    .filter(p => [p.username, p.display_name, p.company_name, p.email].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const recentActivations = devices
    .filter(d => d.assigned_at)
    .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
    .slice(0, 20);

  const TABS = [
    { id: "users",        label: "Users & Profiles",  icon: Users,      count: profiles.length },
    { id: "subscriptions",label: "Subscriptions",     icon: CreditCard, count: subscriptions.length },
    { id: "nfc_manager",  label: "NFC Manager",       icon: RotateCcw,  count: allNfcDevices.length },
    { id: "devices",      label: "Legacy Devices",    icon: Smartphone, count: devices.length },
    { id: "activations",  label: "Recent Activations",icon: Clock,      count: recentActivations.length },
    { id: "leads",        label: "All Leads",         icon: Star,       count: leads.length },
    { id: "analytics",    label: "Analytics",         icon: BarChart3 },
  ];

  // Bingoo brand colors for admin
  const navyBg = "#071d47";
  const navyCard = "#0B2E6B";
  const orange = "#FF7A00";
  const gold = "#FDBA21";

  return (
    <BingooLayout>
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #071d47 0%, #0B2E6B 50%, #0f3d8c 100%)" }}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-2">
          <img
            src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
            alt="Bingoo Connect"
            className="h-10 w-auto object-contain"
          />
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Super Admin Control Panel</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.3)" }}>
            <Shield className="w-4 h-4" style={{ color: gold }} />
            <span className="text-xs font-black" style={{ color: gold }}>ADMIN</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Profiles", value: profiles.length, icon: Users, accent: orange },
            { label: "NFC Devices", value: devices.length, icon: Smartphone, accent: gold },
            { label: "Total Leads", value: leads.length, icon: Star, accent: "#22c55e" },
            { label: "Analytics Events", value: analytics.length, icon: BarChart3, accent: "#06b6d4" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 border"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: s.accent + "20" }}>
                <s.icon className="w-5 h-5" style={{ color: s.accent }} />
              </div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs mt-0.5 text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl p-1.5 mb-6 overflow-x-auto"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
              style={{
                background: tab === t.id ? orange : "transparent",
                color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
              }}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.count !== undefined && (
                <span className="rounded-full px-1.5 py-0.5 text-xs"
                  style={{ background: tab === t.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users & Profiles */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input className="pl-9" placeholder="Search by name, username, company..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all","free","professional","salon","restaurant","lawfirm","corporate"].map(p => (
                  <button key={p} onClick={() => setPlanFilter(p)}
                    className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: planFilter === p ? orange : "rgba(255,255,255,0.07)",
                      color: planFilter === p ? "#fff" : "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}>
                    {PLAN_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Profile","Username","Plan","Company","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map(p => (
                      <tr key={p.id} className="transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {p.profile_photo
                              ? <img src={p.profile_photo} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                              : <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: p.cover_color || "#0B2E6B" }}>{p.display_name?.charAt(0)}</div>
                            }
                            <div>
                              <p className="font-bold text-white text-sm">{p.display_name}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{p.job_title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <a href={`/p/${p.username}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono hover:underline" style={{ color: "#FF7A00" }}>/p/{p.username}</a>
                        </td>
                        <td className="px-5 py-4">
                          <select value={p.plan || "free"} onChange={e => updatePlan.mutate({ id: p.id, plan: e.target.value })}
                            className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer"
                            style={{ background: "rgba(253,186,33,0.15)", color: "#FDBA21", border: "1px solid rgba(253,186,33,0.3)" }}>
                            <option value="free">Free</option>
                            <option value="professional">Professional</option>
                            <option value="salon">Salon</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="lawfirm">Law Firm</option>
                            <option value="corporate">Corporate</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{p.company_name || "—"}</td>
                        <td className="px-5 py-4">
                          <a href={`/p/${p.username}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="text-xs h-7 px-3 font-bold"
                              style={{ background: "rgba(255,122,0,0.15)", color: "#FF7A00", border: "1px solid rgba(255,122,0,0.3)" }}>
                              View
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProfiles.length === 0 && (
                  <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No profiles found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {tab === "subscriptions" && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Subscribers", value: subscriptions.filter(s => s.status === "active").length, color: "#22c55e" },
                { label: "Free Users", value: subscriptions.filter(s => s.status === "free").length, color: "rgba(255,255,255,0.4)" },
                { label: "Past Due", value: subscriptions.filter(s => s.status === "past_due").length, color: "#f59e0b" },
                { label: "Canceled", value: subscriptions.filter(s => s.status === "canceled").length, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                  placeholder="Search by email..."
                  value={subSearch} onChange={e => setSubSearch(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all","free","professional","salon","restaurant","lawfirm","corporate"].map(p => (
                  <button key={p} onClick={() => setSubPlanFilter(p)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: subPlanFilter === p ? orange : "rgba(255,255,255,0.07)", color: subPlanFilter === p ? "#fff" : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {PLAN_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {["all","active","past_due","canceled"].map(s => (
                  <button key={s} onClick={() => setSubStatusFilter(s)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: subStatusFilter === s ? gold : "rgba(255,255,255,0.07)", color: subStatusFilter === s ? "#071d47" : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {s.charAt(0).toUpperCase() + s.replace("_"," ").slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Customer","Plan","Status","Period End","Stripe ID","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions
                      .filter(s => subSearch ? s.customer_email?.toLowerCase().includes(subSearch.toLowerCase()) || s.customer_name?.toLowerCase().includes(subSearch.toLowerCase()) : true)
                      .filter(s => subPlanFilter === "all" || s.plan === subPlanFilter || (subPlanFilter === "professional" && s.plan === "pro"))
                      .filter(s => subStatusFilter === "all" || s.status === subStatusFilter)
                      .map(s => {
                        const statusColors = { active: "#22c55e", free: "rgba(255,255,255,0.3)", past_due: "#f59e0b", canceled: "#ef4444" };
                        const planDisplay = PLAN_LABELS[s.plan] || s.plan || "Free";
                        return (
                          <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td className="px-5 py-4">
                              <p className="font-bold text-white text-sm">{s.customer_name || s.customer_email?.split("@")[0]}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.customer_email}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{ background: "rgba(253,186,33,0.15)", color: gold, border: "1px solid rgba(253,186,33,0.25)" }}>
                                {planDisplay}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusColors[s.status] || "rgba(255,255,255,0.4)" }}>
                                {s.status === "active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.status === "canceled" ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {s.status?.charAt(0).toUpperCase() + s.status?.replace("_"," ").slice(1) || "Free"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                              {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-5 py-4 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {s.stripe_subscription_id?.slice(0, 14) || "—"}
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={s.plan || "free"}
                                onChange={async e => {
                                  await base44.entities.Subscription.update(s.id, { plan: e.target.value });
                                  refetchSubs();
                                }}
                                className="px-2 py-1 rounded-full text-xs font-bold cursor-pointer"
                                style={{ background: "rgba(255,122,0,0.15)", color: orange, border: "1px solid rgba(255,122,0,0.3)" }}>
                                <option value="free">Free</option>
                                <option value="professional">Professional</option>
                                <option value="salon">Salon</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="lawfirm">Law Firm</option>
                                <option value="corporate">Corporate</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {subscriptions.length === 0 && (
                  <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No subscriptions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NFC Manager — force reset */}
        {tab === "nfc_manager" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm">Force Reset</p>
                <p className="text-amber-700 text-xs mt-0.5">Resetting a device clears its owner and makes it available for a new account. Use this when a device was accidentally claimed.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Code","Type","Status","Owner","Profile","Action"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allNfcDevices.map(d => {
                      const linkedProfile = profiles.find(p => p.id === d.assigned_profile);
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-mono text-sm font-bold text-slate-900">{d.device_code}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 capitalize">{d.device_type}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              d.activation_status === "active" ? "bg-green-100 text-green-700"
                              : d.activation_status === "inactive" ? "bg-slate-100 text-slate-500"
                              : "bg-blue-100 text-blue-700"
                            }`}>{d.activation_status}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 font-mono">{d.assigned_user?.slice(0,10) || "—"}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{linkedProfile?.display_name || linkedProfile?.username || "—"}</td>
                          <td className="px-5 py-4">
                            {d.activation_status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setResetConfirm(d)}
                                className="text-xs h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                              >
                                <RotateCcw className="w-3 h-3" /> Force Reset
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-300 italic">Available</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allNfcDevices.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No NFC devices found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NFC Devices */}
        {tab === "devices" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">{devices.length} devices total</p>
              <Button onClick={() => setShowDeviceForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" /> Add Device
              </Button>
            </div>

            {showDeviceForm && (
              <div className="bg-white rounded-2xl border border-blue-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Create NFC Device</h3>
                  <button onClick={() => setShowDeviceForm(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Profile ID (to assign)</Label>
                    <Input className="mt-1 border-slate-200" placeholder="profile_id" value={deviceForm.profile_id} onChange={e => setDeviceForm(f => ({ ...f, profile_id: e.target.value }))} />
                    <p className="text-xs text-slate-400 mt-1">Find the profile ID from the table above</p>
                  </div>
                  <div>
                    <Label>Device Code (unique)</Label>
                    <Input className="mt-1 border-slate-200" placeholder="BNG-001" value={deviceForm.device_code} onChange={e => setDeviceForm(f => ({ ...f, device_code: e.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <Label>Device Type</Label>
                    <select className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={deviceForm.device_type} onChange={e => setDeviceForm(f => ({ ...f, device_type: e.target.value }))}>
                      {["card","keychain","bracelet","stand","badge"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={deviceForm.status} onChange={e => setDeviceForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <Button onClick={() => createDevice.mutate(deviceForm)} disabled={createDevice.isPending || !deviceForm.device_code} className="bg-blue-600 hover:bg-blue-700">
                  {createDevice.isPending ? "Creating..." : "Create Device"}
                </Button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Code","Type","Status","Profile","Tap URL","Assigned"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {devices.map(d => {
                      const linkedProfile = profiles.find(p => p.id === d.profile_id);
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-mono text-sm font-bold text-slate-900">{d.device_code}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 capitalize">{d.device_type}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.status === "active" ? "bg-green-100 text-green-700" : d.status === "lost" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>{d.status}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{linkedProfile?.display_name || d.profile_id?.slice(0,8) || "—"}</td>
                          <td className="px-5 py-4">
                            <a href={`/n/${d.device_code}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-mono hover:underline">/n/{d.device_code}</a>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">{d.assigned_at?.slice(0,10) || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {devices.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No devices yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Leads */}
        {tab === "leads" && (
          <div className="space-y-4">
            <p className="text-slate-500 text-sm">{leads.length} total leads across all profiles</p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {leads.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center">{l.name?.charAt(0) || "?"}</div>
                    <div>
                      <p className="font-bold text-slate-900">{l.name || "Anonymous"}</p>
                      <p className="text-xs text-slate-400">{l.created_date?.slice(0,10)}</p>
                    </div>
                  </div>
                  {l.phone && <p className="text-sm text-slate-600 mb-1">📞 {l.phone}</p>}
                  {l.email && <p className="text-sm text-slate-600 mb-1">📧 {l.email}</p>}
                  {l.message && <p className="text-xs text-slate-500 mt-2 line-clamp-2">💬 {l.message}</p>}
                  <p className="text-xs text-blue-400 mt-2 font-mono">Profile: {l.profile_id?.slice(0,10)}...</p>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No leads yet across any profiles</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activations */}
        {tab === "activations" && (
          <div className="space-y-4">
            <p className="text-slate-500 text-sm">{recentActivations.length} devices activated (showing latest 20)</p>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Device Code","Type","User","Profile","Activated"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentActivations.map(d => {
                      const linkedProfile = profiles.find(p => p.id === d.profile_id);
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-mono text-sm font-bold text-slate-900">{d.device_code}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 capitalize">{d.device_type}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {linkedProfile?.profile_photo
                                ? <img src={linkedProfile.profile_photo} className="w-7 h-7 rounded-full object-cover" alt="" />
                                : <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-xs" style={{ background: linkedProfile?.cover_color || "#2563eb" }}>{linkedProfile?.display_name?.charAt(0) || "?"}</div>
                              }
                              <span className="text-sm font-bold text-slate-900">{linkedProfile?.display_name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <a href={`/p/${linkedProfile?.username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkedProfile?.username || "—"}</a>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{new Date(d.assigned_at).toLocaleDateString()} {new Date(d.assigned_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {recentActivations.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No device activations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="space-y-4">
            <p className="text-slate-500 text-sm">{analytics.length} total events recorded</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(
                analytics.reduce((acc, a) => { acc[a.event_type] = (acc[a.event_type] || 0) + 1; return acc; }, {})
              ).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                <div key={type} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-2xl font-black text-slate-900">{count}</p>
                  <p className="text-slate-500 text-xs mt-1 capitalize">{type.replace(/_/g," ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Force Reset Confirmation Modal */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Force Reset Device</h3>
                <p className="text-xs text-slate-400 font-mono">{resetConfirm.device_code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-2">This will <strong>remove the current owner</strong> and make this device available for a new account to claim.</p>
            <p className="text-xs text-red-500 bg-red-50 rounded-xl p-3 mb-5">⚠️ This action cannot be undone. The previous owner will lose access to this device.</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleForceReset(resetConfirm)}
                disabled={resetting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {resetting ? "Resetting..." : "Yes, Force Reset"}
              </Button>
              <Button variant="outline" onClick={() => setResetConfirm(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </BingooLayout>
  );
}