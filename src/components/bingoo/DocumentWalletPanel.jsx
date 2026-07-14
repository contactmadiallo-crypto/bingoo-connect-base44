import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload, Trash2, Plus, Lock, X, FileText, Layers,
} from "lucide-react";
import {
  DOC_CATEGORIES, ID_TYPES, getFileIcon, getFileColor, isImageFile, getCatInfo, formatBytes,
} from "@/lib/docWalletUtils";
import DocumentCard from "@/components/bingoo/DocumentCard";
import DocumentDetailModal from "@/components/bingoo/DocumentDetailModal";

export default function DocumentWalletPanel({ profile, isDark }) {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [formData, setFormData] = useState({ document_type: "id", notes: "", expiration_date: "" });
  const [backTargetIndex, setBackTargetIndex] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

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
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
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
      toast.success("Back side added");
    } catch (err) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
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
      toast.success(`${pendingFiles.length} document${pendingFiles.length > 1 ? "s" : ""} saved`);
      setPendingFiles([]);
      setFormData({ document_type: "id", notes: "", expiration_date: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["doc-wallet", user.id] });
    } catch (err) {
      toast.error("Error: " + (err.message || "Unknown error"));
    }
  };

  const resetForm = () => {
    setPendingFiles([]);
    setFormData({ document_type: "id", notes: "", expiration_date: "" });
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
                <Layers className="w-2.5 h-2.5" /> Has back side
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
                <span className={`truncate ${headText}`}>Back: {p.back_name}</span>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setBackTargetIndex(index)} className="text-blue-500 font-bold">Replace</button>
                  <button onClick={() => removePendingBack(index)} className="text-red-500 font-bold">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setBackTargetIndex(index)}
                className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed text-[10px] font-bold ${mutedText} ${isDark ? "border-white/15" : "border-slate-300"}`}>
                <Upload className="w-3 h-3" /> Add Back Side
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
            <p className={`font-bold text-sm ${headText}`}>Document Wallet</p>
            <p className={`text-xs ${mutedText}`}>Secure private document storage</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white min-h-[40px] flex-shrink-0"
          style={{ background: "#f97316" }}>
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Privacy Notice */}
      <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
        <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
        <p className={`text-xs leading-relaxed ${isDark ? "text-blue-200" : "text-blue-700"}`}>
          Documents are <span className="font-bold">private by default</span>. Only you can view, download, or delete them. Supports PDF, Word, Excel, images — and front/back sides for IDs.
        </p>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className={`rounded-xl border ${panelBorder} p-4 space-y-3 ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          {/* Multi-file Upload Zone */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Document File(s)</label>
            <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[120px] ${isDark ? "border-white/20 hover:border-white/40" : "border-slate-300 hover:border-slate-400"}`}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <Upload className={`w-6 h-6 ${mutedText}`} />
              )}
              <span className={`text-xs ${mutedText}`}>
                {uploading ? "Uploading…" : "Click to upload — multiple files at once"}
              </span>
              <span className={`text-[10px] ${mutedText}`}>
                PDF, Word, Excel, PowerPoint, Images, SSN, ID, Work Auth — all formats
              </span>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Pending files list */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${headText}`}>{pendingFiles.length} file(s) ready to save</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingFiles.map((p, i) => renderPendingCard(p, i))}
              </div>
            </div>
          )}

          {/* Category + Expiration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Category (applies to all)</label>
              <select value={formData.document_type}
                onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`}>
                {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {isIdType && (
                <p className={`text-[10px] mt-1 ${mutedText}`}>ID type — each file can have a front & back side</p>
              )}
            </div>
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Expiration Date (applies to all)</label>
              <input type="date" value={formData.expiration_date}
                onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Notes (optional, applies to all)</label>
            <textarea value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about these documents…"
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} resize-none`} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleSaveAll} disabled={uploading || pendingFiles.length === 0}
              className="flex-1 px-4 py-2.5 rounded-lg text-white text-xs font-bold min-h-[40px] disabled:opacity-50"
              style={{ background: "#f97316" }}>
              Save {pendingFiles.length > 0 ? `${pendingFiles.length} Document${pendingFiles.length > 1 ? "s" : ""}` : "Document"}
            </button>
            <button onClick={resetForm}
              className={`px-4 py-2.5 rounded-lg border ${panelBorder} text-xs font-bold ${headText} min-h-[40px]`}>
              Cancel
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
            All ({(documents || []).length})
          </button>
          {DOC_CATEGORIES.filter(c => categoryCounts[c.value]).map(c => (
            <button key={c.value} onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeCategory === c.value ? "text-white" : isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500"
              }`}
              style={activeCategory === c.value ? { background: c.color } : {}}>
              {c.label} ({categoryCounts[c.value]})
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
          <p className={`text-sm font-bold ${headText}`}>No documents yet</p>
          <p className={`text-xs ${mutedText} mt-1`}>
            Upload IDs, SSN cards, work authorizations, certifications, contracts, and more.
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className={`text-center py-8 rounded-xl ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          <p className={`text-xs ${mutedText}`}>No documents in this category.</p>
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