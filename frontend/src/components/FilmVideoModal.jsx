import React, { useState, useEffect, useMemo, useRef } from "react";
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
    const videoId = ytMatch[1];
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      iv_load_policy: "3",
      playsinline: "1",
      enablejsapi: "1",
    });
    return {
      provider: "youtube",
      type: "embed",
      embedUrl: `https://www.youtube.com/embed/${videoId}?${params.toString()}`,
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
  const playerContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Close on Escape key press & body scroll locking
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

  // Measure player container size reactively to adapt 16:9 iframe without pushing viewport
  useEffect(() => {
    if (!isOpen) return;

    const updateSize = () => {
      if (playerContainerRef.current) {
        const { clientWidth, clientHeight } = playerContainerRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined" && playerContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(playerContainerRef.current);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [isOpen, film]);

  const calculatedIframeSize = useMemo(() => {
    const { width: W, height: H } = containerSize;
    if (!W || !H) return { width: "100%", height: "auto" };

    // Standard 16:9 aspect ratio contain-fit within available W and H
    let targetWidth = W;
    let targetHeight = W * (9 / 16);

    if (targetHeight > H) {
      targetHeight = H;
      targetWidth = H * (16 / 9);
    }

    return {
      width: `${Math.floor(targetWidth)}px`,
      height: `${Math.floor(targetHeight)}px`,
    };
  }, [containerSize]);

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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="film-video-title"
        >
          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          >
            {/* Header: Video Details + Accessible Close Action */}
            <div className="shrink-0 max-h-[35vh] overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-4 bg-[#181818] border-b border-white/10 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                {/* 1. Category badge, duration and quality badge */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A669]/15 text-[#D4B37A] border border-[#C9A669]/30">
                    <FilmIcon className="w-3 h-3" />
                    {film.category || film.type || "Film"}
                  </span>
                  {film.duration && (
                    <span className="text-[11px] font-mono font-medium text-white/70 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {film.duration}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                    {film.quality || (videoSourceInfo?.type === "upload" ? "HD Master" : "4K Ultra HD")}
                  </span>
                </div>

                {/* 2. Video title */}
                <h2
                  id="film-video-title"
                  className="font-display font-bold text-base sm:text-lg md:text-xl text-white tracking-wide leading-snug"
                >
                  {film.title}
                </h2>

                {/* 3. Video description */}
                {film.description && (
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-3xl">
                    {film.description}
                  </p>
                )}
              </div>

              {/* Close Action on the right side of header */}
              <div className="shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close video player"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center gap-1.5 transition-all duration-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs font-semibold tracking-wider">Close</span>
                </button>
              </div>
            </div>

            {/* Video Player Container */}
            <div
              ref={playerContainerRef}
              className="flex-1 min-h-0 w-full bg-black flex items-center justify-center overflow-hidden relative"
            >
              {videoSourceInfo?.type === "upload" && (
                <video
                  ref={videoRef}
                  src={videoSourceInfo.src}
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full max-h-full max-w-full object-contain bg-black"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              )}

              {(videoSourceInfo?.type === "embed" || videoSourceInfo?.embedUrl) && (
                <div
                  className="relative bg-black flex items-center justify-center transition-all duration-150"
                  style={{
                    width: calculatedIframeSize.width,
                    height: calculatedIframeSize.height,
                    aspectRatio: "16 / 9",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                >
                  <iframe
                    src={videoSourceInfo.embedUrl}
                    title={film.title || "Film playback"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
