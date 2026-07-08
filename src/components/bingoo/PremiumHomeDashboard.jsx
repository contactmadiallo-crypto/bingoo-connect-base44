import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Share2, Smartphone, BarChart3, Settings,
  CalendarDays, Users, Eye, ArrowRight,
  Check, QrCode, Zap,
} from "lucide-react";
import BingooLoadingDots from "@/components/bingoo/ui/BingooLoadingDots";

const PLAN_LABELS = {
  free: "Free", professional: "Professional", pro: "Professional",
  salon: "Salon", lawfirm: "Law Firm", business: "Business", corporate: "Corporate",
};

export default function PremiumHomeDashboard({
  profile, user, isDark, leads, appointments, analytics, nfcDevices,
  plan, canAccessFeature, onNavigate, profileUrl, isLoading,
}) {
  const [copied, setCopied] = useState(false);

  // ── Computed stats ──
  const totalViews   = analytics.filter(a => a.event_type === "profile_view").length;
  const totalNfcTaps = analytics.filter(a => a.event_type === "nfc_tap").length;
  const totalQrScans = analytics.filter(a => a.event_type === "qr_scan").length;

  const now = new Date();
  const todayStr    = now.toISOString().slice(0, 10);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLabel  = now.toLocaleDateString("en", { month: "short" });

  const leadsThisMonth = leads.filter(l => l.created_date && new Date(l.created_date) >= startOfMonth).length;
  const apptsThisMonth = appointments.filter(a => a.created_date && new Date(a.created_date) >= startOfMonth).length;
  const todayAppts = appointments
    .filter(a => a.date === todayStr)
    .sort((a, b) => (a.time_slot || "").localeCompare(b.time_slot || ""));
  const latestLeads = [...leads]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 4);
  const activeNfc = nfcDevices.filter(d => d.status === "active");
  const hasBusiness = canAccessFeature ? canAccessFeature("leads") : false;
  const planLabel   = PLAN_LABELS[plan] || "Free";
  const isFree      = plan === "free";

  const handleShare = () => {
    if (!profileUrl) return;
    navigator.clipboard?.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Style tokens ──
  const head     = isDark ? "text-white" : "text-slate-900";
  const muted    = isDark ? "text-white/40" : "text-slate-400";
  const sub      = isDark ? "text-white/60" : "text-slate-600";
  const card     = `rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`;
  const shadow   = isDark
    ? { boxShadow: "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" }
    : { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" };
  const rowHover = isDark ? "bg-white/[0.04] hover:bg-white/[0.07]" : "bg-slate-50 hover:bg-slate-100";

  // ── Quick actions ──
  const quickActions = [
    { icon: Share2,      label: "Share",    color: "#FF7A00", onClick: handleShare },
    { icon: BarChart3,   label: "Analytics", color: "#3b82f6", onClick: () => onNavigate("analytics") },
    { icon: Smartphone,  label: "NFC",       color: "#8b5cf6", href: "/activate-device" },
    { icon: Users,       label: "Leads",     color: "#f59e0b", onClick: () => onNavigate("leads") },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <BingooLoadingDots />
        <p className={`text-xs font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Profile Summary ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: shadow.boxShadow }}>
        <div className="h-20" style={{ background: `linear-gradient(135deg, ${profile.cover_color || "#0B2E6B"}, ${profile.cover_color || "#0B2E6B"}cc)` }} />
        <div className={`px-4 pb-4 ${isDark ? "bg-white/5" : "bg-white"}`}>
          <div className="flex items-end gap-3 -mt-8">
            {profile.profile_photo
              ? <img src={profile.profile_photo} className="w-16 h-16 rounded-2xl object-cover shadow-lg flex-shrink-0" style={{ border: `3px solid ${isDark ? "#1e293b" : "#fff"}` }} alt="" />
              : <div className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center font-black text-white text-xl flex-shrink-0" style={{ background: profile.cover_color || "#0B2E6B", border: `3px solid ${isDark ? "#1e293b" : "#fff"}` }}>{profile.display_name?.charAt(0)}</div>
            }
            <div className="flex-1 min-w-0 pb-1">
              <h2 className={`font-black text-base leading-tight ${head}`}>{profile.display_name}</h2>
              <p className={`text-xs font-semibold ${sub}`}>{profile.job_title || profile.company_name || ""}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white flex-shrink-0"
              style={{ background: isFree ? "#64748b" : "#FF7A00" }}>
              {planLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map(a => {
          const inner = (
            <div className={`rounded-2xl p-3 flex flex-col items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] ${isDark ? "bg-white/5 hover:bg-white/8" : "bg-white hover:shadow-md"}`} style={{ boxShadow: shadow.boxShadow }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${a.color}18` }}>
                {a.label === "Share" && copied
                  ? <Check className="w-4 h-4" style={{ color: "#22C55E" }} />
                  : <a.icon className="w-4 h-4" style={{ color: a.color }} />
                }
              </div>
              <span className={`text-[11px] font-bold ${sub}`}>{a.label === "Share" && copied ? "Copied!" : a.label}</span>
            </div>
          );
          return a.href
            ? <Link key={a.label} to={a.href}>{inner}</Link>
            : <button key={a.label} onClick={a.onClick}>{inner}</button>;
        })}
      </div>

      {/* ── Core Metrics ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Views",    value: totalViews,   icon: Eye,           color: "#3b82f6" },
          { label: "NFC Taps", value: totalNfcTaps, icon: Smartphone,    color: "#8b5cf6" },
          { label: "QR Scans", value: totalQrScans, icon: QrCode,        color: "#06b6d4" },
        ].map(s => (
          <div key={s.label} className={card} style={{ boxShadow: shadow.boxShadow }}>
            <div className="p-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}18` }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <p className={`text-xl font-black ${head}`}>{s.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── This Month (business/pro only) ── */}
      {hasBusiness && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate("leads")}
            className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)", boxShadow: "0 4px 20px rgba(255,122,0,0.3)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">{monthLabel}</p>
            <p className="text-3xl font-black text-white">{leadsThisMonth}</p>
            <p className="text-xs font-bold text-white/80">New Leads</p>
          </button>
          <button onClick={() => onNavigate("appointments")}
            className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", boxShadow: "0 4px 20px rgba(11,46,107,0.35)", border: "1px solid rgba(255,122,0,0.2)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{monthLabel}</p>
            <p className="text-3xl font-black text-white">{apptsThisMonth}</p>
            <p className="text-xs font-bold text-white/80">Appointments</p>
          </button>
        </div>
      )}

      {/* ── Today's Appointments ── */}
      {hasBusiness && (
        <div className={card} style={{ boxShadow: shadow.boxShadow }}>
          <div className="flex items-center justify-between p-4 pb-3">
            <p className={`font-bold text-sm ${head}`}>Today's Appointments</p>
            <button onClick={() => onNavigate("appointments")} className={`text-xs font-semibold flex items-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {todayAppts.length > 0 ? (
            <div className="px-4 pb-4 space-y-1.5">
              {todayAppts.map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${rowHover}`}>
                  <div className="text-xs font-black text-emerald-500 flex-shrink-0 w-12">{a.time_slot}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs ${head}`}>{a.visitor_name}</p>
                    <p className={`text-xs truncate ${muted}`}>{a.service_name || "Appointment"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    a.status === "confirmed" || a.status === "accepted" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") :
                    a.status === "pending" ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-700") :
                    (isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 px-4 ${muted}`}>
              <CalendarDays className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
              <p className="text-xs font-semibold">No appointments today</p>
              <p className="text-[11px] mt-1">Enjoy the calm — or share your profile to get bookings</p>
            </div>
          )}
        </div>
      )}

      {/* ── Latest Leads ── */}
      {hasBusiness && (
        <div className={card} style={{ boxShadow: shadow.boxShadow }}>
          <div className="flex items-center justify-between p-4 pb-3">
            <p className={`font-bold text-sm ${head}`}>Latest Leads</p>
            <button onClick={() => onNavigate("leads")} className={`text-xs font-semibold flex items-center gap-1 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {latestLeads.length > 0 ? (
            <div className="px-4 pb-4 space-y-1.5">
              {latestLeads.map(l => (
                <div key={l.id} className={`flex items-center gap-3 p-3 rounded-xl ${rowHover}`} onClick={() => onNavigate("leads")}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                    {l.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs ${head}`}>{l.name || "Anonymous"}</p>
                    <p className={`text-xs truncate ${muted}`}>{l.email || l.phone || "No contact"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    l.status === "new" ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-700") :
                    l.status === "won" || l.status === "retained" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") :
                    (isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")
                  }`}>{l.status || "new"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 px-4 ${muted}`}>
              <Users className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
              <p className="text-xs font-semibold">No leads yet</p>
              <p className="text-[11px] mt-1">They'll appear here when visitors contact you</p>
            </div>
          )}
        </div>
      )}

      {/* ── Device Health ── */}
      <div className={card} style={{ boxShadow: shadow.boxShadow }}>
        <div className="flex items-center justify-between p-4 pb-3">
          <p className={`font-bold text-sm ${head}`}>Device Health</p>
          <Link to="/my-nfc-devices" className={`text-xs font-semibold flex items-center gap-1 ${isDark ? "text-violet-400" : "text-violet-600"}`}>
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`rounded-xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>Active Devices</p>
              <p className={`text-2xl font-black ${isDark ? "text-violet-400" : "text-violet-600"}`}>{activeNfc.length}</p>
            </div>
            <div className={`rounded-xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>Total NFC Taps</p>
              <p className={`text-2xl font-black ${isDark ? "text-violet-400" : "text-violet-600"}`}>{totalNfcTaps}</p>
            </div>
          </div>
          {activeNfc.length === 0 && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl"
              style={{ background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)", border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"}` }}>
              <span className="text-lg">📦</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-xs ${head}`}>No NFC Device Yet</p>
                <p className={`text-xs ${muted}`}>Tap to share your profile instantly</p>
              </div>
              <Link to="/shop" className="text-xs font-bold px-2.5 py-1 rounded-lg text-white flex-shrink-0" style={{ background: "#8b5cf6" }}>Order</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan Status / Upgrade CTA ── */}
      {isFree ? (
        <div className="relative rounded-2xl p-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", border: "1px solid rgba(255,122,0,0.3)", boxShadow: "0 8px 32px rgba(11,46,107,0.3)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(255,122,0,0.15)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h3 className="text-base font-black mb-0.5 text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" /> Unlock Premium
              </h3>
              <p className="text-sm text-white/60">Professional from $4.99/mo — NFC, analytics, leads & more</p>
            </div>
            <Link to="/plans" className="flex-shrink-0">
              <button className="rounded-xl font-bold text-sm px-5 py-2.5 text-white" style={{ background: "#FF7A00" }}>
                View Plans
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className={card} style={{ boxShadow: shadow.boxShadow }}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className={`font-bold text-sm ${head}`}>Plan Status</p>
              <p className={`text-xs mt-0.5 ${muted}`}>Your subscription is active</p>
            </div>
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-white" style={{ background: "#FF7A00" }}>
              {planLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}