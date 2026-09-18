import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

/**
 * HomeHero
 *
 * Recreates the exact visual composition of the uploaded Subash Studio reference:
 * - 1600x800 style desktop editorial hero composition
 * - Warm ivory canvas (#FAF7F2) with subtle organic texture
 * - Authentic outer-edge heritage artwork layers from /images/backgrounds/subash-bg-wide.webp
 *   (film strips, vintage photographer, DSLR camera, polaroids, botanical leaves)
 * - Large, dominant Subash Studio storefront photograph on the right, seamlessly blended
 *   into the scene (NO card frame, NO rigid box borders, natural atmospheric edge fade)
 * - True editorial typography hierarchy:
 *   "Subash" (Fraunces bold charcoal) + "Photography" (Fraunces italic champagne gold)
 *   with "Photography" extending generously across into the center space
 * - Minimal gold diamond ornament (── ◆ ──)
 * - Pill buttons: BOOK A SHOOT (~210px x 52px) & EXPLORE OUR WORK (~235px x 52px)
 * - SCROLL DOWN indicator with circular downward arrow
 * - Fully responsive from 375px mobile up to 1920px widescreen desktop
 */
export default function HomeHero() {
  const handleScrollDown = () => {
    const nextSection = document.getElementById("home-stats-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative w-full min-h-[auto] lg:min-h-[600px] lg:h-[clamp(620px,46vw,840px)] flex flex-col justify-start overflow-hidden bg-[#FAF7F2] border-b border-[#E7E0D2]/70"
      aria-label="Subash Studio Welcome"
    >
      {/* =========================================================
          LAYER 1: OUTER-EDGE HERITAGE COLLAGE ARTWORK (z-[1])
          Anchors film strips, vintage photographer & leaves on the left flank,
          and polaroid photo wall, DSLR camera & leaves on the right flank,
          positioned BEHIND the storefront image (z-[1]).
      ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-[1] overflow-hidden"
        aria-hidden="true"
      >
        {/* Left Flank Collage: Top leaves, film strip arch, photographer profile, circular photo, bottom leaves - Fully visible on outer edge only */}
        <div
          className="hidden lg:block absolute top-0 bottom-0 left-0 w-[260px] lg:w-[280px] xl:w-[320px] 2xl:w-[360px] bg-no-repeat bg-left-top opacity-100 transition-opacity duration-700"
          style={{
            backgroundImage: "url('/images/backgrounds/subash-bg-wide.webp')",
            backgroundSize: "auto 100%",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black clamp(42px, 4vw, 56px), rgba(0,0,0,0.65) clamp(65px, 6.2vw, 86px), rgba(0,0,0,0.15) clamp(82px, 7.8vw, 108px), transparent clamp(96px, 9.2vw, 126px))",
            maskImage:
              "linear-gradient(to right, black 0%, black clamp(42px, 4vw, 56px), rgba(0,0,0,0.65) clamp(65px, 6.2vw, 86px), rgba(0,0,0,0.15) clamp(82px, 7.8vw, 108px), transparent clamp(96px, 9.2vw, 126px))",
          }}
        />

        {/* Mobile / Tablet Portrait Artwork Layer */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-top bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('/images/backgrounds/subash-bg-tall.webp')",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 15%, transparent 35%, transparent 70%, black 90%, black 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 15%, transparent 35%, transparent 70%, black 90%, black 100%)",
          }}
        />
      </div>

      {/* =========================================================
          LAYER 2: DESKTOP RIGHT-SIDE STOREFRONT PHOTO (z-10)
          Dominant architectural visual spanning the right side of the hero canvas.
          Calibrated with responsive widths (w-[50%] xl:w-[46%] 2xl:w-[42%] max-w-[840px])
          so that on both Laptop and PC screens:
          - Words never collide with the photo (comfortable breathing room)
          - No excessive empty gap on laptops
          - Storefront building, signage, couple photo, and right trees remain fully visible
      ========================================================= */}
      <div
        className="hidden lg:flex absolute top-0 bottom-0 right-0 w-[50%] xl:w-[46%] 2xl:w-[42%] max-w-[840px] items-end justify-end z-10 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative h-full w-full flex items-end justify-end">
          {/* Main Storefront Photograph anchored flush to the right edge */}
          <img
            src="/images/storefront.jpg"
            alt="Subash Studio storefront"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover object-[right_top]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 3%, black 9%, black 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 3%, black 9%, black 100%)",
            }}
          />
        </div>
      </div>

      {/* =========================================================
          LAYER 3: HERO EDITORIAL CONTENT (Left Column on Desktop) (z-20)
      ========================================================= */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:pl-[10%] lg:pr-8 xl:pl-[10.5%] 2xl:pl-[11%] pt-6 sm:pt-8 lg:pt-16 xl:pt-20 2xl:pt-24 pb-6 sm:pb-8 lg:pb-8 xl:pb-10 flex-1 flex flex-col justify-start">
        <div className="w-full lg:w-[48%] xl:w-[46%] 2xl:w-[44%] flex flex-col justify-start text-left">
          
          {/* Main Editorial Content Group */}
          <div className="flex flex-col justify-start">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="text-[12px] sm:text-[13px] xl:text-[14px] tracking-[0.28em] font-medium text-[#B38F4D] uppercase mb-2.5 sm:mb-3 xl:mb-3.5"
            >
              FINE PHOTOGRAPHY &amp; CINEMATIC FILMS
            </motion.p>

            {/* Main Headline with clamp typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
              className="font-display tracking-tight leading-[0.92]"
            >
              <span
                className="block text-[#1C1B19] font-bold"
                style={{ fontSize: "clamp(2.4rem, 5.2vw, 5.6rem)" }}
              >
                Subash
              </span>
              <span
                className="block text-[#B38F4D] font-normal italic mt-1 sm:mt-1.5 lg:whitespace-nowrap"
                style={{ fontSize: "clamp(2.4rem, 5.2vw, 5.6rem)" }}
              >
                Photography
              </span>
            </motion.h1>

            {/* Editorial Gold Ornament: ── ◆ ── */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.25, 1, 0.5, 1] }}
              className="flex items-center gap-3 my-4 sm:my-5 xl:my-5 origin-left"
              aria-hidden="true"
            >
              <span className="h-[1px] w-12 sm:w-14 bg-[#B38F4D]/50" />
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="text-[#B38F4D] shrink-0 fill-current"
              >
                <path d="M5 0 L10 5 L5 10 L0 5 Z" />
              </svg>
              <span className="h-[1px] w-12 sm:w-14 bg-[#B38F4D]/50" />
            </motion.div>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="text-[#6F6A62] text-[15px] sm:text-[16px] xl:text-[17px] leading-[1.65] max-w-[490px] xl:max-w-[530px] font-normal"
            >
              Preserving timeless heritage, profound emotions, and authentic{" "}
              <br className="hidden sm:inline" />
              human celebrations across generations.
            </motion.p>

            {/* Action Buttons: BOOK A SHOOT & EXPLORE OUR WORK */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 lg:gap-5 mt-6 sm:mt-7 xl:mt-8 w-full sm:w-fit sm:mx-auto lg:mx-0"
            >
              {/* Primary: BOOK A SHOOT (~210px-225px x 52px-58px) */}
              <Link
                to="/contact"
                className="group w-full sm:w-[210px] xl:w-[220px] h-[50px] sm:h-[52px] xl:h-[56px] bg-[#B38F4D] hover:bg-[#9C7B3D] text-white rounded-full text-[12px] font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(179,143,77,0.38)] hover:shadow-lg hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2.5 shrink-0"
              >
                <span>BOOK A SHOOT</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/* Secondary: EXPLORE OUR WORK (~230px-245px x 52px-58px) */}
              <Link
                to="/portfolio"
                className="group w-full sm:w-[230px] xl:w-[240px] h-[50px] sm:h-[52px] xl:h-[56px] bg-[#FAF7F2]/80 hover:bg-[#1C1B19] border border-[#B38F4D]/70 hover:border-[#1C1B19] text-[#1C1B19] hover:text-[#F8F6F2] rounded-full text-[12px] font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2.5 shrink-0"
              >
                <span>EXPLORE OUR WORK</span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>

          {/* =========================================================
              MOBILE / TABLET STOREFRONT PHOTO
              Clean architectural presentation embedded below buttons on small devices.
          ========================================================= */}
          <div className="lg:hidden mt-6 sm:mt-8 relative w-full max-w-md sm:max-w-lg mx-auto overflow-hidden rounded-2xl shadow-xl bg-[#FAF8F5]">
            <img
              src="/images/storefront.jpg"
              alt="Subash Studio storefront"
              className="w-full aspect-square object-cover object-center"
            />
          </div>

          {/* Scroll Down Indicator - Horizontally centered across mobile/tablet and aligned under buttons on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="w-full lg:w-[456px] xl:w-[480px] flex flex-col items-center mx-auto lg:mx-0 gap-2 mt-8 sm:mt-9 xl:mt-10 select-none"
          >
            <span className="text-[10px] xl:text-[11px] tracking-[0.28em] uppercase font-semibold text-[#8C8275]">
              SCROLL DOWN
            </span>
            <button
              type="button"
              onClick={handleScrollDown}
              aria-label="Scroll down to statistics and overview"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#B38F4D]/60 flex items-center justify-center text-[#B38F4D] hover:bg-[#B38F4D] hover:text-white transition-all duration-300 group cursor-pointer"
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
      </div>
    </section>
  );
}
