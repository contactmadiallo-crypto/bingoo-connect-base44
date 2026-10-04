# Bingoo Connect — project instructions for Claude Code

Inherited, production-oriented Base44 + React (Vite) + Capacitor SaaS. Live domain: https://bingooconnect.com
Base44 app id: `692bd9007b93ba81de543346`. Public profiles live at `/p/:username`, NFC device URLs at `/d/:deviceCode`.

Workflow: AUDIT → find the existing source of truth → smallest change → build → verify against spec → regression-check → checkpoint.
Do not redesign or "clean up" unrelated code inside a targeted fix. Do not treat a green build as proof of correct behavior.

## Hard rules
- One source of truth per concept. Do NOT add another profile renderer, entitlement resolver, navigation system or data model.
- Never confuse: `profile_type` (vertical), `profile_category` (profession badge), subscription plan, account role.
- Never change subscription data to fix a presentation bug.
- Do not touch authentication, billing, public-profile routing, NFC activation or DB schema as a side effect of a UI task.
- Always separate: web, responsive mobile web, native Android/Capacitor, future iOS.
- If the literal request would cause regression/duplication, explain the conflict and propose the safer change.
- Report each batch as: Problem → Root cause → Source of truth → Files → Minimal change → Unchanged → Risks → Verification.

## Layout of the repo
- `src/` React app (pages, components, hooks, lib). `base44/entities/*.jsonc` schemas, `base44/functions/*/entry.ts` Deno backend, `base44/shared/*.ts` code shared by functions.
- `android/`, `ios/` Capacitor shells. **The native apps ship a BUNDLED SNAPSHOT of the web build.** Web fixes reach a phone only after `npm run build && npx cap sync android` and a new Android build. Always rebuild before judging a mobile bug.
- CLI must be run as `npx base44 …` (never bare `base44`). Check `npx base44 whoami` first.
- Dead legacy code exists (FoodHub pages, `legacy/`, ~45 FoodHub entities). Not routed. Do not revive; candidate for deletion.

## Sources of truth (current state)
| Concept | Authority | Notes / known duplicates |
|---|---|---|
| Plan / entitlement (server) | `base44/shared/entitlementResolver.ts`, `getUserFeatures` | Client copy `src/lib/planPermissions.js`; third copy `src/lib/accountTypes.js`; test-account list copied in 3 places. UI must consume `usePlan`, never invent rules. |
| Profile appearance | `resolveProfileAppearance()` in `src/lib/profileLayouts.js` → `ResolvedProfileLayout` | Several other renderers/previews exist (`ProfileLayoutRenderer`, `ProfilePreview`, `LivePreviewPanel`, `LayoutMiniPreview`…). Audit consumers before touching. |
| Layout ids | server `base44/shared/layoutRegistry.ts` vs client `LAYOUT_RECIPES` | **Mismatch**: client has `portrait, color, glass, darkpremium` (server rejects them); server has `bold, neon, retro, floating, luxury_gold` (no client recipe; aliased). |
| UI language | `useI18n()` / `LanguageProvider` (also saved to `User.preferred_language`) | `BingooLayout` and `BingooDashboard` now read it; do not reintroduce local `lang` state. |
| Owner notifications | `base44/shared/notifyOwner.ts` (in-app + Web Push, localized to owner) | All lead/appointment/prospect/lost-item/billing events go through it. |
| App shell / navigation | `BingooLayout` (+ `BottomNav` on mobile). `AdaptiveShopShell` adds the shell to shop/plans only in the installed app. | `/my-nfc-devices` embeds `BingooLayout` itself. |

## Approved plan matrix (owner spec — authoritative)
- Free: 1 profile, **1 protected asset**, QR, cannot normally activate NFC, upgrade/trial prompts. (`createAssetItemGated` limit = 1.)
- Professional: up to 5 profiles, unlimited assets, NFC per entitlement. No appointments, leads, Design Studio.
- Business: unlimited profiles, appointments, leads, Design Studio, advanced business features. Law Firm / Salon vertical plans must stay compatible.
- Spec says **Pro and Professional are different plans**, but the code aliases `pro → professional` in several places. OPEN DECISION — do not change without the owner.
- Professional must never be displayed as "PRO" (fixed in sidebar + upgrade CTA).

## Frozen: My Profiles card
Compact; header reflects selected layout/accent/photo/name/title/bio/badge; bottom row `[Edit] [Delete] … [QR]`. No cover-photo architecture, no favorite star, no duplicated contact/name/title/username/type, no oversized cards or filler analytics. Currently implemented in `ProfilesHub.jsx`.

## Work completed (3 Base44 checkpoints)
1. Android edge-to-edge fix (`capacitor.config.ts` `android.adjustMarginsForEdgeToEdge:'auto'`, navy window background, light status icons); Home/Menu icons swapped; slimmer glass sidebar (216px / 64px collapsed); single EN/FR toggle in header wired to the global provider; new server-side `exportMyData` (ZIP: CSV + JSON); localized push/in-app notifications via `notifyOwner` for leads, appointments, prospects, lost-item scans, finder reports, billing; fixed browser push opt-in (it called a non-existent function); `sendTestPush`; downgrade follow-up in `stripeWebhook` (keeps default profile active, pauses others with `lock_reason='plan_downgrade'`, restores on resubscribe); legacy `profile_layout` reset on layout save; escaped finder text in lost-item emails.
2. Free asset limit aligned to spec (1); plans page (`/pricing`, `/plans`) now keeps the shell in the installed app; Free users now see an error when a Professional-only layout is rejected (was a false "Saved").
3. Plan label fixes (display only).

## Open items (priority order)
- **P0 verify**: `Subscription` RLS `create` allows `created_by_id: null`; `getUserFeatures` trusts any active record. Test whether a Free user can create their own paid Subscription from the browser console. `src/pages/Billing.jsx` also writes Subscription from the client for the admin switcher — move to a role-checked backend function.
- **P0**: public endpoints (`createPublicLead`, `createPublicAppointment`, `createPublicProspect`, `trackPublicAnalytics`, `submitPrivacyRequest`) have no rate limit/CAPTCHA; `createPublicLead` spreads the request body into `Lead.create` (allowlist fields).
- **P1 decision**: `past_due` — webhook comments say grace period (keep plan) but `getUserFeatures` / `resolveEffectivePlan` drop `past_due` to Free. Align after owner decides. One Business `admin_override` record with `past_due` currently resolves to Free.
- **P1**: native push needs Firebase Cloud Messaging (`@capacitor/push-notifications`, `google-services.json`, FCM sender). The Android WebView cannot receive Web Push; today only local appointment reminders exist.
- **P1**: canonical-renderer audit and layout completeness (see layout-id mismatch above); hide unfinished layouts.
- P2: Pro vs Professional decision; duplicate plan fields (`Profile.plan`, `profile_type`, `ProfileAccess.plan_name`, `Subscription.plan`); delete FoodHub code; sensitive data (immigration/ID data) handling; VAPID key stored in an entity instead of env secrets; ProfileWorkspace save path should surface `rejected` fields like DesignTab now does.
- Not yet audited: Android pull-to-refresh/touch (`ScreenPullToRefresh.jsx`), Android back behavior, NFC activation paths, Design Studio blank state, SEO, shop→manufacturing consistency.

## Verification status (be honest about this)
`npx vite build` passes. Backend functions were only syntax-checked, **never run** against real Stripe/push events; nothing has been tested on a device after these changes. Deploy functions, test with Free and Business accounts, rebuild the Android app, then verify.

## Commands
`npm run build` · `npm run lint` · `npm run typecheck` · `npm run test:smoke` · `npm run android:sync` · `npx base44 deploy -y` (entities + functions + site) · `npx base44 functions deploy <name>`.
