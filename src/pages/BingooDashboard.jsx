import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ScreenPullToRefresh from "@/components/mobile/ScreenPullToRefresh";
const LeadsPanel = React.lazy(() => import("@/components/bingoo/LeadsPanel"));
const AnalyticsPanel = React.lazy(() => import("@/components/bingoo/AnalyticsPanel"));
const OnboardingWizard = React.lazy(() => import("@/components/bingoo/OnboardingWizard"));
const AppointmentsTabMerged = React.lazy(() => import("@/components/bingoo/AppointmentsTabMerged"));
const ConnectionsPanel = React.lazy(() => import("@/components/bingoo/ConnectionsPanel"));
const LostDeviceManager = React.lazy(() => import("@/components/bingoo/LostDeviceManager"));
const QrWalletCenter = React.lazy(() => import("@/components/bingoo/QrWalletCenter"));
const DesignStudio = React.lazy(() => import("@/components/bingoo/DesignStudio"));
const DesignStudioLocked = React.lazy(() => import("@/components/bingoo/DesignStudioLocked"));
const DesignStudioProfessional = React.lazy(() => import("@/components/bingoo/DesignStudioProfessional"));
const SalonServicesPanel = React.lazy(() => import("@/components/bingoo/SalonServicesPanel"));
// AppointmentSettings lazy import removed — now rendered inside AppointmentsTabMerged only
const PlanGateScreen = React.lazy(() => import("@/components/bingoo/PlanGateScreen"));
const TeamMembersPanel = React.lazy(() => import("@/components/bingoo/TeamMembersPanel"));
const CRMPipelinePanel = React.lazy(() => import("@/components/bingoo/CRMPipelinePanel"));
const LegalLeadsDashboard = React.lazy(() => import("@/components/bingoo/LegalLeadsDashboard"));
const AttendancePanel = React.lazy(() => import("@/components/bingoo/AttendancePanel"));
const PracticeAreasPanel = React.lazy(() => import("@/components/bingoo/PracticeAreasPanel"));
const LegalServicesPanel = React.lazy(() => import("@/components/bingoo/LegalServicesPanel"));
const OfficeLocationsPanel = React.lazy(() => import("@/components/bingoo/OfficeLocationsPanel"));
import { useBingooTheme } from "@/hooks/useBingooTheme";
const ProfilesHub = React.lazy(() => import("@/components/bingoo/ProfilesHub"));
const ProfileWorkspace = React.lazy(() => import("@/components/bingoo/ProfileWorkspace"));
import { usePlan } from "@/hooks/usePlan";
import { auditUserContext } from "@/lib/dbDebug";
import { normalizeProfileType } from "@/lib/sidebarConfig";
import { PLAN_LABELS, canAccess as canAccessForPlan, normalizePlan } from "@/lib/planPermissions";
import {
  BarChart3, Star, Settings, TrendingUp, CalendarDays,
  Zap, Briefcase, Users, AlertTriangle,
  Shield, Scissors, Clock, GitBranch, UserCheck, Scale, Building2, ChevronLeft,
  AlertOctagon
} from "lucide-react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import BingooLogo from "@/components/bingoo/BingooLogo";
import NotificationCenter from "@/components/bingoo/NotificationCenter";
import BingooLoadingDots from "@/components/bingoo/ui/BingooLoadingDots";
const PremiumHomeDashboard = React.lazy(() => import("@/components/bingoo/PremiumHomeDashboard"));
const DocumentWalletPanel = React.lazy(() => import("@/components/bingoo/DocumentWalletPanel"));
const MyAssetsPanel = React.lazy(() => import("@/components/bingoo/MyAssetsPanel"));
const ProfileQualityScore = React.lazy(() => import("@/components/bingoo/ProfileQualityScore"));
const PlanJourneyPanel = React.lazy(() => import("@/components/bingoo/PlanJourneyPanel"));
const StrategicHub = React.lazy(() => import("@/components/bingoo/strategic/StrategicHub"));

// ── View/page constants ──
const VIEW_HUB          = "hub";
const VIEW_WORKSPACE    = "workspace";
const VIEW_APPTS        = "appointments";
const VIEW_LEADS        = "leads";
const VIEW_ANALYTICS    = "analytics";
const VIEW_LOSTMODE     = "lostmode";
const VIEW_CONNECTIONS  = "connections";
const VIEW_CRM          = "crm";
const VIEW_SERVICES     = "services";
// VIEW_HOURS removed — Business Hours editing is now inside Appointments (Booking Setup sub-tab)
const VIEW_PRACTICE     = "practiceareas";
const VIEW_LEGAL_SVC    = "legalservices";
const VIEW_OFFICES      = "offices";
const VIEW_TEAM         = "team";
const VIEW_ATTENDANCE   = "attendance";
const VIEW_HOME         = "home";
const VIEW_QR           = "qrwallet";
const VIEW_DESIGN       = "designstudio";
const VIEW_DOCWALLET    = "docwallet";
const VIEW_MYASSETS     = "myassets";
const VIEW_QUALITY      = "quality";
const VIEW_PLANJOURNEY  = "planjourney";
const VIEW_STRATEGIC    = "strategic";

// ── Deep-link param parsing ──
// Notifications and emails link to the dashboard with `view` (the canonical param) plus
// `profileId`, `leadId`, `appointmentId`, and `notificationId`. The legacy `tab` param is
// accepted as an alias for `view` so older links keep working.
const TAB_TO_VIEW = {
  leads: VIEW_LEADS,
  appointments: VIEW_APPTS,
  crm: VIEW_CRM,
  analytics: VIEW_ANALYTICS,
  lostmode: VIEW_LOSTMODE,
  connections: VIEW_CONNECTIONS,
  services: VIEW_SERVICES,
  hours: VIEW_APPTS, // Business Hours consolidated into Appointments view
  practiceareas: VIEW_PRACTICE,
  legalservices: VIEW_LEGAL_SVC,
  offices: VIEW_OFFICES,
  team: VIEW_TEAM,
  attendance: VIEW_ATTENDANCE,
  workspace: VIEW_WORKSPACE,
  hub: VIEW_HUB,
  home: VIEW_HOME,
  qrwallet: VIEW_QR,
  designstudio: VIEW_DESIGN,
  docwallet: VIEW_QR,
  myassets: VIEW_MYASSETS,
  quality: VIEW_QUALITY,
  planjourney: VIEW_PLANJOURNEY,
  strategic: VIEW_STRATEGIC,
};
function resolveView(searchParams) {
  const v = searchParams.get("view");
  if (v === "docwallet") return VIEW_QR; // Document Wallet consolidated into QR & Wallet
  if (v) return v;
  const tab = searchParams.get("tab");
  if (tab && TAB_TO_VIEW[tab]) return TAB_TO_VIEW[tab];
  return VIEW_HOME;
}
// ── NewProfileForm ──────────────────────────────────────────────────────────
// Lightweight profile creation form — same modern style as ProfileWorkspace.
// Creates the record then hands off to ProfileWorkspace for all editing.
function NewProfileForm({ user, isDark, prefillData, onBack, onCreated }) {
  const [form, setForm] = useState({
    display_name: prefillData?.display_name || user?.full_name || "",
    username: prefillData?.username || "",
    job_title: prefillData?.job_title || "",
    bio: prefillData?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headText  = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg   = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputCls  = `w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-orange-400/40 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-white border-slate-200 text-slate-800"}`;

  const setF = (k) => (e) => {
    const v = k === "username"
      ? e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
      : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleCreate = async () => {
    setError("");
    if (!form.display_name.trim()) { setError("Display name is required."); return; }
    if (!form.username.trim()) { setError("Username (profile URL) is required."); return; }
    setSaving(true);
    try {
      // Read onboarding choices (set by OnboardingWizard steps 2 & 3).
      // profile_type = category/vertical (drives sidebar nav). plan = "free" always —
      // paid entitlement comes only from the Subscription entity after checkout.
      const onboardingLayout = localStorage.getItem("bingoo_onboarding_layout") || "classic";
      const onboardingProfileType = localStorage.getItem("bingoo_onboarding_profile_type") || "personal";
      const created = await base44.entities.Profile.create({
        display_name: form.display_name.trim(),
        username: form.username.trim(),
        job_title: form.job_title.trim(),
        bio: form.bio.trim(),
        cover_color: "#2563eb",
        is_active: true,
        plan: "free",
        profile_type: onboardingProfileType,
        layout: onboardingLayout,
      });
      // Clean up onboarding localStorage
      localStorage.removeItem("bingoo_onboarding_profile_type");
      localStorage.removeItem("bingoo_onboarding_layout");
      onCreated(created);
    } catch (err) {
      setError(err?.message || "Failed to create profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
          <ChevronLeft className="w-4 h-4" /> Profiles
        </button>
        <p className={`font-bold text-sm ${headText}`}>New Profile</p>
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${mutedText}`}>Profile Info</p>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Display Name *</label>
          <input className={inputCls} value={form.display_name} onChange={setF("display_name")} placeholder="Your Name or Business" />
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Username (Profile URL) *</label>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-2 rounded-xl flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-500"}`}>/p/</span>
            <input className={inputCls} value={form.username} onChange={setF("username")} placeholder="yourusername" />
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>Lowercase letters, numbers, hyphens and underscores only.</p>
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Job Title / Role</label>
          <input className={inputCls} value={form.job_title} onChange={setF("job_title")} placeholder="CEO · Consultant · Attorney" />
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Bio</label>
          <textarea className={inputCls} rows={3} value={form.bio} onChange={setF("bio")} placeholder="Short description about you or your business..." />
        </div>

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        <button onClick={handleCreate} disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: saving ? "#64748b" : "linear-gradient(135deg, #f97316, #FDBA21)" }}>
          {saving ? "Creating…" : "Create Profile & Open Editor →"}
        </button>
        <p className={`text-[11px] text-center ${mutedText}`}>You can add photos, links, and more after creation.</p>
      </div>
    </div>
  );
}

// "No profile selected" empty state
const NoProfileState = ({ isDark, onGoToProfiles }) => (
  <div className={`flex flex-col items-center justify-center py-24 text-center ${isDark ? "text-white/40" : "text-slate-400"}`}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.08)" }}>
      <span className="text-3xl">👤</span>
    </div>
    <p className={`font-bold text-base mb-1 ${isDark ? "text-white/60" : "text-slate-600"}`}>No profile selected</p>
    <p className="text-sm mb-5">Select a profile first to access this section.</p>
    <button onClick={onGoToProfiles}
      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
      style={{ background: "#f97316" }}>
      Go to My Profiles
    </button>
  </div>
);

export default function BingooDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = resolveView(searchParams);

  // selectedProfileId is the single source of truth — persisted to sessionStorage
  // so switching to the NFC tab (which unmounts this page) and back restores the
  // same profile, preserving the user's context across bottom-tab switches.
  const [selectedProfileId, setSelectedProfileId] = useState(() => {
    try { return sessionStorage.getItem("bingoo_selected_profile") || null; } catch { return null; }
  });
  useEffect(() => {
    try {
      if (selectedProfileId) sessionStorage.setItem("bingoo_selected_profile", selectedProfileId);
      else sessionStorage.removeItem("bingoo_selected_profile");
    } catch { /* ignore */ }
  }, [selectedProfileId]);
  // Highlight targets carried in from notification/email deep links
  const [highlightLeadId, setHighlightLeadId] = useState(null);
  const [highlightAppointmentId, setHighlightAppointmentId] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
  const [liveFormOverride, setLiveFormOverride] = useState(null);
  const { isDark } = useBingooTheme();
  const { isSalon, isBusiness, isFree, plan: userPlan, isLawFirm, isCorporate, isLoading: planLoading, planSource } = usePlan();

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

  // ── Profile ordering ──
  // Saved order (array of profile IDs) takes precedence; any profiles not in the saved
  // list are appended, sorted by created_date (oldest first) then name as a stable fallback.
  const profileOrderIds = user?.profile_order_ids || [];
  const orderedProfiles = React.useMemo(() => {
    const ids = profileOrderIds.filter(id => profiles.some(p => p.id === id));
    const rest = profiles
      .filter(p => !ids.includes(p.id))
      .sort((a, b) => {
        const ad = a.created_date ? new Date(a.created_date).getTime() : 0;
        const bd = b.created_date ? new Date(b.created_date).getTime() : 0;
        if (ad !== bd) return ad - bd;
        return (a.display_name || "").localeCompare(b.display_name || "");
      });
    const ordered = ids
      .map(id => profiles.find(p => p.id === id))
      .filter(Boolean);
    return [...ordered, ...rest];
  }, [profiles, profileOrderIds]);

  // Persist a new display order for the user's profiles (optimistic via refetchUser).
  const saveProfileOrder = async (orderedIds) => {
    try {
      await base44.auth.updateMe({ profile_order_ids: orderedIds });
      refetchUser();
    } catch (e) {
      console.error("Failed to save profile order:", e);
      throw e;
    }
  };

  // Onboarding trigger
  const onboardingParam = searchParams.get("onboarding");
  useEffect(() => {
    if (!user) return;
    const forceOnboarding = onboardingParam === "1";
    const noProfile = profiles.length === 0;
    const notDone = !localStorage.getItem("bingoo_onboarding_done");
    if ((noProfile && notDone) || (forceOnboarding && !user.account_type)) {
      setShowOnboarding(true);
    }
  }, [user, profiles]);

  // Ownership repair
  const [ownershipReady, setOwnershipReady] = useState(false);
  useEffect(() => {
    if (!user) return;
    auditUserContext(base44).then((report) => {
      if (report?.repaired) {
        refetchUser();
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["appointments"] });
        qc.invalidateQueries({ queryKey: ["analytics"] });
      }
      setOwnershipReady(true);
    }).catch(() => setOwnershipReady(true));
  }, [user?.id]);

  // Active profile — resolves from selectedProfileId, then the user's chosen default, then the first ordered profile
  const defaultProfileId = user?.default_profile_id;
  const activeProfile = selectedProfileId
    ? (orderedProfiles.find(p => p.id === selectedProfileId) ?? orderedProfiles.find(p => p.id === defaultProfileId) ?? orderedProfiles[0])
    : (orderedProfiles.find(p => p.id === defaultProfileId) ?? orderedProfiles[0]);

  // Subscription is the single source of truth for plan entitlement.
  // Profile.plan is owner-writable and must never be used for feature gating.
  const activeProfilePlan = normalizePlan(userPlan);
  const canAccessFeature = (featureKey) => {
    if (planLoading) return true;
    return canAccessForPlan(activeProfilePlan, featureKey);
  };
  const hasServiceMenu  = !planLoading && canAccessFeature("service_menu");
  const hasTeam         = !planLoading && (canAccessFeature("staff_profiles") || canAccessFeature("attorney_profiles") || canAccessFeature("employee_profiles"));
  const hasCRM          = !planLoading && canAccessFeature("crm_pipeline");
  const hasAttendance   = !planLoading && canAccessFeature("attendance");

  // Mark a profile as the default (auto-selected on dashboard load). Only meaningful when the
  // user owns more than one profile.
  const setDefaultProfile = async (profileId) => {
    try {
      await base44.auth.updateMe({ default_profile_id: profileId });
      refetchUser();
    } catch (e) {
      console.error("Failed to set default profile:", e);
    }
  };

  // ── Deep-link resolution ──
  // When a notification or email opens the dashboard with profileId/leadId/appointmentId/
  // notificationId, select the (owned) profile and surface the related record. The selected
  // profile is validated against the user's owned profiles so a tampered link can't force an
  // unowned profile into context.
  const qProfileId = searchParams.get("profileId");
  const qLeadId = searchParams.get("leadId");
  const qApptId = searchParams.get("appointmentId");
  const qNotifId = searchParams.get("notificationId");

  useEffect(() => {
    // Carry highlight targets from the URL into state for the active panel.
    setHighlightLeadId(qLeadId || null);
    setHighlightAppointmentId(qApptId || null);

    // Select the profile from the link if the user owns it.
    if (qProfileId && profiles.length > 0 && profiles.some(p => p.id === qProfileId)) {
      setSelectedProfileId(qProfileId);
    }

    // Mark the notification read on open (fire-and-forget; non-blocking).
    if (qNotifId) {
      base44.entities.BingooNotification.update(qNotifId, { is_read: true })
        .then(() => qc.invalidateQueries({ queryKey: ["bingoo-notifications"] }))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qProfileId, qLeadId, qApptId, qNotifId, profiles]);

  // ── Sync selectedProfileId to URL so it survives refresh/back navigation ──
  // Uses replace:true so profile changes update the current history entry without
  // cluttering the back stack. View navigations (navigate()) create new entries,
  // so back button restores both the previous view AND its profileId.
  useEffect(() => {
    if (selectedProfileId && searchParams.get("profileId") !== selectedProfileId) {
      const next = new URLSearchParams(searchParams);
      next.set("profileId", selectedProfileId);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId]);

  // Queries scoped to activeProfile
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads", activeProfile?.id],
    queryFn: () => base44.functions.invoke('getMyLeads', { profile_id: activeProfile.id }).then(res => res.data.leads),
    enabled: !!activeProfile?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 5000,
  });
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics-all", activeProfile?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: activeProfile.id }),
    enabled: !!activeProfile?.id && ownershipReady,
    refetchInterval: 15000,
    refetchOnMount: true,
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", activeProfile?.id],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: activeProfile.id }, "-created_date"),
    enabled: !!activeProfile?.id && ownershipReady,
    refetchOnMount: true,
  });
  const { data: allNfcDevices = [] } = useQuery({
    queryKey: ["my-nfc-devices-all"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getMyNfcDevices", {});
      return res?.data?.devices || [];
    },
    refetchInterval: 10000,
  });
  const myNfcDevices = activeProfile?.id ? allNfcDevices.filter(d => d.profile_id === activeProfile.id) : [];
  const { data: salonServices = [] } = useQuery({
    queryKey: ["salon-services-count", activeProfile?.id],
    queryFn: () => base44.entities.SalonService.filter({ profile_id: activeProfile.id }),
    enabled: !!activeProfile?.id && hasServiceMenu,
  });
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-count", activeProfile?.id],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: activeProfile.id }),
    enabled: !!activeProfile?.id && hasTeam,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!activeProfile?.id) return;
    const unsubLeads = base44.entities.Lead.subscribe((event) => {
      if (event.data?.profile_id === activeProfile.id) qc.invalidateQueries({ queryKey: ["leads", activeProfile.id] });
    });
    const unsubAppts = base44.entities.Appointment.subscribe((event) => {
      if (event.data?.profile_id === activeProfile.id) qc.invalidateQueries({ queryKey: ["appointments", activeProfile.id] });
    });
    const unsubAnalytics = base44.entities.Analytics.subscribe((event) => {
      if (event.data?.profile_id === activeProfile.id) qc.invalidateQueries({ queryKey: ["analytics-all", activeProfile.id] });
    });
    return () => { unsubLeads(); unsubAppts(); unsubAnalytics(); };
  }, [activeProfile?.id]);

  // ── Navigation helpers ──
  // IMPORTANT: none of these change selectedProfileId unless explicitly navigating to a new profile
  const openHome = () => {
    setLiveFormOverride(null);
    navigate(`/bingoo?view=${VIEW_HOME}`, { replace: false });
  };

  const openHub = () => {
    setLiveFormOverride(null);
    navigate('/bingoo?view=hub', { replace: false });
  };

  const openWorkspace = (profileId) => {
    setSelectedProfileId(profileId);
    setLiveFormOverride(null);
    navigate(`/bingoo?view=${VIEW_WORKSPACE}`, { replace: false });
  };

  const openNewProfile = () => {
    setSelectedProfileId(null);
    setLiveFormOverride(null);
    navigate(`/bingoo?view=${VIEW_WORKSPACE}&newprofile=1`, { replace: false });
  };

  const openView = (v) => {
    setLiveFormOverride(null);
    // Use navigate with replace: false so each tab visit creates a browser history entry.
    // This ensures Android hardware back / browser back steps through tabs predictably.
    navigate(`/bingoo?view=${v}`, { replace: false });
  };

  const launchAI = () => {
    localStorage.removeItem("bingoo_onboarding_done");
    setShowOnboarding(true);
  };

  // Language
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("bingoo_lang");
    if (saved) return saved;
    const bl = navigator.language || "en";
    return bl.toLowerCase().startsWith("fr") ? "fr" : "en";
  });
  const toggleLang = () => setLang(l => {
    const next = l === "en" ? "fr" : "en";
    localStorage.setItem("bingoo_lang", next);
    return next;
  });
  const TR = {
    en: { lostMode: "Lost Mode" },
    fr: { lostMode: "Mode Perdu" }
  };
  const tr = TR[lang];

  // Profile URL helpers
  const profileAbsoluteUrl = activeProfile ? `${window.location.origin}/p/${activeProfile.username}` : null;

  // isNewProfile mode
  const isNewProfile = searchParams.get("newprofile") === "1";

  // ── Page-level context chip (for non-hub views) ──
  const ProfileChip = () => {
    if (!activeProfile) return null;
    return (
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={openHub}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
          <ChevronLeft className="w-3.5 h-3.5" /> Profiles
        </button>
        {activeProfile.profile_photo
          ? <img src={activeProfile.profile_photo} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" />
          : <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs flex-shrink-0"
              style={{ background: activeProfile.cover_color || "#2563eb" }}>{activeProfile.display_name?.charAt(0)}</div>
        }
        <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>{activeProfile.display_name}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
          {PLAN_LABELS[activeProfilePlan] || "Free"}
        </span>
      </div>
    );
  };

  // Pull-to-refresh: only on safe list/data views, never inside forms/modals.
  const PTR_SAFE_VIEWS = ["home", "hub", "leads", "appointments", "myassets"];
  const ptrDisabled = !PTR_SAFE_VIEWS.includes(view) || !!liveFormOverride || showOnboarding;
  const handlePullRefresh = async () => {
    await qc.invalidateQueries();
    refetchUser();
    refetchProfiles();
  };

  return (
    <BingooLayout selectedProfile={activeProfile ?? null} accountPlan={userPlan} lang={lang} userId={user?.id}>
      {showOnboarding && user && (
        <React.Suspense fallback={null}>
        <OnboardingWizard
          userName={user.full_name}
          onCreateProfile={() => {
            setShowOnboarding(false);
            openNewProfile();
          }}
          onDismiss={() => {
            setShowOnboarding(false);
            if (profiles.length > 0) openHub();
            else openNewProfile();
          }}
        />
        </React.Suspense>
      )}

      <div className={`min-h-screen ${isDark ? "bg-[#0a0c14]" : "bg-[#f5f7fb]"}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-24 pt-1 sm:pt-2">
          <ScreenPullToRefresh onRefresh={handlePullRefresh} disabled={ptrDisabled} />

          {/* ── Global top bar ── */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <BingooLogo className="h-8 w-auto object-contain hidden sm:block" />
              <div className="min-w-0">
                <h1 className={`text-base font-black leading-none truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.full_name?.split(" ")[0] || "Dashboard"}
                </h1>
                <p className={`text-[11px] font-semibold mt-0.5 truncate ${isDark ? "text-white/35" : "text-slate-400"}`}>
                  {activeProfile ? activeProfile.display_name : "My Profiles"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <NotificationCenter userId={user?.id} isDark={isDark} />
              <button onClick={toggleLang} aria-label="Toggle language"
                className={`min-h-[44px] px-3 rounded-full text-xs font-bold transition-all flex items-center ${isDark ? "bg-white/8 border border-white/12 text-white/50 hover:text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                {lang === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
              </button>
              <Link to="/account-settings">
                <button aria-label="Account settings"
                  className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/8 text-white/40 hover:bg-white/15 hover:text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                  <Shield className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          <React.Suspense fallback={<div className="flex items-center justify-center py-20"><BingooLoadingDots /></div>}>
          {/* ════════════════════════════════════
              HOME — Premium Dashboard Overview
          ════════════════════════════════════ */}
          {view === VIEW_HOME && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <PremiumHomeDashboard
                  profile={activeProfile}
                  user={user}
                  isDark={isDark}
                  leads={leads}
                  appointments={appointments}
                  analytics={analytics}
                  nfcDevices={myNfcDevices}
                  plan={activeProfilePlan}
                  canAccessFeature={canAccessFeature}
                  onNavigate={openView}
                  profileUrl={profileAbsoluteUrl}
                  isLoading={leadsLoading || analyticsLoading}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              HUB — My Profiles
          ════════════════════════════════════ */}
          {view === VIEW_HUB && (
            <ProfilesHub
              profiles={orderedProfiles}
              user={user}
              isDark={isDark}
              accountPlan={userPlan}
              defaultProfileId={user?.default_profile_id}
              activeProfileId={activeProfile?.id}
              loading={profilesLoading && profiles.length === 0}
              onSetDefault={setDefaultProfile}
              onReorder={saveProfileOrder}
              onSelectProfile={openWorkspace}
              onCreateNew={openNewProfile}
              onLaunchAI={launchAI}
            />
          )}

          {/* ════════════════════════════════════
              WORKSPACE — Profile editor
          ════════════════════════════════════ */}
          {view === VIEW_WORKSPACE && (
            <>
              {isNewProfile || !activeProfile ? (
                /* New profile creation — uses the same modern workspace architecture */
                <NewProfileForm
                  user={user}
                  isDark={isDark}
                  prefillData={aiGeneratedProfile}
                  onBack={openHub}
                  onCreated={(savedProfile) => {
                    setAiGeneratedProfile(null);
                    setLiveFormOverride(null);
                    setSelectedProfileId(savedProfile.id);
                    refetchProfiles();
                    setSearchParams({ view: VIEW_WORKSPACE });
                  }}
                />
              ) : (
                /* Profile workspace with inner tabs — onBack goes to hub, save stays on same inner tab */
                <ProfileWorkspace
                  profileId={activeProfile.id}
                  user={user}
                  onBack={openHub}
                  isDark={isDark}
                  isLawFirm={isLawFirm}
                  isSalon={isSalon}
                  lang={lang}
                />
              )}
            </>
          )}

          {/* ════════════════════════════════════
              APPOINTMENTS — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_APPTS && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("appointment_booking") ? (
                <PlanGateScreen feature="appointment_booking" isDark={isDark} />
              ) : (
                <AppointmentsTabMerged
                  profileId={activeProfile.id}
                  userId={user?.id}
                  isDark={isDark}
                  highlightId={highlightAppointmentId}
                  onSaved={() => { /* stay on this page — no redirect */ }}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              LEADS — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_LEADS && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("lead_collection") ? (
                <PlanGateScreen feature="lead_collection" isDark={isDark} />
              ) : (
                <LeadsPanel
                  profileId={activeProfile.id}
                  profileIds={profiles.map(p => p.id)}
                  user={user}
                  highlightId={highlightLeadId}
                  onSaved={() => { /* stay on this page */ }}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              ANALYTICS — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_ANALYTICS && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("analytics") ? (
                <PlanGateScreen feature="analytics" isDark={isDark} />
              ) : (
                <AnalyticsPanel profileId={activeProfile.id} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              LOST MODE — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_LOSTMODE && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("lost_mode") ? (
                <PlanGateScreen feature="lost_mode" isDark={isDark} />
              ) : (
                <LostDeviceManager
                  profileId={activeProfile.id}
                  userId={user?.id}
                  isDark={isDark}
                  tr={tr}
                  onSaved={() => { /* stay on this page */ }}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              CONNECTIONS — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_CONNECTIONS && (
            <div>
              <ProfileChip />
              <ConnectionsPanel isDark={isDark} profileId={activeProfile?.id} />
            </div>
          )}

          {/* ════════════════════════════════════
              QR & WALLET CENTER — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_QR && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <QrWalletCenter
                  profile={activeProfile}
                  isDark={isDark}
                  effectivePlan={activeProfilePlan}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              DESIGN STUDIO — Custom NFC Card Designer
          ════════════════════════════════════ */}
          {view === VIEW_DESIGN && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : userPlan === 'professional' ? (
                <DesignStudioProfessional isDark={isDark} profile={activeProfile} />
              ) : (
                <DesignStudio isDark={isDark} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              CRM — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_CRM && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("crm_pipeline") ? (
                <PlanGateScreen feature="crm_pipeline" isDark={isDark} />
              ) : isLawFirm ? (
                <LegalLeadsDashboard profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              ) : (
                <CRMPipelinePanel
                  profileId={activeProfile.id}
                  profileIds={profiles.map(p => p.id)}
                  user={user}
                  isDark={isDark}
                  onSaved={() => {}}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              SERVICES — Salon / Business
          ════════════════════════════════════ */}
          {view === VIEW_SERVICES && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("services") ? (
                <PlanGateScreen feature="services" isDark={isDark} />
              ) : (
                <SalonServicesPanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* HOURS view removed — Business Hours editing is now inside Appointments (Booking Setup sub-tab) */}

          {/* ════════════════════════════════════
              PRACTICE AREAS — Law Firm
          ════════════════════════════════════ */}
          {view === VIEW_PRACTICE && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("practice_areas") ? (
                <PlanGateScreen feature="practice_areas" isDark={isDark} />
              ) : (
                <PracticeAreasPanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              LEGAL SERVICES — Law Firm
          ════════════════════════════════════ */}
          {view === VIEW_LEGAL_SVC && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("legal_services") ? (
                <PlanGateScreen feature="legal_services" isDark={isDark} />
              ) : (
                <LegalServicesPanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              OFFICES — Law Firm
          ════════════════════════════════════ */}
          {view === VIEW_OFFICES && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("office_locations") ? (
                <PlanGateScreen feature="office_locations" isDark={isDark} />
              ) : (
                <OfficeLocationsPanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              TEAM — Business / Law Firm / Corporate
          ════════════════════════════════════ */}
          {view === VIEW_TEAM && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("team_members") ? (
                <PlanGateScreen feature="team_members" isDark={isDark} />
              ) : (
                <TeamMembersPanel
                    profileId={activeProfile.id}
                    profileType={normalizeProfileType(activeProfile)}
                    isDark={isDark}
                    onSaved={() => {}}
                  />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              ATTENDANCE — Corporate
          ════════════════════════════════════ */}
          {view === VIEW_ATTENDANCE && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccessFeature("attendance") ? (
                <PlanGateScreen feature="attendance" isDark={isDark} />
              ) : (
                <AttendancePanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              DOCUMENT WALLET — Secure private document storage
          ════════════════════════════════════ */}
          {view === VIEW_DOCWALLET && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <DocumentWalletPanel profile={activeProfile} isDark={isDark} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              MY ASSETS — Asset protection & tracking
          ════════════════════════════════════ */}
          {view === VIEW_MYASSETS && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <MyAssetsPanel profile={activeProfile} isDark={isDark} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              PROFILE QUALITY SCORE — AI/Strategic MVP
          ════════════════════════════════════ */}
          {view === VIEW_QUALITY && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <ProfileQualityScore profile={activeProfile} isDark={isDark} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              PLAN JOURNEYS — Full plan exploration
          ════════════════════════════════════ */}
          {view === VIEW_PLANJOURNEY && (
            <div>
              <ProfileChip />
              <PlanJourneyPanel
                isDark={isDark}
                currentPlan={activeProfilePlan}
                userRole={user?.role}
                planSource={planSource}
              />
            </div>
          )}

          {/* ════════════════════════════════════
              STRATEGIC TOOLS — AI Enhancer, ROI, Verified, Event, Concierge
          ════════════════════════════════════ */}
          {view === VIEW_STRATEGIC && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : (
                <StrategicHub
                  profile={activeProfile}
                  isDark={isDark}
                  user={user}
                  onProfileUpdate={async (updates) => {
                    await base44.entities.Profile.update(activeProfile.id, updates);
                    qc.invalidateQueries({ queryKey: ["profiles"] });
                    qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
                  }}
                />
              )}
            </div>
          )}
          </React.Suspense>

          {/* Bingoo loading indicator */}
          <BingooLoadingDots />
        </div>
      </div>

      {/* Layout Picker Modal */}
      {activeProfile && (
        <div id="layout-picker-portal" />
      )}
    </BingooLayout>
  );
}