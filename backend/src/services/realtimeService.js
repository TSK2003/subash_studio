/**
 * Real-time Server-Sent Events (SSE) notification hub.
 * Manages active public and admin browser connections and broadcasts
 * lightweight data-change events whenever PostgreSQL mutations succeed.
 */

const clients = new Set();

/**
 * Register a new SSE response client
 */
export function addClient(res) {
  clients.add(res);
}

/**
 * Remove an existing SSE response client
 */
export function removeClient(res) {
  clients.delete(res);
}

/**
 * Get count of active connected SSE clients
 */
export function getClientCount() {
  return clients.size;
}

/**
 * Broadcast a DATA_CHANGED event to all connected clients.
 * MUST be invoked ONLY AFTER PostgreSQL mutation completes successfully.
 * Never sends sensitive personal information, credentials, or private customer records.
 *
 * @param {Object} event
 * @param {string} event.entity - "portfolio" | "gallery" | "portfolio_categories" | "gallery_categories" | "services" | "branches" | "testimonials" | "films" | "content" | "frames" | "frame_orders"
 * @param {string} [event.action="updated"] - "created" | "updated" | "deleted" | "status_changed"
 * @param {string|null} [event.id=null] - Optional public entity identifier
 */
export function notifyDataChanged({ entity, action = "updated", id = null }) {
  if (!entity) return;

  const payload = JSON.stringify({
    type: "DATA_CHANGED",
    entity,
    action,
    id: id ? String(id) : null,
    timestamp: Date.now(),
  });

  const message = `event: DATA_CHANGED\ndata: ${payload}\n\n`;

  for (const client of Array.from(clients)) {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  }
}
