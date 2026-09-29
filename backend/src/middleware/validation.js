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

const EXACT_PHONE_10_REGEX = /^\d{10}$/;

/**
 * Validates payload for booking creation (all 13 fields mandatory)
 */
export function validateCreateBooking(req, res, next) {
  const {
    customerName,
    clientName,
    phone,
    email,
    eventType,
    eventDate,
    date,
    numberOfDays,
    budget,
    requiredService,
    service,
    branch,
    status,
    location,
    venue,
    photographyRequirement,
    cinematographyRequirement,
    adminNotes,
    notes,
  } = req.body || {};

  const name = (customerName || clientName || "").trim();
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Customer name is required.",
    });
  }

  const cleanPhone = (phone || "").toString().trim();
  if (!cleanPhone || !EXACT_PHONE_10_REGEX.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Phone number must be exactly 10 digits.",
    });
  }

  const cleanEmail = (email || "").trim();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid email address.",
    });
  }

  const cleanEventType = (eventType || "").trim();
  if (!cleanEventType) {
    return res.status(400).json({
      success: false,
      error: "Event type is required.",
    });
  }

  const cleanDate = (eventDate || date || "").trim();
  if (!cleanDate) {
    return res.status(400).json({
      success: false,
      error: "Event date is required.",
    });
  }

  const cleanDays = (numberOfDays || "").trim();
  if (!cleanDays) {
    return res.status(400).json({
      success: false,
      error: "Duration / Days is required.",
    });
  }

  const cleanBudget = (budget || "").trim();
  if (!cleanBudget) {
    return res.status(400).json({
      success: false,
      error: "Package budget is required.",
    });
  }

  const cleanService = (requiredService || service || "").trim();
  if (!cleanService) {
    return res.status(400).json({
      success: false,
      error: "Primary service is required.",
    });
  }

  const cleanBranch = (branch || "").trim();
  if (!cleanBranch) {
    return res.status(400).json({
      success: false,
      error: "Studio branch is required.",
    });
  }

  const cleanStatus = (status || "").toString().trim();
  if (!cleanStatus) {
    return res.status(400).json({
      success: false,
      error: "Status is required.",
    });
  }
  const upperStatus = cleanStatus.toUpperCase().replace(/\s+/g, "_");
  if (!VALID_BOOKING_STATUSES.includes(upperStatus)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${VALID_BOOKING_STATUSES.join(", ")}`,
    });
  }

  const cleanLocation = (location || venue || "").trim();
  if (!cleanLocation) {
    return res.status(400).json({
      success: false,
      error: "Venue location is required.",
    });
  }

  const cleanPhoto = (photographyRequirement || "").trim();
  if (!cleanPhoto) {
    return res.status(400).json({
      success: false,
      error: "Photography details are required.",
    });
  }

  const cleanCinema = (cinematographyRequirement || "").trim();
  if (!cleanCinema) {
    return res.status(400).json({
      success: false,
      error: "Cinematography details are required.",
    });
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
 * Validates payload for booking updates
 */
export function validateUpdateBooking(req, res, next) {
  const {
    customerName,
    clientName,
    phone,
    email,
    eventType,
    eventDate,
    date,
    numberOfDays,
    budget,
    requiredService,
    service,
    branch,
    status,
    location,
    venue,
    photographyRequirement,
    cinematographyRequirement,
  } = req.body || {};

  if (customerName !== undefined || clientName !== undefined) {
    const name = (customerName || clientName || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, error: "Customer name cannot be empty." });
    }
  }

  if (phone !== undefined) {
    const cleanPhone = (phone || "").toString().trim();
    if (!cleanPhone || !EXACT_PHONE_10_REGEX.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: "Phone number must be exactly 10 digits." });
    }
  }

  if (email !== undefined) {
    const cleanEmail = (email || "").trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: "Please provide a valid email address." });
    }
  }

  if (eventType !== undefined && !(eventType || "").trim()) {
    return res.status(400).json({ success: false, error: "Event type cannot be empty." });
  }

  if ((eventDate !== undefined || date !== undefined) && !(eventDate || date || "").trim()) {
    return res.status(400).json({ success: false, error: "Event date cannot be empty." });
  }

  if (numberOfDays !== undefined && !(numberOfDays || "").trim()) {
    return res.status(400).json({ success: false, error: "Duration / Days cannot be empty." });
  }

  if (budget !== undefined && !(budget || "").trim()) {
    return res.status(400).json({ success: false, error: "Package budget cannot be empty." });
  }

  if ((requiredService !== undefined || service !== undefined) && !(requiredService || service || "").trim()) {
    return res.status(400).json({ success: false, error: "Primary service cannot be empty." });
  }

  if (branch !== undefined && !(branch || "").trim()) {
    return res.status(400).json({ success: false, error: "Studio branch cannot be empty." });
  }

  if (status !== undefined) {
    const cleanStatus = (status || "").toString().trim();
    if (!cleanStatus) {
      return res.status(400).json({ success: false, error: "Status cannot be empty." });
    }
    const upperStatus = cleanStatus.toUpperCase().replace(/\s+/g, "_");
    if (!VALID_BOOKING_STATUSES.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_BOOKING_STATUSES.join(", ")}`,
      });
    }
  }

  if ((location !== undefined || venue !== undefined) && !(location || venue || "").trim()) {
    return res.status(400).json({ success: false, error: "Venue location cannot be empty." });
  }

  if (photographyRequirement !== undefined && !(photographyRequirement || "").trim()) {
    return res.status(400).json({ success: false, error: "Photography details cannot be empty." });
  }

  if (cinematographyRequirement !== undefined && !(cinematographyRequirement || "").trim()) {
    return res.status(400).json({ success: false, error: "Cinematography details cannot be empty." });
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

/**
 * Validates payload for studio branch creation (all fields mandatory)
 */
export function validateCreateBranch(req, res, next) {
  const { image, name, city, address, phone, hours, manager, mapsUrl } = req.body || {};

  const cleanImage = (image || "").trim();
  if (!cleanImage) {
    return res.status(400).json({
      success: false,
      error: "Branch studio exterior photo is required.",
    });
  }

  const cleanName = (name || "").trim();
  if (!cleanName) {
    return res.status(400).json({
      success: false,
      error: "Branch name is required.",
    });
  }

  const cleanCity = (city || "").trim();
  if (!cleanCity) {
    return res.status(400).json({
      success: false,
      error: "City / Region is required.",
    });
  }

  const cleanAddress = (address || "").trim();
  if (!cleanAddress) {
    return res.status(400).json({
      success: false,
      error: "Full postal address is required.",
    });
  }

  const cleanPhone = (phone || "").trim();
  if (!cleanPhone) {
    return res.status(400).json({
      success: false,
      error: "Phone / Mobile number is required.",
    });
  }
  if (/[a-zA-Z]/.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Phone number must contain only numeric characters.",
    });
  }
  if (!/^[+]?[\d\s-]+$/.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid numeric phone number.",
    });
  }
  const digits = cleanPhone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    return res.status(400).json({
      success: false,
      error: "Phone number must contain at least 10 digits.",
    });
  }

  const cleanHours = (hours || "").trim();
  if (!cleanHours) {
    return res.status(400).json({
      success: false,
      error: "Working hours are required.",
    });
  }

  const cleanManager = (manager || "").trim();
  if (!cleanManager) {
    return res.status(400).json({
      success: false,
      error: "Branch manager / lead is required.",
    });
  }

  const cleanMapsUrl = (mapsUrl || "").trim();
  if (!cleanMapsUrl) {
    return res.status(400).json({
      success: false,
      error: "Google Maps URL is required.",
    });
  }
  try {
    const parsed = new URL(cleanMapsUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return res.status(400).json({
        success: false,
        error: "Google Maps URL must start with http:// or https://",
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid Google Maps URL.",
    });
  }

  next();
}

/**
 * Validates payload for studio branch updates
 */
export function validateUpdateBranch(req, res, next) {
  const { image, name, city, address, phone, hours, manager, mapsUrl } = req.body || {};

  if (image !== undefined && !(image || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Branch studio exterior photo cannot be empty.",
    });
  }

  if (name !== undefined && !(name || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Branch name cannot be empty.",
    });
  }

  if (city !== undefined && !(city || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "City / Region cannot be empty.",
    });
  }

  if (address !== undefined && !(address || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Full postal address cannot be empty.",
    });
  }

  if (phone !== undefined) {
    const cleanPhone = (phone || "").trim();
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error: "Phone / Mobile number cannot be empty.",
      });
    }
    if (/[a-zA-Z]/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Phone number must contain only numeric characters.",
      });
    }
    if (!/^[+]?[\d\s-]+$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid numeric phone number.",
      });
    }
    const digits = cleanPhone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return res.status(400).json({
        success: false,
        error: "Phone number must contain at least 10 digits.",
      });
    }
  }

  if (hours !== undefined && !(hours || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Working hours cannot be empty.",
    });
  }

  if (manager !== undefined && !(manager || "").trim()) {
    return res.status(400).json({
      success: false,
      error: "Branch manager / lead cannot be empty.",
    });
  }

  if (mapsUrl !== undefined) {
    const cleanMapsUrl = (mapsUrl || "").trim();
    if (!cleanMapsUrl) {
      return res.status(400).json({
        success: false,
        error: "Google Maps URL cannot be empty.",
      });
    }
    try {
      const parsed = new URL(cleanMapsUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({
          success: false,
          error: "Google Maps URL must start with http:// or https://",
        });
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid Google Maps URL.",
      });
    }
  }

  next();
}

