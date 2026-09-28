-- AlterTable
ALTER TABLE "frame_ratios" ADD COLUMN IF NOT EXISTS "orientation" TEXT NOT NULL DEFAULT 'portrait';
