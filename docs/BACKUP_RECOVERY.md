# Backup & Disaster Recovery Architecture

**Project:** Subash Studio Photography Web Platform  
**RPO Objective:** < 15 minutes (Recovery Point Objective)  
**RTO Objective:** < 1 hour (Recovery Time Objective)  

---

## 1. Backup Strategy Matrix

| Component | Asset Type | Backup Mechanism | Frequency | Retention | Storage Tier |
|---|---|---|---|---|---|
| **PostgreSQL DB** | Customer Bookings, Frame Orders, Catalog | RDS Automated Snapshot + WAL logs | Continuous / Daily | 30 Days | Encrypted RDS Storage |
| **Pre-Deploy DB** | Milestone snapshots | Manual RDS Snapshot | Prior to migrations | Until next release | Encrypted RDS Snapshot |
| **Photography Media** | High-Res Portraits, Wedding Stills, Scans | S3 Bucket Versioning + S3 Replication | Real-time on upload | Indefinite / Lifecycle | S3 Standard / Glacier |
| **Application Config** | PM2 config, Nginx files, SSL settings | Git Version Control (`main` branch) | On change | Indefinite | GitHub Repository |

---

## 2. PostgreSQL Disaster Recovery Runbook

### Scenario A: Point-in-Time Recovery (PITR)
If an erroneous administrative action or corruption occurred at a specific timestamp:

1. Open the AWS RDS Console.
2. Select database instance: `subash-studio-db`.
3. Under **Actions**, select **Restore to point in time**.
4. Choose the target recovery timestamp (e.g. 10 minutes prior to the incident).
5. Specify a new instance identifier (e.g. `subash-studio-db-restored`).
6. After provisioning completes, update the EC2 backend `DATABASE_URL` to point to the restored endpoint:
   ```bash
   export DATABASE_URL="postgresql://subash_admin:<PASSWORD>@subash-studio-db-restored.cxxxxxx.ap-south-1.rds.amazonaws.com:5432/subash_studio?sslmode=require"
   pm2 restart subash-api
   ```

### Scenario B: Manual DB Snapshot Restore
To restore from a named snapshot:
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier subash-studio-db-recovered \
  --db-snapshot-identifier rds:subash-studio-db-pre-migration \
  --db-instance-class db.t4g.small \
  --region ap-south-1
```

---

## 3. S3 Photography Asset Recovery Runbook

### Scenario A: Undelete Accidentally Removed Photos
With S3 Versioning enabled, deleting an object creates a Delete Marker rather than permanently erasing the file.

To list delete markers and restore:
```bash
# List object versions
aws s3api list-object-versions \
  --bucket subash-studio-media-prod-ap-south-1 \
  --prefix "uploads/"

# Delete the Delete Marker to immediately restore the original file
aws s3api delete-object \
  --bucket subash-studio-media-prod-ap-south-1 \
  --key "uploads/<FILENAME>.jpg" \
  --version-id "<DELETE_MARKER_VERSION_ID>"
```

### Scenario B: Cross-Region Photography Vault
For catastrophic regional outages in `ap-south-1`:
- Configure S3 Cross-Region Replication (CRR) to a secondary backup vault bucket in `ap-southeast-1` (Singapore):
  `subash-studio-media-vault-dr-ap-southeast-1`.

---

## 4. Disaster Recovery Testing Schedule
- **Quarterly:** Execute test database point-in-time recovery to a temporary sandbox instance.
- **Bi-annually:** Verify S3 version recovery drill on test photography folders.
- **Annually:** Complete full DR rebuild exercise.
