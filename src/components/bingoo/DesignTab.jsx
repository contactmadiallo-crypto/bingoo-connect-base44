import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { layouts } from "./LayoutPicker";
import { Link } from "react-router-dom";
import { Eye, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";

export default function DesignTab({ profile }) {
  const { isDark } = useBingooTheme();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  const isPro = profile?.plan === "pro" || profile?.plan === "business";
  const currentLayout = profile?.layout || "classic";
  const color = profile?.cover_color || "#2563eb";
  const profileUrl = profile ? `${window.location.origin}/p/${profile.username}` : null;

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark
    ? "bg-white/5 border border-white/10 hover:border-white/20"
    : "bg-white border border-slate-200 hover:border-slate-300";

  const selectLayout = async (layoutId) => {
    if (!profile) return;
    setSaving(layoutId);
    await base44.entities.Profile.update(profile.id, { layout: layoutId });
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    setSaving(null);
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className={`text-lg font-semibold ${subText}`}>Create a profile first to customize its design.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-black ${headText}`}>Profile Design</h2>
        <p className={`text-sm mt-1 ${subText}`}>
          Choose a layout for <span className="font-bold">/p/{profile.username}</span>. Changes apply instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          const isActive = currentLayout === layout.id;
          const isSaving = saving === layout.id;

          return (
            <div
              key={layout.id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${cardBase} ${
                isActive
                  ? isDark
                    ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent"
                    : "ring-2 ring-blue-600 ring-offset-2"
                  : ""
              } ${locked ? "opacity-70" : ""}`}
            >
              {/* Preview thumbnail */}
              <div
                className="w-full aspect-[4/3] p-3 cursor-pointer"
                style={{ background: isDark ? "#0f1628" : "#f1f5f9" }}
                onClick={() => !locked && selectLayout(layout.id)}
              >
                <div className="w-full h-full">
                  {layout.preview(color)}
                </div>
              </div>

              {locked && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  <Lock className="w-3 h-3" /> PRO
                </div>
              )}

              {isActive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  <Check className="w-3 h-3" /> Active
                </div>
              )}

              <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className="mb-3">
                  <p className={`font-black text-base ${headText}`}>{layout.name}</p>
                  <p className={`text-xs mt-0.5 ${subText}`}>{layout.desc}</p>
                </div>
                <div className="flex gap-2">
                  {locked ? (
                    <Link to="/pricing" className="flex-1">
                      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5" /> Upgrade to Unlock
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => selectLayout(layout.id)}
                        disabled={isActive || !!saving}
                        className={`flex-1 font-bold text-xs gap-1.5 ${
                          isActive
                            ? isDark
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        variant={isActive ? "outline" : "default"}
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Applying
                          </span>
                        ) : isActive ? (
                          <><Check className="w-3.5 h-3.5" /> Current</>
                        ) : (
                          "Apply Layout"
                        )}
                      </Button>
                      {profileUrl && (
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className={`px-3 gap-1.5 text-xs font-semibold ${isDark ? "border-white/15 text-white/60 hover:bg-white/10 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isPro && (
        <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-100"}`}>
          <div className="flex-1">
            <p className={`font-black text-base ${isDark ? "text-amber-400" : "text-amber-700"}`}>Unlock Dark, Bold and Split layouts</p>
            <p className={`text-sm mt-0.5 ${isDark ? "text-amber-500/70" : "text-amber-600"}`}>Upgrade to Pro to access all premium layout styles.</p>
          </div>
          <Link to="/pricing" className="flex-shrink-0">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold">Upgrade to Pro</Button>
          </Link>
        </div>
      )}
    </div>
  );
}