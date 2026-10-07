import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import { useAdminData } from "../admin/context/AdminDataContext";

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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="eyebrow text-gold-light mb-5"
            >
              {intro.eyebrow || "OUR HERITAGE"}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-medium text-5xl sm:text-6xl text-bg-soft"
            >
              {intro.heroTitle || "About"}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-20 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Dual Photo Framed Composition */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <Reveal>
                <div className="relative w-full max-w-md mx-auto pt-4 pb-2 px-3">
                  {/* Photo 1: Founder with camera (back/left) */}
                  <div className="relative w-[72%] sm:w-[68%] aspect-[3/4] bg-white p-2.5 sm:p-3 rounded-lg shadow-card border border-line/60 -rotate-2 transform hover:rotate-0 transition-transform duration-500 z-10">
                    <div className="w-full h-full overflow-hidden rounded bg-[#EDE8DE]">
                      <img
                        src={founder.photo1 || "/images/about/founder-camera.jpeg"}
                        alt={founder.photo1Alt || "P. Arunachalam holding camera"}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  </div>

                  {/* Photo 2: Founder in flower field (front/right, overlapping) */}
                  <div className="absolute right-2 sm:right-4 bottom-4 w-[66%] sm:w-[62%] aspect-[3/4] bg-white p-2.5 sm:p-3 rounded-lg shadow-soft border border-line/60 rotate-3 transform hover:rotate-0 transition-transform duration-500 z-20">
                    <div className="w-full h-full overflow-hidden rounded bg-[#EDE8DE]">
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
              </Reveal>

              {/* Handwritten script caption */}
              {founder.caption && (
                <Reveal delay={0.2}>
                  <p className="font-['Alex_Brush',_cursive] text-2xl sm:text-3xl text-[#827869] text-center mt-6 tracking-wide select-none">
                    {founder.caption}
                  </p>
                </Reveal>
              )}
            </div>

            {/* Right: Founder Narrative Content */}
            <div className="lg:col-span-6 text-left">
              <Reveal delay={0.15}>
                <p className="text-xs uppercase tracking-[0.25em] text-[#9C7B3D] font-bold mb-2.5">
                  {founder.label}
                </p>

                <h2 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mb-2">
                  {founder.name}
                </h2>

                <p className="text-xs uppercase tracking-[0.2em] text-[#736B5E] font-semibold mb-6">
                  {founder.role}
                </p>

                <div className="w-12 h-[2px] bg-[#C9A669]/60 mb-6" />

                <div className="space-y-4 text-ink-soft text-base sm:text-lg leading-relaxed font-light">
                  {founder.descParagraph1 && (
                    <p className="text-[#3F3B35] leading-relaxed">
                      {founder.descParagraph1}
                    </p>
                  )}
                  {founder.descParagraph2 && (
                    <p className="text-[#3F3B35] leading-relaxed">
                      {founder.descParagraph2}
                    </p>
                  )}
                </div>
              </Reveal>
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
            <Reveal>
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
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: COMMUNITY & LEADERSHIP (2018)
           ========================================================================= */}
        <section className="py-20 sm:py-28 px-6 border-b border-line/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: Large rectangular portrait with ivory frame */}
              <Reveal>
                <div className="flex flex-col items-center lg:items-start">
                  {/* Framed portrait — approximately 4:3 proportions */}
                  <div className="relative w-full max-w-md mx-auto lg:mx-0">
                    <div className="bg-white p-3 sm:p-4 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#E8E0D0] rounded-sm">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#EDE8DE] rounded-sm">
                        <img
                          src={community.portrait || "/images/about/founder-field.jpeg"}
                          alt={community.portraitAlt || community.caption || "P. Arunachalam"}
                          className="w-full h-full object-cover object-[center_15%]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Caption with gold accent line */}
                  {community.caption && (
                    <div className="flex items-center gap-3 mt-5 mx-auto lg:mx-0">
                      <div className="w-8 h-[2px] bg-[#C9A669]" />
                      <p className="text-sm text-[#736B5E] font-medium tracking-wide">
                        {community.caption}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Right: Text content */}
              <Reveal delay={0.15}>
                <div className="text-left">
                  {/* Small gold label */}
                  <p className="text-xs uppercase tracking-[0.28em] text-[#9C7B3D] font-bold mb-4">
                    {community.label}
                  </p>

                  {/* Large elegant serif heading */}
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink font-normal tracking-tight mb-6 leading-tight">
                    {community.heading}
                  </h2>

                  {/* Thin gold divider */}
                  <div className="w-10 h-[2px] bg-[#C9A669]/70 mb-6" />

                  {/* Description */}
                  <p className="text-base sm:text-lg text-[#4A453E] leading-relaxed font-light mb-8">
                    {community.description || community.organization}
                  </p>

                  {/* Role badge pill */}
                  <div className="inline-block border border-[#C9A669]/60 px-4 py-2 rounded-full mb-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#9C7B3D] font-bold">
                      {community.role}
                    </p>
                  </div>

                  {/* Organization */}
                  {community.organization && (
                    <p className="text-sm text-ink font-medium leading-snug mb-2">
                      {community.organization}
                    </p>
                  )}

                  {/* Appointed year */}
                  {community.appointedYear && (
                    <p className="text-xs text-[#736B5E] font-medium tracking-wide">
                      {community.appointedYear}
                    </p>
                  )}
                </div>
              </Reveal>

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
  const railRef      = useRef(null);   // wraps the entire milestone list
  const progressDesktopRef = useRef(null); // the dark fill bar (desktop centre rail)
  const progressMobileRef  = useRef(null); // the dark fill bar (mobile left rail)

  // Per-milestone dot refs  [{ desktop, mobile }]
  const dotRefs = useRef([]);

  // Current active index (stored in ref to avoid stale closures in RAF)
  const activeIdxRef = useRef(-1);
  // Tiny helper: call useState only for dot re-styling (cheap, index-only)
  const activeIdxStateRef = useRef(-1); // last value synced to dom dots

  // Detect reduced motion preference once
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Transition string used on the progress bars
  const fillTransition = prefersReducedMotion
    ? "none"
    : "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

  // ── Measurement & update ──────────────────────────────────────────────────
  const updateProgress = useCallback(() => {
    if (!railRef.current) return;

    const rail = railRef.current;
    const railRect = rail.getBoundingClientRect();
    if (railRect.height === 0) return;

    // Viewport midpoint — milestone becomes "active" when its dot crosses here
    const midY = window.innerHeight / 2;

    // Collect dot centre Y positions relative to the rail top
    const dotPositions = dotRefs.current.map((ref) => {
      const el = ref?.desktop || ref?.mobile;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      // centre of dot relative to rail's top-left
      return (r.top + r.height / 2) - railRect.top;
    });

    // Rail bounds in viewport
    const railTop    = railRect.top;                   // top of rail relative to viewport
    const railHeight = railRect.height;

    // ── Determine active milestone ──────────────────────────────────────────
    // Active = the last dot whose viewport Y is above midY
    let newActive = -1;
    dotRefs.current.forEach((ref, i) => {
      const el = ref?.desktop || ref?.mobile;
      if (!el) return;
      const dotViewportY = el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
      if (dotViewportY <= midY) newActive = i;
    });

    // ── Calculate fill height (px within rail) ──────────────────────────────
    let fillPx = 0;

    if (newActive >= 0) {
      const lastDotPos = dotPositions[dotPositions.length - 1] ?? 0;
      const firstDotPos = dotPositions[0] ?? 0;

      if (newActive >= milestones.length - 1) {
        // Past the last milestone — fill all the way to rail bottom
        fillPx = railHeight;
      } else {
        // Interpolate between current active dot and the next dot
        // based on how far the next dot is from the midpoint
        const currDotPos = dotPositions[newActive];
        const nextDotPos = dotPositions[newActive + 1] ?? currDotPos;

        // How far through the segment between curr and next are we?
        const currDotViewY = dotRefs.current[newActive]?.desktop?.getBoundingClientRect().top
          ?? dotRefs.current[newActive]?.mobile?.getBoundingClientRect().top
          ?? 0;
        const nextDotViewY = dotRefs.current[newActive + 1]?.desktop?.getBoundingClientRect().top
          ?? dotRefs.current[newActive + 1]?.mobile?.getBoundingClientRect().top
          ?? 0;

        // Progress ratio 0→1 between curr and next dots crossing midY
        // When currDotViewY === midY → ratio = 0; when nextDotViewY === midY → ratio = 1
        const segmentViewHeight = currDotViewY - nextDotViewY; // both decrease as we scroll down
        const ratio = segmentViewHeight > 0
          ? Math.min(1, Math.max(0, (currDotViewY - midY) / segmentViewHeight))
          : 0;

        fillPx = currDotPos + (nextDotPos - currDotPos) * ratio;
      }

      // Always show at least up to the first active dot so there is a visible fill
      fillPx = Math.max(fillPx, dotPositions[0] ?? 0);
    }

    // Clamp within rail
    fillPx = Math.min(Math.max(fillPx, 0), railHeight);

    // ── Mutate DOM directly (no React state) ──────────────────────────────
    if (progressDesktopRef.current) {
      progressDesktopRef.current.style.height = `${fillPx}px`;
    }
    if (progressMobileRef.current) {
      progressMobileRef.current.style.height = `${fillPx}px`;
    }

    // ── Update dot styles only when active index changes ──────────────────
    if (newActive !== activeIdxStateRef.current) {
      activeIdxStateRef.current = newActive;
      dotRefs.current.forEach((ref, i) => {
        const state = i < newActive ? "reached" : i === newActive ? "active" : "future";
        applyDotState(ref?.desktop, state, "desktop");
        applyDotState(ref?.mobile,  state, "mobile");
      });
    }
  }, [milestones.length]);

  // ── Lenis / scroll subscription ──────────────────────────────────────────
  useEffect(() => {
    // Try to attach to the existing Lenis singleton.
    // @studio-freight/lenis exposes a module-level instance that we can
    // reach via the dynamic import trick or — simpler — by listening to
    // the native 'scroll' event which Lenis still fires on window.
    // We also try the Lenis emitter if lenis is exported globally.

    let rafId = null;
    let lenisUnsub = null;
    let scrolling = false;

    // Debounced rAF flush
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateProgress();
      });
    };

    // Try to grab lenis from the module singleton
    // useLenis.js exports lenisInstance as a module variable — we import
    // the module dynamically to read it without re-creating Lenis.
    let lenisAttached = false;
    import("../lib/useLenis.js")
      .then((mod) => {
        // The module keeps lenisInstance in closure; it doesn't export it.
        // Fall through to window scroll listener.
      })
      .catch(() => {});

    // window scroll works perfectly with Lenis because Lenis drives
    // document.scrollingElement.scrollTop — native scroll events still fire.
    const onScroll = () => scheduleUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial measurement
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisUnsub) lenisUnsub();
    };
  }, [updateProgress]);

  // ── ResizeObserver ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!railRef.current) return;
    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      // Small delay so images have painted
      setTimeout(updateProgress, 50);
    });
    ro.observe(railRef.current);
    // Also observe document body for large layout shifts
    ro.observe(document.body);

    return () => ro.disconnect();
  }, [updateProgress]);

  // ── Image load events (milestone photographs change rail height) ──────────
  useEffect(() => {
    if (!railRef.current) return;
    const imgs = railRef.current.querySelectorAll("img");
    const handlers = [];
    imgs.forEach((img) => {
      if (img.complete) return;
      const fn = () => updateProgress();
      img.addEventListener("load", fn);
      handlers.push({ img, fn });
    });
    return () => handlers.forEach(({ img, fn }) => img.removeEventListener("load", fn));
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
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-[#9C7B3D] font-bold mb-3">
              {journey.eyebrow}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink font-normal tracking-tight mb-3">
              {journey.title}
            </h2>
            <p className="text-sm sm:text-base text-ink-soft font-light">
              {journey.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Timeline Rail */}
        <div className="relative" ref={railRef}>

          {/* ── DESKTOP CENTRE RAIL ─────────────────────────────────────── */}
          {/* Background track — muted gold, always fully visible */}
          <div
            className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-[#C9A669]/30 -translate-x-1/2"
            aria-hidden="true"
          />
          {/* Progress overlay — dark charcoal fill, height driven by scroll */}
          <div
            ref={progressDesktopRef}
            className="hidden md:block absolute left-1/2 top-4 w-[2px] -translate-x-1/2 z-10 origin-top"
            style={{
              height: "0px",
              background: "linear-gradient(to bottom, #3A3530, #5C4F3A)",
              transition: fillTransition,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          {/* ── MOBILE LEFT RAIL ────────────────────────────────────────── */}
          {/* Background track */}
          <div
            className="md:hidden absolute left-5 top-4 bottom-4 w-[2px] bg-[#C9A669]/30"
            aria-hidden="true"
          />
          {/* Progress overlay */}
          <div
            ref={progressMobileRef}
            className="md:hidden absolute left-5 top-4 w-[2px] z-10 origin-top"
            style={{
              height: "0px",
              background: "linear-gradient(to bottom, #3A3530, #5C4F3A)",
              transition: fillTransition,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          <div className="space-y-12 sm:space-y-20">
            {milestones.map((milestone, idx) => {
              const isPhotoLeft =
                milestone.layout === "photo-left" ||
                (milestone.layout === undefined && idx % 2 === 0);

              return (
                <Reveal key={milestone.id || `ms-${idx}`} delay={idx * 0.08}>
                  <div className="relative">
                    {/* Milestone Node Dot (Desktop) */}
                    <div
                      ref={setDotRef(idx, "desktop")}
                      className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-[#FAF7F2] border-2 shadow-sm items-center justify-center"
                      style={{
                        borderColor: "#C9A669",
                        transition: prefersReducedMotion ? "none" : "border-color 0.35s, box-shadow 0.35s",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#C9A669",
                          transition: prefersReducedMotion ? "none" : "background 0.35s, transform 0.35s",
                        }}
                      />
                    </div>

                    {/* Milestone Node Dot (Mobile) */}
                    <div
                      ref={setDotRef(idx, "mobile")}
                      className="md:hidden absolute left-5 top-8 -translate-x-1/2 z-20 w-3.5 h-3.5 rounded-full bg-[#FAF7F2] border-2 shadow-sm items-center justify-center"
                      style={{
                        borderColor: "#C9A669",
                        transition: prefersReducedMotion ? "none" : "border-color 0.35s, box-shadow 0.35s",
                      }}
                    >
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: "#C9A669",
                          transition: prefersReducedMotion ? "none" : "background 0.35s, transform 0.35s",
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
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ── CLOSING LOCATION SUMMARY ────────────────────────────────── */}
        <div className="mt-24 sm:mt-32 pt-16 border-t border-line/60 text-center max-w-2xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3 text-[#9C7B3D]">
              <MapPin size={18} />
              <p className="font-display text-2xl sm:text-3xl text-ink font-medium tracking-tight">
                {closingSummary.locations}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C7B3D] font-bold">
              {closingSummary.tagline}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Apply dot visual state: future / reached / active
 * Mutates style directly — keeps scroll-driven updates off React's scheduler.
 */
function applyDotState(el, state, variant) {
  if (!el) return;
  const inner = el.firstElementChild;

  if (state === "active") {
    el.style.borderColor = "#9C7B3D";
    el.style.boxShadow   = "0 0 0 3px rgba(201,166,105,0.35)";
    if (inner) {
      inner.style.background  = "#9C7B3D";
      inner.style.transform   = "scale(1.35)";
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
