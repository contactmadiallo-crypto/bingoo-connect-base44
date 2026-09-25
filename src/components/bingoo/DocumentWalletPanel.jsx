import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload, Plus, Lock, X, FileText, Layers,
} from "lucide-react";
import {
  DOC_CATEGORIES, ID_TYPES, getFileIcon, getFileColor, isImageFile, formatBytes,
} from "@/lib/docWalletUtils";
import DocumentCard from "@/components/bingoo/DocumentCard";
import DocumentDetailModal from "@/components/bingoo/DocumentDetailModal";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function DocumentWalletPanel({ profile, isDark }) {
  const { language } = useI18n();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [formData, setFormData] = useState({ document_type: "other", notes: "", expiration_date: "" });
  const [backTargetIndex, setBackTargetIndex] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Document Wallet is temporarily locked for production stabilization.
  // Existing records remain private and preserved. Re-enable by setting false.
  const WALLET_LOCKED = true;

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: documents, isLoading } = useQuery({
    queryKey: ["doc-wallet", user?.id],
    queryFn: () => base44.entities.DocumentWalletItem.filter({ owner_user_id: user.id }, "-created_date", 200),
    enabled: !!user?.id,
  });

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";

  // Trigger hidden file input when a pending card requests a back-side upload
  useEffect(() => {
    if (backTargetIndex !== null && backInputRef.current) {
      backInputRef.current.click();
    }
  }, [backTargetIndex]);

  const isIdType = ID_TYPES.includes(formData.document_type);
  const filteredDocs = (documents || []).filter(d => activeCategory === "all" || d.document_type === activeCategory);
  const categoryCounts = {};
  (documents || []).forEach(d => { categoryCounts[d.document_type] = (categoryCounts[d.document_type] || 0) + 1; });

  // ── Multi-file upload ──
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { file_url, file_name: file.name, file_size: file.size, back_url: "", back_name: "", back_size: 0 };
      }));
      setPendingFiles(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} ${uploaded.length > 1 ? t("doc_documents",language) : t("doc_document",language)} ${t("doc_uploaded",language)}`);
    } catch (err) {
      toast.error(`${t("doc_upload_failed",language)}: ${err.message || t("doc_unknown_error",language)}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBackUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || backTargetIndex === null) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingFiles(prev => prev.map((p, i) =>
        i === backTargetIndex ? { ...p, back_url: file_url, back_name: file.name, back_size: file.size } : p
      ));
      toast.success(t("doc_back_added",language));
    } catch (err) {
      toast.error(`${t("doc_upload_failed",language)}: ${err.message || t("doc_unknown_error",language)}`);
    } finally {
      setBackTargetIndex(null);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  const removePending = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removePendingBack = (index) => {
    setPendingFiles(prev => prev.map((p, i) =>
      i === index ? { ...p, back_url: "", back_name: "", back_size: 0 } : p
    ));
  };

  // ── Save all pending files as separate documents ──
  const handleSaveAll = async () => {
    if (!pendingFiles.length || !user?.id) return;
    try {
      await Promise.all(pendingFiles.map(p =>
        base44.entities.DocumentWalletItem.create({
          owner_user_id: user.id,
          profile_id: profile?.id,
          file_url: p.file_url,
          file_name: p.file_name,
          file_size: p.file_size || undefined,
          file_url_back: p.back_url || undefined,
          file_name_back: p.back_name || undefined,
          file_size_back: p.back_size || undefined,
          document_type: formData.document_type,
          notes: formData.notes || undefined,
          expiration_date: formData.expiration_date || undefined,
          visibility: "private",
        })
      ));
      toast.success(`${pendingFiles.length} ${pendingFiles.length > 1 ? t("doc_documents",language) : t("doc_document",language)} ${t("doc_saved",language)}`);
      setPendingFiles([]);
      setFormData({ document_type: "other", notes: "", expiration_date: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["doc-wallet", user.id] });
    } catch (err) {
      toast.error(`${t("doc_error",language)}: ${err.message || t("doc_unknown_error",language)}`);
    }
  };

  const resetForm = () => {
    setPendingFiles([]);
    setFormData({ document_type: "other", notes: "", expiration_date: "" });
    setShowForm(false);
  };

  const renderPendingCard = (p, index) => {
    const Icon = getFileIcon(p.file_name);
    const fileColor = getFileColor(p.file_name);
    const isImg = isImageFile(p.file_name);
    return (
      <div key={index} className={`rounded-xl border ${panelBorder} overflow-hidden ${isDark ? "bg-white/3" : "bg-white"}`}>
        <div className="flex gap-2 p-2">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc" }}>
            {isImg ? (
              <img src={p.file_url} alt={p.file_name} className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-5 h-5" style={{ color: fileColor }} />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className={`text-xs font-bold ${headText} truncate`}>{p.file_name}</p>
            <p className={`text-[10px] ${mutedText}`}>{formatBytes(p.file_size)}</p>
            {p.back_url && (
              <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-bold mt-0.5">
                <Layers className="w-2.5 h-2.5" /> {t("doc_has_back",language)}
              </span>
            )}
          </div>
          <button onClick={() => removePending(index)} className="text-red-400 hover:text-red-500 flex-shrink-0 self-start">
            <X className="w-4 h-4" />
          </button>
        </div>
        {isIdType && (
          <div className="px-2 pb-2">
            {p.back_url ? (
              <div className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-[10px] ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <span className={`truncate ${headText}`}>{t("doc_back",language)}: {p.back_name}</span>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setBackTargetIndex(index)} className="text-blue-500 font-bold">{t("doc_replace",language)}</button>
                  <button onClick={() => removePendingBack(index)} className="text-red-500 font-bold">{t("doc_remove",language)}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setBackTargetIndex(index)}
                className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed text-[10px] font-bold ${mutedText} ${isDark ? "border-white/15" : "border-slate-300"}`}>
                <Upload className="w-3 h-3" /> {t("doc_add_back",language)}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Locked state: render a clean "Coming Soon" card and stop here ──
  if (WALLET_LOCKED) {
    return (
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-8 flex flex-col items-center text-center`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(249,115,22,0.1)" }}>
          <Lock className="w-7 h-7" style={{ color: "#f97316" }} />
        </div>
        <p className={`font-black text-base ${headText}`}>{t("doc_wallet_coming",language)}</p>
        <p className={`text-xs mt-2 max-w-xs leading-relaxed ${mutedText}`}>
          {t("doc_wallet_coming_copy",language)}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(249,115,22,0.1)" }}>
            <FileText className="w-5 h-5" style={{ color: "#f97316" }} />
          </div>
          <div>
            <p className={`font-bold text-sm ${headText}`}>{t("doc_wallet_title",language)}</p>
            <p className={`text-xs ${mutedText}`}>{t("doc_wallet_subtitle",language)}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white min-h-[40px] flex-shrink-0"
          style={{ background: "#f97316" }}>
          <Plus className="w-4 h-4" /> {t("doc_add",language)}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
        <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
        <p className={`text-xs leading-relaxed ${isDark ? "text-blue-200" : "text-blue-700"}`}>
          {t("doc_private_copy",language)} <span className="font-bold">{t("doc_private_bold",language)}</span>. {t("doc_private_suffix",language)}
        </p>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className={`rounded-xl border ${panelBorder} p-4 space-y-3 ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          {/* Multi-file Upload Zone */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>{t("doc_files",language)}</label>
            <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[120px] ${isDark ? "border-white/20 hover:border-white/40" : "border-slate-300 hover:border-slate-400"}`}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <Upload className={`w-6 h-6 ${mutedText}`} />
              )}
              <span className={`text-xs ${mutedText}`}>
                {uploading ? t("doc_uploading",language) : t("doc_click_upload",language)}
              </span>
              <span className={`text-[10px] ${mutedText}`}>
                {t("doc_formats",language)}
              </span>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Pending files list */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${headText}`}>{pendingFiles.length} {t("doc_files_ready",language)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingFiles.map((p, i) => renderPendingCard(p, i))}
              </div>
            </div>
          )}

          {/* Category + Expiration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>{t("doc_category_all",language)}</label>
              <select value={formData.document_type}
                onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`}>
                {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{t(`doc_cat_${c.value}`,language)}</option>)}
              </select>
              {isIdType && (
                <p className={`text-[10px] mt-1 ${mutedText}`}>{t("doc_id_front_back",language)}</p>
              )}
            </div>
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>{t("doc_expiration_all",language)}</label>
              <input type="date" value={formData.expiration_date}
                onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>{t("doc_notes_all",language)}</label>
            <textarea value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("doc_notes_ph",language)}
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} resize-none`} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleSaveAll} disabled={uploading || pendingFiles.length === 0}
              className="flex-1 px-4 py-2.5 rounded-lg text-white text-xs font-bold min-h-[40px] disabled:opacity-50"
              style={{ background: "#f97316" }}>
              {t("doc_save",language)} {pendingFiles.length > 0 ? `${pendingFiles.length} ${pendingFiles.length > 1 ? t("doc_documents",language) : t("doc_document",language)}` : t("doc_document",language)}
            </button>
            <button onClick={resetForm}
              className={`px-4 py-2.5 rounded-lg border ${panelBorder} text-xs font-bold ${headText} min-h-[40px]`}>
              {t("doc_cancel",language)}
            </button>
          </div>
        </div>
      )}

      {/* Hidden back-side input (shared) */}
      <input type="file" ref={backInputRef} onChange={handleBackUpload} className="hidden" />

      {/* Category Filter Chips */}
      {(documents || []).length > 0 && (
        <div className="w-full min-w-0 overflow-x-auto scrollbar-hide pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex w-max min-w-full gap-1.5 px-1 whitespace-nowrap">
          <button onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              activeCategory === "all" ? "text-white" : isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500"
            }`}
            style={activeCategory === "all" ? { background: "#0b2149" } : {}}>
            {t("doc_all",language)} ({(documents || []).length})
          </button>
          {DOC_CATEGORIES.filter(c => categoryCounts[c.value]).map(c => (
            <button key={c.value} onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeCategory === c.value ? "text-white" : isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500"
              }`}
              style={activeCategory === c.value ? { background: c.color } : {}}>
              {t(`doc_cat_${c.value}`,language)} ({categoryCounts[c.value]})
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : (documents || []).length === 0 ? (
        <div className={`text-center py-10 rounded-xl border ${panelBorder} ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          <FileText className={`w-8 h-8 mx-auto mb-2 ${mutedText}`} />
          <p className={`text-sm font-bold ${headText}`}>{t("doc_none",language)}</p>
          <p className={`text-xs ${mutedText} mt-1`}>
            {t("doc_none_copy",language)}
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className={`text-center py-8 rounded-xl ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          <p className={`text-xs ${mutedText}`}>{t("doc_none_category",language)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredDocs.map(doc => (
            <DocumentCard key={doc.id} doc={doc} isDark={isDark} onClick={() => setSelectedDoc(doc)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          isDark={isDark}
          onClose={() => setSelectedDoc(null)}
          onUpdated={() => qc.invalidateQueries({ queryKey: ["doc-wallet", user?.id] })}
          onDeleted={() => qc.invalidateQueries({ queryKey: ["doc-wallet", user?.id] })}
        />
      )}
    </div>
  );
}