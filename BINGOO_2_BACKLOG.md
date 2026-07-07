# Bingoo 2.0 — Professional Identity Operating System

**Backlog Document · Last updated: 2026-07-07**
**Status: BACKLOG ONLY — No implementation started. All current production flows remain untouched.**

---

## Product Vision

Bingoo Connect evolves from a digital business card + NFC app into a **premium operating system for professional identity**.

**Positioning:**
- Bingoo Connect — The Operating System for Professional Identity
- One Tap. Your Entire Business World.
- Connect. Share. Grow. Succeed.

**Core promise:**
One place for professional profile identity, NFC and QR sharing, wallet cards, CRM, appointments, analytics, reviews, payments, shop, custom NFC design, business tools, and team/enterprise branding.

---

## Non-Negotiable Safety Rules

Every phase must preserve:
- Current login and auth
- Existing profiles and public profile URLs (`/p/:username`)
- NFC activation and scan URLs (`/n/:deviceCode`, `/activate-device`)
- QR links
- Leads, Appointments, Analytics
- Lost mode (`/lost/:deviceCode`)
- Google Wallet and Apple Wallet flows
- Stripe subscriptions and checkout
- Admin access (`/admin`)
- Existing Base44 entities and production data
- Play Store package / assetlinks behavior

Old routes remain as redirects until new navigation is fully tested.

---

## Current Achievements (Verified)

### Platform & Access
- ✅ Live domain: `bingooconnect.com`
- ✅ Base44 App ID: `692bd9007b93ba81de543346`
- ✅ `/bingoo` dashboard loads
- ✅ `/shop` page loads
- ✅ `/admin` access working
- ✅ Stripe webhook cleanup completed
- ✅ ShopOrder create permission fixed

### Subscriptions & Plans
- ✅ Test account overrides (admin/pro/law firm/salon)
- ✅ Protected test accounts resist downgrade on payment failure
- ✅ `contact.madiallo@gmail.com` = admin/test switcher
- ✅ `mdiallo9225@gmail.com` = Law Firm test
- ✅ `msfall0510@gmail.com` = Salon test
- ✅ Monthly/annual billing toggle with 10% annual discount
- ✅ `/plans` passes `billing_cycle` to `createSubscriptionSession`
- ✅ Business/Restaurant/Corporate/NGO/Event Planner = Coming Soon
- ✅ Active purchasable: Professional, Salon, Law Firm
- ✅ Resume module removed from navigation

### Wallet
- ✅ Google Wallet setup complete (Issuer ID: `3388000000023153907`)
- ✅ Google Wallet API enabled
- ✅ Save URL corrected to `https://pay.google.com/gp/v/save/<jwt>`
- ✅ Public visitor wallet buttons removed
- ✅ Owner-only wallet generation with backend ownership checks

### Profile & QR UX
- ✅ Profile cards improved on dashboard
- ✅ QR logo watermark live preview

### NFC / Shop Direction
- ✅ Standard Bingoo-branded NFC products for Pro/Individual/Influencer
- ✅ Custom NFC Design Studio scoped as Business-only (planned)

---

## Phase 1 — Foundation Stabilization
**Goal: Verify current app stability before any redesign.**

| # | Task | Status |
|---|------|--------|
| 1.1 | Audit all current routes/pages | ⬜ Pending |
| 1.2 | Audit all Base44 entities | ⬜ Pending |
| 1.3 | Audit all plan permissions and capability checks | ⬜ Pending |
| 1.4 | Audit current dashboard modules | ⬜ Pending |
| 1.5 | Identify duplicated modules | ⬜ Pending |
| 1.6 | Identify dead components | ⬜ Pending |
| 1.7 | Confirm no route points to legacy app/dashboard paths | ⬜ Pending |
| 1.8 | Confirm no feature uses old `pro` legacy IDs | ⬜ Pending |
| 1.9 | Confirm Resume is fully hidden | ⬜ Pending |
| 1.10 | Create backup checkpoint `bingoo-2-ui-ux-overhaul-start` | ⬜ Pending |

**Done =** Login, profile, NFC, leads, appointments, analytics, lost mode, shop, wallet, and billing verified working.

---

## Phase 2 — Shared Design System
**Goal: Stop UI drift with reusable components.**

**Design Tokens:**
| Token | Value |
|-------|-------|
| Primary Navy | `#0A1F52` |
| Deep Navy | `#071A3D` |
| Accent Orange | `#FF7A00` |
| Success Green | `#22C55E` |
| Danger Red | `#EF4444` |
| Background | `#F7F9FC` |
| Card White | `#FFFFFF` |
| Border | `#E5EAF2` |
| Text Dark | `#0F172A` |
| Text Muted | `#64748B` |

**Reusable Components to Build:**
`BingooButton` · `BingooCard` · `BingooInput` · `BingooTabs` · `BingooBadge` · `BingooModal` · `BingooPageHeader` · `BingooEmptyState` · `BingooLoadingSkeleton` · `BingooStatCard` · `BingooSection` · `BingooDeviceCard` · `BingooProfileCard`

**Rules:** One button system, one card system, one icon family, one spacing scale, one border radius scale, consistent mobile behavior.

---

## Phase 3 — New Information Architecture
**Goal: Convert cluttered dashboard into grouped navigation.**

**Main Sections:** Home · Identity · Business · NFC · Shop · Settings

**Mobile Bottom Nav:** Home · Profiles · NFC · Business · More

Old routes redirect until all new routes are tested.

---

## Phase 4 — Premium Home Dashboard
- Selected profile summary
- Quick actions: Share Profile, Activate NFC, View Analytics, New Lead
- Recent activity, Today's appointments, Latest leads
- Device health, Plan status
- Calm, premium, operational — less clutter, more hierarchy, better loading/empty states

---

## Phase 5 — Identity / Profile Studio
**My Profiles:** Clickable cards, default badge, profile type badge, quick actions (View/Share/Edit/QR)

**Profile Studio Tabs:** Info · Design · Links · Media · Business Tools · Share · Settings

**Rules:** Public pages don't show owner-only wallet buttons. Dashboard preview content not clickable. Wallet buttons inside owner dashboard share tools.

---

## Phase 6 — Business Tools
**Leads CRM:** Pipeline, lead cards, status changes, WhatsApp/Call/Email actions, notes, source tracking, CSV export

**Appointments:** Pending/Confirmed/Completed/Cancelled, calendar, booking setup, services, availability, notifications

**Analytics:** Profile views, NFC taps, QR scans, leads, bookings, website clicks, social clicks, wallet saves, lost mode events

---

## Phase 7 — NFC Operating Center
- Device type, assigned profile, tap count, status
- Lost mode, replace device, reassign profile
- Device URL, activation code
- Activate Device: enter code, scan QR, assign to profile, confirm
- **Reassignment rule:** If profile is deleted, devices move to `unassigned` (not deleted). Admin can recover/reassign.

---

## Phase 8 — QR And Wallet Center
- Download QR, live watermark preview
- Add to Google/Apple Wallet (owner-only)
- Customize QR style
- Wallet layout constrained by APIs: premium logo, navy card, strong QR, clean contact rows
- No personal/gallery/private photos in wallet assets

---

## Phase 9 — Shop + Business Design Studio
**Shop:** Standard Bingoo-branded NFC products (card, metal card, keychain, bracelet, sticker, table stand, desk stand, phone stand, event badge, hotel card)

**Business Design Studio (Business-only):** Upload logo, company name, brand colors, product type, material/finish, live front/back preview, save design, submit order. Back includes QR placeholder + activation code. Front includes logo + "Powered by Bingoo". Bottom: Connect · Share · Grow.

**Manufacturing MVP:**
- `ManufacturingOrder` entity + `DeviceDesign` entity
- Admin views orders, downloads artwork, manually sends to supplier
- Admin updates production/shipping status
- Statuses: draft → submitted → awaiting_payment → paid → in_review → sent_to_supplier → in_production → shipped → delivered → cancelled
- No automated supplier APIs

---

## Phase 10 — Subscription & Plan Structure
**Active/Purchasable:** Free · Professional · Salon · Law Firm

**Coming Soon:** Business · Restaurant · Corporate · NGO · Event Planner · Bulk NFC/Enterprise

**Billing:** Monthly + annual (10% off), switchable. New Free users follow real subscription logic. Protected test accounts resist downgrade.

---

## Phase 11 — Mobile-First Premium UX
- Bottom navigation, tap targets, loading skeletons, empty states
- Profile switching, faster dashboard interactions
- Better iPad/tablet + desktop layout
- No overlapping buttons, no horizontal overflow

---

## Phase 12 — Admin & Enterprise
**Admin:** User/account overview, plan override switcher, subscription monitor, shop orders, custom design orders, manufacturing status, supplier costs, revenue/margin tracking, device inventory, activated/unassigned/lost devices, analytics overview

**Future Enterprise:** White label, advanced security, team dashboard, multi-location, role permissions, AI insights, global expansion

---

## Mockup Checklist (Before Implementation)

| # | Screen | Status |
|---|--------|--------|
| 1 | Landing Page | 🎨 Mockup ready |
| 2 | Home Dashboard | 🎨 Mockup ready |
| 3 | My Profiles | 🎨 Mockup ready |
| 4 | Profile Studio | 🎨 Mockup ready |
| 5 | NFC Operating Center | 🎨 Mockup ready |
| 6 | QR & Wallet Center | 🎨 Mockup ready |
| 7 | Leads CRM | 🎨 Mockup ready |
| 8 | Appointments | 🎨 Mockup ready |
| 9 | Analytics | 🎨 Mockup ready |
| 10 | Shop | 🎨 Mockup ready |
| 11 | Business Design Studio | 🎨 Mockup ready |
| 12 | Admin Manufacturing Orders | 🎨 Mockup ready |

**Mockups location:** `/bingoo-2-mockups` route in the app (visual preview page, no functional logic).

---

## Summary

| Area | Status |
|------|--------|
| Backlog location | `BINGOO_2_BACKLOG.md` (project root) |
| Mockups location | `/bingoo-2-mockups` route |
| Already achieved | Platform, subscriptions, wallet, profile/QR UX, NFC/shop direction |
| Remains | All 12 phases (implementation not started) |
| Mockups before coding | 12 screens — all mocked up, ready for review |