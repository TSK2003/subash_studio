import prisma from "../config/prisma.js";

/**
 * Ensures all required auxiliary tables and indexes exist in PostgreSQL upon server startup.
 * Idempotent and non-destructive using CREATE TABLE IF NOT EXISTS.
 */
export async function ensureDatabaseTablesExist() {
  try {
    // 1. Ensure frame_order_items table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "frame_order_items" (
        "id" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "woodType" TEXT NOT NULL,
        "woodPrice" INTEGER NOT NULL,
        "frameDesign" TEXT NOT NULL,
        "designPrice" INTEGER NOT NULL,
        "frameRatio" TEXT NOT NULL,
        "ratioPrice" INTEGER NOT NULL,
        "orientation" TEXT NOT NULL DEFAULT 'portrait',
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "unitPrice" INTEGER NOT NULL,
        "totalAmount" INTEGER NOT NULL,
        "photoUrl" TEXT NOT NULL,
        "photoName" TEXT NOT NULL,
        "customizationParams" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "frame_order_items_pkey" PRIMARY KEY ("id")
      )
    `);

    // Ensure foreign key constraint
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'frame_order_items_orderId_fkey'
        ) THEN
          ALTER TABLE "frame_order_items"
          ADD CONSTRAINT "frame_order_items_orderId_fkey"
          FOREIGN KEY ("orderId") REFERENCES "frame_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    // Ensure createdAt and updatedAt columns exist (defensive against casing differences)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='frame_order_items' AND column_name='createdAt') THEN
          ALTER TABLE "frame_order_items" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='frame_order_items' AND column_name='updatedAt') THEN
          ALTER TABLE "frame_order_items" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "frame_order_items_orderId_idx" ON "frame_order_items"("orderId")
    `);

    // 2. Ensure notifications table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "related_entity_id" TEXT,
        "related_entity_type" TEXT,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "notifications_related_entity_idx" ON "notifications"("related_entity_type", "related_entity_id")
    `);

    console.log("✓ Verified PostgreSQL relational schema tables & indexes");
  } catch (err) {
    console.warn("[DatabaseInit] Note during table check:", err.message);
  }
}
