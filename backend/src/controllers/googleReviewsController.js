import {
  getIntegrationStatus,
  getAuthorizationUrl,
  handleOAuthCallback,
  clearServerRefreshToken,
  fetchGoogleReviews,
} from "../integrations/google/googleBusinessProfile.js";
import ENV from "../config/env.js";

export function getStatus(req, res) {
  const status = getIntegrationStatus();
  res.json(status);
}

export function getAuthUrl(req, res) {
  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const url = getAuthorizationUrl(origin);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function handleCallback(req, res) {
  const { code, error } = req.query;
  const frontendOrigin = ENV.FRONTEND_URL || "http://localhost:5173";

  if (error) {
    return res.redirect(`${frontendOrigin}/admin/testimonials?google_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendOrigin}/admin/testimonials?google_error=Missing+authorization+code`);
  }

  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    await handleOAuthCallback(code, origin);
    return res.redirect(`${frontendOrigin}/admin/testimonials?google_connected=1`);
  } catch (err) {
    return res.redirect(`${frontendOrigin}/admin/testimonials?google_error=${encodeURIComponent(err.message)}`);
  }
}

export function disconnect(req, res) {
  clearServerRefreshToken();
  res.json({ success: true, message: "Google Business Profile disconnected." });
}

export async function fetchReviews(req, res, next) {
  try {
    const result = await fetchGoogleReviews();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
