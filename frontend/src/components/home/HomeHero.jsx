import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAdminData } from "../../admin/context/AdminDataContext";
import { scrollToTop } from "../../lib/useLenis";

const DEFAULT_HERO_SLIDES = [
  "/images/wedding photos.jpg",
  "/images/couple.jpg",
  "/images/traditional photos.jpg",
  "/images/receiption.jpg",
];

export default function HomeHero() {
  const { websiteContent } = useAdminData();
  const homeData = websiteContent?.home || {};
  const prefersReducedMotion = useReducedMotion();

  // 1. Text Content with dynamic CMS support & requested luxury defaults
  const heroMainTitle = (
    homeData.heroMainTitle ||
    homeData.heroHeading ||
    "SUBASH STUDIO"
  ).trim();

  const heroSubtitle = (
    homeData.heroSubtitle ||
    homeData.heroEyebrow ||
    "WEDDING FILM COMPANY"
  ).trim();

  const heroSinceText = (
    homeData.heroSinceText ||
    "SINCE 1933"
  ).trim();

  const heroDeliveryTagline = (
    homeData.heroDeliveryTagline ||
    (homeData.heroTagline && !homeData.heroTagline.includes("Preserving timeless heritage")
      ? homeData.heroTagline
      : "WE PROMISE ON TIME DELIVERY")
  ).trim();

  // 2. Saved Hero Images from Admin CMS
  const activeHeroImages = useMemo(() => {
    if (!Array.isArray(homeData.heroImages)) return [];
    return homeData.heroImages
      .filter((img) => img && img.url && img.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [homeData.heroImages]);

  // Normalized slide URLs list: guarantees multiple slides so prev/next arrows always work
  const slideList = useMemo(() => {
    if (activeHeroImages.length > 1) {
      return activeHeroImages.map((img) => img.url);
    }
    if (activeHeroImages.length === 1) {
      const single = activeHeroImages[0].url;
      return [single, ...DEFAULT_HERO_SLIDES.filter((s) => s !== single)];
    }
    if (homeData.heroImage || homeData.image) {
      const single = homeData.heroImage || homeData.image;
      return [single, ...DEFAULT_HERO_SLIDES.filter((s) => s !== single)];
    }
    return DEFAULT_HERO_SLIDES;
  }, [activeHeroImages, homeData.heroImage, homeData.image]);

  const hasMultipleSlides = slideList.length > 1;
  const loopEnabled = homeData.heroImageLoop !== false;

  // 3. Slideshow State & Sequencer
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Keep index within bounds if images change
  useEffect(() => {
    if (currentIndex >= slideList.length) {
      setCurrentIndex(0);
    }
  }, [slideList.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultipleSlides) return;
    setCurrentIndex((prev) => {
      if (prev >= slideList.length - 1) {
        return loopEnabled ? 0 : prev;
      }
      return prev + 1;
    });
  }, [hasMultipleSlides, loopEnabled, slideList.length]);

  const handlePrev = useCallback(() => {
    if (!hasMultipleSlides) return;
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return loopEnabled ? slideList.length - 1 : 0;
      }
      return prev - 1;
    });
  }, [hasMultipleSlides, loopEnabled, slideList.length]);

  // Auto-play timer (~5 seconds)
  useEffect(() => {
    if (!hasMultipleSlides || isHovered) return;

    // If loop is OFF and we reached the final image, stop playback
    if (!loopEnabled && currentIndex === slideList.length - 1) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [
    hasMultipleSlides,
    isHovered,
    loopEnabled,
    currentIndex,
    slideList.length,
    handleNext,
  ]);

  // Preload adjacent images to prevent blank frames or layout shifts
  useEffect(() => {
    if (hasMultipleSlides) {
      const nextIdx = (currentIndex + 1) % slideList.length;
      const img = new Image();
      img.src = slideList[nextIdx];
    }
  }, [currentIndex, hasMultipleSlides, slideList]);

  // Mobile Touch Swipe Navigation
  const touchStartXRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const minSwipeDistance = 40;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <section
      className="relative w-full min-h-screen min-h-[100dvh] h-screen h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#12110F] select-none"
      aria-label="SUBASH STUDIO Hero"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =========================================================
          LAYER 0: BACKGROUND SLIDESHOW LAYER (z-0)
          Stationary crossfade between images.
          Main photo subjects kept visible on center-right.
      ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={slideList[currentIndex]}
            src={slideList[currentIndex]}
            alt="SUBASH STUDIO Wedding Story"
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.05 : 0.85,
              ease: "easeInOut",
            }}
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
            className="absolute inset-0 w-full h-full object-cover object-center sm:object-[center_35%]"
          />
        </AnimatePresence>
      </div>

      {/* =========================================================
          LAYER 0.5: CENTER-EDGE PREV / NEXT ARROW BUTTONS (z-[3])
          Vertically centered on the left and right edges of the hero.
      ========================================================= */}
      {hasMultipleSlides && (
        <>
          {/* Previous — Center Left */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous hero image"
            className="
              absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[3]
              w-10 h-10 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              text-[#FAF7F2]
              border border-white/30 hover:border-[#E4D3A6]
              bg-black/40 hover:bg-[#1a1714]/80
              backdrop-blur-md
              shadow-[0_4px_24px_rgba(0,0,0,0.5)]
              transition-all duration-300
              hover:scale-105 active:scale-95
              hover:text-[#E4D3A6]
              cursor-pointer
            "
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Next — Center Right */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next hero image"
            className="
              absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[3]
              w-10 h-10 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              text-[#FAF7F2]
              border border-white/30 hover:border-[#E4D3A6]
              bg-black/40 hover:bg-[#1a1714]/80
              backdrop-blur-md
              shadow-[0_4px_24px_rgba(0,0,0,0.5)]
              transition-all duration-300
              hover:scale-105 active:scale-95
              hover:text-[#E4D3A6]
              cursor-pointer
            "
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowRight size={18} />
          </button>
        </>
      )}

      {/* =========================================================
          LAYER 1: STATIONARY DARK GRADIENT OVERLAYS (z-[1])
          Dark on the left to ensure crisp text readability,
          subtle vignette allowing the couple on the center-right
          to shine through brightly.
      ========================================================= */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.68) 35%, rgba(14,13,11,0.28) 68%, rgba(14,13,11,0.12) 100%), linear-gradient(to bottom, rgba(10,9,8,0.65) 0%, transparent 28%, rgba(10,9,8,0.72) 100%)",
        }}
        aria-hidden="true"
      />

      {/* =========================================================
          LAYER 2: HERO CONTENT (z-[2])
          Left-aligned editorial typography matching luxury wedding studio hierarchy.
          1. SUBASH STUDIO (largest headline)
          2. WEDDING FILM COMPANY (elegant secondary line)
          3. SINCE 1933 (refined heritage accent line)
          4. WE PROMISE ON TIME DELIVERY (supporting tagline)
          5. BOTTOM BAR (counter + navigation arrows)
      ========================================================= */}
      <div className="relative z-[2] w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="max-w-4xl text-left space-y-3.5 sm:space-y-4">
          {/* 1. Main Title — largest & strongest luxury headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="font-display font-medium text-4xl sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[86px] leading-[1.03] tracking-[0.05em] sm:tracking-[0.07em] uppercase text-[#FAF7F2] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
          >
            {heroMainTitle}
          </motion.h1>

          {/* 2. Subtitle — elegant secondary line */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-xl md:text-2xl lg:text-[25px] font-sans font-medium tracking-[0.24em] sm:tracking-[0.28em] uppercase text-[#E4D3A6] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]"
          >
            {heroSubtitle}
          </motion.div>

          {/* 3. Since Text — smaller refined heritage/accent line */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-[14px] font-sans font-light tracking-[0.32em] sm:tracking-[0.38em] uppercase text-[#FAF7F2]/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          >
            {heroSinceText}
          </motion.div>

          {/* 4. Delivery Tagline — premium supporting tagline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4 }}
            className="pt-1.5 sm:pt-2 text-xs sm:text-[13px] md:text-[14.5px] font-sans font-medium tracking-[0.18em] sm:tracking-[0.22em] uppercase text-[#FAF7F2]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          >
            {heroDeliveryTagline}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
