import crypto from "node:crypto";
import prisma from "../config/prisma.js";

const VALID_STATUSES = ["NEW", "READ", "CONTACTED", "CLOSED"];

function normalizeStatus(status) {
  if (!status) return "NEW";
  const upper = status.toString().trim().toUpperCase().replace(/\s+/g, "_");
  return VALID_STATUSES.includes(upper) ? upper : "NEW";
}

export async function getAllEnquiries({ page, limit, status, search } = {}) {
  const where = {};
  if (status && status !== "ALL") {
    where.status = normalizeStatus(status);
  }
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.enquiry.count({ where }),
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

  return prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnquiryById(id) {
  return prisma.enquiry.findUnique({
    where: { id },
  });
}

export async function createEnquiry(data) {
  const id =
    data.id || `ENQ-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const clientName = (data.clientName || data.name || "Client").trim();
  const phone = (data.phone || "").trim();
  const email = (data.email || "").trim();
  const interestedService = data.interestedService || data.service || "General Inquiry";
  const eventDate = data.eventDate || data.proposedDate || null;
  const location = data.location || data.venue || null;
  const message = (data.message || data.notes || data.clientMessage || "").trim();
  const status = normalizeStatus(data.status);
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const createdAt = data.createdAt ? new Date(data.createdAt) : now;
  const receivedDate = data.receivedDate || `${dateStr} ${timeStr}`;

  return prisma.enquiry.create({
    data: {
      id,
      clientName,
      phone,
      email,
      interestedService,
      eventDate,
      location,
      message,
      status,
      receivedDate,
      createdAt,
    },
  });
}

export async function updateEnquiry(id, data) {
  const updatePayload = {};

  if (data.clientName !== undefined || data.name !== undefined) {
    updatePayload.clientName = (data.clientName || data.name || "").trim();
  }
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.email !== undefined) updatePayload.email = data.email.trim();
  if (data.interestedService !== undefined || data.service !== undefined) {
    updatePayload.interestedService = data.interestedService || data.service;
  }
  if (data.eventDate !== undefined || data.proposedDate !== undefined) {
    updatePayload.eventDate = data.eventDate || data.proposedDate;
  }
  if (data.location !== undefined || data.venue !== undefined) {
    updatePayload.location = data.location || data.venue;
  }
  if (data.message !== undefined || data.notes !== undefined) {
    updatePayload.message = (data.message || data.notes || "").trim();
  }
  if (data.status !== undefined) {
    updatePayload.status = normalizeStatus(data.status);
  }

  return prisma.enquiry.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteEnquiry(id) {
  return prisma.enquiry.delete({
    where: { id },
  });
}
