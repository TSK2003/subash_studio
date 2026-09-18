import prisma from "../config/prisma.js";

export async function getAllBranches(includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  return prisma.branch.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
}

export async function createBranch(data) {
  const id = data.id || `BR-${Math.floor(100 + Math.random() * 900)}`;
  const city = (data.city || "Studio Branch").trim();
  const name = (data.name || `${city} Studio`).trim();
  const tag = data.tag || "Studio & Consultation Lounge";
  const address = (data.address || "").trim();
  const phone = (data.phone || "+91 93457 06609").trim();
  const whatsapp = (data.whatsapp || phone).trim();
  const email = (data.email || "subashstudio009@gmail.com").trim();
  const mapsUrl = (data.mapsUrl || "").trim();
  const embedUrl = (data.embedUrl || "").trim();
  const hours = data.hours || "Mon – Sun, 08:00 AM – 09:00 PM";
  const image = (data.image || "/images/gallery/branches/kalladaikurichi.jpg").trim();
  const manager = (data.manager || "").trim() || null;
  const active = data.active !== false;

  return prisma.branch.create({
    data: {
      id,
      name,
      city,
      tag,
      address,
      phone,
      whatsapp,
      email,
      mapsUrl,
      embedUrl,
      hours,
      image,
      manager,
      active,
    },
  });
}

export async function updateBranch(id, data) {
  const updatePayload = {};

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.city !== undefined) updatePayload.city = data.city.trim();
  if (data.tag !== undefined) updatePayload.tag = data.tag;
  if (data.address !== undefined) updatePayload.address = data.address.trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp.trim();
  if (data.email !== undefined) updatePayload.email = data.email.trim();
  if (data.mapsUrl !== undefined) updatePayload.mapsUrl = data.mapsUrl.trim();
  if (data.embedUrl !== undefined) updatePayload.embedUrl = data.embedUrl.trim();
  if (data.hours !== undefined) updatePayload.hours = data.hours;
  if (data.image !== undefined) updatePayload.image = data.image.trim();
  if (data.manager !== undefined) updatePayload.manager = data.manager ? data.manager.trim() : null;
  if (data.active !== undefined) updatePayload.active = Boolean(data.active);

  return prisma.branch.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteBranch(id) {
  return prisma.branch.delete({
    where: { id },
  });
}

export async function toggleBranchStatus(id) {
  const item = await prisma.branch.findUnique({ where: { id } });
  if (!item) throw new Error("Branch not found.");

  return prisma.branch.update({
    where: { id },
    data: { active: !item.active },
  });
}
