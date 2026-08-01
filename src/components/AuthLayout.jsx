import React from "react";
import BingooLogo from "@/components/bingoo/BingooLogo";
import { InfinityMark } from "@/components/bingoo/ui/BingooBrand";

// Official Bingoo Connect brand palette
const BINGOO_NAVY = "#0b2149";
const BINGOO_ORANGE = "#f97316";

// V3 login visual palette (from Figma source of truth)
const V3_BG_CENTER = "#0b1629";
const V3_BG_EDGE = "#060d1b";
const V3_CARD_BG = "rgba(15, 28, 50, 0.72)";
const V3_CARD_BORDER = "#3e2d24";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-10 w-full max-w-full"
      style={{
        background: `radial-gradient(ellipse at center, ${V3_BG_CENTER} 0%, ${V3_BG_EDGE} 100%)`,
      }}
    >
      {/* Subtle purple/magenta glow on the mid-right */}
      <div
        className="pointer-events-none absolute top-1/3 -right-24 w-[30rem] h-[30rem] rounded-full blur-[150px] opacity-20"
        style={{ background: "#7c3aed" }}
        aria-hidden="true"
      />
      {/* Faint navy depth glow on the lower-left */}
      <div
        className="pointer-events-none absolute bottom-1/4 -left-24 w-96 h-96 rounded-full blur-[140px] opacity-10"
        style={{ background: BINGOO_NAVY }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {/* Bingoo Connect Branding — orange circular brand icon + wordmark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="rounded-full flex items-center justify-center mb-3"
            style={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${BINGOO_ORANGE}, #fb923c)`,
              boxShadow: `0 8px 24px rgba(249, 115, 22, 0.45)`,
            }}
            aria-hidden="true"
          >
            <InfinityMark size={34} color="#ffffff" strokeWidth={3.2} />
          </div>
          <BingooLogo size="text-xl" light />
          <h1 className="text-2xl font-bold text-white tracking-tight mt-5">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm font-medium" style={{ color: BINGOO_ORANGE }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* V3 login card — dark navy, slightly transparent, thin brown-orange border */}
        <div
          className="backdrop-blur-xl rounded-xl p-7 sm:p-8 shadow-2xl"
          style={{
            background: V3_CARD_BG,
            border: `1px solid ${V3_CARD_BORDER}`,
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Short orange accent line at the top of the card */}
          <div
            className="h-1 w-12 rounded-full mx-auto mb-6"
            style={{ background: BINGOO_ORANGE }}
            aria-hidden="true"
          />
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm mt-6" style={{ color: "#a0aec0" }}>
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