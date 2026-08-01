import React from "react";
import { Check } from "lucide-react";
import BrandLockup from "@/components/auth/BrandLockup";

const NAVY = "#0b2149";
const ORANGE = "#f97316";

const BENEFITS = [
  "Free digital profile forever",
  "Tap-to-share NFC activation",
  "QR code & wallet card",
  "Real-time analytics dashboard",
  "Upgrade anytime — no lock-in",
];

// Dark navy left column of the register split-screen — brand lockup,
// "Start connecting smarter today." headline, and benefit checklist.
export default function RegisterBenefitsPanel() {
  return (
    <div
      className="h-full w-full flex flex-col justify-center px-8 lg:px-12 py-12"
      style={{
        background: `radial-gradient(ellipse at top, #13284f 0%, ${NAVY} 55%, #050d1f 100%)`,
      }}
    >
      <div className="mb-10">
        <BrandLockup light badgeSize={40} fontSize="text-xl" />
      </div>

      <h2 className="text-3xl lg:text-[2.5rem] lg:leading-[1.1] font-extrabold text-white tracking-tight mb-8">
        Start connecting smarter{" "}
        <span style={{ color: ORANGE }}>today.</span>
      </h2>

      <ul className="space-y-4">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-3 text-white/85 text-base">
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
              style={{ background: "#16a34a" }}
            >
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}