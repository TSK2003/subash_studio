/**
 * Canonical Enquiry Statuses and Normalization Logic
 * Supported canonical values: "NEW", "READ", "CONTACTED", "CLOSED"
 */

export const VALID_ENQUIRY_STATUSES = ["NEW", "READ", "CONTACTED", "CLOSED"];

export const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CLOSED", label: "Closed" },
];

export const STATUS_LABEL_MAP = {
  ALL: "All",
  NEW: "New",
  READ: "Read",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

/**
 * Normalizes any status input (e.g. "new", "NEW", "New", "contacted", "Contacted")
 * into its canonical uppercase representation.
 *
 * @param {string|null|undefined} status
 * @returns {"NEW" | "READ" | "CONTACTED" | "CLOSED"}
 */
export function normalizeEnquiryStatus(status) {
  if (!status) return "NEW";
  const upper = String(status).trim().toUpperCase().replace(/[\s_-]+/g, "");
  switch (upper) {
    case "READ":
      return "READ";
    case "CONTACTED":
    case "CONTACT":
      return "CONTACTED";
    case "CLOSED":
    case "CLOSE":
    case "CANCELLED":
    case "CANCEL":
      return "CLOSED";
    case "NEW":
    default:
      return "NEW";
  }
}
