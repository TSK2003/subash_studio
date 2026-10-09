import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, Check, Link2, Loader2, Eye } from "lucide-react";
import api from "../../lib/api.js";

export default function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  helpText = "PNG, JPG, WEBP up to 25MB.",
  category = "general",
  aspect = "landscape",
  onDimensionsDetected,
  showView = true,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [dimensions, setDimensions] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const detectedOrientation = h > w ? "portrait" : "landscape";
      setDimensions({ width: w, height: h, orientation: detectedOrientation });
      if (onDimensionsDetected) {
        onDimensionsDetected({ width: w, height: h, orientation: detectedOrientation });
      }
    };
    img.src = value;
  }, [value, onDimensionsDetected]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.uploadWithProgress(
        `/api/uploads?category=${encodeURIComponent(category)}`,
        formData,
        {
          onProgress: ({ percent }) => {
            if (percent < 100) {
              setUploadStatus(`Uploading (${percent}%)...`);
            } else {
              setUploadStatus("Optimizing image...");
            }
          },
        }
      );

      if (res && res.url) {
        setUploadStatus("Upload complete");
        onChange(res.url);
        if (res.width && res.height && onDimensionsDetected) {
          onDimensionsDetected({
            width: res.width,
            height: res.height,
            orientation: res.height > res.width ? "portrait" : "landscape",
          });
        }
      } else {
        throw new Error("Server did not return an image URL.");
      }
    } catch (err) {
      console.warn("Upload to backend API failed, using client data URL as fallback:", err.message);
      // Fallback to client reader if backend server is temporarily unreachable
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
      setUploadError("Image cached locally (backend upload failed).");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadStatus("");
      }, 600);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setUseUrlInput(false);
    }
  };

  const isPortrait = aspect === "portrait";
  const containerAspectClasses = isPortrait
    ? "aspect-[3/4] max-h-72 w-full max-w-[280px] mx-auto"
    : "aspect-[16/10] max-h-56 w-full";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {showView && value && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-gray-900 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              title="View full-size photo"
            >
              <Eye className="w-3.5 h-3.5 text-gray-700" />
              <span>View</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setUseUrlInput(!useUrlInput)}
            className="text-xs text-gray-900 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-gray-700" />
            {useUrlInput ? "Upload File instead" : "Use Image URL"}
          </button>
        </div>
      </div>

      {useUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg or /images/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        <div className={`relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 transition-all duration-300 flex items-center justify-center ${containerAspectClasses}`}>
          <img
            src={value}
            alt="Uploaded Preview"
            onClick={() => showView && setIsPreviewOpen(true)}
            className={`w-full h-full ${
              isPortrait ? "object-contain bg-black/5" : "object-cover"
            } transition-all duration-300 ${showView ? "cursor-pointer" : ""}`}
          />
          {/* Orientation Badge Overlay */}
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10 transition-opacity">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-xs">
              <span
                className={`inline-block border border-current rounded-[1px] ${
                  isPortrait ? "w-1.5 h-2.5" : "w-2.5 h-1.5"
                }`}
              />
              <span>{isPortrait ? "Portrait (Vertical)" : "Landscape (Horizontal)"}</span>
            </span>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2 z-20 backdrop-blur-[2px]">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span className="font-medium text-white">{uploadStatus || "Optimizing image..."}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
            {showView && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium shadow hover:bg-gray-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="View full-size photo"
              >
                <Eye className="w-3.5 h-3.5 text-gray-700" />
                <span>View</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium shadow hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-rose-600 text-white rounded-lg text-xs shadow hover:bg-rose-700 transition-all active:scale-95 cursor-pointer"
              aria-label="Remove image"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            dragActive
              ? "border-gray-900 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
          }`}
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {uploading ? (uploadStatus || "Optimizing image...") : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
          {uploadError && (
            <p className="text-xs text-amber-600 mt-2 font-medium">{uploadError}</p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Lightbox Preview Modal via Portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isPreviewOpen && value && (
              <div
                className="admin-portal fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-label={label || "Image Preview"}
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsPreviewOpen(false)}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
                />

                {/* Centered Lightbox Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-10 w-fit max-w-[94vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col items-center bg-[#171614]/95 border border-[#3D3A34]/90 rounded-2xl px-4 pt-11 pb-4 sm:px-6 sm:pt-12 sm:pb-5 shadow-2xl overflow-hidden backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button Inside Modal Boundary (Top-Right) */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 p-2 text-white/75 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all shadow-sm cursor-pointer"
                    title="Close (Esc)"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Top Label & Details Header */}
                  <div className="absolute top-3 left-4 sm:left-6 z-20 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#E4D3A6]">
                      {label}
                    </span>
                    {dimensions && (
                      <span className="text-[10px] text-white/50 border-l border-white/20 pl-2">
                        {dimensions.width} × {dimensions.height}px
                      </span>
                    )}
                  </div>

                  {/* Image Container with object-contain */}
                  <div className="w-full flex items-center justify-center overflow-hidden min-h-0 flex-1">
                    <img
                      src={value}
                      alt={label || "Preview"}
                      className="max-w-full max-h-[66vh] sm:max-h-[72vh] object-contain rounded-xl shadow-lg border border-white/5"
                    />
                  </div>

                  {/* Content Below Image */}
                  <div className="mt-3 sm:mt-3.5 text-center text-white shrink-0 px-2 space-y-0.5">
                    <p className="text-xs text-[#E4D3A6] tracking-wider uppercase font-medium">
                      {dimensions?.orientation
                        ? `${dimensions.orientation.toUpperCase()} ORIENTATION`
                        : "IMAGE PREVIEW"}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
