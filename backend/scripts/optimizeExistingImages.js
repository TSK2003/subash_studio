import fs from "node:fs";
import path from "node:path";
import prisma from "../src/config/prisma.js";
import { optimizeImage, getOptimizationProfile } from "../src/services/imageOptimizationService.js";

const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Safely optimizes an existing file on disk and generates WebP + variants
 * Keeps original in originals/ subfolder.
 * Returns the new webp URL and metadata.
 */
async function processDiskFile(relativeUrl, category = "gallery") {
  if (!relativeUrl || typeof relativeUrl !== "string") return null;
  if (!relativeUrl.startsWith("/uploads/")) return null; // Only process local uploads
  if (relativeUrl.endsWith(".webp")) return null; // Already optimized WebP

  const cleanPath = relativeUrl.replace(/^\//, "");
  const fullPath = path.resolve(process.cwd(), cleanPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[Skip] File not found on disk: ${fullPath}`);
    return null;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimetype = MIME_MAP[ext];
  if (!mimetype) {
    console.warn(`[Skip] Unsupported extension: ${ext}`);
    return null;
  }

  const dir = path.dirname(fullPath);
  const baseName = path.basename(fullPath, ext);
  const webpFileName = `${baseName}.webp`;
  const webpFullPath = path.join(dir, webpFileName);
  const originalsDir = path.join(dir, "originals");

  if (!fs.existsSync(originalsDir)) {
    fs.mkdirSync(originalsDir, { recursive: true });
  }

  const originalArchiveFullPath = path.join(originalsDir, `${baseName}${ext}`);

  let originalBuffer;
  try {
    originalBuffer = fs.readFileSync(fullPath);
  } catch (err) {
    console.error(`Failed to read file ${fullPath}:`, err.message);
    return null;
  }

  // Preserve original safely if not already archived
  if (!fs.existsSync(originalArchiveFullPath)) {
    try {
      fs.copyFileSync(fullPath, originalArchiveFullPath);
    } catch (err) {
      console.warn(`Could not copy original to archive:`, err.message);
    }
  }

  // Check if WebP already exists (idempotency)
  if (fs.existsSync(webpFullPath)) {
    const webpUrl = relativeUrl.replace(new RegExp(`\\${ext}$`, "i"), ".webp");
    return {
      newUrl: webpUrl,
      alreadyExisted: true,
      size: fs.statSync(webpFullPath).size,
      originalSize: originalBuffer.length,
    };
  }

  // Optimize with Sharp
  try {
    const result = await optimizeImage({
      buffer: originalBuffer,
      mimetype,
      originalname: `${baseName}${ext}`,
      category,
    });

    // Write optimized WebP
    fs.writeFileSync(webpFullPath, result.optimized.buffer);

    // Write responsive variants
    for (const variant of result.variants) {
      const variantPath = path.join(dir, `${baseName}${variant.suffix}.webp`);
      fs.writeFileSync(variantPath, variant.buffer);
    }

    const webpUrl = relativeUrl.replace(new RegExp(`\\${ext}$`, "i"), ".webp");

    return {
      newUrl: webpUrl,
      width: result.optimized.width,
      height: result.optimized.height,
      size: result.optimized.size,
      originalSize: originalBuffer.length,
      savingsPercent: result.stats.savingsPercent,
    };
  } catch (err) {
    console.error(`[Error] Failed to optimize ${relativeUrl}:`, err.message);
    return null;
  }
}

async function runMigration() {
  console.log("=================================================");
  console.log("   SUBASH STUDIO - IMAGE OPTIMIZATION MIGRATION  ");
  console.log("=================================================\n");

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  let updatedPhotosCount = 0;
  let updatedAlbumsCount = 0;
  let updatedOthersCount = 0;

  // 1. Migrate Gallery Photos
  console.log("--- 1. Auditing Gallery Photos ---");
  const galleryPhotos = await prisma.galleryPhoto.findMany();
  console.log(`Found ${galleryPhotos.length} total gallery photos in database.`);

  for (const photo of galleryPhotos) {
    if (photo.url && !photo.url.endsWith(".webp") && photo.url.startsWith("/uploads/")) {
      const res = await processDiskFile(photo.url, "gallery");
      if (res && res.newUrl) {
        await prisma.galleryPhoto.update({
          where: { id: photo.id },
          data: {
            url: res.newUrl,
            width: res.width || photo.width,
            height: res.height || photo.height,
          },
        });
        updatedPhotosCount++;
        totalOriginalBytes += res.originalSize || 0;
        totalOptimizedBytes += res.size || 0;
        console.log(
          `✓ Photo ${photo.id}: ${(res.originalSize / 1024 / 1024).toFixed(2)} MB -> ${(res.size / 1024).toFixed(1)} KB (${res.savingsPercent || "saved"})`
        );
      }
    }
  }

  // 2. Migrate Gallery Album Cover Images
  console.log("\n--- 2. Auditing Gallery Album Covers ---");
  const albums = await prisma.galleryAlbum.findMany();
  for (const album of albums) {
    if (album.coverImage && !album.coverImage.endsWith(".webp") && album.coverImage.startsWith("/uploads/")) {
      const res = await processDiskFile(album.coverImage, "gallery");
      if (res && res.newUrl) {
        await prisma.galleryAlbum.update({
          where: { id: album.id },
          data: { coverImage: res.newUrl },
        });
        updatedAlbumsCount++;
        totalOriginalBytes += res.originalSize || 0;
        totalOptimizedBytes += res.size || 0;
        console.log(`✓ Album "${album.title}": cover updated to ${res.newUrl}`);
      }
    }
  }

  // 3. Migrate Services
  console.log("\n--- 3. Auditing Services ---");
  const services = await prisma.service.findMany();
  for (const svc of services) {
    if (svc.image && !svc.image.endsWith(".webp") && svc.image.startsWith("/uploads/")) {
      const res = await processDiskFile(svc.image, "services");
      if (res && res.newUrl) {
        await prisma.service.update({
          where: { id: svc.id },
          data: { image: res.newUrl },
        });
        updatedOthersCount++;
        console.log(`✓ Service "${svc.name}": image updated to ${res.newUrl}`);
      }
    }
  }

  // 4. Migrate Branches
  console.log("\n--- 4. Auditing Branches ---");
  const branches = await prisma.branch.findMany();
  for (const br of branches) {
    if (br.image && !br.image.endsWith(".webp") && br.image.startsWith("/uploads/")) {
      const res = await processDiskFile(br.image, "branches");
      if (res && res.newUrl) {
        await prisma.branch.update({
          where: { id: br.id },
          data: { image: res.newUrl },
        });
        updatedOthersCount++;
        console.log(`✓ Branch "${br.name}": image updated to ${res.newUrl}`);
      }
    }
  }

  // 5. Migrate Testimonials
  console.log("\n--- 5. Auditing Testimonials ---");
  const testimonials = await prisma.testimonial.findMany();
  for (const test of testimonials) {
    if (test.customerImage && !test.customerImage.endsWith(".webp") && test.customerImage.startsWith("/uploads/")) {
      const res = await processDiskFile(test.customerImage, "testimonials");
      if (res && res.newUrl) {
        await prisma.testimonial.update({
          where: { id: test.id },
          data: { customerImage: res.newUrl },
        });
        updatedOthersCount++;
        console.log(`✓ Testimonial "${test.customerName}": image updated to ${res.newUrl}`);
      }
    }
  }

  // 6. Migrate Frame Wood Types & Designs
  console.log("\n--- 6. Auditing Frame Wood & Designs ---");
  const frameWoods = await prisma.frameWoodType.findMany();
  for (const wood of frameWoods) {
    if (wood.image && !wood.image.endsWith(".webp") && wood.image.startsWith("/uploads/")) {
      const res = await processDiskFile(wood.image, "frames");
      if (res && res.newUrl) {
        await prisma.frameWoodType.update({
          where: { id: wood.id },
          data: { image: res.newUrl },
        });
        updatedOthersCount++;
        console.log(`✓ Wood type "${wood.name}": image updated to ${res.newUrl}`);
      }
    }
  }

  const frameDesigns = await prisma.frameDesign.findMany();
  for (const design of frameDesigns) {
    if (design.image && !design.image.endsWith(".webp") && design.image.startsWith("/uploads/")) {
      const res = await processDiskFile(design.image, "frames");
      if (res && res.newUrl) {
        await prisma.frameDesign.update({
          where: { id: design.id },
          data: { image: res.newUrl },
        });
        updatedOthersCount++;
        console.log(`✓ Frame design "${design.name}": image updated to ${res.newUrl}`);
      }
    }
  }

  // 7. Migrate WebsiteContent CMS
  console.log("\n--- 7. Auditing WebsiteContent ---");
  const cmsEntries = await prisma.websiteContent.findMany();
  for (const entry of cmsEntries) {
    let rawStr = JSON.stringify(entry.data);
    const matches = rawStr.match(/\/uploads\/[a-zA-Z0-9_\-\.\/]+\.(jpg|jpeg|png)/gi) || [];
    let modified = false;

    for (const match of matches) {
      const res = await processDiskFile(match, "cms");
      if (res && res.newUrl) {
        rawStr = rawStr.split(match).join(res.newUrl);
        modified = true;
        console.log(`✓ CMS (${entry.section}): replaced ${match} -> ${res.newUrl}`);
      }
    }

    if (modified) {
      await prisma.websiteContent.update({
        where: { section: entry.section },
        data: { data: JSON.parse(rawStr) },
      });
      updatedOthersCount++;
    }
  }

  console.log("\n=================================================");
  console.log("              MIGRATION SUMMARY                  ");
  console.log("=================================================");
  console.log(`Updated Gallery Photos: ${updatedPhotosCount}`);
  console.log(`Updated Album Covers:  ${updatedAlbumsCount}`);
  console.log(`Updated Other Records: ${updatedOthersCount}`);

  if (totalOriginalBytes > 0) {
    const origMB = (totalOriginalBytes / 1024 / 1024).toFixed(2);
    const optMB = (totalOptimizedBytes / 1024 / 1024).toFixed(2);
    const savedMB = ((totalOriginalBytes - totalOptimizedBytes) / 1024 / 1024).toFixed(2);
    const pct = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);

    console.log(`Original Total Size:   ${origMB} MB`);
    console.log(`Optimized Total Size:  ${optMB} MB`);
    console.log(`Total Bandwidth Saved: ${savedMB} MB (${pct}% reduction!)`);
  } else {
    console.log("All existing database images are already optimized WebP!");
  }
  console.log("=================================================\n");

  await prisma.$disconnect();
}

runMigration().catch(async (err) => {
  console.error("Migration error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
