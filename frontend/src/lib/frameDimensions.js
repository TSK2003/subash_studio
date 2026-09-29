// @ts-check

/**
 * Formats a frame ratio label for display.
 * In portrait mode, reverses the dimensions to `height × width`
 * (e.g. "4 × 6" becomes "6 × 4", "5 × 7" becomes "7 × 5", "8 × 10" becomes "10 × 8", "10 × 12" becomes "12 × 10", "12 × 18" becomes "18 × 12").
 * In landscape mode, keeps standard `width × height`.
 *
 * @param {string | undefined | null} ratioName
 * @param {"portrait" | "landscape"} [orientation="portrait"]
 * @returns {string}
 */
export function formatRatioDisplayLabel(ratioName, orientation = "portrait") {
  if (!ratioName) return "";
  const str = String(ratioName).trim();

  if (orientation === "portrait") {
    const match = str.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)$/i);
    if (match) {
      const a = parseFloat(match[1]);
      const b = parseFloat(match[2]);
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      return `${max} × ${min}`;
    }
  }

  // Landscape mode keeps standard width × height
  return str;
}

/**
 * Formats supporting dimension details (e.g., "4 × 6 inches (10 × 15 cm)")
 * to match the selected orientation.
 *
 * @param {string | undefined | null} dimensions
 * @param {"portrait" | "landscape"} [orientation="portrait"]
 * @returns {string}
 */
export function formatDimensionsLabel(dimensions, orientation = "portrait") {
  if (!dimensions) return "";
  const str = String(dimensions).trim();

  if (orientation === "portrait") {
    // Replace "4 × 6" with "6 × 4" and "10 × 15 cm" with "15 × 10 cm"
    return str
      .replace(/(\d+)\s*[x×]\s*(\d+)\s*(inches|in)/i, (m, a, b, unit) => {
        const min = Math.min(Number(a), Number(b));
        const max = Math.max(Number(a), Number(b));
        return `${max} × ${min} ${unit}`;
      })
      .replace(/(\d+)\s*[x×]\s*(\d+)\s*(cm)/i, (m, a, b, unit) => {
        const min = Math.min(Number(a), Number(b));
        const max = Math.max(Number(a), Number(b));
        return `${max} × ${min} ${unit}`;
      });
  }

  return str;
}

/**
 * Checks whether a given ratio name represents valid numeric dimensions.
 * Must match: NUMBER × NUMBER (e.g. "4 × 6", "10 × 12", "10x12", "10X12", "10 x 12").
 *
 * @param {string | undefined | null} name
 * @returns {boolean}
 */
export function isValidRatioName(name) {
  if (!name || typeof name !== "string") return false;
  const match = name.trim().match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return false;
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  return !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
}

/**
 * Normalizes ratio input to canonical "NUMBER × NUMBER" format (e.g. "10 × 12").
 * Safely returns empty string if invalid instead of throwing uncaught exception.
 *
 * @param {string | undefined | null} rawName
 * @returns {string}
 */
export function normalizeRatioName(rawName) {
  if (!rawName || !isValidRatioName(rawName)) {
    return "";
  }
  const match = String(rawName).trim().match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return "";
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  /** @param {number} n */
  const formatNum = (n) => (Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2))));
  return `${formatNum(w)} × ${formatNum(h)}`;
}

