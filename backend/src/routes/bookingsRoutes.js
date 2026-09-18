import { Router } from "express";
import * as bookingsController from "../controllers/bookingsController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public / client booking creation
router.post("/", submissionLimiter, bookingsController.createBooking);

// Protected admin endpoints
router.get("/", authenticateAdmin, bookingsController.getAllBookings);
router.put("/:id", authenticateAdmin, bookingsController.updateBooking);
router.delete("/:id", authenticateAdmin, bookingsController.deleteBooking);

export default router;
