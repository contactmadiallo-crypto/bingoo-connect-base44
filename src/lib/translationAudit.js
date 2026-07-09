/**
 * Bingoo Connect — French Translation Audit Helper
 *
 * Scans critical user-facing pages for hardcoded English strings
 * and reports which ones lack French translations.
 *
 * Usage (dev console):
 *   import { auditTranslations } from '@/lib/translationAudit';
 *   const report = auditTranslations(); // returns { total, translated, missing, coveragePct, missingStrings }
 *
 * This is a static audit — it checks known string keys against the i18n module.
 * For full coverage, run dynamic scans per page.
 */

export const CRITICAL_STRINGS = [
  // ── Landing ──
  { key: 'landing.hero_title', en: 'Connect. Share. Grow.', area: 'Landing' },
  { key: 'landing.hero_subtitle', en: 'Your digital identity in one tap', area: 'Landing' },
  { key: 'landing.cta_start', en: 'Get Started', area: 'Landing' },
  { key: 'landing.cta_plans', en: 'See Plans', area: 'Landing' },
  { key: 'landing.features_title', en: 'Everything you need', area: 'Landing' },

  // ── Auth ──
  { key: 'auth.login_title', en: 'Sign In', area: 'Auth' },
  { key: 'auth.register_title', en: 'Create Account', area: 'Auth' },
  { key: 'auth.forgot_title', en: 'Reset Password', area: 'Auth' },
  { key: 'auth.email', en: 'Email', area: 'Auth' },
  { key: 'auth.password', en: 'Password', area: 'Auth' },
  { key: 'auth.confirm_password', en: 'Confirm Password', area: 'Auth' },
  { key: 'auth.google_button', en: 'Continue with Google', area: 'Auth' },
  { key: 'auth.apple_button', en: 'Continue with Apple', area: 'Auth' },
  { key: 'auth.no_account', en: "Don't have an account?", area: 'Auth' },
  { key: 'auth.have_account', en: 'Already have an account?', area: 'Auth' },
  { key: 'auth.verify_otp', en: 'Enter verification code', area: 'Auth' },
  { key: 'auth.resend_otp', en: 'Resend code', area: 'Auth' },

  // ── Dashboard Nav ──
  { key: 'nav.home', en: 'Home', area: 'Dashboard' },
  { key: 'nav.profiles', en: 'My Profiles', area: 'Dashboard' },
  { key: 'nav.leads', en: 'Leads CRM', area: 'Dashboard' },
  { key: 'nav.appointments', en: 'Appointments', area: 'Dashboard' },
  { key: 'nav.analytics', en: 'Analytics', area: 'Dashboard' },
  { key: 'nav.nfc', en: 'NFC Center', area: 'Dashboard' },
  { key: 'nav.qr_wallet', en: 'QR & Wallet', area: 'Dashboard' },
  { key: 'nav.shop', en: 'Shop', area: 'Dashboard' },
  { key: 'nav.billing', en: 'Billing', area: 'Dashboard' },
  { key: 'nav.settings', en: 'Settings', area: 'Dashboard' },
  { key: 'nav.design_studio', en: 'Design Studio', area: 'Dashboard' },
  { key: 'nav.document_wallet', en: 'Document Wallet', area: 'Dashboard' },
  { key: 'nav.my_assets', en: 'My Assets', area: 'Dashboard' },

  // ── Profile Studio ──
  { key: 'studio.info', en: 'Info', area: 'Profile Studio' },
  { key: 'studio.design', en: 'Design', area: 'Profile Studio' },
  { key: 'studio.links', en: 'Links', area: 'Profile Studio' },
  { key: 'studio.media', en: 'Media', area: 'Profile Studio' },
  { key: 'studio.preview', en: 'Preview', area: 'Profile Studio' },
  { key: 'studio.save', en: 'Save', area: 'Profile Studio' },
  { key: 'studio.publish', en: 'Publish', area: 'Profile Studio' },

  // ── NFC Center ──
  { key: 'nfc.activate', en: 'Activate Device', area: 'NFC' },
  { key: 'nfc.my_devices', en: 'My NFC Devices', area: 'NFC' },
  { key: 'nfc.device_code', en: 'Device Code', area: 'NFC' },
  { key: 'nfc.lost_mode', en: 'Lost Mode', area: 'NFC' },
  { key: 'nfc.replace', en: 'Replace Device', area: 'NFC' },

  // ── QR / Wallet ──
  { key: 'qr.download', en: 'Download QR', area: 'QR/Wallet' },
  { key: 'qr.customize', en: 'Customize', area: 'QR/Wallet' },
  { key: 'wallet.apple', en: 'Add to Apple Wallet', area: 'QR/Wallet' },
  { key: 'wallet.google', en: 'Add to Google Wallet', area: 'QR/Wallet' },

  // ── Shop ──
  { key: 'shop.add_to_cart', en: 'Add to Cart', area: 'Shop' },
  { key: 'shop.checkout', en: 'Checkout', area: 'Shop' },
  { key: 'shop.cart', en: 'Cart', area: 'Shop' },
  { key: 'shop.total', en: 'Total', area: 'Shop' },
  { key: 'shop.order_placed', en: 'Order placed successfully!', area: 'Shop' },

  // ── Pricing ──
  { key: 'pricing.free', en: 'Free', area: 'Pricing' },
  { key: 'pricing.professional', en: 'Professional', area: 'Pricing' },
  { key: 'pricing.salon', en: 'Salon', area: 'Pricing' },
  { key: 'pricing.lawfirm', en: 'Law Firm', area: 'Pricing' },
  { key: 'pricing.coming_soon', en: 'Coming Soon', area: 'Pricing' },
  { key: 'pricing.upgrade', en: 'Upgrade', area: 'Pricing' },
  { key: 'pricing.monthly', en: 'Monthly', area: 'Pricing' },
  { key: 'pricing.yearly', en: 'Yearly', area: 'Pricing' },

  // ── Business Tools ──
  { key: 'tools.appointments', en: 'Appointment Booking', area: 'Business Tools' },
  { key: 'tools.services', en: 'Services & Pricing', area: 'Business Tools' },
  { key: 'tools.team', en: 'Team Members', area: 'Business Tools' },
  { key: 'tools.hours', en: 'Business Hours', area: 'Business Tools' },
  { key: 'tools.portfolio', en: 'Portfolio', area: 'Business Tools' },

  // ── Common / Buttons / Empty States ──
  { key: 'common.save', en: 'Save', area: 'Common' },
  { key: 'common.cancel', en: 'Cancel', area: 'Common' },
  { key: 'common.delete', en: 'Delete', area: 'Common' },
  { key: 'common.edit', en: 'Edit', area: 'Common' },
  { key: 'common.close', en: 'Close', area: 'Common' },
  { key: 'common.confirm', en: 'Confirm', area: 'Common' },
  { key: 'common.loading', en: 'Loading…', area: 'Common' },
  { key: 'common.error', en: 'Something went wrong', area: 'Common' },
  { key: 'common.success', en: 'Success!', area: 'Common' },
  { key: 'common.search', en: 'Search…', area: 'Common' },
  { key: 'common.no_results', en: 'No results found', area: 'Common' },
  { key: 'common.upgrade_prompt', en: 'Upgrade to unlock this feature', area: 'Common' },
];

/**
 * Runs the translation audit.
 * @param {Object} i18nModule - The i18n module (from @/lib/i18n.js)
 * @param {string} lang - Target language code ('fr')
 * @returns {Object} Audit report
 */
export function auditTranslations(i18nModule = null, lang = 'fr') {
  const total = CRITICAL_STRINGS.length;
  let translated = 0;
  const missing = [];

  for (const str of CRITICAL_STRINGS) {
    let hasTranslation = false;
    if (i18nModule) {
      const frVal = i18nModule[lang]?.[str.key] || i18nModule[`${str.key}`]?.fr;
      hasTranslation = !!frVal && frVal !== str.en;
    }
    if (hasTranslation) {
      translated++;
    } else {
      missing.push(str);
    }
  }

  const coveragePct = Math.round((translated / total) * 100);

  return {
    total,
    translated,
    missing: missing.length,
    coveragePct,
    missingStrings: missing,
    byArea: groupByArea(missing),
  };
}

function groupByArea(strings) {
  const groups = {};
  for (const s of strings) {
    if (!groups[s.area]) groups[s.area] = [];
    groups[s.area].push(s);
  }
  return groups;
}

/**
 * Prints a formatted audit report to the console.
 */
export function printAuditReport(i18nModule = null) {
  const report = auditTranslations(i18nModule);
  console.log('\n🔍 Bingoo Connect — French Translation Audit');
  console.log('═══════════════════════════════════════════');
  console.log(`Coverage: ${report.coveragePct}% (${report.translated}/${report.total})`);
  console.log(`Missing: ${report.missing} strings\n`);

  if (report.missing > 0) {
    console.log('Missing by area:');
    for (const [area, strings] of Object.entries(report.byArea)) {
      console.log(`\n  📂 ${area} (${strings.length} missing):`);
      strings.forEach(s => console.log(`    ❌ ${s.key} → "${s.en}"`));
    }
  }
  console.log('\n═══════════════════════════════════════════\n');
  return report;
}