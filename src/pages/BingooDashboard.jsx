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
import { usePlan } from "@/hooks/usePlan";
import { auditUserContext } from "@/lib/dbDebug";
import { Eye, Copy, Check, ExternalLink, BarChart3, Star, Smartphone, User, Settings, TrendingUp, CalendarDays, Calendar, Zap, ArrowRight, Briefcase, Palette, Download, QrCode, Search, X, FileText, Users, AlertTriangle, Shield, Scissors, Clock, GitBranch, UserCheck, Scale, LayoutList, Briefcase as LegalBriefcase, FileCheck, Building2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TABS_CONFIG = [
  { id: "overview",      labelKey: "overview",      icon: TrendingUp,   color: "#3b82f6" },
  { id: "profile",       labelKey: "editProfile",   icon: Settings,     color: "#8b5cf6" },
  { id: "appointments",  labelKey: "appointments",  icon: CalendarDays, color: "#10b981" },
  { id: "leads",         labelKey: "leads",         icon: Star,         color: "#f59e0b" },
  { id: "analytics",     labelKey: "analytics",     icon: BarChart3,    color: "#d97706" },
  { id: "portfolio",     labelKey: "portfolio",      icon: Briefcase,    color: "#8b5cf6" },
  // Design is now embedded inside Profile Studio — no standalone tab
  { id: "resumes",       labelKey: "resumes",       icon: FileText,     color: "#6366f1" },
  { id: "connections",   labelKey: "connections",   icon: Users,        color: "#e11d48" },
  { id: "lost_mode",     labelKey: "lostMode",      icon: AlertTriangle, color: "#ef4444" },
  { id: "hours",         labelKey: "hours",         icon: Clock,        color: "#0891b2" },
];

export default function BingooDashboard() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (t) => { if (t !== "profile") setLiveFormOverride(null); setSearchParams(t === "overview" ? {} : { tab: t }); };
  const [copied, setCopied] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(undefined); // undefined=first, null=new, string=specific
  const [profileSearch, setProfileSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
  const [liveFormOverride, setLiveFormOverride] = useState(null); // live form state from ProfileEditor
  const { isDark } = useBingooTheme();
  const { isSalon, isRestaurant, isBusiness, isFree, canAccess, plan: userPlan, isLawFirm, isCorporate, isLoading: planLoading } = usePlan();
  // Only compute flags once plan data is loaded to avoid premature gate screens
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

  // Show onboarding AI only for new users with no profiles
  useEffect(() => {
    if (!user) return;
    if (profiles.length === 0 && !localStorage.getItem("bingoo_onboarding_done")) {
      setShowOnboarding(true);
    }
  }, [user, profiles]);

  // Ownership repair — run on load, gate entity queries until confirmed
  const [ownershipReady, setOwnershipReady] = useState(false);
  useEffect(() => {
    if (!user) return;
    auditUserContext(base44).then((report) => {
      // After repair (or confirmation it's fine), invalidate RLS-gated queries
      if (report?.repaired) {
        refetchUser();
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["appointments"] });
        qc.invalidateQueries({ queryKey: ["analytics"] });
      }
      setOwnershipReady(true);
    }).catch(() => {
      // Don't block the UI if repair call fails
      setOwnershipReady(true);
    });
  }, [user?.id]);
  // Derive active profile
  const profile = selectedProfileId === null
    ? null
    : selectedProfileId
    ? profiles.find(p => p.id === selectedProfileId) ?? profiles[0]
    : profiles[0];
  const { data: leads = [] } = useQuery({
    queryKey: ["leads", profile?.id],
    queryFn: () => base44.entities.Lead.filter({ profile_id: profile.id }, "-created_date"),
    enabled: !!profile?.id,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: analytics = [] } = useQuery({
    queryKey: ["analytics-all", profile?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profile.id }),
    enabled: !!profile?.id && ownershipReady,
    refetchInterval: 15000,
    refetchOnMount: true,
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", profile?.id],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profile.id }, "-created_date"),
    enabled: !!profile?.id && ownershipReady,
    refetchOnMount: true,
  });
  const { data: myNfcDevices = [] } = useQuery({
    queryKey: ["my-nfc-devices", profile?.id],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: profile.id }),
    enabled: !!profile?.id,
  });
  const { data: salonServices = [] } = useQuery({
    queryKey: ["salon-services-count", profile?.id],
    queryFn: () => base44.entities.SalonService.filter({ profile_id: profile.id }),
    enabled: !!profile?.id && hasServiceMenu,
  });
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-count", profile?.id],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profile.id }),
    enabled: !!profile?.id && hasTeam,
  });

  // Real-time subscriptions for dashboard overview
  useEffect(() => {
    if (!profile?.id) return;
    const unsubLeads = base44.entities.Lead.subscribe((event) => {
      if (event.data?.profile_id === profile.id) qc.invalidateQueries({ queryKey: ["leads", profile.id] });
    });
    const unsubAppts = base44.entities.Appointment.subscribe((event) => {
      if (event.data?.profile_id === profile.id) qc.invalidateQueries({ queryKey: ["appointments", profile.id] });
    });
    const unsubAnalytics = base44.entities.Analytics.subscribe((event) => {
      if (event.data?.profile_id === profile.id) qc.invalidateQueries({ queryKey: ["analytics-all", profile.id] });
    });
    return () => { unsubLeads(); unsubAppts(); unsubAnalytics(); };
  }, [profile?.id]);

  const profileUrl = profile ? `/p/${profile.username}` : null;

  const copyLink = () => {
    navigator.clipboard.writeText(profileAbsoluteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const profileAbsoluteUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;
  // QR codes append ?source=qr so scans are tracked as qr_scan events
  const profileQrUrl = profileAbsoluteUrl ? `${profileAbsoluteUrl}?source=qr` : null;
  const qrUrl = profileQrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=ffffff&bgcolor=1e293b`
    : null;

  // Download QR with BingooConnect branding using canvas
  const downloadBrandedQR = async () => {
    if (!profileQrUrl) return;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=1e293b&bgcolor=ffffff`;
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 460;
      const ctx = canvas.getContext("2d");
      // white background
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 460);
      // QR
      ctx.drawImage(img, 0, 0, 400, 400);
      // branding strip
      ctx.fillStyle = "#0B2E6B"; ctx.fillRect(0, 400, 400, 60);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText("bingooconnect.com", 200, 433);
      ctx.fillStyle = "#FF7A00"; ctx.font = "bold 13px system-ui,sans-serif";
      ctx.fillText("Scan to connect", 200, 452);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `bingoo-qr-${profile?.username || "profile"}.png`;
      a.click();
    };
    img.src = qrSrc;
  };

  // Language toggle (persisted in localStorage)
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("bingoo_lang");
    if (saved) return saved;
    // Auto-detect from browser/phone language setting
    const browserLang = navigator.language || navigator.userLanguage || "en";
    return browserLang.toLowerCase().startsWith("fr") ? "fr" : "en";
  });
  const toggleLang = () => setLang(l => {
    const next = l === "en" ? "fr" : "en";
    localStorage.setItem("bingoo_lang", next);
    return next;
  });
  const TR = {
    en: {
      overview: "Overview", editProfile: "Profile Studio", appointments: "Appointments",
      calendar: "Calendar", leads: "Leads", myDevices: "My Devices", analytics: "Analytics",
      portfolio: "Portfolio", design: "Design", bookingSetup: "Booking Setup",
      resumes: "Resumes", connections: "Connections",
      profileViews: "Profile Views", linkClicks: "Link Clicks", leadsCaptured: "Leads Captured",
      yourProfile: "Your Profile", style: "Style", viewLive: "View Live", edit: "Edit",
      noProfile: "No profile yet", createCard: "Create your digital card to get started.",
      buildAI: "Build with AI", manual: "Manual",
      qrCode: "QR Code", scanQr: "Scan to open your profile", download: "Download",
      createFirst: "Create a profile first",
      recentLeads: "Recent Leads", viewAll: "View all",
      pushNotifs: "Push Notifications", pushDesc: "Get instant alerts for new leads & appointments",
      unlockPower: "Unlock Full Power 🚀", unlockDesc: "Pro analytics, lead capture, booking & unlimited devices.",
      viewPlans: "View Plans", copy: "Copy", copied: "Copied!",
      preview: "Preview", setupFirst: "Set up your first profile to get started.",
      activateDevice: "Activate Device", searchProfiles: "Search profiles…",
      newProfile: "+ New Profile", aiBuilder: "AI Builder",
      lostMode: "Lost Mode",
      hours: "Hours",
    },
    fr: {
      overview: "Aperçu", editProfile: "Studio Profil", appointments: "Rendez-vous",
      calendar: "Calendrier", leads: "Prospects", myDevices: "Mes Appareils", analytics: "Analytiques",
      portfolio: "Portfolio", design: "Design", bookingSetup: "Config. Réservation",
      resumes: "CV", connections: "Connexions",
      profileViews: "Vues du Profil", linkClicks: "Clics sur Liens", leadsCaptured: "Prospects Capturés",
      yourProfile: "Votre Profil", style: "Style", viewLive: "Voir en Direct", edit: "Modifier",
      noProfile: "Pas encore de profil", createCard: "Créez votre carte numérique pour commencer.",
      buildAI: "Créer avec l'IA", manual: "Manuel",
      qrCode: "Code QR", scanQr: "Scannez pour ouvrir votre profil", download: "Télécharger",
      createFirst: "Créez d'abord un profil",
      recentLeads: "Prospects Récents", viewAll: "Voir tout",
      pushNotifs: "Notifications Push", pushDesc: "Alertes instantanées pour les prospects & rendez-vous",
      unlockPower: "Débloquez Tout le Pouvoir 🚀", unlockDesc: "Analytics pro, prospects, réservations & appareils illimités.",
      viewPlans: "Voir les Forfaits", copy: "Copier", copied: "Copié!",
      preview: "Aperçu", setupFirst: "Configurez votre premier profil pour commencer.",
      activateDevice: "Activer l'Appareil", searchProfiles: "Rechercher des profils…",
      newProfile: "+ Nouveau Profil", aiBuilder: "Créateur IA",
      lostMode: "Mode Perdu",
      hours: "Horaires",
    }
  };
  const tr = TR[lang];

  const totalViews = analytics.filter(a => a.event_type === "profile_view").length;
  const totalClicks = analytics.filter(a => a.event_type !== "profile_view").length;
  const totalNfcTaps = analytics.filter(a => a.event_type === "nfc_tap").length;
  const totalQrScans = analytics.filter(a => a.event_type === "qr_scan").length;
  const totalWhatsApp = analytics.filter(a => a.event_type === "whatsapp_click").length;

  // This-month counts
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0);
  const leadsThisMonth = leads.filter(l => l.created_date && new Date(l.created_date) >= thisMonthStart).length;
  const apptsThisMonth = appointments.filter(a => a.created_date && new Date(a.created_date) >= thisMonthStart).length;
  const monthLabel = new Date().toLocaleString("en", { month: "long" });

  // Theme-aware tokens
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardStyle = { background: bg, border: `1px solid ${border}` };
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const rowBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const btnOutline = isDark
    ? "border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30"
    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  const tabBarBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const tabBarBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const heroBg = isDark
    ? "linear-gradient(135deg, #1a1f35 0%, #0f1628 50%, #1a1030 100%)"
    : "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f3e8ff 100%)";
  const heroBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.15)";

  const BASE_TABS = TABS_CONFIG.map(t => ({ ...t, label: tr[t.labelKey] }));

  // account_type guard:
  // - undefined/null → legacy user, show full tab set (no hiding)
  // - "individual"   → explicitly individual, hide business-only tabs
  // - "business"     → show business tabs (controlled by plan/canAccess as before)
  const explicitlyIndividual = user?.account_type === "individual";

  // Build tab list — Design is embedded in Profile Studio; Calendar/Booking merged into Appointments
  const TABS = [
    BASE_TABS[0], // overview
    BASE_TABS[1], // profile
    // Appointments — hide for explicit individual accounts
    ...(!explicitlyIndividual ? [BASE_TABS[2]] : []),
    // Leads — hide for explicit individual accounts
    ...(!explicitlyIndividual ? [BASE_TABS[3]] : []),
    // Law Firm extras — only for business accounts (or legacy)
    ...(isLawFirm && !explicitlyIndividual ? [
      { id: "services",       label: "Practice Areas",  icon: Scale,     color: "#6366f1" },
      { id: "legal_services", label: "Legal Services",  icon: Scale,     color: "#6366f1" },
      { id: "offices",        label: "Office Locations", icon: Building2, color: "#ef4444" },
    ] : []),
    // Salon/Restaurant extras — only for business accounts (or legacy)
    ...(hasServiceMenu && !isLawFirm && !explicitlyIndividual ? [
      { id: "services", label: "Services", icon: Scissors, color: "#10b981" },
      { id: "hours",    label: tr.hours,   icon: Clock,    color: "#0891b2" },
    ] : []),
    // analytics, portfolio
    ...BASE_TABS.slice(4, 6),
    // Resumes — hide for law firms and salons
    ...(!isLawFirm && !isSalon ? BASE_TABS.slice(6, 7) : []),
    // connections, lost_mode
    ...BASE_TABS.slice(7, 9),
    // Team/Attorneys — only for business accounts (or legacy)
    ...(hasTeam && !explicitlyIndividual ? [{ id: "team", label: isLawFirm ? "Attorneys" : "Team", icon: isLawFirm ? Scale : Users, color: "#0d9488" }] : []),
    // CRM — only for business accounts (or legacy)
    ...(hasCRM && !explicitlyIndividual ? [{ id: "crm", label: isLawFirm ? "CRM Pipeline" : "CRM", icon: GitBranch, color: "#6366f1" }] : []),
    // Attendance
    ...(hasAttendance && !explicitlyIndividual ? [{ id: "attendance", label: "Attendance", icon: UserCheck, color: "#10b981" }] : []),
  ];

  const goToOverview = () => {
    refetchProfiles();
    setTab("overview");
  };

  const launchAI = () => {
    localStorage.removeItem("bingoo_onboarding_done");
    setShowOnboarding(true);
  };

  return (
    <BingooLayout>
      {showOnboarding && user && (
        <AIOnboardingAssistant
          userName={user.full_name}
          user={user}
          onComplete={(generatedData) => {
            setShowOnboarding(false);
            setAiGeneratedProfile(generatedData);
            setSelectedProfileId(null);
            setTab("profile");
          }}
          onDismiss={() => {
            setShowOnboarding(false);
            setTab("profile");
          }}
        />
      )}
      <div className={`min-h-screen ${isDark ? "bg-[#0a0c14]" : "bg-[#f5f7fb]"}`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-16 pt-3 sm:pt-6">

          {/* ── Bingoo Branded Hero ── */}
          <div className="relative rounded-3xl overflow-hidden mb-6"
            style={{
              background: "linear-gradient(135deg, #0B2E6B 0%, #1a4a9e 60%, #0f3080 100%)",
              boxShadow: "0 4px 32px rgba(11,46,107,0.35), 0 1px 0 rgba(255,255,255,0.08)"
            }}>
            {/* Orange/gold accent bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, #FF7A00, #FDBA21, #FF7A00)` }} />
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,122,0,0.08)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(255,255,255,0.03)" }} />
            <div className="p-4 md:p-7 relative">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1 text-white/50">Dashboard</p>
                  <h1 className="text-xl md:text-3xl font-black leading-tight tracking-tight text-white">
                    {user?.full_name?.split(" ")[0] || "Hello"} <span className="inline-block animate-bounce">👋</span>
                  </h1>
                  {profile ? (
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <Link to={profileUrl}
                        className="text-blue-300 text-sm font-bold hover:text-white hover:underline flex items-center gap-1">
                        /p/{profile.username}
                      </Link>
                      <button onClick={copyLink}
                        className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1 transition-all font-semibold bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? tr.copied : tr.copy}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm mt-1.5 text-white/50">{tr.setupFirst}</p>
                  )}
                </div>
                {profile && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white/10 text-white border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {profile.plan?.toUpperCase() || "FREE"}
                    </span>
                    <button onClick={toggleLang}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20">
                      {lang === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
                    </button>
                    <a href={profileAbsoluteUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-full font-bold gap-1.5 text-xs text-white border-0 shadow-md" style={{ background: "#FF7A00" }}>
                        <Eye className="w-3.5 h-3.5" /> {tr.preview}
                      </Button>
                    </a>

                    <Link to="/account-settings">
                      <Button size="sm" variant="ghost" className="rounded-full gap-1.5 text-xs font-bold text-white/50 hover:text-white hover:bg-white/10">
                        <Shield className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Profile Switcher ── */}
          {profiles.length > 0 && (
            <div className="mb-2">
              <div className="relative">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
                <input
                  type="text"
                  placeholder={tr.searchProfiles}
                  value={profileSearch}
                  onChange={e => setProfileSearch(e.target.value)}
                  className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all ${
                    isDark
                      ? "bg-white/5 border border-white/8 text-white placeholder:text-white/25 focus:border-white/18 focus:bg-white/7"
                      : "bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  }`}
                />
                {profileSearch && (
                  <button onClick={() => setProfileSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
          {profiles.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {profiles.filter(p => {
                if (!profileSearch.trim()) return true;
                const q = profileSearch.toLowerCase();
                return p.display_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q) || p.job_title?.toLowerCase().includes(q);
              }).map(p => {
                const isSelected = (profile?.id === p.id && selectedProfileId !== null) || (selectedProfileId === undefined && p.id === profiles[0]?.id);
                return (
                  <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setTab("overview"); }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                      isSelected
                        ? (isDark ? "bg-white/12 border-white/18 text-white shadow-sm" : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200")
                        : (isDark ? "border-white/10 text-white/45 hover:bg-white/8 hover:text-white/75" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700")
                    }`}>
                    {p.profile_photo
                      ? <img src={p.profile_photo} className="w-5 h-5 rounded-full object-cover" alt="" />
                      : <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: p.cover_color || "#2563eb" }}>{p.display_name?.charAt(0)}</span>
                    }
                    <span className="max-w-[120px] truncate">{p.display_name || p.username}</span>
                  </button>
                );
              })}
              <button onClick={() => { setSelectedProfileId(null); setTab("profile"); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  selectedProfileId === null
                    ? (isDark ? "bg-emerald-500/18 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                    : (isDark ? "border-white/10 border-dashed text-white/35 hover:text-white/60" : "border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600")
                }`}>
                {tr.newProfile}
              </button>
              <button onClick={launchAI}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${isDark ? "border-violet-400/30 text-violet-400 hover:bg-violet-400/10" : "border-violet-300 text-violet-600 hover:bg-violet-50"}`}>
                <Zap className="w-3.5 h-3.5" /> {tr.aiBuilder}
              </button>
            </div>
          )}

          {/* ── App Launcher Nav ── */}
          <DashboardNav
            tabs={TABS}
            activeTab={tab}
            setTab={setTab}
            leads={leads}
            appointments={appointments}
            isDark={isDark}
          />

          {/* ── Overview Tab ── */}
          {tab === "overview" && (
            <DashboardOverview
              profile={profile}
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
              copied={copied}
              copyLink={copyLink}
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
            />
          )}

          {tab === "profile"        && (
            <div className="space-y-6">
              <ProfileEditor user={user} editProfileId={selectedProfileId} prefillData={aiGeneratedProfile} onSaved={() => { setAiGeneratedProfile(null); setLiveFormOverride(null); goToOverview(); }} onFormChange={setLiveFormOverride} userPlan={userPlan} />
              <div className={`rounded-2xl overflow-hidden ${isDark ? "border border-white/8" : "border border-slate-200"}`}>
                <div className={`flex items-center gap-2 px-5 py-3 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                  <Palette className="w-4 h-4" style={{ color: "#f97316" }} />
                  <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Design & Style</span>
                </div>
                <DesignTab profile={profile} user={user} onSaved={goToOverview} />
              </div>
              {/* Shop CTA — profile studio */}
              <a href="/shop"
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-opacity hover:opacity-80 ${isDark ? "border-white/10 bg-white/4" : "border-slate-200 bg-white"}`}
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#0B2E6B' }}>
                <span>📲 Add a tap product to share this profile</span>
                <span style={{ color: '#FF7A00' }}>Shop NFC →</span>
              </a>
            </div>
          )}
           {tab === "appointments"  && (!planLoading && !canAccess("appointment_booking") ? <PlanGateScreen feature="appointment_booking" isDark={isDark} /> : <AppointmentsTabMerged profileId={profile?.id} userId={user?.id} isDark={isDark} onSaved={goToOverview} />)}
           {tab === "leads"         && (!planLoading && !canAccess("lead_collection") ? <PlanGateScreen feature="lead_collection" isDark={isDark} /> : <LeadsPanel profileId={profile?.id} profileIds={profiles.map(p => p.id)} user={user} onSaved={goToOverview} />)}
           {tab === "analytics"     && (!planLoading && !canAccess("analytics") ? <PlanGateScreen feature="analytics" isDark={isDark} /> : <AnalyticsPanel profileId={profile?.id} />)}
           {tab === "portfolio"     && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <PortfolioPanel profileId={profile?.id} user={user} onSaved={goToOverview} />)}
           {tab === "resumes"       && !isLawFirm && !isSalon && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <ResumePanel user={user} profileId={profile?.id} />)}
           {tab === "design"        && <DesignTab profile={profile} user={user} onSaved={goToOverview} />}
           {tab === "connections"   && <ConnectionsPanel isDark={isDark} />}
           {tab === "lost_mode"     && (!planLoading && !canAccess("lost_mode") ? <PlanGateScreen feature="lost_mode" isDark={isDark} /> : <LostDeviceManager profileId={profile?.id} userId={user?.id} isDark={isDark} tr={tr} onSaved={goToOverview} />)}
           {tab === "services"      && (isLawFirm ? <PracticeAreasPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} /> : (!planLoading && !canAccess("service_menu") ? <PlanGateScreen feature="service_menu" isDark={isDark} /> : <SalonServicesPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />))}
           {tab === "legal_services"&& (!planLoading && !canAccess("legal_services") ? <PlanGateScreen feature="legal_services" isDark={isDark} /> : <LegalServicesPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />)}
           {tab === "offices"       && (!planLoading && !canAccess("practice_areas") ? <PlanGateScreen feature="practice_areas" isDark={isDark} /> : <OfficeLocationsPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />)}
           {tab === "team"          && (!planLoading && !hasTeam ? <PlanGateScreen feature="staff_profiles" isDark={isDark} /> : <TeamMembersPanel profileId={profile?.id} isDark={isDark} planLabel={userPlan} onSaved={goToOverview} />)}
           {tab === "crm"           && (!planLoading && !canAccess("crm_pipeline") ? <PlanGateScreen feature="crm_pipeline" isDark={isDark} /> : (isLawFirm ? <LegalLeadsDashboard profileId={profile?.id} isDark={isDark} onSaved={goToOverview} /> : <CRMPipelinePanel profileId={profile?.id} profileIds={profiles.map(p => p.id)} user={user} isDark={isDark} onSaved={goToOverview} />))}
           {tab === "attendance"    && (!planLoading && !canAccess("attendance") ? <PlanGateScreen feature="attendance" isDark={isDark} /> : <AttendancePanel profileId={profile?.id} isDark={isDark} />)}
           {tab === "hours"         && <BusinessHoursTab profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />}

        </div>
      </div>

      {/* ── Global Live Preview Panel ── always uses activeProfile.id as key to prevent stale renders ── */}
      {profile && tab === "profile" && (
        <LivePreviewPanel
          key={profile.id}
          profile={profile}
          pendingProfile={liveFormOverride ? { ...profile, ...liveFormOverride } : profile}
          hasChanges={tab === "profile" && !!liveFormOverride}
          isDark={isDark}
          previewMode={tab}
          isLawFirm={isLawFirm}
        />
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? "bg-[#13162a] border border-white/10" : "bg-white border border-slate-200"}`}>
            <div className={`p-6 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-black ${headText}`}>Profile Style</h2>
                  <p className={`text-sm mt-0.5 ${mutedText}`}>Choose a layout for your public page</p>
                </div>
                <button onClick={() => setShowLayoutPicker(false)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-400"}`}>✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <LayoutPicker
                value={profile.layout || "classic"}
                onChange={async (newLayout) => {
                  const CHAMPIONSHIP = new Set(["ny_championship", "lions_teranga"]);
                  const update = { layout: newLayout };
                  if (CHAMPIONSHIP.has(newLayout)) {
                    update.profile_layout = newLayout;
                  } else if (CHAMPIONSHIP.has(profile.profile_layout)) {
                    update.profile_layout = "default";
                  }
                  await base44.entities.Profile.update(profile.id, update);
                  qc.invalidateQueries({ queryKey: ["public-profile", profile.username] });
                  refetchProfiles();
                  setShowLayoutPicker(false);
                }}
                plan={profile?.plan || "free"}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          </div>
        </div>
      )}
    </BingooLayout>
  );
}