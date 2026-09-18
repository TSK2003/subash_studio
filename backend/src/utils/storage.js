import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ENV from "../config/env.js";

const ALLOWED_CATEGORIES = [
  "gallery",
  "portfolio",
  "services",
  "branches",
  "films",
  "frames/catalog",
  "frames/customer-orders",
  "admin",
  "general",
];

const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * Validates actual binary magic bytes of buffer against expected image signatures
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

  // Check WebP signature: RIFF ... WEBP
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
    "File signature verification failed. The uploaded file content does not match its claimed image MIME type."
  );
}

export function validateFileType(mimetype, originalname) {
  if (!ALLOWED_MIME_TYPES[mimetype]) {
    throw new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.");
  }
  const ext = path.extname(originalname || "").toLowerCase();
  const validExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  if (ext && !validExts.includes(ext)) {
    throw new Error("Invalid file extension.");
  }
  return ALLOWED_MIME_TYPES[mimetype];
}

export function sanitizeCategory(category = "general") {
  const normalized = category.trim().toLowerCase().replace(/\\/g, "/");
  return ALLOWED_CATEGORIES.includes(normalized) ? normalized : "general";
}

// Singleton S3 client instance (reused across uploads)
let cachedS3Client = null;

function getS3Client() {
  if (cachedS3Client) return cachedS3Client;

  const clientConfig = {
    region: ENV.AWS_REGION || "ap-south-1",
  };

  // If explicit credentials provided (local dev / staging), use them
  // Otherwise, leave credentials empty so AWS SDK automatically resolves from EC2 IAM Instance Profile
  if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    };
  }

  cachedS3Client = new S3Client(clientConfig);
  return cachedS3Client;
}

export async function saveFile({ buffer, mimetype, originalname, category = "general" }) {
  const extension = validateFileType(mimetype, originalname);
  verifyImageMagicBytes(buffer, mimetype);

  const cleanCategory = sanitizeCategory(category);
  const safeUniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
  const objectKey = `${cleanCategory}/${safeUniqueId}`;

  // AWS S3 upload if bucket configured
  if (ENV.AWS_S3_BUCKET) {
    try {
      const s3Client = getS3Client();
      await s3Client.send(
        new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET,
          Key: objectKey,
          Body: buffer,
          ContentType: mimetype,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      // CloudFront CDN URL preference over raw S3 bucket URL
      const cdnUrl = ENV.CLOUDFRONT_URL
        ? `${ENV.CLOUDFRONT_URL}/${objectKey}`
        : `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${objectKey}`;

      return {
        url: cdnUrl,
        key: objectKey,
        storage: "s3",
      };
    } catch (err) {
      console.warn("S3 upload failed, falling back to local storage:", err.message);
    }
  }

  // Local storage fallback for development
  const localUploadsDir = path.resolve(process.cwd(), "uploads", cleanCategory);
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }

  const filePath = path.join(localUploadsDir, safeUniqueId);
  fs.writeFileSync(filePath, buffer);

  const localUrl = `/uploads/${cleanCategory}/${safeUniqueId}`;
  return {
    url: localUrl,
    key: objectKey,
    storage: "local",
  };
}
