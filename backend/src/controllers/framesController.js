import * as framesService from "../services/framesService.js";

// ==========================================
// WOOD TYPES
// ==========================================
export async function getWoodTypes(req, res, next) {
  try {
    const includeInactive = req.query.all === "true" || Boolean(req.user);
    const woods = await framesService.getWoodTypes(includeInactive);
    res.json(woods);
  } catch (err) {
    next(err);
  }
}

export async function createWoodType(req, res, next) {
  try {
    const wood = await framesService.createWoodType(req.body);
    res.status(201).json(wood);
  } catch (err) {
    next(err);
  }
}

export async function updateWoodType(req, res, next) {
  try {
    const wood = await framesService.updateWoodType(req.params.id, req.body);
    res.json(wood);
  } catch (err) {
    next(err);
  }
}

export async function deleteWoodType(req, res, next) {
  try {
    await framesService.deleteWoodType(req.params.id);
    res.json({ success: true, message: "Wood type deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleWoodType(req, res, next) {
  try {
    const wood = await framesService.toggleWoodType(req.params.id);
    res.json(wood);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// DESIGNS
// ==========================================
export async function getDesigns(req, res, next) {
  try {
    const includeInactive = req.query.all === "true" || Boolean(req.user);
    const designs = await framesService.getDesigns(includeInactive);
    res.json(designs);
  } catch (err) {
    next(err);
  }
}

export async function createDesign(req, res, next) {
  try {
    const design = await framesService.createDesign(req.body);
    res.status(201).json(design);
  } catch (err) {
    next(err);
  }
}

export async function updateDesign(req, res, next) {
  try {
    const design = await framesService.updateDesign(req.params.id, req.body);
    res.json(design);
  } catch (err) {
    next(err);
  }
}

export async function deleteDesign(req, res, next) {
  try {
    await framesService.deleteDesign(req.params.id);
    res.json({ success: true, message: "Frame design deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleDesign(req, res, next) {
  try {
    const design = await framesService.toggleDesign(req.params.id);
    res.json(design);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RATIOS
// ==========================================
export async function getRatios(req, res, next) {
  try {
    const includeInactive = req.query.all === "true" || Boolean(req.user);
    const ratios = await framesService.getRatios(includeInactive);
    res.json(ratios);
  } catch (err) {
    next(err);
  }
}

export async function createRatio(req, res, next) {
  try {
    const ratio = await framesService.createRatio(req.body);
    res.status(201).json(ratio);
  } catch (err) {
    next(err);
  }
}

export async function updateRatio(req, res, next) {
  try {
    const ratio = await framesService.updateRatio(req.params.id, req.body);
    res.json(ratio);
  } catch (err) {
    next(err);
  }
}

export async function deleteRatio(req, res, next) {
  try {
    await framesService.deleteRatio(req.params.id);
    res.json({ success: true, message: "Frame ratio deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleRatio(req, res, next) {
  try {
    const ratio = await framesService.toggleRatio(req.params.id);
    res.json(ratio);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// ORDERS
// ==========================================
export async function getOrders(req, res, next) {
  try {
    const orders = await framesService.getOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await framesService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const order = await framesService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await framesService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const order = await framesService.updateOrder(req.params.id, req.body);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await framesService.deleteOrder(req.params.id);
    res.json({ success: true, message: "Order deleted successfully." });
  } catch (err) {
    next(err);
  }
}
