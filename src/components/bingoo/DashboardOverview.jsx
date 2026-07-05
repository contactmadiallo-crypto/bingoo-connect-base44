import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProfileCompletionWidget from "@/components/bingoo/ProfileCompletionWidget";
import PushNotificationToggle from "@/components/bingoo/PushNotificationToggle";
import {
  Eye, BarChart3, Star, CalendarDays, Palette, Settings, User, Zap,
  Download, QrCode, ArrowRight,
} from "lucide-react";

export default function DashboardOverview({
  profile, user, isDark, analytics, leads, appointments, myNfcDevices,
  salonServices, teamMembers, tr, setTab, copied, copyLink,
  profileAbsoluteUrl, profileUrl, profileQrUrl, qrUrl, downloadBrandedQR,
  launchAI, setShowLayoutPicker, totalViews, totalClicks, totalNfcTaps,
  totalQrScans, totalWhatsApp, leadsThisMonth, apptsThisMonth, monthLabel,
  isFreeIndividual,
}) {
  // Hide business/pro shortcuts for explicit Individual Free users
  const showBusinessWidgets = !isFreeIndividual;

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const cardCls = `rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`;
  const cardShadow = isDark
    ? { boxShadow: "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" }
    : { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" };
  const rowHover = isDark ? "bg-white/[0.04] hover:bg-white/[0.07]" : "bg-slate-50 hover:bg-slate-100";

  const activeNfc = myNfcDevices.filter(d => d.status === "active");
  const recentNfcEvents = analytics
    .filter(a => a.event_type === "nfc_tap")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div className="space-y-5">

      {/* ── This Month Hero Cards — Business/Pro only ── */}
      {profile && showBusinessWidgets && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setTab("leads")}
            className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)", boxShadow: "0 4px 20px rgba(255,122,0,0.3)" }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(255,255,255,0.15)" }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">{monthLabel}</p>
            <p className="text-3xl font-black text-white">{leadsThisMonth}</p>
            <p className="text-sm font-semibold text-white/80 mt-0.5">New Leads</p>
            <p className="text-[11px] text-white/50 mt-1">{leads.length} total · Tap to manage</p>
          </button>
          <button onClick={() => setTab("appointments")}
            className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", boxShadow: "0 4px 20px rgba(11,46,107,0.35)", border: "1px solid rgba(255,122,0,0.2)" }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(255,122,0,0.12)" }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{monthLabel}</p>
            <p className="text-3xl font-black text-white">{apptsThisMonth}</p>
            <p className="text-sm font-semibold text-white/80 mt-0.5">Appointments</p>
            <p className="text-[11px] text-white/40 mt-1">{appointments.filter(a => a.status === "pending").length} pending · Tap to manage</p>
          </button>
        </div>
      )}

      {/* ── Core Metrics — filtered by plan ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Profile Views", value: totalViews,    icon: Eye,         gradient: "from-blue-500 to-blue-600",    shadow: isDark ? "shadow-blue-900/40" : "shadow-blue-200",    tab: "analytics", always: true  },
          { label: "NFC Taps",      value: totalNfcTaps,  icon: BarChart3,   gradient: "from-violet-500 to-violet-600", shadow: isDark ? "shadow-violet-900/40" : "shadow-violet-200", tab: "analytics", always: false },
          { label: "QR Scans",      value: totalQrScans,  icon: Star,        gradient: "from-cyan-500 to-cyan-600",    shadow: isDark ? "shadow-cyan-900/40" : "shadow-cyan-200",     tab: "analytics", always: false },
          { label: "Total Leads",   value: leads.length,  icon: CalendarDays, gradient: "from-amber-500 to-amber-600", shadow: isDark ? "shadow-amber-900/40" : "shadow-amber-200",   tab: "leads",     always: false },
        ].filter(s => s.always || showBusinessWidgets).map(s => (
          <button key={s.label} onClick={() => setTab(s.tab)}
            className={`relative rounded-2xl p-3 sm:p-4 overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isDark ? "bg-white/5 hover:bg-white/7" : "bg-white hover:shadow-md"}`}
            style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
            <div className={`w-8 h-8 rounded-xl mb-2.5 flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-md ${s.shadow}`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className={`text-xl font-black tracking-tight ${headText}`}>{s.value}</p>
            <p className={`text-[11px] mt-0.5 font-medium ${mutedText}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── Engagement Row — Business/Pro only ── */}
      {profile && showBusinessWidgets && (
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: "📲", label: "Active NFC",     value: activeNfc.length, color: "#8b5cf6", bg: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)", tab: null, href: "/my-nfc-devices" },
            { icon: "💬", label: "WhatsApp Clicks", value: totalWhatsApp,   color: "#25D366", bg: isDark ? "rgba(37,211,102,0.12)" : "rgba(37,211,102,0.08)", tab: "analytics" },
            { icon: "📅", label: "Pending Appts",  value: appointments.filter(a => a.status === "pending").length, color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)", tab: "appointments" },
          ].map(s => {
            const Tag = s.href ? "a" : "button";
            const extra = s.href ? { href: s.href } : { onClick: () => s.tab && setTab(s.tab) };
            return (
              <Tag key={s.label} {...extra}
                className="rounded-2xl p-3 flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02] text-left"
                style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                <span className="text-lg">{s.icon}</span>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wide ${mutedText}`}>{s.label}</p>
              </Tag>
            );
          })}
        </div>
      )}

      {/* ── Profile Completion ── */}
      {profile && (
        <ProfileCompletionWidget
          profile={profile}
          extraData={{
            hasServices: salonServices.length > 0,
            hasTeam: teamMembers.length > 0,
            hasNfc: myNfcDevices.some(d => d.status === "active"),
          }}
          onNavigate={setTab}
        />
      )}

      {/* ── Profile Card + QR ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className={cardCls} style={cardShadow}>
          <div className="flex items-center justify-between p-4 pb-3">
            <p className={`font-bold text-sm ${headText}`}>{tr.yourProfile}</p>
            {profile && (
              <button onClick={() => setShowLayoutPicker(true)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-500"}`}>
                <Palette className="w-3.5 h-3.5" /> {tr.style}
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
                      ? <img src={profile.profile_photo} className={`w-10 h-10 rounded-full shadow object-cover`} style={{ border: isDark ? "3px solid #1e293b" : "3px solid #f8fafc" }} alt="" />
                      : <div className="w-10 h-10 rounded-full shadow flex items-center justify-center font-black text-white text-base" style={{ background: profile.cover_color || "#2563eb", border: isDark ? "3px solid #1e293b" : "3px solid #f8fafc" }}>{profile.display_name?.charAt(0)}</div>
                    }
                  </div>
                  <p className={`font-bold text-sm ${headText}`}>{profile.display_name}</p>
                  <p className="text-xs font-semibold" style={{ color: profile.cover_color || "#3b82f6" }}>{profile.job_title}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a href={profileAbsoluteUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 gap-1.5 text-xs text-white font-bold shadow-md shadow-blue-500/20" size="sm">
                    <Eye className="w-3.5 h-3.5" /> {tr.viewLive}
                  </Button>
                </a>
                <Button size="sm" onClick={() => setTab("profile")}
                  className={`rounded-xl gap-1.5 font-bold text-xs ${isDark ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40" : "bg-slate-800 hover:bg-slate-700 text-white shadow-md"}`}>
                  <Settings className="w-3.5 h-3.5" /> Profile Studio
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center px-4 pb-6 pt-2">
              <User className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
              <p className={`font-semibold text-sm ${subText}`}>{tr.noProfile}</p>
              <p className={`text-xs mt-1 mb-3 ${mutedText}`}>{tr.createCard}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={launchAI} size="sm" className="rounded-xl bg-gradient-to-r from-[#0B2E6B] to-[#1a4a9e] hover:opacity-90 text-white font-bold gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {tr.buildAI}
                </Button>
                <Button onClick={() => setTab("profile")} size="sm" variant="outline" className={`rounded-xl font-bold ${isDark ? "border-white/15 text-white/70 hover:bg-white/10" : ""}`}>{tr.manual}</Button>
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className={cardCls} style={cardShadow}>
          <div className="p-4 pb-2">
            <p className={`font-bold text-sm ${headText}`}>{tr.qrCode}</p>
          </div>
          {qrUrl ? (
            <div className="text-center px-4 pb-4">
              <div className={`rounded-2xl p-3 inline-block ${isDark ? "bg-slate-800/70" : "bg-slate-100"}`}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileQrUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`}
                  alt="QR Code" className="w-36 h-36 mx-auto rounded-lg" />
              </div>
              <p className={`text-xs mt-2.5 ${mutedText}`}>{tr.scanQr}</p>
              <Button onClick={downloadBrandedQR} size="sm"
                className={`rounded-xl gap-1.5 text-xs font-bold mt-2.5 ${isDark ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-900/30" : "bg-slate-800 hover:bg-slate-700 text-white"}`}>
                <Download className="w-3.5 h-3.5" /> {tr.download}
              </Button>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <QrCode className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
              <p className={`text-sm ${mutedText}`}>{tr.createFirst}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Leads + Appointments — Business/Pro only ── */}
      {showBusinessWidgets && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Leads */}
          <div className={cardCls} style={cardShadow}>
            <div className="flex items-center justify-between p-4 pb-3">
              <p className={`font-bold text-sm ${headText}`}>{tr.recentLeads}</p>
              <button onClick={() => setTab("leads")} className="text-xs text-amber-500 font-semibold hover:text-amber-400 flex items-center gap-1">
                {tr.viewAll} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {leads.length > 0 ? (
              <div className="px-4 pb-4 space-y-1.5">
                {leads.slice(0, 4).map(l => (
                  <div key={l.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${rowHover}`} onClick={() => setTab("leads")}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                      {l.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-xs ${headText}`}>{l.name || "Anonymous"}</p>
                      <p className={`text-xs truncate ${mutedText}`}>{l.email || l.phone || "No contact"}</p>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 px-2 py-0.5 rounded-full font-bold ${
                      l.status === "new" ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-700") :
                      l.status === "retained" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") :
                      (isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")
                    }`}>{l.status || "new"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 px-4 ${mutedText}`}>
                <Star className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                <p className="text-xs font-semibold">No leads yet</p>
                <p className="text-xs mt-1">They'll appear here when visitors contact you</p>
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          <div className={cardCls} style={cardShadow}>
            <div className="flex items-center justify-between p-4 pb-3">
              <p className={`font-bold text-sm ${headText}`}>Recent Appointments</p>
              <button onClick={() => setTab("appointments")} className="text-xs text-emerald-500 font-semibold hover:text-emerald-400 flex items-center gap-1">
                {tr.viewAll} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {appointments.length > 0 ? (
              <div className="px-4 pb-4 space-y-1.5">
                {appointments.slice(0, 4).map(a => (
                  <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${rowHover}`} onClick={() => setTab("appointments")}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                      {a.visitor_name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-xs ${headText}`}>{a.visitor_name || "Guest"}</p>
                      <p className={`text-xs truncate ${mutedText}`}>{a.date} · {a.time_slot}</p>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 px-2 py-0.5 rounded-full font-bold ${
                      a.status === "confirmed" || a.status === "accepted" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") :
                      a.status === "pending" ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-700") :
                      (isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500")
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 px-4 ${mutedText}`}>
                <CalendarDays className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                <p className="text-xs font-semibold">No appointments yet</p>
                <p className="text-[11px] mt-1">Enable booking in the Appointments tab</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recent NFC Activity — Business/Pro only ── */}
      {showBusinessWidgets && (
        <div className={cardCls} style={cardShadow}>
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📲</span>
              <p className={`font-bold text-sm ${headText}`}>Recent NFC Activity</p>
            </div>
            <a href="/my-nfc-devices" className={`text-xs font-semibold flex items-center gap-1 ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-500"}`}>
              Manage Devices <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className={`rounded-xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wide ${mutedText}`}>Active Devices</p>
                <p className={`text-2xl font-black mt-0.5 ${isDark ? "text-violet-400" : "text-violet-600"}`}>{activeNfc.length}</p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wide ${mutedText}`}>Total NFC Taps</p>
                <p className={`text-2xl font-black mt-0.5 ${isDark ? "text-violet-400" : "text-violet-600"}`}>{totalNfcTaps}</p>
              </div>
            </div>
            {recentNfcEvents.length > 0 ? (
              <div className="space-y-1.5">
                {recentNfcEvents.map((e, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                    <span className="text-base">📲</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${headText}`}>NFC Tap</p>
                      <p className={`text-xs ${mutedText}`}>{e.visitor_device || "Unknown device"}</p>
                    </div>
                    <p className={`text-xs ${mutedText}`}>{e.created_at?.slice(0, 10)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-4 rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                <p className={`text-xs ${mutedText}`}>No NFC taps yet — share your device link to start tracking</p>
              </div>
            )}
            {activeNfc.length === 0 && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl"
                style={{ background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)", border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"}` }}>
                <span className="text-lg flex-shrink-0">📦</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs ${headText}`}>No NFC Device Yet</p>
                  <p className={`text-xs ${mutedText}`}>Tap to share your profile instantly with any smartphone.</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <a href="/my-nfc-devices">
                    <button className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all text-white" style={{ background: "#8b5cf6" }}>Activate</button>
                  </a>
                  <Link to="/shop">
                    <button className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all border ${isDark ? "border-violet-400/30 text-violet-400 hover:bg-violet-400/10" : "border-violet-300 text-violet-600 hover:bg-violet-50"}`}>Order</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Push Notifications ── */}
      {profile && (
        <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 ${isDark ? "bg-white/5" : "bg-white"}`}
          style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div>
            <p className={`font-bold text-sm ${headText}`}>{tr.pushNotifs}</p>
            <p className={`text-xs mt-0.5 ${mutedText}`}>{tr.pushDesc}</p>
          </div>
          <PushNotificationToggle profileId={profile.id} darkMode={isDark} />
        </div>
      )}

      {/* ── Upgrade CTA ── */}
      {profile?.plan === "free" && (
        <div className="relative rounded-2xl p-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", border: "1px solid rgba(255,122,0,0.3)", boxShadow: "0 8px 32px rgba(11,46,107,0.3)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(255,122,0,0.15)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-black mb-0.5 text-white">{tr.unlockPower}</h3>
              <p className="text-sm text-white/60">{tr.unlockDesc}</p>
            </div>
            <Link to="/plans" className="flex-shrink-0">
              <Button className="rounded-xl font-bold gap-2 text-white border-none" style={{ background: "#FF7A00" }}>
                {tr.viewPlans} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}