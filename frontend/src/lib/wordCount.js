/**
 * Counts actual whitespace-separated words in a string after trimming.
 * Punctuation attached to words is not counted as separate words.
 * Multiple spaces and whitespace-only strings do not produce fake words.
 *
 * @param {string|null|undefined} text
 * @returns {number}
 */
export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
