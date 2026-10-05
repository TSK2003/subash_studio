import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import { useAdminData } from "../admin/context/AdminDataContext";
import defaultReviews from "../data/reviews";

function GoogleGIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ReviewCard({ review }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(review.image) && !imageError;
  const isGoogle = review.source === "google";
  const categoryName = (review.category || review.service || "Featured").toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#EAE4D7] shadow-sm hover:shadow-md hover:border-[#B38F4D]/50 transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Top: 5 Stars & Category Pill */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* 5 Star Rating */}
          <div
            className="flex items-center gap-1 text-[#B38F4D]"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= review.rating
                    ? "fill-[#B38F4D] text-[#B38F4D]"
                    : "text-[#D8D0C2] fill-transparent"
                }
                strokeWidth={1.5}
              />
            ))}
          </div>

          {/* Category Pill */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isGoogle ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#E7E0D2] bg-[#FAF8F5] text-[#6F6A62]">
                <GoogleGIcon className="w-2.5 h-2.5" />
                Google
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#E7E0D2] bg-[#FAF8F5] text-[#8C6D32]">
                {categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Review Quote */}
        <p className="font-serif italic text-[#1C1B19] text-[15px] sm:text-base leading-relaxed break-words mt-5">
          &ldquo;{review.review}&rdquo;
        </p>
      </div>

      {/* Bottom Section: Divider & Customer Info */}
      <div className="mt-6 pt-5 border-t border-[#E7E0D2]/70">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Photo or Initials */}
            {hasImage ? (
              <img
                src={review.image}
                alt={review.name}
                onError={() => setImageError(true)}
                className="w-12 h-12 rounded-full object-cover border border-[#B38F4D]/40 shrink-0 shadow-sm"
                loading="lazy"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full bg-[#FAF0DE] border border-[#B38F4D]/30 flex items-center justify-center text-[#B38F4D] font-display font-bold text-sm shrink-0 shadow-sm"
                aria-hidden="true"
              >
                {getInitials(review.name)}
              </div>
            )}

            {/* Name, Category & Date */}
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-[#1C1B19] text-[15px] sm:text-base leading-snug truncate">
                {review.name}
              </h4>
              <p className="text-[11px] text-[#8C6D32] tracking-wider uppercase font-semibold mt-0.5 truncate">
                {categoryName}
              </p>
              {review.date && (
                <p className="text-[10px] text-[#6F6A62] mt-0.5 truncate">
                  {review.date}
                </p>
              )}
            </div>
          </div>

          {/* Optional Direct Google Review link */}
          {review.googleReviewUrl && (
            <a
              href={review.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-[#6F6A62] hover:text-[#1A73E8] hover:bg-[#FAF0DE] transition-colors shrink-0"
              title="Verified Google Review"
              aria-label="View verified review on Google"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const { testimonials } = useAdminData();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(9);

  // Normalize all available reviews from backend context or fallback dataset
  const allReviews = useMemo(() => {
    if (testimonials && Array.isArray(testimonials) && testimonials.length > 0) {
      const approved = testimonials.filter((t) => t.approved !== false && t.hidden !== true);
      if (approved.length > 0) {
        return approved.map((tst) => ({
          id: tst.id || Math.random().toString(),
          source: tst.source || "manual",
          googleReviewUrl: tst.googleReviewUrl || null,
          name:
            tst.googleReviewerName ||
            tst.customerName ||
            tst.clientName ||
            tst.name ||
            "Valued Client",
          category:
            tst.source === "google"
              ? "Google Review"
              : tst.eventType ||
                tst.customerRole ||
                tst.category ||
                tst.service ||
                "Featured",
          service:
            tst.source === "google"
              ? "Google Review"
              : tst.eventType ||
                tst.customerRole ||
                tst.category ||
                tst.service ||
                "Featured",
          rating:
            typeof tst.rating === "number"
              ? Math.max(1, Math.min(5, Math.round(tst.rating)))
              : 5,
          review: tst.review || tst.quote || tst.content || "",
          image:
            tst.googleReviewerPhoto ||
            tst.customerImage ||
            tst.image ||
            tst.avatar ||
            "",
          date: tst.date || "",
          featured: Boolean(tst.featured),
        }));
      }
    }
    return defaultReviews;
  }, [testimonials]);

  // Extract available distinct categories from active reviews
  const categories = useMemo(() => {
    const rawCategories = allReviews
      .map((r) => (r.category || r.service || "").trim().toUpperCase())
      .filter((c) => Boolean(c) && c !== "GOOGLE REVIEW");
    const unique = Array.from(new Set(rawCategories));
    return ["ALL", ...unique];
  }, [allReviews]);

  // Filter reviews by selected category pill
  const filteredReviews = useMemo(() => {
    if (activeCategory === "ALL") {
      return allReviews;
    }
    return allReviews.filter((r) => {
      const cat = (r.category || r.service || "").trim().toUpperCase();
      return cat === activeCategory;
    });
  }, [allReviews, activeCategory]);

  // Reset pagination count on category filter switch
  const handleCategorySelect = useCallback((category) => {
    setActiveCategory(category);
    setVisibleCount(9);
  }, []);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <>
      <Seo
        title="Client Reviews & Testimonials | SUBASH STUDIO"
        description="Read kind words, stories, and genuine emotions from families, couples, and clients of SUBASH STUDIO."
      />

      <div className="bg-transparent min-h-screen pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          
          {/* =========================================================
              PAGE HEADER
          ========================================================= */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Reveal>
              <p className="text-xs tracking-[0.25em] font-semibold text-[#B38F4D] uppercase mb-3">
                WHAT OUR CLIENTS SAY
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-[#1C1B19] leading-tight tracking-tight">
                Kind Words &amp; Keepsakes
              </h1>
            </Reveal>

            {/* Minimal Gold Diamond Ornament */}
            <Reveal delay={0.12}>
              <div className="flex items-center justify-center gap-3 my-4 text-[#B38F4D]">
                <span className="w-10 sm:w-14 h-[1px] bg-[#B38F4D]/40" />
                <span className="text-[10px] tracking-widest">◆</span>
                <span className="w-10 sm:w-14 h-[1px] bg-[#B38F4D]/40" />
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="text-sm sm:text-base text-[#6F6A62] leading-relaxed max-w-xl mx-auto">
                Real stories. Genuine emotions. Lasting relationships.
              </p>
            </Reveal>
          </div>

          {/* =========================================================
              CATEGORY FILTERS (Simple, Elegant Pill Navigation)
          ========================================================= */}
          {categories.length > 2 && (
            <Reveal delay={0.2}>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap mb-12 sm:mb-14">
                {categories.map((category) => {
                  const isSelected = activeCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold tracking-[0.14em] uppercase transition-all duration-300 border ${
                        isSelected
                          ? "bg-[#1C1B19] text-[#FAF7F2] border-[#1C1B19] shadow-sm scale-[1.02]"
                          : "border-[#E7E0D2] bg-white/70 text-[#6F6A62] hover:border-[#B38F4D]/60 hover:text-[#B38F4D] hover:bg-white"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </Reveal>
          )}

          {/* =========================================================
              REVIEWS GRID (3 col Desktop, 2 col Tablet, 1 col Mobile)
          ========================================================= */}
          {visibleReviews.length === 0 ? (
            <Reveal delay={0.24}>
              <div className="max-w-md mx-auto text-center p-10 bg-white/80 rounded-2xl border border-[#EAE4D7] shadow-sm my-12">
                <p className="font-display font-medium text-xl text-[#1C1B19]">
                  No reviews found for this category
                </p>
                <p className="text-sm text-[#6F6A62] mt-2">
                  Please select another category to view client stories.
                </p>
                <button
                  onClick={() => handleCategorySelect("ALL")}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#1C1B19] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#B38F4D] transition-colors"
                >
                  View All Reviews
                </button>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              <AnimatePresence mode="popLayout">
                {visibleReviews.map((review, idx) => (
                  <motion.div
                    key={review.id || idx}
                    layout
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min((idx % 9) * 0.05, 0.3),
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    className="h-full flex flex-col"
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* =========================================================
              LOAD MORE BUTTON
          ========================================================= */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center mt-12 sm:mt-16">
              <button
                onClick={handleLoadMore}
                className="group px-8 sm:px-10 h-[50px] sm:h-[54px] bg-[#FAF7F2] hover:bg-[#1C1B19] border border-[#B38F4D]/70 hover:border-[#1C1B19] text-[#1C1B19] hover:text-[#FAF7F2] rounded-full text-xs font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2.5"
              >
                <span>LOAD MORE REVIEWS</span>
                <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </button>
              <p className="text-[11px] text-[#8C8275] tracking-wider uppercase mt-3 font-medium">
                Showing {visibleReviews.length} of {filteredReviews.length} reviews
              </p>
            </div>
          )}

          {/* =========================================================
              EDITORIAL CALL TO ACTION BANNER (Consistent Brand Touch)
          ========================================================= */}
          <div className="mt-20 sm:mt-24 pt-16 border-t border-[#E7E0D2]/70 text-center max-w-2xl mx-auto">
            <h3 className="font-display font-medium text-2xl sm:text-3xl text-[#1C1B19]">
              Ready to create your own keepsake?
            </h3>
            <p className="mt-2 text-sm text-[#6F6A62]">
              Let us preserve your special day with authentic emotion and timeless artistry.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 h-[50px] bg-[#B38F4D] hover:bg-[#9C7B3D] text-white rounded-full text-xs font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(179,143,77,0.38)] hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <span>BOOK A SHOOT</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/gallery"
                className="w-full sm:w-auto px-8 h-[50px] bg-white hover:bg-[#1C1B19] border border-[#E7E0D2] hover:border-[#1C1B19] text-[#1C1B19] hover:text-white rounded-full text-xs font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center"
              >
                <span>EXPLORE GALLERY</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
