import { Router } from "express";
import * as framesController from "../controllers/framesController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { submissionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ==========================================
// WOOD TYPES
// ==========================================
router.get("/wood-types", framesController.getWoodTypes);
router.post("/wood-types", authenticateAdmin, framesController.createWoodType);
router.put("/wood-types/:id", authenticateAdmin, framesController.updateWoodType);
router.delete("/wood-types/:id", authenticateAdmin, framesController.deleteWoodType);
router.patch("/wood-types/:id/toggle-status", authenticateAdmin, framesController.toggleWoodType);

// ==========================================
// DESIGNS
// ==========================================
router.get("/designs", framesController.getDesigns);
router.post("/designs", authenticateAdmin, framesController.createDesign);
router.put("/designs/:id", authenticateAdmin, framesController.updateDesign);
router.delete("/designs/:id", authenticateAdmin, framesController.deleteDesign);
router.patch("/designs/:id/toggle-status", authenticateAdmin, framesController.toggleDesign);

// ==========================================
// RATIOS
// ==========================================
router.get("/ratios", framesController.getRatios);
router.post("/ratios", authenticateAdmin, framesController.createRatio);
router.put("/ratios/:id", authenticateAdmin, framesController.updateRatio);
router.delete("/ratios/:id", authenticateAdmin, framesController.deleteRatio);
router.patch("/ratios/:id/toggle-status", authenticateAdmin, framesController.toggleRatio);

// ==========================================
// ORDERS
// ==========================================
// Public order submission from /frames atelier
router.post("/orders", submissionLimiter, framesController.createOrder);

// Protected admin order management
router.get("/orders", authenticateAdmin, framesController.getOrders);
router.get("/orders/:id", authenticateAdmin, framesController.getOrderById);
router.put("/orders/:id", authenticateAdmin, framesController.updateOrder);
router.patch("/orders/:id/status", authenticateAdmin, framesController.updateOrderStatus);
router.delete("/orders/:id", authenticateAdmin, framesController.deleteOrder);

export default router;
