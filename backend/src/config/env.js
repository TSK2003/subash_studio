import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const DEV_FALLBACK_SECRET = "subash_studio_dev_jwt_secret_insecure_development_only_2026";

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (isProduction) {
    if (!secret || secret === DEV_FALLBACK_SECRET || secret.length < 32) {
      console.error(
        "[FATAL SECURITY ERROR] In production, JWT_SECRET must be set in environment variables and be at least 32 characters long."
      );
      process.exit(1);
    }
    return secret;
  }
  return secret || DEV_FALLBACK_SECRET;
}

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: resolveJwtSecret(),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Initial Admin Setup (Never hardcode production credentials in source)
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL || "subashstudio009@gmail.com",
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || "",

  // Google OAuth & Business Profile
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || "",
  GOOGLE_BUSINESS_ACCOUNT_ID: process.env.GOOGLE_BUSINESS_ACCOUNT_ID || "",
  GOOGLE_BUSINESS_LOCATION_ID: process.env.GOOGLE_BUSINESS_LOCATION_ID || "",

  // AWS S3 & CloudFront CDN
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  CLOUDFRONT_URL: (process.env.CLOUDFRONT_URL || "").replace(/\/+$/, ""),
};

export default ENV;
