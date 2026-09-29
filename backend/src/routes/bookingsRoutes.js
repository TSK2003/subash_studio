import { Router } from "express";
import * as bookingsController from "../controllers/bookingsController.js";
import { authenticateAdmin, requireAdminPassword } from "../middleware/auth.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";
import { validateCreateBooking, validateUpdateBooking } from "../middleware/validation.js";

const router = Router();

// Public / client booking creation with rate-limiting and input validation
router.post("/", submissionLimiter, validateCreateBooking, bookingsController.createBooking);

// Protected admin endpoints
router.get("/", authenticateAdmin, bookingsController.getAllBookings);
router.put("/:id", authenticateAdmin, validateUpdateBooking, bookingsController.updateBooking);
router.delete("/:id", authenticateAdmin, requireAdminPassword, bookingsController.deleteBooking);

export default router;
