import crypto from "node:crypto";
import prisma from "../config/prisma.js";

export async function getAllGallery(options = {}) {
  // Support both boolean includeUnpublished and object options for backward compatibility
  const isObject = typeof options === "object" && options !== null;
  const includeUnpublished = isObject ? Boolean(options.includeUnpublished || options.all) : Boolean(options);
  const category = isObject ? options.category : null;
  const page = isObject ? options.page : undefined;
  const limit = isObject ? options.limit : undefined;

  const where = {};
  if (!includeUnpublished) {
    where.published = true;
  }
  if (category && category !== "ALL" && category !== "all") {
    where.category = category;
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.galleryItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  return prisma.galleryItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createGalleryItem(data) {
  const id =
    data.id || `GAL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const title = (data.title || data.caption || "Subash Studio Gallery").trim();
  const category = data.category || "Wedding";
  const imageUrl = (data.imageUrl || data.src || "").trim();
  const aspect = data.aspect || "landscape";
  const featured = Boolean(data.featured);
  const published = data.published !== false;
  const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

  return prisma.galleryItem.create({
    data: {
      id,
      title,
      category,
      imageUrl,
      aspect,
      featured,
      published,
      createdAt,
    },
  });
}

export async function updateGalleryItem(id, data) {
  const updatePayload = {};

  if (data.title !== undefined || data.caption !== undefined) {
    updatePayload.title = (data.title || data.caption || "").trim();
  }
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.imageUrl !== undefined || data.src !== undefined) {
    updatePayload.imageUrl = (data.imageUrl || data.src || "").trim();
  }
  if (data.aspect !== undefined) updatePayload.aspect = data.aspect;
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.published !== undefined) updatePayload.published = Boolean(data.published);

  return prisma.galleryItem.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteGalleryItem(id) {
  return prisma.galleryItem.delete({
    where: { id },
  });
}
