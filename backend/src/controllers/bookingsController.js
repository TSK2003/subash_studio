import * as bookingsService from "../services/bookingsService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

export async function getAllBookings(req, res, next) {
  try {
    const bookings = await bookingsService.getAllBookings(req.query);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function createBooking(req, res, next) {
  try {
    const booking = await bookingsService.createBooking(req.body);
    notifyDataChanged({ entity: "bookings", action: "created", id: booking.id });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Failed to create booking." });
  }
}

export async function updateBooking(req, res, next) {
  try {
    const booking = await bookingsService.updateBooking(req.params.id, req.body);
    notifyDataChanged({ entity: "bookings", action: "updated", id: booking.id });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Failed to update booking." });
  }
}

export async function deleteBooking(req, res, next) {
  try {
    await bookingsService.deleteBooking(req.params.id);
    notifyDataChanged({ entity: "bookings", action: "deleted", id: req.params.id });
    res.json({ success: true, message: "Booking deleted successfully." });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || "Failed to delete booking.",
    });
  }
}

