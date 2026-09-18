import { Router } from "express";
import * as testimonialsController from "../controllers/testimonialsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", testimonialsController.getAllTestimonials);
router.get("/google-meta", testimonialsController.getGoogleMeta);

// Protected admin endpoints
router.post("/", authenticateAdmin, testimonialsController.createTestimonial);
router.put("/:id", authenticateAdmin, testimonialsController.updateTestimonial);
router.delete("/:id", authenticateAdmin, testimonialsController.deleteTestimonial);
router.patch("/:id/toggle-approved", authenticateAdmin, testimonialsController.toggleApproved);
router.patch("/:id/toggle-featured", authenticateAdmin, testimonialsController.toggleFeatured);
router.patch("/:id/toggle-hidden", authenticateAdmin, testimonialsController.toggleHidden);
router.post("/sync-google", authenticateAdmin, testimonialsController.syncReviews);

export default router;
