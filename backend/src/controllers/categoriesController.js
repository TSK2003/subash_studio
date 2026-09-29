import * as categoriesService from "../services/categoriesService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

// ==================== PORTFOLIO CATEGORIES ====================

export async function getPortfolioCategories(req, res, next) {
  try {
    const includeInactive = req.query.all === "true";
    const categories = await categoriesService.getAllCategories("PORTFOLIO", includeInactive);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createPortfolioCategory(req, res, next) {
  try {
    const name = (req.body?.name || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, error: "Category name is required." });
    }
    const category = await categoriesService.createCategory({
      name,
      type: "PORTFOLIO",
    });
    notifyDataChanged({ entity: "portfolio_categories", action: "created", id: category.id });
    res.status(201).json(category);
  } catch (err) {
    if (err.statusCode === 409 || err.status === 409) {
      return res.status(409).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function togglePortfolioCategoryStatus(req, res, next) {
  try {
    const category = await categoriesService.toggleCategoryStatus(req.params.id);
    notifyDataChanged({ entity: "portfolio_categories", action: "status_changed", id: category.id });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

// ==================== GALLERY CATEGORIES ====================

export async function getGalleryCategories(req, res, next) {
  try {
    const includeInactive = req.query.all === "true";
    const categories = await categoriesService.getAllCategories("GALLERY", includeInactive);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createGalleryCategory(req, res, next) {
  try {
    const name = (req.body?.name || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, error: "Category name is required." });
    }
    const category = await categoriesService.createCategory({
      name,
      type: "GALLERY",
    });
    notifyDataChanged({ entity: "gallery_categories", action: "created", id: category.id });
    res.status(201).json(category);
  } catch (err) {
    if (err.statusCode === 409 || err.status === 409) {
      return res.status(409).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function toggleGalleryCategoryStatus(req, res, next) {
  try {
    const category = await categoriesService.toggleCategoryStatus(req.params.id);
    notifyDataChanged({ entity: "gallery_categories", action: "status_changed", id: category.id });
    res.json(category);
  } catch (err) {
    next(err);
  }
}
