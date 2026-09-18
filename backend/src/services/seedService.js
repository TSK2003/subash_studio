import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";
import {
  initialBookings,
  initialEnquiries,
  initialGallery,
  initialPortfolio,
  initialServices,
  initialFilms,
  initialBranches,
  initialTestimonials,
  initialWebsiteContent,
  initialSettings,
  initialFrameWoodTypes,
  initialFrameDesigns,
  initialFrameRatios,
  initialFrameOrders,
} from "./seedData.js";

export async function seedInitialDataIfNeeded() {
  try {
    // 1. Seed Admin User if none exists
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const defaultPasswordHash = await hashPassword("subash@2026");
      await prisma.adminUser.create({
        data: {
          email: "subashstudio009@gmail.com",
          passwordHash: defaultPasswordHash,
          name: "Subash",
          role: "Studio Director & Founder",
          avatar: "/images/admin/profile.png",
        },
      });
      console.log("✓ Default admin user seeded (subashstudio009@gmail.com)");
    }

    // 2. Services
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
      for (const item of initialServices) {
        await prisma.service.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
            image: item.image,
            shortDesc: item.shortDesc,
            fullDesc: item.fullDesc || item.shortDesc,
            startingPrice: item.startingPrice,
            features: item.features || [],
            status: item.status || "Active",
          },
        });
      }
      console.log("✓ Services seeded");
    }

    // 3. Branches
    const branchCount = await prisma.branch.count();
    if (branchCount === 0) {
      for (const item of initialBranches) {
        await prisma.branch.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            city: item.city,
            tag: item.tag,
            address: item.address,
            phone: item.phone,
            whatsapp: item.whatsapp,
            email: item.email,
            mapsUrl: item.mapsUrl || "",
            embedUrl: item.embedUrl || "",
            hours: item.hours,
            image: item.image,
            manager: item.manager || "",
            active: item.active !== false,
          },
        });
      }
      console.log("✓ Branches seeded");
    }

    // 4. Frame Wood Types
    const woodCount = await prisma.frameWoodType.count();
    if (woodCount === 0) {
      for (const item of initialFrameWoodTypes) {
        await prisma.frameWoodType.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            basePrice: item.basePrice || 0,
            description: item.description || "",
            grain: item.grain || "",
            image: item.image || "",
            active: item.active !== false,
          },
        });
      }
      console.log("✓ Frame Wood Types seeded");
    }

    // 5. Frame Designs
    const designCount = await prisma.frameDesign.count();
    if (designCount === 0) {
      for (const item of initialFrameDesigns) {
        await prisma.frameDesign.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            additionalPrice: item.additionalPrice || 0,
            description: item.description || "",
            image: item.image || "",
            compatibleWoods: item.compatibleWoods || ["All"],
            active: item.active !== false,
          },
        });
      }
      console.log("✓ Frame Designs seeded");
    }

    // 6. Frame Ratios
    const ratioCount = await prisma.frameRatio.count();
    if (ratioCount === 0) {
      for (const item of initialFrameRatios) {
        await prisma.frameRatio.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            label: item.label,
            dimensions: item.dimensions,
            price: item.price,
            aspect: item.aspect || "landscape",
            popular: Boolean(item.popular),
            active: item.active !== false,
          },
        });
      }
      console.log("✓ Frame Ratios seeded");
    }

    // 7. Gallery
    const galleryCount = await prisma.galleryItem.count();
    if (galleryCount === 0) {
      for (const item of initialGallery) {
        await prisma.galleryItem.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            title: item.title || "Gallery Photo",
            category: item.category || "Wedding",
            imageUrl: item.imageUrl || item.src,
            aspect: item.aspect || "landscape",
            featured: Boolean(item.featured),
            published: item.published !== false,
            createdAt: item.createdAt || new Date().toISOString().split("T")[0],
          },
        });
      }
      console.log("✓ Gallery items seeded");
    }

    // 8. Portfolio
    const portfolioCount = await prisma.portfolioProject.count();
    if (portfolioCount === 0) {
      for (const item of initialPortfolio) {
        await prisma.portfolioProject.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || "",
            category: item.category,
            coverImage: item.coverImage || item.image || "",
            eventDate: item.eventDate || "",
            location: item.location || "",
            description: item.description || "",
            images: item.images || [],
            featured: Boolean(item.featured),
            published: item.published !== false,
          },
        });
      }
      console.log("✓ Portfolio projects seeded");
    }

    // 9. Films
    const filmCount = await prisma.film.count();
    if (filmCount === 0) {
      for (const item of initialFilms) {
        await prisma.film.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            title: item.title,
            category: item.category || "Wedding Film",
            videoUrl: item.videoUrl || item.youtubeUrl || "",
            duration: item.duration || "Highlight",
            thumbnail: item.thumbnail || item.posterImage || "",
            description: item.description || "",
            featured: Boolean(item.featured),
            published: item.published !== false,
          },
        });
      }
      console.log("✓ Films seeded");
    }

    // 10. Testimonials
    const testimonialCount = await prisma.testimonial.count();
    if (testimonialCount === 0) {
      for (const item of initialTestimonials) {
        await prisma.testimonial.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            customerName: item.customerName || item.name || "Client",
            customerRole: item.customerRole || "Client",
            customerImage: item.customerImage || item.image || "",
            review: item.review || item.quote || "",
            rating: typeof item.rating === "number" ? item.rating : 5,
            eventType: item.eventType || null,
            source: item.source || "manual",
            approved: item.approved !== false,
            featured: Boolean(item.featured),
            hidden: Boolean(item.hidden),
            syncStatus: item.syncStatus || "approved",
            date: item.date || new Date().toISOString().split("T")[0],
          },
        });
      }
      console.log("✓ Testimonials seeded");
    }

    // 11. Website Content
    const contentCount = await prisma.websiteContent.count();
    if (contentCount === 0) {
      for (const [section, data] of Object.entries(initialWebsiteContent)) {
        await prisma.websiteContent.upsert({
          where: { section },
          update: { data },
          create: { section, data },
        });
      }
      console.log("✓ Website Content seeded");
    }

    // 12. Studio Settings
    const settingsCount = await prisma.studioSettings.count();
    if (settingsCount === 0) {
      for (const [section, data] of Object.entries(initialSettings)) {
        await prisma.studioSettings.upsert({
          where: { section },
          update: { data },
          create: { section, data },
        });
      }
      console.log("✓ Studio Settings seeded");
    }

    // 13. Bookings & Enquiries (Initial Demo)
    const bookingCount = await prisma.booking.count();
    if (bookingCount === 0 && Array.isArray(initialBookings)) {
      for (const item of initialBookings) {
        await prisma.booking.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            customerName: item.customerName || item.clientName || "Valued Client",
            clientName: item.clientName || item.customerName || "Valued Client",
            phone: item.phone || "",
            email: item.email || "",
            eventType: item.eventType || "Wedding",
            eventDate: item.eventDate || "",
            location: item.location || "",
            numberOfDays: item.numberOfDays || "1 Day",
            requiredService: item.requiredService || "Wedding Photography",
            photographyRequirement: item.photographyRequirement || null,
            cinematographyRequirement: item.cinematographyRequirement || null,
            budget: item.budget || null,
            branch: item.branch || "Tirunelveli",
            status: "NEW",
            adminNotes: item.adminNotes || null,
            createdAt: item.createdAt || new Date().toISOString().split("T")[0],
          },
        });
      }
    }

    const enquiryCount = await prisma.enquiry.count();
    if (enquiryCount === 0 && Array.isArray(initialEnquiries)) {
      for (const item of initialEnquiries) {
        await prisma.enquiry.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            clientName: item.clientName || item.name || "Client",
            phone: item.phone || "",
            email: item.email || "",
            interestedService: item.interestedService || item.service || "General Inquiry",
            eventDate: item.eventDate || null,
            location: item.location || null,
            message: item.message || item.notes || "",
            status: "NEW",
            receivedDate: item.receivedDate || new Date().toISOString().split("T")[0],
            createdAt: item.createdAt || new Date().toISOString().split("T")[0],
          },
        });
      }
    }

    // 14. Initial Frame Orders (if any)
    const orderCount = await prisma.frameOrder.count();
    if (orderCount === 0 && Array.isArray(initialFrameOrders)) {
      for (const item of initialFrameOrders) {
        await prisma.frameOrder.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            customerName: item.customerName || "Client",
            phone: item.phone || "",
            whatsapp: item.whatsapp || null,
            email: item.email || "",
            deliveryType: item.deliveryType || "Studio Pickup",
            address: item.address || "",
            notes: item.notes || null,
            woodType: item.woodType || "Teak",
            woodPrice: item.woodPrice || 0,
            frameDesign: item.frameDesign || "Classic",
            designPrice: item.designPrice || 0,
            frameRatio: item.frameRatio || "12x18",
            ratioPrice: item.ratioPrice || 0,
            orientation: item.orientation || "portrait",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalAmount: item.totalAmount || 0,
            photoUrl: item.photoUrl || "",
            photoName: item.photoName || "photo.jpg",
            customizationParams: item.customizationParams || {},
            items: item.items || null,
            status: "NEW",
          },
        });
      }
    }
  } catch (err) {
    console.warn("Database seeding note:", err.message);
  }
}
