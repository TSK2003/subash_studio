/**
 * One-time script to reset the admin password to the value in .env
 * Run with: node scripts/resetAdminPassword.js
 */
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

import prisma from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/password.js";

const email = process.env.INITIAL_ADMIN_EMAIL || "subashstudio009@gmail.com";
const newPassword = process.env.INITIAL_ADMIN_PASSWORD;

if (!newPassword) {
  console.error("❌ INITIAL_ADMIN_PASSWORD is not set in your .env file.");
  process.exit(1);
}

const admin = await prisma.adminUser.findUnique({ where: { email } });

if (!admin) {
  console.log(`No admin found with email: ${email}. Creating new admin user...`);
  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: "Subash",
      role: "Studio Director & Founder",
      avatar: "/images/admin/profile.png",
    },
  });
  console.log(`✅ Admin user created successfully!`);
} else {
  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({
    where: { email },
    data: { passwordHash },
  });
  console.log(`✅ Admin password updated successfully!`);
}

console.log(`   Email:    ${email}`);
console.log(`   Password: ${newPassword}`);

await prisma.$disconnect();
