import { Router } from "express";
import * as galleryController from "../controllers/galleryController.js";
import * as categoriesController from "../controllers/categoriesController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Category management
router.get("/categories", categoriesController.getGalleryCategories);
router.post("/categories", authenticateAdmin, categoriesController.createGalleryCategory);
router.patch("/categories/:id/toggle-status", authenticateAdmin, categoriesController.toggleGalleryCategoryStatus);

// Album routes
router.get("/albums", galleryController.getAllAlbums);
router.get("/albums/:slugOrId", galleryController.getAlbumBySlugOrId);
router.post("/albums", authenticateAdmin, galleryController.createAlbum);
router.put("/albums/:id", authenticateAdmin, galleryController.updateAlbum);
router.delete("/albums/:id", authenticateAdmin, galleryController.deleteAlbum);
router.patch("/albums/:id/toggle-published", authenticateAdmin, galleryController.toggleAlbumPublished);
router.post("/albums/:id/photos", authenticateAdmin, galleryController.addPhotosToAlbum);
router.put("/albums/:id/photos/:photoId", authenticateAdmin, galleryController.updateAlbumPhoto);
router.delete("/albums/:id/photos/:photoId", authenticateAdmin, galleryController.removePhotoFromAlbum);
router.put("/albums/:id/photos/reorder", authenticateAdmin, galleryController.reorderAlbumPhotos);
router.patch("/albums/:id/set-cover", authenticateAdmin, galleryController.setAlbumCover);

// Media Library for album photo picker
router.get("/media-library", authenticateAdmin, galleryController.getMediaLibrary);

// Legacy individual photo endpoints
router.get("/", galleryController.getAllGallery);
router.post("/", authenticateAdmin, galleryController.createGalleryItem);
router.put("/:id", authenticateAdmin, galleryController.updateGalleryItem);
router.delete("/:id", authenticateAdmin, galleryController.deleteGalleryItem);
router.patch("/:id/toggle-featured", authenticateAdmin, galleryController.toggleFeatured);
router.patch("/:id/toggle-published", authenticateAdmin, galleryController.togglePublished);

export default router;
