import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import * as ReactCountUp from "react-countup";
const CountUp = ReactCountUp.default?.default || ReactCountUp.default;
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import WhyChooseUs from "../components/WhyChooseUs";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import HomeHero from "../components/home/HomeHero";
import { useAdminData } from "../admin/context/AdminDataContext";



const selectedWorkItems = [
  {
    title: "Forever Begins",
    category: "WEDDING",
    image: "/images/portfolio/wedding-01.jpg",
  },
  {
    title: "A Beautiful Beginning",
    category: "WEDDING",
    image: "/images/portfolio/wedding-02.jpg",
  },
  {
    title: "The Wedding Story",
    category: "WEDDING",
    image: "/images/portfolio/wedding-03.jpg",
  },
  {
    title: "Two Hearts",
    category: "COUPLE",
    image: "/images/portfolio/couple-01.jpg",
  },
  {
    title: "Together",
    category: "FAMILY",
    image: "/images/portfolio/couple-02.jpg",
  },
  {
    title: "Little Moments",
    category: "BABY",
    image: "/images/portfolio/baby-01.jpg",
  },
];

export default function Home() {
  const { portfolio, branches } = useAdminData();

  const dynamicStats = useMemo(() => {
    const activeBranches = branches?.filter((b) => b.active !== false).length || 3;
    return [
      { end: 12, suffix: "+", label: "Years Behind the Lens" },
      { end: 1002, suffix: "+", label: "Happy Clients" },
      { end: activeBranches, suffix: "", label: "Studio Branches" },
      { end: 94, suffix: "%", label: "Client Satisfaction" },
    ];
  }, [branches]);

  const workItems = useMemo(() => {
    if (portfolio && portfolio.length > 0) {
      return portfolio.slice(0, 6).map((item) => ({
        id: item.id || item.title,
        title: item.title,
        category: (item.category || "PORTFOLIO").toUpperCase(),
        image: item.image || item.coverImage || item.imageUrl || "/images/portfolio/wedding-01.jpg",
      }));
    }
    return selectedWorkItems;
  }, [portfolio]);
  return (
    <div className="relative pt-[84px]">
      <Seo
        title="Home | Fine Photography & Cinematic Films"
        description="SUBASH STUDIO — Fine photography and cinematic films preserving timeless heritage, profound emotions, and authentic human celebrations."
      />

      {/* =========================================================
          HERO SECTION (Luxury Editorial & Heritage Reference Design)
      ========================================================= */}
      <HomeHero />

      {/* =========================================================
          SECTION 2: STATS SECTION (Clean Horizontal Strip)
      ========================================================= */}
      <section
        id="home-stats-section"
        className="bg-transparent border-b border-[#E7E0D2]/70 py-10 sm:py-12 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E0D2]/80">
          {dynamicStats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center py-4 sm:py-0 px-4 ${
                i === 1 ? "border-r-0 lg:border-r border-[#E7E0D2]/80" : ""
              }`}
            >
              <p className="font-display text-4xl sm:text-5xl lg:text-[50px] text-[#B38F4D] font-medium leading-none">
                <CountUp end={s.end} duration={2.2} enableScrollSpy scrollSpyOnce />
                {s.suffix}
              </p>
              <p className="mt-2.5 text-[11px] sm:text-xs tracking-[0.18em] uppercase font-semibold text-[#6F6A62]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          SECTION 4: WHY CHOOSE US (4 Balanced Benefit Cards)
      ========================================================= */}
      <WhyChooseUs />

      {/* =========================================================
          SECTION 5: OUR CRAFT / FOUNDER STORY (Editorial Split)
      ========================================================= */}
      <section className="relative w-full bg-transparent border-b border-[#E7E0D2]/70 overflow-hidden py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center relative z-10">
          {/* Left: Founder portrait with secondary overlapping B&W portrait */}
          <Reveal className="relative max-w-md sm:max-w-lg mx-auto lg:max-w-none w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E7E0D2]/80 aspect-[4/5] bg-[#FAF8F5]">
              <img
                src="/images/shyam chandru.jpeg"
                alt="Subash - Founder and Lead Photographer at SUBASH STUDIO"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Small overlapping secondary black-and-white portrait at bottom/right */}
            <div className="hidden sm:flex absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white z-10">
              <img
                src="/images/shyam chandru.jpeg"
                alt="Subash at work behind the lens"
                className="w-full h-full object-cover object-center grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </Reveal>

          {/* Right: Content, signature and video action */}
          <div className="flex flex-col justify-center">
            <Reveal>
              <span className="text-xs tracking-[0.25em] font-semibold text-[#B38F4D] uppercase mb-3 block">
                OUR CRAFT
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] leading-[1.18] text-[#1C1B19] tracking-tight">
                Photography that feels less like a service, more like a keepsake.
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 text-[#6F6A62] text-[15px] sm:text-base leading-relaxed">
                At Subash Studio, we believe every photograph has a story — a feeling, a connection, a moment that deserves to live forever. What began as a simple studio has grown into a trusted name, known for its authenticity, artistic vision, and heartfelt approach.
              </p>
              <p className="mt-4 text-[#6F6A62] text-[15px] sm:text-base leading-relaxed">
                From family portraits to grand weddings, from traditional ceremonies to cinematic films, we capture life as it truly is — beautiful, emotional, and real.
              </p>
            </Reveal>

            {/* Signature & Play Button Row */}
            <Reveal
              delay={0.24}
              className="mt-10 pt-8 border-t border-[#E7E0D2]/80 flex flex-wrap items-center justify-between gap-6"
            >
              {/* Left: Signature style text */}
              <div>
                <p className="font-display italic text-3xl text-[#B38F4D] font-normal select-none -rotate-2 mb-1">
                  Subash
                </p>
                <p className="text-xs font-bold tracking-[0.22em] text-[#1C1B19] uppercase">
                  SUBASH
                </p>
                <p className="text-[10px] tracking-[0.2em] text-[#6F6A62] uppercase font-semibold mt-0.5">
                  FOUNDER &amp; LEAD PHOTOGRAPHER
                </p>
              </div>

              {/* Right: Circular play button & WATCH OUR STORY */}
              <Link
                to="/films"
                className="group flex items-center gap-3.5 select-none"
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF0DE] border border-[#B38F4D]/40 flex items-center justify-center text-[#B38F4D] group-hover:bg-[#B38F4D] group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <Play size={15} className="fill-current ml-0.5" />
                </div>
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#1C1B19] group-hover:text-[#B38F4D] transition-colors">
                  Watch Our Story
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 6: TESTIMONIALS (Kind Words & Keepsakes)
      ========================================================= */}
      <TestimonialsCarousel />

      {/* =========================================================
          SECTION 7: SELECTED WORK / PORTFOLIO (6 Image Cards)
      ========================================================= */}
      <section className="relative w-full bg-transparent border-t border-[#E7E0D2]/70 overflow-hidden py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-14">
            <div>
              <Reveal>
                <p className="text-xs tracking-[0.25em] font-semibold text-[#B38F4D] uppercase mb-2">
                  SELECTED WORK
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-[#1C1B19] leading-tight">
                  Stories captured, moments preserved.
                </h2>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#1C1B19] hover:text-[#B38F4D] whitespace-nowrap transition-colors"
              >
                <span>EXPLORE FULL PORTFOLIO</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            </Reveal>
          </div>

          {/* 6 Clean Image Cards in a single row on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {workItems.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.06}>
                <Link to="/portfolio" className="group block">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-[#E7E0D2]/80 bg-[#FAF8F5]">
                    <img
                      src={item.image}
                      alt={`${item.title} by SUBASH STUDIO`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-[15px] sm:text-base font-bold text-[#1C1B19] group-hover:text-[#B38F4D] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-[#8C6D32] uppercase tracking-[0.18em] font-bold mt-0.5">
                      {item.category}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 8: LARGE CTA BANNER SECTION
      ========================================================= */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        <img
          src="/images/wedding photos.jpg"
          alt="SUBASH STUDIO authentic wedding moments"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#141210]/65 backdrop-blur-[0.5px]" />

        <div className="relative max-w-3xl mx-auto px-6 text-center z-10">
          <Reveal>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.15] text-balance">
              Your story deserves <br className="hidden sm:inline" />
              more than a snapshot.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-4 text-[#F8F6F2]/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-light">
              Let&apos;s create timeless memories together.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 px-9 py-4 bg-[#B38F4D] text-[#1C1B19] hover:bg-[#C9A669] text-xs font-bold tracking-[0.14em] uppercase rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
            >
              <span>BOOK A SHOOT</span>
              <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
