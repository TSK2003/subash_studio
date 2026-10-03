import * as galleryService from "../services/galleryService.js";
import { notifyDataChanged } from "../services/realtimeService.js";
import { verifyToken } from "../utils/token.js";

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

// =========================================================================
// ALBUMS CONTROLLERS
// =========================================================================

export async function getAllAlbums(req, res, next) {
  try {
    const includeUnpublished = req.query.all === "true" || Boolean(req.user);
    const albums = await galleryService.getAllAlbums({
      includeUnpublished,
      category: req.query.category,
      search: req.query.search,
    });
    res.json(albums);
  } catch (err) {
    next(err);
  }
}

export async function getAlbumBySlugOrId(req, res, next) {
  try {
    let hasAdmin = Boolean(req.user);
    if (!hasAdmin && req.headers?.authorization?.startsWith("Bearer ")) {
      const decoded = verifyToken(req.headers.authorization.split(" ")[1]);
      if (decoded?.userId) hasAdmin = true;
    }
    const includeUnpublished = req.query.all === "true" || hasAdmin;
    const album = await galleryService.getAlbumBySlugOrId(req.params.slugOrId, includeUnpublished);
    if (!album) {
      return res.status(404).json({ error: "Album not found or unavailable." });
    }
    res.json(album);
  } catch (err) {
    next(err);
  }
}

export async function createAlbum(req, res, next) {
  try {
    const album = await galleryService.createAlbum(req.body);
    notifyDataChanged({ entity: "gallery", action: "created", id: album.id });
    res.status(201).json(album);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create album." });
  }
}

export async function updateAlbum(req, res, next) {
  try {
    const album = await galleryService.updateAlbum(req.params.id, req.body);
    notifyDataChanged({ entity: "gallery", action: "updated", id: album.id });
    res.json(album);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update album." });
  }
}

export async function deleteAlbum(req, res, next) {
  try {
    await galleryService.deleteAlbum(req.params.id);
    notifyDataChanged({ entity: "gallery", action: "deleted", id: req.params.id });
    res.json({ success: true, message: "Album deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleAlbumPublished(req, res, next) {
  try {
    const album = await galleryService.toggleAlbumPublished(req.params.id);
    notifyDataChanged({ entity: "gallery", action: "updated", id: album.id });
    res.json(album);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to toggle album publishing." });
  }
}

export async function addPhotosToAlbum(req, res, next) {
  try {
    const photos = await galleryService.addPhotosToAlbum(req.params.id, req.body.photos || req.body);
    notifyDataChanged({ entity: "gallery", action: "updated", id: req.params.id });
    res.status(201).json({ success: true, count: photos.length, photos });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to add photos to album." });
  }
}

export async function updateAlbumPhoto(req, res, next) {
  try {
    const photo = await galleryService.updateAlbumPhoto(req.params.id, req.params.photoId, req.body);
    notifyDataChanged({ entity: "gallery", action: "updated", id: req.params.id });
    res.json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update album photo." });
  }
}

export async function removePhotoFromAlbum(req, res, next) {
  try {
    const result = await galleryService.removePhotoFromAlbum(req.params.id, req.params.photoId);
    notifyDataChanged({ entity: "gallery", action: "updated", id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to remove photo from album." });
  }
}

export async function reorderAlbumPhotos(req, res, next) {
  try {
    const photos = await galleryService.reorderAlbumPhotos(req.params.id, req.body.photoOrders || req.body);
    notifyDataChanged({ entity: "gallery", action: "updated", id: req.params.id });
    res.json(photos);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to reorder photos." });
  }
}

export async function setAlbumCover(req, res, next) {
  try {
    const album = await galleryService.setAlbumCover(req.params.id, req.body.coverUrl || req.body.coverImage);
    notifyDataChanged({ entity: "gallery", action: "updated", id: album.id });
    res.json(album);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to set album cover." });
  }
}

export async function getMediaLibrary(req, res, next) {
  try {
    const media = await galleryService.getMediaLibrary({ category: req.query.category });
    res.json(media);
  } catch (err) {
    next(err);
  }
}

