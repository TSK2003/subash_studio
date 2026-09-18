# AWS Production Migration Runbook

**Project:** Subash Studio Photography Web Platform  
**Target:** Live Production Migration to AWS `ap-south-1`  
**Execution Window:** Scheduled Maintenance Window (Zero-Downtime Capable)  

---

## 1. Migration Overview & Prerequisites

This runbook outlines the exact sequence to transition Subash Studio from local/audited state to AWS production.

### Pre-Flight Verification Checklist
- [ ] AWS Account active with billing alerts set.
- [ ] RDS PostgreSQL instance provisioned and accessible from EC2 application server.
- [ ] S3 media bucket created with Block Public Access and Versioning enabled.
- [ ] IAM roles attached to EC2 instance (no long-lived secret keys stored on server).
- [ ] SSL Certificates issued in ACM for `subashstudio.com` and `*.subashstudio.com`.
- [ ] Production `.env` prepared with cryptographically secure passwords.

---

## 2. Step-by-Step Migration Execution

### Phase A: Database Schema Deployment

1. On the EC2 application server, verify connectivity to RDS PostgreSQL:
   ```bash
   pg_isready -h <RDS_ENDPOINT> -p 5432 -U subash_admin
   ```

2. Run committed Prisma migrations:
   ```bash
   cd /var/www/subash-studio/backend
   export DATABASE_URL="postgresql://subash_admin:<PASSWORD>@<RDS_ENDPOINT>:5432/subash_studio?schema=public&sslmode=require"
   npx prisma migrate deploy
   ```

3. Verify migration status:
   ```bash
   npx prisma migrate status
   # Output: Database is up to date with 1 migration applied: 20260918000000_init
   ```

4. Perform initial baseline seed (if fresh database):
   ```bash
   export INITIAL_ADMIN_PASSWORD="<STRONG_RANDOM_PASSWORD_GEN_ONCE>"
   npm run start
   # seedService will initialize default branch, catalog structure, and admin user
   ```

---

### Phase B: S3 Media Migration & Sync

1. If migrating existing studio photography from local `uploads/` directory or staging storage:
   ```bash
   # Sync all high-resolution portfolio, films, and gallery assets to S3
   aws s3 sync /var/www/subash-studio/backend/uploads/ s3://subash-studio-media-prod-ap-south-1/uploads/ \
     --cache-control "public, max-age=31536000, immutable" \
     --region ap-south-1
   ```

2. Verify asset accessibility via CloudFront CDN:
   ```bash
   curl -I https://<CLOUDFRONT_DISTRIBUTION_ID>.cloudfront.net/uploads/<TEST_IMAGE>.jpg
   # Verify HTTP 200 OK and Cache-Control headers
   ```

---

### Phase C: Backend Application Launch

1. Configure production environment in `/var/www/subash-studio/backend/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="postgresql://subash_admin:<PASSWORD>@<RDS_ENDPOINT>:5432/subash_studio?schema=public&sslmode=require"
   JWT_SECRET="<MIN_32_CHAR_CRYPTO_SECURE_KEY>"
   FRONTEND_URL="https://subashstudio.com"
   CLOUDFRONT_URL="https://media.subashstudio.com"
   AWS_REGION="ap-south-1"
   S3_BUCKET_NAME="subash-studio-media-prod-ap-south-1"
   ```

2. Start application with PM2:
   ```bash
   pm2 start src/server.js --name "subash-api" -i max
   pm2 save
   ```

3. Test local health endpoint:
   ```bash
   curl -i http://127.0.0.1:5000/api/health
   # Expected response: {"status":"healthy","timestamp":...}
   ```

---

### Phase D: DNS Cutover (Route 53)

1. Lower TTL on existing DNS records to `300` (5 minutes) 24 hours prior to cutover.
2. In AWS Route 53:
   - Create `A` Alias record: `subashstudio.com` -> CloudFront Distribution.
   - Create `CNAME` record: `api.subashstudio.com` -> ALB / EC2 Elastic IP.
   - Create `CNAME` record: `media.subashstudio.com` -> CloudFront S3 Distribution.
3. Test DNS propagation across regional resolvers.

---

### Phase E: Post-Migration Sanity Verification

- [ ] Visit `https://subashstudio.com/` — Verify homepage hero paints immediately without layout shift.
- [ ] Visit `https://subashstudio.com/portfolio` — Verify gallery images load from CloudFront CDN with WebP fallbacks.
- [ ] Visit `https://subashstudio.com/frames` — Test customizer: select timber, photo upload, live 3D preview, add to cart, and test checkout.
- [ ] Visit `https://subashstudio.com/contact` — Submit inquiry form; verify collision-safe ID (`ENQ-...`) received.
- [ ] Visit `https://subashstudio.com/admin/login` — Log in with secure credentials; verify dashboard metrics and zero 401s in public console.

---

## 3. Rollback Strategy

In the event of an unrecoverable failure during the migration window:
1. **DNS Fallback:** Revert Route 53 `A` record to previous staging or maintenance page.
2. **Database Fallback:** Revert RDS to the pre-migration snapshot taken immediately prior to migration.
3. **Data Integrity:** All booking and order records created during testing can be purged via standard admin tools.
