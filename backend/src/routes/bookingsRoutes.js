import { Router } from "express";
import * as bookingsController from "../controllers/bookingsController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";
import { validateCreateBooking } from "../middleware/validation.js";

const router = Router();

// Public / client booking creation with rate-limiting and input validation
router.post("/", submissionLimiter, validateCreateBooking, bookingsController.createBooking);

// Protected admin endpoints
router.get("/", authenticateAdmin, bookingsController.getAllBookings);
router.put("/:id", authenticateAdmin, bookingsController.updateBooking);
router.delete("/:id", authenticateAdmin, bookingsController.deleteBooking);

export default router;
