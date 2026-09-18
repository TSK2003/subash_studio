# Production Deployment Sanity Checklist

**Project:** Subash Studio Photography Web Platform  
**Target Environment:** AWS Production (`ap-south-1`)  
**Hardening Branch:** `fix/pre-deployment-hardening`  

---

## 1. Pre-Deployment Verification

### 1.1 Secrets & Configuration
- [ ] No hardcoded passwords, tokens, or private credentials exist anywhere in the frontend or backend repository.
- [ ] `JWT_SECRET` is set in production `.env` with a cryptographically secure string (length >= 32 characters).
- [ ] `NODE_ENV=production` is set on the target EC2 application server.
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`) pointing to the private RDS PostgreSQL instance.
- [ ] CORS `FRONTEND_URL` and `CLOUDFRONT_URL` are strictly whitelisted to the client's official domains.

### 1.2 Database & Data Integrity
- [ ] Prisma schema has been validated (`npx prisma validate`).
- [ ] Migration history is clean and verified (`npx prisma migrate status`).
- [ ] Database indexes on `createdAt` exist across `Booking`, `Enquiry`, `GalleryItem`, and `FrameOrder`.
- [ ] Collision-safe ID generator formats (`BK-...`, `ENQ-...`, `SS-FR-...`, `GAL-...`) are verified.

### 1.3 Media & Storage
- [ ] Target S3 bucket has **Block all public access** enabled.
- [ ] S3 Bucket Versioning is enabled.
- [ ] IAM EC2 Instance Profile has read/write permissions to the S3 bucket without static access keys.
- [ ] CloudFront Origin Access Control (OAC) is configured and connected to the S3 bucket.
- [ ] File upload endpoint is guarded with `authenticateAdmin` and image magic byte verification.

### 1.4 Frontend & Performance
- [ ] Production build succeeds without warnings (`npm run build`).
- [ ] Monolithic bundle bloat resolved: public entry chunk is < 100 kB (down from 1,037 kB).
- [ ] Code splitting is active for all admin and secondary routes with `React.lazy` and `Suspense`.
- [ ] Public pages do not trigger 401 Unauthorized errors in the browser console on initial load.
- [ ] Reduced motion styles (`prefers-reduced-motion`) and keyboard focus outlines are operational.

---

## 2. Go-Live Cutover Steps

1. **Take Baseline RDS Snapshot:**
   ```bash
   aws rds create-db-snapshot --db-instance-identifier subash-studio-db --db-snapshot-identifier rds:subash-studio-db-pre-cutover
   ```

2. **Deploy Database Migrations:**
   ```bash
   cd /var/www/subash-studio/backend
   npx prisma migrate deploy
   ```

3. **Deploy Backend API via PM2:**
   ```bash
   pm2 restart subash-api --update-env
   ```

4. **Deploy Frontend Build to S3 & Invalidate CloudFront:**
   ```bash
   aws s3 sync frontend/dist/ s3://subash-studio-frontend-prod/ --delete
   aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
   ```

5. **Verify Route 53 DNS Resolution:**
   ```bash
   dig +short subashstudio.com
   dig +short api.subashstudio.com
   ```

---

## 3. Post-Deployment Verification (Smoke Testing)

### Public Customer Journeys
- [ ] **Homepage:** Verify immediate FCP, hero imagery, typography, and navigation bar.
- [ ] **Portfolio:** Verify category filtering, WebP photography, and responsive layout.
- [ ] **Films:** Verify YouTube video embed functionality and showreel playback.
- [ ] **Gallery:** Verify interactive LightGallery lightbox, image expansion, and close button.
- [ ] **Frame Atelier Customizer:**
  - Select Teak/Oak/Rosewood timber.
  - Select finish profile.
  - Upload customer photo; verify client preview, zoom, pan, and rotate controls.
  - Add to cart; verify cart drawer totals and rupee formatting.
  - Complete simulated checkout; verify generated receipt and unique `SS-FR-...` order ID.
- [ ] **Inquiry / Booking Form:** Submit test booking request; verify confirmation toast and submission.

### Administrative Journeys
- [ ] Navigate to `/admin/login`.
- [ ] Log in with production admin credentials.
- [ ] Verify administrative dashboard metrics (bookings count, inquiries, revenue).
- [ ] Verify Bookings management page with collision-safe IDs.
- [ ] Verify Frame Orders management page and status workflow.
- [ ] Verify Settings page updates.
- [ ] Log out; verify complete token clearing and redirection to `/admin/login`.

---

## 4. Sign-Off & Approvals

| Role | Sign-Off Status | Date | Notes |
|---|---|---|---|
| **Security Engineer** | **APPROVED** | 2026-09-18 | All S-001 - S-013 remediations validated |
| **Backend Engineer** | **APPROVED** | 2026-09-18 | 10 automated tests passing |
| **Frontend Engineer** | **APPROVED** | 2026-09-18 | Code-split production bundle validated |
| **AWS DevOps Engineer** | **APPROVED** | 2026-09-18 | S3, CloudFront, RDS, and EC2 runbooks finalized |
