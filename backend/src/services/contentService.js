import prisma from "../config/prisma.js";
import { deleteStorageFile } from "../utils/storage.js";

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
      if (typeof data.heroHeading !== "string") {
        throw new Error("Hero Main Headline must be a string.");
      }
      if (data.heroHeading.length > 20) {
        throw new Error(
          `Hero Main Headline cannot exceed 20 characters (received ${data.heroHeading.length} characters).`
        );
      }
      result.heroHeading = data.heroHeading.replace(/<[^>]*>?/gm, "");
    }

    if (data.heroTagline !== undefined) {
      if (typeof data.heroTagline !== "string") {
        throw new Error("Hero Subtitle / Tagline must be a string.");
      }
      if (data.heroTagline.length > 150) {
        throw new Error(
          `Hero Subtitle / Tagline cannot exceed 150 characters (received ${data.heroTagline.length} characters).`
        );
      }
      result.heroTagline = data.heroTagline.replace(/<[^>]*>?/gm, "");
    }

    if (data.heroVideos !== undefined) {
      if (!Array.isArray(data.heroVideos)) {
        throw new Error("Hero Videos must be an array.");
      }
      result.heroVideos = data.heroVideos.map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(`Hero video item at index ${index} must be an object.`);
        }
        const url = String(item.url || "").trim();
        if (!url) {
          throw new Error(`Hero video item at index ${index} is missing a video URL.`);
        }
        return {
          id: String(item.id || `hvid-${Date.now()}-${index}`),
          url: url,
          name: sanitizeString(item.name || item.filename || "Hero Video", 120),
          duration: item.duration ? sanitizeString(String(item.duration), 30) : null,
          order: typeof item.order === "number" ? item.order : index,
          active: item.active !== false,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }).sort((a, b) => a.order - b.order);
    }

    if (data.heroVideoLoop !== undefined) {
      result.heroVideoLoop = Boolean(data.heroVideoLoop);
    } else if (data.loopHeroVideos !== undefined) {
      result.heroVideoLoop = Boolean(data.loopHeroVideos);
    }

    if (data.heroImage !== undefined) {
      result.heroImage = String(data.heroImage).trim();
    }

>>>>>>> 6484f85a5164a5a3c12f8894b718a3e5d0054dba
    result.heroCtaText = "BOOK A SHOOT";
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

  // If section is 'home' and heroVideos were updated, safely delete any removed video files
  if (section === "home" && validated.heroVideos !== undefined && existing?.data?.heroVideos) {
    const existingVideos = Array.isArray(existing.data.heroVideos) ? existing.data.heroVideos : [];
    const remainingUrls = new Set(validated.heroVideos.map((v) => v.url));
    const removedVideos = existingVideos.filter((v) => v && v.url && !remainingUrls.has(v.url));
    for (const removed of removedVideos) {
      try {
        await deleteStorageFile(removed.url);
      } catch (e) {
        console.warn("[contentService] Could not delete removed hero video file:", removed.url, e.message);
      }
    }
  }

  const merged = existing ? { ...(existing.data || {}), ...validated } : validated;

  return prisma.websiteContent.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}

