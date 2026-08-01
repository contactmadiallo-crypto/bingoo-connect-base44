import React from "react";
import { InfinityMark } from "@/components/bingoo/ui/BingooBrand";

const ORANGE = "#f97316";
const NAVY = "#0b2149";

// Orange rounded-square badge with the Bingoo infinity mark + "Bingoo Connect" wordmark.
// `light` = white text (for dark backgrounds); default = navy text (for light backgrounds).
export default function BrandLockup({ light = false, badgeSize = 34, fontSize = "text-lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          width: badgeSize,
          height: badgeSize,
          background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)",
        }}
        aria-hidden="true"
      >
        <InfinityMark size={badgeSize * 0.62} color="#ffffff" strokeWidth={3.4} />
      </div>
      <span
        className={`font-extrabold tracking-tight ${fontSize}`}
        style={{ color: light ? "#ffffff" : NAVY }}
      >
        Bingoo Connect
      </span>
    </div>
  );
}