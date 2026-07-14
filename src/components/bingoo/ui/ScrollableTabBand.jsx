/**
 * ScrollableTabBand — the single reusable pattern for ALL horizontal tab/action bands.
 *
 * Guarantees:
 *  - wrapper: w-full min-w-0 overflow-x-auto (no page horizontal overflow)
 *  - inner row: flex w-max min-w-full gap (whitespace-nowrap)
 *  - children: flex-shrink-0 (never squished)
 *  - touch momentum scrolling on iOS
 *  - hidden scrollbar
 *  - left/right padding so first and last items are fully reachable
 *  - never clipped by a parent overflow-hidden (parent must not use overflow-hidden on this axis)
 *
 * Usage:
 *   <ScrollableTabBand>
 *     {tabs.map(t => <TabButton key={t.id} ... />)}
 *   </ScrollableTabBand>
 *
 * Props:
 *  - className: extra classes on the outer wrapper
 *  - gap: gap between items (default "gap-1")
 *  - px: inner horizontal padding (default "px-1") — ensures edges are reachable
 *  - as: element type for inner row (default "div")
 *  - children: the tab/action buttons
 */
import React from "react";

export default function ScrollableTabBand({
  children,
  className = "",
  gap = "gap-1",
  px = "px-1",
  as: As = "div",
  ...rest
}) {
  return (
    <div
      className={`w-full min-w-0 overflow-x-auto scrollbar-hide ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorX: "contain",
      }}
    >
      <As className={`flex w-max min-w-full ${gap} ${px} whitespace-nowrap`} {...rest}>
        {children}
      </As>
    </div>
  );
}