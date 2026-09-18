import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { services as defaultServices } from "../data/services";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Services() {
  const { services: adminServices } = useAdminData();

  const servicesList = (adminServices && adminServices.length > 0
    ? adminServices.filter((s) => s.status !== "Inactive")
    : defaultServices
  ).map((s) => ({
    ...s,
    image: s.image || s.imageUrl || "/public/images/gallery/wedding-1.jpg",
    name: s.name || s.title || "Subash Studio Service",
    blurb: s.blurb || s.description || s.shortDesc || "",
    slug: s.slug || s.id || s.name,
  }));
  return (
    <main className="min-h-screen bg-transparent">

      {/* ========================================
          SERVICES INTRO SECTION
      ======================================== */}

      <section className="pt-40 pb-20 max-w-7xl mx-auto px-6 lg:px-10">

        <SectionHeading
          eyebrow="WHAT WE OFFER"
          title="Crafted with purpose. Captured with care."
          desc="Whether it's a three-day wedding or a single passport photo, every service carries the same attention to light, timing and detail."
        />

      </section>


      {/* ========================================
          SERVICES CARDS
      ======================================== */}

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-28">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {servicesList.map((service, index) => (

            <Reveal
              key={service.slug}
              delay={(index % 6) * 0.06}
            >

              <article
                className="
                  group
                  bg-white
                  rounded-md
                  overflow-hidden
                  border
                  border-[#E8E2D7]
                  shadow-sm
                  h-full
                  flex
                  flex-col
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >

                {/* ========================================
                    SERVICE IMAGE
                ======================================== */}

                <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE9E1]">

                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-110
                    "
                  />

                  {/* Image Hover Overlay */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/0
                      group-hover:bg-black/10
                      transition-all
                      duration-500
                    "
                  />

                </div>


                {/* ========================================
                    SERVICE CONTENT
                ======================================== */}

                <div className="p-7 flex flex-col flex-1">

                  <h3
                    className="
                      font-display
                      text-xl
                      text-[#252525]
                      mb-3
                    "
                  >
                    {service.name}
                  </h3>


                  <p
                    className="
                      text-sm
                      text-[#707070]
                      leading-relaxed
                      flex-1
                    "
                  >
                    {service.blurb}
                  </p>


                  {/* ========================================
                      ACTION BUTTONS
                  ======================================== */}

                  <div className="flex items-center gap-4 mt-7">

                    <Link
                      to="/portfolio"
                      className="
                        text-xs
                        font-semibold
                        tracking-[0.12em]
                        uppercase
                        text-[#252525]
                        hover:text-[#A27B35]
                        transition-colors
                        duration-300
                      "
                    >
                      Learn More
                    </Link>


                    <span
                      className="
                        w-5
                        h-px
                        bg-[#D8D0C2]
                      "
                    />


                    <Link
                      to="/contact"
                      className="
                        text-xs
                        font-semibold
                        tracking-[0.12em]
                        uppercase
                        text-[#A27B35]
                        hover:text-[#76571F]
                        transition-colors
                        duration-300
                      "
                    >
                      Book Now
                    </Link>

                  </div>

                </div>

              </article>

            </Reveal>

          ))}

        </div>

      </section>

      {/* ========================================
          CUSTOM FRAMES CTA SECTION
      ======================================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="bg-[#24221F] rounded-3xl p-8 sm:p-12 text-[#F8F6F2] border border-[#3A3833] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#C9A669]">
              Heirloom Framing Studio
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#F8F6F2]">
              Handcrafted Wooden Frames for Your Cherished Portraits
            </h3>
            <p className="text-sm text-[#A8A196] leading-relaxed">
              Select premium Teak, Rosewood, Pine, Black, or Walnut timber, choose your designer finish, upload your photo, and order direct to your door or studio pickup.
            </p>
          </div>
          <Link
            to="/frames"
            className="shrink-0 px-7 py-3.5 bg-gradient-to-r from-[#C9A669] to-[#9C7B3D] text-[#1C1B19] rounded-full text-xs font-bold tracking-[0.12em] uppercase hover:brightness-110 transition-all shadow-lg active:scale-95"
          >
            Order Custom Frames
          </Link>
        </div>
      </section>

    </main>
  );
}