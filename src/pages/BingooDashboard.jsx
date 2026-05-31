import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ProfileEditor from "@/components/bingoo/ProfileEditor";
import LeadsPanel from "@/components/bingoo/LeadsPanel";
import DevicesPanel from "@/components/bingoo/DevicesPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import { Eye, Copy, Check, ExternalLink, BarChart3, Star, Smartphone, User, Settings, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "profile", label: "Edit Profile", icon: Settings },
  { id: "leads", label: "Leads", icon: Star },
  { id: "devices", label: "My Devices", icon: Smartphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function BingooDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
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

  const profile = profiles[0];
  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&color=1e293b`
    : null;

  const totalViews = analytics.filter(a => a.event_type === "profile_view").length;
  const totalClicks = analytics.filter(a => a.event_type !== "profile_view").length;

  return (
    <BingooLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Hello, {user?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          {profile ? (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-slate-500 text-sm">Your profile:</span>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                /p/{profile.username} <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={copyLink} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg px-2.5 py-1.5 transition-colors font-semibold">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-1">Set up your profile to get your shareable link.</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.id === "leads" && leads.length > 0 && <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">{leads.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Profile Views", value: totalViews, icon: Eye, color: "blue" },
                { label: "Link Clicks", value: totalClicks, icon: BarChart3, color: "purple" },
                { label: "Leads", value: leads.length, icon: Star, color: "amber" },
                { label: "Profile Status", value: profile?.is_active ? "Active" : "Inactive", icon: User, color: "green" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${s.color}-50`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile card + QR */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Your Public Profile</h3>
                {profile ? (
                  <>
                    <div className="rounded-xl overflow-hidden border border-slate-100 max-w-xs mx-auto">
                      <div className="h-16" style={{ background: profile.cover_color || "#2563eb" }} />
                      <div className="bg-white px-4 pb-4 text-center">
                        <div className="flex justify-center -mt-6 mb-2">
                          {profile.profile_photo
                            ? <img src={profile.profile_photo} className="w-12 h-12 rounded-full border-4 border-white shadow object-cover" alt="" />
                            : <div className="w-12 h-12 rounded-full border-4 border-white shadow flex items-center justify-center font-black text-white text-lg" style={{ background: profile.cover_color || "#2563eb" }}>{profile.display_name?.charAt(0)}</div>
                          }
                        </div>
                        <p className="font-black text-slate-900">{profile.display_name}</p>
                        <p className="text-xs text-blue-600 font-semibold">{profile.job_title}</p>
                        <p className="text-xs text-slate-400">{profile.company_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" size="sm"><Eye className="w-4 h-4" /> View Live</Button>
                      </a>
                      <Button variant="outline" size="sm" onClick={() => setTab("profile")} className="border-slate-200 gap-2">
                        <Settings className="w-4 h-4" /> Edit
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-600">No profile yet</p>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Create your digital profile to get started.</p>
                    <Button onClick={() => setTab("profile")} className="bg-blue-600 hover:bg-blue-700">Create Profile</Button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-4">QR Code</h3>
                {qrUrl ? (
                  <div className="text-center">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 inline-block shadow-sm">
                      <img src={qrUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Scan to open your profile</p>
                    <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="mt-3 border-slate-200 text-xs">Download QR</Button>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <div className="text-5xl mb-3 opacity-20">⬛</div>
                    <p className="text-sm">Create a profile first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent leads */}
            {leads.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Recent Leads</h3>
                  <button onClick={() => setTab("leads")} className="text-sm text-blue-600 font-semibold hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {leads.slice(0,3).map(l => (
                    <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm flex-shrink-0">{l.name?.charAt(0) || "?"}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{l.name || "Anonymous"}</p>
                        <p className="text-slate-400 text-xs truncate">{l.email || l.phone || "No contact"}</p>
                      </div>
                      <p className="text-slate-400 text-xs ml-auto flex-shrink-0">{l.created_date?.slice(0,10)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade CTA for free users */}
            {profile?.plan === "free" && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-black mb-1">Unlock Full Power 🚀</h3>
                <p className="text-blue-100 text-sm mb-4">Upgrade to Pro for full analytics, lead collection, unlimited links and more.</p>
                <Link to="/pricing"><Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold">View Plans</Button></Link>
              </div>
            )}
          </div>
        )}

        {tab === "profile" && <ProfileEditor user={user} onSaved={() => setTab("overview")} />}
        {tab === "leads" && <LeadsPanel profileId={profile?.id} />}
        {tab === "devices" && <DevicesPanel profileId={profile?.id} />}
        {tab === "analytics" && <AnalyticsPanel profileId={profile?.id} />}
      </div>
    </BingooLayout>
  );
}