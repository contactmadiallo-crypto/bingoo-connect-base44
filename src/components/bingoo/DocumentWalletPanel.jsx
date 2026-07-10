import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText, FileImage, FileSpreadsheet, FileArchive, File,
  Upload, Trash2, Download, Calendar, Lock, Plus, AlertCircle,
  X, Check
} from "lucide-react";

const DOC_CATEGORIES = [
  { value: "id", label: "ID Document", color: "#3b82f6" },
  { value: "passport", label: "Passport", color: "#3b82f6" },
  { value: "ssn", label: "SSN Card", color: "#ef4444" },
  { value: "work_authorization", label: "Work Authorization", color: "#22c55e" },
  { value: "visa", label: "Visa", color: "#a855f7" },
  { value: "certification", label: "Certification", color: "#10b981" },
  { value: "license", label: "License", color: "#a855f7" },
  { value: "business_document", label: "Business Document", color: "#f97316" },
  { value: "contract", label: "Contract", color: "#64748b" },
  { value: "tax_document", label: "Tax Document", color: "#f59e0b" },
  { value: "insurance", label: "Insurance", color: "#06b6d4" },
  { value: "medical_record", label: "Medical Record", color: "#f43f5e" },
  { value: "education", label: "Education / Diploma", color: "#6366f1" },
  { value: "resume", label: "Resume / CV", color: "#14b8a6" },
  { value: "photo", label: "Photo", color: "#ec4899" },
  { value: "financial", label: "Financial Document", color: "#eab308" },
  { value: "legal", label: "Legal Document", color: "#64748b" },
  { value: "other", label: "Other", color: "#94a3b8" },
];

function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (["jpg","jpeg","png","gif","webp","heic","bmp","tiff","svg"].includes(ext)) return FileImage;
  if (["xls","xlsx","csv"].includes(ext)) return FileSpreadsheet;
  if (["zip","rar","7z"].includes(ext)) return FileArchive;
  return FileText;
}

function getFileColor(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "#ef4444";
  if (["doc","docx"].includes(ext)) return "#3b82f6";
  if (["xls","xlsx","csv"].includes(ext)) return "#22c55e";
  if (["ppt","pptx"].includes(ext)) return "#f97316";
  if (["jpg","jpeg","png","gif","webp","heic","bmp","tiff","svg"].includes(ext)) return "#a855f7";
  if (["zip","rar","7z"].includes(ext)) return "#f59e0b";
  return "#64748b";
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function DocumentWalletPanel({ profile, isDark }) {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [formData, setFormData] = useState({
    file_url: "", file_name: "", file_size: 0,
    document_type: "id", notes: "", expiration_date: "",
  });

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

  const filteredDocs = (documents || []).filter(
    d => activeCategory === "all" || d.document_type === activeCategory
  );

  const categoryCounts = {};
  (documents || []).forEach(d => {
    categoryCounts[d.document_type] = (categoryCounts[d.document_type] || 0) + 1;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        file_url,
        file_name: file.name,
        file_size: file.size,
        document_type: prev.document_type || "other",
      }));
      toast.success("File uploaded — choose a category and save.");
    } catch (err) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.file_url || !formData.file_name) {
      toast.error("Please upload a file first.");
      return;
    }
    if (!user?.id) {
      toast.error("User not loaded yet — try again.");
      return;
    }
    try {
      await base44.entities.DocumentWalletItem.create({
        owner_user_id: user.id,
        profile_id: profile?.id,
        file_url: formData.file_url,
        file_name: formData.file_name,
        file_size: formData.file_size || undefined,
        document_type: formData.document_type,
        notes: formData.notes || undefined,
        expiration_date: formData.expiration_date || undefined,
        visibility: "private",
      });
      toast.success("Document saved to your wallet");
      setFormData({ file_url: "", file_name: "", file_size: 0, document_type: "id", notes: "", expiration_date: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["doc-wallet", user.id] });
    } catch (err) {
      toast.error("Error: " + (err.message || "Unknown error"));
    }
  };

  const handleDelete = async (docId) => {
    try {
      await base44.entities.DocumentWalletItem.delete(docId);
      toast.success("Document deleted");
      qc.invalidateQueries({ queryKey: ["doc-wallet", user?.id] });
    } catch (err) {
      toast.error("Error: " + (err.message || "Unknown error"));
    }
  };

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const resetForm = () => {
    setFormData({ file_url: "", file_name: "", file_size: 0, document_type: "id", notes: "", expiration_date: "" });
    setShowForm(false);
  };

  return (
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(249,115,22,0.1)" }}>
            <FileText className="w-5 h-5" style={{ color: "#f97316" }} />
          </div>
          <div>
            <p className={`font-bold text-sm ${headText}`}>Document Wallet</p>
            <p className={`text-xs ${mutedText}`}>Secure private document storage</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white min-h-[40px] flex-shrink-0"
          style={{ background: "#f97316" }}
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Privacy Notice */}
      <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
        <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
        <p className={`text-xs leading-relaxed ${isDark ? "text-blue-200" : "text-blue-700"}`}>
          Documents are <span className="font-bold">private by default</span>. Only you can view, download, or delete them. Supports PDF, Word, Excel, PowerPoint, images, and all file formats.
        </p>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className={`rounded-xl border ${panelBorder} p-4 space-y-3 ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
          {/* File Upload Zone */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Document File</label>
            {!formData.file_url ? (
              <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[120px] ${isDark ? "border-white/20 hover:border-white/40" : "border-slate-300 hover:border-slate-400"}`}>
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                ) : (
                  <Upload className={`w-6 h-6 ${mutedText}`} />
                )}
                <span className={`text-xs ${mutedText}`}>
                  {uploading ? "Uploading…" : "Click to upload any file"}
                </span>
                <span className={`text-[10px] ${mutedText}`}>
                  PDF, Word, Excel, PowerPoint, Images, SSN, ID, Work Auth — all formats supported
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-white"}`}>
                {(() => {
                  const Icon = getFileIcon(formData.file_name);
                  return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: getFileColor(formData.file_name) }} />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${headText} truncate`}>{formData.file_name}</p>
                  {formData.file_size > 0 && (
                    <p className={`text-xs ${mutedText}`}>{formatBytes(formData.file_size)}</p>
                  )}
                </div>
                <button
                  onClick={() => setFormData({ ...formData, file_url: "", file_name: "", file_size: 0 })}
                  className="text-xs text-red-500 font-bold flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Category + Expiration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Category</label>
              <select
                value={formData.document_type}
                onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`}
              >
                {DOC_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Expiration Date</label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} min-h-[40px]`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`text-xs font-bold ${headText} mb-1.5 block`}>Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this document…"
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${panelBorder} ${panelBg} text-sm ${headText} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={uploading || !formData.file_url}
              className="flex-1 px-4 py-2.5 rounded-lg text-white text-xs font-bold min-h-[40px] disabled:opacity-50"
              style={{ background: "#f97316" }}
            >
              Save Document
            </button>
            <button
              onClick={resetForm}
              className={`px-4 py-2.5 rounded-lg border ${panelBorder} text-xs font-bold ${headText} min-h-[40px]`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      {(documents || []).length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              activeCategory === "all"
                ? "text-white"
                : isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500"
            }`}
            style={activeCategory === "all" ? { background: "#0b2149" } : {}}
          >
            All ({(documents || []).length})
          </button>
          {DOC_CATEGORIES.filter(c => categoryCounts[c.value]).map(c => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeCategory === c.value ? "text-white" : isDark ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500"
              }`}
              style={activeCategory === c.value ? { background: c.color } : {}}
            >
              {c.label} ({categoryCounts[c.value]})
            </button>
          ))}
        </div>
      )}

      {/* Document List */}
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
        <div className="grid grid-cols-1 gap-2.5">
          {filteredDocs.map(doc => {
            const Icon = getFileIcon(doc.file_name);
            const fileColor = getFileColor(doc.file_name);
            const cat = DOC_CATEGORIES.find(c => c.value === doc.document_type);
            const isExpired = doc.expiration_date && new Date(doc.expiration_date) < new Date();
            const isExpiringSoon = doc.expiration_date && !isExpired &&
              new Date(doc.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return (
              <div key={doc.id} className={`rounded-xl border ${panelBorder} p-3 flex items-start gap-3`}>
                {/* File Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : `${fileColor}15` }}>
                  <Icon className="w-5 h-5" style={{ color: fileColor }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${headText} truncate`}>{doc.file_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {cat && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: cat.color }}>
                        {cat.label}
                      </span>
                    )}
                    {doc.file_size > 0 && (
                      <span className={`text-[10px] ${mutedText}`}>{formatBytes(doc.file_size)}</span>
                    )}
                    <Lock className={`w-3 h-3 ${mutedText}`} />
                  </div>
                  {doc.notes && (
                    <p className={`text-xs mt-1 ${mutedText} line-clamp-1`}>{doc.notes}</p>
                  )}
                  {doc.expiration_date && (
                    <div className={`flex items-center gap-1 text-xs mt-1 ${
                      isExpired ? "text-red-500 font-bold" : isExpiringSoon ? "text-orange-500 font-bold" : mutedText
                    }`}>
                      {isExpired || isExpiringSoon ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                      {isExpired && " (Expired)"}
                      {isExpiringSoon && " (Soon)"}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(doc.file_url)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                    style={{ background: "#0b2149" }}
                    title="View / Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 ${isDark ? "hover:bg-red-500/10" : ""}`}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}