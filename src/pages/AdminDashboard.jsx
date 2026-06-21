import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFeatures, hasFeature } from "@/hooks/useFeatures";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, BarChart3, Star, Shield, Search, CreditCard, Clock, RotateCcw, AlertTriangle, CheckCircle2, XCircle, UserPlus2, Globe, QrCode } from "lucide-react";
import SecurityAuditTab from "@/components/bingoo/SecurityAuditTab";
import AdminPricingTab from "@/components/bingoo/AdminPricingTab";
import NFCDeviceManager from "@/components/bingoo/NFCDeviceManager";
import { PLAN_LABELS } from "@/lib/planPermissions";

const T = {
  en: {
    title: "Admin Dashboard", subtitle: "Super Admin Control Panel",
    tabs: { users: "Users & Profiles", subscriptions: "Subscriptions", nfc_manager: "NFC Manager", devices: "Legacy Devices", activations: "Recent Activations", leads: "All Leads", appointments: "All Appointments", prospects: "Prospect Clients", new_users: "New Users", analytics: "Analytics" },
    stats: { profiles: "Total Profiles", devices: "NFC Devices", leads: "Total Leads", analytics: "Analytics Events" },
    search: "Search by name, username, company...", searchEmail: "Search by email...",
    view: "View", addDevice: "Add Device", creating: "Creating...", createDevice: "Create Device",
    noProfiles: "No profiles found", noSubs: "No subscriptions yet", noDevices: "No devices yet", noNfc: "No NFC devices found", noLeads: "No leads yet across any profiles", noActivations: "No device activations yet", noAppointments: "No appointments yet", noProspects: "No prospect leads yet", noUsers: "No users found",
    totalSubs: "Total Subscribers", freeUsers: "Free Users", pastDue: "Past Due", canceled: "Canceled",
    totalUsers: "Total Users", last7: "Last 7 Days", last30: "Last 30 Days",
    totalProspects: "Total Prospects", contacted: "Contacted", converted: "Converted",
    forceReset: "Force Reset", forceResetTitle: "Force Reset Device", forceResetMsg: "This will remove the current owner and make this device available for a new account to claim.", forceResetWarning: "⚠️ This action cannot be undone. The previous owner will lose access to this device.", yesReset: "Yes, Force Reset", resetting: "Resetting...", cancel: "Cancel", available: "Available",
    profileCol: "Profile", username: "Username", plan: "Plan", company: "Company", actions: "Actions",
    customer: "Customer", status: "Status", periodEnd: "Period End", stripeId: "Stripe ID",
    code: "Code", type: "Type", owner: "Owner", action: "Action",
    deviceCode: "Device Code", user: "User", activated: "Activated",
    prospect: "Prospect", contact: "Contact", interest: "Interest", source: "Source", date: "Date",
    userCol: "User", email: "Email", role: "Role", joined: "Joined", newBadge: "NEW",
    totalEvents: "total events recorded", totalLeads: "total leads across all profiles", totalActivations: "devices activated (showing latest 20)",
    profileIdLabel: "Profile ID (to assign)", deviceCodeLabel: "Device Code (unique)", deviceType: "Device Type", statusLabel: "Status",
    forceResetNote: "Resetting a device clears its owner and makes it available for a new account. Use this when a device was accidentally claimed.",
    prospectsNote: "They'll appear here when visitors tap NFC profiles and interact with the popup.",
    anonymous: "Anonymous", unknown: "Unknown",
    new: "New", closed: "Closed",
    all: "All", active: "Active", inactive: "Inactive",
  },
  fr: {
    title: "Tableau de Bord Admin", subtitle: "Panneau de Contrôle Super Admin",
    tabs: { users: "Utilisateurs & Profils", subscriptions: "Abonnements", nfc_manager: "Gestionnaire NFC", devices: "Appareils Legacy", activations: "Activations Récentes", leads: "Tous les Prospects", appointments: "Tous les RDV", prospects: "Clients Potentiels", new_users: "Nouveaux Utilisateurs", analytics: "Analytiques" },
    stats: { profiles: "Total Profils", devices: "Appareils NFC", leads: "Total Prospects", analytics: "Événements Analytics" },
    search: "Rechercher par nom, identifiant, entreprise...", searchEmail: "Rechercher par email...",
    view: "Voir", addDevice: "Ajouter Appareil", creating: "Création...", createDevice: "Créer l'Appareil",
    noProfiles: "Aucun profil trouvé", noSubs: "Aucun abonnement", noDevices: "Aucun appareil", noNfc: "Aucun appareil NFC", noLeads: "Aucun prospect sur tous les profils", noActivations: "Aucune activation", noAppointments: "Aucun rendez-vous", noProspects: "Aucun client potentiel", noUsers: "Aucun utilisateur trouvé",
    totalSubs: "Total Abonnés", freeUsers: "Utilisateurs Gratuits", pastDue: "En Retard", canceled: "Annulé",
    totalUsers: "Total Utilisateurs", last7: "7 Derniers Jours", last30: "30 Derniers Jours",
    totalProspects: "Total Clients Potentiels", contacted: "Contacté", converted: "Converti",
    forceReset: "Réinitialiser", forceResetTitle: "Réinitialiser l'Appareil", forceResetMsg: "Cela supprimera le propriétaire actuel et rendra cet appareil disponible pour un nouveau compte.", forceResetWarning: "⚠️ Cette action est irréversible. L'ancien propriétaire perdra l'accès à cet appareil.", yesReset: "Oui, Réinitialiser", resetting: "Réinitialisation...", cancel: "Annuler", available: "Disponible",
    profileCol: "Profil", username: "Identifiant", plan: "Forfait", company: "Entreprise", actions: "Actions",
    customer: "Client", status: "Statut", periodEnd: "Fin de Période", stripeId: "ID Stripe",
    code: "Code", type: "Type", owner: "Propriétaire", action: "Action",
    deviceCode: "Code Appareil", user: "Utilisateur", activated: "Activé le",
    prospect: "Prospect", contact: "Contact", interest: "Intérêt", source: "Source", date: "Date",
    userCol: "Utilisateur", email: "Email", role: "Rôle", joined: "Inscrit le", newBadge: "NOUVEAU",
    totalEvents: "événements enregistrés au total", totalLeads: "prospects au total sur tous les profils", totalActivations: "appareils activés (20 derniers)",
    profileIdLabel: "ID Profil (à assigner)", deviceCodeLabel: "Code Appareil (unique)", deviceType: "Type d'Appareil", statusLabel: "Statut",
    forceResetNote: "Réinitialiser un appareil efface son propriétaire et le rend disponible pour un nouveau compte.",
    prospectsNote: "Ils apparaîtront ici lorsque des visiteurs tapoteront les profils NFC.",
    anonymous: "Anonyme", unknown: "Inconnu",
    new: "Nouveau", closed: "Fermé",
    all: "Tous", active: "Actif", inactive: "Inactif",
  }
};

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
  const { features } = useFeatures();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [resetConfirm, setResetConfirm] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("bingoo_lang");
    if (saved) return saved;
    const browserLang = navigator.language || navigator.userLanguage || "en";
    return browserLang.toLowerCase().startsWith("fr") ? "fr" : "en";
  });
  const t = T[lang];
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (u.role !== "admin" && u.role !== "super_admin") window.location.href = "/bingoo";
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: profiles = [] } = useQuery({ queryKey: ["admin-profiles"], queryFn: () => base44.entities.Profile.list() });
  const { data: devices = [] } = useQuery({ queryKey: ["admin-devices"], queryFn: () => base44.entities.NFCDevice.list() });
  const { data: allNfcDevices = [], refetch: refetchNfcDevices } = useQuery({ queryKey: ["admin-nfc-devices"], queryFn: () => base44.entities.Device.list() });
  const { data: leads = [] } = useQuery({ queryKey: ["admin-leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: allAppointments = [] } = useQuery({ queryKey: ["admin-appointments"], queryFn: () => base44.entities.Appointment.list("-created_date", 500) });
  const { data: analytics = [] } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => base44.entities.Analytics.list("-created_at", 500) });
  const { data: subscriptions = [], refetch: refetchSubs } = useQuery({ queryKey: ["admin-subscriptions"], queryFn: () => base44.entities.Subscription.list("-created_date", 200) });
  const { data: prospectLeads = [], refetch: refetchProspects } = useQuery({ queryKey: ["admin-prospect-leads"], queryFn: () => base44.entities.ProspectLead.list("-created_at", 500) });
  const { data: allUsers = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => base44.entities.User.list("-created_date", 200) });
  const [subSearch, setSubSearch] = useState("");
  const [subPlanFilter, setSubPlanFilter] = useState("all");
  const [subStatusFilter, setSubStatusFilter] = useState("all");

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

  // Build a merged user+profile roster for the Users tab
  const userProfileRows = allUsers.map(u => {
    const profile = profiles.find(p =>
      p.created_by_id === u.id ||
      (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id)) ||
      (p.email && p.email === u.email)
    ) || null;
    return { user: u, profile };
  });

  const filteredUserRows = userProfileRows
    .filter(row => {
      const planMatch = planFilter === "all"
        || (planFilter === "no_profile" ? !row.profile : (row.profile?.plan || "free") === planFilter);
      const term = search.toLowerCase();
      const searchMatch = !term || [
        row.user.full_name, row.user.email,
        row.profile?.username, row.profile?.display_name, row.profile?.company_name, row.profile?.email
      ].some(v => v?.toLowerCase().includes(term));
      return planMatch && searchMatch;
    });

  // Combined subscription view: real Stripe records + manual paid profiles
  const stripeSubs = subscriptions; // from Subscription entity
  const manualPaidProfiles = profiles.filter(p => p.plan && p.plan !== "free");
  // Avoid double-counting: if a profile's email already has a real Stripe sub, skip it from manual list
  const stripeEmails = new Set(stripeSubs.map(s => s.customer_email?.toLowerCase()));
  const manualRows = manualPaidProfiles
    .filter(p => !stripeEmails.has((p.email || "").toLowerCase()))
    .map(p => {
      const owner = allUsers.find(u =>
        u.id === p.created_by_id ||
        (Array.isArray(u.owned_profile_ids) && u.owned_profile_ids.includes(p.id))
      );
      return {
        id: p.id,
        customer_name: p.display_name || owner?.full_name || "—",
        customer_email: p.email || owner?.email || "—",
        username: p.username,
        plan: p.plan,
        status: "active",
        source: "Manual/Profile Plan",
        stripe_subscription_id: "",
        stripe_customer_id: "",
        created_date: p.created_date,
      };
    });
  const allSubRows = [
    ...stripeSubs.map(s => ({
      ...s,
      username: profiles.find(p => p.email === s.customer_email || p.created_by_id === allUsers.find(u => u.email === s.customer_email)?.id)?.username || null,
      source: (s.stripe_subscription_id || s.stripe_customer_id) ? "Stripe" : "Manual/Profile Plan",
    })),
    ...manualRows,
  ];

  const filteredSubRows = allSubRows
    .filter(s => subSearch ? s.customer_email?.toLowerCase().includes(subSearch.toLowerCase()) || s.customer_name?.toLowerCase().includes(subSearch.toLowerCase()) : true)
    .filter(s => subStatusFilter === "all" || s.status === subStatusFilter);

  // Counters
  const usersWithoutProfile = userProfileRows.filter(r => !r.profile).length;
  const paidProfiles = profiles.filter(p => p.plan && p.plan !== "free").length;
  const activeStripeSubs = stripeSubs.filter(s => s.status === "active").length;
  const manualPaidCount = manualRows.length;
  const totalPaidAccess = allSubRows.filter(s => s.status === "active" || s.status === "past_due").length;

  const recentActivations = devices
    .filter(d => d.assigned_at)
    .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
    .slice(0, 20);

  const TABS = [
    { id: "users",        label: t.tabs.users,        icon: Users,        count: allUsers.length },
    { id: "subscriptions",label: t.tabs.subscriptions,icon: CreditCard,   count: allSubRows.length },
    { id: "nfc_manager",  label: "NFC Device Manager", icon: QrCode,      count: devices.length },
    { id: "activations",  label: t.tabs.activations,   icon: Clock,       count: recentActivations.length },
    ...(hasFeature(features, "lead_collection") ? [{ id: "leads",        label: t.tabs.leads,        icon: Star,         count: leads.length }] : []),
    ...(hasFeature(features, "appointments") ? [{ id: "appointments", label: t.tabs.appointments, icon: CheckCircle2, count: allAppointments.length }] : []),
    { id: "prospects",    label: t.tabs.prospects,    icon: UserPlus2,    count: prospectLeads.length },
    { id: "new_users",    label: t.tabs.new_users,    icon: UserPlus2,    count: undefined },
    ...(hasFeature(features, "analytics") ? [{ id: "analytics",    label: t.tabs.analytics,    icon: BarChart3 }] : []),
    { id: "security",     label: "Security Audit",    icon: Shield },
    { id: "pricing",      label: "Pricing / Currency", icon: Globe },
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
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="text-2xl font-black text-white">{t.title}</h1>
            <p className="text-white/40 text-sm">{t.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setLang(l => l === "en" ? "fr" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
            >
              {lang === "en" ? "🇫🇷 Français" : "🇺🇸 English"}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.3)" }}>
              <Shield className="w-4 h-4" style={{ color: gold }} />
              <span className="text-xs font-black" style={{ color: gold }}>ADMIN</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: allUsers.length, icon: Users, accent: orange },
            { label: "Total Profiles", value: profiles.length, icon: QrCode, accent: gold },
            { label: "Paid Access", value: totalPaidAccess, icon: Star, accent: "#22c55e" },
            { label: t.stats.analytics, value: analytics.length, icon: BarChart3, accent: "#06b6d4" },
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
            {/* Mini counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Users", value: allUsers.length, color: orange },
                { label: "Total Profiles", value: profiles.length, color: gold },
                { label: "No Profile Yet", value: usersWithoutProfile, color: "#94a3b8" },
                { label: "Paid Profiles", value: paidProfiles, color: "#22c55e" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input className="pl-9" placeholder={t.search}
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all","no_profile","free","professional","business","salon","restaurant","lawfirm","corporate"].map(p => (
                  <button key={p} onClick={() => setPlanFilter(p)}
                    className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: planFilter === p ? orange : "rgba(255,255,255,0.07)",
                      color: planFilter === p ? "#fff" : "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}>
                    {p === "no_profile" ? "No Profile" : (PLAN_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1))}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs mb-2"
              style={{ background: "rgba(253,186,33,0.08)", border: "1px solid rgba(253,186,33,0.2)", color: "rgba(253,186,33,0.8)" }}>
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span><strong>Manual app-plan override for testing/internal use.</strong> Changing the plan here updates <code className="text-[10px] px-1 py-0.5 rounded" style={{ background: "rgba(253,186,33,0.15)" }}>Profile.plan</code> directly. This does <em>not</em> change Stripe billing, cancel subscriptions, or modify any subscription records.</span>
            </div>

            <div className="rounded-2xl overflow-hidden border"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["User / Profile", "Username", "Plan (Override)", "Role", "Joined", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserRows.map(({ user: u, profile: p }) => (
                      <tr key={u.id} className="transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {p?.profile_photo
                              ? <img src={p.profile_photo} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                              : <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: p?.cover_color || "#334155" }}>{(p?.display_name || u.full_name || "?").charAt(0)}</div>
                            }
                            <div>
                              <p className="font-bold text-white text-sm">{p?.display_name || u.full_name || "—"}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{u.email}</p>
                              {!p && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: "rgba(148,163,184,0.15)", color: "#94a3b8" }}>No profile yet</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {p ? (
                            <a href={`/p/${p.username}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono hover:underline" style={{ color: "#FF7A00" }}>/p/{p.username}</a>
                          ) : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {p ? (
                            <div className="flex flex-col gap-1">
                              <select value={p.plan || "free"} onChange={e => updatePlan.mutate({ id: p.id, plan: e.target.value })}
                                className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer"
                                style={{ background: "rgba(253,186,33,0.15)", color: "#FDBA21", border: "1px solid rgba(253,186,33,0.3)" }}>
                                <option value="free">Free</option>
                                <option value="pro">Pro (legacy)</option>
                                <option value="professional">Professional</option>
                                <option value="business">Business</option>
                                <option value="salon">Salon</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="lawfirm">Law Firm</option>
                                <option value="corporate">Corporate</option>
                              </select>
                              <span className="text-[9px] leading-tight" style={{ color: "rgba(255,255,255,0.25)" }}>
                                App-plan override · no Stripe change
                              </span>
                            </div>
                          ) : <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                            style={{ background: u.role === "admin" ? "rgba(253,186,33,0.15)" : "rgba(255,255,255,0.07)", color: u.role === "admin" ? gold : "rgba(255,255,255,0.4)", border: `1px solid ${u.role === "admin" ? "rgba(253,186,33,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {u.created_date ? new Date(u.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {p ? (
                            <a href={`/p/${p.username}`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="text-xs h-7 px-3 font-bold"
                                style={{ background: "rgba(255,122,0,0.15)", color: "#FF7A00", border: "1px solid rgba(255,122,0,0.3)" }}>
                                View
                              </Button>
                            </a>
                          ) : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUserRows.length === 0 && (
                  <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {tab === "subscriptions" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Paid Access", value: totalPaidAccess, color: "#22c55e" },
                { label: "Stripe Active", value: activeStripeSubs, color: "#06b6d4" },
                { label: "Manual/Profile Plan", value: manualPaidCount, color: gold },
                { label: t.pastDue, value: allSubRows.filter(s => s.status === "past_due").length, color: "#f59e0b" },
                { label: t.canceled, value: allSubRows.filter(s => s.status === "canceled").length, color: "#ef4444" },
                { label: "Free Users", value: allUsers.length - totalPaidAccess, color: "rgba(255,255,255,0.4)" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Source legend */}
            <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#06b6d4" }} />Stripe — real Stripe subscription record</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: gold }} />Manual/Profile Plan — access granted directly on profile, no Stripe record</span>
            </div>

            {/* Combined table */}
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                    placeholder={t.searchEmail}
                    value={subSearch} onChange={e => setSubSearch(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all","active","past_due","canceled"].map(s => (
                    <button key={s} onClick={() => setSubStatusFilter(s)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                      style={{ background: subStatusFilter === s ? gold : "rgba(255,255,255,0.07)", color: subStatusFilter === s ? "#071d47" : "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.replace("_"," ").slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        {["Customer", "Profile", "Plan", "Status", "Source", "Stripe ID", "Since"].map(h => (
                          <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
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
                              {s.username
                                ? <a href={`/p/${s.username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono hover:underline" style={{ color: "#FF7A00" }}>/p/{s.username}</a>
                                : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{ background: "rgba(253,186,33,0.15)", color: gold, border: "1px solid rgba(253,186,33,0.25)" }}>
                                {PLAN_LABELS[s.plan] || s.plan || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusColors[s.status] || "rgba(255,255,255,0.4)" }}>
                                {s.status === "active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.status === "canceled" ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {s.status?.charAt(0).toUpperCase() + s.status?.replace("_"," ").slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: isStripe ? "rgba(6,182,212,0.15)" : "rgba(253,186,33,0.1)", color: isStripe ? "#06b6d4" : gold, border: `1px solid ${isStripe ? "rgba(6,182,212,0.3)" : "rgba(253,186,33,0.2)"}` }}>
                                {s.source}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                              {s.stripe_subscription_id ? s.stripe_subscription_id.slice(0, 14) + "…" : "—"}
                            </td>
                            <td className="px-4 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {s.created_date ? new Date(s.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredSubRows.length === 0 && (
                    <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
                      <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p>No records match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified NFC Device Manager */}
        {tab === "nfc_manager" && (
          <NFCDeviceManager profiles={profiles} allNfcDevices={allNfcDevices} currentUser={user} />
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
                  <p>{t.noLeads}</p>
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
                      {[t.deviceCode, t.type, t.user, t.profileCol, t.activated].map(h => (
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
                    <p>{t.noActivations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Appointments */}
        {tab === "appointments" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: lang === "fr" ? "Total" : "Total", value: allAppointments.length, color: "#FF7A00" },
                { label: lang === "fr" ? "En attente" : "Pending", value: allAppointments.filter(a => a.status === "pending").length, color: "#FDBA21" },
                { label: lang === "fr" ? "Confirmé" : "Confirmed", value: allAppointments.filter(a => a.status === "confirmed").length, color: "#22c55e" },
                { label: lang === "fr" ? "Complété" : "Completed", value: allAppointments.filter(a => a.status === "completed").length, color: "#06b6d4" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
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
                      {[t.customer, lang === "fr" ? "Date/Heure" : "Date/Time", t.contact, lang === "fr" ? "Profil Source" : "Source Profile", t.status, lang === "fr" ? "Créé le" : "Created"].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allAppointments.map(a => {
                      const srcProfile = profiles.find(p => p.id === a.profile_id);
                      const statusColors = { pending: "#FDBA21", confirmed: "#22c55e", completed: "#06b6d4", cancelled: "#ef4444" };
                      return (
                        <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="px-4 py-4">
                            <p className="font-bold text-white text-sm">{a.visitor_name || "—"}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-white/70">{a.date || "—"}</p>
                            <p className="text-xs text-white/40">{a.time_slot || ""}</p>
                          </td>
                          <td className="px-4 py-4">
                            {a.visitor_email && <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>📧 {a.visitor_email}</p>}
                            {a.visitor_phone && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>📞 {a.visitor_phone}</p>}
                          </td>
                          <td className="px-4 py-4">
                            {srcProfile ? (
                              <a href={`/p/${srcProfile.username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:underline" style={{ color: "#FF7A00" }}>{srcProfile.display_name || srcProfile.username}</a>
                            ) : <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{a.profile_id?.slice(0,10)}…</span>}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{ background: `${statusColors[a.status] || "#FDBA21"}20`, color: statusColors[a.status] || "#FDBA21", border: `1px solid ${statusColors[a.status] || "#FDBA21"}40` }}>
                              {a.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {a.created_date?.slice(0, 10) || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allAppointments.length === 0 && (
                  <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>{t.noAppointments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prospect Clients */}
        {tab === "prospects" && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t.totalProspects, value: prospectLeads.length, color: "#FF7A00" },
                { label: t.new, value: prospectLeads.filter(p => p.status === "new").length, color: "#FDBA21" },
                { label: t.contacted, value: prospectLeads.filter(p => p.status === "contacted").length, color: "#06b6d4" },
                { label: t.converted, value: prospectLeads.filter(p => p.status === "converted").length, color: "#22c55e" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
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
                      {[t.prospect, t.contact, t.interest, t.source, t.date, t.status].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prospectLeads.map(p => {
                      const srcProfile = profiles.find(pr => pr.id === p.source_profile_id);
                      const statusColors = { new: "#FDBA21", contacted: "#06b6d4", converted: "#22c55e", closed: "#ef4444" };
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {p.visitor_name?.charAt(0) || "?"}
                              </div>
                              <p className="font-bold text-white text-sm">{p.visitor_name || "Anonymous"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {p.visitor_email && <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>📧 {p.visitor_email}</p>}
                            {p.visitor_phone && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>📞 {p.visitor_phone}</p>}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,122,0,0.18)", color: "#FF7A00", border: "1px solid rgba(255,122,0,0.3)" }}>
                              {p.interested_in || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {srcProfile ? (
                              <div>
                                <a href={`/p/${srcProfile.username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:underline" style={{ color: "#FF7A00" }}>{srcProfile.display_name || srcProfile.username}</a>
                                {p.source_device_code && <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>📟 {p.source_device_code}</p>}
                              </div>
                            ) : <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{p.source_profile_id?.slice(0,10)}…</span>}
                          </td>
                          <td className="px-4 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={p.status || "new"}
                              onChange={async e => {
                                await base44.entities.ProspectLead.update(p.id, { status: e.target.value });
                                refetchProspects();
                                toast.success("Status updated");
                              }}
                              className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer"
                              style={{ background: `${statusColors[p.status] || "#FDBA21"}20`, color: statusColors[p.status] || "#FDBA21", border: `1px solid ${statusColors[p.status] || "#FDBA21"}40` }}>
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {prospectLeads.length === 0 && (
                  <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <UserPlus2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>{t.noProspects}</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>{t.prospectsNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Users */}
        {tab === "new_users" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
              {[
                { label: t.totalUsers, value: allUsers.length, color: "#FF7A00" },
                { label: t.last7, value: allUsers.filter(u => new Date(u.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length, color: "#22c55e" },
                { label: t.last30, value: allUsers.filter(u => new Date(u.created_date) > new Date(Date.now() - 30*24*60*60*1000)).length, color: "#FDBA21" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
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
                      {[t.userCol, t.email, t.role, t.joined].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => {
                      const isNew = new Date(u.created_date) > new Date(Date.now() - 7*24*60*60*1000);
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {u.full_name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{u.full_name || "—"}</p>
                                {isNew && <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">{t.newBadge}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                              style={{ background: u.role === "admin" ? "rgba(253,186,33,0.15)" : "rgba(255,255,255,0.07)", color: u.role === "admin" ? gold : "rgba(255,255,255,0.4)", border: `1px solid ${u.role === "admin" ? "rgba(253,186,33,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {u.created_date ? new Date(u.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allUsers.length === 0 && (
                  <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>{t.noUsers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Audit */}
        {tab === "security" && <SecurityAuditTab />}

        {/* Pricing / Currency */}
        {tab === "pricing" && <AdminPricingTab />}

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
                <h3 className="font-black text-slate-900">{t.forceResetTitle}</h3>
                <p className="text-xs text-slate-400 font-mono">{resetConfirm.device_code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-2">{t.forceResetMsg}</p>
            <p className="text-xs text-red-500 bg-red-50 rounded-xl p-3 mb-5">{t.forceResetWarning}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleForceReset(resetConfirm)}
                disabled={resetting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {resetting ? t.resetting : t.yesReset}
              </Button>
              <Button variant="outline" onClick={() => setResetConfirm(null)} className="flex-1">{t.cancel}</Button>
            </div>
          </div>
        </div>
      )}
    </BingooLayout>
  );
}