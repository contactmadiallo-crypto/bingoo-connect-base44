// base44/shared/profileSanitizer.ts
// Entitlement-driven sanitizer for Profile create/update.
// Single source of truth for field gating, URL/color validation, link limits,
// and public/owner response shaping. Imported by createProfileGated and
// updateProfileGated.

import { LAYOUT_IDS } from './layoutRegistry.ts';

export const MAX_LINKS_UNLIMITED = -1;

export const RESERVED_USERNAMES = new Set([
  'admin','api','bingoo','app','login','register','reset-password','forgot-password',
  'settings','support','n','p','firm','r','resume','lost','asset','a','shop','cart',
  'checkout','billing','plans','pricing','activate','my-nfc-devices','bingoo-home',
  'about','contact','privacy','terms','data-deletion','auth','signup','monitor',
  'me','profile','home','dashboard','account','notifications',
]);

// ── Enum vocabularies (mirror Profile schema) ─────────────────────────────────
const VALID_PROFILE_TYPES = new Set(['personal','professional','business','salon','lawfirm','corporate','creative']);
const VALID_PROFILE_CATEGORIES = new Set(['personal','content_creator','photographer','model','business']);
const VALID_AVATAR_SHAPES = new Set(['circle','rounded','squircle','card']);
const VALID_AVATAR_PLACEMENTS = new Set(['center_overlap','lower_center','right_overlap','left_overlap','floating_card','inside_card']);
const VALID_AVATAR_POSITIONS = new Set(['center top','center','center bottom','left center','right center']);
const VALID_COVER_POSITIONS = new Set(['center','top','bottom','left center','right center']);
const VALID_BG_STYLES = new Set(['clean','gradient','mesh','night','blur','animated']);
const VALID_BUTTON_STYLES = new Set(['pill','rounded','sharp','outlined','flat']);
const VALID_FONT_STYLES = new Set(['modern','clean','classic']);
const VALID_PROFILE_THEMES = new Set(['modern','classic','glassmorphic']);
const VALID_PROFILE_LAYOUTS = new Set(['default','ny_championship','lions_teranga']);
const VALID_LANGUAGES = new Set(['en','fr']);
const VALID_PRIVACY_KEYS = new Set(['hide_email','show_phone_verified_only','block_search_engines','require_nfc_tap']);
const DAY_KEYS = new Set(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);

// ── Never client-writable (admin/backend only) ─────────────────────────────────
export const NEVER_WRITABLE = new Set([
  'id','created_date','updated_date','created_by_id','created_by',
  'plan','is_active','is_verified','verification_type','verification_status',
  'admin_notes','owned_profile_ids','subscription','trial',
]);

// ── Plan field sets as real unions (inheritance) ───────────────────────────────
export const FREE_FIELDS = new Set([
  'display_name','username','job_title','company_name','bio','phone','email',
  'website','location','show_location','language','privacy_settings','custom_links','hidden_links',
  'cover_color','qr_color','qr_label','profile_type','profile_category','lead_capture_enabled',
  'whatsapp_number','facebook_url','instagram_url','tiktok_url','linkedin_url','youtube_url',
]);

export const PROFESSIONAL_ADDITIONAL = new Set([
  'profile_photo','cover_photo','company_logo','theme_background_color',
  'bg_watermark_image','bg_watermark_opacity','avatar_shape','avatar_placement',
  'avatar_position','cover_position','qr_watermark','layout','profile_layout',
  'profile_theme','bg_style','button_style','button_color','font_style','payment_link','custom_payments',
  'google_review_url','whatsapp_booking_message',
]);

export const BUSINESS_ADDITIONAL = new Set([
  'booking_enabled','booking_slot_duration','booking_restricted_emails','business_hours',
]);

export const PROFESSIONAL_FIELDS = new Set([...FREE_FIELDS, ...PROFESSIONAL_ADDITIONAL]);
export const BUSINESS_FIELDS = new Set([...PROFESSIONAL_FIELDS, ...BUSINESS_ADDITIONAL]);

const FIELD_REQUIRES_FEATURE = {
  profile_photo: 'custom_branding',
  cover_photo: 'custom_branding',
  company_logo: 'custom_branding',
  theme_background_color: 'custom_branding',
  bg_watermark_image: 'custom_branding',
  bg_watermark_opacity: 'custom_branding',
  avatar_shape: 'custom_branding',
  avatar_placement: 'custom_branding',
  avatar_position: 'custom_branding',
  cover_position: 'custom_branding',
  qr_watermark: 'custom_branding',
  layout: 'custom_branding',
  profile_layout: 'custom_branding',
  profile_theme: 'custom_branding',
  bg_style: 'custom_branding',
  button_style: 'custom_branding',
  button_color: 'custom_branding',
  font_style: 'custom_branding',
  payment_link: 'product_showcase',
  custom_payments: 'product_showcase',
  google_review_url: 'google_reviews',
  whatsapp_booking_message: 'whatsapp_booking',
  booking_enabled: 'business_hours',
  booking_slot_duration: 'business_hours',
  booking_restricted_emails: 'business_hours',
  business_hours: 'business_hours',
};

// ── Validators ────────────────────────────────────────────────────────────────
const WEB_PROTOCOLS = ['http:', 'https:'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[0-9\s\-().]{4,30}$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{6})$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isUrl(value, protocols) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return false;
  try { const u = new URL(value); return protocols.includes(u.protocol); } catch { return false; }
}

function isHexColor(value) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

function validateOptionalUrl(value, field, protocols, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!isUrl(value, protocols)) errors.push({ field, error: 'invalid_url' });
  return value;
}

function validateColor(value, field, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!isHexColor(value)) { errors.push({ field, error: 'invalid_color' }); return undefined; }
  return value;
}

function clampString(value, field, max, errors) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') { errors.push({ field, error: 'must_be_string' }); return undefined; }
  if (value.length > max) { errors.push({ field, error: 'too_long', max }); return value.slice(0, max); }
  return value;
}

function validateEmail(value, field, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > 254 || !EMAIL_RE.test(value)) {
    errors.push({ field, error: 'invalid_email' }); return undefined;
  }
  return value;
}

function validatePhone(value, field, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !PHONE_RE.test(value)) { errors.push({ field, error: 'invalid_phone' }); return undefined; }
  return value;
}

// ── Username ──────────────────────────────────────────────────────────────────
export function normalizeUsername(raw) {
  if (typeof raw !== 'string') return '';
  return raw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
}

export function validateUsername(raw, { mode, currentProfile }, errors) {
  const n = normalizeUsername(raw);
  if (!n) { errors.push({ field: 'username', error: 'required' }); return undefined; }
  if (n.length < 3 || n.length > 30) { errors.push({ field: 'username', error: 'length' }); return undefined; }
  if (RESERVED_USERNAMES.has(n)) { errors.push({ field: 'username', error: 'reserved' }); return undefined; }
  if (mode === 'update' && currentProfile && n === currentProfile.username) return n;
  return n;
}

// ── custom_links ──────────────────────────────────────────────────────────────
function validateCustomLinks(raw, maxLinks, errors) {
  if (!Array.isArray(raw)) { errors.push({ field: 'custom_links', error: 'must_be_array' }); return undefined; }
  const cleaned = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') { errors.push({ field: `custom_links[${i}]`, error: 'invalid_entry' }); continue; }
    const label = typeof item.label === 'string' ? item.label.trim() : '';
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const enabled = item.enabled !== false;
    const id = typeof item.id === 'string' ? item.id : '';
    const catalogId = typeof item._catalog_id === 'string' ? item._catalog_id : '';
    const category = typeof item.category === 'string' ? item.category : '';
    if (label.length < 1 || label.length > 60) errors.push({ field: `custom_links[${i}].label`, error: 'label_length' });
    if (!isUrl(url, WEB_PROTOCOLS)) errors.push({ field: `custom_links[${i}].url`, error: 'invalid_url' });
    if (catalogId.length > 80) errors.push({ field: `custom_links[${i}]._catalog_id`, error: 'too_long' });
    if (category.length > 40) errors.push({ field: `custom_links[${i}].category`, error: 'too_long' });
    cleaned.push({ id, label, url, enabled, _catalog_id: catalogId, category });
  }
  if (maxLinks !== MAX_LINKS_UNLIMITED && cleaned.length > maxLinks) {
    errors.push({ field: 'custom_links', error: 'limit_exceeded', limit: maxLinks, count: cleaned.length });
  }
  return cleaned;
}

// ── custom_payments (nonempty label + valid URL; drop empty entries) ──────────
function validateCustomPayments(raw, errors) {
  if (!Array.isArray(raw)) return undefined;
  const cleaned = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') { errors.push({ field: `custom_payments[${i}]`, error: 'invalid_entry' }); continue; }
    const label = typeof item.label === 'string' ? item.label.trim() : '';
    const emoji = typeof item.emoji === 'string' ? item.emoji.slice(0, 8) : '';
    const link = typeof item.link === 'string' ? item.link.trim() : '';
    const qr = typeof item.qr === 'string' ? item.qr.trim() : '';
    if (label.length < 1 || label.length > 60) errors.push({ field: `custom_payments[${i}].label`, error: 'label_length' });
    if (!link && !qr) continue;
    if (link && !isUrl(link, WEB_PROTOCOLS)) errors.push({ field: `custom_payments[${i}].link`, error: 'invalid_url' });
    if (qr && !isUrl(qr, WEB_PROTOCOLS)) errors.push({ field: `custom_payments[${i}].qr`, error: 'invalid_url' });
    cleaned.push({ label, emoji, link, qr });
  }
  return cleaned;
}

// ── privacy_settings ──────────────────────────────────────────────────────────
function validatePrivacySettings(raw, errors) {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'object' || Array.isArray(raw)) { errors.push({ field: 'privacy_settings', error: 'invalid_object' }); return undefined; }
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!VALID_PRIVACY_KEYS.has(k)) { errors.push({ field: `privacy_settings.${k}`, error: 'unknown_key' }); continue; }
    out[k] = !!v;
  }
  return out;
}

// ── business_hours (deep) ─────────────────────────────────────────────────────
function validateBusinessHours(raw, errors) {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'object' || Array.isArray(raw)) { errors.push({ field: 'business_hours', error: 'invalid_object' }); return undefined; }
  const out = {};
  for (const [day, val] of Object.entries(raw)) {
    if (!DAY_KEYS.has(day)) { errors.push({ field: `business_hours.${day}`, error: 'unknown_day' }); continue; }
    if (val === null || val === '' || val === 'closed') { out[day] = { closed: true }; continue; }
    if (typeof val !== 'object' || Array.isArray(val)) { errors.push({ field: `business_hours.${day}`, error: 'invalid_entry' }); continue; }
    const open = typeof val.open === 'string' ? val.open : '';
    const close = typeof val.close === 'string' ? val.close : '';
    const closed = val.closed === true || (!open && !close);
    if (!closed) {
      if (!TIME_RE.test(open)) errors.push({ field: `business_hours.${day}.open`, error: 'invalid_time' });
      if (!TIME_RE.test(close)) errors.push({ field: `business_hours.${day}.close`, error: 'invalid_time' });
    }
    const extra = Object.keys(val).filter((k) => !['open','close','closed'].includes(k));
    if (extra.length) errors.push({ field: `business_hours.${day}`, error: 'unknown_keys', keys: extra });
    out[day] = { open: open || null, close: close || null, closed };
  }
  return out;
}

// ── booking_restricted_emails (deep) ──────────────────────────────────────────
function validateBookingRestrictedEmails(raw, errors) {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) { errors.push({ field: 'booking_restricted_emails', error: 'must_be_array' }); return undefined; }
  if (raw.length > 200) { errors.push({ field: 'booking_restricted_emails', error: 'too_many' }); return undefined; }
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const e = raw[i];
    if (typeof e !== 'string' || !EMAIL_RE.test(e) || e.length > 254) { errors.push({ field: `booking_restricted_emails[${i}]`, error: 'invalid_email' }); continue; }
    out.push(e.toLowerCase());
  }
  return out;
}

function validateEnum(value, field, allowed, errors) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!allowed.has(value)) { errors.push({ field, error: 'invalid_enum' }); return undefined; }
  return value;
}

function fieldAllowedForPlan(field, planFeatures) {
  if (FREE_FIELDS.has(field)) return true;
  const required = FIELD_REQUIRES_FEATURE[field];
  if (!required) return false;
  return Array.isArray(planFeatures) && planFeatures.includes(required);
}

// ── Main sanitizer ────────────────────────────────────────────────────────────
// entitlement: { plan, features[], maximum_links, available_layout_ids }
export function sanitizeProfileFields({ entitlement, input, currentProfile, mode }) {
  const sanitized = {};
  const rejected = [];
  const errors = [];
  const features = (entitlement && Array.isArray(entitlement.features)) ? entitlement.features : [];
  const maxLinks = (entitlement && typeof entitlement.maximum_links === 'number') ? entitlement.maximum_links : 0;
  const availableLayouts = (entitlement && Array.isArray(entitlement.available_layout_ids)) ? entitlement.available_layout_ids : null;
  const src = (input && typeof input === 'object') ? input : {};

  for (const [key, value] of Object.entries(src)) {
    if (NEVER_WRITABLE.has(key)) { rejected.push(key); continue; }
    if (!fieldAllowedForPlan(key, features)) { rejected.push(key); continue; }

    switch (key) {
      case 'username':
        if (mode === 'create' || (currentProfile && normalizeUsername(value) !== currentProfile.username)) {
          const u = validateUsername(value, { mode, currentProfile }, errors);
          if (u !== undefined) sanitized.username = u;
        }
        continue;
      case 'profile_type': sanitized.profile_type = validateEnum(value, 'profile_type', VALID_PROFILE_TYPES, errors) ?? 'personal'; continue;
      case 'profile_category': sanitized.profile_category = validateEnum(value, 'profile_category', VALID_PROFILE_CATEGORIES, errors) ?? 'personal'; continue;
      case 'language': sanitized.language = validateEnum(value, 'language', VALID_LANGUAGES, errors) ?? 'en'; continue;
      case 'avatar_shape': sanitized.avatar_shape = validateEnum(value, 'avatar_shape', VALID_AVATAR_SHAPES, errors); continue;
      case 'avatar_placement': sanitized.avatar_placement = validateEnum(value, 'avatar_placement', VALID_AVATAR_PLACEMENTS, errors); continue;
      case 'avatar_position': sanitized.avatar_position = validateEnum(value, 'avatar_position', VALID_AVATAR_POSITIONS, errors); continue;
      case 'cover_position': sanitized.cover_position = validateEnum(value, 'cover_position', VALID_COVER_POSITIONS, errors); continue;
      case 'bg_style': sanitized.bg_style = validateEnum(value, 'bg_style', VALID_BG_STYLES, errors); continue;
      case 'button_style': sanitized.button_style = validateEnum(value, 'button_style', VALID_BUTTON_STYLES, errors); continue;
      case 'font_style': sanitized.font_style = validateEnum(value, 'font_style', VALID_FONT_STYLES, errors); continue;
      case 'profile_theme': sanitized.profile_theme = validateEnum(value, 'profile_theme', VALID_PROFILE_THEMES, errors); continue;
      case 'profile_layout': sanitized.profile_layout = validateEnum(value, 'profile_layout', VALID_PROFILE_LAYOUTS, errors); continue;
      case 'layout': {
        if (typeof value !== 'string' || !LAYOUT_IDS.has(value)) { errors.push({ field: 'layout', error: 'invalid_layout' }); continue; }
        if (availableLayouts && !availableLayouts.includes(value)) { errors.push({ field: 'layout', error: 'layout_not_available', value }); continue; }
        sanitized.layout = value;
        continue;
      }
      case 'show_location':
      case 'lead_capture_enabled':
      case 'booking_enabled':
      case 'qr_watermark':
        sanitized[key] = !!value; continue;
      case 'bg_watermark_opacity':
        if (typeof value === 'number' && value >= 0 && value <= 100) sanitized[key] = value;
        else errors.push({ field: key, error: 'out_of_range' });
        continue;
      case 'booking_slot_duration':
        if (typeof value === 'number' && value >= 5 && value <= 480) sanitized[key] = value;
        else errors.push({ field: key, error: 'out_of_range' });
        continue;
      case 'cover_color': sanitized.cover_color = validateColor(value, 'cover_color', errors); continue;
      case 'button_color': sanitized.button_color = validateColor(value, 'button_color', errors); continue;
      case 'qr_color': sanitized.qr_color = validateColor(value, 'qr_color', errors); continue;
      case 'theme_background_color': sanitized.theme_background_color = validateColor(value, 'theme_background_color', errors); continue;
      case 'website': sanitized.website = validateOptionalUrl(value, 'website', WEB_PROTOCOLS, errors); continue;
      case 'facebook_url': sanitized.facebook_url = validateOptionalUrl(value, 'facebook_url', WEB_PROTOCOLS, errors); continue;
      case 'instagram_url': sanitized.instagram_url = validateOptionalUrl(value, 'instagram_url', WEB_PROTOCOLS, errors); continue;
      case 'tiktok_url': sanitized.tiktok_url = validateOptionalUrl(value, 'tiktok_url', WEB_PROTOCOLS, errors); continue;
      case 'linkedin_url': sanitized.linkedin_url = validateOptionalUrl(value, 'linkedin_url', WEB_PROTOCOLS, errors); continue;
      case 'youtube_url': sanitized.youtube_url = validateOptionalUrl(value, 'youtube_url', WEB_PROTOCOLS, errors); continue;
      case 'google_review_url': sanitized.google_review_url = validateOptionalUrl(value, 'google_review_url', WEB_PROTOCOLS, errors); continue;
      case 'payment_link': sanitized.payment_link = validateOptionalUrl(value, 'payment_link', WEB_PROTOCOLS, errors); continue;
      case 'profile_photo': sanitized.profile_photo = validateOptionalUrl(value, 'profile_photo', WEB_PROTOCOLS, errors); continue;
      case 'cover_photo': sanitized.cover_photo = validateOptionalUrl(value, 'cover_photo', WEB_PROTOCOLS, errors); continue;
      case 'company_logo': sanitized.company_logo = validateOptionalUrl(value, 'company_logo', WEB_PROTOCOLS, errors); continue;
      case 'bg_watermark_image': sanitized.bg_watermark_image = validateOptionalUrl(value, 'bg_watermark_image', WEB_PROTOCOLS, errors); continue;
      case 'phone': sanitized.phone = validatePhone(value, 'phone', errors); continue;
      case 'whatsapp_number': sanitized.whatsapp_number = validatePhone(value, 'whatsapp_number', errors); continue;
      case 'email': sanitized.email = validateEmail(value, 'email', errors); continue;
      case 'display_name': sanitized.display_name = clampString(value, 'display_name', 80, errors); continue;
      case 'job_title': sanitized.job_title = clampString(value, 'job_title', 120, errors); continue;
      case 'company_name': sanitized.company_name = clampString(value, 'company_name', 120, errors); continue;
      case 'bio': sanitized.bio = clampString(value, 'bio', 2000, errors); continue;
      case 'location': sanitized.location = clampString(value, 'location', 200, errors); continue;
      case 'qr_label': sanitized.qr_label = clampString(value, 'qr_label', 40, errors); continue;
      case 'whatsapp_booking_message': sanitized.whatsapp_booking_message = clampString(value, 'whatsapp_booking_message', 1000, errors); continue;
      case 'custom_links': sanitized.custom_links = validateCustomLinks(value, maxLinks, errors); continue;
      case 'hidden_links':
        if (!Array.isArray(value)) { errors.push({ field: 'hidden_links', error: 'must_be_array' }); continue; }
        sanitized.hidden_links = value.filter((entry) => typeof entry === 'string').slice(0, 100);
        continue;
      case 'custom_payments': sanitized.custom_payments = validateCustomPayments(value, errors); continue;
      case 'privacy_settings': sanitized.privacy_settings = validatePrivacySettings(value, errors); continue;
      case 'business_hours': sanitized.business_hours = validateBusinessHours(value, errors); continue;
      case 'booking_restricted_emails': sanitized.booking_restricted_emails = validateBookingRestrictedEmails(value, errors); continue;
      default:
        if (typeof value === 'string') sanitized[key] = value.slice(0, 2000);
        else if (typeof value === 'number' || typeof value === 'boolean') sanitized[key] = value;
        else rejected.push(key);
    }
  }

  return { sanitized, rejected, errors };
}

// ── Map resolved plan → legacy Profile.plan (server-only) ─────────────────────
export function mapLegacyPlan(plan) {
  const m = { pro: 'professional', salon: 'salon', restaurant: 'business', lawfirm: 'lawfirm', corporate: 'corporate', business: 'business', professional: 'professional', free: 'free' };
  return m[plan] || 'free';
}

// ── Owner-facing response (no internal fields) ─────────────────────────────────
const OWNER_PROFILE_FIELDS = [
  'id','username','display_name','job_title','company_name','company_logo','bio',
  'profile_photo','cover_photo','cover_color','theme_background_color','bg_watermark_image',
  'bg_watermark_opacity','avatar_shape','avatar_placement','avatar_position','cover_position',
  'qr_color','qr_label','qr_watermark','layout','profile_layout','profile_theme','bg_style',
  'button_style','button_color','font_style','phone','whatsapp_number','email','website','location','show_location',
  'facebook_url','instagram_url','tiktok_url','linkedin_url','youtube_url','payment_link',
  'custom_payments','custom_links','hidden_links','privacy_settings','language','google_review_url',
  'whatsapp_booking_message','profile_type','profile_category','lead_capture_enabled','booking_enabled','booking_slot_duration',
  'booking_restricted_emails','business_hours','is_verified','verification_type',
  'verification_status',
];

export function pickOwnerProfileFields(profile, access, effectivePlan) {
  if (!profile) return null;
  const out = {};
  for (const k of OWNER_PROFILE_FIELDS) if (profile[k] !== undefined) out[k] = profile[k];
  out.profile_id = profile.id;
  out.access_status = access?.access_status || 'active';
  out.is_primary = !!access?.is_primary;
  out.effective_plan = effectivePlan || 'free';
  return out;
}

// ── Public-facing response (privacy-aware, revalidated, no internal fields) ───
const PUBLIC_PROFILE_FIELDS = [
  'id','username','display_name','job_title','company_name','company_logo','bio',
  'profile_photo','cover_photo','cover_color','theme_background_color','bg_watermark_image',
  'bg_watermark_opacity','avatar_shape','avatar_placement','avatar_position','cover_position',
  'layout','profile_layout','profile_theme','bg_style','button_style','button_color','font_style','profile_type','profile_category',
  'phone','whatsapp_number','email','website','location','show_location',
  'facebook_url','instagram_url','tiktok_url','linkedin_url','youtube_url','google_review_url',
  'qr_color','qr_label','qr_watermark','language','is_verified','verification_type',
  'lead_capture_enabled','booking_enabled','booking_slot_duration','business_hours',
];

export function pickPublicProfileFields(profile, privacy) {
  if (!profile) return null;
  const p = privacy || {};
  const out = {};
  for (const k of PUBLIC_PROFILE_FIELDS) if (profile[k] !== undefined) out[k] = profile[k];

  if (p.hide_email) delete out.email;
  if (p.show_phone_verified_only && !profile.is_verified) { delete out.phone; delete out.whatsapp_number; }

  const hidden = Array.isArray(profile.hidden_links) ? profile.hidden_links : [];
  if (Array.isArray(profile.custom_links)) {
    out.custom_links = profile.custom_links
      .filter((l) => l && l.enabled !== false && !hidden.includes(l._catalog_id) && !hidden.includes(l.id))
      .filter((l) => isUrl(l.url, WEB_PROTOCOLS))
      .map((l) => ({ label: l.label, url: l.url, category: l.category }));
  }

  if (Array.isArray(profile.custom_payments)) {
    out.custom_payments = profile.custom_payments
      .filter((pm) => pm && (isUrl(pm.link, WEB_PROTOCOLS) || isUrl(pm.qr, WEB_PROTOCOLS)))
      .map((pm) => ({ label: pm.label, emoji: pm.emoji, link: pm.link }));
  }

  return out;
}
