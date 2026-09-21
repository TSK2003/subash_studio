import { Router } from "express";
import { upload, videoUpload } from "../middleware/upload.js";
import { handleUpload, handleVideoUpload } from "../controllers/uploadController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Protected admin upload endpoint — reject unauthenticated uploads
router.post(
  "/",
  authenticateAdmin,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      if (req.file) return next();

      // If 'file' wasn't sent, try 'image'
      upload.single("image")(req, res, (err2) => {
        if (err2) {
          return res.status(400).json({ success: false, error: err2.message });
        }
        next();
      });
    });
  },
  handleUpload
);

// Protected admin video upload endpoint (100MB limit, disk streaming)
router.post(
  "/video",
  authenticateAdmin,
  (req, res, next) => {
    videoUpload.single("file")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "Video file exceeds maximum size limit of 100MB.",
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      if (req.file) return next();

      // If 'file' wasn't sent, try 'video'
      videoUpload.single("video")(req, res, (err2) => {
        if (err2) {
          if (err2.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: "Video file exceeds maximum size limit of 100MB.",
            });
          }
          return res.status(400).json({ success: false, error: err2.message });
        }
        next();
      });
    });
  },
  handleVideoUpload
);

export default router;

