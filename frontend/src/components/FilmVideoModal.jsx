import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film as FilmIcon, AlertCircle } from "lucide-react";

/**
 * Parses YouTube or Vimeo URL and returns embed URL
 */
function getEmbedDetails(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      provider: "youtube",
      type: "embed",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  const vimeoId = vimeoMatch ? vimeoMatch[1] || vimeoMatch[2] : null;
  if (vimeoId) {
    return {
      provider: "vimeo",
      type: "embed",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&autopause=0&player_id=0`,
    };
  }

  return null;
}

export default function FilmVideoModal({ isOpen, onClose, film }) {
  const videoRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Cleanly pause and stop video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const videoSourceInfo = useMemo(() => {
    if (!film || !film.videoUrl) return null;

    const isExplicitUpload = film.videoSourceType === "upload";
    const isUploadPath =
      film.videoUrl.startsWith("/uploads/") ||
      film.videoUrl.includes("/films/videos/") ||
      /\.(mp4|webm|mov)(\?.*)?$/i.test(film.videoUrl);

    if (isExplicitUpload || isUploadPath) {
      return {
        type: "upload",
        src: film.videoUrl,
      };
    }

    const embedDetails = getEmbedDetails(film.videoUrl);
    if (embedDetails) {
      return {
        type: "embed",
        ...embedDetails,
      };
    }

    // Fallback: If it's another direct video link
    if (/\.(mp4|webm|mov)$/i.test(film.videoUrl)) {
      return {
        type: "upload",
        src: film.videoUrl,
      };
    }

    return {
      type: "unknown",
      rawUrl: film.videoUrl,
    };
  }, [film]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && film && (
        <motion.div
          key="film-video-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="film-video-title"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          >
            {/* Video Player Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {videoSourceInfo?.type === "upload" && (
                <video
                  ref={videoRef}
                  src={videoSourceInfo.src}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain bg-black"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              )}

              {(videoSourceInfo?.type === "embed" || videoSourceInfo?.embedUrl) && (
                <iframe
                  src={videoSourceInfo.embedUrl}
                  title={film.title || "Film playback"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {videoSourceInfo?.type === "unknown" && (
                <div className="p-8 text-center text-white/80 max-w-md">
                  <AlertCircle className="w-12 h-12 text-[#C9A669] mx-auto mb-3" />
                  <p className="font-semibold text-base text-white mb-2">Unsupported Video Format</p>
                  <p className="text-xs text-white/60 mb-4">
                    The video source URL could not be recognized as a YouTube, Vimeo, or uploaded video file.
                  </p>
                  <a
                    href={videoSourceInfo.rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 rounded-lg bg-[#C9A669] text-[#141414] text-xs font-bold hover:bg-[#D4B37A] transition-colors"
                  >
                    Open Link in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Video Info Footer */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-[#181818] to-[#121212] border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A669]/20 text-[#E4D3A6] border border-[#C9A669]/30">
                    <FilmIcon className="w-3 h-3" />
                    {film.category || film.type || "Film"}
                  </span>
                  {film.duration && (
                    <span className="text-[11px] font-mono font-medium text-white/50">
                      {film.duration}
                    </span>
                  )}
                  {videoSourceInfo?.type === "upload" && (
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                      HD Master
                    </span>
                  )}
                </div>
                <h2 id="film-video-title" className="text-base sm:text-lg font-display font-bold text-white tracking-wide">
                  {film.title}
                </h2>
                {film.description && (
                  <p className="text-xs text-white/60 line-clamp-2 max-w-2xl leading-relaxed">
                    {film.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-wider transition-colors border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
