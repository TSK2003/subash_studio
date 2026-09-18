import app from "./app.js";
import ENV from "./config/env.js";
import prisma from "./config/prisma.js";
import { seedInitialDataIfNeeded } from "./services/seedService.js";

async function startServer() {
  try {
    // Check database connection
    await prisma.$connect();
    console.log("✓ Connected to PostgreSQL database via Prisma");

    // Automatically seed default admin and catalog if empty
    await seedInitialDataIfNeeded();

    const server = app.listen(ENV.PORT, () => {
      console.log(`✓ Subash Studio API listening on http://localhost:${ENV.PORT}`);
      console.log(`✓ Health endpoint: http://localhost:${ENV.PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("✓ Prisma disconnected. Process exiting.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    // Even if DB isn't reached immediately, start the server so health checks and fallbacks function
    app.listen(ENV.PORT, () => {
      console.log(`! Server running in fallback mode on http://localhost:${ENV.PORT} (Database pending connection)`);
    });
  }
}

startServer();
