import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ExternalLink, Smartphone } from "lucide-react";
import ProfilePreview from "./ProfilePreview";

export default function LivePreviewPanel({ form, profile }) {
  const [collapsed, setCollapsed] = useState(false);

  // Build a merged preview object: saved profile data overridden by live form values
  const previewProfile = {
    ...(profile || {}),
    ...form,
  };

  const profileUrl = profile?.username ? `/p/${profile.username}` : null;

  return (
    <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0">
      {/* Sticky container */}
      <div className="sticky top-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Live Preview</span>
            <span className="text-[10px] bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Open live profile"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title={collapsed ? "Show preview" : "Hide preview"}
            >
              {collapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Phone frame */}
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          style={{ overflow: "hidden" }}
        >
          {/* Outer phone shell */}
          <div
            className="relative mx-auto bg-slate-900 rounded-[2.5rem] shadow-2xl"
            style={{
              width: "280px",
              padding: "12px",
              boxShadow: "0 30px 60px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)",
            }}
          >
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-xl z-10 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div className="w-8 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Screen */}
            <div
              className="rounded-[1.8rem] overflow-hidden bg-white"
              style={{ height: "560px", overflowY: "auto", scrollbarWidth: "none" }}
            >
              <ProfilePreview profile={previewProfile} />
            </div>

            {/* Home indicator */}
            <div className="flex justify-center mt-2">
              <div className="w-20 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3">
            Updates instantly as you type
          </p>
        </motion.div>
      </div>
    </div>
  );
}