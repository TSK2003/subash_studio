import { useMemo, useState } from "react";
import LightGallery from "lightgallery/react";

import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import Seo from "../components/Seo";
import {
  galleryCategories as defaultCategories,
  galleryImages as defaultGalleryImages,
} from "../data/gallery";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Gallery() {
  const { gallery } = useAdminData();
  const [active, setActive] = useState("All");

  const images = useMemo(() => {
    if (gallery && gallery.length > 0) {
      return gallery
        .filter((item) => item.published !== false)
        .map((item) => ({
          ...item,
          src: item.imageUrl || item.src || "/public/images/gallery/wedding-1.jpg",
          title: item.title || item.caption || item.category || "Subash Studio",
        }));
    }
    return defaultGalleryImages;
  }, [gallery]);

  const categories = useMemo(() => {
    if (gallery && gallery.length > 0) {
      const cats = Array.from(new Set(images.map((img) => img.category).filter(Boolean)));
      return ["All", ...cats];
    }
    return defaultCategories;
  }, [gallery, images]);

  const filtered = useMemo(() => {
    if (active === "All") {
      return images;
    }
    return images.filter((image) => image.category === active);
  }, [active, images]);


  return (
    <>
      <Seo
        title="Gallery | SUBASH STUDIO"
        description="Explore the photography gallery of SUBASH STUDIO."
      />


      {/* =====================================================
          GALLERY INTRO
      ===================================================== */}

      <section className="pt-40 pb-16 max-w-7xl mx-auto px-6 lg:px-10">

        <div className="max-w-3xl">

          <p className="eyebrow text-gold-dark mb-4">
            Browse The Gallery
          </p>

          <h1 className="font-display text-5xl md:text-6xl text-ink leading-tight">
            Timeless stories.
            <br />
            One studio.
          </h1>

          <p className="mt-5 text-sm md:text-base text-ink-soft max-w-2xl leading-relaxed">
            Filter by occasion to browse imagery from
            SUBASH STUDIO sessions, or explore our complete
            photography collection below.
          </p>

        </div>

      </section>



      {/* =====================================================
          CATEGORY FILTER
      ===================================================== */}

      <section className="sticky top-0 z-30 bg-bg/95 backdrop-blur-md border-b border-line">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="py-5 flex gap-3 overflow-x-auto no-scrollbar">

            {categories.map((category) => (

              <button
                key={category}
                onClick={() => setActive(category)}
                className={`
                  px-4 py-2
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
                      ? "bg-ink text-bg-soft border-ink"
                      : "border-line text-ink-soft hover:border-gold hover:text-gold-dark"
                  }
                `}
              >
                {category}
              </button>

            ))}

          </div>

        </div>

      </section>



      {/* =====================================================
          GALLERY GRID
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">

        <LightGallery
          plugins={[
            lgZoom,
            lgThumbnail,
          ]}
          speed={500}
          download={false}
          elementClassNames="
            columns-1
            sm:columns-2
            lg:columns-4
            gap-5
            space-y-5
          "
        >

          {filtered.map((image) => (

            <a
              key={image.id}

              href={image.src}

              className="
                group
                relative
                block
                w-full
                break-inside-avoid
                rounded-md
                overflow-hidden
                shadow-card
                cursor-zoom-in
                mb-5
              "

              data-sub-html={`
                <div>
                  <p class="lg-caption">
                    ${image.category}
                  </p>
                  <p>
                    ${image.title}
                  </p>
                </div>
              `}
            >

              {/* =================================================
                  MAIN IMAGE
              ================================================= */}

              <img
                src={image.src}
                alt={`${image.title} - SUBASH STUDIO`}
                loading="lazy"

                className="
                  w-full
                  h-auto
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-105
                "
              />


              {/* =================================================
                  HOVER OVERLAY
              ================================================= */}

              <div
                className="
                  absolute
                  inset-0
                  bg-ink/0
                  group-hover:bg-ink/25
                  transition-all
                  duration-500
                "
              />


              {/* =================================================
                  CATEGORY LABEL
              ================================================= */}

              <span
                className="
                  absolute
                  bottom-3
                  left-3
                  text-[11px]
                  tracking-[0.1em]
                  uppercase
                  text-bg-soft
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-300
                  bg-ink/60
                  backdrop-blur-sm
                  px-3
                  py-1.5
                  rounded-full
                "
              >
                {image.category}
              </span>

            </a>

          ))}

        </LightGallery>

      </section>

    </>
  );
}