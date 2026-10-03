import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Share2,
  Check,
  Maximize2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import LightGallery from "lightgallery/react";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import Seo from "../components/Seo";
import api from "../lib/api";
import { useAdminData } from "../admin/context/AdminDataContext";

/**
 * Normalize image URLs, converting Windows backslashes and trimming whitespace
 */
function normalizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\\/g, "/");
}

/**
 * Extract robust full-size and thumbnail URLs from any supported photo record shape
 */
function extractPhotoUrls(photo) {
  if (!photo) return { src: "", thumb: "" };
  if (typeof photo === "string") {
    const u = normalizeUrl(photo);
    const fallbackThumb = u.endsWith(".webp") && !u.includes("-thumb.webp") ? u.replace(/\.webp$/, "-thumb.webp") : u;
    return { src: u, thumb: fallbackThumb };
  }
  const src = normalizeUrl(
    photo.url ||
    photo.imageUrl ||
    photo.src ||
    photo.image ||
    photo.fullUrl ||
    ""
  );

  let fallbackThumb = src;
  if (src && src.endsWith(".webp") && !src.includes("-thumb.webp") && !src.includes("-md.webp")) {
    fallbackThumb = src.replace(/\.webp$/, "-thumb.webp");
  }

  const thumb = normalizeUrl(
    photo.thumbnailUrl ||
    photo.thumb ||
    photo.thumbnail ||
    photo.previewUrl ||
    fallbackThumb
  );
  return { src, thumb };
}

export default function AlbumDetail() {
  const { albumSlug } = useParams();
  const location = useLocation();
  const { albums } = useAdminData();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const lightGalleryRef = useRef(null);

  const onInit = useCallback((detail) => {
    if (detail) {
      lightGalleryRef.current = detail.instance;
    }
  }, []);

  // Determine back destination category if passed in navigation state
  const fromCategory = location.state?.fromCategory || "";
  const backUrl = fromCategory && fromCategory !== "All"
    ? `/gallery?category=${encodeURIComponent(fromCategory)}`
    : "/gallery";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchAlbum() {
      try {
        // Attempt to fetch album detail with all photos from API
        const data = await api.get(`/api/gallery/albums/${albumSlug}`);
        if (!isMounted) return;

        if (data && data.id) {
          setAlbum(data);
        } else {
          setError("Album not found or unavailable.");
        }
      } catch (err) {
        if (!isMounted) return;
        // Fallback: check if album is already in AdminData albums cache
        const localAlbum = albums.find(
          (a) => a.slug === albumSlug || a.id === albumSlug
        );
        if (localAlbum) {
          setAlbum(localAlbum);
        } else {
          setError(
            err.response?.status === 404
              ? "This album does not exist or has been made private."
              : "Unable to load album. Please check your connection."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (albumSlug) {
      fetchAlbum();
    }

    return () => {
      isMounted = false;
    };
  }, [albumSlug, albums]);

  // Extract ordered list of valid photos with robust source URLs
  const validPhotos = useMemo(() => {
    if (!Array.isArray(album?.photos)) return [];
    return album.photos
      .map((photo, index) => {
        const { src, thumb } = extractPhotoUrls(photo);
        return {
          ...photo,
          id: photo.id || `photo-${index}`,
          url: src,
          thumbUrl: thumb,
          caption: photo.caption || "",
        };
      })
      .filter((photo) => Boolean(photo.url));
  }, [album?.photos]);

  // Synchronize lightGallery when async photos are loaded
  useEffect(() => {
    if (validPhotos.length > 0 && lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [validPhotos]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${album?.title || "Album"} | SUBASH STUDIO`,
        text: `Explore ${album?.title} photography album by SUBASH STUDIO`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#C9A669] border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-[#8C6D32]">
            Loading Album Stories...
          </p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen pt-40 pb-24 max-w-4xl mx-auto px-6 text-center">
        <Seo
          title="Album Not Found | SUBASH STUDIO"
          description="The requested photography album is unavailable or does not exist."
        />
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 sm:p-14 border border-[#E7E0D2] shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A669]/10 text-[#C9A669] mx-auto flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1C1B19] mb-3">
            Album Unavailable
          </h1>
          <p className="text-sm text-[#736B5E] mb-8 leading-relaxed">
            {error || "The event album you are looking for is unpublished, private, or does not exist."}
          </p>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1B19] text-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#C9A669] transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            <span>Return to Gallery</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${album.title} | ${album.category} Album | SUBASH STUDIO`}
        description={album.description || `Browse the full photography album for ${album.title} (${album.category}) by SUBASH STUDIO.`}
      />

      <article className="min-h-screen pt-32 sm:pt-36 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.15em] text-[#736B5E] hover:text-[#C9A669] transition-colors group"
          >
            <span className="p-2 rounded-full bg-white/70 border border-[#E7E0D2] group-hover:border-[#C9A669] transition-colors shadow-sm">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span>Back to Gallery</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-[#E7E0D2] hover:border-[#C9A669]/40 text-xs font-semibold text-[#1C1B19] shadow-sm transition-all"
            title="Share Album"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} className="text-[#C9A669]" />
                <span>Share Album</span>
              </>
            )}
          </button>
        </div>

        {/* Album Header Banner */}
        <header className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] bg-[#C9A669]/15 text-[#9C7B3D] border border-[#C9A669]/30">
              {album.category}
            </span>
            <span className="text-xs text-[#8C8270] flex items-center gap-1.5 font-medium">
              <Camera size={13} className="text-[#C9A669]" />
              {validPhotos.length} {validPhotos.length === 1 ? "Photograph" : "Photographs"}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1B19] leading-tight font-normal">
            {album.title}
          </h1>

          {album.description && (
            <p className="mt-4 text-sm sm:text-base text-[#6E6659] max-w-3xl leading-relaxed">
              {album.description}
            </p>
          )}

          <div className="mt-6 h-px w-full bg-gradient-to-r from-[#C9A669]/40 via-[#E7E0D2] to-transparent" />
        </header>

        {/* Photo Count & Lightbox Hint */}
        <div className="flex items-center justify-between text-xs text-[#8C8270] mb-6">
          <span className="tracking-wide">
            Natural aspect viewing • Click any photo to expand full-screen
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#9C7B3D]">
            <Sparkles size={13} />
            <span>Curated Collection</span>
          </span>
        </div>

        {/* Responsive Masonry Layout Preserving Natural Aspect Ratios */}
        {validPhotos.length > 0 ? (
          <LightGallery
            key={album.id || albumSlug}
            onInit={onInit}
            plugins={[lgZoom, lgThumbnail]}
            speed={400}
            download={false}
            selector=".gallery-photo-item"
            elementClassNames="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 sm:gap-6 [column-fill:_balance]"
          >
            {validPhotos.map((photo, index) => {
              const captionHtml = `<div class="lightgallery-caption"><h4 class="font-display text-base font-semibold text-white">${album.title || "Album"}</h4>${photo.caption ? `<p class="text-xs text-gray-300 mt-1">${photo.caption}</p>` : ""}<span class="text-[10px] text-amber-300 uppercase tracking-widest mt-1 block">${album.category || ""}</span></div>`;

              return (
                <div
                  key={photo.id || index}
                  className="break-inside-avoid mb-5 sm:mb-6 group"
                >
                  <a
                    href={photo.url}
                    data-src={photo.url}
                    data-thumb={photo.thumbUrl || photo.url}
                    data-sub-html={captionHtml}
                    className="gallery-photo-item block relative overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#E7E0D2]/90 shadow-sm hover:shadow-lg transition-all duration-300 cursor-zoom-in group"
                  >
                    <img
                      src={photo.thumbUrl || photo.url}
                      alt={photo.caption || `${album.title} photo ${index + 1}`}
                      loading="lazy"
                      className="w-full h-auto block object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      onError={(e) => {
                        if (e.currentTarget.src !== photo.url) {
                          e.currentTarget.src = photo.url;
                        }
                      }}
                    />

                    {/* Micro overlay on hover with subtle gold accent & zoom indicator */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="self-end p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                        <Maximize2 size={14} />
                      </div>
                      {photo.caption && (
                        <p className="text-white text-xs font-medium tracking-wide drop-shadow line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </a>
                </div>
              );
            })}
          </LightGallery>
        ) : (
          <div className="py-20 text-center bg-white/60 rounded-3xl border border-[#E7E0D2]">
            <Camera size={36} className="mx-auto text-[#C9A669]/60 mb-3" />
            <h3 className="font-display text-lg text-[#1C1B19]">No photographs in this album yet</h3>
            <p className="text-xs text-[#8C8270] mt-1">
              Photographs will appear here once published by the studio.
            </p>
          </div>
        )}

        {/* Bottom Back Button & Booking CTA Banner */}
        <div className="mt-16 pt-10 border-t border-[#E7E0D2] flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.14em] text-[#1C1B19] hover:text-[#C9A669] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Albums</span>
          </Link>

          <Link
            to="/order-booking"
            className="px-8 py-3.5 rounded-full bg-[#B38F4D] hover:bg-[#9C7B3D] text-white text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 shadow-md hover:scale-[1.02]"
          >
            Book Your Shoot
          </Link>
        </div>
      </article>
    </>
  );
}
