// base44/shared/gatedEntityRegistry.ts
// Per-entity field allowlists + strict validators for createGatedRecord.
// Mass-assignment defense: only explicitly allowlisted fields pass; sensitive
// scope/owner/plan/verification/timestamp/internal-status fields are REJECTED
// with validation errors so mass-assignment attempts surface visibly.

const WEB_PROTOCOLS = ['http:', 'https:'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[0-9\s\-().]{4,30}$/;

function isUrl(v) {
  if (typeof v !== 'string' || v.length === 0 || v.length > 2048) return false;
  try { const u = new URL(v); return WEB_PROTOCOLS.includes(u.protocol); } catch { return false; }
}
function optUrl(v) { return (typeof v === 'string' && v.length && isUrl(v)) ? v : undefined; }
function emailVal(v) { return (typeof v === 'string' && EMAIL_RE.test(v) && v.length <= 254) ? v : undefined; }
function phoneVal(v) { return (typeof v === 'string' && PHONE_RE.test(v)) ? v : undefined; }
function strVal(v, max) { return (typeof v === 'string') ? v.slice(0, max) : undefined; }
function numVal(v, min, max) {
  if (typeof v !== 'number' || isNaN(v)) return undefined;
  if (v < min) return undefined;
  if (max !== undefined && v > max) return undefined;
  return v;
}
function boolVal(v) { return typeof v === 'boolean' ? v : undefined; }
function enumVal(v, set) { return (typeof v === 'string' && set.has(v)) ? v : undefined; }
function strArrVal(v, maxItem, maxCount) {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x) => typeof x === 'string').map((x) => x.slice(0, maxItem));
  if (maxCount !== undefined && out.length > maxCount) out.length = maxCount;
  return out;
}

const PRACTICE_CATEGORIES = new Set(['Immigration', 'Civil', 'Criminal']);
function practiceCategoriesVal(v) {
  const arr = strArrVal(v, 50, 20);
  if (!arr) return undefined;
  return arr.filter((x) => PRACTICE_CATEGORIES.has(x));
}

const MENU_CATEGORIES = new Set([
  'appetizers', 'main_course', 'daily_special', 'chef_special', 'desserts',
  'beverages', 'sides', 'salads', 'soups', 'breakfast', 'lunch', 'dinner',
]);
const OPT_TYPES = new Set(['single', 'multiple']);
function customizationOptionsVal(v) {
  if (!Array.isArray(v)) return undefined;
  const out = [];
  for (const opt of v) {
    if (!opt || typeof opt !== 'object') continue;
    let choices = undefined;
    if (Array.isArray(opt.choices)) {
      choices = [];
      for (const c of opt.choices) {
        if (!c || typeof c !== 'object') continue;
        choices.push({
          label: strVal(c.label, 100),
          value: strVal(c.value, 100),
          extra_price: numVal(c.extra_price, 0, 100000),
        });
      }
    }
    out.push({
      name: strVal(opt.name, 100) || '',
      type: enumVal(opt.type, OPT_TYPES) || 'single',
      required: boolVal(opt.required) === true,
      choices: choices || [],
    });
  }
  return out;
}

// Universal never-writable (rejected with error if present in client data).
const UNIVERSAL_NEVER = new Set([
  'id', 'created_date', 'updated_date', 'created_by_id', 'created_by',
  'plan', 'is_verified', 'verification_type', 'verification_status',
  'owner_email', 'owner_user_id', 'account_id',
]);

// Sensitive scope IDs — forced from the existing record / URL scope, never client.
const SCOPE_NEVER = new Set(['profile_id', 'restaurant_id']);

export const GATED_ENTITIES = {
  TeamMember: {
    feature: 'team_members', scope: 'profile',
    requiredCreate: ['name'],
    fields: {
      name: (v) => strVal(v, 120),
      role: (v) => strVal(v, 120),
      email: (v) => emailVal(v),
      phone: (v) => phoneVal(v),
      whatsapp: (v) => phoneVal(v),
      photo: (v) => optUrl(v),
      bio: (v) => strVal(v, 2000),
      education: (v) => strVal(v, 500),
      experience: (v) => strVal(v, 500),
      awards: (v) => strVal(v, 500),
      bar_states: (v) => strVal(v, 200),
      languages: (v) => strVal(v, 200),
      practice_categories: practiceCategoriesVal,
      practice_areas: (v) => strVal(v, 500),
      consultation_fee: (v) => strVal(v, 100),
      availability: (v) => strVal(v, 200),
      office_address: (v) => strVal(v, 300),
      status: (v) => enumVal(v, new Set(['active', 'inactive'])),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  LegalService: {
    feature: 'legal_services', scope: 'profile',
    requiredCreate: ['name'],
    fields: {
      practice_area_id: (v) => strVal(v, 100),
      name: (v) => strVal(v, 200),
      description: (v) => strVal(v, 500),
      legal_category: (v) => enumVal(v, new Set(['Immigration', 'Civil', 'Criminal'])),
      is_active: (v) => boolVal(v),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  PracticeArea: {
    feature: 'practice_areas', scope: 'profile',
    requiredCreate: ['name'],
    fields: {
      name: (v) => strVal(v, 200),
      description: (v) => strVal(v, 500),
      icon: (v) => strVal(v, 50),
      is_active: (v) => boolVal(v),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  OfficeLocation: {
    feature: 'office_locations', scope: 'profile',
    requiredCreate: ['name', 'address'],
    fields: {
      name: (v) => strVal(v, 200),
      address: (v) => strVal(v, 300),
      city: (v) => strVal(v, 120),
      state: (v) => strVal(v, 120),
      zip_code: (v) => strVal(v, 20),
      phone: (v) => phoneVal(v),
      email: (v) => emailVal(v),
      hours: (v) => strVal(v, 200),
      is_primary: (v) => boolVal(v),
      is_active: (v) => boolVal(v),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  SalonService: {
    feature: 'services', scope: 'profile',
    requiredCreate: ['name'],
    fields: {
      category: (v) => strVal(v, 80),
      name: (v) => strVal(v, 200),
      description: (v) => strVal(v, 2000),
      duration_minutes: (v) => numVal(v, 1, 1440),
      price: (v) => numVal(v, 0, 1000000),
      price_label: (v) => strVal(v, 60),
      image_url: (v) => optUrl(v),
      is_active: (v) => boolVal(v),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  PortfolioItem: {
    feature: 'portfolio', scope: 'profile',
    requiredCreate: ['title'],
    fields: {
      title: (v) => strVal(v, 200),
      description: (v) => strVal(v, 2000),
      image_url: (v) => optUrl(v),
      link: (v) => optUrl(v),
      category: (v) => strVal(v, 80),
      order: (v) => numVal(v, 0, 100000),
    },
    never: new Set(),
  },

  MenuItem: {
    feature: 'digital_menu', scope: 'restaurant',
    requiredCreate: ['name', 'price', 'category'],
    fields: {
      name: (v) => strVal(v, 200),
      description: (v) => strVal(v, 2000),
      price: (v) => numVal(v, 0, 1000000),
      category: (v) => enumVal(v, MENU_CATEGORIES),
      image_url: (v) => optUrl(v),
      available: (v) => boolVal(v),
      preparation_time: (v) => numVal(v, 0, 1440),
      ingredients: (v) => strArrVal(v, 200, 100),
      allergens: (v) => strArrVal(v, 100, 50),
      customization_options: customizationOptionsVal,
    },
    never: new Set(),
  },

  AttendanceLog: {
    feature: 'attendance', scope: 'profile',
    // Generic create/update on AttendanceLog are DISABLED — only dedicated
    // attendance_clock_in / attendance_clock_out ops are permitted (server
    // controls timestamps, hours, identity, and status).
    fields: {},
    requiredCreate: [],
    never: new Set([
      'team_member_id', 'team_member_name', 'clock_in', 'clock_out',
      'date', 'hours_worked', 'status', 'notes',
    ]),
  },
};

export function entityConfig(name) { return GATED_ENTITIES[name]; }

// Validate a client payload against the entity allowlist.
//   mode: 'create' | 'update'
// Returns { sanitized, errors, rejected }.
//   - NEVER fields present in input → rejected[] + errors[] (mass-assignment surface)
//   - unknown non-sensitive fields → silently dropped
//   - invalid values → errors[]
export function validateEntityRecord(entityName, data, mode) {
  const cfg = GATED_ENTITIES[entityName];
  const sanitized = {};
  const errors = [];
  const rejected = [];
  const src = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

  const never = new Set([...UNIVERSAL_NEVER, ...SCOPE_NEVER, ...(cfg.never || [])]);

  for (const [key, value] of Object.entries(src)) {
    if (never.has(key)) { rejected.push(key); errors.push({ field: key, error: 'field_not_writable' }); continue; }
    const validator = cfg.fields[key];
    if (!validator) continue; // unknown non-sensitive → drop
    if (value === undefined || value === null || value === '') continue; // optional empty → skip
    const result = validator(value);
    if (result === undefined) { errors.push({ field: key, error: 'invalid_value' }); continue; }
    sanitized[key] = result;
  }

  if (mode === 'create') {
    for (const f of (cfg.requiredCreate || [])) {
      if (sanitized[f] === undefined || sanitized[f] === null || sanitized[f] === '') {
        errors.push({ field: f, error: 'required' });
      }
    }
  }

  return { sanitized, errors, rejected };
}