import { Router } from "express";
import { addClient, removeClient, getClientCount } from "../services/realtimeService.js";

const router = Router();

/**
 * GET /api/realtime
 * Server-Sent Events stream for real-time data change notifications.
 * Accessible to both public browsers and admin portal without authentication requirement.
 */
router.get("/", (req, res) => {
  // Set required SSE headers with no-cache and no-transform
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Initial connection acknowledgment comment
  res.write(`: connected\n\n`);

  addClient(res);

  // Periodic heartbeat comment (every 25 seconds) to prevent proxy / router timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
      removeClient(res);
    }
  }, 25000);

  // Clean up when client disconnects
  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(res);
  });
});

/**
 * GET /api/realtime/status
 * Lightweight status check for real-time subsystem
 */
router.get("/status", (req, res) => {
  res.json({
    status: "ok",
    activeClients: getClientCount(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
