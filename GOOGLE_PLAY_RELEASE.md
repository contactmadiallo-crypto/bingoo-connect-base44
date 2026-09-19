# Bingoo Connect — New Google Play Release

## Release identity
- Existing Google Play app package: `com.bingooconnect.app`
- This is an UPDATE of the existing listing, not a second Play Store app.
- Proposed release name: `2.0.0`
- Proposed versionCode: `2` **only if the highest code already in Play Console is 1**.
- Production domain: `https://bingooconnect.com`
- Android target/compile SDK: 36

## Critical rule before upload
Open **Play Console → Bingoo Connect → App bundle explorer** and note the highest version code ever uploaded.
Set `BINGOO_VERSION_CODE` in `android/gradle.properties` to a number greater than that value.

Do not change the applicationId. Keeping `com.bingooconnect.app` is what makes this release update the existing Bingoo Connect app.

## Signing
The release AAB must be signed with the upload key accepted by the existing Play Console app (or a Play-approved reset upload key). A newly generated unrelated key cannot update the old listing.

## Release build
1. Install JDK 21 and Android SDK 36 in the build environment.
2. `npm ci`
3. `npm run android:sync`
4. Configure release signing without committing passwords/private keystores.
5. `npm run android:bundle`
6. Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Mandatory release QA
- Fresh install and update-over-old-version install
- Register, login, logout, password reset, auth callback
- Public profile `/p/:username`
- NFC `/d/BG-######`: unclaimed, profile, asset, lost/recovery
- Device activation and assignment
- Shop → Stripe → paid confirmation → My Orders
- Design Studio → cart → checkout → frozen production design
- Google Wallet
- File/image upload and download
- Android back navigation and external links
- App Links from `https://bingooconnect.com`
- Offline/reconnect behavior
- Account settings and account-deletion request
- Privacy/Terms/Data Deletion public pages

## Play Console rollout checklist
- Upload first to Internal testing.
- Resolve every pre-launch report blocker.
- Complete Data Safety using the behavior of the release build.
- Confirm privacy-policy URL and account-deletion URL.
- Complete App access/reviewer instructions for authenticated features.
- Complete content rating, ads declaration, target audience and store listing.
- Replace final screenshots only after the UI release candidate is frozen.
- Promote to production with a staged rollout after internal/closed testing.

## Current engineering gates
- Web production build passes.
- Android project exists and is configured for API 36.
- Android App Links are configured for `bingooconnect.com`.
- The Base44 sandbox currently has no Java runtime, so it cannot compile the AAB here.
- Production dependency audit still needs remediation/review before rollout.
- Existing project-wide typecheck contains legacy errors and is not currently a clean release gate.
- Existing web-push implementation must not be assumed to provide native Android push behavior.
