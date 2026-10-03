import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useAdminData } from "../../admin/context/AdminDataContext";

/**
 * HomeHero
 *
 * CMS-managed Hero Video System for SUBASH STUDIO Landing Page.
 *
 * Strict 3-Layer Architecture:
 * - Layer 0 (z-0):   Background Video playlist with smooth playback and safe image fallback
 * - Layer 1 (z-[1]): Cinematic Contrast Gradient & Vignette Overlay (preserves text readability across bright/dark video frames)
 * - Layer 2 (z-[2]): Centered Hero Content (Emblem logo, SUBASH STUDIO typography, WEDDING FILM COMPANY, SINCE 1933, Promise on Time Delivery, Tagline, Scroll indicator)
 *
 * Navigation Header (z-50) is strictly ABOVE Section 1.
 * Section 2 (Why Choose Us) is completely separate; video NEVER bleeds or remains fixed behind Section 2.
 */
export default function HomeHero() {
  const { websiteContent } = useAdminData();
  const homeData = websiteContent?.home || {};

  // Extract Headline
  const rawHeading = (homeData.heroHeading || "Subash Studio").trim();
  let word1 = "SUBASH";
  let word2 = "STUDIO";

  if (rawHeading.includes("\n")) {
    const parts = rawHeading.split("\n");
    word1 = parts[0].trim();
    word2 = parts.slice(1).join(" ").trim();
  } else {
    const words = rawHeading.split(/\s+/);
    if (words.length > 1) {
      word1 = words[0];
      word2 = words.slice(1).join(" ");
    } else if (words.length === 1 && words[0]) {
      word1 = words[0];
      word2 = "";
    }
  }

  const heroTagline =
    homeData.heroTagline ||
    "Preserving timeless heritage, profound emotions, and authentic human celebrations across generations.";

  const fallbackImage =
    homeData.heroImage || homeData.image || "/images/storefront.webp";

  // CMS Hero Videos & Loop setting
  const videos = useMemo(() => {
    if (!Array.isArray(homeData.heroVideos)) return [];
    return homeData.heroVideos
      .filter((v) => v && v.url && v.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [homeData.heroVideos]);

  const loopEnabled = homeData.heroVideoLoop !== false;

  // Video Playlist Sequencer state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Keep index within bounds if videos array changes
  useEffect(() => {
    if (currentIndex >= videos.length && videos.length > 0) {
      setCurrentIndex(0);
    }
    setVideoError(false);
  }, [videos.length, currentIndex]);

  // Autoplay current video whenever index changes
  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser prevented autoplay or switching source
        });
      }
    }
  }, [currentIndex, videos]);

  /**
   * Video Sequencer Handler:
   * LOOP ENABLED:
   *   1 video  -> loops continuously
   *   3 videos -> 1 -> 2 -> 3 -> 1 -> 2 -> 3 -> ...
   * LOOP DISABLED:
   *   1 video  -> plays once, stops on final frame
   *   3 videos -> 1 -> 2 -> 3 -> stops on final frame of video 3
   */
  const handleVideoEnded = () => {
    if (videos.length === 0) return;

    if (videos.length === 1) {
      if (loopEnabled && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      // If !loopEnabled, video naturally remains paused on its final frame
      return;
    }

    // Multiple videos
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the last video
      if (loopEnabled) {
        setCurrentIndex(0);
      }
      // If !loopEnabled, stay on the last frame of the final video
    }
  };

  const handleScrollDown = () => {
    const nextSection = document.getElementById("why-choose-us-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hasVideos = videos.length > 0 && !videoError;
  const currentVideo = hasVideos ? videos[currentIndex] : null;

  return (
    <section
      className="relative w-full min-h-[calc(100vh-84px)] flex flex-col items-center justify-center overflow-hidden bg-[#141311] border-b border-[#E7E0D2]/20 py-12 sm:py-16 lg:py-20"
      aria-label="SUBASH STUDIO Welcome"
    >
      {/* =========================================================
          LAYER 0: VIDEO BACKGROUND LAYER (z-0)
          object-fit: cover, strictly scoped to Section 1
          Autoplay, muted, playsInline, no browser controls.
          If 0 videos exist, cleanly falls back to storefront image.
      ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {hasVideos && currentVideo ? (
          <video
            ref={videoRef}
            key={currentVideo.url}
            src={currentVideo.url}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={loopEnabled && videos.length === 1}
            onEnded={handleVideoEnded}
            onError={() => {
              // Gracefully fall back if video file fails to load
              setVideoError(true);
            }}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={fallbackImage}
            alt="SUBASH STUDIO Heritage"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              if (e.currentTarget.src !== "/images/storefront.jpg") {
                e.currentTarget.src = "/images/storefront.jpg";
              }
            }}
            className="w-full h-full object-cover object-center"
          />
        )}
      </div>

      {/* =========================================================
          LAYER 1: CINEMATIC CONTRAST OVERLAY LAYER (z-[1])
          Dark transparent gradient + radial vignette
          Ensures logo emblem, gold accents and white typography
          remain 100% visible and readable over any bright or dark frame,
          while preserving cinematic video vibrancy.
      ========================================================= */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none select-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16,15,13,0.38) 0%, rgba(16,15,13,0.65) 70%, rgba(10,9,8,0.88) 100%), linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.68) 100%)",
        }}
      />

      {/* =========================================================
          LAYER 2: HERO CONTENT LAYER (z-[2])
          - SUBASH STUDIO logo emblem
          - WEDDING FILM COMPANY
          - SUBASH STUDIO Headline (Prominently on one line on desktop)
          - Delicate Gold Divider (── ◆ ──)
          - SINCE 1933 • We Promise on Time Delivery
          - Editorial Tagline from CMS
          - Centered Scroll-down Indicator
      ========================================================= */}
      <div className="relative z-[2] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* 1. SUBASH STUDIO Logo Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
          className="mb-3 sm:mb-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-2 bg-black/40 backdrop-blur-md border border-[#E4D3A6]/40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="SUBASH STUDIO Crest"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            />
          </div>
        </motion.div>

        {/* 2. WEDDING FILM COMPANY Category Tag */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
          className="text-[10.5px] sm:text-[12px] md:text-[13px] tracking-[0.32em] sm:tracking-[0.40em] font-bold text-[#E4D3A6] uppercase mb-2 sm:mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          WEDDING FILM COMPANY
        </motion.p>

        {/* 3. Headline: SUBASH STUDIO (Prominent on one line on desktop) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.25, 1, 0.5, 1] }}
          className="font-display tracking-tight leading-none text-center"
        >
          <span
            className="text-[#FAF7F2] font-bold uppercase inline-block drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]"
            style={{ fontSize: "clamp(2.4rem, 6.2vw, 5.8rem)" }}
          >
            {word1}
          </span>
          {word2 && (
            <span
              className="text-[#E4D3A6] font-normal italic uppercase inline-block ml-3 sm:ml-4 md:ml-5 drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]"
              style={{ fontSize: "clamp(2.4rem, 6.2vw, 5.8rem)" }}
            >
              {word2}
            </span>
          )}
        </motion.h1>

        {/* 4. Delicate Gold Horizontal Lines & Central Diamond (── ◆ ──) */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="flex items-center justify-center gap-3 my-3 sm:my-4"
          aria-hidden="true"
        >
          <span className="h-[1px] w-12 sm:w-16 md:w-20 bg-[#E4D3A6]/60 shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />
          <svg
            width="9"
            height="9"
            viewBox="0 0 10 10"
            className="text-[#E4D3A6] shrink-0 fill-current drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
          >
            <path d="M5 0 L10 5 L5 10 L0 5 Z" />
          </svg>
          <span className="h-[1px] w-12 sm:w-16 md:w-20 bg-[#E4D3A6]/60 shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />
        </motion.div>

        {/* 5. Heritage Badge: SINCE 1933 • We Promise on Time Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10.5px] sm:text-[12px] tracking-[0.24em] uppercase font-semibold text-[#FAF7F2] mb-4 sm:mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
        >
          <span className="text-[#E4D3A6] font-bold">SINCE 1933</span>
          <span className="text-[#E4D3A6]/60 select-none">•</span>
          <span className="text-[#FAF7F2]/90">We Promise on Time Delivery</span>
        </motion.div>

        {/* 6. Editorial Description / Tagline from CMS */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.34, ease: [0.25, 1, 0.5, 1] }}
          className="text-[#E8E3D8] text-[14px] sm:text-[16px] md:text-[17px] leading-[1.65] max-w-xl sm:max-w-2xl mx-auto font-normal text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
        >
          {heroTagline}
        </motion.p>

        {/* 7. Centered Scroll Down Indicator (Balanced, natural spacing) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="flex flex-col items-center justify-center gap-2 mt-8 sm:mt-10 select-none"
        >
          <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-semibold text-[#E4D3A6] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            SCROLL DOWN
          </span>
          <button
            type="button"
            onClick={handleScrollDown}
            aria-label="Scroll down to overview"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E4D3A6]/80 bg-black/40 backdrop-blur-sm flex items-center justify-center text-[#E4D3A6] hover:bg-[#E4D3A6] hover:text-[#1C1B19] transition-all duration-300 group cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={13} className="sm:w-3.5 sm:h-3.5" />
            </motion.div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
