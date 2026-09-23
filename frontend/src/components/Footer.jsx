import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import { MapPin, Phone, Mail, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Logomark from "./Logomark";
import { useAdminData } from "../admin/context/AdminDataContext";

function BranchCard({ branch }) {
  const branchName = (branch.name || `${branch.city || "Studio"} Branch`).toUpperCase();

  return (
    <div className="flex flex-col justify-between h-full bg-white/[0.02] hover:bg-white/[0.04] p-4 sm:p-5 rounded-xl border border-white/5 hover:border-[#C9A669]/30 transition-all duration-300 group">
      <div className="space-y-3">
        {/* Branch Title */}
        <h5
          className="text-xs uppercase font-semibold tracking-[0.16em] text-[#C9A669] leading-snug truncate"
          title={branchName}
        >
          {branchName}
        </h5>

        {/* Subtitle / Tag Pill */}
        <div className="min-h-[22px] flex items-center">
          {branch.tag ? (
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#C9A669]/15 text-[#C9A669] border border-[#C9A669]/30">
              {branch.tag}
            </span>
          ) : null}
        </div>

        {/* Physical Address */}
        {branch.address && (
          <div className="flex items-start gap-2 pt-1 text-xs text-[#FAF8F5]/75 leading-relaxed">
            <MapPin size={14} className="text-[#C9A669] shrink-0 mt-0.5" />
            <span className="break-words line-clamp-3">{branch.address}</span>
          </div>
        )}

        {/* Studio Hours */}
        {branch.hours && (
          <p className="text-xs text-[#FAF8F5]/60 pl-5">{branch.hours}</p>
        )}
      </div>

      {/* View on Map CTA aligned at bottom edge */}
      {branch.mapsUrl ? (
        <div className="pt-3 pl-5 mt-auto">
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A669] hover:text-[#FAF8F5] transition-colors font-medium"
          >
            <span>View on Map</span>
            <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className="mt-auto" />
      )}
    </div>
  );
}

export default function Footer() {
  const { branches, loading, error, websiteContent } = useAdminData();
  const contactData = websiteContent?.contact || {};
  const primaryPhone = contactData.phone || "+91 93457 06609";
  const phoneHref = "tel:" + primaryPhone.replace(/[^\d+]/g, "");
  const studioEmail = contactData.email || "hello@subashstudio.com";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http") ? whatsappRaw : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;
  const instagramHref = contactData.instagram || "https://www.instagram.com/subash_studio/";
  const facebookHref = contactData.facebook || "https://facebook.com";

  const prefersReducedMotion = useReducedMotion();

  // Filter only active branches
  const activeBranches = useMemo(
    () => (branches || []).filter((branch) => branch && branch.active === true),
    [branches]
  );

  const totalBranches = activeBranches.length;

  // Responsive items visible per slide page
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

  // Total pages based on itemsPerPage
  const totalPages = Math.max(1, Math.ceil(totalBranches / itemsPerPage));
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Viewport/data changes safety: clamp currentPage within [0, totalPages - 1]
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const handleNext = useCallback(() => {
    if (totalPages <= 1) return;
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const handlePrev = useCallback(() => {
    if (totalPages <= 1) return;
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleDotClick = (pageIdx) => {
    if (pageIdx === currentPage) return;
    setDirection(pageIdx > currentPage ? 1 : -1);
    setCurrentPage(pageIdx);
  };

  // Auto-slide every 5 seconds; pause on hover, touch, or reduced-motion
  useEffect(() => {
    if (isHovered || prefersReducedMotion || totalPages <= 1) {
      return;
    }
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentPage, isHovered, prefersReducedMotion, totalPages, handleNext]);

  // Touch / swipe handling on mobile
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    setIsHovered(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Sliced page-based visible branches
  const visibleBranches = useMemo(() => {
    if (totalBranches === 0) return [];
    const startIndex = currentPage * itemsPerPage;
    return activeBranches.slice(startIndex, startIndex + itemsPerPage);
  }, [activeBranches, currentPage, itemsPerPage, totalBranches]);

  // Responsive cards layout classes
  const getCardsGridClass = () => {
    if (itemsPerPage === 1) return "grid-cols-1";
    if (itemsPerPage === 2) {
      return totalBranches === 1
        ? "grid-cols-1 max-w-[280px]"
        : "grid-cols-1 sm:grid-cols-2 max-w-[560px]";
    }
    // Desktop (itemsPerPage === 3):
    if (totalBranches === 1) return "grid-cols-1 max-w-[280px]";
    if (totalBranches === 2) return "grid-cols-2 max-w-[560px]";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir > 0 ? 25 : -25,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir > 0 ? -25 : 25,
    }),
  };

  return (
    <footer className="bg-[#262626] text-[#FAF8F5]/80 relative z-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* COLUMN 1 — BRAND (Desktop: 3 cols, Tablet: 1 col, Mobile: 1 col) */}
        <div className="sm:col-span-1 lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm">
              <Logomark size={28} />
            </div>
            <span className="font-display text-lg tracking-[0.18em] text-[#FAF8F5] font-medium">
              SUBASH STUDIO
            </span>
          </div>

          <p className="text-sm leading-relaxed max-w-sm text-[#FAF8F5]/65 mb-5">
            A fine photography and cinematography studio creating timeless imagery across our studio locations.
          </p>

          <div className="space-y-2 text-xs text-[#FAF8F5]/80 mb-6">
            <a
              href={phoneHref}
              className="flex items-center gap-2.5 hover:text-[#C9A669] transition-colors"
            >
              <Phone size={13} className="text-[#C9A669] shrink-0" />
              <span>{primaryPhone}</span>
            </a>
            <a
              href={`mailto:${studioEmail}`}
              className="flex items-center gap-2.5 hover:text-[#C9A669] transition-colors"
            >
              <Mail size={13} className="text-[#C9A669] shrink-0" />
              <span>{studioEmail}</span>
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaWhatsapp size={15} />
            </a>
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaInstagram size={15} />
            </a>
            <a
              href={facebookHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaFacebookF size={14} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Pinterest"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaPinterestP size={14} />
            </a>
          </div>
        </div>

        {/* COLUMN 2 — EXPLORE (Desktop: 2 cols, Tablet: 1 col, Mobile: 1 col) */}
        <div className="sm:col-span-1 lg:col-span-2">
          <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669] mb-5">
            EXPLORE
          </h4>
          <ul className="space-y-2.5 text-sm text-[#FAF8F5]/75">
            <li>
              <Link to="/about" className="hover:text-[#C9A669] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/order-booking" className="hover:text-[#C9A669] transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link to="/frames" className="hover:text-[#C9A669] transition-colors">
                Order Frames
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className="hover:text-[#C9A669] transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-[#C9A669] transition-colors">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/films" className="hover:text-[#C9A669] transition-colors">
                Films
              </Link>
            </li>
            <li>
              <Link to="/branches" className="hover:text-[#C9A669] transition-colors">
                Branches
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#C9A669] transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUMN 3 — STUDIO LOCATIONS CAROUSEL (Desktop: 7 cols, Tablet: 2 cols full width, Mobile: 1 col) */}
        <div className="sm:col-span-2 lg:col-span-7 flex flex-col justify-start">
          
          {/* Header Bar with Title and Prev/Next Navigation */}
          <div className="flex items-center justify-between mb-5 min-h-[28px]">
            <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669]">
              STUDIO LOCATIONS
            </h4>
            
            {/* Previous / Next page controls */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous branch page"
                  className="w-7 h-7 rounded-full border border-white/20 hover:border-[#C9A669] text-[#FAF8F5]/80 hover:text-[#C9A669] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next branch page"
                  className="w-7 h-7 rounded-full border border-white/20 hover:border-[#C9A669] text-[#FAF8F5]/80 hover:text-[#C9A669] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* LOADING SKELETON */}
          {loading && (!branches || branches.length === 0) && (
            <div className={`grid w-full gap-5 items-stretch ${itemsPerPage === 1 ? "grid-cols-1" : itemsPerPage === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={`branch-skeleton-${i}`} className="animate-pulse space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <div className="h-4 bg-white/10 rounded w-28 mb-3"></div>
                  <div className="h-3 bg-white/10 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-20 pt-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && totalBranches === 0 && (
            <div className="space-y-3 text-xs leading-relaxed text-[#FAF8F5]/75">
              <p className="text-[#FAF8F5]/65">
                Unable to load current branch details at this time.
              </p>
              <div className="space-y-1.5 pt-1">
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 hover:text-[#C9A669] transition-colors"
                >
                  <Phone size={13} className="text-[#C9A669] shrink-0" />
                  <span>Call: {primaryPhone}</span>
                </a>
                <a
                  href={`mailto:${studioEmail}`}
                  className="flex items-center gap-2 hover:text-[#C9A669] transition-colors"
                >
                  <Mail size={13} className="text-[#C9A669] shrink-0" />
                  <span>{studioEmail}</span>
                </a>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && totalBranches === 0 && (
            <div className="space-y-3 text-xs leading-relaxed text-[#FAF8F5]/75">
              <p className="text-[#FAF8F5]/65">
                Our studio locations are currently being updated. For bookings, consultations, or studio visits, please reach out to our team directly.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C9A669] hover:text-[#FAF8F5] transition-colors font-medium"
                >
                  <span>Schedule Consultation</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* DYNAMIC DATABASE BRANCH CAROUSEL */}
          {!loading && totalBranches > 0 && (
            <div
              className="relative select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: "pan-y" }}
            >
              {/* Carousel Cards Container */}
              <div className="overflow-hidden min-h-[190px]">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={`page-${currentPage}-${itemsPerPage}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: prefersReducedMotion ? 0.05 : 0.32,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                    className={`grid w-full gap-5 items-stretch ${getCardsGridClass()}`}
                  >
                    {visibleBranches.map((branch) => (
                      <div
                        key={branch.id || branch.city || branch.name}
                        className="w-full flex flex-col"
                      >
                        <BranchCard branch={branch} />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination Dots (one dot per page) */}
              {totalPages > 1 && (
                <div
                  className="flex items-center gap-1.5 mt-5 justify-center sm:justify-start"
                  role="tablist"
                  aria-label="Branch slides"
                >
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const isActive = idx === currentPage;
                    return (
                      <button
                        key={`page-dot-${idx}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Go to branch slide ${idx + 1}`}
                        onClick={() => handleDotClick(idx)}
                        className={`transition-all duration-300 focus:outline-none rounded-full cursor-pointer ${
                          isActive
                            ? "w-5 h-1.5 bg-[#C9A669]"
                            : "w-1.5 h-1.5 bg-white/20 hover:bg-[#C9A669]/50"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM FOOTER BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FAF8F5]/50 text-center sm:text-left">
          <p>© {new Date().getFullYear()} SUBASH STUDIO. All rights reserved.</p>
          <p className="tracking-wide">Crafted with care, one frame at a time.</p>
        </div>
      </div>
    </footer>
  );
}
