import React from "react";
import { PhoneFrame, StateLabel, PROFESSIONAL_TEMPLATES, BUSINESS_TEMPLATES } from "./GalleryShared";

function DetailedProfile({ t, name, title, bio, contentTitle, contentItems }) {
  const c = t.colors || {};
  const isDark = t.style === "dark";
  const isMinimal = t.style === "minimal";
  const avatarR = { circle: "50%", rounded: "22%", squircle: "28%" }[t.avatarShape] || "50%";
  const ctaR = t.ctaStyle === "sharp" ? 6 : t.ctaStyle === "rounded" ? 10 : 999;

  if (isMinimal) {
    return (
      <div style={{ height: "100%", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 10 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 24, boxShadow: "0 4px 16px rgba(11,33,73,0.2)" }}>{name.charAt(0)}</div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: c.text, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 10, color: c.muted, margin: "2px 0 0" }}>{title}</p>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {t.ctas.map((cta, i) => (
            <div key={i} style={{ padding: "12px", borderRadius: 999, fontSize: 11, fontWeight: 700, textAlign: "center", background: i === 0 ? c.accent : "rgba(0,0,0,0.04)", color: i === 0 ? "#fff" : c.text }}>{cta}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", background: c.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Cover */}
      <div style={{ height: 100, background: c.cover, flexShrink: 0, position: "relative" }}>
        {t.id === "creator" && <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.25)" }} />
        </div>}
      </div>
      {/* Avatar + Info */}
      <div style={{ padding: "0 14px 12px", marginTop: -28, flex: 1, overflow: "hidden" }}>
        <div style={{ width: 56, height: 56, borderRadius: avatarR, background: c.accent, border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", flexShrink: 0 }}>{name.charAt(0)}</div>
        <p style={{ fontSize: 14, fontWeight: 800, color: c.text, margin: "6px 0 0" }}>{name}</p>
        <p style={{ fontSize: 10, color: c.muted, margin: "1px 0 0" }}>{title}</p>
        {bio && <p style={{ fontSize: 9, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b", margin: "6px 0 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>}

        {/* CTAs */}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {t.ctas.slice(0, 3).map((cta, i) => {
            const isPrimary = i === 0;
            const s = t.ctaStyle === "outline" && !isPrimary
              ? { border: `1.5px solid ${c.accent}`, color: c.accent, background: "transparent" }
              : { background: isPrimary ? c.accent : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"), color: isPrimary ? "#fff" : c.text };
            return <div key={i} style={{ padding: "8px 10px", borderRadius: ctaR, fontSize: 10, fontWeight: 700, textAlign: "center", ...s }}>{cta}</div>;
          })}
        </div>

        {/* Content section */}
        {contentTitle && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: c.muted, margin: "0 0 6px" }}>{contentTitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(contentItems || []).slice(0, 3).map((item, i) => (
                <div key={i} style={{ padding: "6px 8px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", fontSize: 9, fontWeight: 600, color: c.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                  {item.value && <span style={{ fontSize: 8, fontWeight: 800, color: c.accent, flexShrink: 0 }}>{item.value}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PROFILES = [
  { t: PROFESSIONAL_TEMPLATES[1], name: "Jessica Chen", title: "Content Creator & Influencer", bio: "Creating content that inspires. 500K+ across platforms. Brand collabs welcome!", contentTitle: "Latest Content", contentItems: [{ label: "🎬 Day in the Life vlog", value: "New" }, { label: "🛍️ My Amazon Storefront", value: "" }, { label: "📱 Top TikTok Picks", value: "" }] },
  { t: BUSINESS_TEMPLATES[1], name: "Bella Vista Salon", title: "Hair & Beauty Studio", bio: "Premium hair services in the heart of the city. Expert stylists, premium products.", contentTitle: "Popular Services", contentItems: [{ label: "✂️ Haircut & Style", value: "$35" }, { label: "🎨 Color & Highlights", value: "$120" }, { label: "💇 Treatment & Blowout", value: "$80" }] },
  { t: BUSINESS_TEMPLATES[2], name: "Sterling & Associates", title: "Immigration Law Firm", bio: "15+ years guiding families through the immigration process. Free initial consultation.", contentTitle: "Practice Areas", contentItems: [{ label: "⚖️ Family-Based Immigration", value: "" }, { label: "🛂 Citizenship & Naturalization", value: "" }, { label: "📑 Work Permits & Visas", value: "" }] },
  { t: BUSINESS_TEMPLATES[3], name: "Maison Savoir", title: "French Cuisine · Downtown", bio: "Authentic French dining experience. Farm-to-table ingredients, seasonal menu.", contentTitle: "Today's Specials", contentItems: [{ label: "🍷 Coq au Vin", value: "$28" }, { label: "🥖 Ratatouille Provençale", value: "$22" }, { label: "🍫 Chocolate Soufflé", value: "$14" }] },
  { t: BUSINESS_TEMPLATES[0], name: "Apex Solutions Inc.", title: "Business Consulting Firm", bio: "Helping startups scale. Strategy, operations, and digital transformation experts.", contentTitle: "Our Team", contentItems: [{ label: "👤 Sarah Kim — CEO & Founder", value: "" }, { label: "👤 Marcus Lee — COO", value: "" }, { label: "👤 Elena Rossi — Strategy Lead", value: "" }] },
  { t: PROFESSIONAL_TEMPLATES[5], name: "John Smith", title: "Contact", bio: null, contentTitle: null, contentItems: null },
];

export default function PublicProfileMockupSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="5" title="Public Profile Preview Mockups" subtitle="How selected templates render as public profiles on mobile — each layout is visually distinct" />
      <div className="flex flex-wrap gap-6 justify-center">
        {PROFILES.map((p, i) => (
          <PhoneFrame key={i} width={220} height={420} dark={p.t.style === "dark"} label={`State ${8 + i} · ${p.t.name}`}>
            <DetailedProfile {...p} />
          </PhoneFrame>
        ))}
      </div>
    </section>
  );
}