import prisma from "../config/prisma.js";

const VALID_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function normalizeStatus(status) {
  if (!status) return "NEW";
  const upper = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
  return VALID_STATUSES.includes(upper) ? upper : "NEW";
}

export async function getAllBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
  });
}

export async function createBooking(data) {
  const id = data.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`;
  const customerName = (data.customerName || data.clientName || "Valued Client").trim();
  const phone = (data.phone || "").trim();
  const email = (data.email || "").trim();
  const eventType = data.eventType || "Wedding";
  const eventDate = data.eventDate || data.date || "";
  const location = data.location || data.venue || "";
  const numberOfDays = data.numberOfDays || "1 Day";
  const requiredService = data.requiredService || data.service || "Wedding Photography";
  const status = normalizeStatus(data.status);
  const createdAt = data.createdAt || new Date().toISOString().split("T")[0];

  return prisma.booking.create({
    data: {
      id,
      customerName,
      clientName: customerName,
      phone,
      email,
      eventType,
      eventDate,
      location,
      numberOfDays,
      requiredService,
      photographyRequirement: data.photographyRequirement || null,
      cinematographyRequirement: data.cinematographyRequirement || null,
      budget: data.budget || null,
      branch: data.branch || "Tirunelveli",
      status,
      adminNotes: data.adminNotes || data.notes || null,
      createdAt,
    },
  });
}

export async function updateBooking(id, data) {
  const updatePayload = {};

  if (data.customerName !== undefined || data.clientName !== undefined) {
    const name = (data.customerName || data.clientName || "").trim();
    updatePayload.customerName = name;
    updatePayload.clientName = name;
  }
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.email !== undefined) updatePayload.email = data.email.trim();
  if (data.eventType !== undefined) updatePayload.eventType = data.eventType;
  if (data.eventDate !== undefined) updatePayload.eventDate = data.eventDate;
  if (data.location !== undefined) updatePayload.location = data.location;
  if (data.numberOfDays !== undefined) updatePayload.numberOfDays = data.numberOfDays;
  if (data.requiredService !== undefined) updatePayload.requiredService = data.requiredService;
  if (data.photographyRequirement !== undefined) updatePayload.photographyRequirement = data.photographyRequirement;
  if (data.cinematographyRequirement !== undefined) updatePayload.cinematographyRequirement = data.cinematographyRequirement;
  if (data.budget !== undefined) updatePayload.budget = data.budget;
  if (data.branch !== undefined) updatePayload.branch = data.branch;
  if (data.status !== undefined) updatePayload.status = normalizeStatus(data.status);
  if (data.adminNotes !== undefined) updatePayload.adminNotes = data.adminNotes;

  return prisma.booking.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteBooking(id) {
  return prisma.booking.delete({
    where: { id },
  });
}
