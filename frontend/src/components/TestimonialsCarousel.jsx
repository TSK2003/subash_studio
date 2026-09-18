import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import Reveal from "./Reveal";
import { useAdminData } from "../admin/context/AdminDataContext";

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

function TestimonialCard({ card }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = card.image && !imageError;
  const isGoogle = card.source === "google";

  return (
    <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#EAE4D7] shadow-sm hover:shadow-md hover:border-[#B38F4D]/50 transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Top section: Stars & Category Pill */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* 5 Star Rating */}
          <div
            className="flex items-center gap-1 text-[#B38F4D]"
            aria-label={`${card.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= card.rating
                    ? "fill-[#B38F4D] text-[#B38F4D]"
                    : "text-[#D8D0C2] fill-transparent"
                }
                strokeWidth={1.5}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {isGoogle ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#E7E0D2] bg-[#FAF8F5] text-[#6F6A62]">
                <GoogleGIcon className="w-2.5 h-2.5" />
                Google
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#E7E0D2] bg-[#FAF8F5] text-[#8C6D32]">
                {card.service || "Featured"}
              </span>
            )}
          </div>
        </div>

        {/* Testimonial Quote */}
        <p className="font-serif italic text-[#1C1B19] text-[15px] sm:text-base leading-relaxed break-words mt-4">
          &ldquo;{card.review}&rdquo;
        </p>
      </div>

      {/* Bottom section: Divider & Client Info */}
      <div className="mt-6 pt-5 border-t border-[#E7E0D2]/70">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            {hasImage ? (
              <img
                src={card.image}
                alt={card.name}
                onError={() => setImageError(true)}
                className="w-12 h-12 rounded-full object-cover border border-[#B38F4D]/40 shrink-0 shadow-sm"
                loading="lazy"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full bg-[#FAF0DE] border border-[#B38F4D]/30 flex items-center justify-center text-[#B38F4D] font-display font-bold text-sm shrink-0 shadow-sm"
                aria-hidden="true"
              >
                {getInitials(card.name)}
              </div>
            )}

            {/* Name, Category & Date */}
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-[#1C1B19] text-[15px] sm:text-base leading-snug truncate">
                {card.name}
              </h4>
              <p className="text-[11px] text-[#8C6D32] tracking-wider uppercase font-semibold mt-0.5 truncate">
                {card.service}
              </p>
              {card.date && (
                <p className="text-[10px] text-[#6F6A62] mt-0.5 truncate">
                  {card.date}
                </p>
              )}
            </div>
          </div>

          {/* Optional Direct Google Review link */}
          {card.googleReviewUrl && (
            <a
              href={card.googleReviewUrl}
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

export default function TestimonialsCarousel() {
  const { testimonials } = useAdminData();
  const prefersReducedMotion = useReducedMotion();

  // Responsive items visible per slide
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter approved testimonials (and not hidden) & prioritize featured items
  const sortedTestimonials = useMemo(() => {
    if (!testimonials || !Array.isArray(testimonials)) return [];
    const approved = testimonials.filter((t) => t.approved === true && t.hidden !== true);
    return [...approved].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [testimonials]);

  // Normalized items supporting both manual testimonials and approved Google reviews
  const normalizedTestimonials = useMemo(() => {
    return sortedTestimonials.map((tst) => ({
      id: tst.id || Math.random().toString(),
      source: tst.source || "manual",
      googleReviewUrl: tst.googleReviewUrl || null,
      name:
        tst.googleReviewerName ||
        tst.customerName ||
        tst.clientName ||
        tst.name ||
        "Valued Client",
      service:
        tst.source === "google"
          ? "Google Review"
          : tst.eventType ||
            tst.customerRole ||
            tst.category ||
            tst.service ||
            "Client",
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
      approved: Boolean(tst.approved),
    }));
  }, [sortedTestimonials]);

  const totalItems = normalizedTestimonials.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Bounds safety when testimonials change
  useEffect(() => {
    if (totalItems > 0 && currentIndex >= totalItems) {
      setCurrentIndex(0);
    }
  }, [totalItems, currentIndex]);

  const handleNext = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const handlePrev = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const handleDotClick = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay (every 5.5s) with pause on desktop hover & reduced motion check
  useEffect(() => {
    if (isHovered || prefersReducedMotion || totalItems <= 1) {
      return;
    }
    const timer = setInterval(() => {
      handleNext();
    }, 5500);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, prefersReducedMotion, totalItems, handleNext]);

  // Touch / swipe handling on mobile without preventing vertical page scroll
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Compute currently visible cards
  const visibleCards = useMemo(() => {
    if (totalItems === 0) return [];
    const count = Math.min(itemsPerPage, totalItems);
    const result = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % totalItems;
      result.push({
        ...normalizedTestimonials[idx],
        uniqueKey: `${normalizedTestimonials[idx].id}-${i}`,
      });
    }
    return result;
  }, [normalizedTestimonials, currentIndex, itemsPerPage, totalItems]);

  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir > 0 ? -30 : 30,
    }),
  };

  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-24 bg-transparent overflow-hidden border-b border-[#E7E0D2]/70"
      aria-label="Client Testimonials"
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-xs tracking-[0.25em] font-semibold text-[#B38F4D] uppercase mb-2">
                WHAT OUR CLIENTS SAY
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-[#1C1B19] leading-tight">
                Kind Words &amp; Keepsakes
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-2 text-sm text-[#6F6A62] leading-relaxed">
                Real stories. Genuine emotions. Lasting relationships.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="self-start md:self-end">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#1C1B19] hover:text-[#B38F4D] transition-colors whitespace-nowrap"
            >
              <span>VIEW ALL REVIEWS</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        {/* Carousel or Empty State with Scroll-Triggered Reveal */}
        {totalItems === 0 ? (
          <Reveal delay={0.28}>
            <div className="max-w-md mx-auto text-center p-8 sm:p-10 bg-card rounded-xl border border-line/70 shadow-card">
              <p className="font-display text-xl text-ink">
                Client stories coming soon.
              </p>
              <p className="text-ink-soft text-sm mt-2">
                We are currently preparing new testimonials and reviews from
                recent celebrations.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.28}>
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: "pan-y" }}
            >
              {/* Cards Container with smooth slide/fade animation */}
              <div className="overflow-hidden min-h-[340px] flex items-stretch">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={`${currentIndex}-${itemsPerPage}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: prefersReducedMotion ? 0.1 : 0.45,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    className={`grid w-full gap-6 items-stretch ${
                      itemsPerPage === 1
                        ? "grid-cols-1"
                        : itemsPerPage === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {visibleCards.map((card) => (
                      <div key={card.uniqueKey} className="w-full flex flex-col">
                        <TestimonialCard card={card} />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Centered Pagination Dots (Active: Champagne Gold, Inactive: Muted) */}
              {totalItems > 1 && (
                <div
                  className="mt-10 sm:mt-12 flex items-center justify-center gap-2.5"
                  role="tablist"
                  aria-label="Testimonial navigation"
                >
                  {normalizedTestimonials.map((t, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={t.id || idx}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Go to testimonial ${idx + 1}`}
                        onClick={() => handleDotClick(idx)}
                        className={`transition-all duration-300 focus:outline-none rounded-full ${
                          isActive
                            ? "w-8 h-2.5 bg-gold shadow-sm"
                            : "w-2.5 h-2.5 bg-line hover:bg-gold/50"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
