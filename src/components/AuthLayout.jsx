import React from "react";
import BingooLogo from "@/components/bingoo/BingooLogo";

// Official Bingoo Connect brand palette
const BINGOO_NAVY = "#0b2149";
const BINGOO_NAVY_LIGHT = "#13284f";
const BINGOO_ORANGE = "#f97316";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10"
      style={{
        background: `radial-gradient(ellipse at top, ${BINGOO_NAVY_LIGHT} 0%, ${BINGOO_NAVY} 55%, #050d1f 100%)`,
      }}
    >
      {/* Decorative orange glow */}
      <div
        className="pointer-events-none absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-20"
        style={{ background: BINGOO_ORANGE }}
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-10"
        style={{ background: BINGOO_NAVY_LIGHT }}
      />

      <div className="relative w-full max-w-md">
        {/* Bingoo Connect Branding — logo blends with navy bg, no white box */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="rounded-2xl overflow-hidden mb-4"
            style={{ background: "transparent", border: "none", boxShadow: "none" }}
          >
            <BingooLogo className="h-14 w-14 object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm" style={{ color: "rgba(249, 115, 22, 0.85)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Glassmorphism card with navy tint + orange accent border */}
        <div
          className="backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
          style={{
            background: "rgba(11, 33, 73, 0.45)",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-1 w-16 rounded-full mx-auto mb-6"
            style={{ background: `linear-gradient(90deg, ${BINGOO_ORANGE}, #fb923c)` }}
          />
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.6)" }}>
            {footer}
          </p>
        )}

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2024 Bingoo Connect · All rights reserved
        </p>
      </div>
    </div>
  );
}