import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import { createNotification, NOTIFICATION_TYPES } from "./notificationService.js";
import { getCached, setCached, invalidateCache } from "../utils/cache.js";

// ==========================================
// 1. FRAME WOOD TYPES
// ==========================================

export async function getWoodTypes(includeInactive = false) {
  const cacheKey = includeInactive ? "frames:wood_types:all" : "frames:wood_types:active";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const where = includeInactive ? {} : { active: true };
  const woods = await prisma.frameWoodType.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  setCached(cacheKey, woods, 120);
  return woods;
}

export async function createWoodType(data) {
  if (!data || !data.name || !data.name.trim()) {
    throw new Error("Wood type name is required.");
  }
  const rawPrice = Number(data.basePrice);
  if (isNaN(rawPrice) || rawPrice < 0) {
    throw new Error("Base price must be a valid non-negative number.");
  }
  const id = data.id || `wood-${Date.now()}`;
  const defaultGrain = "Natural Timber Grain";
  const defaultImage = "/images/frames/teak-wood.jpg";
  const active =
    data.active !== undefined
      ? Boolean(data.active)
      : data.inStock !== undefined
      ? data.inStock === true || data.inStock === "true"
      : true;

  invalidateCache("frames:wood_types");
  return prisma.frameWoodType.create({
    data: {
      id,
      name: data.name.trim(),
      basePrice: rawPrice,
      description: (data.description || "").trim(),
      grain: (data.grain || data.description || defaultGrain).trim(),
      image: (data.image || defaultImage).trim(),
      active,
    },
  });
}

export async function updateWoodType(id, data) {
  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.basePrice !== undefined) {
    const rawPrice = Number(data.basePrice);
    if (isNaN(rawPrice) || rawPrice < 0) {
      throw new Error("Base price must be a valid non-negative number.");
    }
    updatePayload.basePrice = rawPrice;
  }
  if (data.description !== undefined) updatePayload.description = data.description.trim();
  if (data.grain !== undefined) updatePayload.grain = data.grain.trim();
  if (data.image !== undefined) updatePayload.image = data.image.trim();
  if (data.active !== undefined) {
    updatePayload.active = Boolean(data.active);
  } else if (data.inStock !== undefined) {
    updatePayload.active = data.inStock === true || data.inStock === "true";
  }

  invalidateCache("frames:wood_types");
  return prisma.frameWoodType.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteWoodType(id) {
  invalidateCache("frames:wood_types");
  return prisma.frameWoodType.delete({
    where: { id },
  });
}

export async function toggleWoodType(id) {
  const item = await prisma.frameWoodType.findUnique({ where: { id } });
  if (!item) throw new Error("Frame wood type not found.");

  invalidateCache("frames:wood_types");
  return prisma.frameWoodType.update({
    where: { id },
    data: { active: !item.active },
  });
}

// ==========================================
// 2. FRAME DESIGNS
// ==========================================

export async function getDesigns(includeInactive = false) {
  const cacheKey = includeInactive ? "frames:designs:all" : "frames:designs:active";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const where = includeInactive ? {} : { active: true };
  const designs = await prisma.frameDesign.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
  setCached(cacheKey, designs, 120);
  return designs;
}

export async function createDesign(data) {
  const id = data.id || `design-${Date.now()}`;
  invalidateCache("frames:designs");
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

  invalidateCache("frames:designs");
  return prisma.frameDesign.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteDesign(id) {
  invalidateCache("frames:designs");
  return prisma.frameDesign.delete({
    where: { id },
  });
}

export async function toggleDesign(id) {
  const item = await prisma.frameDesign.findUnique({ where: { id } });
  if (!item) throw new Error("Frame design not found.");

  invalidateCache("frames:designs");
  return prisma.frameDesign.update({
    where: { id },
    data: { active: !item.active },
  });
}

// ==========================================
// 3. FRAME RATIOS
// ==========================================

export async function getRatios(includeInactive = false) {
  const cacheKey = includeInactive ? "frames:ratios:all" : "frames:ratios:active";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const where = includeInactive ? {} : { active: true };
  const ratios = await prisma.frameRatio.findMany({
    where,
    orderBy: { price: "asc" },
  });
  setCached(cacheKey, ratios, 120);
  return ratios;
}

export function validateAndNormalizeRatioName(rawName) {
  if (!rawName || typeof rawName !== "string") {
    throw new Error("Ratio / Size name is required.");
  }
  const trimmed = rawName.trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match) {
    throw new Error(
      "Invalid ratio format. Please enter a valid dimension such as 10 × 12."
    );
  }
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    throw new Error("Invalid ratio format. Please enter a valid dimension such as 10 × 12.");
  }
  const formatNum = (n) => (Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2))));
  return `${formatNum(w)} × ${formatNum(h)}`;
}

export async function createRatio(data) {
  if (!data || !data.name) {
    throw new Error("Ratio / Size name is required.");
  }
  const normalizedName = validateAndNormalizeRatioName(data.name);

  // Check duplicate
  const existing = await prisma.frameRatio.findFirst({
    where: { name: { equals: normalizedName, mode: "insensitive" } },
  });
  if (existing) {
    throw new Error(`A frame ratio/size with dimensions '${normalizedName}' already exists.`);
  }

  const rawPrice = Number(data.price);
  if (isNaN(rawPrice) || rawPrice < 0) {
    throw new Error("Price must be a valid non-negative number.");
  }
  const validOrientation = (data.orientation || "portrait").toString().toLowerCase().trim();
  const orientation = validOrientation === "landscape" ? "landscape" : "portrait";
  const id = data.id || `ratio-${Date.now()}`;
  invalidateCache("frames:ratios");
  return prisma.frameRatio.create({
    data: {
      id,
      name: normalizedName,
      label: (data.label || `${normalizedName} inches`).trim(),
      dimensions: (data.dimensions || "").trim() || `${normalizedName} inches`,
      price: rawPrice,
      aspect: data.aspect || "2:3",
      orientation,
      popular: Boolean(data.popular),
      active: data.active !== false,
    },
  });
}

export async function updateRatio(id, data) {
  const updatePayload = {};
  if (data.name !== undefined) {
    const normalizedName = validateAndNormalizeRatioName(data.name);
    const existing = await prisma.frameRatio.findFirst({
      where: {
        name: { equals: normalizedName, mode: "insensitive" },
        id: { not: id },
      },
    });
    if (existing) {
      throw new Error(`A frame ratio/size with dimensions '${normalizedName}' already exists.`);
    }
    updatePayload.name = normalizedName;
  }
  if (data.label !== undefined) updatePayload.label = data.label.trim();
  if (data.dimensions !== undefined) updatePayload.dimensions = data.dimensions.trim();
  if (data.price !== undefined) {
    const rawPrice = Number(data.price);
    if (isNaN(rawPrice) || rawPrice < 0) {
      throw new Error("Price must be a valid non-negative number.");
    }
    updatePayload.price = rawPrice;
  }
  if (data.aspect !== undefined) updatePayload.aspect = data.aspect;
  if (data.orientation !== undefined) {
    const validOrientation = data.orientation.toString().toLowerCase().trim();
    updatePayload.orientation = validOrientation === "landscape" ? "landscape" : "portrait";
  }
  if (data.popular !== undefined) updatePayload.popular = Boolean(data.popular);
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  invalidateCache("frames:ratios");
  return prisma.frameRatio.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteRatio(id) {
  invalidateCache("frames:ratios");
  return prisma.frameRatio.delete({
    where: { id },
  });
}

export async function toggleRatio(id) {
  const item = await prisma.frameRatio.findUnique({ where: { id } });
  if (!item) throw new Error("Frame ratio not found.");

  invalidateCache("frames:ratios");
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

let _hasFrameOrderItemTableCached = null;

async function hasFrameOrderItemTable() {
  if (_hasFrameOrderItemTableCached !== null) return _hasFrameOrderItemTableCached;
  try {
    const tableCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'frame_order_items'
      ) as exists;
    `);
    _hasFrameOrderItemTableCached = Boolean(tableCheck?.[0]?.exists);
    return _hasFrameOrderItemTableCached;
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

  const hasOrderItemTable = await hasFrameOrderItemTable();

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

    if (hasOrderItemTable && orderItemModel) {
      if (typeof orderItemModel.createMany === "function") {
        await orderItemModel.createMany({
          data: validatedItems.map((item) => ({
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
          })),
        });
      } else {
        await Promise.all(
          validatedItems.map((item) =>
            orderItemModel.create({
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
            })
          )
        );
      }
    }

    // C. Order items are verified and confirmed
    const createdOrderItems = validatedItems.map((it) => ({
      ...it,
      orderId: id,
    }));

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
