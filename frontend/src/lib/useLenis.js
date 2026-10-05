import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

// Disable browser auto-scroll restoration globally
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    // Ensure initial scroll position is locked to top on page load
    try {
      lenis.scrollTo(0, { immediate: true, force: true });
    } catch (_) {}
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const raf_id = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisInstance = null;
      cancelAnimationFrame(raf_id);
    };
  }, []);
}

export function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }
  if (lenisInstance) {
    try {
      lenisInstance.scrollTo(0, { immediate: true, force: true });
    } catch (_) {}
  }
}

export function stopLenis() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
}

export function startLenis() {
  if (lenisInstance) {
    lenisInstance.start();
  }
}

