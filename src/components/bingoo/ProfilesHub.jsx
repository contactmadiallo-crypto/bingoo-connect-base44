import React, { useState } from "react";
import { Eye, Settings, QrCode, Plus, Zap, Copy, Check, ExternalLink, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProfilesHub({ profiles = [], user, isDark, onSelectProfile, onCreateNew, onLaunchAI }) {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedQR, setExpandedQR] = useState(null);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const cardBg = isDark ? "bg-white/[0.05]" : "bg-white";
  const cardBorder = isDark ? "border-white/[0.08]" : "border-slate-200/80";
  const cardShadow = isDark
    ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)";

  const copyLink = (profile) => {
    const url = `${window.location.origin}/p/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getQrUrl = (profile) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/p/${profile.username}?source=qr`)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`;

  const planColors = {
    free: { bg: isDark ? "rgba(100,116,139,0.15)" : "#f1f5f9", text: isDark ? "#94a3b8" : "#64748b" },
    pro: { bg: isDark ? "rgba(139,92,246,0.15)" : "#f5f3ff", text: isDark ? "#a78bfa" : "#7c3aed" },
    professional: { bg: isDark ? "rgba(139,92,246,0.15)" : "#f5f3ff", text: isDark ? "#a78bfa" : "#7c3aed" },
    salon: { bg: isDark ? "rgba(236,72,153,0.15)" : "#fdf2f8", text: isDark ? "#f472b6" : "#db2777" },
    restaurant: { bg: isDark ? "rgba(249,115,22,0.15)" : "#fff7ed", text: isDark ? "#fb923c" : "#ea580c" },
    lawfirm: { bg: isDark ? "rgba(30,58,138,0.25)" : "#eff6ff", text: isDark ? "#93c5fd" : "#1d4ed8" },
    business: { bg: isDark ? "rgba(16,185,129,0.15)" : "#ecfdf5", text: isDark ? "#34d399" : "#059669" },
    corporate: { bg: isDark ? "rgba(251,191,36,0.15)" : "#fffbeb", text: isDark ? "#fbbf24" : "#d97706" },
  };

  const getPlanStyle = (plan) => planColors[plan] || planColors.free;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${headText}`}>My Profiles</h2>
          <p className={`text-xs mt-0.5 ${mutedText}`}>{profiles.length} profile{profiles.length !== 1 ? "s" : ""} · select one to manage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLaunchAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={{
              background: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.07)",
              borderColor: isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.25)",
              color: isDark ? "#a78bfa" : "#7c3aed"
            }}>
            <Zap className="w-3.5 h-3.5" /> AI Builder
          </button>
          <button onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)", boxShadow: "0 4px 12px rgba(255,122,0,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> New Profile
          </button>
        </div>
      </div>

      {/* Profile Cards Grid */}
      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map(profile => {
            const planStyle = getPlanStyle(profile.plan);
            const profileUrl = `${window.location.origin}/p/${profile.username}`;
            return (
              <div key={profile.id}
                className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.01] hover:shadow-lg`}
                style={{ boxShadow: cardShadow }}>
                {/* Cover */}
                <div className="h-20 relative"
                  style={{ background: `linear-gradient(135deg, ${profile.cover_color || "#2563eb"}, ${profile.cover_color || "#2563eb"}bb)` }}>
                  <div className="absolute inset-0 opacity-20"
                    style={{ background: "radial-gradient(circle at 80% 20%, white, transparent 60%)" }} />
                  {/* Plan badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: planStyle.bg, color: planStyle.text }}>
                      {profile.plan || "free"}
                    </span>
                  </div>
                  {/* Active indicator */}
                  {profile.is_active && (
                    <div className="absolute top-3 left-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-semibold text-white/70">Live</span>
                    </div>
                  )}
                </div>

                {/* Avatar + Info */}
                <div className="px-4 pb-3">
                  <div className="flex items-end gap-3 -mt-5 mb-3">
                    {profile.profile_photo
                      ? <img src={profile.profile_photo} className="w-12 h-12 rounded-2xl object-cover shadow-md flex-shrink-0"
                          style={{ border: isDark ? "3px solid #1e293b" : "3px solid white" }} alt="" />
                      : <div className="w-12 h-12 rounded-2xl shadow-md flex items-center justify-center font-black text-white text-base flex-shrink-0"
                          style={{ background: profile.cover_color || "#2563eb", border: isDark ? "3px solid #1e293b" : "3px solid white" }}>
                          {profile.display_name?.charAt(0) || "?"}
                        </div>
                    }
                    <div className="flex-1 min-w-0 pb-1">
                      <p className={`font-bold text-sm truncate ${headText}`}>{profile.display_name}</p>
                      <p className={`text-xs truncate ${mutedText}`}>/{profile.username}</p>
                    </div>
                  </div>

                  {profile.job_title && (
                    <p className={`text-xs font-semibold truncate mb-3 ${subText}`}>{profile.job_title}{profile.company_name ? ` · ${profile.company_name}` : ""}</p>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectProfile(profile.id, "overview")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ background: "#0B2E6B" }}>
                      <Settings className="w-3.5 h-3.5" /> Manage
                    </button>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center justify-center gap-1 w-9 h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.07)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.2)",
                        color: isDark ? "#93c5fd" : "#2563eb"
                      }}>
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedQR(expandedQR === profile.id ? null : profile.id); }}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.07)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.2)",
                        color: isDark ? "#a78bfa" : "#6366f1"
                      }}>
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyLink(profile); }}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.07)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.2)",
                        color: isDark ? "#34d399" : "#059669"
                      }}>
                      {copiedId === profile.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* QR Expanded */}
                  {expandedQR === profile.id && (
                    <div className={`mt-3 pt-3 border-t text-center ${isDark ? "border-white/8" : "border-slate-100"}`}>
                      <img src={getQrUrl(profile)} alt="QR" className="w-28 h-28 mx-auto rounded-xl" />
                      <p className={`text-[10px] mt-1.5 ${mutedText}`}>Scan to open profile</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create New Card */}
          <button onClick={onCreateNew}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all hover:scale-[1.01] ${
              isDark ? "border-white/12 hover:border-white/20 hover:bg-white/[0.03]" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
            style={{ minHeight: "180px" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: isDark ? "rgba(255,122,0,0.12)" : "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.2)" }}>
              <Plus className="w-6 h-6" style={{ color: "#FF7A00" }} />
            </div>
            <div>
              <p className={`font-bold text-sm ${headText}`}>New Profile</p>
              <p className={`text-xs mt-0.5 ${mutedText}`}>Add another digital card</p>
            </div>
          </button>
        </div>
      ) : (
        /* Empty state */
        <div className={`rounded-2xl border-2 border-dashed text-center p-10 ${isDark ? "border-white/12" : "border-slate-200"}`}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: isDark ? "rgba(11,46,107,0.3)" : "rgba(11,46,107,0.06)", border: "1px solid rgba(11,46,107,0.15)" }}>
            <Users className="w-8 h-8" style={{ color: "#0B2E6B" }} />
          </div>
          <h3 className={`font-black text-lg mb-1 ${headText}`}>Create your first profile</h3>
          <p className={`text-sm mb-5 ${mutedText}`}>Your digital business card, shareable via NFC, QR, or link.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onLaunchAI}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)" }}>
              <Zap className="w-4 h-4" /> Build with AI
            </button>
            <button onClick={onCreateNew}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${isDark ? "border-white/15 text-white/70 hover:bg-white/8" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              <Plus className="w-4 h-4" /> Manual Setup
            </button>
          </div>
        </div>
      )}

      {/* Upgrade nudge for multi-profile users on free */}
      {profiles.length >= 1 && profiles.every(p => p.plan === "free") && (
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", border: "1px solid rgba(255,122,0,0.2)" }}>
          <div className="flex-1">
            <p className="text-sm font-black text-white">Unlock advanced features</p>
            <p className="text-xs text-white/55 mt-0.5">Leads, appointments, analytics & more with a Pro or Business plan.</p>
          </div>
          <Link to="/plans" className="flex-shrink-0">
            <button className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: "#FF7A00" }}>
              Upgrade
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}