import React from "react";

// ── Phone Frame ────────────────────────────────────────────────────────────
export function PhoneFrame({ children, width = 260, height = 480, label, dark }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width, height, background: "#0f172a", borderRadius: 28, padding: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.15), inset 0 0 0 1.5px rgba(255,255,255,0.06)" }}>
        <div style={{ borderRadius: 22, overflow: "hidden", height: "100%", background: dark ? "#0a0c14" : "#fff", position: "relative" }}>
          {children}
        </div>
      </div>
      {label && <p className="text-xs font-bold text-slate-500 text-center" style={{ maxWidth: width }}>{label}</p>}
    </div>
  );
}

// ── State Label ────────────────────────────────────────────────────────────
export function StateLabel({ num, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-black text-white px-2 py-0.5 rounded-full" style={{ background: "#f97316" }}>{num}</span>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-slate-500 ml-7">{subtitle}</p>}
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────
export function ComingSoonBadge() {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#7c3aed" }}>COMING SOON</span>;
}
export function ActiveBadge() {
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>ACTIVE</span>;
}

// ── Mini Profile Preview (for template cards) ──────────────────────────────
export function MiniProfilePreview({ t }) {
  const c = t.colors || {};
  const name = t.name || "Name";
  const title = t.shortTitle || t.bestFor?.split(",")[0] || "Title";
  const avatarR = { circle: "50%", rounded: "22%", squircle: "28%" }[t.avatarShape] || "50%";
  const ctaR = t.ctaStyle === "sharp" ? 4 : t.ctaStyle === "rounded" ? 8 : 999;
  const isDark = t.style === "dark";

  if (t.style === "minimal") {
    return (
      <div style={{ background: c.bg, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, gap: 5 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14 }}>{name.charAt(0)}</div>
        <p style={{ fontSize: 10, fontWeight: 800, color: c.text, margin: 0 }}>{name}</p>
        <p style={{ fontSize: 7, color: c.muted, margin: 0 }}>{title}</p>
        {(t.ctas || []).slice(0, 3).map((cta, i) => (
          <div key={i} style={{ width: "100%", padding: "4px 6px", borderRadius: 999, fontSize: 7, fontWeight: 700, textAlign: "center", background: i === 0 ? c.accent : "rgba(0,0,0,0.04)", color: i === 0 ? "#fff" : c.text }}>{cta}</div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: c.bg, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 50, background: c.cover, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "0 9px 7px", marginTop: -16, display: "flex", flexDirection: "column" }}>
        <div style={{ width: 32, height: 32, borderRadius: avatarR, background: c.accent, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{name.charAt(0)}</div>
        <p style={{ fontSize: 10, fontWeight: 800, color: c.text, margin: "4px 0 0" }}>{name}</p>
        <p style={{ fontSize: 7, color: c.muted, margin: "1px 0 0" }}>{title}</p>
        <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {(t.ctas || []).slice(0, 3).map((cta, i) => {
            const isPrimary = i === 0;
            const s = t.ctaStyle === "outline" && !isPrimary
              ? { border: `1px solid ${c.accent}`, color: c.accent, background: "transparent" }
              : { background: isPrimary ? c.accent : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"), color: isPrimary ? "#fff" : c.text };
            return <div key={i} style={{ padding: "4px 6px", borderRadius: ctaR, fontSize: 7, fontWeight: 700, textAlign: "center", ...s }}>{cta}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Template Card ──────────────────────────────────────────────────────────
export function TemplateCard({ t, num }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded" style={{ background: "#0b2149" }}>{num}</span>
          <span className="text-xs font-black text-slate-900">{t.name}</span>
        </div>
        {t.status === "coming_soon" ? <ComingSoonBadge /> : <ActiveBadge />}
      </div>
      <div className="flex gap-3">
        <div style={{ width: 100, height: 175, flexShrink: 0 }}>
          <PhoneFrame width={100} height={175}>
            <MiniProfilePreview t={t} />
          </PhoneFrame>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: t.colors?.accent || "#f97316" }}>{t.category}</p>
          <p className="text-[9px] text-slate-500 mb-2 leading-tight">Best for: {t.bestFor}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(t.ctas || []).map((cta, i) => (
              <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(249,115,22,0.08)", color: "#c2410c" }}>{cta}</span>
            ))}
          </div>
          <p className="text-[8px] text-slate-400 leading-relaxed">Sections: {(t.sections || []).join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}

// ── Template Data ──────────────────────────────────────────────────────────
export const PROFESSIONAL_TEMPLATES = [
  { id: "exec_premium", name: "Executive Premium", shortTitle: "Chief Strategy Officer", category: "Professional", bestFor: "C-Suite, Directors, VPs", sections: ["Bio", "Schedule a Call", "Contact", "Website", "Social"], ctas: ["Schedule a Call", "Contact", "Website"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#0b2149,#13284f)", accent: "#c4a042", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "creator", name: "Creator / Influencer", shortTitle: "Content Creator", category: "Creative", bestFor: "Creators, influencers, streamers", sections: ["Bio", "Book a Collab", "Latest Video", "My Store", "Social Grid"], ctas: ["Book a Collab", "Latest Video", "My Store"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#8b5cf6,#ec4899)", accent: "#ec4899", bg: "#fff", text: "#1e293b", muted: "#94a3b8" }, avatarShape: "rounded", ctaStyle: "pill" },
  { id: "photographer", name: "Photographer / Videographer", shortTitle: "Visual Storyteller", category: "Creative", bestFor: "Photographers, videographers, rich media", sections: ["Portfolio Grid", "Book a Shoot", "Watch Reel", "Instagram Feed"], ctas: ["View Portfolio", "Book a Shoot", "Watch Reel"], status: "active", style: "dark", colors: { cover: "#0f0f0f", accent: "#f59e0b", bg: "#0f0f0f", text: "#fff", muted: "rgba(255,255,255,0.4)" }, avatarShape: "circle", ctaStyle: "rounded" },
  { id: "artist_model", name: "Artist / Model", shortTitle: "Visual Artist", category: "Creative", bestFor: "Models, artists, performers", sections: ["Gallery", "Book a Session", "Portfolio", "Agency Contact"], ctas: ["View Gallery", "Book a Session", "Portfolio"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#f8fafc,#e2e8f0)", accent: "#0f172a", bg: "#fff", text: "#0f172a", muted: "#94a3b8" }, avatarShape: "squircle", ctaStyle: "sharp" },
  { id: "freelancer", name: "Freelancer / Consultant", shortTitle: "Strategy Consultant", category: "Professional", bestFor: "Consultants, freelancers, coaches", sections: ["Bio", "Schedule Consultation", "View Work", "Testimonials"], ctas: ["Schedule Consultation", "View Work", "Contact"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#2563eb,#1d4ed8)", accent: "#2563eb", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "minimal_nfc", name: "Minimal NFC Card", shortTitle: "Quick Contact", category: "Professional", bestFor: "Quick contact exchange, minimal digital card", sections: ["Name", "Call", "Email", "Save Contact"], ctas: ["Call", "Email", "Save Contact"], status: "active", style: "minimal", colors: { cover: "none", accent: "#0b2149", bg: "#fff", text: "#1e293b", muted: "#94a3b8" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "event_networking", name: "Event Networking", shortTitle: "Conference Attendee", category: "Event", bestFor: "Conferences, networking events, trade shows", sections: ["Name", "Title", "Exchange Contact", "Connect on LinkedIn"], ctas: ["Exchange Contact", "Connect", "Save Contact"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#f97316,#fb923c)", accent: "#f97316", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "rounded", ctaStyle: "pill" },
  { id: "private_driver", name: "Private Driver", shortTitle: "Chauffeur Service", category: "Services", bestFor: "Chauffeurs, personal drivers, transport", sections: ["Book a Ride", "Get Quote", "Service Area", "Reviews"], ctas: ["Book a Ride", "Get Quote", "Call"], status: "coming_soon", style: "dark", colors: { cover: "#000", accent: "#c4a042", bg: "#0a0a0a", text: "#fff", muted: "rgba(255,255,255,0.4)" }, avatarShape: "circle", ctaStyle: "sharp" },
];

export const BUSINESS_TEMPLATES = [
  { id: "business_team", name: "Business Team / Company", shortTitle: "Apex Solutions Inc.", category: "Business", bestFor: "Companies, agencies, startups", sections: ["About", "Meet the Team", "Services", "Contact", "Careers"], ctas: ["Meet the Team", "About", "Contact"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#0b2149,#1e3a5f)", accent: "#0b2149", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "rounded", ctaStyle: "pill" },
  { id: "salon", name: "Hair Salon / Service", shortTitle: "Bella Vista Salon", category: "Services", bestFor: "Salons, barbers, beauty, spa", sections: ["Services", "Book Appointment", "Team", "Gallery", "Reviews"], ctas: ["Book Appointment", "View Services", "Call"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#f472b6,#ec4899)", accent: "#ec4899", bg: "#fff", text: "#1e293b", muted: "#94a3b8" }, avatarShape: "rounded", ctaStyle: "pill" },
  { id: "law_firm", name: "Law Firm / Professional", shortTitle: "Sterling & Associates LLP", category: "Legal", bestFor: "Law firms, attorneys, legal services", sections: ["Practice Areas", "Consultation", "Attorneys", "Offices", "Case Results"], ctas: ["Consultation", "Practice Areas", "Contact"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#0f172a,#1e293b)", accent: "#94a3b8", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "sharp" },
  { id: "restaurant", name: "Restaurant / Digital Menu", shortTitle: "Maison Savoir", category: "Restaurant", bestFor: "Restaurants, cafes, food trucks", sections: ["Menu", "Order Online", "Reserve", "Hours", "Location"], ctas: ["View Menu", "Order Online", "Reserve"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#dc2626,#f97316)", accent: "#dc2626", bg: "#fff", text: "#1e293b", muted: "#94a3b8" }, avatarShape: "rounded", ctaStyle: "rounded" },
  { id: "real_estate", name: "Real Estate Agent / Realty", shortTitle: "Premier Realty Group", category: "Real Estate", bestFor: "Realtors, agencies, property managers", sections: ["Listings", "Book a Viewing", "About", "Contact", "Reviews"], ctas: ["Book a Viewing", "View Listings", "Contact"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#059669,#10b981)", accent: "#059669", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "medical", name: "Medical / Health Pro", shortTitle: "Dr. Martinez Clinic", category: "Health", bestFor: "Doctors, clinics, dentists, therapists", sections: ["Book Appointment", "Services", "Patient Portal", "Hours", "Location"], ctas: ["Book Appointment", "Patient Portal", "Call"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#0ea5e9,#0284c7)", accent: "#0ea5e9", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "nonprofit", name: "Nonprofit / NGO", shortTitle: "Hope Foundation", category: "Nonprofit", bestFor: "Charities, NGOs, community organizations", sections: ["Mission", "Donate Now", "Volunteer", "Events", "Contact"], ctas: ["Donate Now", "Volunteer", "Learn More"], status: "active", style: "standard", colors: { cover: "linear-gradient(135deg,#0d9488,#14b8a6)", accent: "#0d9488", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "circle", ctaStyle: "pill" },
  { id: "fitness", name: "Fitness / Personal Trainer", shortTitle: "Iron Forge Fitness", category: "Health", bestFor: "Trainers, gyms, coaches, studios", sections: ["Programs", "Book Session", "Pricing", "Testimonials", "Contact"], ctas: ["Book Session", "View Programs", "Contact"], status: "active", style: "dark", colors: { cover: "#0f172a", accent: "#f97316", bg: "#0f172a", text: "#fff", muted: "rgba(255,255,255,0.4)" }, avatarShape: "rounded", ctaStyle: "sharp" },
  { id: "car_dealer", name: "Car Dealer", shortTitle: "AutoLine Dealership", category: "Services", bestFor: "Dealerships, auto sales, car brokers", sections: ["Inventory", "Book Test Drive", "Financing", "Contact", "Location"], ctas: ["View Inventory", "Book Test Drive", "Contact"], status: "coming_soon", style: "standard", colors: { cover: "linear-gradient(135deg,#475569,#1e293b)", accent: "#94a3b8", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "squircle", ctaStyle: "rounded" },
  { id: "store_retail", name: "Store / Retail", shortTitle: "Urban Threads Boutique", category: "Business", bestFor: "Shops, retail stores, e-commerce", sections: ["Products", "Shop Now", "Get Directions", "Hours", "Specials"], ctas: ["Shop Products", "Get Directions", "Call"], status: "coming_soon", style: "standard", colors: { cover: "linear-gradient(135deg,#2563eb,#f97316)", accent: "#2563eb", bg: "#fff", text: "#1e293b", muted: "#64748b" }, avatarShape: "rounded", ctaStyle: "pill" },
];