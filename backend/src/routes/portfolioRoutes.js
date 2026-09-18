import { Router } from "express";
import * as portfolioController from "../controllers/portfolioController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

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
