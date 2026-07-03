/**
 * Bingoo Connect — Shared i18n helper
 * Single source of truth for all dashboard/workspace translations.
 *
 * Usage:
 *   import { t, getLang, setLang } from "@/lib/i18n";
 *   const label = t("save_info", lang);
 */

export const TRANSLATIONS = {
  // ── Sidebar / nav ──
  landing_page:     { en: "Landing Page",     fr: "Page d'accueil" },
  profiles:         { en: "Profiles",          fr: "Profils" },
  appointments:     { en: "Appointments",      fr: "Rendez-vous" },
  leads:            { en: "Leads",             fr: "Prospects" },
  services:         { en: "Services",          fr: "Services" },
  hours:            { en: "Hours",             fr: "Horaires" },
  practice_areas:   { en: "Practice Areas",    fr: "Domaines" },
  legal_services:   { en: "Legal Services",    fr: "Services Juridiques" },
  offices:          { en: "Offices",           fr: "Bureaux" },
  analytics:        { en: "Analytics",         fr: "Analytique" },
  nfc_devices:      { en: "NFC Devices",       fr: "Appareils NFC" },
  lost_mode:        { en: "Lost Mode",         fr: "Mode Perdu" },
  team:             { en: "Team",              fr: "Équipe" },
  crm:              { en: "CRM",               fr: "CRM" },
  attendance:       { en: "Attendance",        fr: "Présence" },
  resume:           { en: "Resume",            fr: "CV" },
  portfolio:        { en: "Portfolio",         fr: "Portfolio" },
  connections:      { en: "Connections",       fr: "Connexions" },
  billing:          { en: "Billing",           fr: "Facturation" },
  support:          { en: "Support",           fr: "Support" },
  admin_panel:      { en: "Admin Panel",       fr: "Panneau Admin" },

  // ── Dashboard top bar ──
  dashboard:        { en: "Dashboard",         fr: "Tableau de bord" },
  my_profiles:      { en: "My Profiles",       fr: "Mes Profils" },

  // ── ProfileWorkspace inner tabs ──
  info:             { en: "Info",              fr: "Info" },
  links:            { en: "Links",             fr: "Liens" },
  design:           { en: "Design",            fr: "Design" },
  share:            { en: "Share",             fr: "Partager" },
  settings:         { en: "Settings",          fr: "Paramètres" },

  // ── Buttons ──
  save_info:        { en: "Save Info",         fr: "Enregistrer" },
  save_links:       { en: "Save Links",        fr: "Enregistrer Liens" },
  save_design:      { en: "Save Design",       fr: "Enregistrer Design" },
  save_settings:    { en: "Save Settings",     fr: "Enregistrer Paramètres" },
  saving:           { en: "Saving…",           fr: "Enregistrement…" },
  saved_at:         { en: "Saved at",          fr: "Enregistré à" },
  save_failed:      { en: "Save failed",       fr: "Échec" },
  preview:          { en: "Preview",           fr: "Aperçu" },
  copy_link:        { en: "Copy Link",         fr: "Copier le lien" },
  copied:           { en: "Copied",            fr: "Copié" },
  new_profile:      { en: "New Profile",       fr: "Nouveau Profil" },
  back_profiles:    { en: "Profiles",          fr: "Profils" },
  go_to_profiles:   { en: "Go to My Profiles", fr: "Mes Profils" },

  // ── Form field labels ──
  display_name:     { en: "Display Name",      fr: "Nom affiché" },
  job_title:        { en: "Job Title",         fr: "Titre" },
  company:          { en: "Company",           fr: "Entreprise" },
  location:         { en: "Location",          fr: "Lieu" },
  phone:            { en: "Phone",             fr: "Téléphone" },
  whatsapp:         { en: "WhatsApp",          fr: "WhatsApp" },
  email:            { en: "Email",             fr: "Email" },
  website:          { en: "Website",           fr: "Site web" },
  bio:              { en: "Bio",               fr: "Biographie" },
  profile_url:      { en: "Profile URL",       fr: "URL du profil" },
  visibility:       { en: "Visibility",        fr: "Visibilité" },
  language_region:  { en: "Language & Region", fr: "Langue et Région" },
  change_cover:     { en: "Change Cover",      fr: "Changer la couverture" },
  accent_color:     { en: "Accent Color",      fr: "Couleur d'accent" },
  bg_style:         { en: "Background Style",  fr: "Style de fond" },
  button_style:     { en: "Button Style",      fr: "Style de bouton" },
  profile_layout:   { en: "Profile Layout",    fr: "Mise en page" },
  profile_link:     { en: "Profile Link",      fr: "Lien du profil" },
  qr_code:          { en: "QR Code",           fr: "Code QR" },
  download_qr:      { en: "Download QR",       fr: "Télécharger QR" },
  profile_is_live:  { en: "Profile is Live",   fr: "Profil en ligne" },
  show_location:    { en: "Show Location",     fr: "Afficher le lieu" },

  // ── Dark/Light mode ──
  dark_mode:        { en: "Dark Mode",          fr: "Mode sombre" },
  light_mode:       { en: "Light Mode",         fr: "Mode clair" },

  // ── Empty states ──
  no_profiles_yet:  { en: "No profiles yet",    fr: "Aucun profil" },
  create_first:     { en: "Create your first profile to get started", fr: "Créez votre premier profil pour commencer" },
  no_leads_yet:     { en: "No leads yet",       fr: "Aucun prospect" },
  no_appointments:  { en: "No appointments yet", fr: "Aucun rendez-vous" },

  // ── Action buttons ──
  save:             { en: "Save",               fr: "Enregistrer" },
  cancel:           { en: "Cancel",             fr: "Annuler" },
  delete:           { en: "Delete",             fr: "Supprimer" },
  edit:             { en: "Edit",               fr: "Modifier" },
  add:              { en: "Add",                fr: "Ajouter" },
  share:            { en: "Share",              fr: "Partager" },
  download:         { en: "Download",           fr: "Télécharger" },
  logout:           { en: "Logout",             fr: "Déconnexion" },
  more:             { en: "More",               fr: "Plus" },

  // ── Landing page ──
  lp_features:      { en: "Features",          fr: "Fonctionnalités" },
  lp_industries:    { en: "Industries",        fr: "Secteurs" },
  lp_pricing:       { en: "Pricing",           fr: "Tarifs" },
  lp_shop:          { en: "Shop",              fr: "Boutique" },
  lp_sign_in:       { en: "Sign In",           fr: "Se connecter" },
  lp_get_started:   { en: "Get Started Free",  fr: "Commencer gratuitement" },
  lp_dashboard:     { en: "My Dashboard",      fr: "Mon tableau de bord" },
  lp_language:      { en: "Language",          fr: "Langue" },
};

/**
 * Get current language from localStorage.
 * Defaults to English on first visit — language only changes when the user
 * explicitly clicks the EN/FR toggle. No silent browser-locale auto-detection.
 *
 * Migration: if a previous version auto-detected French without explicit user
 * consent, reset to English so the user isn't stuck seeing French.
 */
export function getLang() {
  const saved = localStorage.getItem("bingoo_lang");
  const userSet = localStorage.getItem("bingoo_lang_user_set");
  // Honour explicitly user-set preference
  if (saved && userSet === "true") return saved;
  // Previously auto-detected (no explicit user consent) — reset to English
  if (saved && userSet !== "true") {
    localStorage.setItem("bingoo_lang", "en");
    localStorage.removeItem("bingoo_lang_user_set");
    return "en";
  }
  // First visit — default to English
  localStorage.setItem("bingoo_lang", "en");
  return "en";
}

/** Persist language to localStorage and mark as user-set (prevents auto-override) */
export function setLang(lang) {
  localStorage.setItem("bingoo_lang", lang);
  localStorage.setItem("bingoo_lang_user_set", "true");
}

/**
 * Translate a key to the given language.
 * Falls back to English if key or language is missing.
 */
export function t(key, lang = "en") {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}