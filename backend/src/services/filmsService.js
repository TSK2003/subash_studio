import prisma from "../config/prisma.js";
import { deleteStorageFile } from "../utils/storage.js";

/**
 * Authoritative video URL parser for YouTube and Vimeo.
 * Returns provider, video ID, and sanitized embed URL or null if invalid.
 */
export function parseVideoUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // YouTube match: standard watch, embed, shorts, youtu.be, youtube-nocookie
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      provider: "youtube",
      id: ytMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo match: standard vimeo, channels, groups, player.vimeo.com
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  const vimeoId = vimeoMatch ? vimeoMatch[1] || vimeoMatch[2] : null;
  if (vimeoId) {
    return {
      provider: "vimeo",
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&autopause=0&player_id=0`,
    };
  }

  return null;
}

/**
 * Resolves video source type for legacy records or missing fields
 */
export function inferVideoSourceType(videoUrl, currentSourceType) {
  if (currentSourceType === "upload" || currentSourceType === "external") {
    return currentSourceType;
  }
  if (!videoUrl) return "external";

  if (parseVideoUrl(videoUrl)) {
    return "external";
  }

  if (
    videoUrl.startsWith("/uploads/") ||
    videoUrl.includes("/films/videos/") ||
    /\.(mp4|webm|mov)(\?.*)?$/i.test(videoUrl)
  ) {
    return "upload";
  }

  return "external";
}

export async function getAllFilms(includeUnpublished = false) {
  const where = includeUnpublished ? {} : { published: true };
  const films = await prisma.film.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return films.map((film) => ({
    ...film,
    videoSourceType: inferVideoSourceType(film.videoUrl, film.videoSourceType),
  }));
}

export async function createFilm(data) {
  const id = data.id || `FLM-${Math.floor(100 + Math.random() * 900)}`;
  const title = (data.title || "Subash Studio Film").trim();
  const category = data.category || data.type || "Wedding Film";
  const videoUrl = (data.videoUrl || data.youtubeUrl || "").trim();
  const duration = data.duration || "Highlight";
  const thumbnail = (data.thumbnail || data.posterImage || data.poster || "").trim();
  const description = (data.description || "").trim() || null;
  const featured = Boolean(data.featured);
  const published = data.published !== false;

  const rawSourceType = data.videoSourceType ? String(data.videoSourceType).toLowerCase() : null;
  const videoSourceType = rawSourceType || inferVideoSourceType(videoUrl);

  // Authoritative Validation
  if (videoSourceType === "external") {
    if (!videoUrl) {
      throw new Error("A valid YouTube or Vimeo URL is required for external video sources.");
    }
    const parsed = parseVideoUrl(videoUrl);
    if (!parsed) {
      throw new Error("Invalid external video URL. Only YouTube and Vimeo URLs are permitted.");
    }
  } else if (videoSourceType === "upload") {
    if (!videoUrl) {
      throw new Error("A video file must be uploaded for uploaded video source.");
    }
    const isLocalUpload = videoUrl.startsWith("/uploads/");
    const isS3Upload = videoUrl.startsWith("http://") || videoUrl.startsWith("https://");
    const hasVideoExt = /\.(mp4|webm|mov)(\?.*)?$/i.test(videoUrl);
    if (!((isLocalUpload || isS3Upload) && (hasVideoExt || videoUrl.includes("films/videos")))) {
      throw new Error("Invalid uploaded video path. Please upload a valid MP4, WebM, or MOV video file.");
    }
  } else {
    throw new Error("Invalid videoSourceType. Must be 'external' or 'upload'.");
  }

  return prisma.film.create({
    data: {
      id,
      title,
      category,
      videoUrl,
      videoSourceType,
      duration,
      thumbnail,
      description,
      featured,
      published,
    },
  });
}

export async function updateFilm(id, data) {
  const existingFilm = await prisma.film.findUnique({ where: { id } });
  if (!existingFilm) throw new Error("Film not found.");

  const updatePayload = {};

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.category !== undefined || data.type !== undefined) {
    updatePayload.category = data.category || data.type;
  }
  if (data.duration !== undefined) updatePayload.duration = data.duration;
  if (data.thumbnail !== undefined || data.posterImage !== undefined || data.poster !== undefined) {
    updatePayload.thumbnail = (data.thumbnail || data.posterImage || data.poster || "").trim();
  }
  if (data.description !== undefined) {
    updatePayload.description = data.description ? data.description.trim() : null;
  }
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.published !== undefined) updatePayload.published = Boolean(data.published);

  const targetSourceType =
    data.videoSourceType !== undefined
      ? String(data.videoSourceType).toLowerCase()
      : existingFilm.videoSourceType || inferVideoSourceType(existingFilm.videoUrl);

  const targetVideoUrl =
    data.videoUrl !== undefined || data.youtubeUrl !== undefined
      ? (data.videoUrl || data.youtubeUrl || "").trim()
      : existingFilm.videoUrl;

  // Validate if either videoSourceType or videoUrl was updated
  if (data.videoSourceType !== undefined || data.videoUrl !== undefined || data.youtubeUrl !== undefined) {
    if (targetSourceType === "external") {
      if (!targetVideoUrl) {
        throw new Error("A valid YouTube or Vimeo URL is required for external video sources.");
      }
      const parsed = parseVideoUrl(targetVideoUrl);
      if (!parsed) {
        throw new Error("Invalid external video URL. Only YouTube and Vimeo URLs are permitted.");
      }
    } else if (targetSourceType === "upload") {
      if (!targetVideoUrl) {
        throw new Error("A video file must be uploaded for uploaded video source.");
      }
      const isLocalUpload = targetVideoUrl.startsWith("/uploads/");
      const isS3Upload = targetVideoUrl.startsWith("http://") || targetVideoUrl.startsWith("https://");
      const hasVideoExt = /\.(mp4|webm|mov)(\?.*)?$/i.test(targetVideoUrl);
      if (!((isLocalUpload || isS3Upload) && (hasVideoExt || targetVideoUrl.includes("films/videos")))) {
        throw new Error("Invalid uploaded video path. Please upload a valid MP4, WebM, or MOV video file.");
      }
    } else {
      throw new Error("Invalid videoSourceType. Must be 'external' or 'upload'.");
    }

    updatePayload.videoSourceType = targetSourceType;
    updatePayload.videoUrl = targetVideoUrl;
  }

  // 1. Update the database record FIRST
  const updatedFilm = await prisma.film.update({
    where: { id },
    data: updatePayload,
  });

  // 2. VIDEO REPLACEMENT SAFETY:
  // If the database update succeeded AND the old video was an uploaded video file that changed,
  // clean up the previous video file. If update had failed, this line is never reached.
  const oldWasUpload =
    existingFilm.videoSourceType === "upload" ||
    existingFilm.videoUrl?.startsWith("/uploads/") ||
    existingFilm.videoUrl?.includes("/films/videos/");
  const urlChanged = targetVideoUrl !== existingFilm.videoUrl;

  if (oldWasUpload && urlChanged && existingFilm.videoUrl) {
    deleteStorageFile(existingFilm.videoUrl).catch((err) =>
      console.warn("Could not delete old video file during replacement:", err.message)
    );
  }

  return updatedFilm;
}

export async function deleteFilm(id) {
  const existingFilm = await prisma.film.findUnique({ where: { id } });
  if (!existingFilm) throw new Error("Film not found.");

  const deleted = await prisma.film.delete({
    where: { id },
  });

  // After record deletion, clean up uploaded video file if applicable
  const wasUpload =
    existingFilm.videoSourceType === "upload" ||
    existingFilm.videoUrl?.startsWith("/uploads/") ||
    existingFilm.videoUrl?.includes("/films/videos/");

  if (wasUpload && existingFilm.videoUrl) {
    deleteStorageFile(existingFilm.videoUrl).catch((err) =>
      console.warn("Could not delete video file during film deletion:", err.message)
    );
  }

  return deleted;
}

export async function toggleFilmFeatured(id) {
  const item = await prisma.film.findUnique({ where: { id } });
  if (!item) throw new Error("Film not found.");

  return prisma.film.update({
    where: { id },
    data: { featured: !item.featured },
  });
}

export async function toggleFilmPublished(id) {
  const item = await prisma.film.findUnique({ where: { id } });
  if (!item) throw new Error("Film not found.");

  return prisma.film.update({
    where: { id },
    data: { published: !item.published },
  });
}

