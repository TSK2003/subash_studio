import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { handleUpload } from "../controllers/uploadController.js";
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

export default router;
