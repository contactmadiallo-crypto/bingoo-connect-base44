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
import CalendarView from "@/components/bingoo/CalendarView";
import AIOnboardingAssistant from "@/components/bingoo/AIOnboardingAssistant";
import AppointmentSettings from "@/components/bingoo/AppointmentSettings";
import FeatureGate from "@/components/bingoo/FeatureGate";
import ResumePanel from "@/components/bingoo/ResumePanel";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Eye, Copy, Check, ExternalLink, BarChart3, Star, Smartphone, User, Settings, TrendingUp, CalendarDays, Calendar, Zap, ArrowRight, Briefcase, Palette, Download, QrCode, Search, X, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TABS = [
  { id: "overview",      label: "Overview",      icon: TrendingUp,   color: "#3b82f6" },
  { id: "profile",       label: "Edit Profile",  icon: Settings,     color: "#8b5cf6" },
  { id: "appointments",  label: "Appointments",  icon: CalendarDays, color: "#10b981" },
  { id: "calendar",      label: "Calendar",      icon: Calendar,     color: "#06b6d4" },
  { id: "leads",         label: "Leads",         icon: Star,         color: "#f59e0b" },
  { id: "devices",       label: "My Devices",    icon: Smartphone,   color: "#06b6d4" },
  { id: "analytics",     label: "Analytics",     icon: BarChart3,    color: "#ec4899" },
  { id: "portfolio",     label: "Portfolio",     icon: Briefcase,    color: "#8b5cf6" },
  { id: "design",        label: "Design",        icon: Palette,      color: "#ec4899" },
  { id: "appt_settings", label: "Booking Setup", icon: Settings,     color: "#0d9488" },
  { id: "resumes",       label: "Resumes",       icon: FileText,     color: "#6366f1" },
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
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
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

  const launchAI = () => {
    localStorage.removeItem("bingoo_onboarding_done");
    setShowOnboarding(true);
  };

  return (
    <BingooLayout>
      {showOnboarding && user && (
        <AIOnboardingAssistant
          userName={user.full_name}
          onComplete={(generatedData) => {
            setShowOnboarding(false);
            setAiGeneratedProfile(generatedData);
            setSelectedProfileId(null);
            setTab("profile");
          }}
          onDismiss={() => {
            setShowOnboarding(false);
            setTab("profile");
          }}
        />
      )}
      <div className={`min-h-screen ${isDark ? "bg-[#0a0c14]" : "bg-[#f5f7fb]"}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-16 pt-3 sm:pt-6">

          {/* ── iOS-style Hero ── */}
          <div className={`relative rounded-3xl overflow-hidden mb-6 ${isDark ? "bg-gradient-to-br from-[#13162a] to-[#0d1022]" : "bg-white"}`}
            style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.4)" : "0 1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07)" }}>
            {/* Gradient accent bar at top */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #0B2E6B, #FF7A00, #FDBA21)` }} />
            <div className="p-4 md:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${mutedText}`}>Dashboard</p>
                  <h1 className={`text-xl md:text-3xl font-black leading-tight tracking-tight ${headText}`}>
                    {user?.full_name?.split(" ")[0] || "Hello"} <span className="inline-block animate-bounce">👋</span>
                  </h1>
                  {profile ? (
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 text-sm font-bold hover:underline flex items-center gap-1">
                        /p/{profile.username} <ExternalLink className="w-3 h-3" />
                      </a>
                      <button onClick={copyLink}
                        className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 transition-all font-semibold ${isDark ? "bg-white/8 hover:bg-white/14 text-white/55 hover:text-white border border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200"}`}>
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ) : (
                    <p className={`text-sm mt-1.5 ${mutedText}`}>Set up your first profile to get started.</p>
                  )}
                </div>
                {profile && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${isDark ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {profile.plan?.toUpperCase() || "FREE"}
                    </span>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-full font-bold gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-md shadow-blue-500/25">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Profile Switcher ── */}
          {profiles.length > 0 && (
            <div className="mb-2">
              <div className="relative">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
                <input
                  type="text"
                  placeholder="Search profiles…"
                  value={profileSearch}
                  onChange={e => setProfileSearch(e.target.value)}
                  className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all ${
                    isDark
                      ? "bg-white/5 border border-white/8 text-white placeholder:text-white/25 focus:border-white/18 focus:bg-white/7"
                      : "bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  }`}
                />
                {profileSearch && (
                  <button onClick={() => setProfileSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
          {profiles.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {profiles.filter(p => {
                if (!profileSearch.trim()) return true;
                const q = profileSearch.toLowerCase();
                return p.display_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q) || p.job_title?.toLowerCase().includes(q);
              }).map(p => {
                const isSelected = (profile?.id === p.id && selectedProfileId !== null) || (selectedProfileId === undefined && p.id === profiles[0]?.id);
                return (
                  <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setTab("overview"); }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                      isSelected
                        ? (isDark ? "bg-white/12 border-white/18 text-white shadow-sm" : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200")
                        : (isDark ? "border-white/10 text-white/45 hover:bg-white/8 hover:text-white/75" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700")
                    }`}>
                    {p.profile_photo
                      ? <img src={p.profile_photo} className="w-5 h-5 rounded-full object-cover" alt="" />
                      : <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: p.cover_color || "#2563eb" }}>{p.display_name?.charAt(0)}</span>
                    }
                    <span className="max-w-[120px] truncate">{p.display_name || p.username}</span>
                  </button>
                );
              })}
              <button onClick={() => { setSelectedProfileId(null); setTab("profile"); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  selectedProfileId === null
                    ? (isDark ? "bg-emerald-500/18 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                    : (isDark ? "border-white/10 border-dashed text-white/35 hover:text-white/60" : "border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600")
                }`}>
                + New Profile
              </button>
              <button onClick={launchAI}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${isDark ? "border-violet-400/30 text-violet-400 hover:bg-violet-400/10" : "border-violet-300 text-violet-600 hover:bg-violet-50"}`}>
                <Zap className="w-3.5 h-3.5" /> AI Builder
              </button>
            </div>
          )}

          {/* ── iOS Tab Bar ── */}
          <div className={`relative flex gap-0.5 rounded-2xl p-1 mb-4 sm:mb-6 overflow-x-auto scrollbar-none`}
            style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(0,0,0,0.04)" }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const leadBadge = t.id === "leads" && leads.length > 0 ? leads.length : null;
              const apptBadge = t.id === "appointments" ? appointments.filter(a => a.status === "pending").length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? (isDark ? "text-white" : "text-slate-900")
                      : (isDark ? "text-white/35 hover:text-white/65 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-black/4")
                  }`}
                  style={isActive ? {
                    background: isDark ? "rgba(255,255,255,0.1)" : "#fff",
                    boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
                  } : {}}>
                  <t.icon className="w-3.5 h-3.5 flex-shrink-0" style={isActive ? { color: t.color } : {}} />
                  <span style={isActive ? { color: t.color } : {}}>{t.label}</span>
                  {leadBadge && <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center px-1">{leadBadge}</span>}
                  {apptBadge > 0 && <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center px-1">{apptBadge}</span>}
                </button>
              );
            })}
          </div>

          {/* ── Overview Tab ── */}
          {tab === "overview" && (
          <div className="space-y-5">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {STAT_CONFIGS.map(s => (
                <div key={s.label}
                  className={`relative rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-200 group cursor-default ${isDark ? "bg-white/5 hover:bg-white/7" : "bg-white hover:shadow-md"}`}
                  style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
                  <div className={`w-8 h-8 rounded-xl mb-2.5 flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-md ${s.shadow}`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={`text-xl font-black tracking-tight ${statVal}`}>{s.value}</p>
                  <p className={`text-[11px] mt-0.5 font-medium ${mutedText}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile + QR row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between p-4 pb-3">
                  <p className={`font-bold text-sm ${headText}`}>Your Profile</p>
                  {profile && (
                    <button onClick={() => setShowLayoutPicker(true)}
                      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-500"}`}>
                      <Palette className="w-3.5 h-3.5" /> Style
                    </button>
                  )}
                </div>
                {profile ? (
                  <div className="px-4 pb-4">
                    <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/8" : "border-slate-100"}`}>
                      <div className="h-14" style={{ background: `linear-gradient(135deg, ${profile.cover_color || "#2563eb"}, ${profile.cover_color || "#2563eb"}99)` }} />
                      <div className={`px-4 pb-3 text-center ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
                        <div className="flex justify-center -mt-5 mb-1.5">
                          {profile.profile_photo
                            ? <img src={profile.profile_photo} className={`w-10 h-10 rounded-full border-3 shadow object-cover ${isDark ? "border-slate-800" : "border-slate-50"}`} style={{ borderWidth: "3px" }} alt="" />
                            : <div className="w-10 h-10 rounded-full shadow flex items-center justify-center font-black text-white text-base" style={{ background: profile.cover_color || "#2563eb", border: isDark ? "3px solid #1e293b" : "3px solid #f8fafc" }}>{profile.display_name?.charAt(0)}</div>
                          }
                        </div>
                        <p className={`font-bold text-sm ${headText}`}>{profile.display_name}</p>
                        <p className="text-xs font-semibold" style={{ color: profile.cover_color || "#3b82f6" }}>{profile.job_title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 gap-1.5 text-xs text-white font-bold shadow-md shadow-blue-500/20" size="sm">
                          <Eye className="w-3.5 h-3.5" /> View Live
                        </Button>
                      </a>
                      <Button size="sm" onClick={() => setTab("profile")}
                        className={`rounded-xl gap-1.5 font-bold text-xs ${isDark ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40" : "bg-slate-800 hover:bg-slate-700 text-white shadow-md"}`}>
                        <Settings className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-4 pb-6 pt-2">
                    <User className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                    <p className={`font-semibold text-sm ${subText}`}>No profile yet</p>
                    <p className={`text-xs mt-1 mb-3 ${mutedText}`}>Create your digital card to get started.</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={launchAI} size="sm" className="rounded-xl bg-gradient-to-r from-[#0B2E6B] to-[#1a4a9e] hover:opacity-90 text-white font-bold gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Build with AI
                      </Button>
                      <Button onClick={() => setTab("profile")} size="sm" variant="outline" className="rounded-xl font-bold">Manual</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className={`rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
                <div className="p-4 pb-2">
                  <p className={`font-bold text-sm ${headText}`}>QR Code</p>
                </div>
                {qrUrl ? (
                  <div className="text-center px-4 pb-4">
                    <div className={`rounded-2xl p-3 inline-block ${isDark ? "bg-slate-800/70" : "bg-slate-100"}`}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`}
                        alt="QR Code" className="w-36 h-36 mx-auto rounded-lg" />
                    </div>
                    <p className={`text-xs mt-2.5 ${mutedText}`}>Scan to open your profile</p>
                    <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer" className="inline-block mt-2.5">
                      <Button size="sm" className={`rounded-xl gap-1.5 text-xs font-bold ${isDark ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-900/30" : "bg-slate-800 hover:bg-slate-700 text-white"}`}>
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <QrCode className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                    <p className={`text-sm ${mutedText}`}>Create a profile first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            {leads.length > 0 && (
              <div className={`rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between p-4 pb-3">
                  <p className={`font-bold text-sm ${headText}`}>Recent Leads</p>
                  <button onClick={() => setTab("leads")} className="text-xs text-blue-500 font-semibold hover:text-blue-400 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-4 pb-4 space-y-1.5">
                  {leads.slice(0, 3).map(l => (
                    <div key={l.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-white/4 hover:bg-white/7" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                        {l.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-sm ${headText}`}>{l.name || "Anonymous"}</p>
                        <p className={`text-xs truncate ${mutedText}`}>{l.email || l.phone || "No contact"}</p>
                      </div>
                      <p className={`text-xs flex-shrink-0 ${mutedText}`}>{l.created_date?.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {profile?.plan === "free" && (
              <div className="relative rounded-2xl p-5 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", border: "1px solid rgba(255,122,0,0.3)", boxShadow: "0 8px 32px rgba(11,46,107,0.3)" }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(255,122,0,0.15)" }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-black mb-0.5 text-white">Unlock Full Power 🚀</h3>
                    <p className="text-sm text-white/60">Pro analytics, lead capture, booking & unlimited devices.</p>
                  </div>
                  <Link to="/plans" className="flex-shrink-0">
                    <Button className="rounded-xl font-bold gap-2 text-white border-none"
                      style={{ background: "#FF7A00" }}>
                      View Plans <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

          {tab === "profile"      && <ProfileEditor user={user} editProfileId={selectedProfileId} prefillData={aiGeneratedProfile} onSaved={() => { setAiGeneratedProfile(null); refetchProfiles(); setTab("overview"); }} />}
          {tab === "appointments" && (
            <FeatureGate feature="appointment_booking">
              <AppointmentsPanel profileId={profile?.id} />
            </FeatureGate>
          )}
          {tab === "calendar"     && (
            <FeatureGate feature="appointment_booking">
              <CalendarView profileId={profile?.id} />
            </FeatureGate>
          )}
          {tab === "leads"        && (
            <FeatureGate feature="lead_collection">
              <LeadsPanel profileId={profile?.id} />
            </FeatureGate>
          )}
          {tab === "devices"      && (
            <FeatureGate feature="nfc_devices">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link to="/activate-device">
                    <Button className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-2">
                      <Smartphone className="w-4 h-4" /> Activate Device
                    </Button>
                  </Link>
                </div>
                <DevicesPanel profileId={profile?.id} />
              </div>
            </FeatureGate>
          )}
          {tab === "analytics"    && (
            <FeatureGate feature="analytics">
              <AnalyticsPanel profileId={profile?.id} />
            </FeatureGate>
          )}
          {tab === "portfolio"    && <PortfolioPanel profileId={profile?.id} user={user} />}
          {tab === "design"       && <DesignTab profile={profile} user={user} />}
          {tab === "appt_settings" && <AppointmentSettings profileId={profile?.id} />}
          {tab === "resumes"      && <ResumePanel user={user} />}

        </div>
      </div>

      {/* Layout Picker Modal */}
      {showLayoutPicker && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? "bg-[#13162a] border border-white/10" : "bg-white border border-slate-200"}`}>
            <div className={`p-6 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-black ${headText}`}>Profile Style</h2>
                  <p className={`text-sm mt-0.5 ${mutedText}`}>Choose a layout for your public page</p>
                </div>
                <button onClick={() => setShowLayoutPicker(false)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"}`}>✕</button>
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
                plan={profile?.plan || "free"}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          </div>
        </div>
      )}
    </BingooLayout>
  );
}