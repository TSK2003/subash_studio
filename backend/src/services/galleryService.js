import crypto from "node:crypto";
import prisma from "../config/prisma.js";

export async function getAllGallery(options = {}) {
  // Support both boolean includeUnpublished and object options for backward compatibility
  const isObject = typeof options === "object" && options !== null;
  const includeUnpublished = isObject ? Boolean(options.includeUnpublished || options.all) : Boolean(options);
  const category = isObject ? options.category : null;
  const page = isObject ? options.page : undefined;
  const limit = isObject ? options.limit : undefined;
  const featuredOnly = isObject ? Boolean(options.featuredOnly || options.featured) : false;

  const where = {};
  if (!includeUnpublished) {
    where.published = true;
    const inactiveCats = await prisma.category.findMany({
      where: { type: "GALLERY", active: false },
      select: { name: true },
    });
    const inactiveNames = new Set(inactiveCats.map((c) => c.name.toLowerCase()));
    if (category && category !== "ALL" && category !== "all") {
      if (inactiveNames.has(category.toLowerCase())) {
        if (page !== undefined || limit !== undefined) {
          return {
            items: [],
            pagination: { total: 0, page: 1, limit: Number(limit) || 30, totalPages: 0 },
          };
        }
        return [];
      }
      where.category = category;
    } else if (inactiveCats.length > 0) {
      where.category = {
        notIn: Array.from(new Set(inactiveCats.flatMap((c) => [c.name, c.name.toLowerCase(), c.name.toUpperCase()]))),
      };
    }
  } else if (category && category !== "ALL" && category !== "all") {
    where.category = category;
  }
  if (featuredOnly) {
    where.featured = true;
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.galleryItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  return prisma.galleryItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createGalleryItem(data) {
  const id =
    data.id || `GAL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const title = (data.title || data.caption || "Subash Studio Gallery").trim();
  const category = data.category || "Wedding";
  const imageUrl = (data.imageUrl || data.src || "").trim();
  const aspect = data.aspect || "landscape";
  const featured = Boolean(data.featured);
  const published = data.published !== false;
  const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

  return prisma.galleryItem.create({
    data: {
      id,
      title,
      category,
      imageUrl,
      aspect,
      featured,
      published,
      createdAt,
    },
  });
}

export async function updateGalleryItem(id, data) {
  const updatePayload = {};

  if (data.title !== undefined || data.caption !== undefined) {
    updatePayload.title = (data.title || data.caption || "").trim();
  }
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.imageUrl !== undefined || data.src !== undefined) {
    updatePayload.imageUrl = (data.imageUrl || data.src || "").trim();
  }
  if (data.aspect !== undefined) updatePayload.aspect = data.aspect;
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.published !== undefined) updatePayload.published = Boolean(data.published);

  return prisma.galleryItem.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteGalleryItem(id) {
  return prisma.galleryItem.delete({
    where: { id },
  });
}

export async function toggleGalleryFeatured(id) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  return prisma.galleryItem.update({
    where: { id },
    data: { featured: !item.featured },
  });
}

export async function toggleGalleryPublished(id) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  return prisma.galleryItem.update({
    where: { id },
    data: { published: !item.published },
  });
}

// =========================================================================
// GALLERY ALBUM MANAGEMENT
// =========================================================================

export function slugifyTitle(text) {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "album"
  );
}

export async function generateUniqueAlbumSlug(baseTitle, excludeAlbumId = null) {
  const baseSlug = slugifyTitle(baseTitle);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.galleryAlbum.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (excludeAlbumId && existing.id === excludeAlbumId)) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Get all albums with photo counts, filtered for public or admin view
 */
export async function getAllAlbums(options = {}) {
  const isObject = typeof options === "object" && options !== null;
  const includeUnpublished = isObject ? Boolean(options.includeUnpublished || options.all) : Boolean(options);
  const category = isObject ? options.category : null;
  const search = isObject && options.search ? options.search.trim().toLowerCase() : null;

  const where = {};

  if (!includeUnpublished) {
    where.published = true;

    // Filter out inactive categories
    const inactiveCats = await prisma.category.findMany({
      where: { type: "GALLERY", active: false },
      select: { name: true },
    });
    const inactiveNames = new Set(inactiveCats.map((c) => c.name.toLowerCase()));

    if (category && category !== "ALL" && category !== "all") {
      if (inactiveNames.has(category.toLowerCase())) {
        return [];
      }
      where.category = { equals: category, mode: "insensitive" };
    } else if (inactiveCats.length > 0) {
      where.category = {
        notIn: Array.from(new Set(inactiveCats.flatMap((c) => [c.name, c.name.toLowerCase(), c.name.toUpperCase()]))),
      };
    }
  } else if (category && category !== "ALL" && category !== "all") {
    where.category = { equals: category, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const albums = await prisma.galleryAlbum.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { photos: true },
      },
      photos: {
        take: 4,
        orderBy: { order: "asc" },
        select: { id: true, url: true, aspect: true },
      },
    },
  });

  return albums.map((alb) => ({
    ...alb,
    photoCount: alb._count?.photos || 0,
  }));
}

/**
 * Get a single album by slug or ID with all its photos ordered
 */
export async function getAlbumBySlugOrId(slugOrId, includeUnpublished = false) {
  if (!slugOrId) return null;

  const album = await prisma.galleryAlbum.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { photos: true },
      },
    },
  });

  if (!album) return null;
  if (!includeUnpublished && !album.published) return null;

  return {
    ...album,
    photoCount: album._count?.photos || album.photos?.length || 0,
  };
}

/**
 * Create a new album with validation and optional initial photos
 */
export async function createAlbum(data) {
  const title = (data.title || "").trim();
  const category = (data.category || "").trim();
  let coverImage = (data.coverImage || "").trim();
  const description = (data.description || "").trim() || null;
  const featured = Boolean(data.featured);
  let published = Boolean(data.published);

  if (!title) {
    throw new Error("Lead / Event Name is required.");
  }
  if (!category) {
    throw new Error("Category selection is required.");
  }

  const initialPhotos = Array.isArray(data.photos) ? data.photos.filter((p) => p && (p.url || p.src)) : [];

  if (!coverImage && initialPhotos.length > 0) {
    coverImage = initialPhotos[0].url || initialPhotos[0].src;
  }

  // Enforce publishing requirements
  if (published) {
    if (!coverImage) {
      throw new Error("Cannot publish album without a cover image.");
    }
    if (initialPhotos.length === 0) {
      throw new Error("Cannot publish album without at least one album photo.");
    }
  }

  const id = data.id || `ALB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const slug = await generateUniqueAlbumSlug(data.slug || title);

  const album = await prisma.galleryAlbum.create({
    data: {
      id,
      title,
      slug,
      category,
      coverImage: coverImage || "/images/placeholder.jpg",
      description,
      featured,
      published,
      photos: {
        create: initialPhotos.map((photo, index) => ({
          id: photo.id || `PHO-${Date.now()}-${index}-${crypto.randomBytes(2).toString("hex")}`,
          url: photo.url || photo.src,
          caption: (photo.caption || "").trim() || null,
          width: photo.width ? Number(photo.width) : null,
          height: photo.height ? Number(photo.height) : null,
          aspect: photo.aspect || "portrait",
          order: typeof photo.order === "number" ? photo.order : index,
        })),
      },
    },
    include: {
      photos: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { photos: true },
      },
    },
  });

  return {
    ...album,
    photoCount: album._count?.photos || album.photos?.length || 0,
  };
}

/**
 * Update an album's details, cover, or publishing status
 */
export async function updateAlbum(id, data) {
  const existing = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { _count: { select: { photos: true } } },
  });
  if (!existing) {
    throw new Error("Album not found.");
  }

  const updatePayload = {};

  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) throw new Error("Lead / Event Name cannot be empty.");
    updatePayload.title = title;

    if (data.slug) {
      updatePayload.slug = await generateUniqueAlbumSlug(data.slug, id);
    } else if (title !== existing.title) {
      updatePayload.slug = await generateUniqueAlbumSlug(title, id);
    }
  }

  if (data.category !== undefined) {
    const category = data.category.trim();
    if (!category) throw new Error("Category cannot be empty.");
    updatePayload.category = category;
  }

  if (data.coverImage !== undefined) {
    updatePayload.coverImage = data.coverImage.trim();
  }

  if (data.description !== undefined) {
    updatePayload.description = data.description.trim() || null;
  }

  if (data.featured !== undefined) {
    updatePayload.featured = Boolean(data.featured);
  }

  if (data.order !== undefined) {
    updatePayload.order = Number(data.order) || 0;
  }

  if (data.published !== undefined) {
    const targetPublished = Boolean(data.published);
    if (targetPublished) {
      const cover = updatePayload.coverImage || existing.coverImage;
      const currentPhotoCount = existing._count?.photos || 0;
      if (!cover) {
        throw new Error("Cannot publish album without a cover image.");
      }
      if (currentPhotoCount === 0) {
        throw new Error("Cannot publish album without at least one album photo.");
      }
    }
    updatePayload.published = targetPublished;
  }

  const updated = await prisma.galleryAlbum.update({
    where: { id },
    data: updatePayload,
    include: {
      photos: { orderBy: { order: "asc" } },
      _count: { select: { photos: true } },
    },
  });

  return {
    ...updated,
    photoCount: updated._count?.photos || updated.photos?.length || 0,
  };
}

/**
 * Toggle album published status with validation
 */
export async function toggleAlbumPublished(id) {
  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { _count: { select: { photos: true } } },
  });
  if (!album) throw new Error("Album not found.");

  const nextPublished = !album.published;

  if (nextPublished) {
    if (!album.coverImage) {
      throw new Error("Cannot publish album without a cover image.");
    }
    if ((album._count?.photos || 0) === 0) {
      throw new Error("Cannot publish album: at least one photo is required.");
    }
  }

  const updated = await prisma.galleryAlbum.update({
    where: { id },
    data: { published: nextPublished },
    include: {
      _count: { select: { photos: true } },
    },
  });

  return {
    ...updated,
    photoCount: updated._count?.photos || 0,
  };
}

/**
 * Delete an album and all of its associated photos
 */
export async function deleteAlbum(id) {
  return prisma.galleryAlbum.delete({
    where: { id },
  });
}

/**
 * Add photos to an album
 */
export async function addPhotosToAlbum(albumId, photos) {
  const album = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      photos: {
        orderBy: { order: "desc" },
        take: 1,
      },
    },
  });
  if (!album) throw new Error("Album not found.");

  let nextOrder = album.photos.length > 0 ? (album.photos[0].order || 0) + 1 : 0;
  const photoList = Array.isArray(photos) ? photos : [photos];

  const createdPhotos = [];
  for (const item of photoList) {
    const url = (item.url || item.src || "").trim();
    if (!url) continue;

    const newPhoto = await prisma.galleryPhoto.create({
      data: {
        id: item.id || `PHO-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        albumId,
        url,
        caption: (item.caption || "").trim() || null,
        width: item.width ? Number(item.width) : null,
        height: item.height ? Number(item.height) : null,
        aspect: item.aspect || "portrait",
        order: typeof item.order === "number" ? item.order : nextOrder++,
      },
    });
    createdPhotos.push(newPhoto);
  }

  // If album cover is empty or placeholder, set to first photo
  if ((!album.coverImage || album.coverImage.includes("placeholder")) && createdPhotos.length > 0) {
    await prisma.galleryAlbum.update({
      where: { id: albumId },
      data: { coverImage: createdPhotos[0].url },
    });
  }

  return createdPhotos;
}

/**
 * Remove a single photo from an album and update cover if needed
 */
export async function removePhotoFromAlbum(albumId, photoId) {
  const photo = await prisma.galleryPhoto.findFirst({
    where: { id: photoId, albumId },
  });
  if (!photo) throw new Error("Photo not found in this album.");

  await prisma.galleryPhoto.delete({
    where: { id: photoId },
  });

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      photos: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { photos: true } },
    },
  });

  if (album) {
    const remainingCount = album._count?.photos || 0;
    const updateData = {};

    // If remaining is 0, unpublish album
    if (remainingCount === 0 && album.published) {
      updateData.published = false;
    }

    // If removed photo was cover image, update cover to next photo
    if (album.coverImage === photo.url) {
      if (album.photos.length > 0) {
        updateData.coverImage = album.photos[0].url;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.galleryAlbum.update({
        where: { id: albumId },
        data: updateData,
      });
    }
  }

  return { success: true, message: "Photo removed from album." };
}

/**
 * Reorder photos inside an album
 */
export async function reorderAlbumPhotos(albumId, photoOrders) {
  if (!Array.isArray(photoOrders)) {
    throw new Error("photoOrders must be an array of { id, order }.");
  }

  const updates = photoOrders.map((item) =>
    prisma.galleryPhoto.updateMany({
      where: { id: item.id, albumId },
      data: { order: item.order },
    })
  );

  await prisma.$transaction(updates);

  return prisma.galleryPhoto.findMany({
    where: { albumId },
    orderBy: { order: "asc" },
  });
}

/**
 * Update/replace an individual photo in an album
 */
export async function updateAlbumPhoto(albumId, photoId, data) {
  const photo = await prisma.galleryPhoto.findFirst({
    where: { id: photoId, albumId },
  });
  if (!photo) {
    throw new Error("Photo not found in this album.");
  }

  const updateData = {};
  if (data.url !== undefined) updateData.url = data.url.trim();
  if (data.caption !== undefined) updateData.caption = (data.caption || "").trim() || null;
  if (data.aspect !== undefined) updateData.aspect = data.aspect;
  if (data.order !== undefined) updateData.order = Number(data.order);
  if (data.width !== undefined) updateData.width = Number(data.width);
  if (data.height !== undefined) updateData.height = Number(data.height);

  return prisma.galleryPhoto.update({
    where: { id: photoId },
    data: updateData,
  });
}

/**
 * Set cover image for an album
 */
export async function setAlbumCover(albumId, coverUrl) {
  const cleanUrl = (coverUrl || "").trim();
  if (!cleanUrl) throw new Error("Cover URL is required.");

  return prisma.galleryAlbum.update({
    where: { id: albumId },
    data: { coverImage: cleanUrl },
  });
}

/**
 * Query media library from existing GalleryItems and albums for reuse
 */
export async function getMediaLibrary(options = {}) {
  const category = options.category;
  const where = {};
  if (category && category !== "ALL" && category !== "all") {
    where.category = { equals: category, mode: "insensitive" };
  }

  const items = await prisma.galleryItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      category: true,
      aspect: true,
      createdAt: true,
    },
  });

  return items.map((it) => ({
    id: it.id,
    url: it.imageUrl,
    title: it.title,
    category: it.category,
    aspect: it.aspect,
    createdAt: it.createdAt,
  }));
}

/**
 * Seed initial albums if none exist in the database, using existing authentic studio photos
 */
export async function seedInitialAlbumsIfNeeded() {
  try {
    const count = await prisma.galleryAlbum.count();
    if (count > 0) return;

    // Fetch existing gallery items to group into real albums
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (!items || items.length === 0) return;

    // Group items by category
    const byCategory = {};
    for (const item of items) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    }

    // Curated real lead/event albums representing authentic client showcases
    const albumSpecs = [
      {
        title: "Arun & Priya",
        category: "Wedding",
        description: "A grand traditional Tamil wedding celebration filled with authentic rituals, emotional blessings, and timeless memories.",
      },
      {
        title: "Karthik & Sneha",
        category: "Reception",
        description: "An elegant evening reception with glittering chandeliers, warm celebrations, and radiant couple portraits.",
      },
      {
        title: "Siddharth & Meera",
        category: "Engagement",
        description: "Intimate ring ceremony and vibrant family celebrations captured in natural studio & outdoor lighting.",
      },
      {
        title: "Vikram & Ananya",
        category: "Couple Shoot",
        description: "Romantic candid couple portraits capturing effortless chemistry against picturesque outdoor landscapes.",
      },
      {
        title: "Baby Aryan",
        category: "Baby Shoot",
        description: "Playful, adorable milestones and first birthday portraiture captured in our specialized baby studio lounge.",
      },
      {
        title: "Divya & Ashwin",
        category: "Maternity Shoot",
        description: "A serene motherhood journey documented with graceful poses, flowing fabrics, and gentle golden light.",
      },
      {
        title: "Rithanya's 1st Birthday",
        category: "Birthday",
        description: "Joyous laughter, vibrant cake smash moments, and joyful family frames celebrating a milestone first birthday.",
      },
      {
        title: "Keerthana's Ceremony",
        category: "Puberty Ceremony",
        description: "Traditional auspicious rituals, radiant turmeric ceremony portraits, and cultural family traditions.",
      },
      {
        title: "Lakshmi Nivas",
        category: "House Warming",
        description: "Traditional Grihapravesam rituals, boiling milk ceremonies, and warm architectural family memories.",
      },
      {
        title: "Apex Tech Conclave",
        category: "Corporate",
        description: "Executive keynote sessions, networking summits, and professional corporate documentary coverage.",
      },
    ];

    let albumOrder = 0;
    for (const spec of albumSpecs) {
      const catPhotos = byCategory[spec.category] || [];
      if (catPhotos.length === 0) continue;

      const slug = slugifyTitle(spec.title);
      const cover = catPhotos[0].imageUrl;
      const albumId = `ALB-${spec.category.toUpperCase().slice(0, 3)}-${Date.now()}-${albumOrder}`;

      await prisma.galleryAlbum.create({
        data: {
          id: albumId,
          title: spec.title,
          slug,
          category: spec.category,
          coverImage: cover,
          description: spec.description,
          featured: albumOrder < 3,
          published: true,
          order: albumOrder,
          photos: {
            create: catPhotos.map((p, idx) => ({
              id: `PHO-${albumId}-${idx}`,
              url: p.imageUrl,
              caption: p.title || `${spec.title} Moment ${idx + 1}`,
              aspect: p.aspect || (idx % 2 === 0 ? "portrait" : "landscape"),
              order: idx,
            })),
          },
        },
      });

      albumOrder++;
    }

    console.log(`✓ Seeded ${albumOrder} initial Gallery Albums with authentic studio photography`);
  } catch (err) {
    console.warn("[seedInitialAlbumsIfNeeded] Warning:", err.message);
  }
}

