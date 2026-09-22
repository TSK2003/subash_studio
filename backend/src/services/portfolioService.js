import prisma from "../config/prisma.js";

function formatPortfolioProject(item) {
  if (!item) return item;
  return {
    ...item,
    featured: Boolean(item.featured),
    featuredOnHome: Boolean(item.featured),
    published: item.published !== false,
  };
}

export async function getAllPortfolio(options = false) {
  const isObject = typeof options === "object" && options !== null;
  const includeUnpublished = isObject
    ? Boolean(options.includeUnpublished || options.all)
    : Boolean(options);
  const featuredOnly = isObject
    ? Boolean(options.featuredOnly || options.featured || options.featuredOnHome || options.home)
    : false;
  const category = isObject ? options.category : null;
  const limit = isObject && options.limit ? parseInt(options.limit, 10) : undefined;

  const where = {};
  if (!includeUnpublished) {
    where.published = true;
  }
  if (featuredOnly) {
    where.featured = true;
  }
  if (category && category !== "ALL" && category !== "all") {
    where.category = category;
  }

  const items = await prisma.portfolioProject.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return items.map(formatPortfolioProject);
}

export async function getPortfolioById(id) {
  const item = await prisma.portfolioProject.findUnique({
    where: { id },
  });
  return formatPortfolioProject(item);
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
  const rawFeatured = data.featuredOnHome !== undefined ? data.featuredOnHome : data.featured;
  const featured = Boolean(rawFeatured);
  const published = data.published !== false;

  const created = await prisma.portfolioProject.create({
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

  return formatPortfolioProject(created);
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

  const rawFeatured = data.featuredOnHome !== undefined ? data.featuredOnHome : data.featured;
  if (rawFeatured !== undefined) {
    updatePayload.featured = Boolean(rawFeatured);
  }
  if (data.published !== undefined) updatePayload.published = Boolean(data.published);

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: updatePayload,
  });

  return formatPortfolioProject(updated);
}

export async function deletePortfolioProject(id) {
  return prisma.portfolioProject.delete({
    where: { id },
  });
}

export async function togglePortfolioFeatured(id) {
  const item = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!item) throw new Error("Portfolio project not found.");

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: { featured: !item.featured },
  });

  return formatPortfolioProject(updated);
}

export async function togglePortfolioPublished(id) {
  const item = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!item) throw new Error("Portfolio project not found.");

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: { published: !item.published },
  });

  return formatPortfolioProject(updated);
}
