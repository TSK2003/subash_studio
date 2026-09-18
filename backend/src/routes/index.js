import { Router } from "express";
import authRoutes from "./authRoutes.js";
import bookingsRoutes from "./bookingsRoutes.js";
import enquiriesRoutes from "./enquiriesRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import portfolioRoutes from "./portfolioRoutes.js";
import servicesRoutes from "./servicesRoutes.js";
import filmsRoutes from "./filmsRoutes.js";
import branchesRoutes from "./branchesRoutes.js";
import testimonialsRoutes from "./testimonialsRoutes.js";
import googleReviewsRoutes from "./googleReviewsRoutes.js";
import framesRoutes from "./framesRoutes.js";
import contentRoutes from "./contentRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Subash Studio API",
    timestamp: new Date().toISOString(),
  });
});

// Sub-routers
router.use("/auth", authRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/enquiries", enquiriesRoutes);
router.use("/gallery", galleryRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/services", servicesRoutes);
router.use("/films", filmsRoutes);
router.use("/branches", branchesRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/google-reviews", googleReviewsRoutes);
router.use("/frames", framesRoutes);
router.use("/content", contentRoutes);
router.use("/settings", settingsRoutes);
router.use("/uploads", uploadRoutes);

export default router;
