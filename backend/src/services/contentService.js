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
    // 1. Main Title
    if (data.heroMainTitle !== undefined || data.heroTitle !== undefined) {
      const val = data.heroMainTitle !== undefined ? data.heroMainTitle : data.heroTitle;
      if (typeof val !== "string") {
        throw new Error("Main Title must be a string.");
      }
      if (val.length > 150) {
        throw new Error(`Main Title cannot exceed 150 characters (received ${val.length} characters).`);
      }
      result.heroMainTitle = sanitizeString(val, 150);
      result.heroHeading = result.heroMainTitle;
    } else if (data.heroHeading !== undefined) {
      if (typeof data.heroHeading !== "string") {
        throw new Error("Hero Main Headline must be a string.");
      }
      if (data.heroHeading.length > 250) {
        throw new Error(
          `Hero Main Headline cannot exceed 250 characters (received ${data.heroHeading.length} characters).`
        );
      }
      result.heroHeading = sanitizeString(data.heroHeading, 250);
      result.heroMainTitle = result.heroHeading;
    }

    // 2. Subtitle
    if (data.heroSubtitle !== undefined) {
      if (typeof data.heroSubtitle !== "string") {
        throw new Error("Subtitle must be a string.");
      }
      if (data.heroSubtitle.length > 150) {
        throw new Error(`Subtitle cannot exceed 150 characters (received ${data.heroSubtitle.length} characters).`);
      }
      result.heroSubtitle = sanitizeString(data.heroSubtitle, 150);
      result.heroEyebrow = result.heroSubtitle;
    } else if (data.heroEyebrow !== undefined) {
      if (typeof data.heroEyebrow !== "string") {
        throw new Error("Hero Eyebrow must be a string.");
      }
      result.heroEyebrow = sanitizeString(data.heroEyebrow, 120);
      result.heroSubtitle = result.heroEyebrow;
    }

    // 3. Since Text
    if (data.heroSinceText !== undefined || data.heroSince !== undefined) {
      const val = data.heroSinceText !== undefined ? data.heroSinceText : data.heroSince;
      if (typeof val !== "string") {
        throw new Error("Since Text must be a string.");
      }
      if (val.length > 60) {
        throw new Error(`Since Text cannot exceed 60 characters (received ${val.length} characters).`);
      }
      result.heroSinceText = sanitizeString(val, 60);
    }

    // 4. Delivery Tagline
    if (data.heroDeliveryTagline !== undefined) {
      if (typeof data.heroDeliveryTagline !== "string") {
        throw new Error("Delivery Tagline must be a string.");
      }
      if (data.heroDeliveryTagline.length > 200) {
        throw new Error(`Delivery Tagline cannot exceed 200 characters (received ${data.heroDeliveryTagline.length} characters).`);
      }
      result.heroDeliveryTagline = sanitizeString(data.heroDeliveryTagline, 200);
      result.heroTagline = result.heroDeliveryTagline;
    } else if (data.heroTagline !== undefined) {
      if (typeof data.heroTagline !== "string") {
        throw new Error("Hero Subtitle / Tagline must be a string.");
      }
      result.heroTagline = sanitizeString(data.heroTagline, 300);
      result.heroDeliveryTagline = result.heroTagline;
    }

    // Hero Images (Screenshot 2)
    if (data.heroImages !== undefined) {
      if (!Array.isArray(data.heroImages)) {
        throw new Error("Hero Images must be an array.");
      }
      result.heroImages = data.heroImages.map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(`Hero image item at index ${index} must be an object.`);
        }
        const url = String(item.url || "").trim();
        if (!url) {
          throw new Error(`Hero image item at index ${index} is missing an image URL.`);
        }
        return {
          id: String(item.id || `himg-${Date.now()}-${index}`),
          url: url,
          name: sanitizeString(item.name || item.filename || "Hero Image", 120),
          order: typeof item.order === "number" ? item.order : index,
          active: item.active !== false,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }).sort((a, b) => a.order - b.order);
    }

    if (data.heroImageLoop !== undefined) {
      result.heroImageLoop = Boolean(data.heroImageLoop);
    } else if (data.loopSlideshow !== undefined) {
      result.heroImageLoop = Boolean(data.loopSlideshow);
    } else if (data.heroVideoLoop !== undefined) {
      result.heroImageLoop = Boolean(data.heroVideoLoop);
    }

    // Legacy Hero Videos (maintained for backward compatibility)
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

  // Preserve existing video files in storage without deleting them


  const merged = existing ? { ...(existing.data || {}), ...validated } : validated;

  return prisma.websiteContent.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}

