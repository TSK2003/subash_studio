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

export async function exportFullDataSnapshot(adminEmail = "admin") {
  const [
    adminUsers,
    bookings,
    enquiries,
    gallery,
    portfolio,
    services,
    films,
    branches,
    testimonials,
    websiteContent,
    studioSettings,
    frameWoodTypes,
    frameDesigns,
    frameRatios,
    frameOrders,
    categories,
    notifications,
    googleReviewsMeta
  ] = await Promise.all([
    prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true },
    }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.portfolioProject.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.film.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.branch.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.websiteContent.findMany(),
    prisma.studioSettings.findMany(),
    prisma.frameWoodType.findMany({ orderBy: { basePrice: "asc" } }),
    prisma.frameDesign.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.frameRatio.findMany({ orderBy: { price: "asc" } }),
    prisma.frameOrder.findMany({ include: { orderItems: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.googleReviewsMeta.findFirst(),
  ]);

  const settingsMap = {};
  studioSettings.forEach((item) => {
    settingsMap[item.section] = item.data;
  });

  const contentMap = {};
  websiteContent.forEach((item) => {
    contentMap[item.section] = item.data;
  });

  const galleryCategories = categories.filter((c) => c.type === "GALLERY");
  const portfolioCategories = categories.filter((c) => c.type === "PORTFOLIO");

  const counts = {
    bookings: bookings.length,
    enquiries: enquiries.length,
    gallery: gallery.length,
    galleryCategories: galleryCategories.length,
    portfolio: portfolio.length,
    portfolioCategories: portfolioCategories.length,
    services: services.length,
    films: films.length,
    branches: branches.length,
    testimonials: testimonials.length,
    frameWoodTypes: frameWoodTypes.length,
    frameDesigns: frameDesigns.length,
    frameRatios: frameRatios.length,
    frameOrders: frameOrders.length,
    notifications: notifications.length,
    websiteContentSections: websiteContent.length,
  };

  return {
    system: "Subash Studio Atelier Management System",
    version: "2.0",
    exportedAt: new Date().toISOString(),
    exportedBy: adminEmail,
    counts,
    adminUsers,
    bookings,
    enquiries,
    gallery,
    galleryCategories,
    portfolio,
    portfolioCategories,
    services,
    films,
    branches,
    testimonials,
    googleReviewsMeta: googleReviewsMeta || null,
    websiteContent: contentMap,
    settings: settingsMap,
    frameWoodTypes,
    frameDesigns,
    frameRatios,
    frameOrders,
    categories,
    notifications,
  };
}
