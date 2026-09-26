# Bingoo Connect — New Google Play Release

## Release identity
- Existing Google Play app package: `com.bingooconnect.app`
- This is an UPDATE of the existing listing, not a second Play Store app.
- Next update release name: `1.1.0`
- Next update versionCode: `2` (the first `1.0.0` / code `1` bundle has already been submitted to Google Play and is under review).
- Production domain: `https://bingooconnect.com`
- Android target/compile SDK: 36

## Critical rule before upload
The first uploaded bundle used `versionCode=1`. The next Play upload must use a greater code; this release is configured as `BINGOO_VERSION_CODE=2` and `BINGOO_VERSION_NAME=1.1.0`. Before any later upload, compare against Play Console > App bundle explorer and increment again.

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
- Shop → Stripe → verified HTTPS App Link return → paid confirmation → My Orders
- Stripe cancel → verified HTTPS App Link return to cart
- Design Studio → cart → checkout → frozen production design
- Google Wallet generation, Save to Google Wallet handoff, and canonical `bingooconnect.com/p/:username` QR/profile link
- Camera QR scan permission grant, denial, retry, and successful scan
- Voice recorder microphone permission grant/denial
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
- Production lint is clean (0 errors / 0 warnings in the shipping lint scope).
- Project typecheck is clean.
- Production smoke/security checks pass.
- Capacitor Android sync passes.
- Android release is configured as `1.1.0` / versionCode `2`.
- CAMERA and RECORD_AUDIO permissions are declared for QR scanning and voice recording.
- Existing web-push implementation must not be assumed to provide native Android push behavior.
