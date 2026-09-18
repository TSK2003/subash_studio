import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "subash_studio_jwt_secret_development_key_2026",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback",
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || "",
  GOOGLE_BUSINESS_ACCOUNT_ID: process.env.GOOGLE_BUSINESS_ACCOUNT_ID || "",
  GOOGLE_BUSINESS_LOCATION_ID: process.env.GOOGLE_BUSINESS_LOCATION_ID || "",

  // AWS S3
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
};

export default ENV;
