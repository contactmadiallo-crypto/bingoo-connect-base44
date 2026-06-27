import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSEO } from "@/hooks/useSEO";
import { motion, AnimatePresence } from "framer-motion";
import ProspectPopup from "@/components/bingoo/ProspectPopup";
import ProfileLayoutShell from "@/components/bingoo/ProfileLayoutShell";
import NewYorkChampionshipLayout from "@/components/bingoo/layouts/NewYorkChampionshipLayout";
import LionsOfTerangaLayout from "@/components/bingoo/layouts/LionsOfTerangaLayout";
import ProfileContentSections from "@/components/bingoo/ProfileContentSections";
import { PhoneIcon, WhatsAppIcon, SaveContactIcon } from "@/components/bingoo/SocialIcons";
import { isLayoutDark } from "@/lib/profileLayouts";
import { ClassicLayout, ImageHeroLayout, GlassLayout, DarkPremiumLayout, ColorLayout, MinimalLayout, CardLayout, ModernSaasLayout, ExecutiveLayout, NeonLayout, RetroLayout, AuroraLayout, FloatingLayout, MagazineLayout } from "@/components/bingoo/ProfileLayoutRenderer";

// ── Brand palette
const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21", teal: "#0D9488" };

// ── Analytics
const trackEvent = (profileId, eventType) => {
  base44.entities.Analytics.create({
    profile_id: profileId, event_type: eventType,
    visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    created_at: new Date().toISOString(),
  }).catch(() => {});
};

const btnRadius = (s) => s === "pill" ? "9999px" : s === "sharp" ? "10px" : "18px";

const hexRgb = (hex, alpha = 1) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const saveContact = (profile) => {
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${profile.display_name || ""}`,
    profile.company_name ? `ORG:${profile.company_name}` : "",
    profile.job_title ? `TITLE:${profile.job_title}` : "",
    profile.phone ? `TEL;TYPE=VOICE:${profile.phone}` : "",
    profile.whatsapp_number ? `TEL;TYPE=CELL:${profile.whatsapp_number}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : "",
    profile.location && profile.show_location !== false ? `ADR:;;${profile.location};;;;` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
  const url = URL.createObjectURL(new Blob([lines], { type: "text/vcard" }));
  Object.assign(document.createElement("a"), { href: url, download: `${(profile.display_name || "contact").replace(/\s+/g, "_")}.vcf` }).click();
  URL.revokeObjectURL(url);
};

// ── Demo profile
const DEMO_PROFILE = {
  id: "demo", username: "demo", display_name: "Amadou Diallo",
  job_title: "Digital Marketing Expert", company_name: "Bingoo Connect",
  bio: "Helping African businesses grow their digital presence. One tap to share everything.",
  cover_color: "#0B2E6B", layout: "classic", bg_style: "clean", button_style: "pill",
  phone: "+221 77 000 0000", whatsapp_number: "221770000000",
  email: "amadou@bingooconnect.com", website: "https://bingooconnect.com",
  instagram_url: "https://instagram.com", linkedin_url: "https://linkedin.com",
  location: "Dakar, Senegal", show_location: true, plan: "pro", is_active: true,
  booking_enabled: true,
};

// ── Build structured data for a profile
const BASE_URL = "https://bingooconnect.com";
const OG_IMAGE_BASE = `${BASE_URL}/api/functions/ogImage`;

// Organisation schema for Bingoo Connect itself (appears on every profile page)
const BINGOO_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bingoo Connect",
  url: BASE_URL,
  logo: "https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png",
  sameAs: [
    "https://instagram.com/bingooconnect",
    "https://www.linkedin.com/company/bingooconnect",
    "https://twitter.com/bingooconnect",
  ],
  description: "NFC-powered digital business cards and profiles for every professional.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE_URL}/contact-support`,
  },
};

function buildStructuredData(profile) {
  const profileUrl = `${BASE_URL}/p/${profile.username}`;
  const isLawFirm = profile.plan === "lawfirm";
  const isBusiness = ["business", "corporate", "salon", "restaurant"].includes(profile.plan);
  const ogImageUrl = `${OG_IMAGE_BASE}?username=${encodeURIComponent(profile.username)}`;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name,
    url: profileUrl,
    image: profile.profile_photo || ogImageUrl,
    ...(profile.job_title && { jobTitle: profile.job_title }),
    ...(profile.company_name && { worksFor: { "@type": "Organization", name: profile.company_name } }),
    ...(profile.email && { email: profile.email }),
    ...(profile.phone && { telephone: profile.phone }),
    ...(profile.location && profile.show_location !== false && { address: { "@type": "PostalAddress", streetAddress: profile.location } }),
    ...(profile.website && { sameAs: [profile.website, profile.linkedin_url, profile.instagram_url].filter(Boolean) }),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Profiles", item: `${BASE_URL}/p/` },
      { "@type": "ListItem", position: 3, name: profile.display_name, item: profileUrl },
    ],
  };

  const entities = [person, breadcrumb, BINGOO_ORGANIZATION];

  if (isBusiness || isLawFirm) {
    entities.push({
      "@context": "https://schema.org",
      "@type": isLawFirm ? "LegalService" : "LocalBusiness",
      name: profile.company_name || profile.display_name,
      url: profileUrl,
      image: profile.profile_photo || ogImageUrl,
      ...(profile.email && { email: profile.email }),
      ...(profile.phone && { telephone: profile.phone }),
      ...(profile.website && { sameAs: profile.website }),
      ...(profile.location && profile.show_location !== false && {
        address: { "@type": "PostalAddress", streetAddress: profile.location },
      }),
    });
  }

  return entities;
}

// ── Main component
export default function PublicProfile() {
  const { username } = useParams();
  const mobile = useIsMobile();
  const isDemo = username === "demo";
  const urlParams = new URLSearchParams(window.location.search);
  const deviceCodeParam = urlParams.get("device") || urlParams.get("d") || null;
  const sourceParam = urlParams.get("source") || null; // "nfc" | "qr" | null
  const topRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);


  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      if (isDemo) return { profile: DEMO_PROFILE, not_found: false };
      try {
        const res = await base44.functions.invoke("getPublicProfile", { username });
        // 404 from backend → profile doesn't exist
        if (res.status === 404 || res.data?.not_found) {
          return { profile: null, not_found: true };
        }
        return { profile: res.data?.profile || null, not_found: false };
      } catch (err) {
        // axios throws on 4xx — check if it's a 404
        if (err?.response?.status === 404) {
          return { profile: null, not_found: true };
        }
        throw err;
      }
    },
    staleTime: 0,
    retry: false, // don't retry 404s
  });

  const profile = queryResult?.profile;
  const isNotFound = !isLoading && queryResult?.not_found === true;

  // ── Dynamic SEO
  const seoTitle = profile
    ? [profile.display_name, [profile.job_title, profile.company_name].filter(Boolean).join(" @ "), "Bingoo Connect"]
        .filter(Boolean).join(" | ")
    : "Bingoo Connect";
  const seoDesc = profile
    ? profile.bio
      ? `${profile.bio.slice(0, 140)}...`
      : `Contact ${profile.display_name}${profile.job_title ? `, ${profile.job_title}` : ""}${profile.company_name ? ` at ${profile.company_name}` : ""}. Connect via NFC on Bingoo Connect.`
    : "NFC-powered digital profiles for every professional.";
  // Use dynamic OG image — falls back to profile photo if available, but ogImage function
  // always renders branded card so social shares look great even without a profile photo
  const seoImage = profile
    ? `https://bingooconnect.com/api/functions/ogImage?username=${encodeURIComponent(profile.username)}`
    : undefined;
  const seoUrl = profile ? `https://bingooconnect.com/p/${profile.username}` : undefined;

  useSEO({
    title: profile && !isDemo ? seoTitle : isNotFound ? "Profile Not Found | Bingoo Connect" : undefined,
    description: profile && !isDemo ? seoDesc : undefined,
    image: !isDemo ? seoImage : undefined,
    url: !isDemo ? seoUrl : undefined,
    type: "profile",
    structuredData: profile && !isDemo ? buildStructuredData(profile) : undefined,
    noindex: isNotFound, // tell search engines not to index 404 pages
  });

  useEffect(() => {
    if (!profile?.id || isDemo) return;
    // Always track a profile view
    trackEvent(profile.id, "profile_view");
    // Also track source-specific events
    if (sourceParam === "qr") trackEvent(profile.id, "qr_scan");
    // NFC taps are tracked in NFCRedirect before redirecting here
  }, [profile?.id]);



  // Skeleton shown only to real users — Googlebot won't index this state
  // because getPublicProfile now returns 404 for missing profiles and
  // the noindex meta tag is set on the not-found render below.
  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Skeleton header */}
      <div style={{ height: 260, background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)" }} />
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#e2e8f0", margin: "-55px auto 16px", border: "4px solid #fff" }} />
        <div style={{ height: 28, background: "#e2e8f0", borderRadius: 8, marginBottom: 12, width: "60%", margin: "0 auto 12px" }} />
        <div style={{ height: 16, background: "#f1f5f9", borderRadius: 6, width: "45%", margin: "0 auto 8px" }} />
        <div style={{ height: 14, background: "#f1f5f9", borderRadius: 6, width: "35%", margin: "0 auto 24px" }} />
        <div style={{ height: 60, background: "#f1f5f9", borderRadius: 12, marginBottom: 12 }} />
        <div style={{ height: 60, background: "#f1f5f9", borderRadius: 12, marginBottom: 12 }} />
        <div style={{ height: 60, background: "#f1f5f9", borderRadius: 12 }} />
      </div>
    </div>
  );

  // True 404 — noindex is already set via useSEO above
  if (isNotFound || !profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Profile not found</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>This link may be inactive or the username doesn't exist.</p>
        <a href="/" style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", borderRadius: 999, background: B.navy, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← Go Home</a>
      </div>
    </div>
  );

  const color = profile.cover_color || B.navy;
  const r = btnRadius(profile.button_style || "pill");
  const track = (ev) => !isDemo && trackEvent(profile.id, ev);

  // ── Render championship full-page layouts — pass all content as children
  const effectiveLayout = profile.layout || profile.profile_layout || "default";
  const championContentSections = (
    <ProfileContentSections
      profile={profile} color={color} isDark={true}
      isDemo={isDemo} deviceCodeParam={deviceCodeParam} track={track}
    />
  );
  if (effectiveLayout === "ny_championship" || profile.profile_layout === "ny_championship") {
    return <NewYorkChampionshipLayout profile={profile}>{championContentSections}</NewYorkChampionshipLayout>;
  }
  if (effectiveLayout === "lions_teranga" || profile.profile_layout === "lions_teranga") {
    return <LionsOfTerangaLayout profile={profile}>{championContentSections}</LionsOfTerangaLayout>;
  }

  const isSalonOrRestaurant = ["salon", "restaurant"].includes(profile.plan);
  const waBookingHref = profile.whatsapp_number
    ? `https://wa.me/${(profile.whatsapp_number || "").replace(/\D/g, "")}${profile.whatsapp_booking_message ? `?text=${encodeURIComponent(profile.whatsapp_booking_message)}` : ""}`
    : null;

  const isDark = profile.bg_style === "night" || isLayoutDark(profile.layout);
  const layoutType = profile.layout || "classic";

  const layoutContentSections = (
    <ProfileContentSections
      profile={profile} color={color} isDark={isDark}
      isDemo={isDemo} deviceCodeParam={deviceCodeParam} track={track}
    />
  );

  const renderActiveLayout = () => {
    const lp = { profile, color, isDark, mobile, contentSections: layoutContentSections };

    // Image Hero — full-bleed cover, avatar bottom-right
    if (["image_hero","image","video_bg","parallax","realtor_luxury"].includes(layoutType))
      return <ImageHeroLayout {...lp} />;
    // Magazine — editorial photo header, identity row overlapping
    if (["magazine"].includes(layoutType))
      return <MagazineLayout {...lp} />;
    // Aurora — northern-lights dark gradient
    if (["aurora","animated_gradient"].includes(layoutType))
      return <AuroraLayout {...lp} color={color} />;
    // Glass — frosted glass on vivid gradient bg
    if (["glassmorphic","glass_card","glass","frosted","glass_3d"].includes(layoutType))
      return <GlassLayout {...lp} />;
    // Split / Modern SaaS — horizontal header + accent bar
    if (["modern_saas","split","corporate","modern_law"].includes(layoutType))
      return <ModernSaasLayout {...lp} />;
    // Executive — right-aligned avatar, tall cover
    if (["executive","executive_corp"].includes(layoutType))
      return <ExecutiveLayout {...lp} />;
    // Luxury Gold — dark executive with gold accent
    if (["luxury_gold"].includes(layoutType))
      return <DarkPremiumLayout {...lp} isDark={true} profile={{ ...profile, cover_color: "#B8860B" }} color="#B8860B" />;
    // Dark Premium — cinematic dark bg, glow ring
    if (["dark","dark_premium","darkpremium","luxury","minimal_dark","cyberpunk","premium_salon","monochrome"].includes(layoutType))
      return <DarkPremiumLayout {...lp} isDark={true} />;
    // Neon — glow ring on near-black
    if (["neon","neon_tech"].includes(layoutType))
      return <NeonLayout {...lp} isDark={true} />;
    // Retro — editorial serif header
    if (["retro","paper"].includes(layoutType))
      return <RetroLayout {...lp} />;
    // Floating — radial bg, detached card
    if (["floating"].includes(layoutType))
      return <FloatingLayout {...lp} />;
    // Bold Gradient — vivid color hero + wave
    if (["bold","color_gradient","color","color_hero","sunset","ocean","forest","wave","bubbly","pastel","gradient","portrait"].includes(layoutType))
      return <ColorLayout {...lp} />;
    // Minimal — left accent stripe, horizontal
    if (["minimal","minimal_business"].includes(layoutType))
      return <MinimalLayout {...lp} />;
    // Card — slim strip + floating card
    if (["card","card_compact"].includes(layoutType))
      return <CardLayout {...lp} />;
    // Default
    return <ClassicLayout {...lp} />;
  };

  return (
    <div ref={topRef} style={{ position: "relative" }}>

      {/* Back button — frosted glass */}
      <motion.button
        onClick={() => window.history.back()}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        style={{ position: "fixed", top: 16, left: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 2px 16px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.6)", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
      >
        ← Back
      </motion.button>

      {/* Main card — real layout renderer */}
      <ProfileLayoutShell profile={profile} color={color} isDark={isDark}>
        {renderActiveLayout()}
      </ProfileLayoutShell>

      {/* ── STICKY BOTTOM BAR ── */}
      {(profile.phone || profile.whatsapp_number) && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ maxWidth: 440, margin: "0 auto", display: "grid", gridTemplateColumns: profile.phone && profile.whatsapp_number ? "1fr 1fr" : "1fr", gap: 10 }}>
            {profile.phone && (
              <a href={`tel:${profile.phone}`}
                onClick={() => track("phone_click")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 16, background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 8px 24px rgba(22,163,74,0.35)", letterSpacing: "0.01em" }}>
                <PhoneIcon size={18} /> Call Now
              </a>
            )}
            {profile.whatsapp_number && (
              <a href={waBookingHref || `https://wa.me/${(profile.whatsapp_number||"").replace(/\D/g,"")}`}
                onClick={() => track("whatsapp_click")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", borderRadius: 16, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 8px 24px rgba(37,211,102,0.35)", letterSpacing: "0.01em" }}>
                <WhatsAppIcon size={18} /> {isSalonOrRestaurant && profile.whatsapp_booking_message ? "Book via WA" : "WhatsApp"}
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* ── BACK TO TOP ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="btt"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            whileHover={{ scale: 1.1 }}
            style={{ position: "fixed", bottom: (profile.phone || profile.whatsapp_number) ? 100 : 24, right: 20, zIndex: 50, width: 44, height: 44, borderRadius: "50%", background: color, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 6px 20px ${hexRgb(color, 0.5)}` }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* Prospect marketing popup */}
      <ProspectPopup profileId={profile?.id} profileOwnerId={profile?.created_by_id} deviceCode={deviceCodeParam} isDemo={isDemo} />

    </div>
  );
}