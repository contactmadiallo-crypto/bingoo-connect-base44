import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import LeadsPanel from "@/components/bingoo/LeadsPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import AIOnboardingAssistant from "@/components/bingoo/AIOnboardingAssistant";
import AppointmentsTabMerged from "@/components/bingoo/AppointmentsTabMerged";
import ResumePanel from "@/components/bingoo/ResumePanel";
import ConnectionsPanel from "@/components/bingoo/ConnectionsPanel";
import LostDeviceManager from "@/components/bingoo/LostDeviceManager";
import SalonServicesPanel from "@/components/bingoo/SalonServicesPanel";
import BusinessHoursTab from "@/components/bingoo/BusinessHoursTab";
import PlanGateScreen from "@/components/bingoo/PlanGateScreen";
import TeamMembersPanel from "@/components/bingoo/TeamMembersPanel";
import CRMPipelinePanel from "@/components/bingoo/CRMPipelinePanel";
import LegalLeadsDashboard from "@/components/bingoo/LegalLeadsDashboard";
import AttendancePanel from "@/components/bingoo/AttendancePanel";
import PracticeAreasPanel from "@/components/bingoo/PracticeAreasPanel";
import LegalServicesPanel from "@/components/bingoo/LegalServicesPanel";
import OfficeLocationsPanel from "@/components/bingoo/OfficeLocationsPanel";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import ProfilesHub from "@/components/bingoo/ProfilesHub";
import ProfileWorkspace from "@/components/bingoo/ProfileWorkspace";
import { usePlan } from "@/hooks/usePlan";
import { auditUserContext } from "@/lib/dbDebug";
import { normalizeProfileType } from "@/lib/sidebarConfig";
import { getEffectiveProfilePlan, PLAN_LABELS } from "@/lib/planPermissions";
import {
  BarChart3, Star, Settings, TrendingUp, CalendarDays,
  Zap, Briefcase, FileText, Users, AlertTriangle,
  Shield, Scissors, Clock, GitBranch, UserCheck, Scale, Building2, ChevronLeft,
  AlertOctagon
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import BingooLogo from "@/components/bingoo/BingooLogo";

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
const VIEW_HOURS        = "hours";
const VIEW_PRACTICE     = "practiceareas";
const VIEW_LEGAL_SVC    = "legalservices";
const VIEW_OFFICES      = "offices";
const VIEW_TEAM         = "team";
const VIEW_ATTENDANCE   = "attendance";
const VIEW_RESUME       = "resume";
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
      const created = await base44.entities.Profile.create({
        display_name: form.display_name.trim(),
        username: form.username.trim(),
        job_title: form.job_title.trim(),
        bio: form.bio.trim(),
        cover_color: "#2563eb",
        is_active: true,
        plan: "free",
      });
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
          style={{ background: saving ? "#64748b" : "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
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
      style={{ background: isDark ? "rgba(255,122,0,0.1)" : "rgba(255,122,0,0.08)" }}>
      <span className="text-3xl">👤</span>
    </div>
    <p className={`font-bold text-base mb-1 ${isDark ? "text-white/60" : "text-slate-600"}`}>No profile selected</p>
    <p className="text-sm mb-5">Select a profile first to access this section.</p>
    <button onClick={onGoToProfiles}
      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
      style={{ background: "#FF7A00" }}>
      Go to My Profiles
    </button>
  </div>
);

export default function BingooDashboard() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") || VIEW_HUB;

  // selectedProfileId is the single source of truth
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
  const [liveFormOverride, setLiveFormOverride] = useState(null);
  const { isDark } = useBingooTheme();
  const { isSalon, isBusiness, isFree, canAccess, plan: userPlan, isLawFirm, isCorporate, isLoading: planLoading } = usePlan();

  const hasServiceMenu  = !planLoading && canAccess("service_menu");
  const hasTeam         = !planLoading && (canAccess("staff_profiles") || canAccess("attorney_profiles") || canAccess("employee_profiles"));
  const hasCRM          = !planLoading && canAccess("crm_pipeline");
  const hasAttendance   = !planLoading && canAccess("attendance");

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: user.id }),
    enabled: !!user?.id,
  });

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

  // Active profile — resolves from selectedProfileId, then the user's chosen default, then the first profile
  const defaultProfileId = user?.default_profile_id;
  const activeProfile = selectedProfileId
    ? (profiles.find(p => p.id === selectedProfileId) ?? profiles.find(p => p.id === defaultProfileId) ?? profiles[0])
    : (profiles.find(p => p.id === defaultProfileId) ?? profiles[0]);

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

  // Queries scoped to activeProfile
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", activeProfile?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: activeProfile.id }, "-created_date"),
    enabled: !!activeProfile?.id,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: analytics = [] } = useQuery({
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
  const { data: myNfcDevices = [] } = useQuery({
    queryKey: ["my-nfc-devices", activeProfile?.id],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: activeProfile.id }),
    enabled: !!activeProfile?.id,
  });
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
  const openHub = () => {
    setLiveFormOverride(null);
    setSearchParams({});
  };

  const openWorkspace = (profileId) => {
    setSelectedProfileId(profileId);
    setLiveFormOverride(null);
    setSearchParams({ view: VIEW_WORKSPACE });
  };

  const openNewProfile = () => {
    setSelectedProfileId(null);
    setLiveFormOverride(null);
    setSearchParams({ view: VIEW_WORKSPACE, newprofile: "1" });
  };

  const openView = (v) => {
    setLiveFormOverride(null);
    setSearchParams({ view: v });
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
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
          {PLAN_LABELS[getEffectiveProfilePlan(userPlan, activeProfile)] || "Free"}
        </span>
      </div>
    );
  };

  return (
    <BingooLayout selectedProfile={activeProfile ?? null} accountPlan={userPlan} lang={lang}>
      {showOnboarding && user && (
        <AIOnboardingAssistant
          userName={user.full_name}
          user={user}
          onComplete={(generatedData) => {
            setShowOnboarding(false);
            setAiGeneratedProfile(generatedData);
            openNewProfile();
          }}
          onDismiss={() => {
            setShowOnboarding(false);
            if (profiles.length > 0) openHub();
            else openNewProfile();
          }}
        />
      )}

      <div className={`min-h-screen ${isDark ? "bg-[#0a0c14]" : "bg-[#f5f7fb]"}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-16 pt-3 sm:pt-6">

          {/* ── Global top bar ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BingooLogo className="h-8 w-auto object-contain hidden sm:block" />
              <div>
                <h1 className={`text-base font-black leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.full_name?.split(" ")[0] || "Dashboard"}
                </h1>
                <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>
                  {activeProfile ? activeProfile.display_name : "My Profiles"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleLang}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${isDark ? "bg-white/8 border border-white/12 text-white/50 hover:text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                {lang === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
              </button>
              <Link to="/account-settings">
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/8 text-white/40 hover:bg-white/15 hover:text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                  <Shield className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* ════════════════════════════════════
              HUB — My Profiles
          ════════════════════════════════════ */}
          {view === VIEW_HUB && (
            <ProfilesHub
              profiles={profiles}
              user={user}
              isDark={isDark}
              accountPlan={userPlan}
              defaultProfileId={user?.default_profile_id}
              onSetDefault={setDefaultProfile}
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
              ) : !planLoading && !canAccess("appointment_booking") ? (
                <PlanGateScreen feature="appointment_booking" isDark={isDark} />
              ) : (
                <AppointmentsTabMerged
                  profileId={activeProfile.id}
                  userId={user?.id}
                  isDark={isDark}
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
              ) : !planLoading && !canAccess("lead_collection") ? (
                <PlanGateScreen feature="lead_collection" isDark={isDark} />
              ) : (
                <LeadsPanel
                  profileId={activeProfile.id}
                  profileIds={profiles.map(p => p.id)}
                  user={user}
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
              ) : !planLoading && !canAccess("analytics") ? (
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
              ) : !planLoading && !canAccess("lost_mode") ? (
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
              CRM — first-class page
          ════════════════════════════════════ */}
          {view === VIEW_CRM && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccess("crm_pipeline") ? (
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
              ) : !planLoading && !canAccess("services") ? (
                <PlanGateScreen feature="services" isDark={isDark} />
              ) : (
                <SalonServicesPanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              HOURS — Business Hours
          ════════════════════════════════════ */}
          {view === VIEW_HOURS && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccess("business_hours") ? (
                <PlanGateScreen feature="business_hours" isDark={isDark} />
              ) : (
                <BusinessHoursTab profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              PRACTICE AREAS — Law Firm
          ════════════════════════════════════ */}
          {view === VIEW_PRACTICE && (
            <div>
              <ProfileChip />
              {!activeProfile ? (
                <NoProfileState isDark={isDark} onGoToProfiles={openHub} />
              ) : !planLoading && !canAccess("practice_areas") ? (
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
              ) : !planLoading && !canAccess("legal_services") ? (
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
              ) : !planLoading && !canAccess("office_locations") ? (
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
              ) : !planLoading && !canAccess("team_members") ? (
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
              ) : !planLoading && !canAccess("attendance") ? (
                <PlanGateScreen feature="attendance" isDark={isDark} />
              ) : (
                <AttendancePanel profileId={activeProfile.id} isDark={isDark} onSaved={() => {}} />
              )}
            </div>
          )}

          {/* ════════════════════════════════════
              RESUME — Pro individual / Pro plans
          ════════════════════════════════════ */}
          {view === VIEW_RESUME && (
            <div>
              <ProfileChip />
              {!planLoading && !canAccess("digital_resume") ? (
                <PlanGateScreen feature="digital_resume" isDark={isDark} />
              ) : (
                <ResumePanel user={user} profileId={activeProfile?.id} />
              )}
            </div>
          )}

        </div>
      </div>

      {/* Layout Picker Modal */}
      {activeProfile && (
        <div id="layout-picker-portal" />
      )}
    </BingooLayout>
  );
}