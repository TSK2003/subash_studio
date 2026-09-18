import prisma from "../config/prisma.js";

export async function getAllTestimonials(adminView = false) {
  const where = adminView ? {} : { approved: true, hidden: false };
  return prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createTestimonial(data) {
  const id = data.id || `TST-${Math.floor(100 + Math.random() * 900)}`;
  const customerName = (data.customerName || data.clientName || data.name || "Valued Client").trim();
  const customerRole = (data.customerRole || data.eventType || "Client").trim();
  const customerImage = (data.customerImage || data.image || data.avatar || "").trim() || null;
  const review = (data.review || data.quote || data.content || "").trim();
  const rating = typeof data.rating === "number" ? Math.max(1, Math.min(5, Math.round(data.rating))) : 5;
  const source = data.source || "manual";
  const approved = data.approved !== false;
  const featured = Boolean(data.featured);
  const hidden = Boolean(data.hidden);
  const syncStatus = data.syncStatus || (source === "google" ? "imported" : "approved");
  const date = data.date || new Date().toISOString().split("T")[0];

  return prisma.testimonial.create({
    data: {
      id,
      customerName,
      customerRole,
      customerImage,
      review,
      rating,
      eventType: data.eventType || null,
      source,
      approved,
      featured,
      hidden,
      syncStatus,
      date,
      googleReviewId: data.googleReviewId || null,
      googleUpdateTime: data.googleUpdateTime || null,
      googleReply: data.googleReply || null,
    },
  });
}

export async function updateTestimonial(id, data) {
  const updatePayload = {};

  if (data.customerName !== undefined || data.name !== undefined) {
    updatePayload.customerName = (data.customerName || data.name || "").trim();
  }
  if (data.customerRole !== undefined) updatePayload.customerRole = data.customerRole.trim();
  if (data.customerImage !== undefined || data.image !== undefined) {
    updatePayload.customerImage = (data.customerImage || data.image || "").trim() || null;
  }
  if (data.review !== undefined || data.quote !== undefined) {
    updatePayload.review = (data.review || data.quote || "").trim();
  }
  if (data.rating !== undefined) {
    updatePayload.rating = Math.max(1, Math.min(5, Math.round(data.rating)));
  }
  if (data.eventType !== undefined) updatePayload.eventType = data.eventType;
  if (data.approved !== undefined) updatePayload.approved = Boolean(data.approved);
  if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
  if (data.hidden !== undefined) updatePayload.hidden = Boolean(data.hidden);
  if (data.syncStatus !== undefined) updatePayload.syncStatus = data.syncStatus;
  if (data.date !== undefined) updatePayload.date = data.date;

  return prisma.testimonial.update({
    where: { id },
    data: updatePayload,
  });
}

export async function deleteTestimonial(id) {
  return prisma.testimonial.delete({
    where: { id },
  });
}

export async function toggleTestimonialApproved(id) {
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) throw new Error("Testimonial not found.");

  return prisma.testimonial.update({
    where: { id },
    data: { approved: !item.approved },
  });
}

export async function toggleTestimonialFeatured(id) {
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) throw new Error("Testimonial not found.");

  return prisma.testimonial.update({
    where: { id },
    data: { featured: !item.featured },
  });
}

export async function toggleTestimonialHidden(id) {
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) throw new Error("Testimonial not found.");

  return prisma.testimonial.update({
    where: { id },
    data: { hidden: !item.hidden },
  });
}

export async function getGoogleReviewsMeta() {
  let meta = await prisma.googleReviewsMeta.findUnique({
    where: { id: "singleton" },
  });
  if (!meta) {
    meta = await prisma.googleReviewsMeta.create({
      data: {
        id: "singleton",
        totalGoogleReviews: 0,
        accountName: "Subash Studio",
      },
    });
  }
  return meta;
}

export async function syncGoogleReviews(fetchedReviews = []) {
  let addedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const review of fetchedReviews) {
    const googleId = review.googleReviewId || review.id;
    if (!googleId) continue;

    const existing = await prisma.testimonial.findFirst({
      where: {
        OR: [{ googleReviewId: googleId }, { id: googleId }],
      },
    });

    if (existing) {
      const hasChanged =
        existing.review !== review.review ||
        existing.rating !== review.rating ||
        existing.googleReply !== review.googleReply;

      if (hasChanged) {
        await prisma.testimonial.update({
          where: { id: existing.id },
          data: {
            review: review.review,
            rating: review.rating,
            date: review.date || existing.date,
            googleReply: review.googleReply || existing.googleReply,
            googleUpdateTime: review.googleUpdateTime || existing.googleUpdateTime,
            customerName: review.customerName || existing.customerName,
            customerImage: review.customerImage || existing.customerImage,
          },
        });
        updatedCount++;
      } else {
        unchangedCount++;
      }
    } else {
      await prisma.testimonial.create({
        data: {
          id: review.id || `google-${googleId}`,
          customerName: review.customerName || "Google Reviewer",
          customerRole: "Google Reviewer",
          customerImage: review.customerImage || null,
          review: review.review || "",
          rating: review.rating || 5,
          source: "google",
          approved: false, // Default false for admin moderation
          featured: false,
          hidden: false,
          syncStatus: "imported",
          date: review.date || new Date().toISOString().split("T")[0],
          googleReviewId: googleId,
          googleUpdateTime: review.googleUpdateTime || null,
          googleReply: review.googleReply || null,
        },
      });
      addedCount++;
    }
  }

  // Update meta
  const currentMeta = await getGoogleReviewsMeta();
  await prisma.googleReviewsMeta.update({
    where: { id: "singleton" },
    data: {
      lastSynced: new Date(),
      totalGoogleReviews: (currentMeta.totalGoogleReviews || 0) + addedCount,
    },
  });

  return {
    checked: fetchedReviews.length,
    added: addedCount,
    updated: updatedCount,
    unchanged: unchangedCount,
  };
}
