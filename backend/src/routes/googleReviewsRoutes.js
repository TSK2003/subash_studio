import { Router } from "express";
import * as googleReviewsController from "../controllers/googleReviewsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public / Vite compatibility endpoints
router.get("/status", googleReviewsController.getStatus);
router.get("/", googleReviewsController.fetchReviews);
router.post("/sync", authenticateAdmin, googleReviewsController.fetchReviews);

// OAuth flows
router.get("/url", authenticateAdmin, googleReviewsController.getAuthUrl);
router.get("/callback", googleReviewsController.handleCallback);
router.post("/disconnect", authenticateAdmin, googleReviewsController.disconnect);

export default router;
