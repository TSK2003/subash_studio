import * as galleryService from "../services/galleryService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

export async function getAllGallery(req, res, next) {
  try {
    const includeUnpublished = req.query.all === "true" || Boolean(req.user);
    const featuredOnly = req.query.featured === "true" || req.query.featuredOnly === "true";
    const gallery = await galleryService.getAllGallery({
      includeUnpublished,
      featuredOnly,
      category: req.query.category,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(gallery);
  } catch (err) {
    next(err);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const item = await galleryService.createGalleryItem(req.body);
    notifyDataChanged({ entity: "gallery", action: "created", id: item.id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryItem(req, res, next) {
  try {
    const item = await galleryService.updateGalleryItem(req.params.id, req.body);
    notifyDataChanged({ entity: "gallery", action: "updated", id: item.id });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    await galleryService.deleteGalleryItem(req.params.id);
    notifyDataChanged({ entity: "gallery", action: "deleted", id: req.params.id });
    res.json({ success: true, message: "Gallery item deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const item = await galleryService.toggleGalleryFeatured(req.params.id);
    notifyDataChanged({ entity: "gallery", action: "updated", id: item.id });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function togglePublished(req, res, next) {
  try {
    const item = await galleryService.toggleGalleryPublished(req.params.id);
    notifyDataChanged({ entity: "gallery", action: "updated", id: item.id });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
