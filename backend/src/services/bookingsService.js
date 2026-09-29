import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import { createNotification, NOTIFICATION_TYPES } from "./notificationService.js";

const VALID_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function normalizeStatus(status) {
  if (!status) return "NEW";
  const upper = status.toString().trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (upper === "INPROGRESS") return "IN_PROGRESS";
  if (upper === "CANCELED") return "CANCELLED";
  return VALID_STATUSES.includes(upper) ? upper : "NEW";
}

export async function getAllBookings({ page, limit, status, search } = {}) {
  const where = {};
  if (status && status !== "ALL") {
    where.status = normalizeStatus(status);
  }
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXACT_PHONE_10_REGEX = /^\d{10}$/;

export async function createBooking(data) {
  const id =
    data.id || `BK-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const customerName = (data.customerName || data.clientName || "").trim();
  const phone = (data.phone || "").toString().trim();
  const email = (data.email || "").trim();
  const eventType = (data.eventType || "").trim();
  const eventDate = (data.eventDate || data.date || "").trim();
  const location = (data.location || data.venue || "").trim();
  const numberOfDays = (data.numberOfDays || "").trim();
  const requiredService = (data.requiredService || data.service || "").trim();
  const photographyRequirement = (data.photographyRequirement || "").trim();
  const cinematographyRequirement = (data.cinematographyRequirement || "").trim();
  const budget = (data.budget || "").trim();
  const branch = (data.branch || "").trim();
  const status = normalizeStatus(data.status);
  const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

  if (!customerName) throw new Error("Customer name is required.");
  if (!phone || !EXACT_PHONE_10_REGEX.test(phone)) throw new Error("Phone number must be exactly 10 digits.");
  if (!email || !EMAIL_REGEX.test(email)) throw new Error("Valid email address is required.");
  if (!eventType) throw new Error("Event type is required.");
  if (!eventDate) throw new Error("Event date is required.");
  if (!numberOfDays) throw new Error("Duration / Days is required.");
  if (!budget) throw new Error("Package budget is required.");
  if (!requiredService) throw new Error("Primary service is required.");
  if (!branch) throw new Error("Studio branch is required.");
  if (!location) throw new Error("Venue location is required.");
  if (!photographyRequirement) throw new Error("Photography details are required.");
  if (!cinematographyRequirement) throw new Error("Cinematography details are required.");

  const newBooking = await prisma.booking.create({
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
      photographyRequirement,
      cinematographyRequirement,
      budget,
      branch,
      status,
      adminNotes: data.adminNotes || data.notes || null,
      createdAt,
    },
  });

  // Server-side admin notification creation
  await createNotification({
    type: NOTIFICATION_TYPES.BOOKING,
    title: "New Shoot Booking",
    message: `${customerName} booked ${requiredService} for ${eventDate || "upcoming date"}.`,
    relatedEntityId: newBooking.id,
    relatedEntityType: "Booking",
  });

  return newBooking;
}

export async function updateBooking(id, data) {
  const updatePayload = {};

  if (data.customerName !== undefined || data.clientName !== undefined) {
    const name = (data.customerName || data.clientName || "").trim();
    if (!name) throw new Error("Customer name cannot be empty.");
    updatePayload.customerName = name;
    updatePayload.clientName = name;
  }
  if (data.phone !== undefined) {
    const phone = data.phone.toString().trim();
    if (!EXACT_PHONE_10_REGEX.test(phone)) throw new Error("Phone number must be exactly 10 digits.");
    updatePayload.phone = phone;
  }
  if (data.email !== undefined) {
    const email = data.email.trim();
    if (!EMAIL_REGEX.test(email)) throw new Error("Valid email address is required.");
    updatePayload.email = email;
  }
  if (data.eventType !== undefined) {
    const eventType = (data.eventType || "").trim();
    if (!eventType) throw new Error("Event type cannot be empty.");
    updatePayload.eventType = eventType;
  }
  if (data.eventDate !== undefined) {
    const eventDate = (data.eventDate || "").trim();
    if (!eventDate) throw new Error("Event date cannot be empty.");
    updatePayload.eventDate = eventDate;
  }
  if (data.location !== undefined) {
    const location = (data.location || "").trim();
    if (!location) throw new Error("Venue location cannot be empty.");
    updatePayload.location = location;
  }
  if (data.numberOfDays !== undefined) {
    const numberOfDays = (data.numberOfDays || "").trim();
    if (!numberOfDays) throw new Error("Duration / Days cannot be empty.");
    updatePayload.numberOfDays = numberOfDays;
  }
  if (data.requiredService !== undefined) {
    const requiredService = (data.requiredService || "").trim();
    if (!requiredService) throw new Error("Primary service cannot be empty.");
    updatePayload.requiredService = requiredService;
  }
  if (data.photographyRequirement !== undefined) {
    const photo = (data.photographyRequirement || "").trim();
    if (!photo) throw new Error("Photography details cannot be empty.");
    updatePayload.photographyRequirement = photo;
  }
  if (data.cinematographyRequirement !== undefined) {
    const cinema = (data.cinematographyRequirement || "").trim();
    if (!cinema) throw new Error("Cinematography details cannot be empty.");
    updatePayload.cinematographyRequirement = cinema;
  }
  if (data.budget !== undefined) {
    const budget = (data.budget || "").trim();
    if (!budget) throw new Error("Package budget cannot be empty.");
    updatePayload.budget = budget;
  }
  if (data.branch !== undefined) {
    const branch = (data.branch || "").trim();
    if (!branch) throw new Error("Studio branch cannot be empty.");
    updatePayload.branch = branch;
  }
  if (data.status !== undefined) updatePayload.status = normalizeStatus(data.status);
  if (data.adminNotes !== undefined) updatePayload.adminNotes = data.adminNotes;

  return prisma.booking.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteBooking(id) {
  const existing = await prisma.booking.findUnique({
    where: { id },
  });
  if (!existing) {
    const error = new Error("Booking record not found.");
    error.statusCode = 404;
    throw error;
  }
  return prisma.booking.delete({
    where: { id },
  });
}

