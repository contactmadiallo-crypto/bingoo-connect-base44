import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BusinessHoursEditor from "./BusinessHoursEditor";
import { Button } from "@/components/ui/button";
import { Clock, Check } from "lucide-react";
import { toast } from "sonner";

export default function BusinessHoursTab({ profileId, isDark }) {
  const qc = useQueryClient();
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBg = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100";

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profile-for-hours", profileId],
    queryFn: () => base44.entities.Profile.filter({ id: profileId }),
    enabled: !!profileId,
  });

  const profile = profiles[0];
  const [hours, setHours] = useState(null); // null = not yet loaded

  // Once profile loads, seed local state
  const resolvedHours = hours !== null ? hours : (profile?.business_hours || {});

  const save = useMutation({
    mutationFn: () => base44.entities.Profile.update(profileId, { business_hours: resolvedHours }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-for-hours", profileId] });
      toast.success("Business hours saved!");
    },
    onError: () => toast.error("Failed to save hours"),
  });

  if (!profileId) return (
    <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
      <Clock className={`w-10 h-10 mx-auto mb-2 opacity-20`} />
      <p className={`text-sm ${mutedText}`}>Select a profile first.</p>
    </div>
  );

  if (isLoading) return (
    <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
      <p className={`text-sm ${mutedText}`}>Loading…</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-black text-lg flex items-center gap-2 ${headText}`}>
            <Clock className="w-5 h-5" /> Business Hours
          </h2>
          <p className={`text-xs mt-0.5 ${mutedText}`}>
            Set your opening & closing hours — visitors will see them on your public profile
          </p>
        </div>
      </div>

      {/* Editor card */}
      <div className={`rounded-2xl border p-5 ${isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100"}`}
        style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
        <BusinessHoursEditor
          value={resolvedHours}
          onChange={(v) => setHours(v)}
        />
      </div>

      <Button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
      >
        <Check className="w-4 h-4" />
        {save.isPending ? "Saving…" : "Save Hours"}
      </Button>
    </div>
  );
}