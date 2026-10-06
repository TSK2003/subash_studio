import app from "./app.js";
import ENV from "./config/env.js";
import prisma from "./config/prisma.js";
import { seedInitialDataIfNeeded } from "./services/seedService.js";
import { seedInitialAlbumsIfNeeded } from "./services/galleryService.js";
import { backfillRecentNotificationsIfEmpty } from "./services/notificationService.js";
import { ensureDatabaseTablesExist } from "./services/dbInitService.js";
import { ensurePortAvailable } from "./utils/portManager.js";

async function startServer() {
  try {
    // 1. Ensure target port is free before attempting to bind (prevents EADDRINUSE)
    await ensurePortAvailable(ENV.PORT);

    // 2. Check database connection
    await prisma.$connect();
    console.log("✓ Connected to PostgreSQL database via Prisma");

    // 3. Automatically ensure auxiliary schema tables exist in PostgreSQL
    await ensureDatabaseTablesExist();

    // 4. Automatically seed default admin and catalog if empty
    await seedInitialDataIfNeeded();
    await seedInitialAlbumsIfNeeded();
    await backfillRecentNotificationsIfEmpty();

    // 5. Start HTTP server
    const server = app.listen(ENV.PORT, () => {
      console.log(`✓ Subash Studio API listening on http://localhost:${ENV.PORT}`);
      console.log(`✓ Health endpoint: http://localhost:${ENV.PORT}/api/health`);
    });

    // Handle unexpected port conflicts gracefully
    server.on("error", async (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`\n[Server Warning] Port ${ENV.PORT} is already in use.`);
        console.log(`Attempting automatic recovery by terminating stale process on port ${ENV.PORT}...`);
        await ensurePortAvailable(ENV.PORT);
        try {
          server.close();
        } catch {}
        setTimeout(() => {
          app.listen(ENV.PORT, () => {
            console.log(`✓ Subash Studio API listening on http://localhost:${ENV.PORT}`);
          });
        }, 500);
      } else {
        console.error("[Server Error]", err.message);
      }
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log("✓ Prisma disconnected. Process exiting.");
        } catch {}
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGBREAK", () => shutdown("SIGBREAK"));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    try {
      await ensurePortAvailable(ENV.PORT);
      const fallbackServer = app.listen(ENV.PORT, () => {
        console.log(`! Server running in fallback mode on http://localhost:${ENV.PORT} (Database pending connection)`);
      });
      fallbackServer.on("error", (e) => {
        console.error("[Fallback Server Error]", e.message);
      });
    } catch (fallbackErr) {
      console.error("Failed to start fallback server:", fallbackErr.message);
    }
  }
}

startServer();
