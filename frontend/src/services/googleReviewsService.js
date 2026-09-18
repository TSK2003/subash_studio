/**
 * Client-side service for Google Business Profile Reviews API.
 * Calls only the secure backend endpoints without exposing any credentials.
 */
import api from "../lib/api.js";

export async function fetchGoogleIntegrationStatus() {
  try {
    return await api.get("/api/google-reviews/status");
  } catch (err) {
    return {
      configured: false,
      connected: false,
      status: "NOT_CONFIGURED",
      message: err.message || "Could not reach Google Reviews API service.",
    };
  }
}

export async function getGoogleOAuthUrl() {
  const data = await api.get("/api/google-reviews/url");
  return data.url;
}

export async function disconnectGoogleAccount() {
  return await api.post("/api/google-reviews/disconnect");
}

export async function fetchGoogleReviewsFromApi() {
  return await api.get("/api/google-reviews");
}
