import prisma from "../config/prisma.js";
import { getCached, setCached, invalidateCache } from "../utils/cache.js";

export async function getAllBranches(includeInactive = false) {
  const cacheKey = includeInactive ? "branches:all" : "branches:active";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const where = includeInactive ? {} : { active: true };
  const branches = await prisma.branch.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  setCached(cacheKey, branches, 120);
  return branches;
}

export async function createBranch(data) {
  invalidateCache("branches");
  const id = data.id || `BR-${Math.floor(100 + Math.random() * 900)}`;

  // 1. Branch Studio Exterior Photo (Required)
  const image = (data.image || "").trim();
  if (!image) {
    const err = new Error("Branch studio exterior photo is required.");
    err.statusCode = 400;
    throw err;
  }

  // 2. Branch Name / Title (Required)
  const name = (data.name || "").trim();
  if (!name) {
    const err = new Error("Branch name is required.");
    err.statusCode = 400;
    throw err;
  }

  // 3. City / Region (Required)
  const city = (data.city || "").trim();
  if (!city) {
    const err = new Error("City / Region is required.");
    err.statusCode = 400;
    throw err;
  }

  // 4. Full Postal Address (Required)
  const address = (data.address || "").trim();
  if (!address) {
    const err = new Error("Full postal address is required.");
    err.statusCode = 400;
    throw err;
  }

  // 5. Phone / Mobile (Required)
  const phone = (data.phone || "").trim();
  if (!phone) {
    const err = new Error("Phone / Mobile number is required.");
    err.statusCode = 400;
    throw err;
  }
  if (/[a-zA-Z]/.test(phone)) {
    const err = new Error("Phone number must contain only numeric characters.");
    err.statusCode = 400;
    throw err;
  }
  if (!/^[+]?[\d\s-]+$/.test(phone)) {
    const err = new Error("Please enter a valid numeric phone number.");
    err.statusCode = 400;
    throw err;
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    const err = new Error("Phone number must contain at least 10 digits.");
    err.statusCode = 400;
    throw err;
  }

  // 6. Working Hours (Required)
  const hours = (data.hours || "").trim();
  if (!hours) {
    const err = new Error("Working hours are required.");
    err.statusCode = 400;
    throw err;
  }

  // 7. Branch Manager / Lead (Required)
  const manager = (data.manager || "").trim();
  if (!manager) {
    const err = new Error("Branch manager / lead is required.");
    err.statusCode = 400;
    throw err;
  }

  // 8. Google Maps URL (Required)
  const mapsUrl = (data.mapsUrl || "").trim();
  if (!mapsUrl) {
    const err = new Error("Google Maps URL is required.");
    err.statusCode = 400;
    throw err;
  }
  try {
    const parsed = new URL(mapsUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      const err = new Error("Google Maps URL must start with http:// or https://");
      err.statusCode = 400;
      throw err;
    }
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error("Please enter a valid Google Maps URL.");
    error.statusCode = 400;
    throw error;
  }

  // Optional ancillary fields
  const tag = (data.tag || "Studio & Consultation Lounge").trim();
  const whatsapp = (data.whatsapp || phone).trim();
  const email = (data.email || "").trim();
  const embedUrl = (data.embedUrl || "").trim();
  const active = data.active !== false;

  return prisma.branch.create({
    data: {
      id,
      name,
      city,
      tag,
      address,
      phone,
      whatsapp,
      email,
      mapsUrl,
      embedUrl,
      hours,
      image,
      manager,
      active,
    },
  });
}

export async function updateBranch(id, data) {
  const updatePayload = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) {
      const err = new Error("Branch name cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.name = name;
  }
  if (data.city !== undefined) {
    const city = data.city.trim();
    if (!city) {
      const err = new Error("City / Region cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.city = city;
  }
  if (data.tag !== undefined) updatePayload.tag = data.tag;
  if (data.address !== undefined) {
    const address = data.address.trim();
    if (!address) {
      const err = new Error("Full postal address cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.address = address;
  }
  if (data.phone !== undefined) {
    const phone = data.phone.trim();
    if (!phone) {
      const err = new Error("Phone / Mobile number cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    if (/[a-zA-Z]/.test(phone)) {
      const err = new Error("Phone number must contain only numeric characters.");
      err.statusCode = 400;
      throw err;
    }
    if (!/^[+]?[\d\s-]+$/.test(phone)) {
      const err = new Error("Please enter a valid numeric phone number.");
      err.statusCode = 400;
      throw err;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      const err = new Error("Phone number must contain at least 10 digits.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.phone = phone;
  }
  if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp.trim();
  if (data.email !== undefined) updatePayload.email = data.email.trim();
  if (data.mapsUrl !== undefined) {
    const mapsUrl = data.mapsUrl.trim();
    if (!mapsUrl) {
      const err = new Error("Google Maps URL cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    try {
      const parsed = new URL(mapsUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        const err = new Error("Google Maps URL must start with http:// or https://");
        err.statusCode = 400;
        throw err;
      }
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error("Please enter a valid Google Maps URL.");
      error.statusCode = 400;
      throw error;
    }
    updatePayload.mapsUrl = mapsUrl;
  }
  if (data.embedUrl !== undefined) updatePayload.embedUrl = data.embedUrl.trim();
  if (data.hours !== undefined) {
    const hours = data.hours.trim();
    if (!hours) {
      const err = new Error("Working hours cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.hours = hours;
  }
  if (data.image !== undefined) {
    const image = data.image.trim();
    if (!image) {
      const err = new Error("Branch studio exterior photo cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.image = image;
  }
  if (data.manager !== undefined) {
    const manager = data.manager ? data.manager.trim() : "";
    if (!manager) {
      const err = new Error("Branch manager / lead cannot be empty.");
      err.statusCode = 400;
      throw err;
    }
    updatePayload.manager = manager;
  }
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  invalidateCache("branches");
  return prisma.branch.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteBranch(id) {
  invalidateCache("branches");
  return prisma.branch.delete({
    where: { id },
  });
}

export async function toggleBranchStatus(id) {
  invalidateCache("branches");
  const item = await prisma.branch.findUnique({ where: { id } });
  if (!item) throw new Error("Branch not found.");

  return prisma.branch.update({
    where: { id },
    data: { active: !item.active },
  });
}
