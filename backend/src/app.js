import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";

import ENV from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, centralizedErrorHandler } from "./middleware/errorHandler.js";

const app = express();

// Trust reverse proxies (AWS CloudFront / ALB / EC2 Nginx)
app.set("trust proxy", 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Managed by CloudFront or custom Nginx if needed
  })
);

// Strict CORS
const allowedOrigins = [
  ENV.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || ENV.NODE_ENV === "development") {
        return callback(null, true);
      }
      callback(new Error(`CORS origin '${origin}' not allowed.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Standard parsers
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate Limiting
app.use("/api", generalLimiter);

// Serve static local uploads if present
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
