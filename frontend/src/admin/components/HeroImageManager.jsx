import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  AlertCircle,
  X,
  Repeat,
  Eye,
  EyeOff,
  Maximize2,
} from "lucide-react";
import { uploadWithProgress } from "../../lib/api";

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function HeroImageManager({
  images = [],
  onChange,
  loopEnabled = true,
  onLoopChange,
  disabled = false,
  onUploadingStateChange,
}) {
  const [activeUploads, setActiveUploads] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllersRef = useRef({});

  // Notify parent if active uploads are running
  useEffect(() => {
    if (onUploadingStateChange) {
      onUploadingStateChange(activeUploads.length > 0);
    }
  }, [activeUploads, onUploadingStateChange]);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((ctrl) => {
        try {
          ctrl.abort();
        } catch {}
      });
    };
  }, []);

  const handleFilesChosen = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage("");

    const files = Array.from(fileList);
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMessage(
          `"${file.name}" exceeds the 25MB limit (${formatBytes(file.size)}).`
        );
        continue;
      }
      const lowerName = file.name.toLowerCase();
      const hasValidExt = ALLOWED_EXTENSIONS.some((ext) =>
        lowerName.endsWith(ext)
      );
      const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);
      if (!hasValidExt && !hasValidMime) {
        setErrorMessage(
          `"${file.name}" has an unsupported format. Please upload JPG, PNG, or WebP images.`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Start uploads concurrently for all valid selected files
    for (const file of validFiles) {
      uploadSingleImage(file);
    }
  };

  const uploadSingleImage = async (file) => {
    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const controller = new AbortController();
    abortControllersRef.current[uploadId] = controller;

    // Add to active uploads
    setActiveUploads((prev) => [
      ...prev,
      {
        id: uploadId,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        loaded: 0,
        total: file.size,
        status: "uploading",
      },
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "general/hero");

    try {
      const res = await uploadWithProgress("/api/uploads?category=general/hero", formData, {
        signal: controller.signal,
        onProgress: ({ percent, loaded, total }) => {
          setActiveUploads((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, progress: percent, loaded, total }
                : item
            )
          );
        },
      });

      if (res && res.url) {
        // Successfully uploaded! Create persistent hero image item
        const newImageItem = {
          id: `himg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: res.url,
          name: res.originalname || file.name,
          order: images.length,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Remove from active uploads
        setActiveUploads((prev) => prev.filter((item) => item.id !== uploadId));

        // Append to images in parent
        onChange((prevImages) => {
          const current = Array.isArray(prevImages) ? prevImages : images;
          return [...current, newImageItem].map((img, idx) => ({
            ...img,
            order: idx,
          }));
        });
      } else {
        throw new Error("Server response did not return a valid image URL.");
      }
    } catch (err) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        // Cancelled by user, silently remove
        setActiveUploads((prev) => prev.filter((item) => item.id !== uploadId));
      } else {
        setErrorMessage(
          err.message || "Unable to upload image. Please try again."
        );
        setActiveUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: "error", error: err.message }
              : item
          )
        );
      }
    } finally {
      delete abortControllersRef.current[uploadId];
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelUpload = (uploadId) => {
    const ctrl = abortControllersRef.current[uploadId];
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {}
    }
    setActiveUploads((prev) => prev.filter((item) => item.id !== uploadId));
  };

  const handleDeleteImage = (indexToDelete) => {
    const filtered = images.filter((_, idx) => idx !== indexToDelete);
    const reordered = filtered.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    onChange(reordered);
  };

  const handleToggleActive = (index) => {
    const updated = images.map((item, idx) =>
      idx === index ? { ...item, active: item.active === false } : item
    );
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index >= images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  // Drag and drop reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...images];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      {/* Hidden Multi-file Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFilesChosen(e.target.files)}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              HERO IMAGES
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload and manage the images displayed in the homepage hero section slideshow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Loop Slideshow Control */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={Boolean(loopEnabled)}
              onChange={(e) => onLoopChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded text-black focus:ring-black border-gray-300 accent-black cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Repeat className="w-3.5 h-3.5 text-gray-500" />
              <span>Loop Slideshow</span>
            </div>
          </label>

          {/* + Add Images Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Images</span>
          </button>
        </div>
      </div>

      {/* Helper explanation for slideshow mode */}
      <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2">
        <span>
          {loopEnabled
            ? "Loop ON: Slideshow transitions through images (1 → 2 → 3 → 1...) continuously without stopping."
            : "Loop OFF: Slideshow transitions through images once (1 → 2 → 3), then remains on the final image."}
        </span>
        <span className="text-[10px] text-gray-400">Drag or use arrows to reorder</span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-2 text-rose-700 text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-rose-500 hover:text-rose-700 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Uploads in Progress */}
      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {activeUploads.map((upl) => (
            <div
              key={upl.id}
              className="p-3 bg-gray-50 rounded-xl border border-gray-900 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 animate-pulse">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {upl.fileName}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Uploading... {formatBytes(upl.loaded)} /{" "}
                      {formatBytes(upl.total)} ({upl.progress}%)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCancelUpload(upl.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white rounded-lg border border-gray-200 hover:border-rose-300 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-black h-full rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, upl.progress))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && activeUploads.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer group p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center space-y-2 select-none"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 flex items-center justify-center transition-transform">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">
              No hero images uploaded yet
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Click &quot;+ Add Images&quot; to upload JPG, PNG, or WebP images (up to 25MB each).
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              When no images are uploaded, the landing page safely falls back to the default wedding background image.
            </p>
          </div>
        </div>
      )}

      {/* Images List / Cards */}
      {images.length > 0 && (
        <div className="space-y-2.5">
          {images.map((image, index) => (
            <div
              key={image.id || image.url || index}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3 bg-white rounded-xl border ${
                draggedIndex === index
                  ? "border-gray-900 opacity-50 bg-gray-100"
                  : "border-gray-200 hover:border-gray-300"
              } shadow-xs flex items-center justify-between gap-3 transition-all ${
                image.active === false ? "opacity-60" : ""
              }`}
            >
              {/* Left drag handle & image preview */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-900 p-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <span className="w-6 text-center text-xs font-bold text-gray-700 bg-gray-100 rounded-md py-0.5 border border-gray-200 shrink-0">
                  #{index + 1}
                </span>

                {/* Thumbnail */}
                <div
                  onClick={() => setPreviewImage(image)}
                  className="relative w-16 h-12 rounded-lg overflow-hidden bg-black/5 border border-gray-200 shrink-0 cursor-pointer group/thumb"
                  title="Click to preview"
                >
                  <img
                    src={image.url}
                    alt={image.name || `Hero Slide ${index + 1}`}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      if (e.currentTarget.src !== "/images/storefront.jpg") {
                        e.currentTarget.src = "/images/storefront.jpg";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Name & Details */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2B2B2B] truncate max-w-xs sm:max-w-sm md:max-w-md">
                    {image.name || `Hero Image ${index + 1}`}
                  </p>
                  <p className="text-[11px] text-[#6F6A62]">
                    Slide {index + 1} of {images.length}
                    {image.active === false && (
                      <span className="ml-2 text-amber-600 font-semibold">(Hidden from slideshow)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Active Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(index)}
                  disabled={disabled}
                  title={image.active === false ? "Show in slideshow" : "Hide from slideshow"}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    image.active === false
                      ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                      : "bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-400"
                  }`}
                >
                  {image.active === false ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={disabled || index === 0}
                  title="Move up"
                  className="p-1.5 bg-white text-gray-500 hover:text-gray-900 rounded-lg border border-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={disabled || index === images.length - 1}
                  title="Move down"
                  className="p-1.5 bg-white text-gray-500 hover:text-gray-900 rounded-lg border border-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  disabled={disabled}
                  title="Delete image"
                  className="p-1.5 bg-white text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-gray-200 hover:border-rose-300 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-[#1C1B19] rounded-2xl overflow-hidden border border-[#E4D3A6]/40 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
              <span className="text-xs font-semibold text-[#E4D3A6] truncate pr-4">
                {previewImage.name || "Hero Image Preview"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.name || "Preview"}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
