// Server-side shipping configuration — single source of truth.
// Imported by createShopCheckout and any future backend function that needs
// to compute shipping. Do NOT trust frontend shipping values.

export interface ShippingConfig {
  flatRateCents: number;       // Current fixed rate ($5.00 = 500)
  freeShippingThresholdCents: number | null;  // null = no free shipping yet
  currency: string;
  // Future fields ready for activation:
  // usRateCents, internationalRateCents, stripeShippingRateId, etc.
}

export const SHIPPING_CONFIG: ShippingConfig = {
  flatRateCents: 500,
  freeShippingThresholdCents: null,  // No free-shipping threshold yet
  currency: 'usd',
};

export function computeShipping(subtotalCents: number): number {
  if (SHIPPING_CONFIG.freeShippingThresholdCents !== null &&
      subtotalCents >= SHIPPING_CONFIG.freeShippingThresholdCents) {
    return 0;
  }
  return SHIPPING_CONFIG.flatRateCents;
}