// Shared constants for the premium Design Studio (Business plan).
export const NAVY = '#0b2149', ORANGE = '#f97316', BORDER = '#E5EAF2', MUTED = '#64748B', BG = '#F7F9FC', INK = '#0F172A';

export const CARD_COLORS = [
  { name: 'Pearl White', value: '#F1F5F9' },
  { name: 'Bingoo Navy', value: '#0b2149' },
  { name: 'Midnight', value: '#0F172A' },
  { name: 'Royal Blue', value: '#3b82f6' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Burgundy', value: '#7C1D3A' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Rose Gold', value: '#B76E79' },
];

export const ACCENTS = ['#f97316', '#D4A017', '#0b2149', '#3b82f6', '#0d9488', '#22c55e', '#ec4899'];

export const FINISHES = ['Matte', 'Glossy', 'Frosted'];

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', cardColor: '#F1F5F9', accentColor: '#D4A017', finish: 'Frosted', pattern: { enabled: true, size: 'medium', direction: 'diagonal', coverage: 'full' } },
  { id: 'minimal', name: 'Minimal', cardColor: '#F8FAFC', accentColor: '#0b2149', finish: 'Matte', pattern: { enabled: true, size: 'large', direction: 'offset', coverage: 'full' } },
  { id: 'corporate', name: 'Corporate', cardColor: '#0b2149', accentColor: '#3b82f6', finish: 'Matte', pattern: { enabled: true, size: 'medium', direction: 'straight', coverage: 'full' } },
  { id: 'creative', name: 'Creative', cardColor: '#F1F5F9', accentColor: '#f97316', finish: 'Glossy', pattern: { enabled: true, size: 'large', direction: 'centered', coverage: 'full' } },
];

export const UNIT_PRICE = 3.99;
export const SETUP_FEE = 25;
export const REMOVE_BRANDING_FEE = 2.5;
export const SHIPPING = 5;

export const DEFAULT_PATTERN = { enabled: true, size: 'medium', direction: 'diagonal', coverage: 'full' };