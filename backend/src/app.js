import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

import ENV from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, centralizedErrorHandler } from "./middleware/errorHandler.js";

const app = express();

// Trust reverse proxies (AWS CloudFront / ALB / EC2 Nginx)
app.set("trust proxy", 1);

// Correlation ID & Request Tracking (AWS CloudWatch Observability)
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

// Security Headers with custom CSP that preserves all photography and media requirements
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        mediaSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        frameSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://youtube.com",
          "https://www.youtube-nocookie.com",
          "https://player.vimeo.com",
          "https://vimeo.com",
          "https://www.google.com",
          "https://maps.google.com",
        ],
        connectSrc: ["'self'", "https:", "http:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true,
  })
);

// Strict CORS: configure explicit allowed origins for Dev, Demo, and Production
const configuredOrigins = (ENV.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    ...configuredOrigins,
    ENV.CLOUDFRONT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://13.201.4.62",
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ""))
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl, same-origin)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow requests matching server public IP, SSL hostnames, or localhost
      if (/^https?:\/\/(localhost|127\.0\.0\.1|13\.201\.4\.62|.*\.sslip\.io|.*\.nip\.io)(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      if (ENV.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Reject unauthorized origins without crashing the server
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Request-Id"],
  })
);

// Request parsing with safe payload limits
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate Limiting on API endpoints
app.use("/api", generalLimiter);

// Serve static local uploads if present (development / fallback)
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Mount REST API
app.use("/api", apiRoutes);

// Fallback & Error handling
app.use(notFoundHandler);
app.use(centralizedErrorHandler);

export default app;
