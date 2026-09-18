# Security Hardening & Remediation Log

**Project:** Subash Studio Photography Web Platform  
**Classification:** Enterprise Hardening & AWS Pre-Deployment Audit  
**Date:** September 2026  
**Status:** All Critical & High Vulnerabilities Remediated  

---

## Executive Summary

During the pre-deployment security review of the Subash Studio photography platform, 13 distinct security concerns (S-001 to S-013) were audited, addressed, and verified with automated test suites. The platform is now fully hardened against credential leakage, unauthenticated file uploads, MIME-type spoofing, cross-origin tampering, unauthorized CORS origins, and insecure session management.

---

## Detailed Vulnerability Remediation Matrix

### S-001: Plaintext Admin Credentials & Client Autofill Removal
- **Severity:** Critical
- **Issue:** Frontend bundle contained hardcoded default admin credentials in `AdminAuthContext.jsx` and `AdminLogin.jsx` (`subash@2026`), with autofill buttons exposing secrets in client production builds.
- **Remediation:**
  - Completely purged `getStoredCredentials()` and default fallback passwords from [AdminAuthContext.jsx](file:///d:/AESCION/Work/Projects/Subash_Studio/frontend/src/admin/context/AdminAuthContext.jsx).
  - Stripped out demo credentials UI, buttons, and alert callouts from [AdminLogin.jsx](file:///d:/AESCION/Work/Projects/Subash_Studio/frontend/src/admin/pages/AdminLogin.jsx).
  - Production bundles now contain zero hardcoded authentication credentials.

### S-002: JWT Secret Enforcement & Randomization
- **Severity:** Critical
- **Issue:** Backend permitted fallback to weak static development secrets (`subash-super-secret-jwt-key-2026`) when `JWT_SECRET` was absent in production.
- **Remediation:**
  - Updated [env.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/config/env.js) to enforce `JWT_SECRET` presence and minimum 32-character complexity in `production`.
  - In development/test mode without an explicit secret, generates a cryptographically random one-time key (`crypto.randomBytes(32).toString('hex')`) with a loud console warning.

### S-003: Unauthenticated File Upload Endpoint Protection
- **Severity:** Critical
- **Issue:** `POST /api/uploads` was publicly exposed without authentication, allowing arbitrary unauthenticated users to upload files to server storage.
- **Remediation:**
  - Applied `authenticateAdmin` middleware to [uploadRoutes.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/routes/uploadRoutes.js).
  - Unauthenticated requests receive immediate `401 Unauthorized` responses. Verified via automated test `tests/phase1_security.test.js`.

### S-004: Database Seeding Hardcoded Password Sanitization
- **Severity:** High
- **Issue:** `seedService.js` automatically created an admin account with a static hardcoded password if none existed.
- **Remediation:**
  - [seedService.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/services/seedService.js) now checks `process.env.INITIAL_ADMIN_PASSWORD`.
  - If unset, generates a cryptographically random 16-character secret at boot, logs it once to the secure console, and never persists static default credentials in the repository.

### S-005: Deep Input Validation & Sanitization
- **Severity:** High
- **Issue:** Missing schema validation allowed empty, malformed, or excessively long payloads to be inserted directly into database tables.
- **Remediation:**
  - Implemented centralized [validation.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/middleware/validation.js) middleware.
  - Enforced strict validation for Bookings, Inquiries, Frame Orders, and Authentication payloads. Rejects non-Indian phone formats, malformed emails, invalid dates, and oversized strings before touching controllers or Prisma.

### S-006: CORS Origin Whitelisting
- **Severity:** High
- **Issue:** Overly permissive CORS configurations permitted cross-origin requests from arbitrary unauthorized domains.
- **Remediation:**
  - Explicitly configured origin allowlist in [app.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/app.js) restricted to `ENV.FRONTEND_URL`, `ENV.CLOUDFRONT_URL`, and authorized local dev ports.
  - Unauthorized origins receive standard CORS rejections without crashing the process.

### S-007: Content Security Policy (CSP)
- **Severity:** High
- **Issue:** Absence of fine-grained CSP left clients vulnerable to Cross-Site Scripting (XSS).
- **Remediation:**
  - Configured Helmet CSP in [app.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/app.js) with strict policies:
    - Scripts: `'self'`
    - Styles: `'self'`, Google Fonts
    - Fonts: `'self'`, Google Fonts (`fonts.gstatic.com`)
    - Images/Media: `'self'`, CloudFront CDN, S3, data URIs
    - Frames: YouTube showreel embeds and Google Maps embeds

### S-008: Rate Limiting on Authentication & Public Forms
- **Severity:** Medium
- **Issue:** Lack of rate limiting on sensitive endpoints permitted brute-force credential stuffing and form spam.
- **Remediation:**
  - Configured `express-rate-limit` in [rateLimiter.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/middleware/rateLimiter.js).
  - General endpoints limited to 300 req / 15 min; sensitive auth endpoints restricted to strict thresholds.

### S-009: Secure Cookie Configuration
- **Severity:** Medium
- **Issue:** Authentication cookies lacked strict `httpOnly`, `sameSite`, and `secure` flags.
- **Remediation:**
  - Set `httpOnly: true`, `sameSite: "strict"`, and `secure: ENV.NODE_ENV === "production"` in [authController.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/controllers/authController.js).

### S-010: Error Message Sanitization
- **Severity:** Medium
- **Issue:** Internal database exceptions and stack traces were returned to clients in error payloads.
- **Remediation:**
  - Hardened [errorHandler.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/middleware/errorHandler.js) to suppress stack traces and return generic errors in production while logging stack traces with request correlation IDs server-side.

### S-011: Reverse Proxy & Trust Proxy Hardening
- **Severity:** Low
- **Issue:** Express `trust proxy` setting was unconfigured, leading to incorrect client IP detection under AWS ALB / CloudFront.
- **Remediation:**
  - Added `app.set("trust proxy", 1)` in [app.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/app.js).

### S-012: Magic Byte File Inspection & MIME Validation
- **Severity:** High
- **Issue:** File uploads relied solely on client-provided `file.mimetype` headers, allowing malicious executable scripts or polyglot files to be uploaded with spoofed extensions.
- **Remediation:**
  - Added `verifyImageMagicBytes(buffer)` in [storage.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/utils/storage.js).
  - Inspects file byte signatures (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `52 49 46 46` for WEBP) before storing to local disk or S3.

### S-013: IAM Role-Based S3 Access & CloudFront CDN
- **Severity:** High
- **Issue:** S3 integration required static long-lived AWS IAM access keys in `.env`.
- **Remediation:**
  - Configured `S3Client` in [storage.js](file:///d:/AESCION/Work/Projects/Subash_Studio/backend/src/utils/storage.js) to leverage AWS SDK default credential provider chain (EC2 IAM Instance Profile) with fallback to environment variables.
  - Uploaded photography assets receive explicit `Cache-Control: public, max-age=31536000, immutable` headers and CloudFront domain formatting.
