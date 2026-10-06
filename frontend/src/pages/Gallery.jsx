import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, Sparkles, FolderHeart } from "lucide-react";

import Seo from "../components/Seo";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Gallery() {
  const { albums, galleryCategories, loading } = useAdminData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState(initialCategory);

  // Sync category changes to URL query param
  const handleSelectCategory = (cat) => {
    setActive(cat);
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  // Only consider active categories from the database
  const activeCategories = useMemo(() => {
    if (galleryCategories && galleryCategories.length > 0) {
      return galleryCategories
        .filter((c) => c.active !== false)
        .map((c) => c.name);
    }
    return null;
  }, [galleryCategories]);

  // Set of active category names for fast case-insensitive lookup
  const activeCategorySet = useMemo(() => {
    if (activeCategories) {
      return new Set(activeCategories.map((c) => c.toLowerCase()));
    }
    return null;
  }, [activeCategories]);

  // Published albums only for public display
  const publishedAlbums = useMemo(() => {
    return (albums || []).filter((alb) => {
      if (alb.published === false) return false;
      if (activeCategorySet && alb.category) {
        return activeCategorySet.has(alb.category.trim().toLowerCase());
      }
      return true;
    });
  }, [albums, activeCategorySet]);

  // Dynamic categories list based on existing categories and albums
  const categories = useMemo(() => {
    if (activeCategories && activeCategories.length > 0) {
      return ["All", ...activeCategories];
    }
    if (publishedAlbums.length > 0) {
      const cats = Array.from(
        new Set(publishedAlbums.map((a) => a.category).filter(Boolean))
      );
      return ["All", ...cats];
    }
    return [
      "All",
      "Wedding",
      "Reception",
      "Engagement",
      "Couple Shoot",
      "Baby Shoot",
      "Maternity Shoot",
      "Birthday",
      "Puberty Ceremony",
    ];
  }, [activeCategories, publishedAlbums]);

  // Filter albums by selected category
  const filteredAlbums = useMemo(() => {
    if (active === "All") {
      return publishedAlbums;
    }
    return publishedAlbums.filter(
      (album) => (album.category || "").toLowerCase() === active.toLowerCase()
    );
  }, [active, publishedAlbums]);

  return (
    <>
      <Seo
        title="Event Albums & Gallery | SUBASH STUDIO"
        description="Explore curated photography event albums by SUBASH STUDIO. Browse luxury wedding stories, receptions, couple sessions, and memorable family milestones."
      />

      {/* =====================================================
          GALLERY HERO HEADER
      ===================================================== */}
      <section className="pt-36 sm:pt-40 pb-12 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A669]/10 border border-[#C9A669]/30 text-[#9C7B3D] text-xs uppercase font-bold tracking-[0.2em] mb-4">
            <Sparkles size={13} />
            <span>Curated Event Albums</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-[#1C1B19] leading-tight font-normal">
            Timeless stories.
            <br />
            Captured in albums.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#736B5E] max-w-2xl leading-relaxed">
            Select an event album below to explore complete high-resolution photo collections from our signature client celebrations, traditional rituals, and candid sessions.
          </p>
        </div>
      </section>

      {/* =====================================================
          CATEGORY FILTER TABS (STICKY, MOBILE USABLE)
      ===================================================== */}
      <nav
        aria-label="Album Categories"
        className="sticky top-[72px] sm:top-[80px] z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-y border-[#E7E0D2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="py-3.5 flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((category) => {
              const isSelected = active.toLowerCase() === category.toLowerCase();
              const count =
                category === "All"
                  ? publishedAlbums.length
                  : publishedAlbums.filter(
                      (a) => (a.category || "").toLowerCase() === category.toLowerCase()
                    ).length;

              return (
                <button
                  key={category}
                  onClick={() => handleSelectCategory(category)}
                  className={`
                    px-4 py-2
                    rounded-full
                    text-xs
                    tracking-[0.1em]
                    uppercase
                    font-semibold
                    whitespace-nowrap
                    transition-all
                    duration-200
                    border
                    flex items-center gap-2
                    cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A669]
                    ${
                      isSelected
                        ? "bg-[#1C1B19] text-[#FAF8F5] border-[#1C1B19] shadow-sm"
                        : "border-[#E7E0D2] text-[#736B5E] bg-white/70 hover:border-[#C9A669]/60 hover:text-[#1C1B19]"
                    }
                  `}
                >
                  <span>{category}</span>
                  <span
                    className={`
                      text-[10px] px-1.5 py-0.2 rounded-full font-mono
                      ${isSelected ? "bg-white/20 text-white" : "bg-[#E7E0D2]/60 text-[#736B5E]"}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =====================================================
          RESPONSIVE ALBUMS GRID
      ===================================================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 sm:py-20 min-h-[500px]">
        {loading && publishedAlbums.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#C9A669] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-[#8C6D32]">
              Loading Showcase Albums...
            </p>
          </div>
        ) : filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAlbums.map((album, index) => {
                const photoCount =
                  album.photoCount ||
                  album._count?.photos ||
                  album.photos?.length ||
                  0;
                const albumSlug = album.slug || album.id;

                return (
                  <motion.div
                    key={album.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Link
                      to={`/gallery/${albumSlug}`}
                      state={{ fromCategory: active }}
                      className="group block bg-white rounded-2xl overflow-hidden border border-[#E7E0D2] shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A669]"
                    >
                      {/* Album Cover with Consistent Proportion */}
                      <div className="relative aspect-[16/11] bg-[#FAF8F5] overflow-hidden">
                        <img
                          src={album.coverImage || "/images/placeholder.jpg"}
                          alt={`${album.title} - ${album.category} Album by SUBASH STUDIO`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                          onError={(e) => {
                            e.currentTarget.src = "/images/gallery/wedding/wedding-01.jpg";
                          }}
                        />

                        {/* Top Gradient & Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                        {/* Category Tag */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.16em] bg-white/95 text-[#9C7B3D] border border-[#C9A669]/40 backdrop-blur-md shadow-sm">
                            {album.category}
                          </span>
                        </div>

                        {/* Photo Count Tag */}
                        <div className="absolute top-3.5 right-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-md">
                            <Camera size={12} className="text-[#C9A669]" />
                            <span>{photoCount} {photoCount === 1 ? "photo" : "photos"}</span>
                          </span>
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="tracking-wider uppercase text-[11px] font-semibold text-white/90">
                            View Full Album
                          </span>
                          <span className="p-1 rounded-full bg-white/20 text-white">
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>

                      {/* Album Details */}
                      <div className="p-5 sm:p-6 bg-white">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9C7B3D]">
                            {album.category}
                          </p>
                        </div>

                        <h2 className="font-display text-2xl text-[#1C1B19] group-hover:text-[#C9A669] transition-colors leading-snug line-clamp-1">
                          {album.title}
                        </h2>

                        {album.description && (
                          <p className="mt-2 text-xs sm:text-[13px] text-[#736B5E] line-clamp-2 leading-relaxed">
                            {album.description}
                          </p>
                        )}

                        <div className="mt-4 pt-3.5 border-t border-[#E7E0D2]/70 flex items-center justify-between text-xs text-[#8C8270]">
                          <span className="font-medium">
                            {photoCount} {photoCount === 1 ? "Photograph" : "Photographs"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#9C7B3D] font-bold group-hover:translate-x-1 transition-transform">
                            <span>Open Album</span>
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center bg-white/70 rounded-3xl border border-[#E7E0D2] p-8 max-w-lg mx-auto">
            <FolderHeart size={42} className="mx-auto text-[#C9A669] mb-4 opacity-70" />
            <h3 className="font-display text-xl text-[#1C1B19] mb-2">
              No albums found in &ldquo;{active}&rdquo;
            </h3>
            <p className="text-xs text-[#736B5E] mb-6 leading-relaxed">
              We haven&rsquo;t published albums under this category yet. Explore other categories or browse all studio albums.
            </p>
            <button
              onClick={() => handleSelectCategory("All")}
              className="px-6 py-2.5 rounded-full bg-[#1C1B19] text-[#FAF8F5] text-xs uppercase font-bold tracking-[0.14em] hover:bg-[#C9A669] transition-colors"
            >
              View All Albums
            </button>
          </div>
        )}
      </section>
    </>
  );
}