import { Router } from "express";
import * as galleryController from "../controllers/galleryController.js";
import * as categoriesController from "../controllers/categoriesController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Category management
router.get("/categories", categoriesController.getGalleryCategories);
router.post("/categories", authenticateAdmin, categoriesController.createGalleryCategory);
router.patch("/categories/:id/toggle-status", authenticateAdmin, categoriesController.toggleGalleryCategoryStatus);

// Public: get published gallery items
router.get("/", galleryController.getAllGallery);

// Protected admin endpoints
router.post("/", authenticateAdmin, galleryController.createGalleryItem);
router.put("/:id", authenticateAdmin, galleryController.updateGalleryItem);
router.delete("/:id", authenticateAdmin, galleryController.deleteGalleryItem);
router.patch("/:id/toggle-featured", authenticateAdmin, galleryController.toggleFeatured);
router.patch("/:id/toggle-published", authenticateAdmin, galleryController.togglePublished);

export default router;
