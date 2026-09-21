import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import ENV from "../config/env.js";

const ALLOWED_CATEGORIES = [
  "gallery",
  "portfolio",
  "services",
  "branches",
  "films",
  "films/videos",
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

export const ALLOWED_VIDEO_MIME_TYPES = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
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

/**
 * Validates video MIME type and file extension
 */
export function validateVideoFileType(mimetype, originalname) {
  if (!ALLOWED_VIDEO_MIME_TYPES[mimetype]) {
    throw new Error("Invalid video type. Only MP4, WebM, and QuickTime (MOV) video files are permitted.");
  }
  const ext = path.extname(originalname || "").toLowerCase();
  const validExts = [".mp4", ".webm", ".mov"];
  if (ext && !validExts.includes(ext)) {
    throw new Error("Invalid video file extension. Only .mp4, .webm, and .mov are allowed.");
  }
  return ALLOWED_VIDEO_MIME_TYPES[mimetype];
}

/**
 * Validates binary magic bytes of video buffer against container signatures
 */
export function verifyVideoMagicBytes(buffer, mimetype) {
  if (!buffer || buffer.length < 8) {
    throw new Error("Invalid video buffer or file too small.");
  }

  // WebM: 1A 45 DF A3 (EBML header)
  if (mimetype === "video/webm") {
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return true;
    }
  }

  // MP4 and QuickTime MOV:
  // ISOBMFF starts with 4-byte atom size, then 4-byte atom type "ftyp" (0x66 0x74 0x79 0x70)
  // or common QuickTime atoms: "moov", "mdat", "wide"
  if (mimetype === "video/mp4" || mimetype === "video/quicktime") {
    const atomType = buffer.subarray(4, 8).toString("latin1");
    if (["ftyp", "moov", "mdat", "wide"].includes(atomType)) {
      return true;
    }
  }

  throw new Error(
    "File signature verification failed. The uploaded file content does not match its claimed video MIME type."
  );
}

/**
 * Memory-safe verification: reads only the first 64 bytes from disk
 */
export function verifyVideoFileMagicBytes(filePath, mimetype) {
  let fd = null;
  try {
    fd = fs.openSync(filePath, "r");
    const headerBuffer = Buffer.alloc(64);
    const bytesRead = fs.readSync(fd, headerBuffer, 0, 64, 0);
    if (bytesRead < 8) {
      throw new Error("Video file is corrupt or too small.");
    }
    return verifyVideoMagicBytes(headerBuffer.subarray(0, bytesRead), mimetype);
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch (e) {
        // ignore close error
      }
    }
  }
}

/**
 * Memory-safe video storage:
 * - Validates file signature from the temporary file on disk (reads only 64 bytes)
 * - Streams to S3 if configured, or moves to local destination
 * - Cleans up the temporary upload file
 */
export async function saveVideoFileFromDisk({ tempFilePath, mimetype, originalname, category = "films/videos" }) {
  const extension = validateVideoFileType(mimetype, originalname);
  verifyVideoFileMagicBytes(tempFilePath, mimetype);

  const cleanCategory = sanitizeCategory(category);
  const safeUniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
  const objectKey = `${cleanCategory}/${safeUniqueId}`;
  const stat = fs.statSync(tempFilePath);
  const fileSize = stat.size;

  // AWS S3 upload if bucket configured
  if (ENV.AWS_S3_BUCKET) {
    try {
      const s3Client = getS3Client();
      const fileStream = fs.createReadStream(tempFilePath);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET,
          Key: objectKey,
          Body: fileStream,
          ContentLength: fileSize,
          ContentType: mimetype,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.warn("Failed to delete temp video file:", err.message);
      }

      const cdnUrl = ENV.CLOUDFRONT_URL
        ? `${ENV.CLOUDFRONT_URL}/${objectKey}`
        : `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${objectKey}`;

      return {
        url: cdnUrl,
        key: objectKey,
        storage: "s3",
        size: fileSize,
      };
    } catch (err) {
      console.warn("S3 video upload failed, falling back to local storage:", err.message);
    }
  }

  // Local storage fallback for development
  const localUploadsDir = path.resolve(process.cwd(), "uploads", cleanCategory);
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }

  const destinationPath = path.join(localUploadsDir, safeUniqueId);

  // Move temp file to destination
  try {
    fs.renameSync(tempFilePath, destinationPath);
  } catch (err) {
    // Fallback if renaming across partitions fails: stream copy then unlink
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(tempFilePath);
      const writeStream = fs.createWriteStream(destinationPath);
      readStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
      readStream.pipe(writeStream);
    });
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      // ignore
    }
  }

  const localUrl = `/uploads/${cleanCategory}/${safeUniqueId}`;
  return {
    url: localUrl,
    key: objectKey,
    storage: "local",
    size: fileSize,
  };
}

/**
 * Safely deletes a file from local storage or S3
 */
export async function deleteStorageFile(fileUrlOrKey) {
  if (!fileUrlOrKey || typeof fileUrlOrKey !== "string") return false;

  try {
    // If it's a local /uploads/ URL
    if (fileUrlOrKey.startsWith("/uploads/")) {
      const relPath = fileUrlOrKey.replace(/^\/uploads\//, "");
      const fullPath = path.resolve(process.cwd(), "uploads", relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    }

    // If it's an S3 object key or URL
    if (ENV.AWS_S3_BUCKET) {
      let objectKey = fileUrlOrKey;
      if (fileUrlOrKey.startsWith("http://") || fileUrlOrKey.startsWith("https://")) {
        try {
          const urlObj = new URL(fileUrlOrKey);
          objectKey = urlObj.pathname.replace(/^\/+/, "");
        } catch (e) {
          // not a valid URL
        }
      }
      const s3Client = getS3Client();
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET,
          Key: objectKey,
        })
      );
      return true;
    }
  } catch (err) {
    console.warn("deleteStorageFile error:", err.message);
  }
  return false;
}

