import { useEffect, useRef, memo } from "react";
import gsap from "gsap";
import { stopLenis, startLenis } from "../lib/useLenis";
import {
  getIntroStatus,
  markIntroRunning,
  markIntroCompleted,
} from "../lib/introLifecycle";

function HomeIntroAnimation({ onBrandReady, onComplete }) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const lockupRef = useRef(null);
  const logoRef = useRef(null);
  const dividerRef = useRef(null);
  const brandTextRef = useRef(null);

  // Keep latest callbacks in refs so effects never re-trigger on parent re-renders
  const onBrandReadyRef = useRef(onBrandReady);
  onBrandReadyRef.current = onBrandReady;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // If intro has already completed during this document lifetime, do not run
    if (getIntroStatus() === "completed") {
      return;
    }

    markIntroRunning();

    let isCancelled = false;
    let ctx = null;

    // Immediately lock scrolling and halt Lenis
    stopLenis();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    async function runIntro() {
      // Ensure web fonts are ready so bounding boxes are measured with sub-pixel precision
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {
          // ignore font loading error
        }
      }

      if (isCancelled) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Target Navbar live elements
      const targetBrandEl = document.getElementById("navbar-brand-logo");
      const targetLogoImg = targetBrandEl?.querySelector("img");

      let tLeft = 40;
      let tTop = 20;
      let tWidth = 168;
      let tHeight = 44;
      let lWidth = vw >= 640 ? 44 : 40;

      if (targetBrandEl) {
        const rect = targetBrandEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          tLeft = rect.left;
          tTop = rect.top;
          tWidth = rect.width;
          tHeight = rect.height;
        }
      }

      if (targetLogoImg) {
        const logoRect = targetLogoImg.getBoundingClientRect();
        if (logoRect.width > 0) {
          lWidth = logoRect.width;
        }
      } else {
        lWidth = vw >= 640 ? 44 : 40;
      }

      // 5. VERY LARGE Intermediate Brand Lockup
      // Central 50-60% of viewport width on desktop, maintaining safe margins.
      // Responsive on mobile / tablet to fit inside viewport without overflow.
      let targetVisualWidth;
      if (vw >= 1024) {
        targetVisualWidth = Math.min(vw * 0.55, 820);
      } else if (vw >= 640) {
        targetVisualWidth = Math.min(vw * 0.70, 560);
      } else {
        targetVisualWidth = Math.min(vw * 0.86, 340);
      }

      const sLarge = targetVisualWidth / tWidth;
      const visualW = tWidth * sLarge;
      const visualH = tHeight * sLarge;

      // Visual center of large lockup on screen
      const visualCenterX = (vw - visualW) / 2;
      const visualCenterY = (vh - visualH) / 2;

      // Translation for centered lockup relative to (tLeft, tTop) with origin (0, 0)
      const lockupCenterX = visualCenterX - tLeft;
      const lockupCenterY = visualCenterY - tTop;

      // Translation so LOGO ITSELF is dead center of screen initially
      const logoOffset = ((tWidth - lWidth) / 2) * sLarge;
      const logoOnlyX = lockupCenterX + logoOffset;

      // Apply initial geometry to lockup container
      if (lockupRef.current) {
        lockupRef.current.style.left = `${tLeft}px`;
        lockupRef.current.style.top = `${tTop}px`;
        lockupRef.current.style.width = `${tWidth}px`;
        lockupRef.current.style.height = `${tHeight}px`;
        lockupRef.current.style.opacity = "1";
      }

      ctx = gsap.context(() => {
        // 1. Initial State: Centered lockup positioned such that LOGO is exactly at center of viewport
        gsap.set(lockupRef.current, {
          x: logoOnlyX,
          y: lockupCenterY,
          scale: sLarge,
          transformOrigin: "0 0",
          force3D: true,
        });

        // Initially only the logo will appear. Divider and brand text are hidden.
        gsap.set(logoRef.current, {
          opacity: 0,
          scale: 0.84,
          transformOrigin: "center center",
          force3D: true,
        });

        gsap.set(dividerRef.current, {
          opacity: 0,
          scaleY: 0,
          transformOrigin: "center center",
          force3D: true,
        });

        gsap.set(brandTextRef.current, {
          opacity: 0,
          x: -18,
          force3D: true,
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
        });

        // 2. Logo Appears: Fade and scale the logo smoothly into view at center of viewport
        tl.to(logoRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power2.out",
        });

        // Briefly hold the centered logo
        tl.to({}, { duration: 0.45 });

        // 3 & 4. Small Left Movement + SUBASH STUDIO Appears
        // Move lockup subtly left to lockupCenterX while revealing divider and typography
        tl.add("revealBrand");

        tl.to(
          lockupRef.current,
          {
            x: lockupCenterX,
            duration: 0.9,
            ease: "power2.inOut",
          },
          "revealBrand"
        );

        tl.to(
          dividerRef.current,
          {
            opacity: 1,
            scaleY: 1,
            duration: 0.65,
            ease: "power2.out",
          },
          "revealBrand+=0.15"
        );

        tl.to(
          brandTextRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: "power2.out",
          },
          "revealBrand+=0.2"
        );

        // 5. VERY LARGE Intermediate Brand Lockup: Briefly hold completed lockup
        tl.to({}, { duration: 0.85 });

        // 6. Move Entire Lockup Upward + Continuously Scale Down
        // Moves lockup as one unified brand element from center directly to (0, 0)
        // simultaneously scaling from sLarge down to 1.0 (exact original Navbar size).
        tl.to(lockupRef.current, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.35,
          ease: "power3.inOut",
          onComplete: () => {
            // 7. Exact Navbar Position reached: notify Navbar brand is ready
            onBrandReadyRef.current?.();
          },
        });

        // 8. Homepage Reveal: Smoothly fade ivory overlay 1 -> 0
        tl.to(overlayRef.current, {
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          onStart: () => {
            if (overlayRef.current) {
              overlayRef.current.style.pointerEvents = "none";
            }
          },
          onComplete: () => {
            // Authoritatively mark lifecycle as completed
            markIntroCompleted();

            // Restore normal scrolling & Lenis
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            startLenis();

            onCompleteRef.current?.();
          },
        });
      }, containerRef);
    }

    runIntro();

    return () => {
      isCancelled = true;
      if (ctx) {
        ctx.revert();
      }
      if (getIntroStatus() === "completed") {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        startLenis();
      }
    };
  }, []);

  if (getIntroStatus() === "completed") {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none select-none z-[9990]">
      {/* 1. Full-screen Clean Ivory/Cream Background Overlay (#FAF7F2) */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-[#FAF7F2] pointer-events-auto z-[9991]"
        style={{ willChange: "opacity" }}
      />

      {/* Unified Animated Brand Lockup */}
      <div
        ref={lockupRef}
        className="fixed z-[9992] flex items-center gap-2.5 sm:gap-3 pointer-events-none"
        style={{
          left: "40px",
          top: "20px",
          width: "168px",
          height: "44px",
          transformOrigin: "0 0",
          willChange: "transform, opacity",
          opacity: 0,
        }}
      >
        {/* Existing Subash Studio Logo */}
        <img
          ref={logoRef}
          src="/logo.png"
          alt="SUBASH STUDIO"
          className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
          style={{ opacity: 0 }}
        />

        {/* Existing Vertical Divider */}
        <div
          ref={dividerRef}
          className="h-7 sm:h-8 w-[1px] bg-black shrink-0 origin-center"
          aria-hidden="true"
          style={{ opacity: 0, transform: "scaleY(0)" }}
        />

        {/* Existing Typography / Style from Navbar */}
        <div
          ref={brandTextRef}
          className="flex flex-col justify-center select-none whitespace-nowrap"
          style={{ opacity: 0 }}
        >
          <span className="font-display text-[15px] sm:text-[17px] font-bold tracking-[0.22em] text-black uppercase leading-none">
            SUBASH
          </span>
          <div className="flex items-center justify-between w-full mt-1">
            <span className="h-[1px] flex-1 bg-black" />
            <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.24em] text-black uppercase leading-none px-1">
              STUDIO
            </span>
            <span className="h-[1px] flex-1 bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HomeIntroAnimation);
