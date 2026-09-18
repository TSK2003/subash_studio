import prisma from "../config/prisma.js";

export async function getAllSettings() {
  const settings = await prisma.studioSettings.findMany();
  const map = {};
  settings.forEach((item) => {
    map[item.section] = item.data;
  });
  return map;
}

export async function getSettingsBySection(section) {
  const item = await prisma.studioSettings.findUnique({
    where: { section },
  });
  return item ? item.data : null;
}

export async function updateSettings(section, data) {
  const existing = await prisma.studioSettings.findUnique({
    where: { section },
  });

  const merged = existing ? { ...(existing.data || {}), ...data } : data;

  return prisma.studioSettings.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}
