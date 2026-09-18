import { Router } from "express";
import * as galleryController from "../controllers/galleryController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public: get published gallery items
router.get("/", galleryController.getAllGallery);

// Protected admin endpoints
router.post("/", authenticateAdmin, galleryController.createGalleryItem);
router.put("/:id", authenticateAdmin, galleryController.updateGalleryItem);
router.delete("/:id", authenticateAdmin, galleryController.deleteGalleryItem);
router.patch("/:id/toggle-featured", authenticateAdmin, galleryController.toggleFeatured);
router.patch("/:id/toggle-published", authenticateAdmin, galleryController.togglePublished);

export default router;
