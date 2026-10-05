import sharp from "sharp";
import path from "node:path";

/**
 * Subash Studio Centralized Image Optimization System
 * 
 * Quality Settings & Dimension Profiles:
 * - Hero/CMS images: WebP 86-90 quality, max 2560px
 * - Gallery/Portfolio: WebP 84 quality, max 2048px (indistinguishable from original, no loss of skin details)
 * - Services/Branches/Testimonials: WebP 82 quality, max 1600px
 * - Frames: WebP 84 quality, max 1920px (preserves original for high-res printing if needed)
 * - Thumbnails: WebP 78 quality, max 480px
 * - Medium responsive: WebP 80 quality, max 1024px
 */

export const OPTIMIZATION_PROFILES = {
  hero: {
    maxWidth: 2560,
    maxHeight: 1800,
    quality: 88,
    effort: 4,
    generateVariants: true,
  },
  gallery: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 84,
    effort: 4,
    generateVariants: true,
  },
  portfolio: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 84,
    effort: 4,
    generateVariants: true,
  },
  services: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 82,
    effort: 4,
    generateVariants: true,
  },
  branches: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 82,
    effort: 4,
    generateVariants: true,
  },
  testimonials: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 82,
    effort: 4,
    generateVariants: true,
  },
  frames: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 84,
    effort: 4,
    generateVariants: true,
  },
  cms: {
    maxWidth: 2560,
    maxHeight: 1800,
    quality: 86,
    effort: 4,
    generateVariants: true,
  },
  general: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 82,
    effort: 4,
    generateVariants: true,
  },
};

export const VARIANT_SPECS = {
  medium: {
    name: "medium",
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 80,
    suffix: "-md",
  },
  thumbnail: {
    name: "thumbnail",
    maxWidth: 480,
    maxHeight: 480,
    quality: 78,
    suffix: "-thumb",
  },
};

const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_PIXEL_DIMENSION = 12000; // prevent decompression bomb attacks

/**
 * Validate image magic bytes / file signatures strictly
 */
export function verifyImageMagicBytes(buffer, mimetype) {
  if (!buffer || buffer.length < 12) {
    throw new Error("Invalid image buffer or file too small.");
  }

  // Check JPEG signature: FF D8 FF
  if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true;
    }
  }

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (mimetype === "image/png") {
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return true;
    }
  }

  // Check GIF signature: 47 49 46 38 ("GIF8")
  if (mimetype === "image/gif") {
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return true;
    }
  }

  // Check WebP signature: RIFF .... WEBP
  if (mimetype === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    if (isRiff && isWebp) {
      return true;
    }
  }

  throw new Error(
    "File signature verification failed: uploaded file content does not match its claimed image MIME type."
  );
}

/**
 * Resolve profile based on category or usage hint
 */
export function getOptimizationProfile(category = "general") {
  const normalized = category.toLowerCase().trim();
  if (normalized.startsWith("hero") || normalized === "home") {
    return OPTIMIZATION_PROFILES.hero;
  }
  if (normalized.startsWith("gallery")) {
    return OPTIMIZATION_PROFILES.gallery;
  }
  if (normalized.startsWith("portfolio")) {
    return OPTIMIZATION_PROFILES.portfolio;
  }
  if (normalized.startsWith("service")) {
    return OPTIMIZATION_PROFILES.services;
  }
  if (normalized.startsWith("branch")) {
    return OPTIMIZATION_PROFILES.branches;
  }
  if (normalized.startsWith("testimonial")) {
    return OPTIMIZATION_PROFILES.testimonials;
  }
  if (normalized.startsWith("frame")) {
    return OPTIMIZATION_PROFILES.frames;
  }
  if (normalized.startsWith("cms") || normalized === "website") {
    return OPTIMIZATION_PROFILES.cms;
  }
  return OPTIMIZATION_PROFILES.general;
}

/**
 * Validate input image and read metadata with Sharp
 */
export async function validateAndInspectImage(buffer, mimetype, originalname) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty image payload provided.");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Image size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  if (!ALLOWED_MIME_TYPES[mimetype]) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are permitted.");
  }

  const ext = path.extname(originalname || "").toLowerCase();
  const validExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  if (ext && !validExts.includes(ext)) {
    throw new Error("Invalid file extension.");
  }

  // Verify binary magic bytes
  verifyImageMagicBytes(buffer, mimetype);

  // Parse image header and dimensions with sharp
  let metadata;
  try {
    metadata = await sharp(buffer, { failOn: "error" }).metadata();
  } catch (err) {
    throw new Error(`Corrupted or unreadable image file: ${err.message}`);
  }

  if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
    throw new Error("Image has invalid or zero dimensions.");
  }

  if (metadata.width > MAX_PIXEL_DIMENSION || metadata.height > MAX_PIXEL_DIMENSION) {
    throw new Error(
      `Image dimensions (${metadata.width}x${metadata.height}) exceed the safety limit of ${MAX_PIXEL_DIMENSION}px.`
    );
  }

  return metadata;
}

/**
 * Centralized Image Optimization Function
 * 
 * Pipeline:
 * 1. Validate & inspect metadata
 * 2. Auto-rotate based on EXIF orientation (prevents sideways phone/camera photos)
 * 3. Resize proportionally without enlargement (never stretch, distort, or upscale)
 * 4. Convert to sRGB color space
 * 5. Encode to high-quality WebP with smart chroma subsampling
 * 6. Generate responsive variants (medium, thumbnail)
 * 7. Return optimized buffers and rich metadata
 */
export async function optimizeImage({
  buffer,
  mimetype,
  originalname,
  category = "general",
  customProfile = null,
}) {
  const metadata = await validateAndInspectImage(buffer, mimetype, originalname);
  const profile = customProfile || getOptimizationProfile(category);

  // Base sharp instance with EXIF rotation
  const basePipeline = sharp(buffer, { failOn: "none" })
    .rotate() // auto-rotates by EXIF
    .toColorspace("srgb");

  // 1. Generate Primary Optimized WebP
  let optimizedInstance = basePipeline.clone();

  // If resizing is required, resize inside bounds without enlargement
  if (
    (profile.maxWidth && metadata.width > profile.maxWidth) ||
    (profile.maxHeight && metadata.height > profile.maxHeight)
  ) {
    optimizedInstance = optimizedInstance.resize({
      width: profile.maxWidth,
      height: profile.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const optimizedBuffer = await optimizedInstance
    .webp({
      quality: profile.quality,
      effort: profile.effort || 4,
      smartSubsample: true,
    })
    .toBuffer();

  const optimizedMeta = await sharp(optimizedBuffer).metadata();

  // 2. Generate Responsive Variants (if enabled for category)
  const variants = [];

  if (profile.generateVariants) {
    // Medium Variant (max 1024px)
    if (metadata.width > VARIANT_SPECS.medium.maxWidth || metadata.height > VARIANT_SPECS.medium.maxHeight) {
      const mediumBuffer = await basePipeline
        .clone()
        .resize({
          width: VARIANT_SPECS.medium.maxWidth,
          height: VARIANT_SPECS.medium.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: VARIANT_SPECS.medium.quality,
          effort: 4,
          smartSubsample: true,
        })
        .toBuffer();

      const mediumMeta = await sharp(mediumBuffer).metadata();
      variants.push({
        name: VARIANT_SPECS.medium.name,
        suffix: VARIANT_SPECS.medium.suffix,
        buffer: mediumBuffer,
        width: mediumMeta.width,
        height: mediumMeta.height,
        size: mediumBuffer.length,
      });
    }

    // Thumbnail Variant (max 480px)
    const thumbBuffer = await basePipeline
      .clone()
      .resize({
        width: VARIANT_SPECS.thumbnail.maxWidth,
        height: VARIANT_SPECS.thumbnail.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: VARIANT_SPECS.thumbnail.quality,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer();

    const thumbMeta = await sharp(thumbBuffer).metadata();
    variants.push({
      name: VARIANT_SPECS.thumbnail.name,
      suffix: VARIANT_SPECS.thumbnail.suffix,
      buffer: thumbBuffer,
      width: thumbMeta.width,
      height: thumbMeta.height,
      size: thumbBuffer.length,
    });
  }

  const originalSize = buffer.length;
  const optimizedSize = optimizedBuffer.length;
  const savedBytes = Math.max(0, originalSize - optimizedSize);
  const savingsPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : "0";

  return {
    optimized: {
      buffer: optimizedBuffer,
      width: optimizedMeta.width,
      height: optimizedMeta.height,
      format: "webp",
      size: optimizedSize,
      mimetype: "image/webp",
      extension: ".webp",
    },
    variants,
    original: {
      buffer,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: originalSize,
      mimetype,
      extension: ALLOWED_MIME_TYPES[mimetype] || ".jpg",
    },
    stats: {
      originalSize,
      optimizedSize,
      savedBytes,
      savingsPercent: `${savingsPercent}%`,
    },
  };
}

export default {
  OPTIMIZATION_PROFILES,
  VARIANT_SPECS,
  verifyImageMagicBytes,
  getOptimizationProfile,
  validateAndInspectImage,
  optimizeImage,
};
