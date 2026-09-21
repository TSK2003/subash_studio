import prisma from "../config/prisma.js";

export const NOTIFICATION_TYPES = {
  BOOKING: "BOOKING",
  ENQUIRY: "ENQUIRY",
  FRAME_ORDER: "FRAME_ORDER",
};

/**
 * Creates an authoritative server-side notification for studio admins.
 * Includes built-in idempotency to prevent duplicate notifications on retry.
 */
export async function createNotification({
  type,
  title,
  message,
  relatedEntityId = null,
  relatedEntityType = null,
  tx = null,
}) {
  const db = tx || prisma;

  try {
    const safeType =
      Object.values(NOTIFICATION_TYPES).find((t) => t === type) ||
      NOTIFICATION_TYPES.ENQUIRY;

    // Idempotency: Prevent duplicate notifications for the same entity event
    if (relatedEntityId && relatedEntityType) {
      const existing = await db.notification.findFirst({
        where: {
          type: safeType,
          relatedEntityId: String(relatedEntityId),
          relatedEntityType: String(relatedEntityType),
        },
      });

      if (existing) {
        return existing;
      }
    }

    const notification = await db.notification.create({
      data: {
        type: safeType,
        title: title ? String(title).trim() : "New Studio Alert",
        message: message ? String(message).trim() : "A new studio event has occurred.",
        relatedEntityId: relatedEntityId ? String(relatedEntityId) : null,
        relatedEntityType: relatedEntityType ? String(relatedEntityType) : null,
        isRead: false,
      },
    });

    return notification;
  } catch (err) {
    console.error("[NotificationService] Failed to create notification:", err);
    // Return null rather than crashing the caller transaction
    return null;
  }
}

/**
 * Retrieves paginated notifications with unread counts.
 */
export async function getNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const take = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * take;

  const where = {};
  if (unreadOnly) {
    where.isRead = false;
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return {
    items,
    pagination: {
      total,
      unreadCount,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * Returns the exact count of unread notifications.
 */
export async function getUnreadCount() {
  const count = await prisma.notification.count({
    where: { isRead: false },
  });
  return { count };
}

/**
 * Marks an individual notification as read in PostgreSQL.
 */
export async function markAsRead(id) {
  if (!id) throw new Error("Notification ID is required.");

  return prisma.notification.update({
    where: { id: String(id) },
    data: { isRead: true },
  });
}

/**
 * Marks all unread notifications as read in PostgreSQL.
 */
export async function markAllAsRead() {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return {
    success: true,
    updatedCount: result.count,
  };
}

/**
 * Deletes a notification by ID.
 */
export async function deleteNotification(id) {
  if (!id) throw new Error("Notification ID is required.");

  return prisma.notification.delete({
    where: { id: String(id) },
  });
}

/**
 * Initial historical seed: if notification table is empty, generate initial notifications
 * from recent existing bookings, enquiries, and frame orders.
 */
export async function backfillRecentNotificationsIfEmpty() {
  try {
    const count = await prisma.notification.count();
    if (count > 0) return;

    console.log("[NotificationService] Notification table is empty. Seeding recent activity...");

    const [recentBookings, recentEnquiries, recentOrders] = await Promise.all([
      prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.enquiry.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.frameOrder.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    ]);

    for (const b of recentBookings) {
      await createNotification({
        type: NOTIFICATION_TYPES.BOOKING,
        title: "New Shoot Booking",
        message: `${b.customerName || b.clientName || "Client"} booked ${b.requiredService || "Photography"} for ${b.eventDate || "upcoming event"}.`,
        relatedEntityId: b.id,
        relatedEntityType: "Booking",
      });
    }

    for (const e of recentEnquiries) {
      await createNotification({
        type: NOTIFICATION_TYPES.ENQUIRY,
        title: "New Client Enquiry",
        message: `${e.clientName || "Client"} sent an enquiry regarding ${e.interestedService || "photography services"}.`,
        relatedEntityId: e.id,
        relatedEntityType: "Enquiry",
      });
    }

    for (const o of recentOrders) {
      await createNotification({
        type: NOTIFICATION_TYPES.FRAME_ORDER,
        title: "New Frame Order",
        message: `Order #${o.id} placed by ${o.customerName} (${o.quantity || 1} frame, ₹${(o.totalAmount || 0).toLocaleString("en-IN")}).`,
        relatedEntityId: o.id,
        relatedEntityType: "FrameOrder",
      });
    }

    console.log("[NotificationService] Initial notification backfill completed.");
  } catch (err) {
    console.error("[NotificationService] Failed to backfill initial notifications:", err);
  }
}
