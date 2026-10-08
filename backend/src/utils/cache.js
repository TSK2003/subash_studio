/**
 * In-memory caching utility for high-frequency, read-mostly studio catalog data.
 * Keeps PostgreSQL as the authoritative source of truth while dramatically
 * reducing latency and redundant database roundtrips.
 *
 * All caches are instantaneously invalidated whenever mutations (create, update, delete) occur.
 */

const cacheStore = new Map();

/**
 * Retrieve cached value if present and unexpired.
 * @param {string} key
 * @returns {any|null}
 */
export function getCached(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store value in cache with a safe TTL (default: 60 seconds).
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=60]
 */
export function setCached(key, value, ttlSeconds = 60) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate all cache entries matching prefix, or entire cache if no prefix given.
 * @param {string} [prefix]
 */
export function invalidateCache(prefix) {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
