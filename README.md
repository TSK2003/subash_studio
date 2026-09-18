# Subash Studio

A production-grade web platform and atelier management system for **Subash Studio**, featuring a client-facing showcase, online custom frame ordering atelier, and an administrative management dashboard.

---

## 1. System Architecture

```
Subash Studio
│
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── admin/            # Admin pages, components & contexts
│   │   ├── components/       # Reusable layout and public components
│   │   ├── pages/            # Public showcase & frame atelier pages
│   │   ├── lib/              # Centralized API client, Lenis, pricing logic
│   │   └── services/         # Client services (Google reviews)
│   ├── public/               # Public brand assets, images & videos
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                  # Node.js + Express + Prisma ORM
│   ├── src/
│   │   ├── routes/           # REST API route endpoints
│   │   ├── controllers/      # Request handlers & response formatters
│   │   ├── services/         # Business logic & Prisma database transactions
│   │   ├── middleware/       # JWT Auth, Rate limiting, Upload validation, Errors
│   │   ├── utils/            # Passwords (bcrypt), JWT tokens, S3/disk storage
│   │   ├── config/           # Environment configuration & Prisma singleton
│   │   ├── integrations/     # Google Business Profile OAuth & reviews
│   │   ├── app.js            # Express application setup, Helmet & CORS
│   │   └── server.js         # Server bootstrap, DB connect & auto-seeding
│   ├── prisma/
│   │   └── schema.prisma     # PostgreSQL data model schema
│   ├── package.json
│   └── .env.example
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI validation workflow
│
├── .gitignore
├── README.md
└── package.json              # Workspace scripts
```

---

## 2. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Framer Motion, GSAP, Swiper, Lenis Smooth Scroll.
- **Backend**: Node.js (v18+ / v20+), Express, Prisma ORM, Helmet, CORS, Cookie-Parser, Multer, Express-Rate-Limit, Bcrypt.js, JsonWebToken.
- **Database**: PostgreSQL (compatible with local PostgreSQL & AWS RDS PostgreSQL).
- **Storage**: AWS S3 (with local disk storage fallback for development).

---

## 3. Environment Variables Setup

### Frontend (`frontend/.env`)
```bash
# In development, leave empty to use the built-in Vite reverse proxy to http://localhost:5000
# In production, set to your backend domain:
VITE_API_BASE_URL=https://api.subashstudio.com
```

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/subash_studio?schema=public"

# Security (Min 32 characters in production)
JWT_SECRET="replace_with_a_secure_random_secret_in_production"

# CORS Allowed Origin
FRONTEND_URL="http://localhost:5173"

# Google Business Profile OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
GOOGLE_REFRESH_TOKEN=
GOOGLE_BUSINESS_ACCOUNT_ID=
GOOGLE_BUSINESS_LOCATION_ID=

# AWS S3 Storage (Optional - falls back to local disk storage if unconfigured)
AWS_REGION="ap-south-1"
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## 4. Local Development

### Prerequisites
- Node.js v18 or v20+
- PostgreSQL database instance running locally or on AWS RDS

### Installation
From the repository root:
```bash
# Install root workspace, frontend, and backend dependencies
npm run install:all
```
Or individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### Database Setup (Backend)
```bash
cd backend
npx prisma generate
# Push schema to development database or run migrations:
npx prisma db push
```

### Starting the Applications
In two separate terminal windows:

**Backend Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Dev Server (Port 5173):**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and automatically proxies all `/api` calls to `http://localhost:5000`.

---

## 5. Authentication & Security

- **Password Hashing**: Bcrypt with salted rounds.
- **Database Credentials**: Admin accounts are stored in PostgreSQL using the `AdminUser` model.
- **JWT Verification**: Protected admin routes require a valid Bearer token in the `Authorization` header or an `admin_token` cookie.
- **Rate Limiting**: Configured for authentication endpoints and public inquiry forms to prevent brute-force attacks.
- **Error Handling**: Centralized error middleware prevents stack traces, internal paths, and SQL/Prisma details from being leaked in production.
- **Initial Admin User**: Automatically seeded on first startup if the database is empty:
  - **Email**: `subashstudio009@gmail.com`
  - **Default Password**: `subash@2026` *(change immediately in production via Admin Settings)*

---

## 6. REST API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Health check & service status | Public |
| `POST` | `/api/auth/login` | Admin login & token issuance | Public (Rate-limited) |
| `POST` | `/api/auth/logout` | Clears admin session | Public |
| `GET` | `/api/auth/me` | Fetch active session details | Admin |
| `PUT` | `/api/auth/profile` | Update admin profile | Admin |
| `POST` | `/api/auth/change-password` | Update admin password | Admin |
| `GET` | `/api/bookings` | List all bookings | Admin |
| `POST` | `/api/bookings` | Submit new booking inquiry | Public |
| `PUT/DELETE` | `/api/bookings/:id` | Manage booking | Admin |
| `GET` | `/api/enquiries` | List contact form inquiries | Admin |
| `POST` | `/api/enquiries` | Submit contact form inquiry | Public |
| `GET` | `/api/gallery` | Get published gallery photos | Public |
| `POST/PUT/DELETE` | `/api/gallery/:id` | Manage gallery items | Admin |
| `GET` | `/api/portfolio` | Get portfolio stories | Public |
| `GET` | `/api/services` | Get studio services catalog | Public |
| `GET` | `/api/films` | Get cinema reels | Public |
| `GET` | `/api/branches` | Get studio branch ateliers | Public |
| `GET` | `/api/testimonials` | Get approved client reviews | Public |
| `GET` | `/api/frames/wood-types` | Get frame wood catalog | Public |
| `GET` | `/api/frames/designs` | Get frame molding designs | Public |
| `GET` | `/api/frames/ratios` | Get aspect ratio dimensions | Public |
| `POST` | `/api/frames/orders` | Place custom frame order | Public |
| `GET` | `/api/frames/orders` | List customer frame orders | Admin |
| `GET` | `/api/content` | Get editorial website content | Public |
| `GET` | `/api/settings` | Get studio configuration | Admin |
| `POST` | `/api/uploads` | Upload image asset (S3/local) | Public/Admin |

---

## 7. AWS Deployment Preparation

This repository is structured for streamlined manual deployment to AWS:

### 1. Frontend: AWS S3 + CloudFront
1. Build the production frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the contents of `frontend/dist/` to an AWS S3 bucket configured for static website hosting.
3. Attach an **AWS CloudFront Distribution** pointing to the S3 origin:
   - Configure Viewer Protocol Policy to "Redirect HTTP to HTTPS".
   - Configure Custom Error Response for HTTP 403/404 to respond with `/index.html` and HTTP 200 (for SPA client-side routing).

### 2. Backend: AWS EC2
1. Launch an Ubuntu EC2 instance with an IAM Role that has `s3:PutObject` access to your media bucket.
2. Clone the repository and navigate to `backend/`:
   ```bash
   cd backend
   npm install --production
   npx prisma generate
   ```
3. Set production environment variables in `.env` or system environment.
4. Run using a process manager such as PM2:
   ```bash
   pm2 start src/server.js --name "subash-studio-api"
   pm2 startup
   ```
5. Configure Nginx as a reverse proxy forwarding requests to `http://localhost:5000`.

### 3. Database: AWS RDS PostgreSQL
1. Create an AWS RDS PostgreSQL instance in the same VPC/region as your EC2 instance.
2. Update `DATABASE_URL` in `backend/.env` with the RDS endpoint.
3. Run `npx prisma db push` or migrations from EC2 to initialize the schema.

### 4. Media Storage: AWS S3
1. Create a private S3 bucket for media uploads (e.g. `subash-studio-media`).
2. Configure bucket CORS to permit `GET`, `PUT`, `POST` from your CloudFront and local domains.
3. When `AWS_S3_BUCKET` is supplied in backend environment variables, uploaded images are directly streamed to S3.

---

## 8. Continuous Integration (GitHub Actions)

The `.github/workflows/ci.yml` workflow automatically validates every pull request and push:
1. Installs frontend and backend dependencies.
2. Lints frontend using `oxlint`.
3. Compiles the frontend production bundle via Vite.
4. Validates the Prisma schema using `prisma validate`.
5. Generates the Prisma client using `prisma generate`.

---

## 9. License

© 2026 Subash Studio. All rights reserved.
