import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Download, Trash2, Pencil, Save, Upload, Calendar, AlertCircle, Lock, X, Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  DOC_CATEGORIES, getFileIcon, getFileColor, isImageFile, getCatInfo, formatBytes, ID_TYPES,
} from "@/lib/docWalletUtils";

/**
 * DocumentDetailModal — click-to-open detail view with large preview,
 * inline edit mode (category, notes, expiration, back side), download, and delete.
 */
export default function DocumentDetailModal({ doc, isDark, onClose, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const backInputRef = useRef(null);
  const [editData, setEditData] = useState({
    document_type: doc.document_type,
    notes: doc.notes || "",
    expiration_date: doc.expiration_date || "",
    file_url_back: doc.file_url_back || "",
    file_name_back: doc.file_name_back || "",
    file_size_back: doc.file_size_back || 0,
  });

  const Icon = getFileIcon(doc.file_name);
  const fileColor = getFileColor(doc.file_name);
  const cat = getCatInfo(doc.document_type);
  const isImg = isImageFile(doc.file_name);
  const isBackImg = isImageFile(doc.file_name_back);
  const hasBack = !!doc.file_url_back;
  const isExpired = doc.expiration_date && new Date(doc.expiration_date) < new Date();
  const isExpiringSoon = doc.expiration_date && !isExpired &&
    new Date(doc.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isIdType = ID_TYPES.includes(doc.document_type);

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const panelBg = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";
  const inputBg = isDark ? "bg-white/5" : "bg-slate-50";

  const handleDownload = (url, name) => {
    const a = document.createElement("a");
    a.href = url; a.download = name || "document"; a.target = "_blank"; a.click();
  };

  const handleDelete = async () => {
    try {
      await base44.entities.DocumentWalletItem.delete(doc.id);
      toast.success("Document deleted");
      onDeleted(); onClose();
    } catch (err) {
      toast.error("Delete failed: " + (err.message || "Unknown error"));
    }
  };

  const handleBackUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditData(prev => ({ ...prev, file_url_back: file_url, file_name_back: file.name, file_size_back: file.size }));
      toast.success("Back side uploaded");
    } catch (err) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploadingBack(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await base44.entities.DocumentWalletItem.update(doc.id, {
        document_type: editData.document_type,
        notes: editData.notes || undefined,
        expiration_date: editData.expiration_date || undefined,
        file_url_back: editData.file_url_back || undefined,
        file_name_back: editData.file_name_back || undefined,
        file_size_back: editData.file_size_back || undefined,
      });
      toast.success("Document updated");
      onUpdated(); setIsEditing(false);
    } catch (err) {
      toast.error("Update failed: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const previewBox = (url, name, label) => {
    const img = isImageFile(name);
    const ic = getFileIcon(name);
    const fc = getFileColor(name);
    return (
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${mutedText}`}>{label}</p>
        <div className="rounded-xl border overflow-hidden flex items-center justify-center"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", minHeight: 140 }}>
          {img ? (
            <img src={url} alt={name} className="w-full max-h-[200px] object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-1 py-6">
              {React.createElement(ic, { className: "w-8 h-8", style: { color: fc } })}
              <span className={`text-[10px] font-bold uppercase ${mutedText}`}>{name?.split(".").pop()}</span>
            </div>
          )}
        </div>
        <p className={`text-xs font-bold mt-1.5 truncate ${headText}`}>{name}</p>
      </div>
    );
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className={`${panelBg} ${isDark ? "border-white/10" : ""} max-w-md max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${headText}`}>
              {React.createElement(Icon, { className: "w-4 h-4 flex-shrink-0", style: { color: fileColor } })}
              <span className="truncate">{doc.file_name}</span>
              {hasBack && <Layers className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Preview(s) */}
            <div className={`flex gap-2 ${hasBack ? "flex-row" : "flex-col"}`}>
              {previewBox(doc.file_url, doc.file_name, "Front")}
              {hasBack && previewBox(doc.file_url_back, doc.file_name_back, "Back")}
            </div>

            {/* Info badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {cat && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: cat.color }}>
                  {cat.label}
                </span>
              )}
              {doc.file_size > 0 && <span className={`text-[10px] ${mutedText}`}>{formatBytes(doc.file_size)}</span>}
              <Lock className={`w-3 h-3 ${mutedText}`} />
              {doc.expiration_date && (
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${
                  isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : mutedText
                }`}>
                  {isExpired || isExpiringSoon ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {isExpired ? "Expired: " : "Expires: "}{new Date(doc.expiration_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Notes */}
            {doc.notes && !isEditing && (
              <div className={`rounded-lg p-2.5 text-xs ${isDark ? "bg-white/5" : "bg-slate-50"} ${headText}`}>
                {doc.notes}
              </div>
            )}

            {/* Edit mode */}
            {isEditing && (
              <div className={`rounded-xl border ${panelBorder} p-3 space-y-2.5 ${isDark ? "bg-white/3" : "bg-slate-50"}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] font-bold ${headText} mb-1 block`}>Category</label>
                    <select value={editData.document_type}
                      onChange={e => setEditData({ ...editData, document_type: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-lg border ${panelBorder} ${panelBg} text-xs ${headText} min-h-[36px]`}>
                      {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold ${headText} mb-1 block`}>Expiration</label>
                    <input type="date" value={editData.expiration_date}
                      onChange={e => setEditData({ ...editData, expiration_date: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-lg border ${panelBorder} ${panelBg} text-xs ${headText} min-h-[36px]`} />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-bold ${headText} mb-1 block`}>Notes</label>
                  <textarea value={editData.notes}
                    onChange={e => setEditData({ ...editData, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-2 py-1.5 rounded-lg border ${panelBorder} ${panelBg} text-xs ${headText} resize-none`} />
                </div>
                {isIdType && (
                  <div>
                    <label className={`text-[10px] font-bold ${headText} mb-1 block`}>Back Side</label>
                    {editData.file_url_back ? (
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${inputBg}`}>
                        <span className={`text-xs font-bold truncate flex-1 ${headText}`}>{editData.file_name_back}</span>
                        <button onClick={() => backInputRef.current?.click()} className="text-[10px] text-blue-500 font-bold">Replace</button>
                        <button onClick={() => setEditData({ ...editData, file_url_back: "", file_name_back: "", file_size_back: 0 })}
                          className="text-[10px] text-red-500 font-bold">Remove</button>
                      </div>
                    ) : (
                      <button onClick={() => backInputRef.current?.click()}
                        className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed text-xs ${mutedText} ${isDark ? "border-white/20" : "border-slate-300"}`}>
                        {uploadingBack ? <span className="w-3 h-3 border border-slate-400 border-t-slate-600 rounded-full animate-spin" /> : <><Upload className="w-3 h-3" /> Add Back Side</>}
                      </button>
                    )}
                    <input type="file" ref={backInputRef} onChange={handleBackUpload} className="hidden" />
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {isEditing ? (
                <>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-bold min-h-[40px] disabled:opacity-50"
                    style={{ background: "#f97316" }}>
                    {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)}
                    className={`px-3 py-2 rounded-lg border ${panelBorder} text-xs font-bold ${headText} min-h-[40px]`}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleDownload(doc.file_url, doc.file_name)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-bold min-h-[40px]"
                    style={{ background: "#0b2149" }}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={() => setIsEditing(true)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border ${panelBorder} ${headText} flex-shrink-0`}
                    title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex-shrink-0"
                    title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${doc.file_name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}