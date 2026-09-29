import { Router } from "express";
import * as portfolioController from "../controllers/portfolioController.js";
import * as categoriesController from "../controllers/categoriesController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Category management
router.get("/categories", categoriesController.getPortfolioCategories);
router.post("/categories", authenticateAdmin, categoriesController.createPortfolioCategory);
router.patch("/categories/:id/toggle-status", authenticateAdmin, categoriesController.togglePortfolioCategoryStatus);

// Public
router.get("/", portfolioController.getAllPortfolio);
router.get("/:id", portfolioController.getPortfolioById);

// Protected admin endpoints
router.post("/", authenticateAdmin, portfolioController.createPortfolioProject);
router.put("/:id", authenticateAdmin, portfolioController.updatePortfolioProject);
router.delete("/:id", authenticateAdmin, portfolioController.deletePortfolioProject);
router.patch("/:id/toggle-featured", authenticateAdmin, portfolioController.toggleFeatured);
router.patch("/:id/toggle-published", authenticateAdmin, portfolioController.togglePublished);

export default router;
