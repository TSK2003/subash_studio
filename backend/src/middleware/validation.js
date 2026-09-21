const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;

const VALID_BOOKING_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const VALID_ENQUIRY_STATUSES = ["NEW", "READ", "CONTACTED", "CLOSED"];

const VALID_FRAME_ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/**
 * Validates payload for public booking creation
 */
export function validateCreateBooking(req, res, next) {
  const {
    customerName,
    clientName,
    email,
    phone,
    status,
    photographyRequirement,
    cinematographyRequirement,
    adminNotes,
    notes,
  } = req.body || {};

  const name = (customerName || clientName || "").trim();
  if (!name || name.length < 2 || name.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid client name (between 2 and 100 characters).",
    });
  }

  const cleanEmail = (email || "").trim();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
  }

  const cleanPhone = (phone || "").trim();
  if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid phone number (between 7 and 20 digits).",
    });
  }

  if (status) {
    const upperStatus = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
    if (!VALID_BOOKING_STATUSES.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_BOOKING_STATUSES.join(", ")}`,
      });
    }
  }

  // Check maximum lengths for notes/requirements to prevent payload bloat
  const textLimits = [
    { val: photographyRequirement, name: "photographyRequirement", max: 3000 },
    { val: cinematographyRequirement, name: "cinematographyRequirement", max: 3000 },
    { val: adminNotes || notes, name: "notes", max: 5000 },
  ];
  for (const item of textLimits) {
    if (item.val && typeof item.val === "string" && item.val.length > item.max) {
      return res.status(400).json({
        success: false,
        error: `${item.name} exceeds maximum permitted length of ${item.max} characters.`,
      });
    }
  }

  next();
}

/**
 * Validates payload for public contact enquiry creation
 */
export function validateCreateEnquiry(req, res, next) {
  const { clientName, name, email, phone, message, notes, clientMessage, status } =
    req.body || {};

  const resolvedName = (clientName || name || "").trim();
  if (!resolvedName || resolvedName.length < 2 || resolvedName.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid name (between 2 and 100 characters).",
    });
  }

  const cleanEmail = (email || "").trim();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
  }

  const cleanPhone = (phone || "").trim();
  if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid phone number.",
    });
  }

  const resolvedMsg = (message || notes || clientMessage || "").trim();
  if (!resolvedMsg || resolvedMsg.length < 2 || resolvedMsg.length > 3000) {
    return res.status(400).json({
      success: false,
      error: "Please enter a message between 2 and 3000 characters.",
    });
  }

  if (status) {
    const upperStatus = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
    if (!VALID_ENQUIRY_STATUSES.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_ENQUIRY_STATUSES.join(", ")}`,
      });
    }
  }

  next();
}

/**
 * Validates payload for public frame order placement
 */
export function validateCreateFrameOrder(req, res, next) {
  const {
    customerName,
    name,
    email,
    phone,
    deliveryType,
    address,
    quantity,
    totalAmount,
    photoUrl,
    items,
    status,
  } = req.body || {};

  const resolvedName = (customerName || name || "").trim();
  if (!resolvedName || resolvedName.length < 2 || resolvedName.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid customer name.",
    });
  }

  const cleanEmail = (email || "").trim();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
  }

  const cleanPhone = (phone || "").trim();
  if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid contact phone number.",
    });
  }

  const resolvedDelivery = (deliveryType || "Studio Pickup").trim();
  if (resolvedDelivery.toLowerCase().includes("home") || resolvedDelivery.toLowerCase().includes("delivery")) {
    const cleanAddress = (address || "").trim();
    if (!cleanAddress || cleanAddress.length < 5 || cleanAddress.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Please provide a complete delivery address for home shipping.",
      });
    }
  }

  // Multi-item vs Single-item support
  if (items !== undefined && items !== null) {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one frame item.",
      });
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const itQty = Number(it.quantity ?? 1);
      if (isNaN(itQty) || itQty < 1 || itQty > 100) {
        return res.status(400).json({
          success: false,
          error: `Item #${i + 1}: Quantity must be a valid number between 1 and 100.`,
        });
      }
    }
  } else {
    const qty = Number(quantity ?? 1);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a valid number between 1 and 100.",
      });
    }
  }

  if (totalAmount !== undefined) {
    const total = Number(totalAmount);
    if (isNaN(total) || total < 0) {
      return res.status(400).json({
        success: false,
        error: "Order total amount must be a non-negative number.",
      });
    }
  }

  if (status) {
    const upperStatus = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
    if (!VALID_FRAME_ORDER_STATUSES.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_FRAME_ORDER_STATUSES.join(", ")}`,
      });
    }
  }

  next();
}

/**
 * Validates payload for admin login
 */
export function validateAuthLogin(req, res, next) {
  const { email, password } = req.body || {};
  const cleanEmail = (email || "").trim();
  const cleanPassword = (password || "").trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({
      success: false,
      error: "Email and password are both required.",
    });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid email address.",
    });
  }

  next();
}

/**
 * Validates payload for admin password change
 */
export function validateChangePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || typeof currentPassword !== "string") {
    return res.status(400).json({
      success: false,
      error: "Current password is required.",
    });
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: "New password must be at least 8 characters long.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      error: "New password cannot be the same as the current password.",
    });
  }

  next();
}
