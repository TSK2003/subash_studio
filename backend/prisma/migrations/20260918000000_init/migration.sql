-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'READ', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FrameOrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Studio Director & Founder',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "clientName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "numberOfDays" TEXT NOT NULL DEFAULT '1 Day',
    "requiredService" TEXT NOT NULL,
    "photographyRequirement" TEXT,
    "cinematographyRequirement" TEXT,
    "budget" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'Tirunelveli',
    "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interestedService" TEXT NOT NULL,
    "eventDate" TEXT,
    "location" TEXT,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "receivedDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "aspect" TEXT NOT NULL DEFAULT 'landscape',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "category" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "eventDate" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "fullDesc" TEXT,
    "startingPrice" TEXT NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "films" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT NOT NULL DEFAULT 'Highlight',
    "thumbnail" TEXT NOT NULL,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "films_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "manager" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerRole" TEXT NOT NULL DEFAULT 'Client',
    "customerImage" TEXT,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "eventType" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'approved',
    "date" TEXT NOT NULL,
    "googleReviewId" TEXT,
    "googleUpdateTime" TEXT,
    "googleReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_reviews_meta" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastSynced" TIMESTAMP(3),
    "totalGoogleReviews" INTEGER NOT NULL DEFAULT 0,
    "accountName" TEXT NOT NULL DEFAULT 'Subash Studio',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_reviews_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_wood_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "grain" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_wood_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "additionalPrice" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "compatibleWoods" JSONB NOT NULL DEFAULT '["All"]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_ratios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "aspect" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_ratios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "woodType" TEXT NOT NULL,
    "woodPrice" INTEGER NOT NULL,
    "frameDesign" TEXT NOT NULL,
    "designPrice" INTEGER NOT NULL,
    "frameRatio" TEXT NOT NULL,
    "ratioPrice" INTEGER NOT NULL,
    "orientation" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "photoName" TEXT NOT NULL,
    "customizationParams" JSONB NOT NULL,
    "items" JSONB,
    "status" "FrameOrderStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_content" (
    "section" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_content_pkey" PRIMARY KEY ("section")
);

-- CreateTable
CREATE TABLE "studio_settings" (
    "section" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_settings_pkey" PRIMARY KEY ("section")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_eventDate_idx" ON "bookings"("eventDate");

-- CreateIndex
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt");

-- CreateIndex
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");

-- CreateIndex
CREATE INDEX "enquiries_createdAt_idx" ON "enquiries"("createdAt");

-- CreateIndex
CREATE INDEX "gallery_items_category_idx" ON "gallery_items"("category");

-- CreateIndex
CREATE INDEX "gallery_items_published_idx" ON "gallery_items"("published");

-- CreateIndex
CREATE INDEX "gallery_items_createdAt_idx" ON "gallery_items"("createdAt");

-- CreateIndex
CREATE INDEX "portfolio_projects_category_idx" ON "portfolio_projects"("category");

-- CreateIndex
CREATE INDEX "portfolio_projects_published_idx" ON "portfolio_projects"("published");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_googleReviewId_key" ON "testimonials"("googleReviewId");

-- CreateIndex
CREATE INDEX "testimonials_approved_hidden_idx" ON "testimonials"("approved", "hidden");

-- CreateIndex
CREATE UNIQUE INDEX "frame_wood_types_name_key" ON "frame_wood_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "frame_designs_name_key" ON "frame_designs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "frame_ratios_name_key" ON "frame_ratios"("name");

-- CreateIndex
CREATE INDEX "frame_orders_status_idx" ON "frame_orders"("status");

-- CreateIndex
CREATE INDEX "frame_orders_createdAt_idx" ON "frame_orders"("createdAt");

