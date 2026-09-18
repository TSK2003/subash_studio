import { Router } from "express";
import * as servicesController from "../controllers/servicesController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", servicesController.getAllServices);
router.get("/:id", servicesController.getServiceById);

// Protected admin endpoints
router.post("/", authenticateAdmin, servicesController.createService);
router.put("/:id", authenticateAdmin, servicesController.updateService);
router.delete("/:id", authenticateAdmin, servicesController.deleteService);
router.patch("/:id/toggle-status", authenticateAdmin, servicesController.toggleStatus);

export default router;
