import prisma from "../config/prisma.js";

// ==========================================
// 1. FRAME WOOD TYPES
// ==========================================

export async function getWoodTypes(includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  return prisma.frameWoodType.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
}

export async function createWoodType(data) {
  const id = data.id || `wood-${Date.now()}`;
  return prisma.frameWoodType.create({
    data: {
      id,
      name: data.name.trim(),
      basePrice: Number(data.basePrice) || 0,
      description: (data.description || "").trim(),
      grain: (data.grain || "").trim(),
      image: (data.image || "").trim(),
      active: data.active !== false,
    },
  });
}

export async function updateWoodType(id, data) {
  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.basePrice !== undefined) updatePayload.basePrice = Number(data.basePrice) || 0;
  if (data.description !== undefined) updatePayload.description = data.description.trim();
  if (data.grain !== undefined) updatePayload.grain = data.grain.trim();
  if (data.image !== undefined) updatePayload.image = data.image.trim();
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  return prisma.frameWoodType.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteWoodType(id) {
  return prisma.frameWoodType.delete({
    where: { id },
  });
}

export async function toggleWoodType(id) {
  const item = await prisma.frameWoodType.findUnique({ where: { id } });
  if (!item) throw new Error("Frame wood type not found.");

  return prisma.frameWoodType.update({
    where: { id },
    data: { active: !item.active },
  });
}

// ==========================================
// 2. FRAME DESIGNS
// ==========================================

export async function getDesigns(includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  return prisma.frameDesign.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
}

export async function createDesign(data) {
  const id = data.id || `design-${Date.now()}`;
  return prisma.frameDesign.create({
    data: {
      id,
      name: data.name.trim(),
      additionalPrice: Number(data.additionalPrice) || 0,
      description: (data.description || "").trim(),
      image: (data.image || "").trim(),
      compatibleWoods: Array.isArray(data.compatibleWoods) ? data.compatibleWoods : ["All"],
      active: data.active !== false,
    },
  });
}

export async function updateDesign(id, data) {
  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.additionalPrice !== undefined) updatePayload.additionalPrice = Number(data.additionalPrice) || 0;
  if (data.description !== undefined) updatePayload.description = data.description.trim();
  if (data.image !== undefined) updatePayload.image = data.image.trim();
  if (data.compatibleWoods !== undefined) {
    updatePayload.compatibleWoods = Array.isArray(data.compatibleWoods) ? data.compatibleWoods : ["All"];
  }
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  return prisma.frameDesign.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteDesign(id) {
  return prisma.frameDesign.delete({
    where: { id },
  });
}

export async function toggleDesign(id) {
  const item = await prisma.frameDesign.findUnique({ where: { id } });
  if (!item) throw new Error("Frame design not found.");

  return prisma.frameDesign.update({
    where: { id },
    data: { active: !item.active },
  });
}

// ==========================================
// 3. FRAME RATIOS
// ==========================================

export async function getRatios(includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  return prisma.frameRatio.findMany({
    where,
    orderBy: { price: "asc" },
  });
}

export async function createRatio(data) {
  const id = data.id || `ratio-${Date.now()}`;
  return prisma.frameRatio.create({
    data: {
      id,
      name: data.name.trim(),
      label: (data.label || data.name).trim(),
      dimensions: (data.dimensions || "").trim(),
      price: Number(data.price) || 0,
      aspect: data.aspect || "landscape",
      popular: Boolean(data.popular),
      active: data.active !== false,
    },
  });
}

export async function updateRatio(id, data) {
  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.label !== undefined) updatePayload.label = data.label.trim();
  if (data.dimensions !== undefined) updatePayload.dimensions = data.dimensions.trim();
  if (data.price !== undefined) updatePayload.price = Number(data.price) || 0;
  if (data.aspect !== undefined) updatePayload.aspect = data.aspect;
  if (data.popular !== undefined) updatePayload.popular = Boolean(data.popular);
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  return prisma.frameRatio.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteRatio(id) {
  return prisma.frameRatio.delete({
    where: { id },
  });
}

export async function toggleRatio(id) {
  const item = await prisma.frameRatio.findUnique({ where: { id } });
  if (!item) throw new Error("Frame ratio not found.");

  return prisma.frameRatio.update({
    where: { id },
    data: { active: !item.active },
  });
}

// ==========================================
// 4. FRAME ORDERS (IMMUTABLE SNAPSHOT PRICING)
// ==========================================

const VALID_ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function normalizeOrderStatus(status) {
  if (!status) return "NEW";
  const upper = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
  return VALID_ORDER_STATUSES.includes(upper) ? upper : "NEW";
}

export async function getOrders() {
  return prisma.frameOrder.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id) {
  return prisma.frameOrder.findUnique({
    where: { id },
  });
}

export async function createOrder(data) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(100 + Math.random() * 900);
  const id = data.id || `SS-FR-${today}-${rand}`;

  const customerName = (data.customerName || data.name || "Client").trim();
  const phone = (data.phone || "").trim();
  const whatsapp = data.whatsapp ? data.whatsapp.trim() : null;
  const email = (data.email || "").trim();
  const deliveryType = data.deliveryType || "Studio Pickup";
  const address = (data.address || "").trim();
  const notes = data.notes ? data.notes.trim() : null;

  // Historical snapshot pricing immutability
  const woodType = data.woodType || "Teak";
  const woodPrice = Number(data.woodPrice) || 0;
  const frameDesign = data.frameDesign || "Classic";
  const designPrice = Number(data.designPrice) || 0;
  const frameRatio = data.frameRatio || "12x18";
  const ratioPrice = Number(data.ratioPrice) || 0;
  const orientation = data.orientation || "portrait";
  const quantity = Math.max(1, Number(data.quantity) || 1);
  const unitPrice = Number(data.unitPrice) || woodPrice + designPrice + ratioPrice;
  const totalAmount = Number(data.totalAmount) || unitPrice * quantity;

  const photoUrl = (data.photoUrl || "").trim();
  const photoName = (data.photoName || "photo.jpg").trim();
  const customizationParams = data.customizationParams || {};
  const items = data.items || null;
  const status = normalizeOrderStatus(data.status);

  return prisma.frameOrder.create({
    data: {
      id,
      customerName,
      phone,
      whatsapp,
      email,
      deliveryType,
      address,
      notes,
      woodType,
      woodPrice,
      frameDesign,
      designPrice,
      frameRatio,
      ratioPrice,
      orientation,
      quantity,
      unitPrice,
      totalAmount,
      photoUrl,
      photoName,
      customizationParams,
      items,
      status,
    },
  });
}

export async function updateOrderStatus(id, status) {
  const normalized = normalizeOrderStatus(status);
  return prisma.frameOrder.update({
    where: { id },
    data: { status: normalized },
  });
}

export async function updateOrder(id, data) {
  const updatePayload = {};

  if (data.status !== undefined) {
    updatePayload.status = normalizeOrderStatus(data.status);
  }
  if (data.notes !== undefined) {
    updatePayload.notes = data.notes ? data.notes.trim() : null;
  }
  if (data.deliveryType !== undefined) updatePayload.deliveryType = data.deliveryType;
  if (data.address !== undefined) updatePayload.address = data.address.trim();

  return prisma.frameOrder.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteOrder(id) {
  return prisma.frameOrder.delete({
    where: { id },
  });
}
