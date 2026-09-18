import { saveFile } from "../utils/storage.js";

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
