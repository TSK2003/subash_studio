import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

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
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}
