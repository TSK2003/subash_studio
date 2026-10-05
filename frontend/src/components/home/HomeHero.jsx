import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAdminData } from "../../admin/context/AdminDataContext";
import { scrollToTop } from "../../lib/useLenis";

/**
 * HomeHero
 *
 * Recreates the approved luxury editorial wedding hero design (Screenshot 1).
 * Features:
 * - Full-width wedding photography background with smooth multi-image slideshow.
 * - Stationary cinematic dark gradient overlay keeping left-aligned text readable.
 * - Left-aligned text hierarchy:
 *   - Eyebrow: "WEDDING PHOTOGRAPHY & FILMS"
 *   - Heading: "Real emotions.\nBeautiful stories.\nForever yours."
 *     (Warm ivory lines with champagne-gold italic accent on the final line)
 *   - Description: "We capture the moments you feel, and the memories you keep."
 *   - No buttons (spacing optimized).
 * - Bottom Bar:
 *   - Left: "A LOVE STORY, CAPTURED BY SUBASH"
 *   - Right: "01 / 03" counter with discreet circular previous/next arrow buttons.
 * - Mobile touch/swipe navigation.
 * - Image preloading to eliminate blank/flashing frames.
 */
export default function HomeHero() {
  const { websiteContent } = useAdminData();
  const homeData = websiteContent?.home || {};
  const prefersReducedMotion = useReducedMotion();

  // 1. Text Content with defaults from Screenshot 1 & CMS support
  const heroEyebrow = (
    homeData.heroEyebrow || "WEDDING PHOTOGRAPHY & FILMS"
  ).trim();

  const rawHeading = (
    homeData.heroHeading ||
    "Real emotions.\nBeautiful stories.\nForever yours."
  ).trim();

  const heroTagline = (
    homeData.heroTagline ||
    "We capture the moments you feel, and the memories you keep."
  ).trim();

  // Parse multi-line heading: last line has champagne-gold italic accent
  const headingLines = useMemo(() => {
    const lines = rawHeading
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      return { mainLines: lines, accentLine: null };
    }
    return {
      mainLines: lines.slice(0, -1),
      accentLine: lines[lines.length - 1],
    };
  }, [rawHeading]);

  // 2. Saved Hero Images from Admin CMS (Screenshot 2)
  const activeHeroImages = useMemo(() => {
    if (!Array.isArray(homeData.heroImages)) return [];
    return homeData.heroImages
      .filter((img) => img && img.url && img.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [homeData.heroImages]);

  // Fallback wedding image if zero images uploaded
  const fallbackImage =
    homeData.heroImage || homeData.image || "/images/wedding photos.jpg";

  // Normalized slide URLs list
  const slideList = useMemo(() => {
    if (activeHeroImages.length > 0) {
      return activeHeroImages.map((img) => img.url);
    }
    return [fallbackImage];
  }, [activeHeroImages, fallbackImage]);

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
          Left-aligned editorial typography matching Screenshot 1.
          Overlays and text remain stationary while images transition.
      ========================================================= */}
      <div className="relative z-[2] w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex-1 flex flex-col justify-between pt-28 sm:pt-36 pb-8 sm:pb-10">
        {/* Main Content (Vertically centered within available upper area) */}
        <div className="my-auto max-w-2xl text-left">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] sm:text-xs tracking-[0.32em] font-semibold text-[#E4D3A6] uppercase mb-4 sm:mb-5 block drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            {heroEyebrow}
          </motion.span>

          {/* Heading with champagne-gold italic accent on the final line */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="font-display font-medium text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[74px] leading-[1.08] tracking-tight text-left"
          >
            {headingLines.mainLines.map((line, idx) => (
              <span
                key={idx}
                className="text-[#FAF7F2] block drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              >
                {line}
              </span>
            ))}
            {headingLines.accentLine && (
              <span className="text-[#E4D3A6] italic font-normal block mt-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                {headingLines.accentLine}
              </span>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-5 sm:mt-6 text-[#FAF7F2]/85 text-sm sm:text-base md:text-[17px] leading-relaxed max-w-xl font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] text-left"
          >
            {heroTagline}
          </motion.p>
        </div>

        {/* =========================================================
            BOTTOM BAR (Screenshot 1)
            - Left: "A LOVE STORY, CAPTURED BY SUBASH"
            - Right: Slideshow indicator ("01 / 03") & prev/next buttons
        ========================================================= */}
        <div className="w-full flex items-center justify-between pt-6 border-t border-white/10 select-none">
          {/* Left: Editorial Subtitle */}
          <div className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-medium text-[#FAF7F2]/75 drop-shadow-sm">
            A LOVE STORY, CAPTURED BY SUBASH
          </div>

          {/* Right: Slideshow Navigation (Only rendered when > 1 slide) */}
          {hasMultipleSlides && (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Slide Counter (e.g. 01 / 03) */}
              <span className="text-xs sm:text-sm font-mono tracking-widest text-[#FAF7F2]/90 drop-shadow-sm">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(slideList.length).padStart(2, "0")}
              </span>

              {/* Prev / Next Discreet Circular Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image slide"
                  className="w-8 h-8 rounded-full border border-white/35 hover:border-[#E4D3A6] hover:bg-[#E4D3A6]/20 text-[#FAF7F2] hover:text-[#E4D3A6] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <ArrowLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image slide"
                  className="w-8 h-8 rounded-full border border-white/35 hover:border-[#E4D3A6] hover:bg-[#E4D3A6]/20 text-[#FAF7F2] hover:text-[#E4D3A6] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
