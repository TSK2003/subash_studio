import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import WhyChooseUs from "../components/WhyChooseUs";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import HomeHero from "../components/home/HomeHero";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Home() {
  const { branches, websiteContent } = useAdminData();
  const ctaBgImage = websiteContent?.home?.ctaImage || "/images/wedding-cta.png";

  return (
    <div className="relative">
      <Seo
        title="Home | Fine Photography & Cinematic Films"
        description="SUBASH STUDIO — Fine photography and cinematic films preserving timeless heritage, profound emotions, and authentic human celebrations."
      />

      {/* =========================================================
          HERO SECTION (Luxury Editorial & Heritage Reference Design)
      ========================================================= */}
      <HomeHero />

      {/* =========================================================
          WHY CHOOSE US (More Than Photographs)
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
                src="/images/shyam-chandru.webp"
                alt="Shyam Chandru - Founder and Lead Photographer at SUBASH STUDIO"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== "/images/shyam chandru.jpeg") {
                    e.currentTarget.src = "/images/shyam chandru.jpeg";
                  }
                }}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Small overlapping secondary black-and-white portrait at bottom/right */}
            <div className="hidden sm:flex absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white z-10">
              <img
                src="/images/shyam-chandru.webp"
                alt="Shyam Chandru at work behind the lens"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== "/images/shyam chandru.jpeg") {
                    e.currentTarget.src = "/images/shyam chandru.jpeg";
                  }
                }}
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
                <p className="font-display text-3xl text-[#B38F4D] font-normal select-none mb-1">
                  Shyam Chandru
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
          SECTION 8: LARGE CTA BANNER SECTION
      ========================================================= */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        <img
          src={ctaBgImage}
          alt="SUBASH STUDIO authentic wedding moments"
          className="absolute inset-0 w-full h-full object-cover object-[52%_20%] sm:object-[52%_24%] md:object-[50%_28%] lg:object-[50%_32%]"
        />
        <div className="absolute inset-0 bg-[#141210]/60 backdrop-blur-[0.5px]" />

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
