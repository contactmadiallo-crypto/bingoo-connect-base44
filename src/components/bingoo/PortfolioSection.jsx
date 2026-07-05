import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Briefcase } from "lucide-react";

export default function PortfolioSection({ profileId, color = "#2563eb" }) {
  const { data: items = [] } = useQuery({
    queryKey: ["portfolio-public", profileId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicPortfolioItems', { profile_id: profileId });
      return res.data?.items || [];
    },
    enabled: !!profileId,
  });

  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-4 h-4" style={{ color }} />
        <h3 className="font-black text-sm uppercase tracking-widest" style={{ color }}>Portfolio</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <a key={item.id}
            href={item.link || undefined}
            target={item.link ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`group relative rounded-2xl overflow-hidden aspect-square bg-slate-800 flex flex-col justify-end ${item.link ? "cursor-pointer" : "cursor-default"}`}
            onClick={e => { if (!item.link) e.preventDefault(); }}>
            {item.image_url
              ? <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              : <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-slate-700 to-slate-800">🖼️</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative p-3">
              <p className="text-white font-bold text-xs leading-tight line-clamp-2">{item.title}</p>
              {item.category && <p className="text-white/50 text-xs mt-0.5">{item.category}</p>}
              {item.link && <ExternalLink className="w-3 h-3 text-white/50 mt-1" />}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}