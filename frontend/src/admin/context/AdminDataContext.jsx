import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../lib/api.js";

const AdminDataContext = createContext(null);

// Safe normalizers for client-side display consistency
export function normalizeBooking(booking = {}) {
  if (!booking) return booking;
  return {
    ...booking,
    id: booking.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: booking.customerName || booking.clientName || "Valued Client",
    clientName: booking.clientName || booking.customerName || "Valued Client",
    phone: booking.phone || "",
    email: booking.email || "",
    eventType: booking.eventType || "Wedding",
    eventDate: booking.eventDate || booking.date || "",
    location: booking.location || booking.venue || "",
    numberOfDays: booking.numberOfDays || "1 Day",
    requiredService: booking.requiredService || booking.service || "Wedding Photography",
    photographyRequirement: booking.photographyRequirement || "",
    cinematographyRequirement: booking.cinematographyRequirement || "",
    budget: booking.budget || "",
    branch: booking.branch || "Tirunelveli",
    status: booking.status || "NEW",
    adminNotes: booking.adminNotes || booking.notes || "",
    createdAt: booking.createdAt || new Date().toISOString().split("T")[0],
  };
}

export function normalizeEnquiry(enquiry = {}) {
  if (!enquiry) return enquiry;
  const clientName = (enquiry.clientName || enquiry.name || "").trim();
  const phone = (enquiry.phone || "").trim();
  const email = (enquiry.email || "").trim();
  const service = enquiry.interestedService || enquiry.service || "General Inquiry";
  const eventDate = enquiry.proposedDate || enquiry.eventDate || enquiry.date || "";
  const location = enquiry.location || enquiry.venue || "";
  const message = (enquiry.message || enquiry.notes || enquiry.clientMessage || "").trim();
  const status = enquiry.status || "NEW";

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const createdAt = enquiry.createdAt || dateStr;
  const receivedDate = enquiry.receivedDate || `${createdAt} ${timeStr}`;

  return {
    ...enquiry,
    id: enquiry.id || `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
    name: clientName,
    clientName,
    phone,
    email,
    interestedService: service,
    service,
    eventDate,
    proposedDate: eventDate,
    location,
    venue: location,
    message,
    notes: message,
    clientMessage: message,
    status,
    createdAt,
    receivedDate,
  };
}

export function normalizeGalleryItem(item = {}) {
  if (!item) return item;
  const src = item.src || item.imageUrl || "";
  const imageUrl = item.imageUrl || item.src || "";
  const title = item.title || item.caption || "Subash Studio Gallery";
  const caption = item.caption || item.title || title;
  return {
    ...item,
    id: item.id || `GAL-${Math.floor(100 + Math.random() * 900)}`,
    src,
    imageUrl,
    title,
    caption,
    category: item.category || "Wedding",
    aspect: item.aspect || "landscape",
    published: item.published !== false,
    featured: Boolean(item.featured),
    createdAt: item.createdAt || new Date().toISOString().split("T")[0],
  };
}

export function normalizePortfolioItem(item = {}) {
  if (!item) return item;
  const coverImage = item.coverImage || item.image || item.imageUrl || "";
  const image = item.image || item.coverImage || item.imageUrl || "";
  const imageUrl = item.imageUrl || item.coverImage || item.image || "";
  const title = item.title || item.client || item.category || "Subash Studio Story";
  const subtitle = item.subtitle || item.client || "";
  const description = item.description || item.excerpt || "";
  const excerpt = item.excerpt || item.description || "";
  return {
    ...item,
    id: item.id || `PORT-${Math.floor(100 + Math.random() * 900)}`,
    title,
    subtitle,
    category: item.category || "Wedding",
    coverImage,
    image,
    imageUrl,
    eventDate: item.eventDate || "",
    location: item.location || "",
    description,
    excerpt,
    featured: item.featured ?? false,
    published: item.published !== false,
  };
}

export function normalizeService(srv = {}) {
  if (!srv) return srv;
  const name = srv.name || srv.title || "Subash Studio Service";
  const title = srv.title || srv.name || name;
  const slug = srv.slug || name.toLowerCase().replace(/\s+/g, "-");
  const image = srv.image || srv.imageUrl || "/images/services/wedding-photography.jpg";
  const imageUrl = srv.imageUrl || srv.image || image;
  const shortDesc = srv.shortDesc || srv.blurb || srv.description || "";
  const blurb = srv.blurb || srv.shortDesc || srv.description || "";
  const fullDesc = srv.fullDesc || srv.description || srv.shortDesc || "";
  const description = srv.description || srv.fullDesc || srv.shortDesc || "";
  return {
    ...srv,
    id: srv.id || `SRV-${Math.floor(100 + Math.random() * 900)}`,
    name,
    title,
    slug,
    image,
    imageUrl,
    shortDesc,
    blurb,
    fullDesc,
    description,
    startingPrice: srv.startingPrice || srv.price || "₹50,000",
    features: Array.isArray(srv.features) ? srv.features : [],
    status: srv.status || "Active",
  };
}

export function normalizeFilm(film = {}) {
  if (!film) return film;
  const title = film.title || "Subash Studio Film";
  const category = film.category || film.type || "Wedding Film";
  const type = film.type || film.category || "Wedding Film";
  const videoUrl = film.videoUrl || film.youtubeUrl || "";
  const youtubeUrl = film.youtubeUrl || film.videoUrl || "";
  const thumbnail = film.thumbnail || film.posterImage || film.poster || film.image || "";
  const posterImage = film.posterImage || film.thumbnail || film.poster || film.image || "";
  const poster = film.poster || film.thumbnail || film.posterImage || film.image || "";
  return {
    ...film,
    id: film.id || `FLM-${Math.floor(100 + Math.random() * 900)}`,
    title,
    category,
    type,
    videoUrl,
    youtubeUrl,
    duration: film.duration || "Highlight",
    thumbnail,
    posterImage,
    poster,
    description: film.description || "",
    featured: film.featured ?? false,
    published: film.published !== false,
  };
}

export function normalizeBranch(branch = {}) {
  if (!branch) return branch;
  const city = branch.city || branch.name || "Studio Branch";
  const name = branch.name || `${city} Studio`;
  return {
    ...branch,
    id: branch.id || `BR-${Math.floor(100 + Math.random() * 900)}`,
    name,
    city,
    tag: branch.tag || "Studio & Consultation Lounge",
    address: branch.address || "",
    phone: branch.phone || "+91 93457 06609",
    whatsapp: branch.whatsapp || branch.phone || "+91 93457 06609",
    email: branch.email || "subashstudio009@gmail.com",
    mapsUrl: branch.mapsUrl || "",
    embedUrl: branch.embedUrl || "",
    hours: branch.hours || "Mon – Sun, 08:00 AM – 09:00 PM",
    image: branch.image || "/images/gallery/branches/kalladaikurichi.jpg",
    manager: branch.manager || "",
    active: branch.active !== false,
  };
}

export function normalizeTestimonial(tst = {}) {
  if (!tst) return tst;
  const customerName = tst.customerName || tst.clientName || tst.name || tst.googleReviewerName || "Valued Client";
  const name = tst.name || customerName;
  const customerRole = tst.customerRole || tst.eventType || tst.category || tst.service || "Client";
  const customerImage = tst.customerImage || tst.image || tst.avatar || "";
  const review = tst.review || tst.quote || tst.content || "";
  const rating = typeof tst.rating === "number" ? Math.max(1, Math.min(5, Math.round(tst.rating))) : 5;
  return {
    ...tst,
    id: tst.id || `TST-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    name,
    customerRole,
    customerImage,
    review,
    rating,
    source: tst.source || "manual",
    approved: tst.approved !== false,
    featured: Boolean(tst.featured),
    hidden: Boolean(tst.hidden),
    syncStatus: tst.syncStatus || (tst.source === "google" ? "imported" : "approved"),
    date: tst.date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  };
}

export function AdminDataProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [services, setServices] = useState([]);
  const [films, setFilms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [googleReviewsMeta, setGoogleReviewsMeta] = useState({
    lastSynced: null,
    totalGoogleReviews: 0,
    accountName: "Subash Studio",
  });
  const [websiteContent, setWebsiteContent] = useState({});
  const [settings, setSettings] = useState({});
  const [frameWoodTypes, setFrameWoodTypes] = useState([]);
  const [frameDesigns, setFrameDesigns] = useState([]);
  const [frameRatios, setFrameRatios] = useState([]);
  const [frameOrders, setFrameOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean obsolete localStorage database keys
  useEffect(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("subash_studio_db_v4_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        bks,
        enqs,
        gal,
        port,
        srv,
        flm,
        br,
        tst,
        gMeta,
        cnt,
        stg,
        woods,
        designs,
        ratios,
        orders,
      ] = await Promise.allSettled([
        api.get("/api/bookings"),
        api.get("/api/enquiries"),
        api.get("/api/gallery?all=true"),
        api.get("/api/portfolio?all=true"),
        api.get("/api/services"),
        api.get("/api/films?all=true"),
        api.get("/api/branches?all=true"),
        api.get("/api/testimonials?admin=true"),
        api.get("/api/testimonials/google-meta"),
        api.get("/api/content"),
        api.get("/api/settings"),
        api.get("/api/frames/wood-types?all=true"),
        api.get("/api/frames/designs?all=true"),
        api.get("/api/frames/ratios?all=true"),
        api.get("/api/frames/orders"),
      ]);

      if (bks.status === "fulfilled" && Array.isArray(bks.value)) {
        setBookings(bks.value.map(normalizeBooking));
      }
      if (enqs.status === "fulfilled" && Array.isArray(enqs.value)) {
        setEnquiries(enqs.value.map(normalizeEnquiry));
      }
      if (gal.status === "fulfilled" && Array.isArray(gal.value)) {
        setGallery(gal.value.map(normalizeGalleryItem));
      }
      if (port.status === "fulfilled" && Array.isArray(port.value)) {
        setPortfolio(port.value.map(normalizePortfolioItem));
      }
      if (srv.status === "fulfilled" && Array.isArray(srv.value)) {
        setServices(srv.value.map(normalizeService));
      }
      if (flm.status === "fulfilled" && Array.isArray(flm.value)) {
        setFilms(flm.value.map(normalizeFilm));
      }
      if (br.status === "fulfilled" && Array.isArray(br.value)) {
        setBranches(br.value.map(normalizeBranch));
      }
      if (tst.status === "fulfilled" && Array.isArray(tst.value)) {
        setTestimonials(tst.value.map(normalizeTestimonial));
      }
      if (gMeta.status === "fulfilled" && gMeta.value) {
        setGoogleReviewsMeta(gMeta.value);
      }
      if (cnt.status === "fulfilled" && cnt.value) {
        setWebsiteContent(cnt.value);
      }
      if (stg.status === "fulfilled" && stg.value) {
        setSettings(stg.value);
      }
      if (woods.status === "fulfilled" && Array.isArray(woods.value)) {
        setFrameWoodTypes(woods.value);
      }
      if (designs.status === "fulfilled" && Array.isArray(designs.value)) {
        setFrameDesigns(designs.value);
      }
      if (ratios.status === "fulfilled" && Array.isArray(ratios.value)) {
        setFrameRatios(ratios.value);
      }
      if (orders.status === "fulfilled" && Array.isArray(orders.value)) {
        setFrameOrders(orders.value);
      }
    } catch (err) {
      console.error("Failed to load initial studio data from backend API:", err);
      setError("Failed to communicate with backend server. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 1. Bookings
  const addBooking = useCallback(async (booking) => {
    const created = await api.post("/api/bookings", booking);
    const normalized = normalizeBooking(created);
    setBookings((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateBooking = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/bookings/${id}`, updatedFields);
    const normalized = normalizeBooking(updated);
    setBookings((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteBooking = useCallback(async (id) => {
    await api.delete(`/api/bookings/${id}`);
    setBookings((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 2. Enquiries
  const addEnquiry = useCallback(async (enquiry) => {
    const created = await api.post("/api/enquiries", enquiry);
    const normalized = normalizeEnquiry(created);
    setEnquiries((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateEnquiry = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/enquiries/${id}`, updatedFields);
    const normalized = normalizeEnquiry(updated);
    setEnquiries((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const updateEnquiryStatus = useCallback(async (id, status) => {
    const updated = await api.patch(`/api/enquiries/${id}`, { status });
    const normalized = normalizeEnquiry(updated);
    setEnquiries((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteEnquiry = useCallback(async (id) => {
    await api.delete(`/api/enquiries/${id}`);
    setEnquiries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 3. Gallery
  const addGalleryImage = useCallback(async (image) => {
    const created = await api.post("/api/gallery", image);
    const normalized = normalizeGalleryItem(created);
    setGallery((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateGalleryImage = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/gallery/${id}`, updatedFields);
    const normalized = normalizeGalleryItem(updated);
    setGallery((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteGalleryImage = useCallback(async (id) => {
    await api.delete(`/api/gallery/${id}`);
    setGallery((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleGalleryFeatured = useCallback(async (id) => {
    const updated = await api.patch(`/api/gallery/${id}/toggle-featured`);
    const normalized = normalizeGalleryItem(updated);
    setGallery((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  const toggleGalleryPublished = useCallback(async (id) => {
    const updated = await api.patch(`/api/gallery/${id}/toggle-published`);
    const normalized = normalizeGalleryItem(updated);
    setGallery((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  // 4. Portfolio
  const addPortfolio = useCallback(async (item) => {
    const created = await api.post("/api/portfolio", item);
    const normalized = normalizePortfolioItem(created);
    setPortfolio((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updatePortfolio = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/portfolio/${id}`, updatedFields);
    const normalized = normalizePortfolioItem(updated);
    setPortfolio((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deletePortfolio = useCallback(async (id) => {
    await api.delete(`/api/portfolio/${id}`);
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const togglePortfolioFeatured = useCallback(async (id) => {
    const updated = await api.patch(`/api/portfolio/${id}/toggle-featured`);
    const normalized = normalizePortfolioItem(updated);
    setPortfolio((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  // 5. Services
  const addService = useCallback(async (srv) => {
    const created = await api.post("/api/services", srv);
    const normalized = normalizeService(created);
    setServices((prev) => [...prev, normalized]);
    return normalized;
  }, []);

  const updateService = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/services/${id}`, updatedFields);
    const normalized = normalizeService(updated);
    setServices((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteService = useCallback(async (id) => {
    await api.delete(`/api/services/${id}`);
    setServices((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleServiceStatus = useCallback(async (id) => {
    const updated = await api.patch(`/api/services/${id}/toggle-status`);
    const normalized = normalizeService(updated);
    setServices((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  // 6. Films
  const addFilm = useCallback(async (film) => {
    const created = await api.post("/api/films", film);
    const normalized = normalizeFilm(created);
    setFilms((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateFilm = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/films/${id}`, updatedFields);
    const normalized = normalizeFilm(updated);
    setFilms((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteFilm = useCallback(async (id) => {
    await api.delete(`/api/films/${id}`);
    setFilms((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleFilmFeatured = useCallback(async (id) => {
    const updated = await api.patch(`/api/films/${id}/toggle-featured`);
    const normalized = normalizeFilm(updated);
    setFilms((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  const toggleFilmPublished = useCallback(async (id) => {
    const updated = await api.patch(`/api/films/${id}/toggle-published`);
    const normalized = normalizeFilm(updated);
    setFilms((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  // 7. Branches
  const addBranch = useCallback(async (branch) => {
    const created = await api.post("/api/branches", branch);
    const normalized = normalizeBranch(created);
    setBranches((prev) => [...prev, normalized]);
    return normalized;
  }, []);

  const updateBranch = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/branches/${id}`, updatedFields);
    const normalized = normalizeBranch(updated);
    setBranches((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteBranch = useCallback(async (id) => {
    await api.delete(`/api/branches/${id}`);
    setBranches((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleBranchStatus = useCallback(async (id) => {
    const updated = await api.patch(`/api/branches/${id}/toggle-status`);
    const normalized = normalizeBranch(updated);
    setBranches((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  // 8. Testimonials
  const addTestimonial = useCallback(async (tst) => {
    const created = await api.post("/api/testimonials", tst);
    const normalized = normalizeTestimonial(created);
    setTestimonials((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateTestimonial = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/testimonials/${id}`, updatedFields);
    const normalized = normalizeTestimonial(updated);
    setTestimonials((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  }, []);

  const deleteTestimonial = useCallback(async (id) => {
    await api.delete(`/api/testimonials/${id}`);
    setTestimonials((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleTestimonialApproved = useCallback(async (id) => {
    const updated = await api.patch(`/api/testimonials/${id}/toggle-approved`);
    const normalized = normalizeTestimonial(updated);
    setTestimonials((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  const toggleTestimonialFeatured = useCallback(async (id) => {
    const updated = await api.patch(`/api/testimonials/${id}/toggle-featured`);
    const normalized = normalizeTestimonial(updated);
    setTestimonials((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  const toggleTestimonialHidden = useCallback(async (id) => {
    const updated = await api.patch(`/api/testimonials/${id}/toggle-hidden`);
    const normalized = normalizeTestimonial(updated);
    setTestimonials((prev) => prev.map((item) => (item.id === id ? normalized : item)));
  }, []);

  const syncGoogleReviews = useCallback(async (fetchedReviews = []) => {
    const res = await api.post("/api/testimonials/sync-google", { reviews: fetchedReviews });
    // Refresh testimonials from server
    const all = await api.get("/api/testimonials?admin=true");
    setTestimonials(all.map(normalizeTestimonial));
    const meta = await api.get("/api/testimonials/google-meta");
    setGoogleReviewsMeta(meta);
    return res;
  }, []);

  // 9. Website Content
  const updateWebsiteContent = useCallback(async (section, updatedFields) => {
    const updated = await api.put(`/api/content/${section}`, updatedFields);
    setWebsiteContent((prev) => ({
      ...prev,
      [section]: updated,
    }));
  }, []);

  // 10. Settings
  const updateSettings = useCallback(async (section, updatedFields) => {
    const updated = await api.put(`/api/settings/${section}`, updatedFields);
    setSettings((prev) => ({
      ...prev,
      [section]: updated,
    }));
  }, []);

  // 11. Frame Wood Types
  const addFrameWoodType = useCallback(async (wood) => {
    const created = await api.post("/api/frames/wood-types", wood);
    setFrameWoodTypes((prev) => [...prev, created]);
    return created;
  }, []);

  const updateFrameWoodType = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/frames/wood-types/${id}`, updatedFields);
    setFrameWoodTypes((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteFrameWoodType = useCallback(async (id) => {
    await api.delete(`/api/frames/wood-types/${id}`);
    setFrameWoodTypes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleFrameWoodTypeStatus = useCallback(async (id) => {
    const updated = await api.patch(`/api/frames/wood-types/${id}/toggle-status`);
    setFrameWoodTypes((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }, []);

  // 12. Frame Designs
  const addFrameDesign = useCallback(async (design) => {
    const created = await api.post("/api/frames/designs", design);
    setFrameDesigns((prev) => [...prev, created]);
    return created;
  }, []);

  const updateFrameDesign = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/frames/designs/${id}`, updatedFields);
    setFrameDesigns((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteFrameDesign = useCallback(async (id) => {
    await api.delete(`/api/frames/designs/${id}`);
    setFrameDesigns((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleFrameDesignStatus = useCallback(async (id) => {
    const updated = await api.patch(`/api/frames/designs/${id}/toggle-status`);
    setFrameDesigns((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }, []);

  // 13. Frame Ratios
  const addFrameRatio = useCallback(async (ratio) => {
    const created = await api.post("/api/frames/ratios", ratio);
    setFrameRatios((prev) => [...prev, created]);
    return created;
  }, []);

  const updateFrameRatio = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/frames/ratios/${id}`, updatedFields);
    setFrameRatios((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteFrameRatio = useCallback(async (id) => {
    await api.delete(`/api/frames/ratios/${id}`);
    setFrameRatios((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleFrameRatioStatus = useCallback(async (id) => {
    const updated = await api.patch(`/api/frames/ratios/${id}/toggle-status`);
    setFrameRatios((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }, []);

  // 14. Frame Orders
  const addFrameOrder = useCallback(async (order) => {
    const created = await api.post("/api/frames/orders", order);
    setFrameOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateFrameOrderStatus = useCallback(async (id, status) => {
    const updated = await api.patch(`/api/frames/orders/${id}/status`, { status });
    setFrameOrders((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const updateFrameOrder = useCallback(async (id, updatedFields) => {
    const updated = await api.put(`/api/frames/orders/${id}`, updatedFields);
    setFrameOrders((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteFrameOrder = useCallback(async (id) => {
    await api.delete(`/api/frames/orders/${id}`);
    setFrameOrders((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetAllDemoData = useCallback(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AdminDataContext.Provider
      value={{
        loading,
        error,
        refreshData,

        // Bookings
        bookings,
        addBooking,
        updateBooking,
        deleteBooking,

        // Enquiries
        enquiries,
        addEnquiry,
        updateEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,

        // Gallery
        gallery,
        addGalleryImage,
        addGalleryItem: addGalleryImage,
        updateGalleryImage,
        updateGalleryItem: updateGalleryImage,
        deleteGalleryImage,
        deleteGalleryItem: deleteGalleryImage,
        toggleGalleryFeatured,
        toggleGalleryPublished,

        // Portfolio
        portfolio,
        addPortfolio,
        addPortfolioItem: addPortfolio,
        updatePortfolio,
        updatePortfolioItem: updatePortfolio,
        deletePortfolio,
        deletePortfolioItem: deletePortfolio,
        togglePortfolioFeatured,

        // Services
        services,
        addService,
        updateService,
        deleteService,
        toggleServiceStatus,

        // Films
        films,
        addFilm,
        updateFilm,
        deleteFilm,
        toggleFilmFeatured,
        toggleFilmPublished,

        // Branches
        branches,
        addBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,

        // Testimonials
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        toggleTestimonialApproved,
        toggleTestimonialFeatured,
        toggleTestimonialHidden,
        syncGoogleReviews,
        googleReviewsMeta,
        setGoogleReviewsMeta,

        // Website Content
        websiteContent,
        updateWebsiteContent,

        // Settings
        settings,
        updateSettings,

        // Frame Wood Types
        frameWoodTypes,
        addFrameWoodType,
        updateFrameWoodType,
        deleteFrameWoodType,
        toggleFrameWoodTypeStatus,

        // Frame Designs
        frameDesigns,
        addFrameDesign,
        updateFrameDesign,
        deleteFrameDesign,
        toggleFrameDesignStatus,

        // Frame Ratios
        frameRatios,
        addFrameRatio,
        updateFrameRatio,
        deleteFrameRatio,
        toggleFrameRatioStatus,

        // Frame Orders
        frameOrders,
        addFrameOrder,
        updateFrameOrderStatus,
        updateFrameOrder,
        deleteFrameOrder,

        resetAllDemoData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}
