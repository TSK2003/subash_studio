import { normalizeBookingStatus } from "./bookingStatus.js";

/**
 * Parses any date input (YYYY-MM-DD, ISO string, Date object)
 * into a local midnight Date instance to prevent UTC timezone shift issues.
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {Date|null}
 */
export function parseBookingDateMidnight(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 0, 0, 0, 0);
  }

  const str = String(dateInput).trim();
  if (!str) return null;

  // Handle YYYY-MM-DD or YYYY/MM/DD prefix (calendar date input)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day, 0, 0, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to standard Date parsing (e.g. ISO string with time)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }

  return null;
}

/**
 * Checks if a booking's event date is today or in the future.
 * A booking scheduled for today (start of day) is considered upcoming.
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {boolean}
 */
export function isUpcomingShootDate(dateInput) {
  const shootMidnight = parseBookingDateMidnight(dateInput);
  if (!shootMidnight) return false;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  return shootMidnight.getTime() >= todayMidnight.getTime();
}

/**
 * Formats a shoot date cleanly in "3 Oct 2026" format without timezone offset glitches.
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {string}
 */
export function formatShootDate(dateInput) {
  const d = parseBookingDateMidnight(dateInput);
  if (!d) return "TBD";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Filters and sorts upcoming scheduled shoots from the booking list.
 *
 * Rules:
 * 1. Event Date must be today or in the future.
 * 2. Status must be an active lifecycle status (NEW, CONTACTED, CONFIRMED, IN_PROGRESS).
 * 3. COMPLETED and CANCELLED bookings are excluded from upcoming shoots.
 * 4. Sorted chronologically with the nearest upcoming shoot first.
 *
 * @param {Array} bookings
 * @returns {Array}
 */
export function filterAndSortUpcomingShoots(bookings = []) {
  if (!Array.isArray(bookings)) return [];

  return [...bookings]
    .filter((b) => {
      const canonicalStatus = normalizeBookingStatus(b.status);
      const isEligibleStatus = canonicalStatus !== "COMPLETED" && canonicalStatus !== "CANCELLED";
      const isEligibleDate = isUpcomingShootDate(b.eventDate || b.date);
      return isEligibleStatus && isEligibleDate;
    })
    .sort((a, b) => {
      const dateA = parseBookingDateMidnight(a.eventDate || a.date)?.getTime() || 0;
      const dateB = parseBookingDateMidnight(b.eventDate || b.date)?.getTime() || 0;
      return dateA - dateB;
    });
}
