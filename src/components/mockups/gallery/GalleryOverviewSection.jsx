import React from "react";
import { PhoneFrame, StateLabel, ComingSoonBadge, ActiveBadge, MiniProfilePreview, PROFESSIONAL_TEMPLATES, BUSINESS_TEMPLATES } from "./GalleryShared";

const TABS = ["Recommended", "Professional", "Business", "Creative", "Services", "Legal", "Restaurant", "Real Estate", "Health", "Nonprofit", "Event"];

function GalleryScreenMockup({ activeTab, profActive, label }) {
  const recommended = [...PROFESSIONAL_TEMPLATES.slice(0, 3), ...BUSINESS_TEMPLATES.slice(0, 3)];
  return (
    <PhoneFrame width={250} height={460} label={label}>
      <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        {/* Header */}
        <div style={{ padding: "10px 12px 6px", background: "#0b2149", color: "#fff" }}>
          <p style={{ fontSize: 10, fontWeight: 400, opacity: 0.6, margin: 0 }}>Choose a Layout</p>
          <p style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Template Gallery</p>
        </div>
        {/* Pro vs Biz toggle */}
        <div style={{ display: "flex", gap: 4, padding: "6px 12px", background: "#0b2149" }}>
          <div style={{ flex: 1, padding: "4px 8px", borderRadius: 8, textAlign: "center", fontSize: 8, fontWeight: 800, background: profActive ? "#f97316" : "rgba(255,255,255,0.1)", color: "#fff" }}>👤 Professional</div>
          <div style={{ flex: 1, padding: "4px 8px", borderRadius: 8, textAlign: "center", fontSize: 8, fontWeight: 800, background: !profActive ? "#f97316" : "rgba(255,255,255,0.1)", color: "#fff" }}>🏢 Business</div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, padding: "6px 8px", overflow: "hidden", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
          {TABS.slice(0, 6).map(tab => (
            <div key={tab} style={{ padding: "3px 7px", borderRadius: 999, fontSize: 7, fontWeight: 700, whiteSpace: "nowrap", background: tab === activeTab ? "#0b2149" : "#f1f5f9", color: tab === activeTab ? "#fff" : "#64748b", flexShrink: 0 }}>{tab}</div>
          ))}
        </div>
        {/* Template grid */}
        <div style={{ flex: 1, overflow: "hidden", padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {recommended.slice(0, 4).map((t, i) => (
            <div key={t.id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 80, overflow: "hidden" }}>
                <MiniProfilePreview t={t} />
              </div>
              <div style={{ padding: "3px 5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 7, fontWeight: 800, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 50 }}>{t.name.split(" ")[0]}</p>
                {t.status === "coming_soon" ? <span style={{ fontSize: 5, fontWeight: 900, color: "#7c3aed" }}>SOON</span> : <span style={{ fontSize: 5, fontWeight: 900, color: "#059669" }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function GalleryOverviewSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="1" title="Template Gallery — Overview" subtitle="Professional vs Business category selection, filter tabs, recommended templates, and Coming Soon states" />

      <div className="flex flex-wrap gap-6 justify-center">
        <GalleryScreenMockup activeTab="Recommended" profActive={true} label="State 1 · Recommended tab (Professional)" />
        <GalleryScreenMockup activeTab="Business" profActive={false} label="State 2 · Business category selected" />
        {/* Coming soon state */}
        <PhoneFrame width={250} height={460} label="State 3 · Coming Soon templates">
          <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
            <div style={{ padding: "10px 12px 6px", background: "#0b2149", color: "#fff" }}>
              <p style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Template Gallery</p>
            </div>
            <div style={{ display: "flex", gap: 3, padding: "6px 8px", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
              {TABS.slice(0, 6).map(tab => (
                <div key={tab} style={{ padding: "3px 7px", borderRadius: 999, fontSize: 7, fontWeight: 700, whiteSpace: "nowrap", background: tab === "Services" ? "#0b2149" : "#f1f5f9", color: tab === "Services" ? "#fff" : "#64748b", flexShrink: 0 }}>{tab}</div>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "hidden", padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {BUSINESS_TEMPLATES.slice(6, 10).map(t => (
                <div key={t.id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff", opacity: 0.55, display: "flex", flexDirection: "column", position: "relative" }}>
                  <div style={{ height: 70, overflow: "hidden", filter: "grayscale(0.6)" }}>
                    <MiniProfilePreview t={t} />
                  </div>
                  <div style={{ padding: "3px 5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 5, fontWeight: 900, color: "#7c3aed", background: "rgba(139,92,246,0.12)", padding: "1px 4px", borderRadius: 999 }}>COMING SOON</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame>
      </div>

      {/* Category tab reference */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <p className="text-xs font-black text-slate-700 mb-2">All Filter Tabs (11 categories):</p>
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => (
            <span key={tab} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600">{tab}</span>
          ))}
        </div>
      </div>
    </section>
  );
}