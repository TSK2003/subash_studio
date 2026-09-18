import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { branches as defaultBranches } from "../data/branches";
import { useAdminData } from "../admin/context/AdminDataContext";

const getImageColumnWidthClass = (city = "") => {
  const c = city.toLowerCase();
  if (c.includes("tirunelveli")) {
    return "lg:w-[36%]";
  }
  if (c.includes("kalladaikurichi")) {
    return "lg:w-[40%]";
  }
  return "lg:w-[38%]";
};

function BranchCard({ branch, index }) {
  const isEven = index % 2 === 0;
  const imgColWidth = getImageColumnWidthClass(branch.city);

  return (
    <div
      className={`
        bg-card
        border
        border-line/60
        rounded-md
        overflow-hidden
        shadow-card
        flex
        flex-col
        ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}
        items-stretch
      `}
    >
      {/* Branch Image Column */}
      <div
        className={`
          w-full
          ${imgColWidth}
          bg-[#FAF8F5]
          flex
          items-center
          justify-center
          overflow-hidden
          shrink-0
        `}
      >
        <img
          src={branch.image}
          alt={`SUBASH STUDIO ${branch.city} branch`}
          className="w-full h-auto object-contain block transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/gallery/branches/kalladaikurichi.jpg";
          }}
        />
      </div>

      {/* Branch Details Column */}
      <div className="flex-1 p-6 sm:p-8 md:p-10 lg:py-10 lg:px-12 xl:px-14 flex flex-col justify-center">
        <p className="eyebrow mb-3">{branch.tag}</p>

        <h3 className="font-display text-3xl text-ink mb-4">{branch.city}</h3>

        <p className="text-sm text-ink-soft leading-relaxed mb-7">
          {branch.desc}
        </p>

        {/* Address */}
        <div className="space-y-3 text-sm text-ink">
          <div className="flex items-start gap-3">
            <MapPin size={17} className="text-gold-dark mt-0.5 shrink-0" />
            <span>{branch.address}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone size={17} className="text-gold-dark shrink-0" />
            <span>{branch.phone}</span>
          </div>

          {/* Opening Hours */}
          <div className="flex items-center gap-3">
            <Clock size={17} className="text-gold-dark shrink-0" />
            <span>{branch.hours}</span>
          </div>

          {/* Directions / Maps Link */}
          {branch.mapsUrl && (
            <div className="pt-2">
              <a
                href={branch.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gold-dark hover:text-ink transition-colors"
              >
                Get Directions <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Branches() {
  const { branches: adminBranches } = useAdminData();

  const branchesList = (adminBranches && adminBranches.length > 0
    ? adminBranches.filter((b) => b.active !== false)
    : defaultBranches
  ).map((b) => ({
    ...b,
    city: b.city || b.name || "Studio Branch",
    tag: b.tag || b.name || "Studio",
    desc: b.desc || b.description || b.address || "",
    address: b.address || "",
    phone: b.phone || "+91 93457 06609",
    hours: b.hours || "Mon – Sun, 08:00 AM – 09:00 PM",
    image: (b.image && !b.image.includes("outdoor-01.jpg"))
      ? b.image
      : (b.city?.toLowerCase().includes("tirunelveli")
        ? "/images/gallery/branches/tirunelveli.jpg"
        : (b.city?.toLowerCase().includes("tenkasi")
          ? "/images/storefront.jpg"
          : "/images/gallery/branches/kalladaikurichi.jpg")),
    mapsUrl: b.mapsUrl || (b.city?.toLowerCase().includes("tirunelveli") ? "https://maps.app.goo.gl/hh7A1jwk1hhb8svr9" : "https://maps.google.com/?q=Subash+Studio+" + encodeURIComponent(b.city || "")),
  }));
  return (
    <>
      <Seo
        title="Branches"
        description="Visit SUBASH STUDIO across Chennai, Coimbatore and Madurai."
      />

      {/* =========================
          PAGE HEADER
      ========================== */}
      <section className="pt-40 pb-20 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeading
          eyebrow="Find Us"
          title="Every location. One studio experience."
          desc="Walk in for a consultation, an album preview, or simply to see the space where your photographs will be made."
        />
      </section>

      {/* =========================
          BRANCHES
      ========================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-28 space-y-10">
        {branchesList.map((b, i) => (
          <Reveal key={b.city} delay={i * 0.08}>
            <BranchCard branch={b} index={i} />
          </Reveal>
        ))}
      </section>
    </>
  );
}
