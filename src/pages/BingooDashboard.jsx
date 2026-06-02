import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ProfileEditor from "@/components/bingoo/ProfileEditor";
import LeadsPanel from "@/components/bingoo/LeadsPanel";
import DevicesPanel from "@/components/bingoo/DevicesPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import AppointmentsPanel from "@/components/bingoo/AppointmentsPanel";
import PortfolioPanel from "@/components/bingoo/PortfolioPanel";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import DesignTab from "@/components/bingoo/DesignTab";
import OnboardingWizard from "@/components/bingoo/OnboardingWizard";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Eye, Copy, Check, ExternalLink, BarChart3, Star, Smartphone, User, Settings, TrendingUp, CalendarDays, Zap, ArrowRight, Briefcase, Palette, Download, QrCode, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TABS = [
  { id: "overview",      label: "Overview",      icon: TrendingUp,   color: "#3b82f6" },
  { id: "profile",       label: "Edit Profile",  icon: Settings,     color: "#8b5cf6" },
  { id: "appointments",  label: "Appointments",  icon: CalendarDays, color: "#10b981" },
  { id: "leads",         label: "Leads",         icon: Star,         color: "#f59e0b" },
  { id: "devices",       label: "My Devices",    icon: Smartphone,   color: "#06b6d4" },
  { id: "analytics",     label: "Analytics",     icon: BarChart3,    color: "#ec4899" },
  { id: "portfolio",     label: "Portfolio",     icon: Briefcase,    color: "#8b5cf6" },
  { id: "design",        label: "Design",        icon: Palette,      color: "#ec4899" },
];

export default function BingooDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (t) => setSearchParams(t === "overview" ? {} : { tab: t });
  const [copied, setCopied] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(undefined); // undefined=first, null=new, string=specific
  const [profileSearch, setProfileSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem("bingoo_onboarding_done")
  );
  const { isDark } = useBingooTheme();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });
  // Derive active profile
  const profile = selectedProfileId === null
    ? null
    : selectedProfileId
    ? profiles.find(p => p.id === selectedProfileId) ?? profiles[0]
    : profiles[0];
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", profile?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profile.id }),
    enabled: !!profile?.id,
  });
  const { data: analytics = [] } = useQuery({
    queryKey: ["analytics-all", profile?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profile.id }),
    enabled: !!profile?.id,
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", profile?.id],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profile.id }),
    enabled: !!profile?.id,
  });

  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}&color=ffffff&bgcolor=1e293b`
    : null;

  const totalViews = analytics.filter(a => a.event_type === "profile_view").length;
  const totalClicks = analytics.filter(a => a.event_type !== "profile_view").length;

  // Theme-aware tokens
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardStyle = { background: bg, border: `1px solid ${border}` };
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const statVal = isDark ? "text-white" : "text-slate-900";
  const rowBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const btnOutline = isDark
    ? "border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30"
    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  const tabBarBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const tabBarBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const heroBg = isDark
    ? "linear-gradient(135deg, #1a1f35 0%, #0f1628 50%, #1a1030 100%)"
    : "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f3e8ff 100%)";
  const heroBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.15)";

  const STAT_CONFIGS = [
    { label: "Profile Views",   value: totalViews,   icon: Eye,       gradient: "from-blue-500 to-blue-600",   shadow: isDark ? "shadow-blue-900/40" : "shadow-blue-200" },
    { label: "Link Clicks",     value: totalClicks,  icon: BarChart3, gradient: "from-violet-500 to-violet-600", shadow: isDark ? "shadow-violet-900/40" : "shadow-violet-200" },
    { label: "Leads Captured",  value: leads.length, icon: Star,      gradient: "from-amber-500 to-amber-600", shadow: isDark ? "shadow-amber-900/40" : "shadow-amber-200" },
    { label: "Appointments",    value: appointments.filter(a=>a.status==="pending").length, icon: CalendarDays, gradient: "from-emerald-500 to-emerald-600", shadow: isDark ? "shadow-emerald-900/40" : "shadow-emerald-200" },
  ];

  return (
    <BingooLayout>
      {showOnboarding && profiles.length === 0 && user && (
        <OnboardingWizard
          userName={user.full_name}
          onCreateProfile={() => { setShowOnboarding(false); setTab("profile"); }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
      <div className="p-6 max-w-6xl mx-auto">

        {/* Hero header */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-6 md:p-8"
          style={{ background: heroBg, border: `1px solid ${heroBorder}` }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          {isDark && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />}
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${mutedText}`}>Welcome back</p>
              <h1 className={`text-3xl md:text-4xl font-black leading-tight ${headText}`}>
                {user?.full_name?.split(" ")[0] || "there"} 👋
              </h1>
              {profile ? (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`text-sm ${mutedText}`}>Profile:</span>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 text-sm font-bold hover:text-blue-400 flex items-center gap-1 transition-colors">
                    /p/{profile.username} <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={copyLink}
                    className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-all font-semibold ${isDark ? "bg-white/10 hover:bg-white/15 text-white/60 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"}`}>
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ) : (
                <p className={`text-sm mt-2 ${mutedText}`}>Set up your profile to get started.</p>
              )}
            </div>
            {profile && (
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {profile.plan?.toUpperCase() || "FREE"} Plan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Switcher */}
        {profiles.length > 0 && (
          <div className="mb-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search profiles by name, title, or username…"
                value={profileSearch}
                onChange={e => setProfileSearch(e.target.value)}
                className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none transition-all ${
                  isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/8"
                    : "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {profileSearch && (
                <button onClick={() => setProfileSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
        {(profiles.length > 1 || profiles.length > 0) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {profiles.filter(p => {
              if (!profileSearch.trim()) return true;
              const q = profileSearch.toLowerCase();
              return (
                p.display_name?.toLowerCase().includes(q) ||
                p.username?.toLowerCase().includes(q) ||
                p.job_title?.toLowerCase().includes(q) ||
                p.company_name?.toLowerCase().includes(q)
              );
            }).map(p => (
              <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setTab("overview"); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  (profile?.id === p.id && selectedProfileId !== null) || (selectedProfileId === undefined && p.id === profiles[0]?.id)
                    ? (isDark ? "bg-white/15 border-white/20 text-white" : "bg-blue-600 border-blue-600 text-white")
                    : (isDark ? "border-white/10 text-white/50 hover:bg-white/10" : "border-slate-200 text-slate-500 hover:bg-slate-50")
                }`}>
                {p.profile_photo
                  ? <img src={p.profile_photo} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: p.cover_color || "#2563eb" }}>{p.display_name?.charAt(0)}</span>
                }
                {p.display_name || p.username}
              </button>
            ))}
            <button onClick={() => { setSelectedProfileId(null); setTab("profile"); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                selectedProfileId === null
                  ? (isDark ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                  : (isDark ? "border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70" : "border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600")
              }`}>
              + New Profile
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl p-1.5 mb-8 overflow-x-auto"
          style={{ background: tabBarBg, border: `1px solid ${tabBarBorder}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${tab === t.id ? "" : (isDark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-black/5")}`}
              style={tab === t.id ? { background: `${t.color}20`, color: t.color, boxShadow: `0 0 20px ${t.color}20` } : {}}>
              <t.icon className="w-4 h-4" style={tab === t.id ? { color: t.color } : {}} />
              {t.label}
              {t.id === "leads" && leads.length > 0 && (
                <span className="bg-amber-500/20 text-amber-500 rounded-full px-1.5 py-0.5 text-xs">{leads.length}</span>
              )}
              {t.id === "appointments" && appointments.filter(a => a.status === "pending").length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-500 rounded-full px-1.5 py-0.5 text-xs">
                  {appointments.filter(a => a.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_CONFIGS.map(s => (
                <div key={s.label} className="relative rounded-2xl p-5 overflow-hidden group cursor-default" style={cardStyle}>
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow}`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-2xl font-black ${statVal}`}>{s.value}</p>
                  <p className={`text-xs mt-0.5 font-medium ${mutedText}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile card + QR */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile preview */}
              <div className="rounded-2xl p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${headText}`}>Your Public Profile</h3>
                  {profile && (
                    <button onClick={() => setShowLayoutPicker(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-400 transition-colors">
                      <Palette className="w-3.5 h-3.5" /> Change Style
                    </button>
                  )}
                </div>
                {profile ? (
                  <>
                    <div className={`rounded-xl overflow-hidden border max-w-xs mx-auto ${isDark ? "border-white/10" : "border-slate-200"}`}>
                      <div className="h-16" style={{ background: profile.cover_color || "#2563eb" }} />
                      <div className={`px-4 pb-4 text-center ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}>
                        <div className="flex justify-center -mt-6 mb-2">
                          {profile.profile_photo
                            ? <img src={profile.profile_photo} className={`w-12 h-12 rounded-full border-4 shadow object-cover ${isDark ? "border-slate-800" : "border-slate-50"}`} alt="" />
                            : <div className="w-12 h-12 rounded-full border-4 shadow flex items-center justify-center font-black text-white text-lg"
                                style={{ background: profile.cover_color || "#2563eb", borderColor: isDark ? "#1e293b" : "#f8fafc" }}>
                                {profile.display_name?.charAt(0)}
                              </div>
                          }
                        </div>
                        <p className={`font-black ${headText}`}>{profile.display_name}</p>
                        <p className="text-xs font-semibold" style={{ color: profile.cover_color || "#3b82f6" }}>{profile.job_title}</p>
                        <p className={`text-xs ${mutedText}`}>{profile.company_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2 text-sm text-white" size="sm">
                          <Eye className="w-4 h-4" /> View Live
                        </Button>
                      </a>
                      <Button size="sm" onClick={() => setTab("profile")}
                        className={`gap-2 font-bold ${isDark ? "bg-violet-500 hover:bg-violet-400 text-white border-0 shadow-lg shadow-violet-900/40" : "bg-slate-800 hover:bg-slate-700 text-white border-0"}`}>
                        <Settings className="w-4 h-4" /> Edit
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <User className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                    <p className={`font-semibold ${subText}`}>No profile yet</p>
                    <p className={`text-sm mt-1 mb-4 ${mutedText}`}>Create your digital profile to get started.</p>
                    <Button onClick={() => setTab("profile")} className="bg-blue-600 hover:bg-blue-500 text-white">Create Profile</Button>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className={`font-bold mb-4 ${headText}`}>QR Code</h3>
                {qrUrl ? (
                  <div className="text-center">
                    <div className={`rounded-2xl p-4 inline-block ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(profileUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`}
                        alt="QR Code" className="w-40 h-40 mx-auto rounded-lg" />
                    </div>
                    <p className={`text-xs mt-3 ${mutedText}`}>Scan to open your profile</p>
                    <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                      <Button size="sm" className={`gap-2 text-xs font-bold ${isDark ? "bg-cyan-500 hover:bg-cyan-400 text-white border-0 shadow-lg shadow-cyan-900/40" : "bg-blue-600 hover:bg-blue-500 text-white border-0"}`}>
                        <Download className="w-3.5 h-3.5" /> Download QR
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <QrCode className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                    <p className={`text-sm ${mutedText}`}>Create a profile first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent leads */}
            {leads.length > 0 && (
              <div className="rounded-2xl p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${headText}`}>Recent Leads</h3>
                  <button onClick={() => setTab("leads")} className="text-sm text-blue-500 font-semibold hover:text-blue-400 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {leads.slice(0, 3).map(l => (
                    <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: rowBg }}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                        {l.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm ${headText}`}>{l.name || "Anonymous"}</p>
                        <p className={`text-xs truncate ${mutedText}`}>{l.email || l.phone || "No contact"}</p>
                      </div>
                      <p className={`text-xs ml-auto flex-shrink-0 ${mutedText}`}>{l.created_date?.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {profile?.plan === "free" && (
              <div className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: isDark ? "linear-gradient(135deg,#1a237e22,#1a0a3022)" : "linear-gradient(135deg,#eff6ff,#f5f3ff)", border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)"}` }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-black mb-1 ${headText}`}>Unlock Full Power 🚀</h3>
                    <p className={`text-sm ${subText}`}>Upgrade to Pro for full analytics, lead collection, unlimited links and more.</p>
                  </div>
                  <Link to="/pricing" className="flex-shrink-0">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold gap-2 shadow-lg">
                      View Plans <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "profile"      && <ProfileEditor user={user} editProfileId={selectedProfileId} onSaved={() => { refetchProfiles(); setTab("overview"); }} />}
        {tab === "appointments" && <AppointmentsPanel profileId={profile?.id} />}
        {tab === "leads"        && <LeadsPanel profileId={profile?.id} />}
        {tab === "devices"      && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to="/activate-device">
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-2">
                  <Smartphone className="w-4 h-4" /> Activate Device
                </Button>
              </Link>
            </div>
            <DevicesPanel profileId={profile?.id} />
          </div>
        )}
        {tab === "analytics"    && <AnalyticsPanel profileId={profile?.id} />}
        {tab === "portfolio"    && <PortfolioPanel profileId={profile?.id} user={user} />}
        {tab === "design"       && <DesignTab profile={profile} />}

        {/* Layout Picker Modal */}
        {showLayoutPicker && profile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"}`}>
              <div className={`p-6 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-black ${headText}`}>Profile Style</h2>
                    <p className={`text-sm mt-0.5 ${mutedText}`}>Choose a layout for your public page</p>
                  </div>
                  <button onClick={() => setShowLayoutPicker(false)} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"}`}>✕</button>
                </div>
              </div>
              <div className="p-6">
                <LayoutPicker
                  value={profile.layout || "classic"}
                  onChange={async (newLayout) => {
                    await base44.entities.Profile.update(profile.id, { layout: newLayout });
                    refetchProfiles();
                    setShowLayoutPicker(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </BingooLayout>
  );
}