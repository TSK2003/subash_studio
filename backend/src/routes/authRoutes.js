import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateAdmin, authController.getMe);
router.put("/profile", authenticateAdmin, authController.updateProfile);
router.post("/change-password", authenticateAdmin, authController.changePassword);

export default router;
