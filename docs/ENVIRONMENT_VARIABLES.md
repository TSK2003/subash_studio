# Environment Variables Reference

**Project:** Subash Studio Photography Web Platform  
**Target Environments:** Development, Staging, AWS Production  

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable Name | Required? | Default / Example | Security Implications & Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port on which the Express HTTP server listens. |
| `NODE_ENV` | **Required** | `production` / `development` | Enables production security guards, Helmet CSP, secure cookies, and suppresses internal stack traces. |
| `DATABASE_URL` | **Required** | `postgresql://...` | PostgreSQL connection URI. In AWS production, must point to RDS with `sslmode=require`. |
| `JWT_SECRET` | **Required** | Minimum 32-char crypto string | Signing key for administrative JWT tokens. Production will refuse to boot if missing or < 32 characters. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token validity duration. |
| `FRONTEND_URL` | **Required** | `https://subashstudio.com` | Allowed CORS origin and cookie domain alignment. |
| `CLOUDFRONT_URL` | Optional | `https://media.subashstudio.com` | Edge CDN distribution domain for serving photography and uploads. |
| `INITIAL_ADMIN_PASSWORD` | Optional | Randomly generated if unset | Used only once during fresh database seed. If omitted, a secure random key is generated and logged to console. |
| `AWS_REGION` | Optional | `ap-south-1` | Target AWS region for S3 client calls. |
| `S3_BUCKET_NAME` | Optional | `subash-studio-media-prod-ap-south-1` | S3 bucket for photography uploads. If omitted, falls back to local disk storage. |
| `AWS_ACCESS_KEY_ID` | Optional | *Omit on EC2* | AWS IAM user key. On EC2, omit this to use the IAM Instance Profile. |
| `AWS_SECRET_ACCESS_KEY` | Optional | *Omit on EC2* | AWS IAM user secret. On EC2, omit this to use the IAM Instance Profile. |

### Backend Sample `.env.production`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://subash_admin:<ENCRYPTED_DB_PASSWORD>@subash-studio-db.cxxxxxx.ap-south-1.rds.amazonaws.com:5432/subash_studio?schema=public&sslmode=require"
JWT_SECRET="9f8a3c2b1e7d6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a"
JWT_EXPIRES_IN=7d
FRONTEND_URL="https://subashstudio.com"
CLOUDFRONT_URL="https://media.subashstudio.com"
AWS_REGION="ap-south-1"
S3_BUCKET_NAME="subash-studio-media-prod-ap-south-1"
```

---

## 2. Frontend Environment Variables (`frontend/.env`)

| Variable Name | Required? | Default / Example | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Optional | `""` (Relative proxy) or `https://api.subashstudio.com` | Base URL for REST API requests. In local dev, Vite proxy handles `/api`. In production, can point to API domain. |

### Frontend Sample `.env.production`:
```env
VITE_API_BASE_URL="https://api.subashstudio.com"
```
*(Note: Never place private secrets, database keys, or AWS credentials in frontend `.env` files, as all `VITE_*` variables are embedded into public client bundles).*
