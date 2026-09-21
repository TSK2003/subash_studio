import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import { createNotification, NOTIFICATION_TYPES } from "./notificationService.js";

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

export function formatOrderResponse(order) {
  if (!order) return null;
  const items =
    order.orderItems && order.orderItems.length > 0
      ? order.orderItems
      : Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [
          {
            id: `${order.id}-item-1`,
            orderId: order.id,
            woodType: order.woodType,
            woodPrice: order.woodPrice,
            frameDesign: order.frameDesign,
            designPrice: order.designPrice,
            frameRatio: order.frameRatio,
            ratioPrice: order.ratioPrice,
            orientation: order.orientation || "portrait",
            quantity: order.quantity || 1,
            unitPrice: order.unitPrice,
            totalAmount: order.totalAmount,
            photoUrl: order.photoUrl || "",
            photoName: order.photoName || "photo.jpg",
            customizationParams: order.customizationParams || {},
          },
        ];

  return {
    ...order,
    items,
  };
}

async function hasFrameOrderItemTable() {
  try {
    const tableCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'frame_order_items'
      ) as exists;
    `);
    return Boolean(tableCheck?.[0]?.exists);
  } catch {
    return false;
  }
}

export async function getOrders({ page, limit, status, search } = {}) {
  const where = {};
  if (status && status !== "ALL") {
    where.status = normalizeOrderStatus(status);
  }
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
    ];
  }

  const includeOrderItems = await hasFrameOrderItemTable();

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.frameOrder.findMany({
        where,
        ...(includeOrderItems ? { include: { orderItems: true } } : {}),
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.frameOrder.count({ where }),
    ]);

    return {
      items: items.map(formatOrderResponse),
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  const orders = await prisma.frameOrder.findMany({
    where,
    ...(includeOrderItems ? { include: { orderItems: true } } : {}),
    orderBy: { createdAt: "desc" },
  });
  return orders.map(formatOrderResponse);
}

export async function getOrderById(id) {
  const includeOrderItems = await hasFrameOrderItemTable();
  const order = await prisma.frameOrder.findUnique({
    where: { id },
    ...(includeOrderItems ? { include: { orderItems: true } } : {}),
  });
  return formatOrderResponse(order);
}

export async function createOrder(data) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let id = data.id && typeof data.id === "string" ? data.id.trim() : null;
  // If no ID or if this order ID already exists in PostgreSQL, generate a fresh collision-free ID
  if (!id || (await prisma.frameOrder.findUnique({ where: { id } }))) {
    id = `SS-FR-${today}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }

  const customerName = (data.customerName || data.name || "Client").trim();
  const phone = (data.phone || "").trim();
  const whatsapp = data.whatsapp ? data.whatsapp.trim() : null;
  const email = (data.email || "").trim();
  const deliveryType = data.deliveryType || "Studio Pickup";
  const address = (data.address || "").trim();
  const notes = data.notes ? data.notes.trim() : null;

  // 1. Validate Submitted Items Count
  let rawItems = [];
  if (data.items !== undefined && data.items !== null) {
    if (!Array.isArray(data.items)) {
      throw new Error("Invalid order payload: 'items' must be an array.");
    }
    rawItems = data.items;
  } else if (data.woodType || data.frameDesign || data.frameRatio) {
    // Legacy single item format fallback
    rawItems = [
      {
        woodType: data.woodType,
        frameDesign: data.frameDesign,
        frameRatio: data.frameRatio,
        orientation: data.orientation,
        quantity: data.quantity,
        photoUrl: data.photoUrl,
        photoName: data.photoName,
        customizationParams: data.customizationParams,
      },
    ];
  }

  if (rawItems.length === 0) {
    throw new Error("Order must contain at least one item. No items were provided.");
  }

  console.log(`[Order Creation] Incoming submitted items count: ${rawItems.length}`);

  // 2. Authoritative Server-Side Validation and Catalog Lookup
  const [woods, designs, ratios] = await Promise.all([
    getWoodTypes(true),
    getDesigns(true),
    getRatios(true),
  ]);

  const validatedItems = [];

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i];
    const itemIndex = i + 1;

    // Resolve Wood
    const woodQuery = (raw.woodType || raw.wood?.name || "").trim().toLowerCase();
    const woodIdQuery = (raw.woodId || raw.wood?.id || "").trim();
    const wood = woods.find(
      (w) =>
        (w.name || "").trim().toLowerCase() === woodQuery ||
        (w.id || "").trim() === woodIdQuery
    );
    if (!wood) {
      throw new Error(
        `Item #${itemIndex} validation error: Wood species '${raw.woodType || raw.wood?.name || "unknown"}' is not recognized or unavailable in catalog.`
      );
    }

    // Resolve Design
    const designQuery = (raw.frameDesign || raw.design?.name || "").trim().toLowerCase();
    const designIdQuery = (raw.designId || raw.design?.id || "").trim();
    const design = designs.find(
      (d) =>
        (d.name || "").trim().toLowerCase() === designQuery ||
        (d.id || "").trim() === designIdQuery
    );
    if (!design) {
      throw new Error(
        `Item #${itemIndex} validation error: Frame profile design '${raw.frameDesign || raw.design?.name || "unknown"}' is not recognized or unavailable in catalog.`
      );
    }

    // Resolve Ratio / Size
    const ratioQuery = (raw.frameRatio || raw.ratio?.name || "").trim().toLowerCase();
    const ratioIdQuery = (raw.ratioId || raw.ratio?.id || "").trim();
    const ratio = ratios.find(
      (r) =>
        (r.name || "").trim().toLowerCase() === ratioQuery ||
        (r.id || "").trim() === ratioIdQuery
    );
    if (!ratio) {
      throw new Error(
        `Item #${itemIndex} validation error: Frame dimension size '${raw.frameRatio || raw.ratio?.name || "unknown"}' is not recognized or unavailable in catalog.`
      );
    }

    // Authoritative Server-Calculated Price
    const woodPrice = wood.basePrice;
    const designPrice = design.additionalPrice;
    const ratioPrice = ratio.price;
    const unitPrice = woodPrice + designPrice + ratioPrice;
    const quantity = Math.max(1, parseInt(raw.quantity, 10) || 1);
    const totalAmount = unitPrice * quantity;

    // Guaranteed collision-free unique ID scoped to this specific order
    const itemId = `${id}-item-${itemIndex}-${crypto.randomBytes(3).toString("hex")}`;
    const orientation = raw.orientation || "portrait";
    const photoUrl = (raw.photoUrl || "").trim();
    const photoName = (raw.photoName || "photo.jpg").trim();
    const customizationParams = raw.customizationParams || {};

    validatedItems.push({
      id: itemId,
      woodType: wood.name,
      woodPrice,
      frameDesign: design.name,
      designPrice,
      frameRatio: ratio.name,
      ratioPrice,
      orientation,
      quantity,
      unitPrice,
      totalAmount,
      photoUrl,
      photoName,
      customizationParams,
    });
  }

  // Strict Validation: Validated Items must match Raw Submitted Items Count
  if (validatedItems.length !== rawItems.length) {
    throw new Error(
      `Order validation integrity failure: submitted ${rawItems.length} items but validated ${validatedItems.length} items.`
    );
  }

  console.log(`[Order Creation] Validated items count: ${validatedItems.length}`);

  // Calculate Order Aggregates
  const primaryItem = validatedItems[0];
  const grandTotal = validatedItems.reduce((acc, it) => acc + it.totalAmount, 0);
  const totalQuantity = validatedItems.reduce((acc, it) => acc + it.quantity, 0);
  const status = normalizeOrderStatus(data.status);

  // 3. Atomic Database Transaction
  const transactionResult = await prisma.$transaction(async (tx) => {
    // A. Create the master FrameOrder
    const masterOrder = await tx.frameOrder.create({
      data: {
        id,
        customerName,
        phone,
        whatsapp,
        email,
        deliveryType,
        address,
        notes,
        woodType: primaryItem.woodType,
        woodPrice: primaryItem.woodPrice,
        frameDesign: primaryItem.frameDesign,
        designPrice: primaryItem.designPrice,
        frameRatio: primaryItem.frameRatio,
        ratioPrice: primaryItem.ratioPrice,
        orientation: primaryItem.orientation,
        quantity: totalQuantity,
        unitPrice: primaryItem.unitPrice,
        totalAmount: grandTotal,
        photoUrl: primaryItem.photoUrl,
        photoName: primaryItem.photoName,
        customizationParams: primaryItem.customizationParams,
        items: validatedItems,
        status,
      },
    });

    // B. Create all FrameOrderItem relational records (if table exists in PostgreSQL)
    const orderItemModel = tx?.frameOrderItem || prisma?.frameOrderItem;
    let hasOrderItemTable = false;
    if (orderItemModel && typeof orderItemModel.create === "function") {
      try {
        const tableCheck = await tx.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'frame_order_items'
          ) as exists;
        `);
        hasOrderItemTable = Boolean(tableCheck?.[0]?.exists);
      } catch {
        hasOrderItemTable = false;
      }
    }

    if (hasOrderItemTable && orderItemModel) {
      for (const item of validatedItems) {
        await orderItemModel.create({
          data: {
            id: item.id,
            orderId: id,
            woodType: item.woodType,
            woodPrice: item.woodPrice,
            frameDesign: item.frameDesign,
            designPrice: item.designPrice,
            frameRatio: item.frameRatio,
            ratioPrice: item.ratioPrice,
            orientation: item.orientation,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.totalAmount,
            photoUrl: item.photoUrl,
            photoName: item.photoName,
            customizationParams: item.customizationParams,
          },
        });
      }
    }

    // C. Verify Database Persistence Count Inside Transaction
    let createdOrderItems = [];
    if (hasOrderItemTable && orderItemModel && typeof orderItemModel.findMany === "function") {
      createdOrderItems = await orderItemModel.findMany({
        where: { orderId: id },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!createdOrderItems || createdOrderItems.length === 0) {
      createdOrderItems = validatedItems.map((it) => ({
        ...it,
        orderId: id,
      }));
    }

    console.log(`[Order Creation] Persisted order items count: ${createdOrderItems.length}`);

    // D. Create notification inside transaction
    try {
      await createNotification({
        type: NOTIFICATION_TYPES.FRAME_ORDER,
        title: "New Frame Order",
        message: `Order #${id} placed by ${customerName} (${totalQuantity} frame${totalQuantity > 1 ? "s" : ""}, ₹${grandTotal.toLocaleString("en-IN")}).`,
        relatedEntityId: id,
        relatedEntityType: "FrameOrder",
        tx,
      });
    } catch (notifErr) {
      console.warn("[Order Creation] Notification creation bypassed:", notifErr.message);
    }

    return {
      ...masterOrder,
      orderItems: createdOrderItems,
    };
  });

  // 4. Validate Response Items Integrity
  const finalOrder = formatOrderResponse(transactionResult);
  if (!finalOrder.items || finalOrder.items.length !== rawItems.length) {
    throw new Error(
      `API response integrity failure: created order has ${finalOrder.items?.length || 0} items instead of ${rawItems.length}.`
    );
  }

  console.log(`[Order Creation] Final returned order items count: ${finalOrder.items.length}`);
  return finalOrder;
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
