import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, title, desc, align = "left", light = false }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <Reveal>
          <p className={`eyebrow mb-4 ${light ? "text-gold-light" : ""}`}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className={`font-display font-medium text-4xl md:text-5xl leading-[1.1] text-balance ${light ? "text-bg-soft" : "text-ink"}`}>
          {title}
        </h2>
      </Reveal>
      {desc && (
        <Reveal delay={0.16}>
          <p className={`mt-5 text-[15px] leading-relaxed ${light ? "text-bg-soft/70" : "text-ink-soft"}`}>{desc}</p>
        </Reveal>
      )}
    </div>
  );
}
