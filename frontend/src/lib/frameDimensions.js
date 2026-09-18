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
