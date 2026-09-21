import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// All notification endpoints require authenticated admin access
router.use(authenticateAdmin);

router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
