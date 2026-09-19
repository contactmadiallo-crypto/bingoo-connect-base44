# Bingoo Connect — Google Play Data Safety Working Declaration

This document is a release checklist, not a substitute for answering Play Console from the actual production behavior.

## App identity
- Package: com.bingooconnect.app
- Release: 1.0.0 (versionCode 1)
- Production domain: https://bingooconnect.com
- Public deletion page: https://bingooconnect.com/data-deletion
- Privacy policy: https://bingooconnect.com/privacy-policy

## Data categories to review/declare in Play Console
Bingoo features can process the following categories when users provide/use them:
- Account/contact information: name, email, phone.
- User-generated profile/business content and uploaded images/logos.
- NFC/device identifiers and assignment state.
- Asset/lost-and-found information supplied by users.
- Leads, appointments and interaction/activity records.
- Orders, shipping/fulfillment information and purchase history.
- Payment processing is handed to Stripe; Bingoo should not claim to store full card numbers.
- Push notification identifiers/settings when notifications are enabled.
- Documents/files only where the user chooses document/file features.

For each category, confirm in Play Console whether it is collected, shared, required/optional, ephemeral, and the purpose (app functionality, account management, analytics, fraud/security, communications, etc.). Do not declare a category solely from this checklist without checking production behavior and enabled integrations.

## Deletion
- Authenticated users can request account deletion from Account Settings.
- Public deletion/privacy requests are available at /data-deletion.
- Requests are persisted in PrivacyRequest with verification state.
- Unauthenticated public requests require identity verification before processing.
- Policy states profile/personal data deletion within 30 days, subject to legal/security/billing retention.

## Security
- HTTPS only in Android package; cleartext traffic disabled.
- Android backup disabled for app data.
- Stripe handles payment card data.
- Release keystore/passwords must not be committed.

## Final Play Console verification
- Data Safety answers must match this release build and every enabled third-party SDK.
- Privacy Policy and Data Deletion URLs must be publicly reachable without login.
- App Access must include reviewer instructions for authenticated features.
- Confirm Ads declaration, target audience, content rating, financial/payment declarations and any health/location declarations based on actual app features.
