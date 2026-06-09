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
import CalendarView from "@/components/bingoo/CalendarView";
import AIOnboardingAssistant from "@/components/bingoo/AIOnboardingAssistant";
import AppointmentSettings from "@/components/bingoo/AppointmentSettings";

import ResumePanel from "@/components/bingoo/ResumePanel";
import PushNotificationToggle from "@/components/bingoo/PushNotificationToggle";
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
  { id: "calendar",      labelKey: "calendar",      icon: Calendar,     color: "#06b6d4" },
  { id: "leads",         labelKey: "leads",         icon: Star,         color: "#f59e0b" },
  { id: "analytics",     labelKey: "analytics",     icon: BarChart3,    color: "#ec4899" },
  { id: "portfolio",     labelKey: "portfolio",     icon: Briefcase,    color: "#8b5cf6" },
  { id: "design",        labelKey: "design",        icon: Palette,      color: "#ec4899" },
  { id: "appt_settings", labelKey: "bookingSetup",  icon: Settings,     color: "#0d9488" },
  { id: "resumes",       labelKey: "resumes",       icon: FileText,     color: "#6366f1" },
  { id: "connections",   labelKey: "connections",   icon: Users,        color: "#0d9488" },
  { id: "lost_mode",    labelKey: "lostMode",      icon: AlertTriangle, color: "#ef4444" },
  { id: "hours",        labelKey: "hours",         icon: Clock,        color: "#0891b2" },
];

export default function BingooDashboard() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (t) => setSearchParams(t === "overview" ? {} : { tab: t });
  const [copied, setCopied] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(undefined); // undefined=first, null=new, string=specific
  const [profileSearch, setProfileSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiGeneratedProfile, setAiGeneratedProfile] = useState(null);
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
    enabled: !!profile?.id && ownershipReady,
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

  const profileUrl = profile ? `https://bingooconnect.com/p/${profile.username}` : null;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}&color=ffffff&bgcolor=1e293b`
    : null;

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
      overview: "Overview", editProfile: "Edit Profile", appointments: "Appointments",
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
      overview: "Aperçu", editProfile: "Modifier le Profil", appointments: "Rendez-vous",
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
  const statVal = isDark ? "text-white" : "text-slate-900";
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

  const BASE_TABS = TABS_CONFIG.map(t => t.id === "hours" ? null : ({ ...t, label: tr[t.labelKey] })).filter(Boolean);
  const TABS = [
    ...BASE_TABS.slice(0, 5),
    // Law Firm: Practice Areas, Legal Services, Attorneys, Office Locations
    ...(isLawFirm ? [
      { id: "services",    label: "Practice Areas",  icon: Scale,         color: "#0B2E6B" },
      { id: "legal_services", label: "Legal Services", icon: Scale,       color: "#0B2E6B" },
      { id: "offices",     label: "Office Locations", icon: Building2,    color: "#0B2E6B" },
    ] : []),
    // Salon/Restaurant: Services + Hours
    ...(hasServiceMenu && !isLawFirm ? [
      { id: "services",    label: "Services",        icon: Scissors,      color: "#db2777" },
      { id: "hours",       label: tr.hours,          icon: Clock,         color: "#0891b2" },
    ] : []),
    // Hide resumes for law firms and salon
    ...(hasServiceMenu && !isLawFirm ? BASE_TABS.slice(5).filter(t => t.id !== "resumes") : BASE_TABS.slice(5).filter(t => (isLawFirm || isSalon) ? t.id !== "resumes" : true)),
    // Team/Attorneys
    ...(hasTeam ? [{ id: "team", label: isLawFirm ? "Attorneys" : "Team", icon: isLawFirm ? Scale : Users, color: "#0B2E6B" }] : []),
    // CRM (Law Firm shows as CRM Pipeline)
    ...(hasCRM ? [{ id: "crm", label: isLawFirm ? "CRM Pipeline" : "CRM", icon: GitBranch, color: "#6366f1" }] : []),
    // Attendance
    ...(hasAttendance ? [{ id: "attendance", label: "Attendance", icon: UserCheck, color: "#10b981" }] : []),
  ];

  const STAT_CONFIGS = [
    { label: tr.profileViews,  value: totalViews,   icon: Eye,       gradient: "from-blue-500 to-blue-600",   shadow: isDark ? "shadow-blue-900/40" : "shadow-blue-200" },
    { label: tr.linkClicks,    value: totalClicks,  icon: BarChart3, gradient: "from-violet-500 to-violet-600", shadow: isDark ? "shadow-violet-900/40" : "shadow-violet-200" },
    { label: tr.leadsCaptured, value: leads.length, icon: Star,      gradient: "from-amber-500 to-amber-600", shadow: isDark ? "shadow-amber-900/40" : "shadow-amber-200" },
    { label: tr.appointments,  value: appointments.filter(a=>a.status==="pending").length, icon: CalendarDays, gradient: "from-emerald-500 to-emerald-600", shadow: isDark ? "shadow-emerald-900/40" : "shadow-emerald-200" },
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
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-300 text-sm font-bold hover:text-white hover:underline flex items-center gap-1">
                        /p/{profile.username} <ExternalLink className="w-3 h-3" />
                      </a>
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
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
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

          {/* ── iOS Tab Bar ── */}
          <div className={`relative flex gap-0.5 rounded-2xl p-1 mb-4 sm:mb-6 overflow-x-auto scrollbar-none`}
            style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(0,0,0,0.04)" }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const leadBadge = t.id === "leads" && leads.length > 0 ? leads.length : null;
              const apptBadge = t.id === "appointments" ? appointments.filter(a => a.status === "pending").length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? (isDark ? "text-white" : "text-slate-900")
                      : (isDark ? "text-white/35 hover:text-white/65 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-black/4")
                  }`}
                  style={isActive ? {
                    background: isDark ? "rgba(255,255,255,0.1)" : "#fff",
                    boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
                  } : {}}>
                  <t.icon className="w-3.5 h-3.5 flex-shrink-0" style={isActive ? { color: t.color } : {}} />
                  <span style={isActive ? { color: t.color } : {}}>{t.label}</span>
                  {leadBadge && <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center px-1">{leadBadge}</span>}
                  {apptBadge > 0 && <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center px-1">{apptBadge}</span>}
                </button>
              );
            })}
          </div>

          {/* ── Overview Tab ── */}
          {tab === "overview" && (
          <div className="space-y-5">

            {/* This Month Summary */}
            {profile && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTab("leads")}
                  className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)", boxShadow: "0 4px 20px rgba(255,122,0,0.3)" }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">{monthLabel}</p>
                  <p className="text-3xl font-black text-white">{leadsThisMonth}</p>
                  <p className="text-sm font-semibold text-white/80 mt-0.5">New Leads</p>
                  <p className="text-[11px] text-white/50 mt-1">{leads.length} total → View all</p>
                </button>
                <button onClick={() => setTab("appointments")}
                  className="relative rounded-2xl p-4 overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", boxShadow: "0 4px 20px rgba(11,46,107,0.35)", border: "1px solid rgba(255,122,0,0.2)" }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(255,122,0,0.12)" }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{monthLabel}</p>
                  <p className="text-3xl font-black text-white">{apptsThisMonth}</p>
                  <p className="text-sm font-semibold text-white/80 mt-0.5">Appointments</p>
                  <p className="text-[11px] text-white/40 mt-1">{appointments.filter(a => a.status === "pending").length} pending → View all</p>
                </button>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {STAT_CONFIGS.map(s => (
                <div key={s.label}
                  className={`relative rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-200 group cursor-default ${isDark ? "bg-white/5 hover:bg-white/7" : "bg-white hover:shadow-md"}`}
                  style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
                  <div className={`w-8 h-8 rounded-xl mb-2.5 flex items-center justify-center bg-gradient-to-br ${s.gradient} shadow-md ${s.shadow}`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={`text-xl font-black tracking-tight ${statVal}`}>{s.value}</p>
                  <p className={`text-[11px] mt-0.5 font-medium ${mutedText}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile + QR row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
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
                            ? <img src={profile.profile_photo} className={`w-10 h-10 rounded-full border-3 shadow object-cover ${isDark ? "border-slate-800" : "border-slate-50"}`} style={{ borderWidth: "3px" }} alt="" />
                            : <div className="w-10 h-10 rounded-full shadow flex items-center justify-center font-black text-white text-base" style={{ background: profile.cover_color || "#2563eb", border: isDark ? "3px solid #1e293b" : "3px solid #f8fafc" }}>{profile.display_name?.charAt(0)}</div>
                          }
                        </div>
                        <p className={`font-bold text-sm ${headText}`}>{profile.display_name}</p>
                        <p className="text-xs font-semibold" style={{ color: profile.cover_color || "#3b82f6" }}>{profile.job_title}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 gap-1.5 text-xs text-white font-bold shadow-md shadow-blue-500/20" size="sm">
                          <Eye className="w-3.5 h-3.5" /> {tr.viewLive}
                        </Button>
                      </a>
                      <Button size="sm" onClick={() => setTab("profile")}
                        className={`rounded-xl gap-1.5 font-bold text-xs ${isDark ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40" : "bg-slate-800 hover:bg-slate-700 text-white shadow-md"}`}>
                        <Settings className="w-3.5 h-3.5" /> {tr.edit}
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
                      <Button onClick={() => setTab("profile")} size="sm" variant="outline" className="rounded-xl font-bold">{tr.manual}</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className={`rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
                <div className="p-4 pb-2">
                  <p className={`font-bold text-sm ${headText}`}>{tr.qrCode}</p>
                </div>
                {qrUrl ? (
                  <div className="text-center px-4 pb-4">
                    <div className={`rounded-2xl p-3 inline-block ${isDark ? "bg-slate-800/70" : "bg-slate-100"}`}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}&color=${isDark ? "ffffff" : "1e293b"}&bgcolor=${isDark ? "1e293b" : "f8fafc"}`}
                        alt="QR Code" className="w-36 h-36 mx-auto rounded-lg" />
                    </div>
                    <p className={`text-xs mt-2.5 ${mutedText}`}>{tr.scanQr}</p>
                    <a href={qrUrl} download="bingoo-qr.png" target="_blank" rel="noopener noreferrer" className="inline-block mt-2.5">
                      <Button size="sm" className={`rounded-xl gap-1.5 text-xs font-bold ${isDark ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-900/30" : "bg-slate-800 hover:bg-slate-700 text-white"}`}>
                        <Download className="w-3.5 h-3.5" /> {tr.download}
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <QrCode className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                    <p className={`text-sm ${mutedText}`}>{tr.createFirst}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            {leads.length > 0 && (
              <div className={`rounded-2xl ${isDark ? "bg-white/5" : "bg-white"}`}
                style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between p-4 pb-3">
                  <p className={`font-bold text-sm ${headText}`}>{tr.recentLeads}</p>
                  <button onClick={() => setTab("leads")} className="text-xs text-blue-500 font-semibold hover:text-blue-400 flex items-center gap-1">
                    {tr.viewAll} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-4 pb-4 space-y-1.5">
                  {leads.slice(0, 3).map(l => (
                    <div key={l.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-white/4 hover:bg-white/7" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                        {l.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-sm ${headText}`}>{l.name || "Anonymous"}</p>
                        <p className={`text-xs truncate ${mutedText}`}>{l.email || l.phone || "No contact"}</p>
                      </div>
                      <p className={`text-xs flex-shrink-0 ${mutedText}`}>{l.created_date?.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Push Notifications */}
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

            {/* Upgrade CTA */}
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
                    <Button className="rounded-xl font-bold gap-2 text-white border-none"
                      style={{ background: "#FF7A00" }}>
                      {tr.viewPlans} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

          {tab === "profile"        && <ProfileEditor user={user} editProfileId={selectedProfileId} prefillData={aiGeneratedProfile} onSaved={() => { setAiGeneratedProfile(null); goToOverview(); }} />}
           {tab === "appointments"  && (!planLoading && !canAccess("appointment_booking") ? <PlanGateScreen feature="appointment_booking" isDark={isDark} /> : <AppointmentsPanel profileId={profile?.id} userId={user?.id} onSaved={goToOverview} />)}
           {tab === "calendar"      && (!planLoading && !canAccess("appointment_booking") ? <PlanGateScreen feature="appointment_booking" isDark={isDark} /> : <CalendarView profileId={profile?.id} />)}
           {tab === "leads"         && (!planLoading && !canAccess("lead_collection") ? <PlanGateScreen feature="lead_collection" isDark={isDark} /> : <LeadsPanel profileId={profile?.id} onSaved={goToOverview} />)}
           {tab === "analytics"     && (!planLoading && !canAccess("analytics") ? <PlanGateScreen feature="analytics" isDark={isDark} /> : <AnalyticsPanel profileId={profile?.id} />)}
           {tab === "portfolio"     && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <PortfolioPanel profileId={profile?.id} user={user} onSaved={goToOverview} />)}
           {tab === "design"        && <DesignTab profile={profile} user={user} onSaved={goToOverview} />}
           {tab === "appt_settings" && (!planLoading && !canAccess("appointment_booking") ? <PlanGateScreen feature="appointment_booking" isDark={isDark} /> : <AppointmentSettings profileId={profile?.id} onSaved={goToOverview} />)}
           {tab === "resumes"       && !isLawFirm && !isSalon && (!planLoading && !canAccess("portfolio") ? <PlanGateScreen feature="portfolio" isDark={isDark} /> : <ResumePanel user={user} profileId={profile?.id} />)}
           {tab === "connections"   && <ConnectionsPanel isDark={isDark} />}
           {tab === "lost_mode"     && (!planLoading && !canAccess("lost_mode") ? <PlanGateScreen feature="lost_mode" isDark={isDark} /> : <LostDeviceManager profileId={profile?.id} userId={user?.id} isDark={isDark} tr={tr} onSaved={goToOverview} />)}
           {tab === "services"      && (isLawFirm ? <PracticeAreasPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} /> : (!planLoading && !canAccess("service_menu") ? <PlanGateScreen feature="service_menu" isDark={isDark} /> : <SalonServicesPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />))}
           {tab === "legal_services"&& (!planLoading && !canAccess("legal_services") ? <PlanGateScreen feature="legal_services" isDark={isDark} /> : <LegalServicesPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />)}
           {tab === "offices"       && (!planLoading && !canAccess("practice_areas") ? <PlanGateScreen feature="practice_areas" isDark={isDark} /> : <OfficeLocationsPanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />)}
           {tab === "team"          && (!planLoading && !hasTeam ? <PlanGateScreen feature="staff_profiles" isDark={isDark} /> : <TeamMembersPanel profileId={profile?.id} isDark={isDark} planLabel={userPlan} onSaved={goToOverview} />)}
           {tab === "crm"           && (!planLoading && !canAccess("crm_pipeline") ? <PlanGateScreen feature="crm_pipeline" isDark={isDark} /> : (isLawFirm ? <LegalLeadsDashboard profileId={profile?.id} isDark={isDark} onSaved={goToOverview} /> : <CRMPipelinePanel profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />))}
           {tab === "attendance"    && (!planLoading && !canAccess("attendance") ? <PlanGateScreen feature="attendance" isDark={isDark} /> : <AttendancePanel profileId={profile?.id} isDark={isDark} />)}
           {tab === "hours"         && <BusinessHoursTab profileId={profile?.id} isDark={isDark} onSaved={goToOverview} />}

        </div>
      </div>

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
                  await base44.entities.Profile.update(profile.id, { layout: newLayout });
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