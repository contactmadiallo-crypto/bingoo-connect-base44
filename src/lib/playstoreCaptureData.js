// Fictional demo data for the Play Store capture workspace ONLY.
// No real users, emails, phone numbers, payments, secrets, or records.
// Static and read-only — never written to the database.

const now = new Date();
function iso(daysAgo, h = 10, m = 0) {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function dateStr(daysAgo) {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const demoUser = { id: "demo-user", full_name: "Amina Diallo", email: "" };

export const demoProfile = {
  id: "demo-profile",
  username: "amina-diallo",
  display_name: "Amina Diallo",
  job_title: "Brand Strategist",
  company_name: "Studio Baobab",
  bio: "Helping founders show up with clarity and confidence.",
  profile_photo: null,
  cover_color: "#0b2149",
  is_active: true,
  is_verified: true,
  profile_type: "professional",
  layout: "executive",
  avatar_shape: "rounded",
  phone: "",
  whatsapp_number: "",
  email: "",
  website: "studio-baobab.example",
  location: "Dakar, Senegal",
};

export const demoLeads = [
  { id: "l1", name: "Mariama Sow", email: "mariama@example.org", phone: "", status: "new", created_date: iso(0, 9, 12), source: "qr" },
  { id: "l2", name: "Cheikh Ndiaye", email: "", phone: "", status: "contacted", created_date: iso(1, 14, 30), source: "nfc" },
  { id: "l3", name: "Fatou Bensouda", email: "fatou.b@example.com", phone: "", status: "won", created_date: iso(2, 11, 0), source: "profile" },
  { id: "l4", name: "Ousmane Fall", email: "", phone: "", status: "new", created_date: iso(3, 16, 45), source: "referral" },
];

export const demoAppointments = [
  { id: "a1", visitor_name: "Mariama Sow", service_name: "Brand Strategy Call", date: dateStr(0), time_slot: "10:00", status: "confirmed", created_date: iso(0, 8, 0) },
  { id: "a2", visitor_name: "Cheikh Ndiaye", service_name: "Profile Review", date: dateStr(0), time_slot: "14:30", status: "pending", created_date: iso(0, 8, 30) },
  { id: "a3", visitor_name: "Aïssatou Ba", service_name: "Discovery Session", date: dateStr(0), time_slot: "16:00", status: "accepted", created_date: iso(0, 9, 0) },
];

const eventTypes = [
  "profile_view", "profile_view", "profile_view", "nfc_tap", "qr_scan",
  "whatsapp_click", "phone_click", "email_click", "save_contact_click",
  "website_click", "lead_submitted", "appointment_booked",
  "instagram_click", "linkedin_click",
];
export const demoAnalytics = Array.from({ length: 64 }, (_, i) => ({
  id: `an-${i}`,
  event_type: eventTypes[i % eventTypes.length],
  created_at: iso(i % 7, 8 + (i % 10), (i * 7) % 60),
  visitor_device: i % 3 === 0 ? "iPhone" : i % 3 === 1 ? "Android" : "Chrome",
}));

export const demoNfcDevices = [
  { id: "d1", device_code: "BG-100231", device_type: "card", product_name: "NFC Premium Card", product_image: null, status: "active", profile_id: "demo-profile", assigned_at: iso(20, 10, 0) },
  { id: "d2", device_code: "BG-100455", device_type: "keychain", product_name: "NFC Key Fob", product_image: null, status: "active", profile_id: "demo-profile", assigned_at: iso(12, 10, 0) },
  { id: "d3", device_code: "BG-100677", device_type: "metal_card", product_name: "NFC Metal Card", product_image: null, status: "lost", profile_id: "demo-profile", assigned_at: iso(40, 10, 0) },
];

export const demoConnections = [
  { id: "c1", profile_display_name: "Mariama Sow", profile_job_title: "Product Designer", profile_company: "Pixel Studio", profile_username: "mariama-sow", profile_photo: null, profile_cover_color: "#2563eb", source: "qr_scan" },
  { id: "c2", profile_display_name: "Cheikh Ndiaye", profile_job_title: "Photographer", profile_company: "Ndakaru Visuals", profile_username: "cheikh", profile_photo: null, profile_cover_color: "#7c3aed", source: "nfc_scan" },
  { id: "c3", profile_display_name: "Fatou Bensouda", profile_job_title: "Attorney", profile_company: "Bensouda Legal", profile_username: "fatou-b", profile_photo: null, profile_cover_color: "#0b2149", source: "manual" },
  { id: "c4", profile_display_name: "Ousmane Fall", profile_job_title: "Founder", profile_company: "Teranga Tech", profile_username: "ousmane", profile_photo: null, profile_cover_color: "#059669", source: "qr_scan" },
  { id: "c5", profile_display_name: "Aïssatou Ba", profile_job_title: "Marketing Lead", profile_company: "Sahel Brands", profile_username: "aissatou", profile_photo: null, profile_cover_color: "#dc2626", source: "nfc_scan" },
];

export const CAPTURE_STATES = [
  { id: "01", file: "01-profile-dashboard.png", caption: "Your digital identity, all in one place" },
  { id: "02", file: "02-create-profile.png", caption: "Create a profile that represents you" },
  { id: "03", file: "03-share-profile.png", caption: "Share instantly with QR or link" },
  { id: "04", file: "04-nfc-products.png", caption: "Connect compatible NFC products" },
  { id: "05", file: "05-connections.png", caption: "Keep your connections organized" },
  { id: "06", file: "06-insights.png", caption: "Understand how people engage" },
];