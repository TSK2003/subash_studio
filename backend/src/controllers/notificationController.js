import * as notificationService from "../services/notificationService.js";

export async function getNotifications(req, res, next) {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await notificationService.getNotifications({
      page,
      limit,
      unreadOnly: unreadOnly === "true",
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const result = await notificationService.getUnreadCount();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id);
    res.json({ success: true, message: "Notification deleted successfully." });
  } catch (err) {
    next(err);
  }
}
