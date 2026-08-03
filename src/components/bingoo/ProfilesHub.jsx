import React, { useState } from "react";
import { Eye, Settings, QrCode, Plus, Zap, Copy, Check, Lock, Star, Users, CheckCircle2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PLAN_LABELS, PLAN_STRIPE_PRODUCTS } from "@/lib/planPermissions";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ProfilesHub({
  profiles = [],
  user,
  isDark,
  accountPlan,
  onSelectProfile,
  onCreateNew,
  onLaunchAI,
  defaultProfileId,
  onSetDefault,
  // The profile currently active in the dashboard (selectedProfileId ?? default ?? first).
  // Its card shows a "Selected" check at the top.
  activeProfileId,
  loading = false,
  // Persist a new ordered array of profile IDs for the user.
  onReorder,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedQR, setExpandedQR] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);
  // Optimistic override of the display order (array of profile IDs) while saving.
  // Cleared on success (dashboard refetch provides authoritative order) or on failure (revert).
  const [pendingOrder, setPendingOrder] = useState(null);
  const [reorderError, setReorderError] = useState(false);

  // "Default profile" only matters when the user owns more than one
  const showDefaultUI = profiles.length > 1;
  const isDefault = (profile) => showDefaultUI && defaultProfileId && profile.id === defaultProfileId;
  const isSelected = (profile) => profile.id === activeProfileId;

  // Display items: optimistic pending order if present, else the prop order (already sorted by dashboard).
  const items = pendingOrder
    ? pendingOrder.map(id => profiles.find(p => p.id === id)).filter(Boolean)
    : profiles;

  const handleSetDefault = (profile) => {
    if (settingDefault || isDefault(profile)) return;
    setSettingDefault(profile.id);
    onSetDefault?.(profile.id).finally(() => setSettingDefault(null));
  };

  // Card-level activation — sets the dashboard's selected profile and opens the workspace.
  const handleCardActivate = (profile) => {
    onSelectProfile?.(profile.id);
  };

  const handleCardKeyDown = (e, profile) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardActivate(profile);
    }
  };

  // ── Reordering ──
  const applyOrder = (nextItems) => {
    const ids = nextItems.map(p => p.id);
    setReorderError(false);
    setPendingOrder(ids);
    if (!onReorder) return;
    onReorder(ids).catch(() => {
      // Revert to authoritative order on failure
      setPendingOrder(null);
      setReorderError(true);
      setTimeout(() => setReorderError(false), 3000);
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = Array.from(items);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    applyOrder(next);
  };

  // Move a card up/down by one position (touch / keyboard friendly)
  const moveBy = (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= items.length) return;
    const next = Array.from(items);
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    applyOrder(next);
  };

  const headText  = isDark ? "text-white"       : "text-slate-900";
  const mutedText = isDark ? "text-white/40"    : "text-slate-400";
  const subText   = isDark ? "text-white/60"    : "text-slate-600";
  const cardBg    = isDark ? "bg-white/[0.05]"  : "bg-white";
  const cardBorder = isDark ? "border-white/[0.08]" : "border-slate-200/80";
  const cardShadow = isDark
    ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)";

  // Effective account plan — used for entitlement decisions
  const isFree = !accountPlan || accountPlan === "free";
  // A 14-day trial CTA is only valid for a genuinely free account.
  // If any profile already carries a paid plan (manual/legacy override or subscription),
  // the user is not "free" from their perspective — hide the trial card.
  // Subscription plan is the sole authority — profile.plan is never used for entitlement
  const anyPaidProfile = !isFree;
  const hasReachedFreeLimit = isFree && profiles.length >= 1 && !anyPaidProfile;
  const canReorder = items.length > 1 && !!onReorder;

  const copyLink = (profile) => {
    const url = `${window.location.origin}/p/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getQrUrl = (profile) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/p/${profile.username}?source=qr`)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`;

  const planColors = {
    free:         { bg: isDark ? "rgba(100,116,139,0.15)" : "#f1f5f9",      text: isDark ? "#94a3b8" : "#64748b" },
    professional: { bg: isDark ? "rgba(37,99,235,0.18)"  : "#eff6ff",       text: isDark ? "#93c5fd" : "#2563eb" },
    pro:          { bg: isDark ? "rgba(37,99,235,0.18)"  : "#eff6ff",       text: isDark ? "#93c5fd" : "#2563eb" },
    salon:        { bg: isDark ? "rgba(236,72,153,0.15)" : "#fdf2f8",       text: isDark ? "#f472b6" : "#db2777" },
    restaurant:   { bg: isDark ? "rgba(249,115,22,0.15)" : "#fff7ed",       text: isDark ? "#fb923c" : "#ea580c" },
    lawfirm:      { bg: isDark ? "rgba(30,58,138,0.25)"  : "#eff6ff",       text: isDark ? "#93c5fd" : "#1d4ed8" },
    business:     { bg: isDark ? "rgba(16,185,129,0.15)" : "#ecfdf5",       text: isDark ? "#34d399" : "#059669" },
    corporate:    { bg: isDark ? "rgba(251,191,36,0.15)" : "#fffbeb",       text: isDark ? "#fbbf24" : "#d97706" },
  };

  const normPlan = (p) => { if (!p) return "free"; if (p === "pro") return "professional"; return p; };
  const getPlanStyle = (plan) => planColors[normPlan(plan)] || planColors.free;

  // Start 14-day Professional trial
  const startTrial = async () => {
    if (trialLoading) return;
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app. Please open bingooconnect.com to subscribe.");
      return;
    }
    setTrialLoading(true);
    try {
      const resp = await base44.functions.invoke("createSubscriptionSession", {
        plan: "professional",
        trial_days: 14,
        success_url: `${window.location.origin}/bingoo`,
        cancel_url: `${window.location.origin}/bingoo`,
      });
      if (resp?.data?.url) window.location.href = resp.data.url;
    } catch (e) {
      console.error("Trial checkout error:", e);
    } finally {
      setTrialLoading(false);
    }
  };

  // ── Top-of-card status chip: distinguishes Selected vs Default ──
  const renderStatusChip = (profile) => {
    const selected = isSelected(profile);
    const def = isDefault(profile);
    if (!selected && !def) return null;
    if (selected && def) {
      return (
        <span className="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full uppercase tracking-wide shadow-sm backdrop-blur"
          style={{ background: "rgba(251,191,36,0.95)", color: "#7c2d12" }}>
          <CheckCircle2 className="w-3 h-3" /> Default
        </span>
      );
    }
    if (selected) {
      return (
        <span className="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full uppercase tracking-wide shadow-sm backdrop-blur"
          style={{ background: "rgba(11,33,73,0.95)", color: "#fff" }}>
          <CheckCircle2 className="w-3 h-3" /> Selected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full uppercase tracking-wide shadow-sm backdrop-blur"
        style={{ background: "rgba(251,191,36,0.92)", color: "#7c2d12" }}>
        <Star className="w-3 h-3 fill-current" /> Default
      </span>
    );
  };

  // ── Reorder controls cluster (top-left of card) ──
  // Desktop: drag handle (GripVertical). Mobile: up/down arrows. Both keep selection intact.
  const renderReorderControls = (profile, index, dragHandleProps) => (
    <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1">
      {/* Desktop drag handle */}
      {canReorder && (
        <button
          type="button"
          {...(dragHandleProps || {})}
          aria-label="Drag to reorder profile"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className={`hidden sm:flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
            isDark ? "border-white/10 bg-black/30 text-white/50 hover:text-white hover:bg-black/50"
                   : "border-slate-200/70 bg-white/80 text-slate-400 hover:text-slate-700 hover:bg-white"
          }`}>
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      )}
      {/* Mobile move up/down */}
      {canReorder && (
        <div className="flex sm:hidden items-center gap-0.5 rounded-lg overflow-hidden"
          style={{ background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.9)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(148,163,184,0.3)"}` }}>
          <button
            type="button"
            aria-label="Move profile up"
            disabled={index === 0}
            onClick={(e) => { e.stopPropagation(); moveBy(index, -1); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-30 transition-colors"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <div style={{ width: 1, height: 24, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(148,163,184,0.3)" }} />
          <button
            type="button"
            aria-label="Move profile down"
            disabled={index === items.length - 1}
            onClick={(e) => { e.stopPropagation(); moveBy(index, 1); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-30 transition-colors"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  // ── Render a single profile card (shared between DnD wrapper and non-DnD fallback) ──
  const renderCard = (profile, index, dragHandleProps) => {
    const effectivePlan = accountPlan || "free";
    const planStyle = getPlanStyle(effectivePlan);
    const planLabel = PLAN_LABELS[effectivePlan] || "Free";
    const profileUrl = `${window.location.origin}/p/${profile.username}`;
    const selected = isSelected(profile);

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Manage profile: ${profile.display_name}`}
        aria-pressed={selected}
        onClick={() => handleCardActivate(profile)}
        onKeyDown={(e) => handleCardKeyDown(e, profile)}
        className={`relative ${cardBg} border rounded-2xl transition-all duration-200 cursor-pointer outline-none
          focus:ring-2 focus:ring-orange-400/60
          hover:shadow-lg hover:-translate-y-0.5
          ${selected
            ? (isDark ? "border-blue-400/70 ring-1 ring-blue-400/40" : "border-blue-500/70 ring-1 ring-blue-400/30")
            : cardBorder
          }`}
        style={{ boxShadow: selected ? "0 8px 28px rgba(37,99,235,0.18)" : cardShadow, overflow: "visible" }}>

        {/* Top-of-card status chip (Selected / Default) */}
        <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none">
          {renderStatusChip(profile)}
        </div>

        {/* Reorder controls (top-left) */}
        {renderReorderControls(profile, index, dragHandleProps)}

        {/* Cover */}
        <div className="relative" style={{ borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
          <div style={{ height: 120 }}>
            {profile.cover_photo ? (
              <img src={profile.cover_photo} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${profile.cover_color || "#2563eb"} 0%, ${(profile.cover_color || "#2563eb")}cc 100%)` }} />
            )}
          </div>
        </div>

        {/* Avatar row */}
        <div className="flex items-start justify-between px-4" style={{ marginTop: -32 }}>
          {(() => {
            const shapeR = { circle: "50%", rounded: "20%", squircle: "28%", card: "12px" }[profile.avatar_shape] || "50%";
            return profile.profile_photo ? (
              <img src={profile.profile_photo} alt=""
                style={{
                  width: 64, height: 64, borderRadius: shapeR, flexShrink: 0,
                  objectFit: "cover", objectPosition: "center top",
                  border: isDark ? "3px solid #13162a" : "3px solid white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "block",
                  position: "relative", zIndex: 10,
                }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: shapeR, flexShrink: 0,
                background: profile.cover_color || "#2563eb",
                border: isDark ? "3px solid #13162a" : "3px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 22,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                position: "relative", zIndex: 10,
              }}>
                {profile.display_name?.charAt(0) || "?"}
              </div>
            );
          })()}
          {/* Bottom badges — Live + Plan */}
          <div className="flex items-center gap-2 pt-9">
            {profile.is_active && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-500">Live</span>
              </span>
            )}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: planStyle.bg, color: planStyle.text }}>
              {planLabel}
            </span>
          </div>
        </div>

        {/* Name + username */}
        <div className="px-4 pb-4">
          <div className="mb-1">
            <p className={`font-bold text-sm truncate ${headText}`}>{profile.display_name}</p>
            <p className={`text-xs truncate ${mutedText}`}>/{profile.username}</p>
          </div>

          {profile.job_title && (
            <p className={`text-xs font-semibold truncate mb-3 ${subText}`}>
              {profile.job_title}{profile.company_name ? ` · ${profile.company_name}` : ""}
            </p>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 items-center">
            <button
              onClick={(e) => { e.stopPropagation(); handleCardActivate(profile); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 min-w-0"
              style={{ background: "#0b2149" }}>
              <Settings className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Edit</span>
            </button>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label="View public profile"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.07)",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.2)",
                color: isDark ? "#93c5fd" : "#2563eb",
              }}>
              <Eye className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedQR(expandedQR === profile.id ? null : profile.id); }}
              aria-label="Show QR code"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.07)",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.2)",
                color: isDark ? "#a78bfa" : "#6366f1",
              }}>
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); copyLink(profile); }}
              aria-label="Copy profile link"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.07)",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.2)",
                color: isDark ? "#34d399" : "#059669",
              }}>
              {copiedId === profile.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {showDefaultUI && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSetDefault(profile); }}
                disabled={settingDefault === profile.id}
                title={isDefault(profile) ? "Default profile" : "Set as default profile"}
                aria-label={isDefault(profile) ? "Default profile" : "Set as default profile"}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all hover:opacity-80 flex-shrink-0 disabled:opacity-50"
                style={{
                  background: isDefault(profile)
                    ? (isDark ? "rgba(251,191,36,0.18)" : "rgba(251,191,36,0.12)")
                    : (isDark ? "rgba(255,255,255,0.06)" : "rgba(251,191,36,0.06)"),
                  borderColor: isDefault(profile)
                    ? "rgba(251,191,36,0.4)"
                    : (isDark ? "rgba(255,255,255,0.1)" : "rgba(251,191,36,0.25)"),
                  color: isDefault(profile) ? (isDark ? "#fbbf24" : "#b45309") : (isDark ? "#fbbf24" : "#d97706"),
                }}>
                {settingDefault === profile.id
                  ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Star className={`w-3.5 h-3.5 ${isDefault(profile) ? "fill-current" : ""}`} />}
              </button>
            )}
          </div>

          {/* QR Expanded */}
          {expandedQR === profile.id && (
            <div className={`mt-3 pt-3 border-t text-center ${isDark ? "border-white/8" : "border-slate-100"}`}
              onClick={(e) => e.stopPropagation()}>
              <img src={getQrUrl(profile)} alt="QR" className="w-28 h-28 mx-auto rounded-xl" />
              <p className={`text-xs mt-1.5 ${mutedText}`}>Scan to open profile</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // New profile / locked card (rendered after the draggable cards)
  const renderAddCard = () => hasReachedFreeLimit ? (
    <div className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center ${isDark ? "border-amber-400/25 bg-amber-400/5" : "border-amber-300/60 bg-amber-50/60"}`}
      style={{ minHeight: "220px" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: isDark ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }}>
        <Lock className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <p className={`font-black text-sm ${headText}`}>Try Professional free for 14 days</p>
        <p className={`text-xs mt-1.5 leading-relaxed ${mutedText}`}>
          Create more profiles, unlock leads, appointments, analytics, NFC tools, resume, portfolio, and premium layouts.
        </p>
      </div>
      <div className="w-full space-y-2">
        <button onClick={startTrial} disabled={trialLoading}
          className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
          <Star className="w-4 h-4" />
          {trialLoading ? "Loading…" : "Start Free 14-Day Trial"}
        </button>
        <p className={`text-xs ${mutedText}`}>$4.99/mo after trial · cancel anytime</p>
      </div>
    </div>
  ) : (
    <button onClick={onCreateNew}
      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all hover:scale-[1.01] ${
        isDark ? "border-white/12 hover:border-white/20 hover:bg-white/[0.03]" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
      style={{ minHeight: "180px" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <Plus className="w-6 h-6" style={{ color: "#f97316" }} />
      </div>
      <div>
        <p className={`font-bold text-sm ${headText}`}>New Profile</p>
        <p className={`text-xs mt-0.5 ${mutedText}`}>Add another digital card</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`text-xl font-black ${headText}`}>My Profiles</h2>
          <p className={`text-xs mt-0.5 ${mutedText}`}>
            {loading
              ? "Loading your profiles…"
              : `${profiles.length} profile${profiles.length !== 1 ? "s" : ""} · tap a card to manage`}
            {canReorder && !loading && " · drag to reorder"}
            {showDefaultUI && !loading && " · tap the star to set a default"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onLaunchAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={{
              background: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.07)",
              borderColor: isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.25)",
              color: isDark ? "#a78bfa" : "#7c3aed"
            }}>
            <Zap className="w-3.5 h-3.5" /> AI Builder
          </button>
          {!hasReachedFreeLimit && (
            <button onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
              <Plus className="w-3.5 h-3.5" /> New Profile
            </button>
          )}
        </div>
      </div>

      {reorderError && (
        <div className="text-xs font-semibold text-red-500">Couldn't save order — reverted. Try again.</div>
      )}

      {/* Loading skeleton */}
      {loading && profiles.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden`} style={{ boxShadow: cardShadow }}>
              <div className={`h-[120px] ${isDark ? "bg-white/5" : "bg-slate-100"} animate-pulse`} />
              <div className="px-4 pb-4 -mt-8">
                <div className={`w-16 h-16 rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"} animate-pulse`} />
                <div className={`h-3.5 w-2/3 mt-3 rounded ${isDark ? "bg-white/10" : "bg-slate-200"} animate-pulse`} />
                <div className={`h-2.5 w-1/3 mt-2 rounded ${isDark ? "bg-white/8" : "bg-slate-100"} animate-pulse`} />
                <div className="flex gap-2 mt-4">
                  <div className={`flex-1 h-9 rounded-xl ${isDark ? "bg-white/8" : "bg-slate-100"} animate-pulse`} />
                  <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-white/8" : "bg-slate-100"} animate-pulse`} />
                  <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-white/8" : "bg-slate-100"} animate-pulse`} />
                  <div className={`w-9 h-9 rounded-xl ${isDark ? "bg-white/8" : "bg-slate-100"} animate-pulse`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Cards Grid with drag-and-drop */}
      {!loading && profiles.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="profiles-grid" isDropDisabled={!canReorder}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((profile, index) => (
                  <Draggable draggableId={profile.id} index={index} key={profile.id} isDragDisabled={!canReorder}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          // Keep a stable height while dragging so the grid doesn't collapse
                          ...(snapshot.isDragging ? { boxShadow: "0 16px 40px rgba(37,99,235,0.28)" } : {}),
                        }}>
                        {renderCard(profile, index, dragProvided.dragHandleProps)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {renderAddCard()}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className={`rounded-2xl border-2 border-dashed text-center p-10 ${isDark ? "border-white/12" : "border-slate-200"}`}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: isDark ? "rgba(11,33,73,0.3)" : "rgba(11,33,73,0.06)", border: "1px solid rgba(11,33,73,0.15)" }}>
            <Users className="w-8 h-8" style={{ color: "#0b2149" }} />
          </div>
          <h3 className={`font-black text-lg mb-1 ${headText}`}>Create your first profile</h3>
          <p className={`text-sm mb-5 ${mutedText}`}>Your digital business card, shareable via NFC, QR, or link.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onLaunchAI}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0b2149, #13284f)" }}>
              <Zap className="w-4 h-4" /> Build with AI
            </button>
            <button onClick={onCreateNew}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${isDark ? "border-white/15 text-white/70 hover:bg-white/8" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              <Plus className="w-4 h-4" /> Manual Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}