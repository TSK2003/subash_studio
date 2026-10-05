import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { stopLenis, startLenis, scrollToTop } from "../lib/useLenis";

/**
 * HomeIntroAnimation
 *
 * Premium, minimal, cinematic opening animation ONLY for the Subash Studio homepage ("/").
 * Sequence:
 * 1. Clean full-screen ivory/cream canvas (#FAF7F2).
 * 2. Subash Studio logo appears alone in the exact center of the screen.
 * 3. Logo is held briefly in the center.
 * 4. Logo makes a small, cinematic shift toward the left side.
 * 5. While the logo shifts left, SUBASH STUDIO branding appears beside it VERY LARGE,
 *    visually matching the prominent editorial scale of the homepage hero heading ("Subash, Photo!").
 * 6. The complete large brand lockup holds poised near center screen.
 * 7. As the complete lockup moves UPWARD toward the top-left Navbar, the entire lockup
 *    gradually, continuously, and smoothly scales down from the large hero scale to the exact original Navbar size (1.0x).
 * 8. Background overlay dissolves to reveal the existing homepage seamlessly.
 * 9. Seamless handover into the real Navbar logo with zero shift.
 */
export default function HomeIntroAnimation({ onRevealing, onComplete, onBrandReady }) {
  const [layout, setLayout] = useState(null);
  // step:
  // 0 = init
  // 1 = center-reveal (logo alone in center)
  // 2 = small-move-left (logo shifts left, large SUBASH STUDIO appears beside it)
  // 3 = lockup-hold (intermediate large brand lockup held briefly near center)
  // 4 = move-up (complete lockup moves upward + gradually scales down to exact 1.0x Navbar size)
  // 5 = reveal-homepage (overlay background dissolves)
  // 6 = done (complete & unmount)
  const [step, setStep] = useState(0);
  const measuredRef = useRef(false);

  // Measure destination layout dynamically with resilient fallbacks
  useEffect(() => {
    const measure = () => {
      const brandEl = document.getElementById("navbar-brand-link") || document.getElementById("navbar-brand-logo");
      const logoImgEl = document.getElementById("navbar-logo-img") || brandEl?.querySelector("img");

      const width = window.innerWidth;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isLargeDesktop = width >= 1280;

      const fallbackPaddingLeft = isMobile ? 16 : isTablet ? 24 : 40;
      const fallbackLogoSize = isMobile ? 40 : 44;
      const fallbackTop = (84 - fallbackLogoSize) / 2;

      let brandLeft = fallbackPaddingLeft;
      let brandTop = fallbackTop;
      let logoWidth = fallbackLogoSize;
      let logoHeight = fallbackLogoSize;
      let brandWidth = isMobile ? 152 : 176;
      let brandHeight = fallbackLogoSize;

      if (brandEl && logoImgEl) {
        const bRect = brandEl.getBoundingClientRect();
        const lRect = logoImgEl.getBoundingClientRect();
        if (lRect.width > 0 && lRect.height > 0) {
          brandLeft = bRect.left;
          brandTop = bRect.top;
          logoWidth = lRect.width;
          logoHeight = lRect.height;
        }
        if (bRect.width > 0 && bRect.height > 0) {
          brandWidth = bRect.width;
          brandHeight = bRect.height;
        }
      }

      // Intermediate brand lockup occupies roughly the central 50–60% of viewport width on desktop/tablet,
      // and scales responsively on mobile to remain dramatically large while maintaining safe margins.
      let targetLockupWidth;
      if (isMobile) {
        // Safe width with comfortable ~22px–28px margins on both sides
        const mobileMargin = width < 380 ? 44 : 52;
        targetLockupWidth = Math.min(width - mobileMargin, 400);
      } else if (isTablet) {
        // Central 56–58% of viewport width
        targetLockupWidth = width * 0.57;
      } else {
        // Central 53–55% of viewport width on desktop
        targetLockupWidth = width * 0.55;
      }

      const effectiveBrandWidth = Math.max(brandWidth, isMobile ? 140 : 160);
      let calculatedScale = targetLockupWidth / effectiveBrandWidth;

      // Ensure the scaled lockup never exceeds 42% of viewport height (e.g. landscape viewports)
      const effectiveBrandHeight = Math.max(brandHeight, fallbackLogoSize);
      const maxHeightScale = (window.innerHeight * 0.42) / effectiveBrandHeight;
      calculatedScale = Math.min(calculatedScale, maxHeightScale);

      // Clean rounded scale factor
      const intermediateScale = Number(
        Math.max(calculatedScale, isMobile ? 1.95 : 2.8).toFixed(2)
      );

      const screenCenterX = width / 2;
      const screenCenterY = window.innerHeight / 2;

      // Position where logo alone is in the exact center at intermediateScale
      // (transformOrigin is "0 0", so scaled center of logo is brandLeft + x + (logoWidth * scale) / 2)
      const deltaX_logo =
        screenCenterX - brandLeft - (logoWidth * intermediateScale) / 2;
      const deltaY =
        screenCenterY - brandTop - (brandHeight * intermediateScale) / 2;

      // Position where the entire large lockup is in the exact center at intermediateScale
      // (scaled center of lockup is brandLeft + x + (brandWidth * scale) / 2)
      const deltaX_lockup =
        screenCenterX - brandLeft - (brandWidth * intermediateScale) / 2;

      setLayout({
        brandLeft,
        brandTop,
        logoWidth,
        logoHeight,
        intermediateScale,
        deltaX_logo,
        deltaX_lockup,
        deltaY,
        isMobile,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Lock scroll while intro is playing
  useEffect(() => {
    stopLenis();
    scrollToTop();
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      startLenis();
      scrollToTop();
      requestAnimationFrame(() => scrollToTop());
    };
  }, []);

  const onRevealingRef = useRef(onRevealing);
  onRevealingRef.current = onRevealing;
  const onBrandReadyRef = useRef(onBrandReady);
  onBrandReadyRef.current = onBrandReady;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Orchestrate timeline sequence
  useEffect(() => {
    if (!layout || measuredRef.current) return;
    measuredRef.current = true;

    // 1. t = 60ms: Centered logo fades & scales into view alone in center
    const t1 = setTimeout(() => {
      setStep(1); // center
    }, 60);

    // 2. t = 1200ms: Logo makes a small smooth shift left while large SUBASH STUDIO appears
    const t2 = setTimeout(() => {
      setStep(2); // small-move-left
    }, 1200);

    // 3. t = 2100ms: Complete large brand lockup holds poised near center (hero prominence)
    const t3 = setTimeout(() => {
      setStep(3); // lockup-hold
    }, 2100);

    // 4. t = 2650ms: Complete lockup moves UPWARD + smoothly scales down to exact 1.0x Navbar size
    const t4 = setTimeout(() => {
      setStep(4); // move-up
    }, 2650);

    // 5. t = 3700ms: Arrived at Navbar; reveal homepage (overlay background dissolves)
    const t5 = setTimeout(() => {
      setStep(5); // reveal
      scrollToTop();
      if (onRevealingRef.current) onRevealingRef.current();
      if (onBrandReadyRef.current) onBrandReadyRef.current();
    }, 3700);

    // 6. t = 4300ms: Complete & unmount
    const t6 = setTimeout(() => {
      setStep(6); // done
      scrollToTop();
      if (onCompleteRef.current) onCompleteRef.current();
    }, 4300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [layout]);

  if (!layout || step >= 6) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    >
      {/* Clean full-screen ivory/cream canvas overlay */}
      <motion.div
        className="absolute inset-0 bg-[#FAF7F2]"
        initial={{ opacity: 1 }}
        animate={{ opacity: step >= 5 ? 0 : 1 }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Animated Brand Lockup Container */}
      <motion.div
        className="absolute flex items-center gap-2.5 sm:gap-3 shrink-0"
        style={{
          top: layout.brandTop,
          left: layout.brandLeft,
          transformOrigin: "0 0",
        }}
        initial={{
          x: layout.deltaX_logo,
          y: layout.deltaY,
          scale: layout.intermediateScale,
          opacity: 1,
        }}
        animate={{
          x: step >= 4 ? 0 : step >= 2 ? layout.deltaX_lockup : layout.deltaX_logo,
          y: step >= 4 ? 0 : layout.deltaY,
          scale: step >= 4 ? 1 : layout.intermediateScale,
          opacity: step >= 5 ? 0 : 1,
        }}
        transition={{
          x: {
            duration: step >= 4 ? 1.05 : 0.85,
            ease: [0.65, 0, 0.35, 1], // Velvety cinematic ease
          },
          y: {
            duration: step >= 4 ? 1.05 : 0.85,
            ease: [0.65, 0, 0.35, 1], // Smooth upward glide into Navbar
          },
          scale: {
            duration: step >= 4 ? 1.05 : 0.85,
            ease: [0.65, 0, 0.35, 1], // Continuous scale-down to exact 1.0x Navbar size
          },
          opacity: {
            duration: 0.35,
            ease: "easeOut",
          },
        }}
      >
        {/* Existing Subash Studio Logo Image */}
        <motion.div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: layout.logoWidth,
            height: layout.logoHeight,
          }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.88 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/logo.png"
            alt="SUBASH STUDIO"
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
          />
        </motion.div>

        {/* Existing Navbar Vertical Divider Line */}
        <motion.div
          className="h-7 sm:h-8 w-[1px] bg-black shrink-0"
          style={{ transformOrigin: "center center" }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: step >= 2 ? 1 : 0,
            opacity: step >= 2 ? 1 : 0,
          }}
          transition={{
            duration: 0.6,
            delay: step >= 2 && step < 4 ? 0.2 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Existing SUBASH STUDIO Brand Typography */}
        <motion.div
          className="flex flex-col justify-center select-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: step >= 2 ? 1 : 0,
            x: step >= 2 ? 0 : -10,
          }}
          transition={{
            opacity: {
              duration: 0.65,
              delay: step >= 2 && step < 4 ? 0.2 : 0,
              ease: [0.22, 1, 0.36, 1],
            },
            x: {
              duration: 0.65,
              delay: step >= 2 && step < 4 ? 0.2 : 0,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          <span className="font-display text-[15px] sm:text-[17px] font-bold tracking-[0.22em] text-black uppercase leading-none">
            SUBASH
          </span>
          <div className="flex items-center justify-between w-full mt-1">
            <motion.span
              className="h-[1px] flex-1 bg-black"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
              style={{ transformOrigin: "right" }}
            />
            <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.24em] text-black uppercase leading-none px-1">
              STUDIO
            </span>
            <motion.span
              className="h-[1px] flex-1 bg-black"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
