import prisma from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";

export async function loginAdmin({ email, password }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password are required.");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: cleanEmail },
  });

  if (!admin) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await comparePassword(cleanPassword, admin.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  const user = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    avatar: admin.avatar,
  };

  const token = generateToken({ userId: admin.id, email: admin.email });

  return { user, token };
}

export async function getAdminProfile(userId) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  return admin;
}

export async function updateAdminProfile(userId, updateData) {
  const data = {};
  if (updateData.name) data.name = updateData.name.trim();
  if (updateData.role) data.role = updateData.role.trim();
  if (updateData.avatar !== undefined) data.avatar = updateData.avatar;

  const updated = await prisma.adminUser.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
    },
  });

  return updated;
}

export async function changeAdminPassword(userId, { currentPassword, newPassword }) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: userId },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  const isMatch = await comparePassword(currentPassword, admin.passwordHash);
  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const newHash = await hashPassword(newPassword.trim());

  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return true;
}
