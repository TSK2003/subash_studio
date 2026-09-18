import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import {
  portfolioCategories as defaultCategories,
  portfolioProjects as defaultProjects,
} from "../data/portfolio";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Portfolio() {
  const { portfolio } = useAdminData();
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const projects = useMemo(() => {
    if (portfolio && portfolio.length > 0) {
      return portfolio
        .filter((item) => item.published !== false)
        .map((item) => ({
          ...item,
          image: item.coverImage || item.image || item.imageUrl || "/public/images/gallery/wedding-1.jpg",
          title: item.title || item.client || item.category || "Subash Studio",
          excerpt: item.description || item.excerpt || item.location || "",
        }));
    }
    return defaultProjects;
  }, [portfolio]);

  const categories = useMemo(() => {
    if (portfolio && portfolio.length > 0) {
      const cats = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
      return ["All", ...cats];
    }
    return defaultCategories;
  }, [portfolio, projects]);

  const filtered = useMemo(() => {
    if (active === "All") {
      return projects;
    }
    return projects.filter((project) => project.category === active);
  }, [active, projects]);


  // ==========================================
  // LIGHTBOX FUNCTIONS
  // ==========================================

  const openAt = (index) => {
    setLightbox(index);
  };

  const close = () => {
    setLightbox(null);
  };

  const next = () => {
    setLightbox((currentIndex) => {
      if (currentIndex === null) return 0;

      return (currentIndex + 1) % filtered.length;
    });
  };

  const prev = () => {
    setLightbox((currentIndex) => {
      if (currentIndex === null) return 0;

      return (
        (currentIndex - 1 + filtered.length) % filtered.length
      );
    });
  };


  // ==========================================
  // CURRENT LIGHTBOX IMAGE
  // ==========================================

  const current =
    lightbox !== null ? filtered[lightbox] : null;


  return (
    <main className="bg-transparent min-h-screen">


      {/* ========================================
          PORTFOLIO HERO
      ======================================== */}

      <section className="relative h-[72vh] min-h-[500px] flex items-end overflow-hidden">

        {/* YOUR OWN HERO IMAGE */}

        <img
          src="/images/portfolio/portfolio.png"
          alt="SUBASH STUDIO Portfolio"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
        />


        {/* Dark Gradient */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/85
            via-black/30
            to-black/10
          "
        />


        {/* Hero Content */}

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            px-6
            lg:px-10
            pb-16
            w-full
          "
        >

          <p
            className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-[#D4A85A]
              mb-4
            "
          >
            Editorial Portfolio · SUBASH STUDIO
          </p>


          <h1
            className="
              font-display
              font-medium
              text-5xl
              sm:text-6xl
              lg:text-7xl
              text-white
              max-w-3xl
              leading-[1.05]
            "
          >
            Stories we were trusted to tell.
          </h1>

        </div>

      </section>



      {/* ========================================
          CATEGORY FILTER
      ======================================== */}

      <section
        className="
          sticky
          top-0
          z-30
          bg-[#F8F6F1]/95
          backdrop-blur-md
          border-b
          border-[#E5DED2]
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            lg:px-10
            py-5
            flex
            gap-3
            overflow-x-auto
            no-scrollbar
          "
        >

          {categories.map((category) => (

            <button
              key={category}
              onClick={() => {
                setActive(category);
                setLightbox(null);
              }}
              className={`
                px-4
                py-2
                rounded-full
                text-xs
                tracking-[0.08em]
                uppercase
                font-semibold
                whitespace-nowrap
                transition-all
                duration-300
                border

                ${
                  active === category
                    ? "bg-[#252525] text-white border-[#252525]"
                    : "border-[#DED6C9] text-[#6F6A62] hover:border-[#A27B35] hover:text-[#A27B35]"
                }
              `}
            >
              {category}
            </button>

          ))}

        </div>

      </section>



      {/* ========================================
          PORTFOLIO MASONRY GRID
      ======================================== */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-6
          lg:px-10
          py-20
        "
      >

        <div
          className="
            columns-1
            sm:columns-2
            lg:columns-3
            gap-6
            space-y-6
          "
        >

          <AnimatePresence mode="popLayout">

            {filtered.map((project, index) => (

              <motion.button
                layout
                key={project.id}

                initial={{
                  opacity: 0,
                  y: 25,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}

                transition={{
                  duration: 0.5,
                  delay: (index % 6) * 0.05,
                }}

                onClick={() => openAt(index)}

                className="
                  group
                  relative
                  block
                  w-full
                  break-inside-avoid
                  rounded-md
                  overflow-hidden
                  shadow-sm
                  text-left
                  mb-6
                  bg-white
                "
              >

                {/* ==================================
                    YOUR OWN PORTFOLIO IMAGE
                ================================== */}

                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="
                    w-full
                    h-auto
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-105
                  "
                />


                {/* Hover Gradient */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/90
                    via-black/10
                    to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                  "
                />


                {/* Hover Content */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-6
                    translate-y-4
                    opacity-0
                    group-hover:translate-y-0
                    group-hover:opacity-100
                    transition-all
                    duration-500
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.2em]
                      text-[#D4A85A]
                      mb-2
                    "
                  >
                    {project.category}
                  </p>


                  <p
                    className="
                      font-display
                      text-xl
                      text-white
                    "
                  >
                    {project.title}
                  </p>

                </div>

              </motion.button>

            ))}

          </AnimatePresence>

        </div>

      </section>



      {/* ========================================
          LIGHTBOX
      ======================================== */}

      <AnimatePresence>

        {current && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}

            className="
              fixed
              inset-0
              z-[100]
              bg-black/95
              flex
              items-center
              justify-center
              px-4
            "

            onClick={close}
          >


            {/* CLOSE BUTTON */}

            <button
              onClick={close}
              className="
                absolute
                top-6
                right-6
                z-20
                text-white/80
                hover:text-[#D4A85A]
                transition-colors
              "
              aria-label="Close portfolio image"
            >
              <X size={30} />
            </button>



            {/* PREVIOUS */}

            <button
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}

              className="
                absolute
                left-4
                md:left-10
                z-20
                text-white/70
                hover:text-[#D4A85A]
                transition-colors
              "

              aria-label="Previous image"
            >
              <ChevronLeft size={40} />
            </button>



            {/* NEXT */}

            <button
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}

              className="
                absolute
                right-4
                md:right-10
                z-20
                text-white/70
                hover:text-[#D4A85A]
                transition-colors
              "

              aria-label="Next image"
            >
              <ChevronRight size={40} />
            </button>



            {/* IMAGE + CONTENT */}

            <motion.div
              key={current.id}

              initial={{
                opacity: 0,
                scale: 0.94,
              }}

              animate={{
                opacity: 1,
                scale: 1,
              }}

              transition={{
                duration: 0.4,
              }}

              onClick={(event) =>
                event.stopPropagation()
              }

              className="
                max-w-5xl
                w-full
                max-h-[90vh]
                flex
                flex-col
                items-center
              "
            >

              {/* FULL IMAGE */}

              <img
                src={current.image}
                alt={current.title}
                className="
                  max-h-[72vh]
                  max-w-full
                  w-auto
                  rounded-sm
                  shadow-2xl
                  object-contain
                "
              />


              {/* IMAGE DETAILS */}

              <div
                className="
                  text-center
                  mt-5
                "
              >

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    text-[#D4A85A]
                    mb-2
                  "
                >
                  {current.category}
                </p>


                <p
                  className="
                    font-display
                    text-2xl
                    text-white
                  "
                >
                  {current.title}
                </p>


                <p
                  className="
                    text-white/60
                    text-sm
                    mt-2
                    max-w-md
                    mx-auto
                  "
                >
                  {current.excerpt}
                </p>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </main>
  );
}