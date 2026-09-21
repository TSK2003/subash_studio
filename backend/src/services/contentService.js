import prisma from "../config/prisma.js";

const VALID_SECTIONS = ["home", "about", "contact"];

function sanitizeString(str, maxLength) {
  if (typeof str !== "string") return "";
  const sanitized = str.replace(/<[^>]*>?/gm, "").trim();
  return sanitized.slice(0, maxLength);
}

function validateSectionData(section, data) {
  if (!data || typeof data !== "object") {
    throw new Error("Payload must be a valid JSON object.");
  }

  const result = {};

  if (section === "home") {
    if (data.heroHeading !== undefined) {
      result.heroHeading = sanitizeString(data.heroHeading, 300);
    }
    if (data.heroTagline !== undefined) {
      result.heroTagline = sanitizeString(data.heroTagline, 500);
    }
    if (data.heroCtaText !== undefined) {
      result.heroCtaText = sanitizeString(data.heroCtaText, 100);
    }
    if (data.stats && typeof data.stats === "object") {
      result.stats = {
        weddingsCaptured: sanitizeString(data.stats.weddingsCaptured || "", 50),
        yearsOfCraft: sanitizeString(data.stats.yearsOfCraft || "", 50),
        signatureFilms: sanitizeString(data.stats.signatureFilms || "", 50),
        happyFamilies: sanitizeString(data.stats.happyFamilies || "", 50),
      };
    }
  } else if (section === "about") {
    if (data.heading !== undefined) {
      result.heading = sanitizeString(data.heading, 300);
    }
    if (data.establishedYear !== undefined) {
      const yr = String(data.establishedYear).replace(/<[^>]*>?/gm, "").trim();
      if (yr && !/^\d{4}$/.test(yr) && yr.length > 20) {
        throw new Error("Established Year must be a valid year.");
      }
      result.establishedYear = yr.slice(0, 20);
    }
    if (data.studioStory !== undefined) {
      result.studioStory = sanitizeString(data.studioStory, 5000);
    }
    if (data.philosophy !== undefined) {
      result.philosophy = sanitizeString(data.philosophy, 5000);
    }
  } else if (section === "contact") {
    if (data.phone !== undefined) {
      const phone = sanitizeString(data.phone, 50);
      if (phone && !/^[\d\s+\-()]{5,30}$/.test(phone)) {
        throw new Error("Primary Phone must contain valid phone characters.");
      }
      result.phone = phone;
    }
    if (data.whatsapp !== undefined) {
      const whatsapp = sanitizeString(data.whatsapp, 50);
      if (whatsapp && !/^[\d\s+\-()]{5,30}$/.test(whatsapp)) {
        throw new Error("WhatsApp Hotline must contain valid phone characters.");
      }
      result.whatsapp = whatsapp;
    }
    if (data.email !== undefined) {
      const email = sanitizeString(data.email, 120);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Studio Email must be a valid email address.");
      }
      result.email = email;
    }
    if (data.hours !== undefined) {
      result.hours = sanitizeString(data.hours, 200);
    }
    if (data.instagram !== undefined) {
      result.instagram = sanitizeString(data.instagram, 300);
    }
    if (data.facebook !== undefined) {
      result.facebook = sanitizeString(data.facebook, 300);
    }
    if (data.youtube !== undefined) {
      result.youtube = sanitizeString(data.youtube, 300);
    }
  }

  return result;
}

export async function getAllContent() {
  const contents = await prisma.websiteContent.findMany();
  const map = {};
  contents.forEach((item) => {
    map[item.section] = item.data;
  });
  return map;
}

export async function getContentBySection(section) {
  if (!VALID_SECTIONS.includes(section)) {
    return null;
  }
  const item = await prisma.websiteContent.findUnique({
    where: { section },
  });
  return item ? item.data : null;
}

export async function updateContent(section, data) {
  if (!VALID_SECTIONS.includes(section)) {
    throw new Error(`Invalid section: '${section}'. Allowed sections are 'home', 'about', 'contact'.`);
  }

  const validated = validateSectionData(section, data);

  const existing = await prisma.websiteContent.findUnique({
    where: { section },
  });

  const merged = existing ? { ...(existing.data || {}), ...validated } : validated;

  return prisma.websiteContent.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}

