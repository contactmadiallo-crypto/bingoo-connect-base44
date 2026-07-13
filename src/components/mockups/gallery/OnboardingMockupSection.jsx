import React from "react";
import { PhoneFrame, StateLabel, MiniProfilePreview, PROFESSIONAL_TEMPLATES, BUSINESS_TEMPLATES } from "./GalleryShared";

function Step1ProfileType() {
  return (
    <PhoneFrame width={250} height={440} label="State 4 · Step 1 — Professional or Business?">
      <div style={{ height: "100%", padding: 16, display: "flex", flexDirection: "column", background: "#fff" }}>
        <p style={{ fontSize: 9, fontWeight: 400, color: "#94a3b8", margin: 0 }}>Step 1 of 4</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2149", margin: "2px 0 16px" }}>What type of profile?</p>
        {/* Professional card */}
        <div style={{ border: "2px solid #f97316", borderRadius: 16, padding: 14, marginBottom: 10, background: "rgba(249,115,22,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
            <div><p style={{ fontSize: 11, fontWeight: 800, margin: 0, color: "#1e293b" }}>Professional</p><p style={{ fontSize: 8, color: "#64748b", margin: 0 }}>Personal brand, creator, service pro</p></div>
          </div>
          <p style={{ fontSize: 7, color: "#94a3b8", margin: 0 }}>Best for: Executives, creators, freelancers, drivers</p>
        </div>
        {/* Business card */}
        <div style={{ border: "2px solid #e2e8f0", borderRadius: 16, padding: 14, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0b2149", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏢</div>
            <div><p style={{ fontSize: 11, fontWeight: 800, margin: 0, color: "#1e293b" }}>Business</p><p style={{ fontSize: 8, color: "#64748b", margin: 0 }}>Company, salon, firm, restaurant</p></div>
          </div>
          <p style={{ fontSize: 7, color: "#94a3b8", margin: 0 }}>Best for: Teams, services, retail, legal</p>
        </div>
        <div style={{ marginTop: "auto", padding: "10px 0", textAlign: "center", borderRadius: 12, background: "#f1f5f9", color: "#94a3b8", fontSize: 10, fontWeight: 700 }}>Continue →</div>
      </div>
    </PhoneFrame>
  );
}

function Step2Category() {
  const cats = [{ l: "Creative", e: "🎨" }, { l: "Services", e: "✂️" }, { l: "Legal", e: "⚖️" }, { l: "Restaurant", e: "🍽️" }, { l: "Real Estate", e: "🏠" }, { l: "Health", e: "⚕️" }, { l: "Nonprofit", e: "🤝" }, { l: "Event", e: "🎯" }];
  return (
    <PhoneFrame width={250} height={440} label="State 5 · Step 2 — Choose your category">
      <div style={{ height: "100%", padding: 16, display: "flex", flexDirection: "column", background: "#fff" }}>
        <p style={{ fontSize: 9, fontWeight: 400, color: "#94a3b8", margin: 0 }}>Step 2 of 4</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2149", margin: "2px 0 12px" }}>Choose category</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
          {cats.map((c, i) => (
            <div key={c.l} style={{ border: i === 0 ? "2px solid #f97316" : "1px solid #e2e8f0", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: i === 0 ? "rgba(249,115,22,0.04)" : "#fff" }}>
              <span style={{ fontSize: 18 }}>{c.e}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#1e293b" }}>{c.l}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function Step3Recommended() {
  return (
    <PhoneFrame width={250} height={440} label="State 6 · Step 3 — Recommended layouts">
      <div style={{ height: "100%", padding: 16, display: "flex", flexDirection: "column", background: "#fff" }}>
        <p style={{ fontSize: 9, fontWeight: 400, color: "#94a3b8", margin: 0 }}>Step 3 of 4</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2149", margin: "2px 0 10px" }}>Recommended for you</p>
        <p style={{ fontSize: 8, color: "#64748b", margin: "0 0 10px" }}>Based on Creative category</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {[PROFESSIONAL_TEMPLATES[1], PROFESSIONAL_TEMPLATES[2], PROFESSIONAL_TEMPLATES[3]].map((t, i) => (
            <div key={t.id} style={{ border: i === 0 ? "2px solid #f97316" : "1px solid #e2e8f0", borderRadius: 12, padding: 6, display: "flex", gap: 8, alignItems: "center", background: i === 0 ? "rgba(249,115,22,0.03)" : "#fff" }}>
              <div style={{ width: 50, height: 75, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                <MiniProfilePreview t={t} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: "#1e293b", margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 7, color: "#94a3b8", margin: "2px 0" }}>{t.ctas.join(" · ")}</p>
                {i === 0 && <span style={{ fontSize: 6, fontWeight: 900, color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "1px 4px", borderRadius: 999 }}>RECOMMENDED</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function Step4UseTemplate() {
  const t = PROFESSIONAL_TEMPLATES[1];
  return (
    <PhoneFrame width={250} height={440} label="State 7 · Step 4 — Use this template">
      <div style={{ height: "100%", padding: 16, display: "flex", flexDirection: "column", background: "#fff" }}>
        <p style={{ fontSize: 9, fontWeight: 400, color: "#94a3b8", margin: 0 }}>Step 4 of 4</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#0b2149", margin: "2px 0 10px" }}>Confirm template</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 120, height: 190, borderRadius: 16, overflow: "hidden", border: "2px solid #f97316", boxShadow: "0 8px 24px rgba(249,115,22,0.15)" }}>
            <MiniProfilePreview t={t} />
          </div>
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", textAlign: "center", margin: 0 }}>{t.name}</p>
        <p style={{ fontSize: 8, color: "#64748b", textAlign: "center", margin: "2px 0 12px" }}>{t.category} · {t.ctas.join(", ")}</p>
        <div style={{ marginTop: "auto", padding: "12px 0", textAlign: "center", borderRadius: 12, background: "#f97316", color: "#fff", fontSize: 11, fontWeight: 800 }}>✓ Use This Template</div>
      </div>
    </PhoneFrame>
  );
}

export default function OnboardingMockupSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="4" title="Onboarding Flow Mockup States" subtitle="How onboarding asks profile type → category → recommended layouts → use template" />
      <div className="flex flex-wrap gap-6 justify-center">
        <Step1ProfileType />
        <Step2Category />
        <Step3Recommended />
        <Step4UseTemplate />
      </div>
    </section>
  );
}