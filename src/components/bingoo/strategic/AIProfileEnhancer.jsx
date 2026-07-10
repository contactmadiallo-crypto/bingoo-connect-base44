import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Check, X, Loader2, PenTool, Palette, Zap } from "lucide-react";

const SUGGESTION_TYPES = [
  { key: "bio", label: "Bio", icon: PenTool },
  { key: "layout", label: "Layout", icon: Palette },
  { key: "ctas", label: "CTAs", icon: Zap },
];

export default function AIProfileEnhancer({ profile, isDark, onApply }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [applied, setApplied] = useState({});
  const [error, setError] = useState("");

  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";
  const inputBg = isDark ? "bg-white/5" : "bg-slate-50";

  const generateSuggestions = async () => {
    if (!input.trim() || !profile) return;
    setLoading(true);
    setError("");
    setSuggestions(null);
    setApplied({});
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert profile consultant for Bingoo Connect, a digital business card platform.
A user has an existing profile and wants AI suggestions to improve it.

Current profile:
- Name: ${profile.display_name || "N/A"}
- Job title: ${profile.job_title || "N/A"}
- Company: ${profile.company_name || "N/A"}
- Current bio: ${profile.bio || "(empty)"}
- Current layout: ${profile.layout || "classic"}
- Plan: ${profile.plan || "free"}

User's request: "${input.trim()}"

Generate 3 improvement suggestions as JSON:
1. "bio": A rewritten professional bio (2-4 sentences, engaging, first person). Only provide if the current bio is empty or could be improved.
2. "layout": Recommend the single best layout from this list: executive, luxury, modern_saas, glass_card, premium_salon, modern_law, realtor_luxury, bold, aurora. Explain why in "layout_reason".
3. "ctas": An array of 2-3 recommended call-to-action buttons (e.g. "Book Consultation", "Call Now", "WhatsApp", "Save Contact", "View Portfolio"). Each as { label, type } where type is one of: phone, whatsapp, email, booking, save_contact, website.

Return ONLY valid JSON with keys: bio, layout, layout_reason, ctas.`,
        response_json_schema: {
          type: "object",
          properties: {
            bio: { type: "string" },
            layout: { type: "string" },
            layout_reason: { type: "string" },
            ctas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  type: { type: "string" },
                },
              },
            },
          },
        },
      });
      const data = typeof res === "string" ? JSON.parse(res) : res;
      setSuggestions(data);
    } catch (e) {
      setError("Couldn't generate suggestions. Please try again.");
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!onApply) return;
    const updates = {};
    if (applied.bio && suggestions?.bio) updates.bio = suggestions.bio;
    if (applied.layout && suggestions?.layout) updates.layout = suggestions.layout;
    if (Object.keys(updates).length === 0) return;
    await onApply(updates);
    setSuggestions(null);
    setInput("");
    setApplied({});
  };

  const toggleApplied = (key) => {
    setApplied((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0b2149, #f97316)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-sm font-black ${headText}`}>AI Profile Enhancer</h3>
            <p className={`text-xs ${mutedText}`}>Get AI suggestions to improve your existing profile</p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateSuggestions()}
            placeholder="e.g. I'm a lawyer who wants more consultation bookings"
            className={`flex-1 px-4 py-3 rounded-xl border ${cardBorder} ${inputBg} ${headText} text-sm outline-none focus:ring-2 focus:ring-orange-500/30`}
            disabled={loading}
          />
          <button
            onClick={generateSuggestions}
            disabled={!input.trim() || loading}
            className="px-4 rounded-xl flex items-center gap-2 text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #0b2149, #13284f)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "..." : "Enhance"}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-slate-50"} animate-pulse`}>
                <div className={`h-3 w-20 rounded mb-2 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className={`h-4 w-full rounded mb-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className={`h-4 w-2/3 rounded ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions && !loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {/* Bio suggestion */}
              {suggestions.bio && (
                <SuggestionCard
                  type="bio"
                  icon={PenTool}
                  label="Bio Suggestion"
                  value={suggestions.bio}
                  isApplied={applied.bio}
                  onToggle={() => toggleApplied("bio")}
                  isDark={isDark}
                />
              )}

              {/* Layout suggestion */}
              {suggestions.layout && (
                <SuggestionCard
                  type="layout"
                  icon={Palette}
                  label={`Layout: ${suggestions.layout}`}
                  value={suggestions.layout_reason || "Recommended for your profile type."}
                  isApplied={applied.layout}
                  onToggle={() => toggleApplied("layout")}
                  isDark={isDark}
                />
              )}

              {/* CTA suggestions */}
              {suggestions.ctas && suggestions.ctas.length > 0 && (
                <div className={`rounded-xl p-4 border ${cardBorder} ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <p className={`text-xs font-bold ${mutedText}`}>RECOMMENDED CTAS</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.ctas.map((cta, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>
                        {cta.label}
                      </span>
                    ))}
                  </div>
                  <p className={`text-xs ${mutedText} mt-2`}>Add these as custom links in your Profile Editor.</p>
                </div>
              )}

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={!applied.bio && !applied.layout}
                className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                <Check className="w-4 h-4" />
                Apply Selected Suggestions
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuggestionCard({ type, icon: Icon, label, value, isApplied, onToggle, isDark }) {
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200";
  return (
    <div className={`rounded-xl p-4 border ${cardBg}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 mb-1">{label.toUpperCase()}</p>
          <p className={`text-sm ${isDark ? "text-white/90" : "text-slate-700"} leading-relaxed`}>{value}</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isApplied ? "bg-emerald-500" : isDark ? "bg-white/10" : "bg-slate-200"
          }`}
        >
          {isApplied ? <Check className="w-4 h-4 text-white" /> : <X className={`w-4 h-4 ${isDark ? "text-white/40" : "text-slate-400"}`} />}
        </button>
      </div>
    </div>
  );
}