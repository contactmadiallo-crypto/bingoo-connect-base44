import { FileText, FileImage, FileSpreadsheet, FileArchive } from "lucide-react";

// Government-issued identity documents (ID, Passport, SSN, Work Authorization,
// Visa, License) have been removed from production pending compliance review.
// The entity schema still accepts these values for backward compatibility, but
// they are no longer selectable in the UI.
export const DOC_CATEGORIES = [
  { value: "certification", label: "Certification", color: "#10b981" },
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

export const ID_TYPES = [];

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "bmp", "tiff", "svg"];

export function isImageFile(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  return IMAGE_EXTS.includes(ext);
}

export function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return FileImage;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["zip", "rar", "7z"].includes(ext)) return FileArchive;
  return FileText;
}

export function getFileColor(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "#ef4444";
  if (["doc", "docx"].includes(ext)) return "#3b82f6";
  if (["xls", "xlsx", "csv"].includes(ext)) return "#22c55e";
  if (["ppt", "pptx"].includes(ext)) return "#f97316";
  if (IMAGE_EXTS.includes(ext)) return "#a855f7";
  if (["zip", "rar", "7z"].includes(ext)) return "#f59e0b";
  return "#64748b";
}

export function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export function getCatInfo(value) {
  return DOC_CATEGORIES.find(c => c.value === value);
}