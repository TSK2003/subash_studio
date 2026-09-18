import { Router } from "express";
import * as filmsController from "../controllers/filmsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", filmsController.getAllFilms);

// Protected admin endpoints
router.post("/", authenticateAdmin, filmsController.createFilm);
router.put("/:id", authenticateAdmin, filmsController.updateFilm);
router.delete("/:id", authenticateAdmin, filmsController.deleteFilm);
router.patch("/:id/toggle-featured", authenticateAdmin, filmsController.toggleFeatured);
router.patch("/:id/toggle-published", authenticateAdmin, filmsController.togglePublished);

export default router;
