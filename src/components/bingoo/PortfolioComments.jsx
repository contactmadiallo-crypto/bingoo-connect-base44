import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PortfolioComments({ itemId, user }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["portfolio-comments", itemId],
    queryFn: () => base44.entities.Comment.filter({ portfolio_item_id: itemId }, "-created_date"),
    enabled: open && !!itemId,
  });

  const add = useMutation({
    mutationFn: () => base44.entities.Comment.create({
      portfolio_item_id: itemId,
      content: text.trim(),
      author_name: user?.full_name || "Anonymous",
      author_email: user?.email || "",
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio-comments", itemId] });
      setText("");
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio-comments", itemId] }),
  });

  return (
    <div className="border-t border-white/10 mt-3 pt-3">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors w-full"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Comments
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Comment list */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-white/25 italic text-center py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2 group">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5">
                    {c.author_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-white/70">{c.author_name || "Anonymous"}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-white/25">
                          {c.created_date ? formatDistanceToNow(new Date(c.created_date), { addSuffix: true }) : ""}
                        </span>
                        {c.created_by_id === user?.id && (
                          <button
                            onClick={() => remove.mutate(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5 break-words">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && text.trim()) { e.preventDefault(); add.mutate(); } }}
              placeholder="Leave a comment…"
              className="flex-1 text-xs bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-lg px-3 py-2 outline-none focus:border-blue-500/40 transition-colors"
            />
            <button
              disabled={!text.trim() || add.isPending}
              onClick={() => add.mutate()}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}