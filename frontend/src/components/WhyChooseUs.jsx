import { Camera, Heart, Gem, Users } from "lucide-react";
import Reveal from "./Reveal";

const benefits = [
  {
    icon: Camera,
    title: "Years of Experience",
    description:
      "With 12+ years in the industry, we bring expertise, creativity, and a deep understanding of what makes every moment special.",
  },
  {
    icon: Heart,
    title: "Storytelling Approach",
    description:
      "We don't just take photos — we capture emotions, relationships, and the little moments that make your story unique.",
  },
  {
    icon: Gem,
    title: "Premium Quality",
    description:
      "From photography and cinematography to editing and album creation, every detail receives the same level of care.",
  },
  {
    icon: Users,
    title: "Personalized Experience",
    description:
      "Every client is unique. We tailor our approach to match your vision, ensuring a photography experience that feels personal and meaningful.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative w-full bg-transparent py-20 sm:py-24 lg:py-28 overflow-hidden border-b border-[#E7E0D2]/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-[52px] leading-[1.08] tracking-tight text-[#1C1B19]">
              More Than{" "}
              <span className="text-[#B38F4D] font-normal italic">
                Photographs
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-4 text-base sm:text-lg text-[#6F6A62] max-w-2xl mx-auto font-display italic font-light leading-relaxed">
              We preserve emotions, stories, and the moments you&apos;ll treasure forever.
            </p>
          </Reveal>
        </header>

        {/* 4 Benefit Cards in a row */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal
                key={b.title}
                delay={0.12 + i * 0.08}
                className="h-full flex flex-col"
              >
                <div className="bg-white rounded-2xl border border-[#EAE4D7] p-8 shadow-sm hover:shadow-md hover:border-[#B38F4D]/50 transition-all duration-300 flex flex-col items-center text-center h-full group">
                  {/* Elegant circular icon area */}
                  <div className="w-14 h-14 rounded-full border border-[#B38F4D]/30 bg-[#FAF8F5] flex items-center justify-center text-[#B38F4D] mx-auto group-hover:border-[#B38F4D] group-hover:scale-105 group-hover:bg-[#B38F4D]/10 transition-all duration-300 mb-5">
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  </div>

                  {/* Benefit title */}
                  <h3 className="font-display text-xl sm:text-[21px] text-[#1C1B19] font-bold tracking-tight mb-3">
                    {b.title}
                  </h3>

                  {/* Short description */}
                  <p className="text-sm text-[#6F6A62] leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
