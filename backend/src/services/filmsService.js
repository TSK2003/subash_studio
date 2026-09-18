import prisma from "../config/prisma.js";

export async function getAllFilms(includeUnpublished = false) {
  const where = includeUnpublished ? {} : { published: true };
  return prisma.film.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
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

  return prisma.film.create({
    data: {
      id,
      title,
      category,
      videoUrl,
      duration,
      thumbnail,
      description,
      featured,
      published,
    },
  });
}

export async function updateFilm(id, data) {
  const updatePayload = {};

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.category !== undefined || data.type !== undefined) {
    updatePayload.category = data.category || data.type;
  }
  if (data.videoUrl !== undefined || data.youtubeUrl !== undefined) {
    updatePayload.videoUrl = (data.videoUrl || data.youtubeUrl || "").trim();
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

  return prisma.film.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteFilm(id) {
  return prisma.film.delete({
    where: { id },
  });
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
