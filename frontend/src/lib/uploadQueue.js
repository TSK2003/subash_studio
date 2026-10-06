/**
 * Controlled Concurrency Upload Queue for Subash Studio.
 *
 * Provides a pooled-worker concurrency runner for multi-image uploads.
 * Ensures up to MAX_CONCURRENT_UPLOADS (default: 3) run concurrently,
 * immediately starting the next queued file as soon as any active upload slot completes.
 */

export const DEFAULT_MAX_CONCURRENT_UPLOADS = 3;

/**
 * Upload an array of items with controlled concurrency.
 *
 * @template T, R
 * @param {T[]} items - Array of file/task items to process
 * @param {(item: T, index: number) => Promise<R>} uploadFn - Async function performing the upload for an item
 * @param {object} [options]
 * @param {number} [options.concurrency=3] - Maximum number of concurrent uploads
 * @param {(item: T, index: number) => void} [options.onStart] - Callback when an item begins uploading
 * @param {(result: { status: 'fulfilled', value: R } | { status: 'rejected', reason: any }, item: T, index: number) => void} [options.onComplete] - Callback when an item finishes
 * @returns {Promise<Array<{ status: 'fulfilled', value: R } | { status: 'rejected', reason: any }>>}
 */
export async function uploadFilesWithConcurrency(items, uploadFn, options = {}) {
  const concurrency = Math.max(1, options.concurrency || DEFAULT_MAX_CONCURRENT_UPLOADS);
  const total = items.length;
  if (total === 0) return [];

  const results = new Array(total);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < total) {
      const currentIndex = nextIndex++;
      const currentItem = items[currentIndex];

      if (options.onStart) {
        try {
          options.onStart(currentItem, currentIndex);
        } catch (err) {
          console.warn("[uploadQueue] onStart error:", err);
        }
      }

      try {
        const value = await uploadFn(currentItem, currentIndex);
        results[currentIndex] = { status: "fulfilled", value };
        if (options.onComplete) {
          options.onComplete(results[currentIndex], currentItem, currentIndex);
        }
      } catch (reason) {
        results[currentIndex] = { status: "rejected", reason };
        if (options.onComplete) {
          options.onComplete(results[currentIndex], currentItem, currentIndex);
        }
      }
    }
  }

  const workerCount = Math.min(concurrency, total);
  const workers = Array.from({ length: workerCount }, () => worker());

  await Promise.all(workers);
  return results;
}

export default uploadFilesWithConcurrency;
