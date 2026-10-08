import prisma from "../config/prisma.js";
import { getCached, setCached, invalidateCache } from "../utils/cache.js";

export async function getAllServices() {
  const cached = getCached("services:all");
  if (cached) return cached;

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  setCached("services:all", services, 120);
  return services;
}

export async function getServiceById(id) {
  return prisma.service.findUnique({
    where: { id },
  });
}

export async function createService(data) {
  invalidateCache("services");
  const id = data.id || `SRV-${Math.floor(100 + Math.random() * 900)}`;
  const name = (data.name || data.title || "Subash Studio Service").trim();
  const slug = data.slug || name.toLowerCase().replace(/\s+/g, "-");
  const image = (data.image || data.imageUrl || "/images/services/wedding-photography.jpg").trim();
  const shortDesc = (data.shortDesc || data.blurb || data.description || "").trim();
  const fullDesc = (data.fullDesc || data.description || shortDesc).trim();
  const startingPrice = data.startingPrice || data.price || "₹50,000";
  const features = Array.isArray(data.features) ? data.features : [];
  const status = data.status || "Active";

  return prisma.service.create({
    data: {
      id,
      name,
      slug,
      image,
      shortDesc,
      fullDesc,
      startingPrice,
      features,
      status,
    },
  });
}

export async function updateService(id, data) {
  const updatePayload = {};

  if (data.name !== undefined || data.title !== undefined) {
    updatePayload.name = (data.name || data.title || "").trim();
  }
  if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
  if (data.image !== undefined || data.imageUrl !== undefined) {
    updatePayload.image = (data.image || data.imageUrl || "").trim();
  }
  if (data.shortDesc !== undefined || data.blurb !== undefined) {
    updatePayload.shortDesc = (data.shortDesc || data.blurb || "").trim();
  }
  if (data.fullDesc !== undefined || data.description !== undefined) {
    updatePayload.fullDesc = (data.fullDesc || data.description || "").trim();
  }
  if (data.startingPrice !== undefined || data.price !== undefined) {
    updatePayload.startingPrice = data.startingPrice || data.price;
  }
  if (data.features !== undefined) {
    updatePayload.features = Array.isArray(data.features) ? data.features : [];
  }
  if (data.status !== undefined) updatePayload.status = data.status;

  invalidateCache("services");
  return prisma.service.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteService(id) {
  invalidateCache("services");
  return prisma.service.delete({
    where: { id },
  });
}

export async function toggleServiceStatus(id) {
  invalidateCache("services");
  const item = await prisma.service.findUnique({ where: { id } });
  if (!item) throw new Error("Service not found.");

  const nextStatus = item.status === "Active" ? "Inactive" : "Active";
  return prisma.service.update({
    where: { id },
    data: { status: nextStatus },
  });
}
