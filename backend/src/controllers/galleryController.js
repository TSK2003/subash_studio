import * as galleryService from "../services/galleryService.js";

export async function getAllGallery(req, res, next) {
  try {
    const includeUnpublished = req.query.all === "true" || Boolean(req.user);
    const gallery = await galleryService.getAllGallery(includeUnpublished);
    res.json(gallery);
  } catch (err) {
    next(err);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const item = await galleryService.createGalleryItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryItem(req, res, next) {
  try {
    const item = await galleryService.updateGalleryItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    await galleryService.deleteGalleryItem(req.params.id);
    res.json({ success: true, message: "Gallery item deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const item = await galleryService.toggleGalleryFeatured(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function togglePublished(req, res, next) {
  try {
    const item = await galleryService.toggleGalleryPublished(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}
