import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BingooLayout from "@/components/bingoo/BingooLayout";
import ProfileEditor from "@/components/bingoo/ProfileEditor";
import LeadsPanel from "@/components/bingoo/LeadsPanel";
import AnalyticsPanel from "@/components/bingoo/AnalyticsPanel";
import AppointmentsPanel from "@/components/bingoo/AppointmentsPanel";
import PortfolioPanel from "@/components/bingoo/PortfolioPanel";
import LayoutPicker from "@/components/bingoo/LayoutPicker";
import DesignTab from "@/components/bingoo/DesignTab";
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
import DashboardNav from "@/components/bingoo/DashboardNav";
import LivePreviewPanel from "@/components/bingoo/LivePreviewPanel";
import DashboardOverview from "@/components/bingoo/DashboardOverview";
import ProfilesHub from "@/components/bingoo/ProfilesHub";
import ProfileWorkspaceHeader from "@/components/bingoo/ProfileWorkspaceHeader";
import { usePlan } from "@/hooks/usePlan";
import { auditUserContext } from "@/lib/dbDebug";
import {
  Eye, Copy, Check, BarChart3, Star, Settings, TrendingUp, CalendarDays,
  Zap, Briefcase, Palette, Download, QrCode, FileText, Users, AlertTriangle,
  Shield, Scissors, Clock, GitBranch, UserCheck, Scale, Building2
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TABS_CONFIG = [
  { id: "overview",      labelKey: "overview",      icon: TrendingUp,   color: "#3b82f6" },
  { id: "profile",       labelKey: "editProfile",   icon: Settings,     color: "#8b5cf6" },
  { id: "appointments",  labelKey: "appointments",  icon: CalendarDays, color: "#10b981" },
  { id: "leads",         labelKey: "leads",         icon: Star,         color: "#f59e0b" },
  { id: "analytics",     labelKey: "analytics",     icon: BarChart3,    color: "#d97706" },
  { id: "portfolio",     labelKey: "portfolio",     icon: Briefcase,    color: "#8b5cf6" },
  { id: "resumes",       labelKey: "resumes",       icon: FileText,     color: "#6366f1" },
  { id: "connections",   labelKey: "connections",   icon: Users,        color: "#e11d48" },
  { id: "lost_mode",     labelKey: "lostMode",      icon: AlertTriangle, color: "#ef4444" },
  { id: "hours",         labelKey: "hours",         icon: Clock,        color: "#0891b2" },
];

// ── View states ──
// "hub"       → My Profiles list (default when no profile selected)
// "workspace" → Profile workspace for selectedProfileId
const VIEW_HUB = "hub";
const VIEW_WORKSPACE = "workspace";

export default function BingooDashboard() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // "view" controls hub vs workspace
  const view = searchParams.get("view") || VIEW_HUB;
  const tab = searchParams.get("tab") || "overview";

  // selectedProfileId: string = specific profile open in workspace
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
  const [liveFormOverride, setLiveFormOverride] = useState(null);
  const { isDark } = useBingooTheme();
  const { isSalon, isRestaurant, isBusiness, isFree, canAccess, plan: userPlan, isLawFirm, isCorporate, isLoading: planLoading } = usePlan();

  const hasServiceMenu = !planLoading && canAccess("service_menu");
  const hasTeam = !planLoading && (canAccess("staff_profiles") || canAccess("attorney_profiles") || canAccess("employee_profiles"));
  const hasCRM = !planLoading && canAccess("crm_pipeline");
  const hasAttendance = !planLoading && canAccess("attendance");

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

  // Active profile in workspace — resolves from selectedProfileId, falling back to first profile
  const activeProfile = selectedProfileId
    ? profiles.find(p => p.id === selectedProfileId) ?? profiles[0]
    : profiles[0];

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
  const openHub = () => {
    setLiveFormOverride(null);
    setSearchParams({});
  };

  const openWorkspace = (profileId, targetTab = "overview") => {
    setSelectedProfileId(profileId);
    setLiveFormOverride(null);
    setSearchParams({ view: VIEW_WORKSPACE, tab: targetTab });
  };

  const openNewProfile = () => {
    setSelectedProfileId(null);
    setLiveFormOverride(null);
    setSearchParams({ view: VIEW_WORKSPACE, tab: "profile" });
  };

  const setTab = (t) => {
    if (t !== "profile") setLiveFormOverride(null);
    setSearchParams({ view: VIEW_WORKSPACE, tab: t });
  };

  const goToOverview = () => {
    refetchProfiles();
    setTab("overview");
  };

  const launchAI = () => {
    localStorage.removeItem("bingoo_onboarding_done");
    setShowOnboarding(true);
  };

  // Computed profile URLs
  const profileAbsoluteUrl = activeProfile ? `${window.location.origin}/p/${activeProfile.username}` : null;
  const profileUrl = activeProfile ? `/p/${activeProfile.username}` : null;
  const profileQrUrl = profileAbsoluteUrl ? `${profileAbsoluteUrl}?source=qr` : null;
  const qrUrl = profileQrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=ffffff&bgcolor=1e293b`
    : null;

  const downloadBrandedQR = async () => {
    if (!profileQrUrl) return;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=1e293b&bgcolor=ffffff`;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 460;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 460);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.fillStyle = "#0B2E6B"; ctx.fillRect(0, 400, 400, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText("bingooconnect.com", 200, 433);
      ctx.fillStyle = "#FF7A00"; ctx.font = "bold 13px system-ui,sans-serif";
      ctx.fillText("Scan to connect", 200, 452);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `bingoo-qr-${activeProfile?.username || "profile"}.png`;
      a.click();
    };
    img.src = qrSrc;
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
    en: {
      overview: "Overview", editProfile: "Profile Studio", appointments: "Appointments",
      leads: "Leads", analytics: "Analytics", portfolio: "Portfolio",
      resumes: "Resumes", connections: "Connections", lostMode: "Lost Mode", hours: "Hours",
      profileViews: "Profile Views", yourProfile: "Your Profile",
      noProfile: "No profile yet", createCard: "Create your digital card to get started.",
      buildAI: "Build with AI", manual: "Manual",
      qrCode: "QR Code", scanQr: "Scan to open your profile", download: "Download",
      createFirst: "Create a profile first",
      recentLeads: "Recent Leads", viewAll: "View all",
      pushNotifs: "Push Notifications", pushDesc: "Get instant alerts for new leads & appointments",
      unlockPower: "Unlock Full Power", unlockDesc: "Pro analytics, lead capture, booking & unlimited devices.",
      viewPlans: "View Plans", copy: "Copy", copied: "Copied!",
      preview: "Preview", setupFirst: "Select a profile to get started.",
      activateDevice: "Activate Device",
    },
    fr: {
      overview: "Aperçu", editProfile: "Studio Profil", appointments: "Rendez-vous",
      leads: "Prospects", analytics: "Analytiques", portfolio: "Portfolio",
      resumes: "CV", connections: "Connexions", lostMode: "Mode Perdu", hours: "Horaires",
      profileViews: "Vues du Profil", yourProfile: "Votre Profil",
      noProfile: "Pas encore de profil", createCard: "Créez votre carte numérique pour commencer.",
      buildAI: "Créer avec l'IA", manual: "Manuel",
      qrCode: "Code QR", scanQr: "Scannez pour ouvrir votre profil", download: "Télécharger",
      createFirst: "Créez d'abord un profil",
      recentLeads: "Prospects Récents", viewAll: "Voir tout",
      pushNotifs: "Notifications Push", pushDesc: "Alertes instantanées pour les prospects & rendez-vous",
      unlockPower: "Débloquez Tout le Pouvoir", unlockDesc: "Analytics pro, prospects, réservations & appareils illimités.",
      viewPlans: "Voir les Forfaits", copy: "Copier", copied: "Copié!",
      preview: "Aperçu", setupFirst: "Sélectionnez un profil pour commencer.",
      activateDevice: "Activer l'Appareil",
    }
  };
  const tr = TR[lang];

  // Analytics computed
  const totalViews = analytics.filter(a => a.event_type === "profile_view").length;
  const totalClicks = analytics.filter(a => a.event_type !== "profile_view").length;
  const totalNfcTaps = analytics.filter(a => a.event_type === "nfc_tap").length;
  const totalQrScans = analytics.filter(a => a.event_type === "qr_scan").length;
  const totalWhatsApp = analytics.filter(a => a.event_type === "whatsapp_click").length;
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0);
  const leadsThisMonth = leads.filter(l => l.created_date && new Date(l.created_date) >= thisMonthStart).length;
  const apptsThisMonth = appointments.filter(a => a.created_date && new Date(a.created_date) >= thisMonthStart).length;
  const monthLabel = new Date().toLocaleString("en", { month: "long" });

  // Permission flags
  const explicitlyIndividual = user?.account_type === "individual";
  const isFreeIndividual = explicitlyIndividual && isFree;

  // Workspace tab list
  const BASE_TABS = TABS_CONFIG.map(t => ({ ...t, label: tr[t.labelKey] }));
  const TABS = [
    BASE_TABS[0], BASE_TABS[1],
    ...(!explicitlyIndividual ? [BASE_TABS[2]] : []),
    ...(!explicitlyIndividual ? [BASE_TABS[3]] : []),
    ...(isLawFirm && !explicitlyIndividual ? [
      { id: "services",       label: "Practice Areas",   icon: Scale,     color: "#6366f1" },
      { id: "legal_services", label: "Legal Services",   icon: Scale,     color: "#6366f1" },
      { id: "offices",        label: "Office Locations", icon: Building2, color: "#ef4444" },
    ] : []),
    ...(hasServiceMenu && !isLawFirm && !explicitlyIndividual ? [
      { id: "services", label: "Services", icon: Scissors, color: "#10b981" },
      { id: "hours",    label: tr.hours,   icon: Clock,    color: "#0891b2" },
    ] : []),
    ...(!explicitlyIndividual || canAccess("analytics") ? [BASE_TABS[4]] : []),
    BASE_TABS[5],
    ...(!isLawFirm && !isSalon ? BASE_TABS.slice(6, 7) : []),
    ...BASE_TABS.slice(7, 9),
    ...(hasTeam && !explicitlyIndividual ? [{ id: "team", label: isLawFirm ? "Attorneys" : "Team", icon: isLawFirm ? Scale : Users, color: "#0d9488" }] : []),
    ...(hasCRM && !explicitlyIndividual ? [{ id: "crm", label: isLawFirm ? "CRM Pipeline" : "CRM", icon: GitBranch, color: "#6366f1" }] : []),
    ...(hasAttendance && !explicitlyIndividual ? [{ id: "attendance", label: "Attendance", icon: UserCheck, color: "#10b981" }] : []),
  ];

  // ── Render: Hub (My Profiles) ──
  const isWorkspace = view === VIEW_WORKSPACE;

  return (
    <BingooLayout>
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

          {/* ── Global top bar (always visible) ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              {/* Bingoo wordmark */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)" }}>
                <span className="text-white font-black text-sm">B</span>
              </div>
              <div>
                <h1 className={`text-base font-black leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                  {user?.full_name?.split(" ")[0] || "Dashboard"}
                </h1>
                <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>
                  {isWorkspace && activeProfile ? activeProfile.display_name : "My Profiles"}
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

          {/* ── HUB: My Profiles ── */}
          {!isWorkspace && (
            <ProfilesHub
              profiles={profiles}
              user={user}
              isDark={isDark}
              onSelectProfile={openWorkspace}
              onCreateNew={openNewProfile}
              onLaunchAI={launchAI}
            />
          )}

          {/* ── WORKSPACE: Selected Profile ── */}
          {isWorkspace && (
            <>
              {/* Profile context header */}
              {activeProfile ? (
                <ProfileWorkspaceHeader
                  profile={activeProfile}
                  isDark={isDark}
                  onBack={openHub}
                  lang={lang}
                />
              ) : (
                /* New profile — minimal back header */
                <div className="rounded-2xl overflow-hidden mb-5"
                  style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", boxShadow: "0 4px 24px rgba(11,46,107,0.3)" }}>
                  <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)" }} />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <button onClick={openHub}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/15 text-white/60 hover:text-white transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div>
                      <p className="font-black text-sm text-white">New Profile</p>
                      <p className="text-xs text-white/50">Fill in your details below</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab nav — only show when there's an active profile */}
              {activeProfile && (
                <DashboardNav
                  tabs={TABS}
                  activeTab={tab}
                  setTab={setTab}
                  leads={leads}
                  appointments={appointments}
                  isDark={isDark}
                />
              )}

              {/* ── Tab panels ── */}
              {(tab === "overview" || !activeProfile) && activeProfile && (
                <DashboardOverview
                  profile={activeProfile}
                  user={user}
                  isDark={isDark}
                  analytics={analytics}
                  leads={leads}
                  appointments={appointments}
                  myNfcDevices={myNfcDevices}
                  salonServices={salonServices}
                  teamMembers={teamMembers}
                  tr={tr}
                  setTab={setTab}
                  copied={false}
                  copyLink={() => {}}
                  profileAbsoluteUrl={profileAbsoluteUrl}
                  profileUrl={profileUrl}
                  profileQrUrl={profileQrUrl}
                  qrUrl={qrUrl}
                  downloadBrandedQR={downloadBrandedQR}
                  launchAI={launchAI}
                  setShowLayoutPicker={setShowLayoutPicker}
                  totalViews={totalViews}
                  totalClicks={totalClicks}
                  totalNfcTaps={totalNfcTaps}
                  totalQrScans={totalQrScans}
                  totalWhatsApp={totalWhatsApp}
                  leadsThisMonth={leadsThisMonth}
                  apptsThisMonth={apptsThisMonth}
                  monthLabel={monthLabel}
                  isFreeIndividual={isFreeIndividual}
                />
              )}

              {tab === "profile" && (
                <div className="space-y-6">
                  <ProfileEditor
                    user={user}
                    editProfileId={activeProfile ? activeProfile.id : null}
                    prefillData={aiGeneratedProfile}
                    onSaved={(savedProfile) => {
                      setAiGeneratedProfile(null);
                      setLiveFormOverride(null);
                      if (savedProfile?.id && !selectedProfileId) {
                        setSelectedProfileId(savedProfile.id);
                      }
                      refetchProfiles();
                      goToOverview();
                    }}
                    onFormChange={setLiveFormOverride}
                    userPlan={userPlan}
                    isFreeIndividual={isFreeIndividual}
                  />
                  {activeProfile && (
                    <div className={`rounded-2xl overflow-hidden ${isDark ? "border border-white/8" : "border border-slate-200"}`}>
                      <div className={`flex items-center gap-2 px-5 py-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                        <Palette className="w-4 h-4" style={{ color: "#f97316" }} />
                        <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Design & Style</span>
                      </div>
                      <DesignTab profile={activeProfile} user={user} onSaved={goToOverview} />
                    </div>
                  )}
                  <a href="/shop"
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-opacity hover:opacity-80 ${isDark ? "border-white/10 bg-white/4" : "border-slate-200 bg-white"}`}
                    style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#0B2E6B' }}>
                    <span>Add a tap product to share this profile</span>
                    <span style={{ color: '#FF7A00' }}>Shop NFC →</span>
                  </a>
                </div>
              )}

              {tab === "appointments"   && activeProfile && (!planLoading && !canAccess("appointment_booking") ? <PlanGateScreen feature="appointment_booking" isDark={isDark} /> : <AppointmentsTabMerged profileId={activeProfile.id} userId={user?.id} isDark={isDark} onSaved={goToOverview} />)}
              {tab === "leads"          && activeProfile && (!planLoading && !canAccess("lead_collection") ? <PlanGateScreen feature="lead_collection" isDark={isDark} /> : <LeadsPanel profileId={activeProfile.id} profileIds={profiles.map(p => p.id)} user={user} onSaved={goToOverview} />)}
              {tab === "analytics"      && activeProfile && (!planLoading && !canAccess("analytics") ? <PlanGateScreen feature="analytics" isDark={isDark} /> : <AnalyticsPanel profileId={activeProfile.id} />)}
              {tab === "portfolio"      && activeProfile && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <PortfolioPanel profileId={activeProfile.id} user={user} onSaved={goToOverview} />)}
              {tab === "resumes"        && activeProfile && !isLawFirm && !isSalon && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <ResumePanel user={user} profileId={activeProfile.id} />)}
              {tab === "design"         && activeProfile && <DesignTab profile={activeProfile} user={user} onSaved={goToOverview} />}
              {tab === "connections"    && <ConnectionsPanel isDark={isDark} />}
              {tab === "lost_mode"      && activeProfile && (!planLoading && !canAccess("lost_mode") ? <PlanGateScreen feature="lost_mode" isDark={isDark} /> : <LostDeviceManager profileId={activeProfile.id} userId={user?.id} isDark={isDark} tr={tr} onSaved={goToOverview} />)}
              {tab === "services"       && activeProfile && (isLawFirm ? <PracticeAreasPanel profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} /> : (!planLoading && !canAccess("service_menu") ? <PlanGateScreen feature="service_menu" isDark={isDark} /> : <SalonServicesPanel profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} />))}
              {tab === "legal_services" && activeProfile && (!planLoading && !canAccess("legal_services") ? <PlanGateScreen feature="legal_services" isDark={isDark} /> : <LegalServicesPanel profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} />)}
              {tab === "offices"        && activeProfile && (!planLoading && !canAccess("practice_areas") ? <PlanGateScreen feature="practice_areas" isDark={isDark} /> : <OfficeLocationsPanel profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} />)}
              {tab === "team"           && activeProfile && (!planLoading && !hasTeam ? <PlanGateScreen feature="staff_profiles" isDark={isDark} /> : <TeamMembersPanel profileId={activeProfile.id} isDark={isDark} planLabel={userPlan} onSaved={goToOverview} />)}
              {tab === "crm"            && activeProfile && (!planLoading && !canAccess("crm_pipeline") ? <PlanGateScreen feature="crm_pipeline" isDark={isDark} /> : (isLawFirm ? <LegalLeadsDashboard profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} /> : <CRMPipelinePanel profileId={activeProfile.id} profileIds={profiles.map(p => p.id)} user={user} isDark={isDark} onSaved={goToOverview} />))}
              {tab === "attendance"     && activeProfile && (!planLoading && !canAccess("attendance") ? <PlanGateScreen feature="attendance" isDark={isDark} /> : <AttendancePanel profileId={activeProfile.id} isDark={isDark} />)}
              {tab === "hours"          && activeProfile && <BusinessHoursTab profileId={activeProfile.id} isDark={isDark} onSaved={goToOverview} />}
            </>
          )}

        </div>
      </div>

      {/* Live Preview Panel */}
      {isWorkspace && activeProfile && tab === "profile" && (
        <LivePreviewPanel
          key={activeProfile.id}
          profile={activeProfile}
          pendingProfile={liveFormOverride ? { ...activeProfile, ...liveFormOverride } : activeProfile}
          hasChanges={!!liveFormOverride}
          isDark={isDark}
          previewMode={tab}
          isLawFirm={isLawFirm}
        />
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? "bg-[#13162a] border border-white/10" : "bg-white border border-slate-200"}`}>
            <div className={`p-6 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Profile Style</h2>
                  <p className={`text-sm mt-0.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>Choose a layout for your public page</p>
                </div>
                <button onClick={() => setShowLayoutPicker(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"}`}>✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <LayoutPicker
                value={activeProfile.layout || "classic"}
                onChange={async (newLayout) => {
                  const CHAMPIONSHIP = new Set(["ny_championship", "lions_teranga"]);
                  const update = { layout: newLayout };
                  if (CHAMPIONSHIP.has(newLayout)) update.profile_layout = newLayout;
                  else if (CHAMPIONSHIP.has(activeProfile.profile_layout)) update.profile_layout = "default";
                  await base44.entities.Profile.update(activeProfile.id, update);
                  qc.invalidateQueries({ queryKey: ["public-profile", activeProfile.username] });
                  refetchProfiles();
                  setShowLayoutPicker(false);
                }}
                plan={activeProfile?.plan || "free"}
                isAdmin={user?.role === "admin"}
              />
            </div>
          </div>
        </div>
      )}
    </BingooLayout>
  );
}