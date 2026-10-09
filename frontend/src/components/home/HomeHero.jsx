import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Video, Camera, Calendar } from "lucide-react";

/**
 * HomeHero
 *
 * Clean, isolated first viewport for SUBASH STUDIO.
 * - Left side: Luxury editorial content with serif "Subash" + gold script "Studio"
 * - Buttons: "EXPLORE OUR STORY →" (to /about) and "BOOK A SESSION →" (to /contact)
 * - Service Row: Wedding Photography, Cinematic Films, Portraits, Events
 * - Right side: Real SUBASH STUDIO storefront building with full visibility
 * - Clean document flow: No overlapping layers, no duplicate navbars, no ghosted CTA/footer
 */
export default function HomeHero() {
  return (
    <section
      className="home-hero relative z-[1] w-full min-h-[calc(100svh-84px)] lg:min-h-[640px] lg:h-[clamp(650px,50vw,880px)] flex flex-col justify-between overflow-hidden bg-[#FAF7F2] border-b border-[#E7E0D2]/80"
      style={{ isolation: "isolate" }}
      aria-label="Subash Studio Welcome"
    >
      {/* =========================================================
          BACKGROUND / RIGHT STOREFRONT IMAGE LAYER (Desktop >= 1024px)
          Seamless feather blend on left edge, building 100% sharp
      ========================================================= */}
      <div
        className="hidden lg:flex absolute right-0 bottom-0 top-0 w-[58%] max-w-[920px] items-end justify-end pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="relative h-full w-full flex items-end justify-end"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 10%, rgba(0,0,0,0.75) 24%, rgba(0,0,0,1) 38%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 10%, rgba(0,0,0,0.75) 24%, rgba(0,0,0,1) 38%)",
          }}
        >
          <img
            src="/images/storefront.jpg"
            alt="Real SUBASH STUDIO building"
            className="h-[98%] max-h-[770px] w-auto object-contain object-right-bottom block"
            loading="eager"
          />
        </div>
      </div>

      {/* =========================================================
          HERO CONTENT LAYER (z-index: 2)
      ========================================================= */}
      <div className="hero-content relative z-[2] w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:pl-16 xl:pl-20 lg:pr-10 pt-8 sm:pt-12 lg:pt-14 pb-8 lg:pb-12 flex-1 flex flex-col justify-center">
        <div className="w-full lg:w-[46%] xl:w-[45%] flex flex-col justify-center text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-2.5 mb-3"
          >
            <span className="h-[1px] w-6 bg-[#B78A3D]/60" />
            <p className="text-[11px] sm:text-[12px] xl:text-[13px] tracking-[0.28em] font-semibold text-[#B78A3D] uppercase">
              FINE PHOTOGRAPHY &amp; CINEMATIC FILMS
            </p>
            <span className="h-[1px] w-6 bg-[#B78A3D]/60" />
          </motion.div>

          {/* Heading Display */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
            className="font-display tracking-tight leading-[0.92] mb-4 sm:mb-5"
          >
            <span
              className="block text-[#181715] font-serif font-bold text-5xl sm:text-6xl lg:text-[68px] xl:text-[76px]"
            >
              Subash
            </span>
            <span
              className="block text-[#B78A3D] italic font-normal text-5xl sm:text-6xl lg:text-[72px] xl:text-[80px] -mt-1 sm:-mt-2 pl-2 sm:pl-3 font-serif"
            >
              Studio
            </span>
          </motion.h1>

          {/* Elegant Ornament Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-3 mb-5 origin-left"
            aria-hidden="true"
          >
            <span className="h-[1px] w-12 bg-[#B78A3D]/40" />
            <span className="text-[#B78A3D] text-[11px]">✦</span>
            <span className="h-[1px] w-12 bg-[#B78A3D]/40" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="text-[#4A463F] text-[15px] sm:text-[16px] xl:text-[17px] leading-[1.65] max-w-[480px] font-normal mb-8"
          >
            Preserving your most precious moments with timeless photography, cinematic films and heartfelt storytelling.
          </motion.p>

          {/* Buttons: EXPLORE OUR STORY & BOOK A SESSION */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-8 sm:mb-10"
          >
            {/* Primary Button -> /about */}
            <Link
              to="/about"
              className="group h-[50px] sm:h-[52px] px-7 sm:px-8 bg-[#B78A3D] hover:bg-[#A0762E] text-white rounded-full text-[12px] font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_6px_20px_-4px_rgba(183,138,61,0.4)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2.5 shrink-0"
            >
              <span>EXPLORE OUR STORY</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1 shrink-0"
              />
            </Link>

            {/* Secondary Button -> /contact */}
            <Link
              to="/contact"
              className="group h-[50px] sm:h-[52px] px-7 sm:px-8 bg-[#FAF7F2]/90 hover:bg-[#181715] border border-[#181715] text-[#181715] hover:text-white rounded-full text-[12px] font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2.5 shrink-0"
            >
              <span>BOOK A SESSION</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1 shrink-0"
              />
            </Link>
          </motion.div>

          {/* Services Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease: [0.25, 1, 0.5, 1] }}
            className="pt-5 border-t border-[#B78A3D]/25 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 max-w-[500px]"
          >
            <div className="flex flex-col items-start pr-2 sm:border-r border-[#B78A3D]/25">
              <Heart size={16} className="text-[#B78A3D] mb-1.5" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#181715] uppercase leading-tight">
                WEDDING<br />PHOTOGRAPHY
              </span>
            </div>

            <div className="flex flex-col items-start px-2 sm:border-r border-[#B78A3D]/25">
              <Video size={16} className="text-[#B78A3D] mb-1.5" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#181715] uppercase leading-tight">
                CINEMATIC<br />FILMS
              </span>
            </div>

            <div className="flex flex-col items-start px-2 sm:border-r border-[#B78A3D]/25">
              <Camera size={16} className="text-[#B78A3D] mb-1.5" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#181715] uppercase leading-tight">
                PORTRAITS
              </span>
            </div>

            <div className="flex flex-col items-start pl-2">
              <Calendar size={16} className="text-[#B78A3D] mb-1.5" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#181715] uppercase leading-tight">
                EVENTS
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================
          MOBILE / TABLET STOREFRONT BUILDING IMAGE (< 1024px)
          Clean stacked presentation sitting below content
      ========================================================= */}
      <div className="lg:hidden w-full px-6 pb-8 pt-2">
        <div className="relative max-w-[540px] mx-auto rounded-2xl overflow-hidden shadow-xl border border-[#E7E0D2]/90 bg-white">
          <img
            src="/images/storefront.jpg"
            alt="Real Subash Studio Storefront Building"
            className="w-full h-auto object-contain max-h-[460px] mx-auto block"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
