/**
 * LivePreviewPanel — sticky phone-frame preview for DesignTab
 * Desktop: fixed right-side panel with phone shell, draggable
 * Mobile: floating FAB that opens a modal preview
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, Smartphone, GripVertical, ExternalLink } from "lucide-react";
import ProfilePreview from "./ProfilePreview";
import { ProfileHeaderPreview, DesignPreview, TeamPreview, ServicesPreview, PracticeAreasPreview, OfficeLocationsPreview } from "./SectionPreview";

const PANEL_WIDTH = 272;
const PANEL_HEIGHT = 580;
const PHONE_CONTENT_HEIGHT = 500;

// Map tab → preview label
const PREVIEW_LABELS = {
  profile: "Header Preview",
  design: "Design Preview",
  team: "Team Section",
  services: "Services Section",
  legal_services: "Practice Areas",
  offices: "Locations Section",
};

function SectionContent({ previewMode, previewProfile, isDark, isLawFirm }) {
  if (previewMode === "profile") return <ProfileHeaderPreview profile={previewProfile} />;
  if (previewMode === "design") return <DesignPreview profile={previewProfile} />;
  if (previewMode === "team") return <TeamPreview profileId={previewProfile?.id} isDark={isDark} />;
  if (previewMode === "services") return <ServicesPreview profileId={previewProfile?.id} isDark={isDark} isLawFirm={isLawFirm} />;
  if (previewMode === "legal_services") return <PracticeAreasPreview profileId={previewProfile?.id} isDark={isDark} />;
  if (previewMode === "offices") return <OfficeLocationsPreview profileId={previewProfile?.id} isDark={isDark} />;
  // fallback: full profile
  return <ProfilePreview profile={previewProfile} />;
}

export default function LivePreviewPanel({ profile, pendingProfile, hasChanges, isDark, previewMode, isLawFirm }) {
  const previewProfile = pendingProfile || profile;
  const profileUrl = profile?.username ? `https://bingooconnect.com/p/${profile.username}` : null;
  const label = PREVIEW_LABELS[previewMode] || "Live Preview";

  // Desktop: draggable panel state
  const [pos, setPos] = useState({ x: null, y: null }); // null = default positioning via CSS
  const [dragging, setDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dragStart = useRef(null);
  const panelRef = useRef(null);

  // Mobile: modal open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize default position on mount
  useEffect(() => {
    const setDefaultPos = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw >= 1024) {
        setPos({ x: vw - PANEL_WIDTH - 24, y: Math.max(80, (vh - PANEL_HEIGHT) / 2) });
      }
    };
    setDefaultPos();
    window.addEventListener("resize", setDefaultPos);
    return () => window.removeEventListener("resize", setDefaultPos);
  }, []);

  // Drag handlers
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x ?? rect.left, py: pos.y ?? rect.top };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nx = Math.max(0, Math.min(vw - PANEL_WIDTH, dragStart.current.px + dx));
      const ny = Math.max(0, Math.min(vh - 80, dragStart.current.py + dy));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const screenRef = useRef(null);
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [previewProfile?.layout]);

  const panelBg = isDark ? "rgba(13,16,33,0.97)" : "rgba(255,255,255,0.97)";
  const panelBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const headerBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const mutedText = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8";

  // ── Desktop Panel ──────────────────────────────────────────
  const DesktopPanel = (
    <div
      ref={panelRef}
      className="hidden lg:block fixed z-40"
      style={{
        left: pos.x ?? "auto",
        top: pos.y ?? 80,
        right: pos.x == null ? 24 : "auto",
        width: PANEL_WIDTH,
        userSelect: "none",
        cursor: dragging ? "grabbing" : "default",
        filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.22))",
      }}
    >
      <div style={{
        borderRadius: 20,
        border: `1px solid ${panelBorder}`,
        background: panelBg,
        backdropFilter: "blur(20px)",
        overflow: "hidden",
      }}>
        {/* Drag handle / header */}
        <div
          onMouseDown={onMouseDown}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px",
            background: headerBg,
            borderBottom: `1px solid ${panelBorder}`,
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <GripVertical size={14} color={mutedText} />
            <Smartphone size={13} color={mutedText} />
            <span style={{ fontSize: 11, fontWeight: 800, color: mutedText, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {label}
            </span>
            {hasChanges && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "2px 7px", borderRadius: 999 }}>
                UNSAVED
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open live profile"
                style={{ display: "flex", padding: 4, borderRadius: 8, color: mutedText, textDecoration: "none" }}
                onMouseDown={e => e.stopPropagation()}
              >
                <ExternalLink size={12} />
              </a>
            )}
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setCollapsed(c => !c)}
              style={{ display: "flex", padding: 4, borderRadius: 8, color: mutedText, background: "none", border: "none", cursor: "pointer" }}
              title={collapsed ? "Show" : "Collapse"}
            >
              {collapsed ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {/* Phone shell */}
              <div style={{ padding: "14px 12px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 240, background: "#0f172a", borderRadius: 32,
                  padding: 10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(255,255,255,0.07)",
                }}>
                  {/* Notch */}
                  <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 4 }}>
                    <div style={{ width: 64, height: 14, background: "#0f172a", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#334155" }} />
                      <div style={{ width: 20, height: 3, borderRadius: 999, background: "#334155" }} />
                    </div>
                  </div>

                  {/* Screen */}
                  <div
                    ref={screenRef}
                    style={{
                      borderRadius: 22,
                      height: PHONE_CONTENT_HEIGHT,
                      overflowY: "auto",
                      overflowX: "hidden",
                      background: "#fff",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {/* Scale down the 375px-wide profile to fit 220px screen */}
                    <div style={{ width: 375, transform: "scale(0.587)", transformOrigin: "top left", height: Math.round(PHONE_CONTENT_HEIGHT / 0.587) }}>
                       <SectionContent previewMode={previewMode} previewProfile={previewProfile} isDark={isDark} isLawFirm={isLawFirm} />
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                    <div style={{ width: 60, height: 3, borderRadius: 999, background: "#334155" }} />
                  </div>
                </div>

                <p style={{ fontSize: 10, color: mutedText, marginTop: 8, textAlign: "center", fontWeight: 600 }}>
                  Updates as you change settings
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // ── Mobile FAB + Modal ─────────────────────────────────────
  const MobileFAB = (
    <div className="lg:hidden">
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed", bottom: 90, right: 20, zIndex: 40,
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 18px", borderRadius: 999,
          background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)",
          color: "#fff", fontWeight: 800, fontSize: 13,
          boxShadow: "0 6px 24px rgba(11,46,107,0.45)",
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
        }}
      >
        <Smartphone size={16} />
        Preview
        {hasChanges && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}
          >
            {/* Close */}
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Smartphone size={16} color="rgba(255,255,255,0.7)" />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              {hasChanges && <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: 999 }}>UNSAVED</span>}
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              style={{
                width: 300, background: "#0f172a", borderRadius: 36,
                padding: 12,
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                <div style={{ width: 64, height: 14, background: "#0f172a", borderRadius: "0 0 12px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#334155" }} />
                  <div style={{ width: 20, height: 3, borderRadius: 999, background: "#334155" }} />
                </div>
              </div>
              <div style={{ borderRadius: 26, height: 560, overflowY: "auto", overflowX: "hidden", background: "#fff", scrollbarWidth: "none" }}>
                <div style={{ width: 375, transform: "scale(0.747)", transformOrigin: "top left", height: Math.round(560 / 0.747) }}>
                  <SectionContent previewMode={previewMode} previewProfile={previewProfile} isDark={isDark} isLawFirm={isLawFirm} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                <div style={{ width: 60, height: 3, borderRadius: 999, background: "#334155" }} />
              </div>
            </motion.div>

            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                <ExternalLink size={12} /> Open live profile
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {DesktopPanel}
      {MobileFAB}
    </>
  );
}