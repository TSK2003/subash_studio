import fs from "node:fs";
import path from "node:path";

/**
 * Server-side Google Business Profile Reviews Service.
 *
 * Handles:
 * 1. OAuth 2.0 URL creation and token exchange
 * 2. Secure server-side token storage (never exposed to browser)
 * 3. Fetching Google Business Profile accounts & locations
 * 4. Fetching official reviews from the Google Business Profile Reviews API
 * 5. Normalizing reviews into Subash Studio testimonial schema
 * 6. Graceful fallbacks and human-readable error messages
 *
 * Future enhancement note:
 * Google Business Profile Notifications API (Cloud Pub/Sub webhooks) can be added
 * here to stream newly posted reviews in real time.
 */

const TOKEN_FILE_PATH = path.resolve(process.cwd(), ".google_token.json");

// Cache access token in memory with expiry to minimize OAuth calls
let memoryAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Reads the server-side refresh token from environment or local server file.
 * Returns null if not configured or not authorized yet.
 */
export function getServerRefreshToken() {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return process.env.GOOGLE_REFRESH_TOKEN.trim();
  }

  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const content = fs.readFileSync(TOKEN_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      return parsed.refresh_token || null;
    }
  } catch (err) {
    console.error("[GoogleBusinessProfile] Error reading server token file:", err.message);
  }

  return null;
}

/**
 * Stores refresh token securely on the server.
 */
export function saveServerRefreshToken(refreshToken, metadata = {}) {
  try {
    const dir = path.dirname(TOKEN_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload = {
      refresh_token: refreshToken,
      saved_at: new Date().toISOString(),
      account_id: metadata.accountId || null,
      location_id: metadata.locationId || null,
      business_name: metadata.businessName || "Subash Studio",
    };

    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[GoogleBusinessProfile] Error saving server token file:", err.message);
    return false;
  }
}

/**
 * Clears the stored server refresh token.
 */
export function clearServerRefreshToken() {
  memoryAccessToken = null;
  tokenExpiresAt = 0;
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      fs.unlinkSync(TOKEN_FILE_PATH);
    }
    return true;
  } catch (err) {
    console.error("[GoogleBusinessProfile] Error clearing server token file:", err.message);
    return false;
  }
}

/**
 * Checks server integration and connection status.
 */
export function getIntegrationStatus() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const isConfigured = Boolean(clientId && clientSecret);
  const refreshToken = getServerRefreshToken();
  const isConnected = Boolean(isConfigured && refreshToken);

  let metadata = null;
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      metadata = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf-8"));
    } catch {
      // ignore
    }
  }

  return {
    configured: isConfigured,
    connected: isConnected,
    status: !isConfigured ? "NOT_CONFIGURED" : !isConnected ? "NOT_CONNECTED" : "CONNECTED",
    businessName: metadata?.business_name || (isConnected ? "Subash Studio" : null),
    locationName: metadata?.location_name || metadata?.location_id || (isConnected ? "Tirunelveli / Kalladaikurichi" : null),
    lastSynced: metadata?.last_synced || null,
    message: !isConfigured
      ? "Google Business Profile API is not configured yet. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
      : !isConnected
      ? "Google Business Profile API credentials configured. Connect your Google account to start syncing reviews."
      : "Connected to Google Business Profile.",
  };
}

/**
 * Generates the OAuth 2.0 authorization URL for Admin to connect.
 */
export function getAuthorizationUrl(reqOrigin = "") {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (reqOrigin ? `${reqOrigin}/api/auth/google/callback` : "http://localhost:5173/api/auth/google/callback");

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in server environment.");
  }

  const scope = "https://www.googleapis.com/auth/business.manage";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges the authorization code received from Google for tokens.
 */
export async function handleOAuthCallback(code, reqOrigin = "") {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (reqOrigin ? `${reqOrigin}/api/auth/google/callback` : "http://localhost:5173/api/auth/google/callback");

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const desc = data.error_description || data.error || "Token exchange failed";
    throw new Error(`Google OAuth error: ${desc}`);
  }

  const refreshToken = data.refresh_token;
  if (!refreshToken) {
    const existing = getServerRefreshToken();
    if (!existing) {
      throw new Error(
        "Google did not return a refresh token. Please revoke Subash Studio app access in your Google Account security settings and reconnect with prompt=consent."
      );
    }
  } else {
    saveServerRefreshToken(refreshToken, { businessName: "Subash Studio" });
  }

  if (data.access_token) {
    memoryAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3500) * 1000;
  }

  return { success: true };
}

/**
 * Obtains a valid access token using the stored refresh token.
 */
async function getValidAccessToken() {
  if (memoryAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return memoryAccessToken;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = getServerRefreshToken();

  if (!clientId || !clientSecret) {
    throw new Error("Google API credentials are not configured.");
  }
  if (!refreshToken) {
    throw new Error("Google Business Profile authorization is required. Please connect your account first.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    if (response.status === 401 || data.error === "invalid_grant") {
      clearServerRefreshToken();
      throw new Error("Google authorization has expired or was revoked. Please reconnect your Google account.");
    }
    throw new Error(`Failed to refresh Google token: ${data.error_description || data.error}`);
  }

  memoryAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3500) * 1000;
  return memoryAccessToken;
}

/**
 * Normalizes Google star rating enum or number to 1-5 integer.
 */
function parseGoogleStarRating(starRating) {
  if (typeof starRating === "number") {
    return Math.max(1, Math.min(5, Math.round(starRating)));
  }
  const str = String(starRating || "").toUpperCase();
  const map = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
  };
  return map[str] || 5;
}

/**
 * Formats date into readable month & year (e.g. "August 2026").
 */
function formatReviewDate(isoDateStr) {
  if (!isoDateStr) {
    return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Recent";
  }
}

/**
 * Fetches Google Business Profile reviews from the authorized account & location.
 */
export async function fetchGoogleReviews() {
  const status = getIntegrationStatus();
  if (!status.configured) {
    return {
      status: "NOT_CONFIGURED",
      message: "Google Reviews integration is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      reviews: [],
    };
  }
  if (!status.connected) {
    return {
      status: "NOT_CONNECTED",
      message: "Google Business Profile authorization is required.",
      reviews: [],
    };
  }

  const accessToken = await getValidAccessToken();

  let accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  let locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;

  // 1. Resolve Account if not explicitly set
  if (!accountId) {
    const acctRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!acctRes.ok) {
      if (acctRes.status === 403) {
        throw new Error("You do not have permission to access this Business Profile account.");
      }
      if (acctRes.status === 429) {
        throw new Error("Google API quota has been reached. Please try again later.");
      }
      const errData = await acctRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Google API error (Status ${acctRes.status})`);
    }

    const acctData = await acctRes.json();
    const accounts = acctData.accounts || [];
    if (accounts.length === 0) {
      throw new Error("No Google Business Profile accounts found under this Google account.");
    }
    // accounts[0].name has format "accounts/{accountId}"
    accountId = accounts[0].name.replace("accounts/", "");
  }

  // 2. Resolve Location if not explicitly set
  if (!locationId) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storefrontAddress`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (locRes.ok) {
      const locData = await locRes.json();
      const locations = locData.locations || [];
      if (locations.length > 0) {
        // locations[0].name has format "locations/{locationId}"
        locationId = locations[0].name.replace("locations/", "");
      }
    }
  }

  if (!locationId) {
    throw new Error("The configured Google Business Profile location could not be found.");
  }

  // 3. Fetch Reviews from Google Business Profile Reviews API
  // Endpoint: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
  const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=50`;

  const revRes = await fetch(reviewsUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!revRes.ok) {
    if (revRes.status === 401) {
      clearServerRefreshToken();
      throw new Error("Google Business Profile authorization is required or expired. Please reconnect.");
    }
    if (revRes.status === 403) {
      throw new Error("You don't have permission to access reviews for this Business Profile location.");
    }
    if (revRes.status === 404) {
      throw new Error("The configured Google Business Profile location could not be found.");
    }
    if (revRes.status === 429) {
      throw new Error("Google API quota has been reached. Please try again later.");
    }
    const errData = await revRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch reviews from Google (Status ${revRes.status})`);
  }

  const data = await revRes.json();
  const rawReviews = data.reviews || [];

  // 4. Normalize reviews into Subash Studio testimonial structure
  const normalized = rawReviews.map((rev) => {
    const reviewId = rev.reviewId || String(Math.random()).slice(2, 10);
    const reviewerName = rev.reviewer?.displayName || "Google Reviewer";
    const reviewerPhoto = rev.reviewer?.profilePhotoUrl || null;
    const rating = parseGoogleStarRating(rev.starRating);
    const reviewText = rev.comment || "";
    const dateFormatted = formatReviewDate(rev.createTime);

    return {
      id: `google-${reviewId}`,
      source: "google",
      googleReviewId: reviewId,
      googleLocationName: locationId,
      googleReviewUrl: rev.reviewUrl || `https://search.google.com/local/reviews?placeid=${locationId}`,
      googleReviewerName: reviewerName,
      googleReviewerPhoto: reviewerPhoto,
      customerName: reviewerName,
      customerRole: "Google Review",
      customerImage: reviewerPhoto || "",
      rating: rating,
      eventType: "Google Review",
      category: "Google Review",
      review: reviewText,
      date: dateFormatted,
      approved: false, // Default to false so admin moderates first
      featured: false,
      hidden: false,
      syncStatus: "imported",
      googleCreateTime: rev.createTime || null,
      googleUpdateTime: rev.updateTime || null,
      googleReply: rev.reviewReply?.comment || null,
    };
  });

  // Update last synced metadata in token file
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const existing = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf-8"));
      existing.last_synced = new Date().toISOString();
      existing.total_reviews_synced = normalized.length;
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(existing, null, 2), "utf-8");
    }
  } catch {
    // ignore
  }

  return {
    status: "SUCCESS",
    totalReviews: normalized.length,
    averageRating: data.averageRating || 5.0,
    reviews: normalized,
  };
}
