import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaYoutube, FaPinterestP } from "react-icons/fa";
import { MapPin, Phone, Mail, ExternalLink, ChevronRight, Clock } from "lucide-react";
import { useAdminData } from "../admin/context/AdminDataContext";

/**
 * Resolves a high-quality studio/interior image for each studio location card.
 */
function getBranchImage(branch) {
  if (branch.image && typeof branch.image === "string" && branch.image.trim() !== "") {
    return branch.image;
  }
  const city = (branch.city || branch.name || "").toLowerCase();
  if (city.includes("kallada")) return "/images/gallery/branches/kalladaikurichi.jpg";
  if (city.includes("tirunel")) return "/images/gallery/branches/tirunelveli.jpg";
  if (city.includes("tenkasi")) return "/images/gallery/studio/studio-01.jpg";
  return "/images/storefront.jpg";
}

/**
 * Formats clean, punchy studio titles matching the visual reference design.
 */
function formatBranchTitle(branch) {
  const name = (branch.name || `${branch.city || "Studio"} Studio`).toUpperCase();
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Studio Location Card Component (Inspired by Visual Reference Image)
 */
function StudioCard({ branch }) {
  const imageSrc = getBranchImage(branch);
  const title = formatBranchTitle(branch);

  return (
    <div className="bg-[#171614] rounded-lg border border-[#E4D3A6]/15 hover:border-[#E4D3A6]/45 transition-all duration-300 overflow-hidden flex flex-col h-full shadow-[0_8px_24px_rgba(0,0,0,0.45)] group">
      {/* Studio Image Header */}
      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-black/50">
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src !== "/images/storefront.jpg") {
              e.currentTarget.src = "/images/storefront.jpg";
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171614] via-black/25 to-transparent" />
      </div>

      {/* Studio Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Studio Name */}
          <h5
            className="text-xs sm:text-[12.5px] font-bold tracking-[0.14em] text-[#E4D3A6] uppercase leading-tight line-clamp-2 mb-3 drop-shadow-sm"
            title={title}
          >
            {title}
          </h5>

          {/* Studio Physical Address */}
          {branch.address && (
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#FAF8F5]/70 leading-relaxed mb-2.5">
              <MapPin size={12} className="text-[#E4D3A6] shrink-0 mt-0.5" />
              <span className="line-clamp-3">{branch.address}</span>
            </div>
          )}

          {/* Operating Hours */}
          {branch.hours && (
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#FAF8F5]/60 mb-3.5">
              <Clock size={12} className="text-[#E4D3A6] shrink-0 mt-0.5" />
              <span>{branch.hours}</span>
            </div>
          )}
        </div>

        {/* View on Map Link */}
        {branch.mapsUrl ? (
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#E4D3A6] hover:text-[#FAF8F5] transition-colors font-medium mt-auto group/map pt-1"
          >
            <span>View on Map</span>
            <ExternalLink
              size={11}
              className="group-hover/map:translate-x-0.5 group-hover/map:-translate-y-0.5 transition-transform"
            />
          </a>
        ) : (
          <div className="mt-auto" />
        )}
      </div>
    </div>
  );
}

/**
 * Studio Locations Section & Dynamic Seamless Infinite Carousel
 * - Dynamically supports any number of branches (1, 2, 3, 4, 5, 6, 10, 20+).
 * - Desktop: Always displays exactly 3 cards at a time (when 3 or more branches exist).
 * - Tablet: Shows 2 cards. Mobile: Shows 1 card.
 * - Viewport clips track correctly with zero horizontal overflow or page widening.
 * - Uses pure CSS percentage calculation fallback & synchronous useLayoutEffect measurement for 100% stable card dimensions.
 * - Modulo-normalized infinite wrap ensures clicking < or > or auto-playing never hits a blank slide or index glitch.
 * - Clean text < and > navigation controls integrated before Multiple Locations text.
 */
function StudioLocations({ branches = [] }) {
  // Filter active branches
  const activeList = useMemo(() => {
    return (branches || []).filter((b) => b && b.active !== false);
  }, [branches]);

  const N = activeList.length;

  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Responsive window & container measurement
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width and window innerWidth synchronously before paint
  useLayoutEffect(() => {
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    let ro;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (ro) ro.disconnect();
    };
  }, []);

  // Determine visible card count based on responsive viewport width and available branches
  const visibleCount = useMemo(() => {
    if (N === 0) return 1;
    let maxVisible = 1;
    if (windowWidth >= 1024) maxVisible = 3;
    else if (windowWidth >= 640) maxVisible = 2;
    else maxVisible = 1;

    return Math.min(maxVisible, N);
  }, [windowWidth, N]);

  // Carousel is active only when total branches exceed visible slots
  const isCarousel = N > visibleCount;

  // Gap between cards (16px default, 20px on xl screens)
  const gap = windowWidth >= 1280 ? 20 : 16;

  // Card width calculation (fallback to CSS percentage if containerWidth not measured yet)
  const cardWidth = containerWidth > 0
    ? (containerWidth - (visibleCount - 1) * gap) / visibleCount
    : 0;

  const step = cardWidth > 0 ? cardWidth + gap : 0;

  // Cloned array for seamless infinite looping
  const clonedBranches = useMemo(() => {
    if (!isCarousel) return activeList;
    return [...activeList, ...activeList, ...activeList];
  }, [activeList, isCarousel]);

  // Carousel state: initial index starts at N (the middle set)
  const [currentIndex, setCurrentIndex] = useState(isCarousel ? N : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(false);

  // Listen for browser tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Reset index to middle set if N or isCarousel changes
  useEffect(() => {
    if (isCarousel) {
      setCurrentIndex(N);
      setWithTransition(false);
    } else {
      setCurrentIndex(0);
      setWithTransition(false);
    }
  }, [N, isCarousel]);

  // Re-enable transition after silentModuloSnap
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  // Navigation: Next
  const handleNext = useCallback(() => {
    if (!isCarousel) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isCarousel]);

  // Navigation: Prev
  const handlePrev = useCallback(() => {
    if (!isCarousel) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isCarousel]);

  // Handle transitionend: silently normalize index back to middle set [N, 2N-1]
  const handleTransitionEnd = useCallback(
    (e) => {
      if (e.target !== trackRef.current || e.propertyName !== "transform") return;
      if (!isCarousel || N <= 0) return;

      if (currentIndex >= 2 * N || currentIndex < N) {
        setWithTransition(false);
        // Universal modulo formula: maps any index directly into middle range [N, 2N-1]
        const normalized = (((currentIndex % N) + N) % N) + N;
        setCurrentIndex(normalized);
      }
    },
    [currentIndex, isCarousel, N]
  );

  // Auto-play interval: 4.5 seconds per slide, paused on hover/touch/tab hidden
  useEffect(() => {
    if (!isCarousel || isHovered || isDocHidden) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isCarousel, isHovered, isDocHidden, handleNext, currentIndex]);

  // Touch gesture support for mobile/tablet
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e) => {
    setIsHovered(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (touchDeltaX.current < -35) {
      handleNext();
    } else if (touchDeltaX.current > 35) {
      handlePrev();
    }
  };

  // Empty state handling
  if (N === 0) {
    return (
      <div className="lg:col-span-7 flex flex-col justify-start min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-[0.22em] text-[#E4D3A6]">
              STUDIO LOCATIONS
            </h4>
            <div className="w-10 h-[1.5px] bg-[#E4D3A6]/80 mt-2" />
          </div>
        </div>
        <div className="p-6 rounded-lg bg-[#171614] border border-[#E4D3A6]/15 text-xs text-[#FAF8F5]/65">
          Our studio locations are currently being updated. For bookings or consultations, please contact us.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7 flex flex-col justify-start min-w-0">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-[0.22em] text-[#E4D3A6]">
            STUDIO LOCATIONS
          </h4>
          <div className="w-10 h-[1.5px] bg-[#E4D3A6]/80 mt-2" />
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-[#E4D3A6]/85 font-light tracking-[0.14em]">
          {/* Functional minimalist < and > navigation controls placed directly before text */}
          {isCarousel && (
            <div
              className="inline-flex items-center gap-2 mr-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous studio location"
                className="text-[#E4D3A6]/70 hover:text-[#FAF8F5] transition-colors duration-200 cursor-pointer p-0.5 font-mono text-sm sm:text-base leading-none focus:outline-none select-none inline-flex items-center justify-center hover:scale-110 active:scale-95"
                style={{ pointerEvents: 'auto' }}
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next studio location"
                className="text-[#E4D3A6]/70 hover:text-[#FAF8F5] transition-colors duration-200 cursor-pointer p-0.5 font-mono text-sm sm:text-base leading-none focus:outline-none select-none inline-flex items-center justify-center hover:scale-110 active:scale-95"
                style={{ pointerEvents: 'auto' }}
              >
                &gt;
              </button>
            </div>
          )}

          <span className="italic font-display text-[13px] hidden sm:inline">Multiple Locations</span>
          <span className="text-[#E4D3A6]/40 select-none hidden sm:inline">•</span>
          <span className="italic font-display text-[13px] hidden sm:inline">One Vision</span>
        </div>
      </div>

      {/* Cards Display Container: Viewport & Track */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex items-stretch"
          style={{
            gap: `${gap}px`,
            transform:
              isCarousel && step > 0
                ? `translateX(-${currentIndex * step}px)`
                : "none",
            transition:
              isCarousel && withTransition
                ? "transform 850ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            willChange: isCarousel ? "transform" : "auto",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {clonedBranches.map((branch, idx) => (
            <div
              key={`${branch.id || branch.city || branch.name || "br"}-${idx}`}
              style={{
                width:
                  cardWidth > 0
                    ? `${cardWidth}px`
                    : `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                flexShrink: 0,
              }}
              className="h-full flex flex-col"
            >
              <StudioCard branch={branch} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXPLORE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/order-booking" },
  { label: "Order Frames", to: "/frames" },
  { label: "Gallery", to: "/gallery" },
  { label: "Films", to: "/films" },
  { label: "Branches", to: "/branches" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const { branches, websiteContent } = useAdminData();
  const contactData = websiteContent?.contact || {};

  const primaryPhone = contactData.phone || "+91 93457 06609";
  const phoneHref = "tel:" + primaryPhone.replace(/[^\d+]/g, "");
  const studioEmail = contactData.email || "hello@subashstudio.com";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http")
    ? whatsappRaw
    : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;
  const instagramHref =
    contactData.instagram || "https://www.instagram.com/subash_studio/";
  const facebookHref = contactData.facebook || "https://facebook.com";
  const youtubeHref =
    contactData.youtube || "https://youtube.com/@subashstudio";
  const pinterestHref = contactData.pinterest || "https://pinterest.com";

  // Filter only active branches
  const activeBranches = useMemo(
    () => (branches || []).filter((branch) => branch && branch.active === true),
    [branches]
  );

  return (
    <footer className="bg-[#0E0D0B] text-[#FAF8F5]/80 relative z-20 overflow-hidden border-t border-[#E4D3A6]/15">
      {/* Warm Ambient Spotlight in Top-Left (Reference Image 2) */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle at 10% 0%, rgba(201, 166, 105, 0.12) 0%, rgba(201, 166, 105, 0.03) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle Vintage Camera Aperture Artwork in Bottom-Left (Reference Image 2) */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none select-none opacity-20 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-[#E4D3A6] -translate-x-1/3 translate-y-1/3"
        >
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
          <path d="M100 26 L156 68 L142 80 Z" fill="currentColor" opacity="0.25" />
          <path d="M174 74 L174 140 L158 132 Z" fill="currentColor" opacity="0.2" />
          <path d="M156 156 L100 174 L108 158 Z" fill="currentColor" opacity="0.25" />
          <path d="M74 174 L26 132 L42 120 Z" fill="currentColor" opacity="0.2" />
          <path d="M26 100 L44 44 L60 52 Z" fill="currentColor" opacity="0.25" />
          <path d="M68 34 L126 26 L118 42 Z" fill="currentColor" opacity="0.2" />
        </svg>
      </div>

      {/* Main Footer Content Container */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-start">
          
          {/* =========================================================
              COLUMN 1: BRAND IDENTITY & CONTACT (Desktop: 3 cols)
          ========================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            {/* Brand Logo Lockup */}
            <Link
              to="/"
              className="inline-flex items-center gap-3.5 group select-none mb-5"
              aria-label="SUBASH STUDIO Home"
            >
              <img
                src="/logo.png"
                alt="SUBASH STUDIO"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0 brightness-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              />
              <div className="h-8 w-[1px] bg-[#E4D3A6]/40 shrink-0" aria-hidden="true" />
              <div className="flex flex-col justify-center">
                <span className="font-display text-[17px] sm:text-[19px] font-bold tracking-[0.24em] text-[#FAF8F5] uppercase leading-none drop-shadow-sm">
                  SUBASH
                </span>
                <div className="flex items-center justify-between w-full mt-1.5">
                  <span className="h-[1px] flex-1 bg-[#E4D3A6]/50" />
                  <span className="text-[9px] sm:text-[9.5px] font-semibold tracking-[0.28em] text-[#E4D3A6] uppercase leading-none px-1.5">
                    STUDIO
                  </span>
                  <span className="h-[1px] flex-1 bg-[#E4D3A6]/50" />
                </div>
              </div>
            </Link>

            {/* Studio Description */}
            <p className="text-xs sm:text-[13px] leading-relaxed text-[#FAF8F5]/65 max-w-sm mb-6">
              A fine photography and cinematography studio creating timeless imagery across our studio locations.
            </p>

            {/* Contact Details */}
            <div className="space-y-2.5 text-xs sm:text-[13px] text-[#FAF8F5]/85 mb-6">
              <a
                href={phoneHref}
                className="flex items-center gap-3 hover:text-[#E4D3A6] transition-colors group"
              >
                <Phone size={13} className="text-[#E4D3A6] shrink-0" />
                <span className="tracking-wide">{primaryPhone}</span>
              </a>
              <a
                href={`mailto:${studioEmail}`}
                className="flex items-center gap-3 hover:text-[#E4D3A6] transition-colors group"
              >
                <Mail size={13} className="text-[#E4D3A6] shrink-0" />
                <span className="tracking-wide">{studioEmail}</span>
              </a>
            </div>

            {/* Social Media Outlined Circular Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-[#E4D3A6]/30 text-[#FAF8F5]/80 hover:border-[#E4D3A6] hover:text-[#E4D3A6] hover:bg-[#E4D3A6]/10 flex items-center justify-center transition-all duration-300"
              >
                <FaWhatsapp size={14} />
              </a>
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#E4D3A6]/30 text-[#FAF8F5]/80 hover:border-[#E4D3A6] hover:text-[#E4D3A6] hover:bg-[#E4D3A6]/10 flex items-center justify-center transition-all duration-300"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href={facebookHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#E4D3A6]/30 text-[#FAF8F5]/80 hover:border-[#E4D3A6] hover:text-[#E4D3A6] hover:bg-[#E4D3A6]/10 flex items-center justify-center transition-all duration-300"
              >
                <FaFacebookF size={13} />
              </a>
              <a
                href={youtubeHref}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#E4D3A6]/30 text-[#FAF8F5]/80 hover:border-[#E4D3A6] hover:text-[#E4D3A6] hover:bg-[#E4D3A6]/10 flex items-center justify-center transition-all duration-300"
              >
                <FaYoutube size={13} />
              </a>
              <a
                href={pinterestHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-[#E4D3A6]/30 text-[#FAF8F5]/80 hover:border-[#E4D3A6] hover:text-[#E4D3A6] hover:bg-[#E4D3A6]/10 flex items-center justify-center transition-all duration-300"
              >
                <FaPinterestP size={13} />
              </a>
            </div>
          </div>

          {/* =========================================================
              COLUMN 2: EXPLORE NAVIGATION (Desktop: 2 cols)
          ========================================================= */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <h4 className="text-xs uppercase font-semibold tracking-[0.22em] text-[#E4D3A6]">
                EXPLORE
              </h4>
              <div className="w-8 h-[1.5px] bg-[#E4D3A6]/80 mt-2" />
            </div>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group flex items-center justify-between py-0.5 text-[#FAF8F5]/70 hover:text-[#E4D3A6] transition-colors"
                  >
                    <span className="tracking-wide">{item.label}</span>
                    <ChevronRight
                      size={12}
                      className="text-[#E4D3A6]/30 group-hover:text-[#E4D3A6] group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =========================================================
              COLUMN 3: STUDIO LOCATIONS (Desktop: 7 cols)
          ========================================================= */}
          <StudioLocations branches={activeBranches} />
        </div>

        {/* =========================================================
            FOOTER BOTTOM: COPYRIGHT & SCRIPT ACCENT
        ========================================================= */}
        <div className="border-t border-[#E4D3A6]/15 mt-12 sm:mt-16 pt-6 sm:pt-7 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Left: Copyright */}
            <p className="text-xs text-[#FAF8F5]/60 tracking-wider">
              © 2026 SUBASH STUDIO. All rights reserved.
            </p>

            {/* Right: Handwritten Script Accent Text with Fine Lines */}
            <div className="flex items-center gap-3 select-none">
              <span className="h-[1px] w-8 sm:w-12 bg-[#E4D3A6]/40" />
              <span className="font-script text-[#E4D3A6] text-xl sm:text-2xl tracking-wide drop-shadow-sm">
                More Than Just Photos
              </span>
              <span className="h-[1px] w-8 sm:w-12 bg-[#E4D3A6]/40" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
