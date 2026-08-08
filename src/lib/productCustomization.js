// Storefront customization options for active Bingoo NFC hardware.
// These are customer-facing manufacturing selections only; prices remain server-authoritative.

const SWATCHES = {
  matteBlack: { name: 'Matte Black', value: '#171717' },
  deepBlue: { name: 'Deep Blue', value: '#0b2d5c' },
  navy: { name: 'Bingoo Navy', value: '#0b2149' },
  white: { name: 'Pearl White', value: '#f1f5f9' },
  orange: { name: 'Bingoo Orange', value: '#f97316' },
  silver: { name: 'Silver', value: '#b8bec8' },
  roseGold: { name: 'Rose Gold', value: '#b76e79' },
  gold: { name: 'Gold', value: '#c9972b' },
  walnut: { name: 'Walnut', value: '#5b3626' },
  ebony: { name: 'Ebony', value: '#241c1a' },
  naturalWood: { name: 'Natural Wood', value: '#9b6a45' },
};

export const PRODUCT_CUSTOMIZATION = {
  'nfc-card': {
    colors: [SWATCHES.matteBlack, SWATCHES.deepBlue, SWATCHES.white, SWATCHES.orange],
    finishes: ['Matte', 'Soft Touch'],
    engraving: ['Bingoo Infinity Logo'],
  },
  'nfc-keychain': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Matte'],
  },
  'nfc-metal-card': {
    colors: [SWATCHES.matteBlack, SWATCHES.deepBlue, SWATCHES.silver, SWATCHES.roseGold, SWATCHES.gold],
    finishes: ['Brushed', 'Matte'],
    engraving: ['Bingoo Infinity Logo'],
  },
  'nfc-wood-card': {
    colors: [SWATCHES.walnut, SWATCHES.ebony, SWATCHES.naturalWood],
    finishes: ['Natural Grain', 'Matte Seal'],
    engraving: ['Bingoo Infinity Logo'],
  },
  'nfc-sticker': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.white, SWATCHES.orange],
    finishes: ['Matte'],
  },
  'nfc-bracelet': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Soft Silicone'],
  },
  'nfc-silicone-tag': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Soft Silicone'],
  },
  'nfc-key-fob': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Matte'],
  },
  'nfc-table-stand': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.white],
    finishes: ['Matte'],
  },
  'nfc-phone-stand': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.white],
    finishes: ['Matte'],
  },
  'nfc-pet-collar': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Soft Touch'],
  },
  'nfc-luggage-tag': {
    colors: [SWATCHES.matteBlack, SWATCHES.navy, SWATCHES.orange],
    finishes: ['Travel Matte'],
  },
};

export function getProductCustomization(productId) {
  return PRODUCT_CUSTOMIZATION[productId] || null;
}

export function getDefaultProductCustomization(productId) {
  const config = getProductCustomization(productId);
  if (!config) return undefined;
  const color = config.colors?.[0];
  const finish = config.finishes?.[0];
  const engraving = config.engraving?.[0];
  return {
    ...(color ? { cardColor: color.value, colorName: color.name } : {}),
    ...(finish ? { finish } : {}),
    ...(engraving ? { nameText: engraving } : {}),
  };
}
