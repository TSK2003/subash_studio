import { saveFile, saveVideoFileFromDisk, deleteStorageFile } from "../utils/storage.js";
import fs from "node:fs";

export async function handleUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file was uploaded. Please provide an image file.",
      });
    }

    const category = req.query.category || req.body.category || "general";
    const result = await saveFile({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      category,
    });

    res.status(201).json({
      success: true,
      url: result.url,
      originalUrl: result.originalUrl,
      thumbnailUrl: result.thumbnailUrl,
      mediumUrl: result.mediumUrl,
      variants: result.variants,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.size,
      originalSize: result.originalSize,
      savingsPercent: result.savingsPercent,
      key: result.key,
      storage: result.storage,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || "Failed to process image upload.",
    });
  }
}

export async function handleVideoUpload(req, res, next) {
  const tempFilePath = req.file?.path;
  try {
    if (!req.file || !tempFilePath) {
      return res.status(400).json({
        success: false,
        error: "No video file was uploaded. Please provide an MP4, WebM, or QuickTime (MOV) video file.",
      });
    }

    const category = req.query.category || req.body.category || "films/videos";
    const result = await saveVideoFileFromDisk({
      tempFilePath,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      category,
    });

    res.status(201).json({
      success: true,
      url: result.url,
      key: result.key,
      storage: result.storage,
      size: result.size,
      filename: req.file.originalname,
    });
  } catch (err) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore
      }
    }
    res.status(400).json({
      success: false,
      error: err.message || "Failed to process video upload.",
    });
  }
}

export async function handleDeleteUpload(req, res, next) {
  try {
    const fileUrl = req.body?.url || req.query?.url;
    if (!fileUrl) {
      return res.status(400).json({ success: false, error: "Missing file URL to delete." });
    }
    const deleted = await deleteStorageFile(fileUrl);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete file." });
  }
}
