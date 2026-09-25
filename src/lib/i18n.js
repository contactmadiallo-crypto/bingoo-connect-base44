/**
 * Bingoo Connect — Shared i18n helper
 * Single source of truth for all dashboard/workspace translations.
 *
 * Usage:
 *   import { t, getLang, setLang } from "@/lib/i18n";
 *   const label = t("save_info", lang);
 */

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
};

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

  // ── Core app shell / dashboard ──
  core_my_profile: { en: "My Profile", fr: "Mon profil" },
  core_active_profile: { en: "Active Profile", fr: "Profil actif" },
  core_current_plan: { en: "Current plan", fr: "Forfait actuel" },
  core_expand_sidebar: { en: "Expand sidebar", fr: "Développer la barre latérale" },
  core_collapse_sidebar: { en: "Collapse Sidebar", fr: "Réduire la barre latérale" },
  core_platform: { en: "Platform", fr: "Plateforme" },
  core_solutions: { en: "Solutions", fr: "Solutions" },
  core_pricing: { en: "Pricing", fr: "Tarifs" },
  core_shop: { en: "Shop", fr: "Boutique" },
  core_about: { en: "About", fr: "À propos" },
  core_upgrade_pro: { en: "Upgrade to Pro", fr: "Passer à Pro" },
  core_upgrade_pro_copy: { en: "Unlock My Assets, NFC Devices, Lost & Found, analytics and more.", fr: "Débloquez Mes actifs, les appareils NFC, Objets perdus, l'analytique et plus encore." },
  core_upgrade_business: { en: "Upgrade to Business", fr: "Passer à Business" },
  core_upgrade_business_copy: { en: "Unlock Engage, Design Studio, services, team tools and more.", fr: "Débloquez Engage, le Studio de design, les services, les outils d'équipe et plus encore." },
  core_good_morning: { en: "Good morning", fr: "Bonjour" },
  core_good_afternoon: { en: "Good afternoon", fr: "Bon après-midi" },
  core_good_evening: { en: "Good evening", fr: "Bonsoir" },
  core_recently: { en: "Recently", fr: "Récemment" },
  core_just_now: { en: "Just now", fr: "À l'instant" },
  core_bingoo_profile: { en: "Bingoo profile", fr: "Profil Bingoo" },
  core_new_contact: { en: "New contact", fr: "Nouveau contact" },
  core_new_lead_received: { en: "New lead received", fr: "Nouveau prospect reçu" },
  core_booking_received: { en: "Booking received", fr: "Réservation reçue" },
  core_new_appointment_booked: { en: "New appointment booked", fr: "Nouveau rendez-vous réservé" },
  core_nfc_tapped: { en: "NFC device tapped", fr: "Appareil NFC scanné" },
  core_profile_viewed: { en: "Profile viewed", fr: "Profil consulté" },
  core_device_opened: { en: "A Bingoo device opened", fr: "Un appareil Bingoo a été ouvert" },
  core_someone_visited: { en: "Someone visited", fr: "Quelqu'un a visité" },
  core_nfc_device_active: { en: "NFC device active", fr: "Appareil NFC actif" },
  core_bingoo_device: { en: "Bingoo device", fr: "Appareil Bingoo" },
  core_profile_views: { en: "Profile Views", fr: "Vues du profil" },
  core_nfc_taps: { en: "NFC Taps", fr: "Interactions NFC" },
  core_new_leads: { en: "New Leads", fr: "Nouveaux prospects" },
  core_share_profile: { en: "Share Profile", fr: "Partager le profil" },
  core_copy_active_link: { en: "Copy the active public profile link", fr: "Copier le lien public du profil actif" },
  core_open_wallet_tools: { en: "Open sharing and wallet tools", fr: "Ouvrir les outils de partage et de portefeuille" },
  core_activate_nfc: { en: "Activate NFC", fr: "Activer NFC" },
  core_assign_activate_device: { en: "Assign and activate a device", fr: "Attribuer et activer un appareil" },
  core_account_summary: { en: "Here's what's happening across your Bingoo Connect account.", fr: "Voici ce qui se passe sur votre compte Bingoo Connect." },
  core_default: { en: "Default", fr: "Par défaut" },
  core_digital_business_profile: { en: "Digital Business Profile", fr: "Profil professionnel numérique" },
  core_across_all_profiles: { en: "Across all profiles", fr: "Sur tous les profils" },
  core_quick_actions: { en: "Quick Actions", fr: "Actions rapides" },
  core_recent_activity: { en: "Recent Activity", fr: "Activité récente" },
  core_live_activity_all_profiles: { en: "Live activity across every profile in this account", fr: "Activité en direct sur tous les profils de ce compte" },
  core_activity_empty: { en: "Your latest profile views, NFC taps, leads, appointments and device activity will appear here.", fr: "Vos dernières vues de profil, interactions NFC, prospects, rendez-vous et activités d'appareils apparaîtront ici." },
  core_copied: { en: "Copied!", fr: "Copié !" },
  core_qr_wallet: { en: "QR Code & Wallet", fr: "Code QR et portefeuille" },
  core_profiles_action_copy: { en: "Create, switch or edit profiles", fr: "Créer, changer ou modifier des profils" },
  core_view_all_profiles: { en: "View all profiles", fr: "Voir tous les profils" },
  core_add_profile: { en: "Add Profile", fr: "Ajouter un profil" },
  core_view_analytics: { en: "View analytics", fr: "Voir l'analytique" },
  core_there: { en: "there", fr: "" },

  // ── Profiles hub ──
  profiles_primary: { en: "Primary", fr: "Principal" },
  profiles_personal: { en: "Personal", fr: "Personnel" },
  profiles_classic: { en: "Classic", fr: "Classique" },
  profiles_layout: { en: "Layout", fr: "Mise en page" },
  profiles_live: { en: "Live", fr: "En ligne" },
  profiles_hidden: { en: "Hidden", fr: "Masqué" },
  profiles_completion: { en: "Profile completion", fr: "Progression du profil" },
  profiles_views: { en: "Views", fr: "Vues" },
  profiles_taps: { en: "Taps", fr: "Interactions" },
  profiles_status: { en: "Status", fr: "Statut" },
  profiles_edit: { en: "Edit", fr: "Modifier" },
  profiles_scan_open: { en: "Scan to open profile", fr: "Scannez pour ouvrir le profil" },
  profiles_create_new: { en: "Create New Profile", fr: "Créer un nouveau profil" },
  profiles_upgrade_trial: { en: "Upgrade to Professional · 14-day free trial", fr: "Passez à Professional · essai gratuit de 14 jours" },
  profiles_save_unlock: { en: "Save card to unlock", fr: "Enregistrez la carte pour débloquer" },
  profiles_cancel_anytime: { en: "Cancel anytime", fr: "Annulez à tout moment" },
  profiles_add_another: { en: "Add another digital card", fr: "Ajouter une autre carte numérique" },
  profiles_my_profiles: { en: "My Profiles", fr: "Mes profils" },
  profiles_loading: { en: "Loading your profiles…", fr: "Chargement de vos profils…" },
  profiles_order_error: { en: "Couldn't save order — reverted. Try again.", fr: "Impossible d'enregistrer l'ordre — modification annulée. Réessayez." },
  profiles_create_first: { en: "Create your first profile", fr: "Créez votre premier profil" },
  profiles_first_copy: { en: "Your digital business card, shareable via NFC, QR, or link.", fr: "Votre carte professionnelle numérique, partageable par NFC, QR ou lien." },

  // ── Profile Studio ──
  studio_profile: { en: "Profile", fr: "Profil" },
  studio_save_profile: { en: "Save Profile", fr: "Enregistrer le profil" },
  studio_profile_photo: { en: "Profile photo", fr: "Photo de profil" },
  studio_business_identity: { en: "Business Identity", fr: "Identité de l’entreprise" },
  studio_brand_logo: { en: "Brand / Company Logo", fr: "Logo de marque / entreprise" },
  studio_change_logo: { en: "Change Logo", fr: "Changer le logo" },
  studio_upload_logo: { en: "Upload Logo", fr: "Importer un logo" },
  studio_basic_info: { en: "Basic Information", fr: "Informations de base" },
  studio_name_placeholder: { en: "Your Name", fr: "Votre nom" },
  studio_job_placeholder: { en: "CEO / Consultant", fr: "PDG / Consultant" },
  studio_company_placeholder: { en: "Company Name", fr: "Nom de l’entreprise" },
  studio_bio_placeholder: { en: "Short bio or description...", fr: "Courte biographie ou description..." },
  studio_links_copy: { en: "Manage what appears on your public profile.", fr: "Gérez ce qui apparaît sur votre profil public." },
  studio_add_link: { en: "Add Link", fr: "Ajouter un lien" },
  studio_no_links: { en: "No links yet", fr: "Aucun lien pour le moment" },
  studio_no_links_copy: { en: "Add social media, contact info, payments, and more.", fr: "Ajoutez vos réseaux sociaux, coordonnées, paiements et plus encore." },
  studio_lead_capture: { en: "Lead Capture", fr: "Capture de prospects" },
  studio_lead_capture_copy: { en: "Show the contact form on this public profile.", fr: "Afficher le formulaire de contact sur ce profil public." },
  studio_generating_preview: { en: "Generating preview…", fr: "Génération de l’aperçu…" },
  studio_preview_matches: { en: "Preview matches the downloaded QR exactly.", fr: "L’aperçu correspond exactement au QR téléchargé." },
  studio_qr_color: { en: "QR Color", fr: "Couleur du QR" },
  studio_label: { en: "Label", fr: "Libellé" },
  studio_custom_label: { en: "Custom label…", fr: "Libellé personnalisé…" },
  studio_powered_note: { en: "\"Powered by Bingoo Connect\" always appears on downloaded QR code.", fr: "\"Powered by Bingoo Connect\" apparaît toujours sur le QR téléchargé." },
  studio_logo_watermark: { en: "Logo Watermark", fr: "Logo en filigrane" },
  studio_upgrade_logo_qr: { en: "Upgrade to Professional to embed your logo in the center of the QR code.", fr: "Passez à Professional pour intégrer votre logo au centre du code QR." },
  studio_upload_logo_first: { en: "Upload a company logo in the Info tab first.", fr: "Importez d’abord un logo d’entreprise dans l’onglet Info." },
  studio_logo_centered: { en: "Your business logo will appear centered on the QR code.", fr: "Le logo de votre entreprise apparaîtra au centre du code QR." },
  studio_logo_embedded: { en: "This logo will be embedded in the downloaded QR code.", fr: "Ce logo sera intégré au code QR téléchargé." },
  studio_generating: { en: "Generating…", fr: "Génération…" },
  studio_save_qr: { en: "Save QR Settings", fr: "Enregistrer les réglages QR" },
  studio_set_username_qr: { en: "Set a username to generate a QR code.", fr: "Définissez un nom d’utilisateur pour générer un code QR." },
  studio_lost_pro: { en: "Lost Mode — Professional Feature", fr: "Mode Perdu — Fonction Professional" },
  studio_lost_pro_copy: { en: "Enable Lost Mode on your NFC devices so finders can contact you and help recover your items.", fr: "Activez le Mode Perdu sur vos appareils NFC afin que les personnes qui les trouvent puissent vous contacter et vous aider à récupérer vos objets." },
  studio_try_pro: { en: "Try Professional free for 14 days", fr: "Essayer Professional gratuitement pendant 14 jours" },
  studio_trial_terms: { en: "$4.99/mo after 14 days · cancel anytime before trial ends", fr: "4,99 $/mois après 14 jours · annulez à tout moment avant la fin de l’essai" },
  studio_lost_mode_copy: { en: "Enable Lost Mode on your NFC device so finders can contact you.", fr: "Activez le Mode Perdu sur votre appareil NFC afin que la personne qui le trouve puisse vous contacter." },
  studio_public_profile_desc: { en: "Publicly accessible at your profile URL", fr: "Accessible publiquement via l’URL de votre profil" },
  studio_show_location_desc: { en: "Display your city/address on the profile", fr: "Afficher votre ville/adresse sur le profil" },
  studio_account_level: { en: "Account-level · applies to your device, not this profile specifically.", fr: "Niveau compte · s’applique à votre appareil, pas uniquement à ce profil." },
  studio_danger_zone: { en: "Danger Zone", fr: "Zone dangereuse" },
  studio_danger_copy: { en: "Disabling your profile hides it from public access instantly.", fr: "Désactiver votre profil le masque immédiatement au public." },
  studio_deactivate_profile: { en: "Deactivate Profile", fr: "Désactiver le profil" },
  studio_delete_profile: { en: "Delete Profile Permanently", fr: "Supprimer définitivement le profil" },
  studio_public_profile: { en: "Public Profile", fr: "Profil public" },
  studio_live_preview: { en: "Live Preview", fr: "Aperçu en direct" },
  studio_updates_typing: { en: "Updates as you type", fr: "Mise à jour pendant la saisie" },
  studio_scan_me: { en: "Scan Me", fr: "Scannez-moi" },
  studio_find_owner: { en: "Find Owner", fr: "Trouver le propriétaire" },
  studio_return_me: { en: "Return Me", fr: "Rapportez-moi" },
  studio_contact_owner: { en: "Contact Owner", fr: "Contacter le propriétaire" },
  studio_help_home: { en: "Help Me Get Home", fr: "Aidez-moi à rentrer" },
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
  const normalized = SUPPORTED_LANGUAGES[lang] ? lang : "en";
  localStorage.setItem("bingoo_lang", normalized);
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