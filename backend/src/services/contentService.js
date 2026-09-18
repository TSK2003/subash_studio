import prisma from "../config/prisma.js";

export async function getAllContent() {
  const contents = await prisma.websiteContent.findMany();
  const map = {};
  contents.forEach((item) => {
    map[item.section] = item.data;
  });
  return map;
}

export async function getContentBySection(section) {
  const item = await prisma.websiteContent.findUnique({
    where: { section },
  });
  return item ? item.data : null;
}

export async function updateContent(section, data) {
  const existing = await prisma.websiteContent.findUnique({
    where: { section },
  });

  const merged = existing ? { ...(existing.data || {}), ...data } : data;

  return prisma.websiteContent.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}
