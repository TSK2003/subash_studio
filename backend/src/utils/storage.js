import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

export function validateFileType(mimetype, originalname) {
  if (!ALLOWED_MIME_TYPES[mimetype]) {
    throw new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.");
  }
  const ext = path.extname(originalname).toLowerCase();
  const validExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  if (!validExts.includes(ext)) {
    throw new Error("Invalid file extension.");
  }
  return ALLOWED_MIME_TYPES[mimetype];
}

export function sanitizeCategory(category = "general") {
  const normalized = category.trim().toLowerCase();
  return ALLOWED_CATEGORIES.includes(normalized) ? normalized : "general";
}

export async function saveFile({ buffer, mimetype, originalname, category = "general" }) {
  const extension = validateFileType(mimetype, originalname);
  const cleanCategory = sanitizeCategory(category);
  const safeUniqueId = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
  const objectKey = `${cleanCategory}/${safeUniqueId}`;

  // AWS S3 upload path if bucket is configured
  if (ENV.AWS_S3_BUCKET && ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3Client = new S3Client({
        region: ENV.AWS_REGION,
        credentials: {
          accessKeyId: ENV.AWS_ACCESS_KEY_ID,
          secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
        },
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET,
          Key: objectKey,
          Body: buffer,
          ContentType: mimetype,
        })
      );

      const s3Url = `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${objectKey}`;
      return {
        url: s3Url,
        key: objectKey,
        storage: "s3",
      };
    } catch (err) {
      console.warn("S3 upload failed, falling back to local storage:", err.message);
    }
  }

  // Local storage fallback
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
