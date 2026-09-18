import { Router } from "express";
import * as contentController from "../controllers/contentController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", contentController.getAllContent);
router.get("/:section", contentController.getContentBySection);

// Protected admin update
router.put("/:section", authenticateAdmin, contentController.updateContent);

export default router;
