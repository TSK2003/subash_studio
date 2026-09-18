import { motion } from "framer-motion";

/**
 * Scroll-triggered reveal wrapper — fade + slide, used throughout for
 * consistent, restrained scroll animation instead of scattered one-offs.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.5,
  className = "",
  as = "div",
}) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration, delay, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
