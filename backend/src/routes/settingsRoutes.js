import { Router } from "express";
import * as settingsController from "../controllers/settingsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Protected admin endpoints
router.get("/backup/snapshot", authenticateAdmin, settingsController.exportDataSnapshot);
router.get("/", authenticateAdmin, settingsController.getAllSettings);
router.get("/:section", authenticateAdmin, settingsController.getSettingsBySection);
router.put("/:section", authenticateAdmin, settingsController.updateSettings);

export default router;
