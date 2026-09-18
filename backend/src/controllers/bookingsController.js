import * as bookingsService from "../services/bookingsService.js";

export async function getAllBookings(req, res, next) {
  try {
    const bookings = await bookingsService.getAllBookings();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function createBooking(req, res, next) {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function updateBooking(req, res, next) {
  try {
    const booking = await bookingsService.updateBooking(req.params.id, req.body);
    res.json(booking);
  } catch (err) {
    next(err);
  }
}

export async function deleteBooking(req, res, next) {
  try {
    await bookingsService.deleteBooking(req.params.id);
    res.json({ success: true, message: "Booking deleted successfully." });
  } catch (err) {
    next(err);
  }
}
