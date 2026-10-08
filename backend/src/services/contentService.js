import prisma from "../config/prisma.js";
import { deleteStorageFile } from "../utils/storage.js";
import { getCached, setCached, invalidateCache } from "../utils/cache.js";

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
    // 1. Intro
    if (data.intro !== undefined && typeof data.intro === "object" && data.intro !== null) {
      result.intro = {
        eyebrow: sanitizeString(data.intro.eyebrow ?? "OUR HERITAGE", 100),
        heroTitle: sanitizeString(data.intro.heroTitle ?? "About", 100),
        title: sanitizeString(data.intro.title ?? "The story behind the lens.", 200),
        subtitle: sanitizeString(data.intro.subtitle ?? "A chance beginning. A lifelong passion.", 300),
        backgroundImage: sanitizeString(data.intro.backgroundImage ?? data.intro.bannerImage ?? "", 500),
        bannerImage: sanitizeString(data.intro.bannerImage ?? data.intro.backgroundImage ?? "", 500),
        imageAlt: sanitizeString(data.intro.imageAlt ?? "About Subash Studio heritage", 200),
        establishedYear: sanitizeString(String(data.intro.establishedYear ?? "1993"), 20),
      };
      result.heading = result.intro.title;
      result.establishedYear = result.intro.establishedYear;
    }

    // 2. Founder
    if (data.founder !== undefined && typeof data.founder === "object" && data.founder !== null) {
      result.founder = {
        label: sanitizeString(data.founder.label ?? "THE STORY OF THE FOUNDER", 120),
        name: sanitizeString(data.founder.name ?? "P. Arunachalam", 120),
        role: sanitizeString(data.founder.role ?? "FOUNDER, SUBASH STUDIO", 120),
        descParagraph1: sanitizeString(data.founder.descParagraph1 ?? "His story began in a village in the Western Ghats, with just a few cows and goats.", 2000),
        descParagraph2: sanitizeString(data.founder.descParagraph2 ?? "In 1987, a camera won in a lottery revealed his artistic talent — and became the beginning of a business that would grow to three branches.", 2000),
        caption: sanitizeString(data.founder.caption ?? "Where the journey began.", 200),
        photo1: sanitizeString(data.founder.photo1 ?? "/images/about/founder-camera.jpeg", 500),
        photo1Alt: sanitizeString(data.founder.photo1Alt ?? "P. Arunachalam holding an Agfa camera", 200),
        photo2: sanitizeString(data.founder.photo2 ?? "/images/about/founder-field.jpeg", 500),
        photo2Alt: sanitizeString(data.founder.photo2Alt ?? "P. Arunachalam in a marigold flower field", 200),
      };
      result.studioStory = `${result.founder.descParagraph1}\n\n${result.founder.descParagraph2}`;
    }

    // 3. Camera (1987 Turning Point)
    if (data.camera !== undefined && typeof data.camera === "object" && data.camera !== null) {
      result.camera = {
        label: sanitizeString(data.camera.label ?? "1987 • THE TURNING POINT", 120),
        heading: sanitizeString(data.camera.heading ?? "A camera. A new beginning.", 200),
        cameraName: sanitizeString(data.camera.cameraName ?? "Agfa Click III", 120),
        description: sanitizeString(data.camera.description ?? "An Agfa Click III camera, won in a lottery in 1987, changed his life and helped him discover his artistic skills.", 2000),
        image: "/images/about/agfa-camera-1987.png",
        imageAlt: sanitizeString(data.camera.imageAlt ?? "Agfa Click III camera", 200),
      };
    }

    // 4. Community Leadership
    if (data.community !== undefined && typeof data.community === "object" && data.community !== null) {
      result.community = {
        label: sanitizeString(data.community.label ?? "2018 • COMMUNITY & LEADERSHIP", 120),
        heading: sanitizeString(data.community.heading ?? "Serving the photography community.", 200),
        headingAccent: sanitizeString(data.community.headingAccent ?? "community.", 120),
        description: sanitizeString(data.community.description ?? "Became Vice President of the Tirunelveli District Photography Labour Welfare Association.", 2000),
        role: sanitizeString(data.community.role ?? "VICE PRESIDENT", 120),
        organization: sanitizeString(data.community.organization ?? "Tirunelveli District Photography Labour Welfare Association", 200),
        appointedYear: sanitizeString(data.community.appointedYear ?? "Appointed in 2018", 100),
        caption: sanitizeString(data.community.caption ?? "P. Arunachalam", 120),
        portrait: sanitizeString(data.community.portrait ?? "/images/about/founder-field.jpeg", 500),
        portraitAlt: sanitizeString(data.community.portraitAlt ?? "P. Arunachalam portrait", 200),
      };
    }

    // 5. Studio Journey Introduction
    if (data.journey !== undefined && typeof data.journey === "object" && data.journey !== null) {
      result.journey = {
        eyebrow: sanitizeString(data.journey.eyebrow ?? "OUR STUDIO JOURNEY", 100),
        title: sanitizeString(data.journey.title ?? "From one studio to a shared legacy.", 200),
        subtitle: sanitizeString(data.journey.subtitle ?? "Four milestones. One enduring passion.", 300),
      };
    }

    // 6. Milestones
    if (data.milestones !== undefined) {
      if (!Array.isArray(data.milestones)) {
        throw new Error("Milestones must be an array.");
      }
      result.milestones = data.milestones.map((m, idx) => {
        if (!m || typeof m !== "object") {
          throw new Error(`Milestone at index ${idx} must be an object.`);
        }
        return {
          id: sanitizeString(m.id || `m-${Date.now()}-${idx}`, 50),
          date: sanitizeString(m.date || "", 100),
          heading: sanitizeString(m.heading || "", 200),
          description: sanitizeString(m.description || "", 2000),
          quoteLine: sanitizeString(m.quoteLine || "", 200),
          layout: m.layout === "content-left" ? "content-left" : "photo-left",
          image: sanitizeString(m.image || "", 500),
          imageAlt: sanitizeString(m.imageAlt || "", 200),
        };
      });
    }

    // 7. Closing Location Summary
    if (data.closingSummary !== undefined && typeof data.closingSummary === "object" && data.closingSummary !== null) {
      result.closingSummary = {
        locations: sanitizeString(data.closingSummary.locations ?? "Kallidaikurichi · Chennai · Tirunelveli", 200),
        tagline: sanitizeString(data.closingSummary.tagline ?? "THREE BRANCHES. ONE SHARED LEGACY.", 200),
      };
    }

    // Legacy fields (backward compatibility)
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
  const cached = getCached("content:all");
  if (cached) return cached;

  const contents = await prisma.websiteContent.findMany();
  const map = {};
  contents.forEach((item) => {
    map[item.section] = item.data;
  });

  setCached("content:all", map, 120);
  return map;
}

export async function getContentBySection(section) {
  if (!VALID_SECTIONS.includes(section)) {
    return null;
  }
  const cached = getCached(`content:${section}`);
  if (cached) return cached;

  const item = await prisma.websiteContent.findUnique({
    where: { section },
  });
  const data = item ? item.data : null;
  if (data) {
    setCached(`content:${section}`, data, 120);
  }
  return data;
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

  invalidateCache("content");

  return prisma.websiteContent.upsert({
    where: { section },
    update: { data: merged },
    create: { section, data: merged },
  });
}

