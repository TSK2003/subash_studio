import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin } from "lucide-react";
import Seo from "../components/Seo";
import { useAdminData } from "../admin/context/AdminDataContext";
import { getLenis } from "../lib/useLenis";

/**
 * AboutReveal — Entrance reveal animation scoped to the About page.
 * Uses ~380ms entrance duration, subtle 16px slide, and responsive viewport margin
 * so reveals start shortly after content enters view without sluggish delays.
 */
function AboutReveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.38,
  className = "",
  as = "div",
}) {
  const Comp = motion[as] || motion.div;
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <Comp
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.25, 1, 0.5, 1],
      }}
      className={className}
    >
      {children}
    </Comp>
  );
}


const DEFAULT_ABOUT = {
  intro: {
    eyebrow: "OUR HERITAGE",
    heroTitle: "About",
    title: "The story behind the lens.",
    subtitle: "A chance beginning. A lifelong passion.",
    backgroundImage: "",
    bannerImage: "",
    imageAlt: "About Subash Studio heritage",
    establishedYear: "1993",
  },
  founder: {
    label: "THE STORY OF THE FOUNDER",
    name: "P. Arunachalam",
    role: "FOUNDER, SUBASH STUDIO",
    descParagraph1: "His story began in a village in the Western Ghats, with just a few cows and goats.",
    descParagraph2: "In 1987, a camera won in a lottery revealed his artistic talent — and became the beginning of a business that would grow to three branches.",
    caption: "Where the journey began.",
    photo1: "/images/about/founder-camera.jpeg",
    photo1Alt: "P. Arunachalam holding an Agfa camera",
    photo2: "/images/about/founder-field.jpeg",
    photo2Alt: "P. Arunachalam in a marigold flower field",
  },
  camera: {
    label: "1987 • THE TURNING POINT",
    heading: "A camera. A new beginning.",
    cameraName: "Agfa Click III",
    description: "An Agfa Click III camera, won in a lottery in 1987, changed his life and helped him discover his artistic skills.",
    image: "",
    imageAlt: "Agfa Click III camera",
  },
  community: {
    label: "2018 • COMMUNITY & LEADERSHIP",
    heading: "Serving the photography community.",
    headingAccent: "community.",
    description: "Became Vice President of the Tirunelveli District Photography Labour Welfare Association.",
    role: "VICE PRESIDENT",
    organization: "Tirunelveli District Photography Labour Welfare Association",
    appointedYear: "Appointed in 2018",
    caption: "P. Arunachalam",
    portrait: "/images/about/founder-field.jpeg",
    portraitAlt: "P. Arunachalam portrait",
  },
  journey: {
    eyebrow: "OUR STUDIO JOURNEY",
    title: "From one studio to a shared legacy.",
    subtitle: "Four milestones. One enduring passion.",
  },
  milestones: [
    {
      id: "m-1993",
      date: "5 February 1993",
      heading: "The first Subash Studio.",
      description: "P. Arunachalam began his career as a professional photographer and opened the first Subash Studio in Kallidaikurichi.",
      quoteLine: "",
      layout: "photo-left",
      image: "/images/about/studio-1993.jpeg",
      imageAlt: "The first Subash Studio in Kallidaikurichi opened in 1993",
    },
    {
      id: "m-2021",
      date: "July 2021",
      heading: "A studio, reimagined.",
      description: "The Kallidaikurichi studio was reconstructed with modern equipment.",
      quoteLine: "",
      layout: "content-left",
      image: "/images/about/studio-2021.jpeg",
      imageAlt: "Reconstructed Kallidaikurichi studio with modern equipment",
    },
    {
      id: "m-2022",
      date: "2022",
      heading: "A partner branch in Chennai.",
      description: "A new chapter through a partner branch in Chennai.",
      quoteLine: "When soul makes love",
      layout: "photo-left",
      image: "",
      imageAlt: "Chennai partner branch",
    },
    {
      id: "m-2026",
      date: "2026",
      heading: "New beginnings in Tirunelveli.",
      description: "Subash Studio opened a new branch in Tirunelveli, continuing the founder's journey.",
      quoteLine: "",
      layout: "content-left",
      image: "/images/about/studio-2026.jpg",
      imageAlt: "Subash Studio Tirunelveli branch",
    },
  ],
  closingSummary: {
    locations: "Kallidaikurichi · Chennai · Tirunelveli",
    tagline: "THREE BRANCHES. ONE SHARED LEGACY.",
  },
};

// Helpers for Section 2: Luxury editorial typography & highlighting
const formatFounderRole = (role) => {
  if (!role) return "FOUNDER   |   SUBASH STUDIO";
  if (role.includes(",")) {
    return role.split(",").map((s) => s.trim()).join("   |   ");
  }
  return role;
};

const renderHighlightedQuote = (text) => {
  if (!text) return null;
  if (text.includes("*")) {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={idx} className="text-[#8C6D46] font-semibold italic">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }
  const highlightWord = "Western Ghats";
  if (text.includes(highlightWord)) {
    const parts = text.split(highlightWord);
    return (
      <>
        {parts[0]}
        <span className="text-[#8C6D46] font-semibold italic">{highlightWord}</span>
        {parts.slice(1).join(highlightWord)}
      </>
    );
  }
  return text;
};

const renderHighlightedParagraph = (text) => {
  if (!text) return null;
  if (text.includes("*")) {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={idx} className="text-[#8C6D46] font-medium italic">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }
  const highlightWord = "three branches";
  if (text.includes(highlightWord)) {
    const parts = text.split(highlightWord);
    return (
      <>
        {parts[0]}
        <span className="text-[#8C6D46] font-medium italic">{highlightWord}</span>
        {parts.slice(1).join(highlightWord)}
      </>
    );
  }
  return text;
};

export default function About() {
  const { websiteContent } = useAdminData();
  const rawAbout = websiteContent?.about || {};

  // Deep-merge with defaults to ensure complete rendering without undefined errors
  const intro = { ...DEFAULT_ABOUT.intro, ...(rawAbout.intro || {}) };
  const founder = { ...DEFAULT_ABOUT.founder, ...(rawAbout.founder || {}) };
  const camera = { ...DEFAULT_ABOUT.camera, ...(rawAbout.camera || {}) };
  const community = { ...DEFAULT_ABOUT.community, ...(rawAbout.community || {}) };
  const journey = { ...DEFAULT_ABOUT.journey, ...(rawAbout.journey || {}) };
  const milestones = Array.isArray(rawAbout.milestones) && rawAbout.milestones.length > 0
    ? rawAbout.milestones
    : DEFAULT_ABOUT.milestones;
  const closingSummary = { ...DEFAULT_ABOUT.closingSummary, ...(rawAbout.closingSummary || {}) };
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <>
      <Seo
        title="About Our Heritage"
        description="The story of SUBASH STUDIO — from an Agfa Click III camera won in 1987 to three branches across Tamil Nadu."
      />

      <div className="text-ink min-h-screen">
        {/* =========================================================================
            SECTION 1: HERO BANNER (Matches Films Hero)
           ========================================================================= */}
        <section className="relative h-[68vh] min-h-[460px] flex items-center justify-center overflow-hidden">
          {intro.backgroundImage || intro.bannerImage ? (
            <img
              src={intro.backgroundImage || intro.bannerImage}
              alt={intro.imageAlt || "About Subash Studio heritage"}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <picture>
              <source srcSet="/images/films.webp" type="image/webp" />
              <img
                src="/images/films.png"
                alt="About Subash Studio heritage"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </picture>
          )}
          <div className="absolute inset-0 bg-ink/65" />
          <div className="relative text-center px-6 max-w-3xl mx-auto">
            <motion.p
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.38, ease: [0.25, 1, 0.5, 1] }}
              className="eyebrow text-gold-light mb-5"
            >
              {intro.eyebrow || "OUR HERITAGE"}
            </motion.p>

            <motion.h1
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.06,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="font-display font-medium text-5xl sm:text-6xl text-bg-soft"
            >
              {intro.heroTitle || "About"}
            </motion.h1>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.12,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="mt-5 max-w-xl mx-auto space-y-1.5 text-center"
            >
              <p className="text-bg-soft text-base sm:text-lg font-light leading-relaxed">
                {intro.title || "The story behind the lens."}
              </p>
              {intro.subtitle && (
                <p className="text-bg-soft/75 text-xs sm:text-sm font-light leading-relaxed tracking-wide">
                  {intro.subtitle}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE STORY OF THE FOUNDER
            (Luxury Editorial Founder Spread matching reference design)
           ========================================================================= */}
        <section className="bg-[#F4EEE5] relative py-20 sm:py-28 lg:py-32 overflow-hidden border-b border-[#E8DEC8]/50">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left: Dual Framed Photo Editorial Composition */}
              <div className="lg:col-span-6 flex justify-center lg:justify-start">
                <AboutReveal>
                  <div className="relative w-full max-w-[460px] pb-10 sm:pb-12 pr-6 sm:pr-8 select-none">
                    {/* Subtle archival backing mat paper peeking behind top-left */}
                    <div
                      aria-hidden="true"
                      className="absolute -top-2.5 -left-2.5 sm:-top-3.5 sm:-left-3.5 w-[80%] sm:w-[78%] aspect-[4/5] bg-[#EAE2D5]/70 rounded-[2px] shadow-sm pointer-events-none -z-10"
                    />

                    {/* Main framed photo: Founder with camera */}
                    <div className="relative w-[80%] sm:w-[78%] aspect-[4/5] bg-white p-3 sm:p-4 shadow-[0_22px_55px_-15px_rgba(35,25,12,0.2),0_4px_12px_rgba(0,0,0,0.04)] rounded-[2px] ring-1 ring-black/[0.04] transition-transform duration-700 ease-out hover:scale-[1.01] z-10">
                      <div className="w-full h-full overflow-hidden bg-[#EDE8DE]">
                        <img
                          src={founder.photo1 || "/images/about/founder-camera.jpeg"}
                          alt={founder.photo1Alt || "P. Arunachalam holding camera"}
                          className="w-full h-full object-cover object-center"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>

                    {/* Secondary overlapping framed photo: Founder in marigold field */}
                    <div className="absolute right-0 bottom-0 w-[44%] sm:w-[42%] aspect-[3/4] bg-white p-2 sm:p-2.5 shadow-[0_24px_50px_-10px_rgba(30,20,10,0.26),0_6px_16px_rgba(0,0,0,0.05)] rounded-[2px] ring-1 ring-black/[0.05] transition-transform duration-700 ease-out hover:scale-[1.02] z-20">
                      <div className="w-full h-full overflow-hidden bg-[#EDE8DE]">
                        <img
                          src={founder.photo2 || "/images/about/founder-field.jpeg"}
                          alt={founder.photo2Alt || "P. Arunachalam in marigold flowers"}
                          className="w-full h-full object-cover object-[center_20%]"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </AboutReveal>
              </div>

              {/* Right: Founder Narrative Content */}
              <div className="lg:col-span-6 text-left">
                <AboutReveal delay={0.06}>
                  {/* Eyebrow heading with flanking decorative divider lines */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <span className="h-[1px] w-10 sm:w-14 bg-[#C5B39E]/80 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#8C6D46] uppercase select-none">
                      {founder.label || "THE STORY OF THE FOUNDER"}
                    </span>
                    <span className="h-[1px] flex-1 max-w-[140px] sm:max-w-[200px] bg-[#C5B39E]/80 shrink-0" aria-hidden="true" />
                  </div>

                  {/* Large luxury serif founder name */}
                  <h2 className="font-['Cormorant_Garamond',_'Fraunces',_serif] text-5xl sm:text-6xl md:text-7xl lg:text-[4.75rem] text-[#1A1815] font-normal tracking-[-0.01em] leading-[1.04] mb-2 sm:mb-2.5">
                    {founder.name}
                  </h2>

                  {/* Uppercase role / studio metadata */}
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#8C6D46] uppercase mb-8 sm:mb-10">
                    {formatFounderRole(founder.role)}
                  </p>

                  {/* Editorial quote block with oversized quotation mark */}
                  {founder.descParagraph1 && (
                    <div className="relative pl-5 sm:pl-6 border-l border-[#C5B39E]/80 mb-6 sm:mb-7">
                      <blockquote className="font-['Cormorant_Garamond',_'Fraunces',_serif] italic text-2xl sm:text-3xl lg:text-[2.05rem] text-[#1A1815] leading-[1.32] tracking-[-0.01em]">
                        <span className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] text-[#8C6D46] not-italic leading-none mr-2 align-top select-none inline-block -mt-1">
                          &ldquo;
                        </span>
                        {renderHighlightedQuote(founder.descParagraph1)}
                      </blockquote>
                    </div>
                  )}

                  {/* Thin divider line below quote */}
                  <div className="w-24 sm:w-28 h-[1px] bg-[#C5B39E]/80 mb-6 sm:mb-7" aria-hidden="true" />

                  {/* Supporting biographical paragraph */}
                  {founder.descParagraph2 && (
                    <p className="text-sm sm:text-base leading-[1.8] text-[#554F46] font-light max-w-xl">
                      {renderHighlightedParagraph(founder.descParagraph2)}
                    </p>
                  )}
                </AboutReveal>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: CAMERA SECTION — 1987 THE TURNING POINT
            (Full-width dark charcoal section, centred visual layout matching reference)
           ========================================================================= */}
        <section className="bg-[#1B1A17] text-[#FAF7F2] py-20 sm:py-28 px-6 border-y border-[#2E2B25] relative overflow-hidden">
          {/* Subtle background ambient glow matching studio reference */}
          <div className="absolute inset-0 bg-radial from-[#C9A669]/5 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <AboutReveal>
              {/* 1. Centred gold year/section label */}
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C9A669] font-semibold mb-4 select-none">
                {camera.label}
              </p>

              {/* 2. Large ivory serif heading with final word in gold italic styling */}
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-[#FAF7F2] font-normal tracking-tight mb-6 sm:mb-8 leading-[1.15]">
                {(() => {
                  const headingStr = camera.heading || "A camera. A new beginning.";
                  const trimmed = headingStr.trim();
                  if (trimmed.includes("*")) {
                    const parts = trimmed.split(/(\*[^*]+\*)/g);
                    return parts.map((part, idx) => {
                      if (part.startsWith("*") && part.endsWith("*")) {
                        return (
                          <span key={idx} className="italic text-[#C9A669] font-serif">
                            {part.slice(1, -1)}
                          </span>
                        );
                      }
                      return <span key={idx}>{part}</span>;
                    });
                  }
                  const words = trimmed.split(" ");
                  if (words.length <= 1) {
                    return <span className="italic text-[#C9A669] font-serif">{trimmed}</span>;
                  }
                  const lastWord = words.pop();
                  return (
                    <>
                      <span>{words.join(" ")} </span>
                      <span className="italic text-[#C9A669] font-serif">{lastWord}</span>
                    </>
                  );
                })()}
              </h2>

              {/* 3. Prominent camera photograph — fixed permanent project asset blending naturally into the dark background */}
              <div className="my-6 sm:my-8 flex items-center justify-center">
                <div
                  className="relative mx-auto w-full px-4 sm:px-0"
                  style={{ maxWidth: "480px" }}
                >
                  <img
                    src="/images/about/agfa-camera-1987.png"
                    alt={camera.cameraName || "Agfa Click III camera"}
                    className="w-full h-auto object-contain block mx-auto select-none pointer-events-none drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              {/* 4. Serif camera name */}
              <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl text-[#FAF7F2] font-medium mb-3 tracking-wide">
                {camera.cameraName}
              </h3>

              {/* 5. Centred readable description */}
              <p className="font-body text-xs sm:text-sm text-[#A8A196] max-w-xl mx-auto leading-relaxed font-light tracking-wide">
                {camera.description}
              </p>
            </AboutReveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: COMMUNITY & LEADERSHIP (2018)
           ========================================================================= */}
        <section className="relative py-20 sm:py-28 lg:py-32 px-6 sm:px-8 lg:px-12 border-b border-[#E7E0D2]/50 bg-[#FAF7F0] overflow-hidden">
          {/* Subtle ambient luxury tones */}
          <div
            className="absolute top-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#E8DCB8]/20 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-[#EEDCB5]/20 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4"
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

              {/* Left: Content (Order: Label + rule, Heading with gold italic accent, Divider, Description) */}
              <AboutReveal>
                <div className="text-left">
                  {/* Gold uppercase label + thin gold horizontal rule */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                    <span className="text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#B89047] font-semibold select-none">
                      {community.label || "2018 • COMMUNITY & LEADERSHIP"}
                    </span>
                    <span className="w-16 sm:w-24 h-px bg-[#C9A669]/60 shrink-0" aria-hidden="true" />
                  </div>

                  {/* Large elegant serif heading with configurable gold italic phrase */}
                  {(() => {
                    const fullHeading = (community.heading || "Serving the photography community.").trim();
                    const accentPhrase = (community.headingAccent || "community.").trim();

                    if (accentPhrase && fullHeading.toLowerCase().includes(accentPhrase.toLowerCase())) {
                      const matchIndex = fullHeading.toLowerCase().indexOf(accentPhrase.toLowerCase());
                      const before = fullHeading.slice(0, matchIndex).trim();
                      const matchedAccent = fullHeading.slice(matchIndex, matchIndex + accentPhrase.length).trim();
                      const after = fullHeading.slice(matchIndex + accentPhrase.length).trim();

                      return (
                        <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[3.75rem] text-[#1E1C19] font-normal tracking-tight leading-[1.08] mb-6">
                          {before && <span className="block">{before}</span>}
                          <span className="block italic text-[#B8863A] font-['Cormorant_Garamond',serif]">
                            {matchedAccent}
                          </span>
                          {after && <span className="block">{after}</span>}
                        </h2>
                      );
                    }

                    return (
                      <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[3.75rem] text-[#1E1C19] font-normal tracking-tight leading-[1.08] mb-6">
                        {fullHeading}
                      </h2>
                    );
                  })()}

                  {/* Short gold divider */}
                  <div className="w-12 h-[2px] bg-[#C9A669] my-6" aria-hidden="true" />

                  {/* Description in readable elegant serif body typography */}
                  <p className="font-['Cormorant_Garamond',serif] text-lg sm:text-xl lg:text-[1.3rem] text-[#3A352E] leading-relaxed font-normal max-w-xl">
                    {community.description || "Became Vice President of the Tirunelveli District Photography Labour Welfare Association."}
                  </p>
                </div>
              </AboutReveal>

              {/* Right: Framed flower-field portrait with offset gold accents */}
              <AboutReveal delay={0.06}>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-[480px]">
                    {/* Layer 1: Behind - Offset thin gold frame border */}
                    <div
                      className="absolute inset-0 translate-x-3.5 translate-y-3.5 sm:translate-x-5 sm:translate-y-5 border border-[#C9A669]/80 pointer-events-none rounded-[1px]"
                      aria-hidden="true"
                    />

                    {/* Layer 2: Behind - Soft ivory shadow matting */}
                    <div
                      className="absolute inset-0 translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3 bg-[#F4EFE6]/70 border border-[#E7E0D2] shadow-[0_12px_32px_rgba(43,43,43,0.08)] pointer-events-none rounded-[1px]"
                      aria-hidden="true"
                    />

                    {/* Layer 3: Foreground - Classic ivory/white photograph mount with nearly square corners */}
                    <div className="relative bg-[#FFFFFF] p-3 sm:p-4 shadow-[0_16px_40px_rgba(43,43,43,0.14)] border border-[#EBE3D5] rounded-[2px]">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#EDE8DE] rounded-[1px]">
                        <img
                          src={community.portrait || "/images/about/founder-field.jpeg"}
                          alt={community.portraitAlt || "P. Arunachalam in flower field"}
                          className="w-full h-full object-cover object-[center_18%]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AboutReveal>

            </div>
          </div>
        </section>

        <TimelineSection
          milestones={milestones}
          journey={journey}
          closingSummary={closingSummary}
        />
      </div>
    </>
  );
}


/**
 * ============================================================================
 * TimelineSection — scroll-driven progress fill animation
 *
 * Strategy:
 *  - Track div is a static muted rail (existing design).
 *  - A progress div overlaid on the same rail is mutated directly via ref
 *    (no React state on every frame — avoids re-renders).
 *  - Active milestone index is tracked in a ref; React setState is called
 *    only when it changes so dot styles update cheaply.
 *  - Lenis is detected from the module-level singleton via lenis.on('scroll').
 *    Falls back to window 'scroll' event if Lenis is not active.
 *  - ResizeObserver + image load events trigger remeasurement.
 *  - prefers-reduced-motion: transition is set to 'none'.
 * ============================================================================
 */
function TimelineSection({ milestones, journey, closingSummary }) {
  // Rails & progress bar refs
  const railRef = useRef(null); // wraps the entire milestone list
  const desktopTrackRef = useRef(null); // background track (desktop centre rail)
  const mobileTrackRef = useRef(null); // background track (mobile left rail)
  const progressDesktopRef = useRef(null); // dark foreground fill (desktop)
  const progressMobileRef = useRef(null); // dark foreground fill (mobile)

  // Per-milestone dot refs [{ desktop, mobile }]
  const dotRefs = useRef([]);

  // Active milestone index tracked to update dot styling only when changed
  const activeIdxStateRef = useRef(-1);

  // Detect reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // ── Measurement & progress calculation from actual rail geometry ─────────
  const updateProgress = useCallback(() => {
    if (typeof window === "undefined") return;

    // Determine active track based on viewport width
    const isMobile = window.innerWidth < 768;
    const trackEl = (isMobile ? mobileTrackRef.current : desktopTrackRef.current) || railRef.current;
    if (!trackEl) return;

    const railRect = trackEl.getBoundingClientRect();
    // Guard against zero-height measurements
    if (!railRect || railRect.height <= 0) return;

    // Reading anchor around 70–75% of viewport height (starts as timeline enters view)
    const anchorY = window.innerHeight * 0.73;

    // progress = clamp((anchorY - railRect.top) / railRect.height, 0, 1)
    const rawProgress = (anchorY - railRect.top) / railRect.height;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Update full-height dark overlay vertical scale directly — no transition delay
    if (progressDesktopRef.current) {
      progressDesktopRef.current.style.transform = `scaleY(${progress})`;
    }
    if (progressMobileRef.current) {
      progressMobileRef.current.style.transform = `scaleY(${progress})`;
    }

    // Determine reached dots using the exact same reading anchor and actual dot positions
    let lastReached = -1;
    dotRefs.current.forEach((ref, i) => {
      const el = (isMobile ? ref?.mobile : ref?.desktop) || ref?.desktop || ref?.mobile;
      if (!el) return;
      const dotRect = el.getBoundingClientRect();
      const dotCenterY = dotRect.top + dotRect.height / 2;
      if (dotCenterY <= anchorY) {
        lastReached = i;
      }
    });

    if (lastReached !== activeIdxStateRef.current) {
      activeIdxStateRef.current = lastReached;
      dotRefs.current.forEach((ref, i) => {
        const state = i < lastReached ? "reached" : i === lastReached ? "active" : "future";
        applyDotState(ref?.desktop, state, prefersReducedMotion);
        applyDotState(ref?.mobile, state, prefersReducedMotion);
      });
    }
  }, [prefersReducedMotion]);

  // ── Scroll & Lenis listener integration ───────────────────────────────────
  useEffect(() => {
    let attachedLenis = null;
    let usingWindow = false;

    const setupListener = () => {
      const lenis = getLenis();
      if (lenis && typeof lenis.on === "function") {
        attachedLenis = lenis;
        lenis.on("scroll", updateProgress);
      } else {
        usingWindow = true;
        window.addEventListener("scroll", updateProgress, { passive: true });
      }
    };

    setupListener();

    // Check if Lenis mounted slightly after component mount (e.g. root App mount)
    const upgradeTimer = setTimeout(() => {
      if (!attachedLenis) {
        const lenis = getLenis();
        if (lenis && typeof lenis.on === "function") {
          if (usingWindow) {
            window.removeEventListener("scroll", updateProgress);
            usingWindow = false;
          }
          attachedLenis = lenis;
          lenis.on("scroll", updateProgress);
        }
      }
    }, 50);

    return () => {
      clearTimeout(upgradeTimer);
      if (attachedLenis && typeof attachedLenis.off === "function") {
        attachedLenis.off("scroll", updateProgress);
      }
      if (usingWindow) {
        window.removeEventListener("scroll", updateProgress);
      }
    };
  }, [updateProgress]);

  // ── Initial mount & restored scroll position ──────────────────────────────
  useEffect(() => {
    // Initial measurement immediately and on next animation frames for stabilized layout
    updateProgress();
    const rafId = requestAnimationFrame(updateProgress);
    const timer = setTimeout(updateProgress, 120);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [updateProgress]);

  // ── Resize handling & ResizeObserver ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => updateProgress();
    window.addEventListener("resize", handleResize, { passive: true });

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateProgress();
      });
      if (railRef.current) ro.observe(railRef.current);
      if (document.body) ro.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, [updateProgress]);

  // ── Image load events (milestone photographs change rail height) ──────────
  useEffect(() => {
    if (!railRef.current) return;
    const imgs = railRef.current.querySelectorAll("img");
    const cleanupHandlers = [];

    imgs.forEach((img) => {
      if (!img.complete) {
        const onImgLoad = () => updateProgress();
        img.addEventListener("load", onImgLoad, { once: true });
        img.addEventListener("error", onImgLoad, { once: true });
        cleanupHandlers.push(() => {
          img.removeEventListener("load", onImgLoad);
          img.removeEventListener("error", onImgLoad);
        });
      }
    });

    return () => {
      cleanupHandlers.forEach((fn) => fn());
    };
  }, [milestones, updateProgress]);

  // ── Build dot ref callback ────────────────────────────────────────────────
  const setDotRef = (idx, which) => (el) => {
    if (!dotRefs.current[idx]) dotRefs.current[idx] = {};
    dotRefs.current[idx][which] = el;
  };

  return (
    <section className="py-20 sm:py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Timeline Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <AboutReveal>
            <p className="text-xs uppercase tracking-[0.28em] text-[#9C7B3D] font-bold mb-3">
              {journey.eyebrow}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink font-normal tracking-tight mb-3">
              {journey.title}
            </h2>
            <p className="text-sm sm:text-base text-ink-soft font-light">
              {journey.subtitle}
            </p>
          </AboutReveal>
        </div>

        {/* Timeline Rail */}
        <div className="relative" ref={railRef}>

          {/* ── DESKTOP CENTRE RAIL ─────────────────────────────────────── */}
          {/* Background track — muted gold, always fully visible */}
          <div
            ref={desktopTrackRef}
            className="hidden md:block absolute top-4 bottom-4 w-[2px] bg-[#C9A669]/30"
            style={{ left: "calc(50% - 1px)" }}
            aria-hidden="true"
          />
          {/* Progress overlay — dark foreground fill, scale driven by scroll */}
          <div
            ref={progressDesktopRef}
            className="hidden md:block absolute top-4 bottom-4 w-[2px] z-10 origin-top pointer-events-none"
            style={{
              left: "calc(50% - 1px)",
              transform: "scaleY(0)",
              transformOrigin: "top",
              background: "linear-gradient(to bottom, #3A3530, #5C4F3A)",
              willChange: "transform",
            }}
            aria-hidden="true"
          />

          {/* ── MOBILE LEFT RAIL ────────────────────────────────────────── */}
          {/* Background track */}
          <div
            ref={mobileTrackRef}
            className="md:hidden absolute left-5 top-4 bottom-4 w-[2px] bg-[#C9A669]/30"
            aria-hidden="true"
          />
          {/* Progress overlay — dark foreground fill, scale driven by scroll */}
          <div
            ref={progressMobileRef}
            className="md:hidden absolute left-5 top-4 bottom-4 w-[2px] z-10 origin-top pointer-events-none"
            style={{
              transform: "scaleY(0)",
              transformOrigin: "top",
              background: "linear-gradient(to bottom, #3A3530, #5C4F3A)",
              willChange: "transform",
            }}
            aria-hidden="true"
          />

          <div className="space-y-12 sm:space-y-20">
            {milestones.map((milestone, idx) => {
              const isPhotoLeft =
                milestone.layout === "photo-left" ||
                (milestone.layout === undefined && idx % 2 === 0);

              return (
                <AboutReveal key={milestone.id || `ms-${idx}`} delay={0}>
                  <div className="relative">
                    {/* Milestone Node Dot (Desktop) */}
                    <div
                      ref={setDotRef(idx, "desktop")}
                      className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-[#FAF7F2] border-2 shadow-sm items-center justify-center"
                      style={{
                        borderColor: "#C9A669",
                        transition: prefersReducedMotion ? "none" : "border-color 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#C9A669",
                          transition: prefersReducedMotion ? "none" : "background 0.2s, transform 0.2s",
                        }}
                      />
                    </div>

                    {/* Milestone Node Dot (Mobile) */}
                    <div
                      ref={setDotRef(idx, "mobile")}
                      className="md:hidden absolute left-5 top-8 -translate-x-1/2 z-20 w-3.5 h-3.5 rounded-full bg-[#FAF7F2] border-2 shadow-sm items-center justify-center"
                      style={{
                        borderColor: "#C9A669",
                        transition: prefersReducedMotion ? "none" : "border-color 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: "#C9A669",
                          transition: prefersReducedMotion ? "none" : "background 0.2s, transform 0.2s",
                        }}
                      />
                    </div>

                    {/* Desktop: 2-column alternating grid / Mobile: side-rail */}
                    <div className="md:grid md:grid-cols-2 md:gap-16 items-center pl-12 md:pl-0">
                      {/* Left Column */}
                      <div
                        className={`mb-6 md:mb-0 ${
                          isPhotoLeft
                            ? "md:pr-10 flex justify-center md:justify-end"
                            : "md:pr-10 md:text-right"
                        }`}
                      >
                        {isPhotoLeft ? (
                          <MilestonePhotoCard milestone={milestone} />
                        ) : (
                          <MilestoneContentBlock milestone={milestone} align="right" />
                        )}
                      </div>

                      {/* Right Column */}
                      <div
                        className={`${
                          isPhotoLeft
                            ? "md:pl-10 md:text-left"
                            : "md:pl-10 flex justify-center md:justify-start"
                        }`}
                      >
                        {isPhotoLeft ? (
                          <MilestoneContentBlock milestone={milestone} align="left" />
                        ) : (
                          <MilestonePhotoCard milestone={milestone} />
                        )}
                      </div>
                    </div>
                  </div>
                </AboutReveal>
              );
            })}
          </div>
        </div>

        {/* ── CLOSING LOCATION SUMMARY ────────────────────────────────── */}
        <div className="mt-24 sm:mt-32 pt-16 border-t border-line/60 text-center max-w-2xl mx-auto">
          <AboutReveal>
            <div className="flex items-center justify-center gap-2 mb-3 text-[#9C7B3D]">
              <MapPin size={18} />
              <p className="font-display text-2xl sm:text-3xl text-ink font-medium tracking-tight">
                {closingSummary.locations}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C7B3D] font-bold">
              {closingSummary.tagline}
            </p>
          </AboutReveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Apply dot visual state: future / reached / active
 * Mutates style directly — keeps scroll-driven updates off React's scheduler.
 */
function applyDotState(el, state, prefersReducedMotion = false) {
  if (!el) return;
  const inner = el.firstElementChild;

  if (state === "active") {
    el.style.borderColor = "#9C7B3D";
    el.style.boxShadow   = "0 0 0 3px rgba(201,166,105,0.35)";
    if (inner) {
      inner.style.background  = "#9C7B3D";
      inner.style.transform   = prefersReducedMotion ? "none" : "scale(1.35)";
    }
  } else if (state === "reached") {
    el.style.borderColor = "#3A3530";
    el.style.boxShadow   = "none";
    if (inner) {
      inner.style.background  = "#3A3530";
      inner.style.transform   = "scale(1)";
    }
  } else {
    // future
    el.style.borderColor = "#C9A669";
    el.style.boxShadow   = "none";
    if (inner) {
      inner.style.background  = "#C9A669";
      inner.style.transform   = "scale(1)";
    }
  }
}

/**
 * Milestone Content Block Component
 */
function MilestoneContentBlock({ milestone, align = "left" }) {
  const isRight = align === "right";

  return (
    <div className={`max-w-md ${isRight ? "md:ml-auto" : "md:mr-auto"}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-[#9C7B3D] font-bold mb-2">
        {milestone.date}
      </p>

      <h3 className="font-display text-2xl sm:text-3xl text-ink font-normal tracking-tight mb-3">
        {milestone.heading}
      </h3>

      <p className="text-sm sm:text-base text-[#4A453E] leading-relaxed font-light">
        {milestone.description}
      </p>

      {milestone.quoteLine && (
        <p className="font-['Alex_Brush',_cursive] text-2xl sm:text-3xl text-[#7E7465] mt-4 tracking-wide">
          {milestone.quoteLine}
        </p>
      )}
    </div>
  );
}

/**
 * Milestone Photo Card Component
 */
function MilestonePhotoCard({ milestone }) {
  if (milestone.image) {
    return (
      <div className="rounded-xl overflow-hidden shadow-card border border-line/70 bg-white max-w-sm sm:max-w-md w-full aspect-[4/3] group">
        <img
          src={milestone.image}
          alt={milestone.imageAlt || milestone.heading}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Elegant placeholder for milestones without an image (e.g. Chennai branch)
  return (
    <div className="rounded-xl border-2 border-dashed border-[#C9A669]/40 bg-[#FAF7F2] p-8 max-w-sm sm:max-w-md w-full aspect-[4/3] flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-[#C9A669]/10 flex items-center justify-center mb-3 text-[#9C7B3D]">
        <Camera size={26} strokeWidth={1.5} />
      </div>
      <p className="font-display text-lg text-ink font-medium mb-1">
        {milestone.heading || "Chennai partner branch"}
      </p>
      <p className="font-['Alex_Brush',_cursive] text-xl text-[#8E8373]">
        Photo to be added
      </p>
    </div>
  );
}
