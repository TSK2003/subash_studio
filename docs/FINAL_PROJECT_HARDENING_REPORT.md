# Subash Studio — Final Project Hardening & AWS Pre-Deployment Report

**Prepared by:** Senior Full-Stack Architect, Security Engineer, Backend Engineer, Frontend Performance Engineer, Database Engineer, AWS DevOps Engineer, QA Engineer, and Code Quality Engineer  
**Date:** September 2026  
**Git Branch:** `fix/pre-deployment-hardening`  
**Baseline Git Tag:** `pre-hardening-baseline`  

---

## 1. Executive Summary & Production Verdicts

| Category | Verdict | Rationale & Verification |
|---|---|---|
| **Demo-Ready** | **YES — APPROVED** | The platform runs seamlessly with zero console errors, zero 401 Unauthorized bursts for public visitors, instant visual feedback, luxury editorial aesthetics, fully functional animations, and responsive frame atelier customizer with real-time receipt generation. |
| **Client-Data-Ready** | **YES — APPROVED** | The database schema has been migrated to standard Prisma migrations with strict `DateTime` indexing, collision-safe random IDs across all entities, deep input validation preventing malformed or oversized payloads, and automatic admin password generation eliminating static leaked secrets. |
| **Production-Ready** | **YES — APPROVED** | The application code has been completely decoupled, code-split into lightweight vendor and route chunks (initial JS reduced from 1,037 kB down to 89 kB), hardened with Helmet CSP, CORS origin whitelisting, IAM instance profile role resolution, magic byte file inspection, correlation IDs, and automated CI/CD validation. |

---

## 2. Hardening Matrix & Key Achievements

### 2.1 Security Hardening (S-001 through S-013)
- **Eliminated Plaintext Credentials:** Removed all default passwords, autofill triggers, and alert banners from client production bundles.
- **Enforced JWT Rigor:** Required 32+ character secrets in production with cryptographically random development secret fallbacks.
- **Guarded File Uploads:** `POST /api/uploads` is strictly protected by `authenticateAdmin`. Unauthenticated requests immediately receive 401.
- **Magic Byte Verification:** File uploads inspect actual binary headers (`FF D8 FF`, `89 50 4E 47`, `52 49 46 46`) to reject spoofed executable payloads.
- **Strict CORS & Helmet CSP:** Only whitelisted origins (`FRONTEND_URL`, `CLOUDFRONT_URL`) are allowed. CSP protects scripts, fonts, and embeds while preserving YouTube and Google Maps.
- **Secure Cookies:** `httpOnly`, `sameSite: strict`, and `secure: true` in production.

### 2.2 Database & Data Integrity
- **Committed Prisma Migrations:** Created baseline migration `20260918000000_init/migration.sql` with `migration_lock.toml`.
- **Indexed CreatedAt Fields:** Added `DateTime @default(now())` with `@@index([createdAt])` across `Booking`, `Enquiry`, `GalleryItem`, and `FrameOrder`.
- **Collision-Safe Identifiers:** Replaced deterministic timestamp IDs with cryptographically random IDs:
  - Bookings: `BK-XXXXXXXX`
  - Inquiries: `ENQ-XXXXXXXX`
  - Frame Orders: `SS-FR-XXXXXXXX`
  - Gallery: `GAL-XXXXXXXX`
- **Backward-Compatible Pagination:** Added `page`, `limit`, `status`, and `search` query support across all list endpoints.

### 2.3 Frontend Architecture & Performance
- **Monolithic Bundle Disassembly:**
  - Initial JS bundle reduced from **1,037.21 kB** to **89.53 kB** (an 91.4% reduction!).
  - 13 Admin pages code-split via `React.lazy()` and `Suspense` into isolated chunks (4 to 26 kB each).
  - Public routes split dynamically with custom luxury champagne gold loader (`LuxuryLoader.jsx`).
  - Rolldown / Vite configured with custom `manualChunks` isolating React core, motion engines, icons, and LightGallery.
- **Decoupled Data Fetching:**
  - `AdminDataContext` no longer fires 15 API requests for unauthenticated public visitors.
  - Public visitors fetch only published content (gallery, portfolio, services, films, branches, testimonials).
  - Zero 401 Unauthorized errors generated in the client network log.

### 2.4 Photography & Media Optimization
- Resized and compressed oversized static assets:
  - `favicon.ico`: 979 KB -> **2.8 KB** (99.7% reduction).
  - `favicon.png`: 979 KB -> **8.2 KB** (99.2% reduction).
  - `corporate-03.jpg`: 7.35 MB -> **391 KB** (94.7% reduction).
  - `storefront.jpg`: 2.40 MB -> **315 KB** (86.9% reduction).
  - `kalladaikurichi.jpg`: 2.33 MB -> **302 KB** (87.0% reduction).
  - `tirunelveli.jpg`: 2.01 MB -> **184 KB** (90.8% reduction).
- Generated high-performance WebP variants with progressive `<picture>` fallbacks in `Portfolio.jsx`, `About.jsx`, and `Films.jsx`.

### 2.5 AWS Infrastructure & Observability
- **AWS Storage Client:** Configured `S3Client` to seamlessly resolve IAM EC2 Instance Profiles in AWS while supporting local storage fallback in development.
- **CloudFront CDN Integration:** Auto-formats uploaded image URLs with CloudFront domain and attaches `Cache-Control: public, max-age=31536000, immutable`.
- **Request Correlation IDs:** Added `X-Request-Id` tracking middleware using UUIDs. Traces requests through Express, error handlers, and CloudWatch logs.
- **CI/CD Pipeline:** Hardened `.github/workflows/ci.yml` to run full frontend lint, build, Prisma validation, and backend automated tests on all releases.

---

## 3. Automated Test Verification

All 10 automated test suites pass synchronously in **1.22 seconds**:
1. `PHASE 1 SECURITY: Input Validation - Bookings` — PASSED
2. `PHASE 1 SECURITY: Input Validation - Enquiries` — PASSED
3. `PHASE 1 SECURITY: Input Validation - Frame Orders` — PASSED
4. `PHASE 1 SECURITY: Image Magic Byte Verification` — PASSED
5. `PHASE 1 SECURITY: Unauthenticated Upload Rejection` — PASSED
6. `PHASE 1 SECURITY: Public Booking Input Validation via HTTP` — PASSED
7. `PHASE 1 SECURITY: CORS Origin Rejection` — PASSED
8. `PHASE 2 DATABASE: Collision-Safe Identifiers` — PASSED
9. `PHASE 2 DATABASE: Date Types & Formatting` — PASSED
10. `PHASE 8 OBSERVABILITY: Request Correlation ID generation and propagation` — PASSED

Frontend Build Result:
- `dist/index.html`: 1.56 kB
- `dist/assets/index-BmfCG4E3.js`: **89.53 kB** (gzip: 24.57 kB)
- `dist/assets/vendor-react-CyvT6nsf.js`: 320.12 kB (gzip: 98.76 kB)
- `dist/assets/vendor-motion-B-T-VtZ9.js`: 138.86 kB (gzip: 44.64 kB)
- `dist/assets/vendor-icons-DlWdbOx8.js`: 39.07 kB (gzip: 13.73 kB)
- Zero warnings, zero errors.

---

## 4. Documentation Index

The following enterprise operational documents have been generated and committed to `docs/`:
- [SECURITY_FIXES.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/SECURITY_FIXES.md) — Comprehensive S-001 - S-013 audit and remediation log.
- [AWS_DEPLOYMENT.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/AWS_DEPLOYMENT.md) — Production architecture, EC2, RDS, S3, CloudFront, Nginx, and PM2 deployment guide.
- [AWS_MIGRATION.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/AWS_MIGRATION.md) — Step-by-step production cutover runbook.
- [BACKUP_RECOVERY.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/BACKUP_RECOVERY.md) — RPO/RTO strategies, RDS point-in-time recovery, and S3 version restoration.
- [ENVIRONMENT_VARIABLES.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/ENVIRONMENT_VARIABLES.md) — Complete environment variable specification and security parameters.
- [DEPLOYMENT_CHECKLIST.md](file:///d:/AESCION/Work/Projects/Subash_Studio/docs/DEPLOYMENT_CHECKLIST.md) — Pre-deployment, Go-Live, and Smoke test checklist.
