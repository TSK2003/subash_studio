import { Router } from "express";
import * as enquiriesController from "../controllers/enquiriesController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public contact form inquiry creation
router.post("/", submissionLimiter, enquiriesController.createEnquiry);

// Protected admin endpoints
router.get("/", authenticateAdmin, enquiriesController.getAllEnquiries);
router.put("/:id", authenticateAdmin, enquiriesController.updateEnquiry);
router.patch("/:id", authenticateAdmin, enquiriesController.updateEnquiry);
router.delete("/:id", authenticateAdmin, enquiriesController.deleteEnquiry);

export default router;
