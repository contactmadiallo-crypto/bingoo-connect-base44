/**
 * Bingoo Connect — Test Account Overrides
 *
 * These accounts are TEST ACCOUNTS used for internal QA and demo purposes.
 * They are exempt from Stripe payment requirements and automatic downgrades.
 *
 * How admin updates/removes overrides:
 *   1. Edit this file (src/lib/testAccounts.js) — add/remove entries from the map.
 *   2. Edit the matching TEST_ACCOUNT_OVERRIDES constant in:
 *      - base44/functions/getUserFeatures/entry.ts
 *      - base44/functions/stripeWebhook/entry.ts
 *   Both backend copies MUST stay in sync with this file.
 *
 * Roles:
 *   - 'admin_switcher': Admin can switch between plans for testing via the Billing page.
 *     Plan comes from the Subscription entity (plan_source='admin_override'), not hardcoded.
 *   - protected: true → Never downgraded by Stripe webhook, regardless of payment status.
 *   - plan: string → Hardcoded plan that getUserFeatures always returns (overrides Subscription).
 */

export const TEST_ACCOUNT_OVERRIDES = {
  'contact.madiallo@gmail.com':              { plan: null,           role: 'admin_switcher', protected: true },
  'mdiallo9225@gmail.com':                   { plan: 'lawfirm',      protected: true },
  'msfall0510@gmail.com':                    { plan: 'salon',        protected: true },
  'skilibeng110@gmail.com':                  { plan: 'professional', protected: true },
  '9ztjvf42zs@privaterelay.appleid.com':     { plan: 'professional', protected: true },
  'kvartz.alexander@googlemail.com':         { plan: 'professional', protected: true },
};

export function getTestOverride(email) {
  if (!email) return null;
  return TEST_ACCOUNT_OVERRIDES[email.toLowerCase()] || null;
}

export function isProtectedTestAccount(email) {
  return !!getTestOverride(email)?.protected;
}

export function isAdminSwitcher(email) {
  return getTestOverride(email)?.role === 'admin_switcher';
}

export function getOverridePlan(email) {
  return getTestOverride(email)?.plan || null;
}