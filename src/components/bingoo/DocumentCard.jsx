import React from "react";
import { Lock, AlertCircle, Layers } from "lucide-react";
import { getFileIcon, getFileColor, isImageFile, getCatInfo, formatBytes } from "@/lib/docWalletUtils";

/**
 * DocumentCard — visual card with file thumbnail/preview, category badge,
 * front/back indicator, and expiration alert. Clickable to open detail modal.
 */
export default function DocumentCard({ doc, isDark, onClick }) {
  const Icon = getFileIcon(doc.file_name);
  const fileColor = getFileColor(doc.file_name);
  const cat = getCatInfo(doc.document_type);
  const isImg = isImageFile(doc.file_name);
  const hasBack = !!doc.file_url_back;
  const isExpired = doc.expiration_date && new Date(doc.expiration_date) < new Date();
  const isExpiringSoon = doc.expiration_date && !isExpired &&
    new Date(doc.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBorder = isDark ? "border-white/8" : "border-slate-200";
  const cardBg = isDark ? "bg-white/3" : "bg-white";

  return (
    <div
      onClick={onClick}
      className={`group rounded-xl border ${cardBorder} ${cardBg} overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-orange-300 active:scale-[0.98]`}
    >
      <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" }}>
        {isImg ? (
          <img src={doc.file_url} alt={doc.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Icon className="w-8 h-8" style={{ color: fileColor }} />
            <span className={`text-[9px] font-bold uppercase ${mutedText}`}>
              {doc.file_name?.split(".").pop()}
            </span>
          </div>
        )}
        {cat && (
          <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: cat.color }}>
            {cat.label}
          </span>
        )}
        {hasBack && (
          <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#0b2149" }}>
            <Layers className="w-2.5 h-2.5" /> 2
          </span>
        )}
        {(isExpired || isExpiringSoon) && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: isExpired ? "#ef4444" : "#f97316" }}>
            <AlertCircle className="w-2.5 h-2.5" />
            {isExpired ? "Expired" : "Soon"}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className={`text-xs font-bold ${headText} truncate`}>{doc.file_name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {doc.file_size > 0 && <span className={`text-[10px] ${mutedText}`}>{formatBytes(doc.file_size)}</span>}
          <Lock className={`w-2.5 h-2.5 ${mutedText}`} />
        </div>
      </div>
    </div>
  );
}