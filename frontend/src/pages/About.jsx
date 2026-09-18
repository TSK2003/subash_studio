import { motion } from "framer-motion";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { useAdminData } from "../admin/context/AdminDataContext";

const defaultTimeline = [
  { year: "2013", title: "A Single Room in Kalladaikurichi", text: "Subash picks up his first camera for a friend's wedding — and never puts it down. The studio opens as a one-man operation." },
  { year: "2016", title: "First Full-Time Production Floor", text: "Demand grows. SUBASH STUDIO hires its first editors and second shooters, and moves into a proper studio floor." },
  { year: "2019", title: "Tirunelveli Branch Opens", text: "A second studio opens in Tirunelveli, bringing the signature documentary approach to a wider audience." },
  { year: "2022", title: "Cinematography Atelier Launches", text: "Wedding films join the offering, built around a small in-house edit and colour grading team." },
  { year: "2025", title: "Expanded Headquarters", text: "Flagship studio headquarters expanded with album ateliers and multi-suite editing pods." },
];

const values = [
  { title: "Honesty in the Frame", text: "We photograph what's true — not what's staged. Every album should read like a memory, not a performance." },
  { title: "Craft Over Volume", text: "We take on fewer shoots than we could, so every one gets the attention it deserves." },
  { title: "Family, Extended", text: "Multi-branch studio hubs, one team culture — every SUBASH STUDIO photographer trains under the same eye." },
];

export default function About() {
  const { websiteContent } = useAdminData();
  const aboutData = websiteContent?.about || {};

  const storyTitle = aboutData.heading || "A studio built on one belief: light doesn't lie.";
  const storyDesc = aboutData.studioStory || "SUBASH STUDIO began with a single photographer, a rented lens and a wedding he almost turned down out of nerves. Over a decade on, that same instinct — to shoot what's real rather than what's expected — still shapes every frame we deliver. Today our team works across studios in Kalladaikurichi and Tirunelveli, Tamil Nadu.";
  return (
    <>
      <Seo title="About" description="The story of SUBASH STUDIO — from a single room in Mylapore to three branches across Tamil Nadu." />

      <section className="relative h-[62vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <img src="/images/about.png" alt="The SUBASH STUDIO team at work" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative text-center px-6">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="eyebrow text-gold-light mb-5">
            Since 1993
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }} className="font-display font-medium text-5xl sm:text-6xl text-bg-soft">
            About SUBASH STUDIO
          </motion.h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <div className="rounded-md overflow-hidden shadow-soft aspect-[4/5]">
            <img src="/images/storefront.jpg" alt="Founder of SUBASH STUDIO reviewing photographs" className="w-full h-full object-cover" />
          </div>
        </Reveal>
        <div>
          <SectionHeading
            eyebrow="Our Introduction"
            title={storyTitle}
            desc={storyDesc}
          />
        </div>
      </section>

      <section className="bg-white/60 backdrop-blur-[2px] py-28 border-y border-line/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionHeading eyebrow="How We Grew" title="A decade, told in five chapters." align="center" />
          <div className="mt-20 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-line -translate-x-1/2" />
            <div className="space-y-14 md:space-y-0">
              {defaultTimeline.map((t, i) => (
                <Reveal key={t.year} delay={i * 0.05}>
                  <div className={`md:grid md:grid-cols-2 md:gap-16 md:py-10 ${i % 2 === 0 ? "" : ""}`}>
                    <div className={`${i % 2 === 0 ? "md:text-right md:pr-16" : "md:col-start-2 md:pl-16"}`}>
                      <p className="font-display text-3xl text-gold-dark mb-2">{t.year}</p>
                      <h3 className="font-display text-xl text-ink mb-2">{t.title}</h3>
                      <p className="text-sm text-ink-soft leading-relaxed max-w-sm md:ml-auto">{t.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
        <SectionHeading eyebrow="What Guides Us" title="Three ideas we never compromise on." align="center" />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="bg-card rounded-md p-8 shadow-card h-full border border-line/60">
                <div className="hairline w-10 mb-6" />
                <h3 className="font-display text-xl text-ink mb-3">{v.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionHeading
            eyebrow="Three Branches, One Standard"
            title="Tirunelveli | Madurai | Chennai"
            desc="Every SUBASH STUDIO branch is trained on the same craft, the same care and the same eye for honest light — so wherever you find us, you get the studio in full."
            align="center"
            light
          />
        </div>
      </section>
    </>
  );
}
