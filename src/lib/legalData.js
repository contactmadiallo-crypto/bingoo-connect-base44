export const LEGAL_CATEGORIES = ["Immigration", "Civil", "Criminal"];

export const LEGAL_SERVICES = {
  Immigration: [
    "Asylum", "Withholding of Removal", "CAT Protection", "Family Petitions",
    "Adjustment of Status", "Green Card", "Work Permit / EAD", "Citizenship / Naturalization",
    "Removal Defense", "Bond Hearing", "Immigration Court Representation", "TPS",
    "VAWA", "U Visa", "T Visa", "SIJS", "Consular Processing", "Waivers",
    "FOIA Requests", "Motions to Reopen", "Appeals", "Change of Address",
    "USCIS Case Assistance", "Other Immigration Matter",
  ],
  Civil: [
    "Personal Injury", "Car Accidents", "Slip and Fall", "Landlord/Tenant",
    "Housing Court", "Employment Disputes", "Contract Disputes", "Family Law",
    "Divorce", "Child Custody", "Child Support", "Business Disputes",
    "Real Estate Matters", "Consumer Protection", "Small Claims", "Civil Litigation",
    "Other Civil Matter",
  ],
  Criminal: [
    "Criminal Defense", "DUI / DWI", "Assault", "Theft", "Domestic Violence",
    "Drug Charges", "Traffic Violations", "Desk Appearance Tickets", "Warrants",
    "Arraignments", "Probation Violations", "Expungement / Sealing",
    "Felony Defense", "Misdemeanor Defense", "Post-Conviction Relief",
    "Other Criminal Matter",
  ],
};

export const LEGAL_LEAD_STAGES = [
  { id: "new",                    label: "New",                    color: "#6366f1" },
  { id: "reviewed",               label: "Reviewed",               color: "#8b5cf6" },
  { id: "contacted",              label: "Contacted",              color: "#f59e0b" },
  { id: "consultation_scheduled", label: "Consult Scheduled",      color: "#3b82f6" },
  { id: "documents_requested",    label: "Docs Requested",         color: "#06b6d4" },
  { id: "retained",               label: "Retained",               color: "#10b981" },
  { id: "declined",               label: "Declined",               color: "#ef4444" },
  { id: "closed",                 label: "Closed",                 color: "#94a3b8" },
];

export const URGENCY_LABELS = {
  low:       { label: "Low",       color: "#94a3b8" },
  medium:    { label: "Medium",    color: "#f59e0b" },
  high:      { label: "High",      color: "#ef4444" },
  emergency: { label: "Emergency", color: "#dc2626" },
};

export const CATEGORY_COLORS = {
  Immigration: "#0B2E6B",
  Civil:       "#7c3aed",
  Criminal:    "#b91c1c",
};