import prisma from "../config/prisma.js";

export async function getAllGallery(includeUnpublished = false) {
  const where = includeUnpublished ? {} : { published: true };
  return prisma.galleryItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createGalleryItem(data) {
  const id = data.id || `GAL-${Math.floor(100 + Math.random() * 900)}`;
  const title = (data.title || data.caption || "Subash Studio Gallery").trim();
  const category = data.category || "Wedding";
  const imageUrl = (data.imageUrl || data.src || "").trim();
  const aspect = data.aspect || "landscape";
  const featured = Boolean(data.featured);
  const published = data.published !== false;
  const createdAt = data.createdAt || new Date().toISOString().split("T")[0];

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

export async function toggleGalleryFeatured(id) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  return prisma.galleryItem.update({
    where: { id },
    data: { featured: !item.featured },
  });
}

export async function toggleGalleryPublished(id) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  return prisma.galleryItem.update({
    where: { id },
    data: { published: !item.published },
  });
}
