// Standalone Design Studio commerce catalog.
// These are NOT retail Shop products. They represent customer-designed Bingoo NFC hardware.
// Checkout uses the matching server-side IDs in createShopCheckout.

const LABELS = {
  card: 'Custom NFC Card',
  keychain: 'Custom NFC Keychain',
  sticker: 'Custom NFC Sticker',
  bracelet: 'Custom NFC Bracelet',
  tag: 'Custom NFC Tag',
  stand: 'Custom NFC Stand',
};

export function getDesignStudioProduct(type = 'card', mode = 'business') {
  const safeType = Object.prototype.hasOwnProperty.call(LABELS, type) ? type : 'card';
  const professional = mode === 'professional';
  return {
    id: `studio-${professional ? 'pro' : 'business'}-${safeType}`,
    name: LABELS[safeType],
    price: professional ? 4.99 : 3.99,
    image: null,
    category: safeType,
    flow: 'profile',
    availability: 'active',
    stripeReady: true,
    designStudio: true,
  };
}

export const BUSINESS_SETUP_FEE = 25;
export const BUSINESS_REMOVE_BRANDING_FEE = 2.5;

export function designStudioExtraFees(item) {
  const design = item?.customDesign || {};
  if (!item?.designStudio && !design?.designStore) return 0;
  if (design.designMode !== 'business') return 0;
  return BUSINESS_SETUP_FEE + (design.removeBranding ? BUSINESS_REMOVE_BRANDING_FEE : 0);
}

export function cartLineTotal(item) {
  return Number(item?.price || 0) * Number(item?.quantity || 0) + designStudioExtraFees(item);
}
