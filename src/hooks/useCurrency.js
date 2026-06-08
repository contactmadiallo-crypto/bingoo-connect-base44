import { useState, useEffect } from 'react';

// Map timezone prefixes → currency
const TZ_TO_CURRENCY = {
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD',
  'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD', 'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD', 'America/Edmonton': 'CAD',
  'America/Winnipeg': 'CAD', 'America/Halifax': 'CAD', 'America/St_Johns': 'CAD',
  'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR', 'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR', 'Europe/Athens': 'EUR', 'Europe/Helsinki': 'EUR',
  'Europe/Lisbon': 'EUR', 'Europe/Dublin': 'EUR',
  'Europe/London': 'GBP',
  'Africa/Dakar': 'XOF', 'Africa/Abidjan': 'XOF', 'Africa/Bamako': 'XOF',
  'Africa/Ouagadougou': 'XOF', 'Africa/Niamey': 'XOF', 'Africa/Lome': 'XOF',
  'Africa/Cotonou': 'XOF', 'Africa/Bissau': 'XOF',
};

// Locale → currency fallback
const LOCALE_TO_CURRENCY = {
  'en-US': 'USD', 'en-CA': 'CAD', 'en-GB': 'GBP',
  'fr-FR': 'EUR', 'fr-BE': 'EUR', 'fr-CH': 'EUR',
  'fr-SN': 'XOF', 'fr-CI': 'XOF', 'fr-ML': 'XOF', 'fr-BF': 'XOF',
  'fr-GN': 'XOF', 'fr-TG': 'XOF', 'fr-BJ': 'XOF', 'fr-NE': 'XOF',
  'de': 'EUR', 'it': 'EUR', 'es': 'EUR', 'pt-PT': 'EUR',
};

// Currency display config
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸', stripeCurrency: 'usd' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺', stripeCurrency: 'eur' },
  XOF: { symbol: 'CFA', name: 'CFA Franc', flag: '🌍', stripeCurrency: null }, // No Stripe native support → fallback
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧', stripeCurrency: 'gbp' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', stripeCurrency: 'cad' },
};

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'XOF', 'GBP', 'CAD'];

// Default USD pricing (used as fallback + base for conversion estimates)
export const BASE_PRICES_USD = {
  professional: 4.99,
  salon: 19.99,
  restaurant: 29.99,
  lawfirm: 49,
  corporate: 99,
};

// Approximate conversion rates (for display when no DB config exists)
const APPROX_RATES = { USD: 1, EUR: 0.92, XOF: 600, GBP: 0.79, CAD: 1.36 };

export function convertPrice(usdPrice, currency) {
  if (currency === 'USD') return usdPrice;
  const rate = APPROX_RATES[currency] || 1;
  const raw = usdPrice * rate;
  if (currency === 'XOF') return Math.round(raw / 100) * 100; // round to nearest 100 CFA
  return Math.round(raw * 100) / 100;
}

export function formatPrice(amount, currency) {
  const cfg = CURRENCY_CONFIG[currency];
  if (!cfg) return `$${amount}`;
  if (currency === 'XOF') return `${amount.toLocaleString()} ${cfg.symbol}`;
  return `${cfg.symbol}${amount}`;
}

function detectCurrencyFromEnv() {
  // 1. Try timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_TO_CURRENCY[tz]) return { currency: TZ_TO_CURRENCY[tz], method: 'timezone' };
  } catch (_) {}

  // 2. Try locale
  try {
    const locale = navigator.language || navigator.languages?.[0];
    if (locale) {
      if (LOCALE_TO_CURRENCY[locale]) return { currency: LOCALE_TO_CURRENCY[locale], method: 'locale' };
      // Try language prefix
      const lang = locale.split('-')[0];
      if (LOCALE_TO_CURRENCY[lang]) return { currency: LOCALE_TO_CURRENCY[lang], method: 'locale' };
    }
  } catch (_) {}

  return { currency: 'USD', method: 'default' };
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('bingoo_currency');
    if (saved && SUPPORTED_CURRENCIES.includes(saved)) return saved;
    return detectCurrencyFromEnv().currency;
  });

  const [detectedCurrency] = useState(() => detectCurrencyFromEnv().currency);

  const setCurrency = (c) => {
    if (SUPPORTED_CURRENCIES.includes(c)) {
      setCurrencyState(c);
      localStorage.setItem('bingoo_currency', c);
    }
  };

  const isManualOverride = currency !== detectedCurrency;

  // XOF has no native Stripe support → use USD for actual payment, show XOF for display
  const stripeCurrency = CURRENCY_CONFIG[currency]?.stripeCurrency || 'usd';
  const stripeCheckoutCurrency = stripeCurrency === null ? 'usd' : stripeCurrency;

  return { currency, setCurrency, detectedCurrency, isManualOverride, stripeCheckoutCurrency };
}