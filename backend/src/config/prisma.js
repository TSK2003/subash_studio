import { PrismaClient } from "@prisma/client";
import ENV from "./env.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ENV.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (ENV.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
