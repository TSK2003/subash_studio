import { Router } from "express";
import * as branchesController from "../controllers/branchesController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", branchesController.getAllBranches);

// Protected admin endpoints
router.post("/", authenticateAdmin, branchesController.createBranch);
router.put("/:id", authenticateAdmin, branchesController.updateBranch);
router.delete("/:id", authenticateAdmin, branchesController.deleteBranch);
router.patch("/:id/toggle-status", authenticateAdmin, branchesController.toggleStatus);

export default router;
