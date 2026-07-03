import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called by entity automation when a Profile is created/updated.
// Pings Google's URL Inspection API to request re-indexing of the profile page.
// Falls back gracefully if GOOGLE_INDEXING_KEY is not set.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check — automation calls run as service role (authenticated).
    // Direct anonymous HTTP calls must validate the profile exists.
    const caller = await base44.auth.me();
    const isAuthed = caller || await base44.auth.isAuthenticated();

    const body = await req.json().catch(() => ({}));

    // Called from automation payload: { event, data }
    const profileData = body.data || body;
    const username = profileData?.username;

    if (!username) {
      console.log("[notifyGoogleIndex] No username in payload, skipping.");
      return Response.json({ ok: true, skipped: true });
    }

    // For unauthenticated direct calls, verify the profile exists to prevent
    // arbitrary URL submission abuse via this endpoint.
    if (!isAuthed) {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ username, is_active: true }, '-updated_date', 1);
      if (!profiles?.length) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const profileUrl = `https://bingooconnect.com/p/${username}`;
    console.log(`[notifyGoogleIndex] Requesting indexing for: ${profileUrl}`);

    const googleKey = Deno.env.get("GOOGLE_INDEXING_KEY");

    if (!googleKey) {
      // No key configured — still ping Bing/IndexNow as a free fallback
      console.log("[notifyGoogleIndex] No GOOGLE_INDEXING_KEY set, trying IndexNow fallback.");
      try {
        const indexNowRes = await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(profileUrl)}&key=bingooconnect`, {
          method: "GET",
        });
        console.log(`[notifyGoogleIndex] IndexNow response: ${indexNowRes.status}`);
      } catch (e) {
        console.log("[notifyGoogleIndex] IndexNow ping failed:", e.message);
      }
      return Response.json({ ok: true, method: "indexnow_fallback" });
    }

    // Use Google Indexing API (requires service account key JSON in GOOGLE_INDEXING_KEY)
    // Parse the service account key
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(googleKey);
    } catch (e) {
      console.error("[notifyGoogleIndex] Failed to parse GOOGLE_INDEXING_KEY:", e.message);
      return Response.json({ ok: false, error: "Invalid GOOGLE_INDEXING_KEY format" });
    }

    // Create a JWT for Google API authentication
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }));

    // Sign with the private key using Web Crypto
    const privateKeyPem = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\n/g, "");

    const keyData = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8", keyData.buffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["sign"]
    );

    const signingInput = `${header}.${payload}`;
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5", cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const jwt = `${signingInput}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`;

    // Exchange JWT for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[notifyGoogleIndex] Failed to get access token:", JSON.stringify(tokenData));
      return Response.json({ ok: false, error: "Token exchange failed" });
    }

    // Submit URL for indexing
    const indexRes = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: profileUrl, type: "URL_UPDATED" }),
    });

    const indexData = await indexRes.json();
    console.log(`[notifyGoogleIndex] Google Indexing API response for ${profileUrl}:`, JSON.stringify(indexData));

    return Response.json({ ok: true, method: "google_indexing_api", response: indexData });
  } catch (error) {
    console.error("[notifyGoogleIndex] Error:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});