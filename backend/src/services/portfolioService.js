import prisma from "../config/prisma.js";

export async function getAllPortfolio(includeUnpublished = false) {
  const where = includeUnpublished ? {} : { published: true };
  return prisma.portfolioProject.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPortfolioById(id) {
  return prisma.portfolioProject.findUnique({
    where: { id },
  });
}

export async function createPortfolioProject(data) {
  const id = data.id || `PORT-${Math.floor(100 + Math.random() * 900)}`;
  const title = (data.title || data.client || "Subash Studio Story").trim();
  const subtitle = (data.subtitle || data.client || "").trim() || null;
  const category = data.category || "Wedding";
  const coverImage = (data.coverImage || data.image || data.imageUrl || "").trim();
  const eventDate = data.eventDate || null;
  const location = data.location || null;
  const description = (data.description || data.excerpt || "").trim();
  const images = Array.isArray(data.images) ? data.images : [];
  const featured = Boolean(data.featured);
  const published = data.published !== false;

  return prisma.portfolioProject.create({
    data: {
      id,
      title,
      subtitle,
      category,
      coverImage,
      eventDate,
      location,
      description,
      images,
      featured,
      published,
    },
  });
}

export async function updatePortfolioProject(id, data) {
  const updatePayload = {};

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.subtitle !== undefined) updatePayload.subtitle = data.subtitle ? data.subtitle.trim() : null;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.coverImage !== undefined || data.image !== undefined || data.imageUrl !== undefined) {
    updatePayload.coverImage = (data.coverImage || data.image || data.imageUrl || "").trim();
  }
  if (data.eventDate !== undefined) updatePayload.eventDate = data.eventDate || null;
  if (data.location !== undefined) updatePayload.location = data.location || null;
  if (data.description !== undefined || data.excerpt !== undefined) {
    updatePayload.description = (data.description || data.excerpt || "").trim();
  }
  if (data.images !== undefined) updatePayload.images = Array.isArray(data.images) ? data.images : [];
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.published !== undefined) updatePayload.published = Boolean(data.published);

  return prisma.portfolioProject.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deletePortfolioProject(id) {
  return prisma.portfolioProject.delete({
    where: { id },
  });
}

export async function togglePortfolioFeatured(id) {
  const item = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!item) throw new Error("Portfolio project not found.");

  return prisma.portfolioProject.update({
    where: { id },
    data: { featured: !item.featured },
  });
}

export async function togglePortfolioPublished(id) {
  const item = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!item) throw new Error("Portfolio project not found.");

  return prisma.portfolioProject.update({
    where: { id },
    data: { published: !item.published },
  });
}
