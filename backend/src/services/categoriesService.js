import prisma from "../config/prisma.js";

/**
 * Normalize category type: "PORTFOLIO" or "GALLERY"
 */
function normalizeType(type) {
  if (!type) return "PORTFOLIO";
  const upper = String(type).trim().toUpperCase();
  return upper === "GALLERY" ? "GALLERY" : "PORTFOLIO";
}

/**
 * Get categories by type
 * @param {string} type - "PORTFOLIO" | "GALLERY"
 * @param {boolean} includeInactive - whether to include inactive categories
 */
export async function getAllCategories(type = "PORTFOLIO", includeInactive = false) {
  const normalizedType = normalizeType(type);
  const where = {
    type: normalizedType,
    ...(includeInactive ? {} : { active: true }),
  };

  return prisma.category.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get category by ID
 */
export async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: { id },
  });
}

/**
 * Create a new category
 */
export async function createCategory({ name, type = "PORTFOLIO" }) {
  const normalizedType = normalizeType(type);
  const trimmedName = (name || "").trim();

  if (!trimmedName) {
    const error = new Error("Category name is required.");
    error.statusCode = 400;
    error.status = 400;
    throw error;
  }

  // Case-insensitive duplicate check
  const existing = await prisma.category.findFirst({
    where: {
      type: normalizedType,
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    const error = new Error("This category already exists.");
    error.statusCode = 409;
    error.status = 409;
    throw error;
  }

  const slug = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const prefix = normalizedType === "GALLERY" ? "CAT-GAL" : "CAT-PORT";
  const id = `${prefix}-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;

  const created = await prisma.category.create({
    data: {
      id,
      name: trimmedName,
      slug: slug || "category",
      type: normalizedType,
      active: true, // Always ACTIVE by default
    },
  });

  return created;
}

/**
 * Toggle category active/inactive status
 */
export async function toggleCategoryStatus(id) {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Category not found.");
    error.status = 404;
    throw error;
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      active: !existing.active,
    },
  });

  return updated;
}
