import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ProfileEditor from "@/components/bingoo/ProfileEditor";
import LeadsPanel from "@/components/bingoo/LeadsPanel";
import DevicesPanel from "@/components/bingoo/DevicesPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import AppointmentsPanel from "@/components/bingoo/AppointmentsPanel";
import PortfolioPanel from "@/components/bingoo/PortfolioPanel";
import { Eye, Copy, Check, ExternalLink, BarChart3, Star, Smartphone, User, Settings, TrendingUp, CalendarDays, Zap, ArrowRight, Briefcase } from "lucide-react";
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
  { id: "portfolio",     label: "Portfolio",      icon: Briefcase,    color: "#8b5cf6" },
];

const STAT_CONFIGS = [
  { label: "Profile Views",   key: "views",   icon: Eye,       gradient: "from-blue-500 to-blue-600",   shadow: "shadow-blue-900/40" },
  { label: "Link Clicks",     key: "clicks",  icon: BarChart3, gradient: "from-violet-500 to-violet-600", shadow: "shadow-violet-900/40" },
  { label: "Leads Captured",  key: "leads",   icon: Star,      gradient: "from-amber-500 to-amber-600", shadow: "shadow-amber-900/40" },
  { label: "Profile Active",  key: "status",  icon: Zap,       gradient: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-900/40" },
];

export default function BingooDashboard() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (t) => setSearchParams(t === "overview" ? {} : { tab: t });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", profiles[0]?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profiles[0].id }),
    enabled: !!profiles[0]?.id,
  });
  const { data: analytics = [] } = useQuery({
    queryKey: ["analytics-all", profiles[0]?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profiles[0].id }),
    enabled: !!profiles[0]?.id,
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", profiles[0]?.id],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profiles[0].id }),
    enabled: !!profiles[0]?.id,
  });

  const profile = profiles[0];
  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=ffffff&bgcolor=1e293b`
    : null;

  const totalViews = analytics.filter(a => a.event_type === "profile_view").length;
  const totalClicks = analytics.filter(a => a.event_type !== "profile_view").length;

  const stats = {
    views: totalViews,
    clicks: totalClicks,
    leads: leads.length,
    status: profile?.is_active ? "Active" : "Inactive",
  };

  return (
    <BingooLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-6 md:p-8"
          style={{ background: "linear-gradient(135deg, #1a1f35 0%, #0f1628 50%, #1a1030 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* bg accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-white/40 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {user?.full_name?.split(" ")[0] || "there"} 👋
              </h1>
              {profile ? (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-white/30 text-sm">Profile:</span>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 text-sm font-bold hover:text-blue-300 flex items-center gap-1 transition-colors">
                    /p/{profile.username} <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={copyLink}
                    className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white/60 hover:text-white rounded-lg px-2.5 py-1.5 transition-all font-semibold">
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ) : (
                <p className="text-white/30 text-sm mt-2">Set up your profile to get started.</p>
              )}
            </div>
            {profile && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {profile.plan?.toUpperCase() || "FREE"} Plan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl p-1.5 mb-8 overflow-x-auto"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${tab === t.id ? "text-white shadow-lg" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
              style={tab === t.id ? { background: `${t.color}25`, color: t.color, boxShadow: `0 0 20px ${t.color}25` } : {}}>
              <t.icon className="w-4 h-4" style={tab === t.id ? { color: t.color } : {}} />
              {t.label}
              {t.id === "leads" && leads.length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5 text-xs">{leads.length}</span>
              )}
              {t.id === "appointments" && appointments.filter(a => a.status === "pending").length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 rounded-full px-1.5 py-0.5 text-xs">
                  {appointments.filter(a => a.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_CONFIGS.map(s => (
                <div key={s.label} className={`relative rounded-2xl p-5 overflow-hidden group cursor-default`}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow}`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats[s.key]}</p>
                  <p className="text-white/30 text-xs mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile card + QR */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-bold text-white mb-4">Your Public Profile</h3>
                {profile ? (
                  <>
                    <div className="rounded-xl overflow-hidden border border-white/10 max-w-xs mx-auto">
                      <div className="h-16" style={{ background: profile.cover_color || "#2563eb" }} />
                      <div className="px-4 pb-4 text-center" style={{ background: "#1a1f2e" }}>
                        <div className="flex justify-center -mt-6 mb-2">
                          {profile.profile_photo
                            ? <img src={profile.profile_photo} className="w-12 h-12 rounded-full border-4 shadow object-cover" style={{ borderColor: "#1a1f2e" }} alt="" />
                            : <div className="w-12 h-12 rounded-full border-4 shadow flex items-center justify-center font-black text-white text-lg" style={{ background: profile.cover_color || "#2563eb", borderColor: "#1a1f2e" }}>{profile.display_name?.charAt(0)}</div>
                          }
                        </div>
                        <p className="font-black text-white">{profile.display_name}</p>
                        <p className="text-xs font-semibold" style={{ color: profile.cover_color || "#3b82f6" }}>{profile.job_title}</p>
                        <p className="text-xs text-white/30">{profile.company_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2 text-sm" size="sm">
                          <Eye className="w-4 h-4" /> View Live
                        </Button>
                      </a>
                      <Button variant="outline" size="sm" onClick={() => setTab("profile")}
                        className="border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 gap-2">
                        <Settings className="w-4 h-4" /> Edit
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <User className="w-12 h-12 mx-auto mb-3 text-white/10" />
                    <p className="font-semibold text-white/60">No profile yet</p>
                    <p className="text-sm text-white/30 mt-1 mb-4">Create your digital profile to get started.</p>
                    <Button onClick={() => setTab("profile")} className="bg-blue-600 hover:bg-blue-500">Create Profile</Button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-bold text-white mb-4">QR Code</h3>
                {qrUrl ? (
                  <div className="text-center">
                    <div className="rounded-2xl p-4 inline-block" style={{ background: "#1e293b" }}>
                      <img src={qrUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                    </div>
                    <p className="text-xs text-white/30 mt-3">Scan to open your profile</p>
                    <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="mt-3 border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs">Download QR</Button>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-3 opacity-10">⬛</div>
                    <p className="text-sm text-white/30">Create a profile first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent leads */}
            {leads.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Recent Leads</h3>
                  <button onClick={() => setTab("leads")} className="text-sm text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {leads.slice(0,3).map(l => (
                    <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">{l.name?.charAt(0) || "?"}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm">{l.name || "Anonymous"}</p>
                        <p className="text-white/30 text-xs truncate">{l.email || l.phone || "No contact"}</p>
                      </div>
                      <p className="text-white/20 text-xs ml-auto flex-shrink-0">{l.created_date?.slice(0,10)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA */}
            {profile?.plan === "free" && (
              <div className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a237e22, #1a0a3022)", border: "1px solid rgba(99,102,241,0.3)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-1">Unlock Full Power 🚀</h3>
                    <p className="text-white/40 text-sm">Upgrade to Pro for full analytics, lead collection, unlimited links and more.</p>
                  </div>
                  <Link to="/pricing" className="flex-shrink-0">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-blue-900/40 gap-2">
                      View Plans <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "profile"      && <ProfileEditor user={user} onSaved={() => setTab("overview")} />}
        {tab === "appointments" && <AppointmentsPanel profileId={profile?.id} />}
        {tab === "leads"        && <LeadsPanel profileId={profile?.id} />}
        {tab === "devices"      && <DevicesPanel profileId={profile?.id} />}
        {tab === "analytics"    && <AnalyticsPanel profileId={profile?.id} />}
        {tab === "portfolio"    && <PortfolioPanel profileId={profile?.id} />}
      </div>
    </BingooLayout>
  );
}