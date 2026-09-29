import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Eye, Settings, QrCode, Plus, Copy, Check, Lock, Star, Users, GripVertical, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { PLAN_LABELS } from "@/lib/planPermissions";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PUBLIC_APP_ORIGIN, publicProfileQrUrl, publicProfileUrl } from "@/lib/publicProfileUrl";
import { useI18n } from "@/lib/I18nContext";
import { openExternalUrl } from "@/lib/nativePlatform";
import DeleteProfileModal from "@/components/bingoo/DeleteProfileModal";
import { resolveProfileAppearance } from "@/lib/profileLayouts";
import ProfileLayoutCardPreview from "@/components/bingoo/ProfileLayoutCardPreview";

export default function ProfilesHub({
  profiles = [],
  isDark,
  accountPlan,
  maxProfiles = 1,
  onSelectProfile,
  onCreateNew,
  defaultProfileId,
  onSetDefault,
  // The profile currently active in the dashboard (selectedProfileId ?? default ?? first).
  // Its card shows a "Selected" check at the top.
  activeProfileId,
  loading = false,
  // Persist a new ordered array of profile IDs for the user.
  onReorder,
  onProfileDeleted,
}) {
  const { t, language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
  const [copiedId, setCopiedId] = useState(null);
  const [expandedQR, setExpandedQR] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [settingDefault, setSettingDefault] = useState(null);
  // Optimistic override of the display order (array of profile IDs) while saving.
  // Cleared on success (dashboard refetch provides authoritative order) or on failure (revert).
  const [pendingOrder, setPendingOrder] = useState(null);
  const [reorderError, setReorderError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // "Default profile" only matters when the user owns more than one
  const showDefaultUI = profiles.length > 1;
  const isDefault = (profile) => profile.id === defaultProfileId || profiles.length === 1;
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

  // Live profile-card metrics. Analytics is the source of truth for both web and mobile.
  const analyticsQueries = useQueries({
    queries: profiles.map((profile) => ({
      queryKey: ["profile-card-analytics", profile.id],
      queryFn: () => base44.functions.invoke("getMyAnalytics", { profile_id: profile.id })
        .then((res) => res?.data?.events || []),
      enabled: !!profile.id,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    })),
  });
  const analyticsByProfile = profiles.reduce((acc, profile, index) => {
    acc[profile.id] = analyticsQueries[index]?.data || [];
    return acc;
  }, {});

  const copyLink = (profile) => {
    const url = publicProfileUrl(profile.username);
    navigator.clipboard.writeText(url);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getQrUrl = (profile) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicProfileQrUrl(profile.username))}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`;

  const titleCase = (value, fallback) => String(value || fallback)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const profileCompletion = (profile) => {
    const fields = [
      profile.display_name, profile.username, profile.job_title, profile.company_name,
      profile.bio, profile.profile_photo, profile.cover_photo || profile.cover_color,
      profile.phone, profile.email, profile.website,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  // Start 14-day Professional trial
  const startTrial = async () => {
    if (trialLoading) return;
    if (window.self !== window.top) {
      alert(tr("Checkout is only available from the published app. Please open bingooconnect.com to subscribe.", "Le paiement est disponible uniquement dans l’application publiée. Ouvrez bingooconnect.com pour vous abonner."));
      return;
    }
    setTrialLoading(true);
    try {
      const resp = await base44.functions.invoke("createSubscriptionSession", {
        plan: "professional",
        trial_days: 14,
        success_url: `${PUBLIC_APP_ORIGIN}/bingoo`,
        cancel_url: `${PUBLIC_APP_ORIGIN}/bingoo`,
      });
      if (resp?.data?.url) await openExternalUrl(resp.data.url);
    } catch (e) {
      console.error("Trial checkout error:", e);
    } finally {
      setTrialLoading(false);
    }
  };

  // ── Figma-style primary status chip ──
  const renderStatusChip = (profile) => {
    if (!isDefault(profile)) return null;
    return <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide text-white bg-emerald-500 shadow-sm">{t("profiles_primary")}</span>;
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
          aria-label={tr('Drag to reorder profile', 'Faire glisser pour réorganiser le profil')}
          title={tr('Drag to reorder', 'Faire glisser pour réorganiser')}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className={`hidden sm:flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
            isDark ? "border-white/10 bg-black/30 text-white/50 hover:text-white hover:bg-black/50"
                   : "border-slate-200/70 bg-white/80 text-slate-400 hover:text-slate-700 hover:bg-white"
          }`}>
          <GripVertical className="w-3 h-3" />
        </button>
      )}
      {/* Mobile move up/down — compact so controls never cover profile content */}
      {canReorder && (
        <div className="flex sm:hidden items-center gap-0 rounded-xl overflow-hidden shadow-sm"
          style={{ background: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.9)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(148,163,184,0.3)"}` }}>
          <button
            type="button"
            aria-label={tr('Move profile up', 'Déplacer le profil vers le haut')}
            disabled={index === 0}
            onClick={(e) => { e.stopPropagation(); moveBy(index, -1); }}
            className="w-9 h-9 flex items-center justify-center disabled:opacity-30 transition-colors"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
            <ChevronUp className="w-4 h-4" />
          </button>
          <div style={{ width: 1, height: 24, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(148,163,184,0.3)" }} />
          <button
            type="button"
            aria-label={tr('Move profile down', 'Déplacer le profil vers le bas')}
            disabled={index === items.length - 1}
            onClick={(e) => { e.stopPropagation(); moveBy(index, 1); }}
            className="w-9 h-9 flex items-center justify-center disabled:opacity-30 transition-colors"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  // ── Render a single profile card (shared between DnD wrapper and non-DnD fallback) ──
  const renderCard = (profile, index, dragHandleProps) => {
    const profileUrl = publicProfileUrl(profile.username);
    const selected = isSelected(profile);
    const completion = profileCompletion(profile);
    const profileType = titleCase(profile.profile_type, t("profiles_personal"));
    const appearance = resolveProfileAppearance(profile);
    const layoutLabel = `${appearance.recipe.name} ${t("profiles_layout")}`;
    const profileAnalytics = analyticsByProfile[profile.id] || [];
    const viewCount = profileAnalytics.filter((event) => event.event_type === "profile_view").length;
    const tapCount = profileAnalytics.filter((event) => event.event_type === "nfc_tap").length;

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Manage profile: ${profile.display_name}`}
        aria-pressed={selected}
        onClick={() => handleCardActivate(profile)}
        onKeyDown={(e) => handleCardKeyDown(e, profile)}
        className={`relative ${cardBg} border rounded-[18px] transition-all duration-200 cursor-pointer outline-none
          focus:ring-2 focus:ring-orange-400/60
          hover:shadow-lg hover:-translate-y-0.5
          ${selected
            ? (isDark ? "border-blue-400/70 ring-1 ring-blue-400/40" : "border-blue-500/70 ring-1 ring-blue-400/30")
            : cardBorder
          }`}
        style={{ boxShadow: selected ? `0 8px 28px ${appearance.accent}24` : cardShadow, overflow: "visible", borderColor: selected ? appearance.accent : undefined }}>

        {/* Top-of-card status chip (Selected / Default) */}
        <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none">
          {renderStatusChip(profile)}
        </div>

        {/* Reorder controls (top-left) */}
        {renderReorderControls(profile, index, dragHandleProps)}

        {/* Real selected-layout preview: same saved layout identity as Live/Public Profile. */}
        <div className="p-2 pb-1">
          <ProfileLayoutCardPreview profile={profile} height={118} compact />
        </div>
        <div className="flex items-center justify-end gap-1.5 px-2.5 pb-0.5">
          {profile.is_active && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-500">{t("profiles_live")}</span>
            </span>
          )}
          <span className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide"
            style={{ background: "#ecfdf5", color: "#059669" }}>
            {profileType}
          </span>
        </div>

        {/* Name + username */}
        <div className="px-2.5 pb-2 sm:px-3 sm:pb-2.5">
          <div className="mb-1">
            <p className={`font-black text-sm truncate ${headText}`}> {profile.display_name}</p>
            <p className={`text-xs truncate ${mutedText}`}>/{profile.username}</p>
          </div>

          {profile.job_title && (
            <p className={`text-xs font-semibold truncate mb-1.5 ${subText}`}>
              {profile.job_title}{profile.company_name ? ` · ${profile.company_name}` : ""}
            </p>
          )}

          <span className="inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full mb-2"
            style={{ background: isDark ? "rgba(99,102,241,0.16)" : "#eef2ff", color: isDark ? "#a5b4fc" : "#4338ca" }}>
            {layoutLabel}
          </span>

          {completion < 100 && <div className="hidden sm:block mb-2.5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className={subText}>{t("profiles_completion")}</span>
              <span className="font-black text-orange-500">{completion}%</span>
            </div>
            <div className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${completion}%` }} />
            </div>
          </div>}

          <div className="hidden sm:grid grid-cols-3 gap-1 mb-1.5">
            <div className={`rounded-lg px-2.5 py-1 ${isDark ? "bg-white/[0.05]" : "bg-slate-50"}`}>
              <p className={`text-sm font-black ${headText}`}>{viewCount}</p><p className={`text-[9px] ${mutedText}`}>{t("profiles_views")}</p>
            </div>
            <div className={`rounded-lg px-2.5 py-1 ${isDark ? "bg-white/[0.05]" : "bg-slate-50"}`}>
              <p className={`text-sm font-black ${headText}`}>{tapCount}</p><p className={`text-[9px] ${mutedText}`}>{t("profiles_taps")}</p>
            </div>
            <div className={`rounded-lg px-2.5 py-1 ${isDark ? "bg-white/[0.05]" : "bg-slate-50"}`}>
              <p className={`text-xs font-black ${profile.is_active === false ? "text-slate-400" : "text-emerald-500"}`}>{profile.is_active === false ? t("profiles_hidden") : t("profiles_live")}</p>
              <p className={`text-[9px] ${mutedText}`}>{t("profiles_status")}</p>
            </div>
          </div>

          <div className={`hidden sm:flex items-center gap-2 rounded-lg border px-2 py-1 mb-1.5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50"}`}>
            <span className={`text-[11px] truncate flex-1 ${subText}`}>/p/{profile.username}</span>
            <button onClick={(e) => { e.stopPropagation(); copyLink(profile); }} className={`text-[11px] font-bold flex items-center gap-1 ${headText}`}>
              {copiedId === profile.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1 mt-1 items-center justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); handleCardActivate(profile); }}
              className="w-[76px] sm:w-[84px] h-8 flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: "#0b2149" }}>
              <Settings className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{t("profiles_edit")}</span>
            </button>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label={tr('View public profile', 'Voir le profil public')}
              className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.07)",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.2)",
                color: isDark ? "#93c5fd" : "#2563eb",
              }}>
              <Eye className="w-3 h-3" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedQR(expandedQR === profile.id ? null : profile.id); }}
              aria-label={tr('Show QR code', 'Afficher le code QR')}
              className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.07)",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.2)",
                color: isDark ? "#a78bfa" : "#6366f1",
              }}>
              <QrCode className="w-3 h-3" />
            </button>
            {showDefaultUI && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSetDefault(profile); }}
                disabled={settingDefault === profile.id}
                title={isDefault(profile) ? "Default profile" : "Set as default profile"}
                aria-label={isDefault(profile) ? "Default profile" : "Set as default profile"}
                className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-xl border transition-all hover:opacity-80 flex-shrink-0 disabled:opacity-50"
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
                  ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Star className={`w-3 h-3 ${isDefault(profile) ? "fill-current" : ""}`} />}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(profile); }}
              aria-label={tr('Delete profile', 'Supprimer le profil')}
              title={tr('Delete profile', 'Supprimer le profil')}
              className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-xl border transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                borderColor: isDark ? "rgba(248,113,113,0.2)" : "rgba(239,68,68,0.2)",
                color: isDark ? "#fca5a5" : "#dc2626",
              }}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* QR Expanded */}
          {expandedQR === profile.id && (
            <div className={`mt-2 pt-2 border-t text-center ${isDark ? "border-white/8" : "border-slate-100"}`}
              onClick={(e) => e.stopPropagation()}>
              <img src={getQrUrl(profile)} alt="QR" className="w-24 h-24 mx-auto rounded-lg" />
              <p className={`text-xs mt-1.5 ${mutedText}`}>{t("profiles_scan_open")}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // New profile / locked card (rendered after the draggable cards)
  const renderAddCard = () => hasReachedFreeLimit ? (
    <div className={`border-2 border-dashed rounded-[18px] sm:rounded-[24px] p-4 sm:p-8 flex flex-col items-center justify-center gap-2.5 sm:gap-4 text-center ${isDark ? "border-white/12 bg-white/[0.02]" : "border-slate-200 bg-white/20"}`}
      style={{ minHeight: "clamp(190px, 48vw, 470px)" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: isDark ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }}>
        <Lock className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <p className={`font-black text-base ${headText}`}>{t("profiles_create_new")}</p>
        <p className={`text-sm mt-1.5 leading-relaxed ${mutedText}`}>{t("profiles_upgrade_trial")}</p>
      </div>
      <div className="w-full space-y-2">
        <button onClick={startTrial} disabled={trialLoading}
          className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
          {trialLoading ? t("profiles_loading") : t("profiles_save_unlock")}
        </button>
        <p className={`text-xs ${mutedText}`}>{t("profiles_cancel_anytime")}</p>
      </div>
    </div>
  ) : (
    <button onClick={onCreateNew}
      className={`border-2 border-dashed rounded-[18px] sm:rounded-[24px] p-4 sm:p-8 flex flex-col items-center justify-center gap-2.5 sm:gap-4 text-center transition-all hover:scale-[1.01] ${
        isDark ? "border-white/12 hover:border-white/20 hover:bg-white/[0.03]" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
      style={{ minHeight: "clamp(190px, 48vw, 470px)" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <Plus className="w-6 h-6" style={{ color: "#f97316" }} />
      </div>
      <div>
        <p className={`font-black text-base ${headText}`}>{t("profiles_create_new")}</p>
        <p className={`text-sm mt-1 ${mutedText}`}>{t("profiles_add_another")}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-4 sm:space-y-7 py-3 sm:py-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-3xl font-black tracking-tight ${headText}`}> {t("profiles_my_profiles")}</h2>
          <p className={`text-sm mt-0.5 ${subText}`}>
            {loading ? t("profiles_loading") : (maxProfiles < 0
              ? `${profiles.length} profile${profiles.length !== 1 ? "s" : ""} · ${PLAN_LABELS[accountPlan || "free"] || "Free"} · Unlimited`
              : `${profiles.length} of ${Math.max(maxProfiles, profiles.length)} profile${Math.max(maxProfiles, profiles.length) !== 1 ? "s" : ""} · ${PLAN_LABELS[accountPlan || "free"] || "Free"}`)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasReachedFreeLimit ? (
            <button onClick={startTrial} disabled={trialLoading}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border border-orange-300/60 text-orange-500 bg-orange-50/70 transition-all hover:bg-orange-50 disabled:opacity-60">
              <Lock className="w-4 h-4" /> Upgrade to add more
            </button>
          ) : (
            <button onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
              <Plus className="w-3 h-3" /> New Profile
            </button>
          )}
        </div>
      </div>

      {reorderError && (
        <div className="text-xs font-semibold text-red-500">{t("profiles_order_error")}</div>
      )}

      {deleteTarget && (
        <DeleteProfileModal
          profile={deleteTarget}
          isDark={isDark}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            const deletedId = deleteTarget.id;
            setDeleteTarget(null);
            onProfileDeleted?.(deletedId);
          }}
        />
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4">
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
          <h3 className={`font-black text-lg mb-1 ${headText}`}>{t("profiles_create_first")}</h3>
          <p className={`text-sm mb-5 ${mutedText}`}>{t("profiles_first_copy")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
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
