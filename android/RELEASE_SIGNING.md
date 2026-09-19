# Bingoo Connect Android release signing

Never commit the keystore or passwords.

Provide these values as Gradle properties or environment variables:
- BINGOO_RELEASE_STORE_FILE
- BINGOO_RELEASE_STORE_PASSWORD
- BINGOO_RELEASE_KEY_ALIAS
- BINGOO_RELEASE_KEY_PASSWORD

Example local build:
BINGOO_RELEASE_STORE_FILE=/absolute/path/bingoo-upload.jks \
BINGOO_RELEASE_STORE_PASSWORD='***' \
BINGOO_RELEASE_KEY_ALIAS='bingoo-upload' \
BINGOO_RELEASE_KEY_PASSWORD='***' \
./gradlew bundleRelease

A Play-uploadable release must be signed. If this is the first bundle for the listing, enroll/use Play App Signing and securely retain the upload key.
