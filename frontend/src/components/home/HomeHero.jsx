import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useAdminData } from "../../admin/context/AdminDataContext";
import { scrollToTop } from "../../lib/useLenis";

const DEFAULT_HERO_SLIDES = [
  "/images/wedding photos.jpg",
  "/images/couple.jpg",
  "/images/traditional photos.jpg",
  "/images/receiption.jpg",
];

const FALLBACK_IMAGE = "/images/wedding photos.jpg";

/** Convert "SUBASH STUDIO" → "Subash Studio" for elegant script rendering */
const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function HomeHero() {
  const { websiteContent } = useAdminData();
  const homeData = websiteContent?.home || {};
  const contactData = websiteContent?.contact || {};
  const instagramHref = contactData.instagram || "https://www.instagram.com/subash_studio/";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http") ? whatsappRaw : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;

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
  // Always loop — never stop after last image
  const loopEnabled = true;

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
    setCurrentIndex((prev) => (prev + 1) % slideList.length);
  }, [hasMultipleSlides, slideList.length]);

  const handlePrev = useCallback(() => {
    if (!hasMultipleSlides) return;
    setCurrentIndex((prev) => (prev - 1 + slideList.length) % slideList.length);
  }, [hasMultipleSlides, slideList.length]);

  // Auto-play timer — 3 seconds per slide, loops forever, never pauses
  const autoplayTimerRef = useRef(null);

  const resetAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    if (!hasMultipleSlides) return;
    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 3000);
  }, [hasMultipleSlides, slideList.length]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [resetAutoplay]);

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
          Subtle slow zoom animation (scale 1 -> scale 1.04 over 10s)
      ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={slideList[currentIndex]}
            src={slideList[currentIndex]}
            alt="SUBASH STUDIO Wedding Story"
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.04 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: prefersReducedMotion ? 0.05 : 1.0, ease: "easeInOut" },
              scale: { duration: 10, ease: "linear" }
            }}
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
            className="absolute inset-0 w-full h-full object-cover object-[72%_30%] sm:object-[65%_35%] md:object-[58%_35%] lg:object-[center_35%] xl:object-[center_35%] pointer-events-none"
          />
        </AnimatePresence>
      </div>

      {/* =========================================================
          LAYER 0.5: CENTER-EDGE PREV / NEXT ARROW BUTTONS (z-[3])
          Glassmorphism circular buttons on center left and right edges.
      ========================================================= */}
      {hasMultipleSlides && (
        <>
          {/* Previous — Center Left */}
          <button
            type="button"
            onClick={() => { handlePrev(); resetAutoplay(); }}
            aria-label="Previous hero image"
            className="
              absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[3]
              w-10 h-10 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              text-white
              border border-white/30 hover:border-[#C9A96E]
              bg-black/35 hover:bg-black/60
              backdrop-blur-md
              shadow-[0_4px_24px_rgba(0,0,0,0.5)]
              transition-all duration-300
              hover:scale-105 active:scale-95
              hover:text-[#C9A96E]
              cursor-pointer
            "
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Next — Center Right */}
          <button
            type="button"
            onClick={() => { handleNext(); resetAutoplay(); }}
            aria-label="Next hero image"
            className="
              absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[3]
              w-10 h-10 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              text-white
              border border-white/30 hover:border-[#C9A96E]
              bg-black/35 hover:bg-black/60
              backdrop-blur-md
              shadow-[0_4px_24px_rgba(0,0,0,0.5)]
              transition-all duration-300
              hover:scale-105 active:scale-95
              hover:text-[#C9A96E]
              cursor-pointer
            "
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowRight size={18} />
          </button>
        </>
      )}

      {/* =========================================================
          LAYER 1: CINEMATIC LEFT-SIDE DARK GRADIENT OVERLAY (z-[1])
          Dark overlay focused on the far left 45% area to ensure crisp text legibility
          while keeping the couple on the right 55% completely bright & vivid.
      ========================================================= */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none transition-all duration-500"
        style={{
          background:
            "linear-gradient(to right, rgba(8, 16, 10, 0.58) 0%, rgba(8, 16, 10, 0.38) 35%, rgba(8, 16, 10, 0.08) 65%, transparent 100%), linear-gradient(to bottom, rgba(8, 16, 10, 0.22) 0%, transparent 25%, rgba(8, 16, 10, 0.28) 100%)",
        }}
        aria-hidden="true"
      />

      {/* =========================================================
          LAYER 2: HERO CONTENT — PERFECT LEFT POSITIONED BRANDING BLOCK (z-[2])
          Positioned on the left side of the screen (clearing the left arrow),
          taking up 45% max width, with text elements centered inside the left block.
          1. Subash Studio → WHITE script (clamp 38px, 4.8vw, 80px)
          2. WEDDING FILM COMPANY → WHITE serif with centered white divider lines
          3. SINCE 1933 → BOLD CHAMPAGNE GOLD (#C9A96E) serif with centered gold divider lines
          4. WE PROMISE ON TIME DELIVERY → WHITE serif
      ========================================================= */}
      <div
        className="relative z-[2] w-full flex-1 flex flex-col justify-center items-start pl-6 sm:pl-10 md:pl-14 lg:pl-16 xl:pl-20 pr-4 sm:pr-8 py-16"
      >
        <div
          className="flex flex-col items-center justify-center text-center w-full"
          style={{ maxWidth: "clamp(18rem, 45vw, 650px)" }}
        >
          {/* ── 1. SUBASH STUDIO ────────────────────────────────────────── */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center w-full"
            style={{
              fontFamily: "'Great Vibes', 'Allura', 'Alex Brush', cursive",
              fontSize: "clamp(100px, 5.0vw, 190px)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              color: "#FFFFFF",
              textShadow:
                "0 4px 24px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.6)",
              marginBottom: "clamp(0.35rem, 1vw, 0.75rem)",
              textAlign: "center",
              display: "block",
            }}
          >
            {toTitleCase(heroMainTitle)}
          </motion.h1>

          {/* ── 2. WEDDING FILM COMPANY ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full text-center"
            style={{
              marginBottom: "clamp(0.4rem, 1vw, 0.75rem)",
            }}
          >
            <span
              className="inline-block h-[1px] w-4 sm:w-10 bg-white/75 shrink-0"
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "'Cinzel', 'Times New Roman', serif",
                fontSize: "clamp(15px, 2.2vw, 4px)",
                fontWeight: 800,
                letterSpacing: "0.35em",
                lineHeight: 1.2,
                color: "#FFFFFF",
                textTransform: "uppercase",
                textShadow: "0 2px 14px rgba(0,0,0,0.88)",
                textAlign: "center",
              }}
            >
              {heroSubtitle}
            </span>
            <span
              className="inline-block h-[1px] w-4 sm:w-10 bg-white/75 shrink-0"
              aria-hidden="true"
            />
          </motion.div>

          {/* ── 3. SINCE 1933 ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full text-center"
            style={{
              marginBottom: "clamp(0.45rem, 1.1vw, 0.85rem)",
            }}
          >
            <span
              className="inline-block h-[1.5px] w-3.5 sm:w-8 bg-[#C9A96E] shrink-0"
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "'Cinzel', 'Times New Roman', serif",
                fontSize: "clamp(18px, 1.8vw, 8px)",
                fontWeight: 800,
                letterSpacing: "0.42em",
                lineHeight: 1.2,
                color: "#C9A96E",
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.85)",
                textAlign: "center",
              }}
            >
              {heroSinceText}
            </span>
            <span
              className="inline-block h-[1.5px] w-3.5 sm:w-8 bg-[#C9A96E] shrink-0"
              aria-hidden="true"
            />
          </motion.div>

          {/* ── 4. WE PROMISE ON TIME DELIVERY ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full text-center flex justify-center"
            style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
              fontSize: "clamp(18px, 1.8vw, 4px)",
              fontWeight: 800,
              letterSpacing: "0.26em",
              lineHeight: 1.3,
              color: "#FFFFFF",
              textTransform: "uppercase",
              textShadow: "0 2px 14px rgba(0,0,0,0.88)",
              textAlign: "center",
            }}
          >
            {heroDeliveryTagline}
          </motion.div>
        </div>
      </div>

    </section>
  );
}


