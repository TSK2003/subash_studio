/**
 * Centralized Canonical Booking Statuses and Normalization Logic
 * Supported canonical values:
 * - "NEW"
 * - "CONTACTED"
 * - "CONFIRMED"
 * - "IN_PROGRESS"
 * - "COMPLETED"
 * - "CANCELLED"
 */

export const VALID_BOOKING_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const BOOKING_STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export const BOOKING_STATUS_LABEL_MAP = {
  ALL: "All",
  NEW: "New",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/**
 * Normalizes any booking status input into its canonical uppercase representation.
 *
 * Handles:
 * - "new", "NEW", "New" -> "NEW"
 * - "contacted", "CONTACTED", "Contacted" -> "CONTACTED"
 * - "confirmed", "CONFIRMED", "Confirmed" -> "CONFIRMED"
 * - "in_progress", "IN_PROGRESS", "In Progress", "in-progress" -> "IN_PROGRESS"
 * - "completed", "COMPLETED", "Completed" -> "COMPLETED"
 * - "cancelled", "CANCELLED", "Cancelled", "canceled", "CANCELED" -> "CANCELLED"
 *
 * @param {string|null|undefined} status
 * @returns {"NEW" | "CONTACTED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"}
 */
export function normalizeBookingStatus(status) {
  if (!status) return "NEW";
  const upper = String(status).trim().toUpperCase().replace(/[\s-]+/g, "_");

  switch (upper) {
    case "CONTACTED":
    case "CONTACT":
      return "CONTACTED";
    case "CONFIRMED":
    case "CONFIRM":
      return "CONFIRMED";
    case "IN_PROGRESS":
    case "INPROGRESS":
    case "PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
    case "COMPLETE":
      return "COMPLETED";
    case "CANCELLED":
    case "CANCELED":
    case "CANCEL":
      return "CANCELLED";
    case "NEW":
    default:
      return "NEW";
  }
}

/**
 * Formats a canonical status into human-friendly label.
 * @param {string|null|undefined} status
 * @returns {string}
 */
export function formatBookingStatusLabel(status) {
  const canonical = normalizeBookingStatus(status);
  return BOOKING_STATUS_LABEL_MAP[canonical] || "New";
}
