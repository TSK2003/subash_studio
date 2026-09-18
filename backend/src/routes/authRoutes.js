import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateAuthLogin, validateChangePassword } from "../middleware/validation.js";

const router = Router();

router.post("/login", authLimiter, validateAuthLogin, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateAdmin, authController.getMe);
router.put("/profile", authenticateAdmin, authController.updateProfile);
router.post(
  "/change-password",
  authenticateAdmin,
  validateChangePassword,
  authController.changePassword
);

export default router;
