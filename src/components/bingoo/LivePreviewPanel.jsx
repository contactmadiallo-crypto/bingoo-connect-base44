import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ExternalLink, Smartphone, X } from "lucide-react";
import ProfilePreview from "./ProfilePreview";

export default function LivePreviewPanel({ form, profile }) {
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const screenRef = useRef(null);

  // Build a merged preview object: saved profile data overridden by live form values
  const previewProfile = { ...(profile || {}), ...form };
  const profileUrl = profile?.username ? `/p/${profile.username}` : null;

  // Scroll the preview screen to top whenever layout changes
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [form.layout]);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="hidden lg:flex fixed right-6 bottom-24 z-40 items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl text-sm font-bold hover:bg-slate-700 transition-colors"
      >
        <Smartphone className="w-4 h-4 text-[#E8671A]" />
        Show Preview
      </button>
    );
  }

  return (
    <div
      className="hidden lg:block sticky top-6 z-40 self-start"
      style={{ width: "260px" }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Live Preview</span>
          <span className="text-[9px] bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1">
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Open live profile"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title={collapsed ? "Show preview" : "Collapse"}
          >
            {collapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-400 transition-colors"
            title="Hide panel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* Phone shell */}
            <div
              className="relative mx-auto bg-slate-900 rounded-[2rem]"
              style={{
                width: "260px",
                padding: "10px",
                boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 0 0 1.5px rgba(255,255,255,0.07)",
              }}
            >
              {/* Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-b-xl z-10 flex items-center justify-center gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="w-6 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Screen */}
              <div
                ref={screenRef}
                className="rounded-[1.5rem] overflow-hidden bg-white"
                style={{
                  height: "520px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <ProfilePreview profile={previewProfile} />
              </div>

              {/* Home indicator */}
              <div className="flex justify-center mt-2">
                <div className="w-16 h-[3px] bg-slate-600 rounded-full" />
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-2">
              Updates as you type
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}