import React, { useState, useRef, useEffect } from "react";
import {
  Film,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  Repeat,
} from "lucide-react";
import { uploadWithProgress } from "../../lib/api";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov"];
const ALLOWED_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Extracts video duration from File or URL using a hidden video element
 */
function getVideoDuration(source) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      const isFile = source instanceof File;
      const objectUrl = isFile ? URL.createObjectURL(source) : source;

      video.onloadedmetadata = () => {
        const dur = video.duration;
        if (isFile) URL.revokeObjectURL(objectUrl);
        if (!dur || isNaN(dur) || !isFinite(dur)) {
          resolve("00:00");
          return;
        }
        const mins = Math.floor(dur / 60);
        const secs = Math.floor(dur % 60);
        resolve(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      };

      video.onerror = () => {
        if (isFile) URL.revokeObjectURL(objectUrl);
        resolve("00:00");
      };

      video.src = objectUrl;
    } catch {
      resolve("00:00");
    }
  });
}

export default function HeroVideoManager({
  videos = [],
  onChange,
  loopEnabled = true,
  onLoopChange,
  disabled = false,
  onUploadingStateChange,
}) {
  const [activeUploads, setActiveUploads] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
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
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          `"${file.name}" exceeds the 100MB limit (${formatBytes(file.size)}).`
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
          `"${file.name}" has an unsupported format. Please upload MP4, WebM, or MOV.`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Start uploads concurrently for all valid selected files
    for (const file of validFiles) {
      uploadSingleVideo(file);
    }
  };

  const uploadSingleVideo = async (file) => {
    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const duration = await getVideoDuration(file);

    const controller = new AbortController();
    abortControllersRef.current[uploadId] = controller;

    // Add to active uploads
    setActiveUploads((prev) => [
      ...prev,
      {
        id: uploadId,
        fileName: file.name,
        fileSize: file.size,
        duration: duration || "00:00",
        progress: 0,
        loaded: 0,
        total: file.size,
        status: "uploading",
      },
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "films/hero");

    try {
      const res = await uploadWithProgress("/api/uploads/video", formData, {
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
        // Successfully uploaded! Create persistent hero video item
        const newVideoItem = {
          id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: res.url,
          name: res.filename || file.name,
          duration: duration || "00:00",
          order: videos.length,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Remove from active uploads
        setActiveUploads((prev) => prev.filter((item) => item.id !== uploadId));

        // Append to videos in parent
        const updatedVideos = [...videos, newVideoItem].map((v, idx) => ({
          ...v,
          order: idx,
        }));
        onChange(updatedVideos);
      } else {
        throw new Error("Server response did not return a valid video URL.");
      }
    } catch (err) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        // Cancelled by user, silently remove
        setActiveUploads((prev) => prev.filter((item) => item.id !== uploadId));
      } else {
        setErrorMessage(
          err.message || "Unable to upload video. Please try again."
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

  const handleDeleteVideo = (indexToDelete) => {
    const filtered = videos.filter((_, idx) => idx !== indexToDelete);
    const reordered = filtered.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    onChange(reordered);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...videos];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  const handleMoveDown = (index) => {
    if (index >= videos.length - 1) return;
    const updated = [...videos];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  // Drag and Drop ordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...videos];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    onChange(updated.map((item, idx) => ({ ...item, order: idx })));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFilesChosen(e.target.files)}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              HERO VIDEOS
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload and manage the videos displayed in the homepage hero section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Loop Setting Switch */}
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
              <span>Loop Hero Videos</span>
            </div>
          </label>

          {/* + Add Video Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Helper explanation for loop mode */}
      <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
        <span>
          {loopEnabled
            ? "Loop ON: Videos play sequentially (1 → 2 → 3 → 1...) continuously without stopping."
            : "Loop OFF: Videos play in sequence once (1 → 2 → 3), then remain on the final frame."}
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
                      {upl.duration !== "00:00" && ` • ${upl.duration}`}
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
      {videos.length === 0 && activeUploads.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer group p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center space-y-2 select-none"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 flex items-center justify-center transition-transform">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">
              No hero videos uploaded yet
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Click &quot;+ Add Video&quot; to upload MP4, WebM, or MOV videos (up to 100MB).
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              When no videos are uploaded, the landing page safely falls back to the default studio storefront image.
            </p>
          </div>
        </div>
      )}

      {/* Videos List / Cards */}
      {videos.length > 0 && (
        <div className="space-y-2.5">
          {videos.map((video, index) => (
            <div
              key={video.id || video.url || index}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3 bg-white rounded-xl border transition-all flex items-center justify-between gap-3 ${
                draggedIndex === index
                  ? "border-gray-900 opacity-40 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 shadow-xs"
              }`}
            >
              {/* Left: Drag handle & Order & Thumbnail Preview */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-900 transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <span className="w-5 text-center text-xs font-bold text-gray-900">
                  {index + 1}
                </span>

                {/* Video Preview Thumbnail */}
                <div className="relative w-24 sm:w-28 h-16 rounded-lg overflow-hidden bg-black border border-gray-200 shrink-0 shadow-inner group">
                  <video
                    src={video.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback display
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                    <Play className="w-4 h-4 text-white/90 drop-shadow" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[280px] md:max-w-md">
                      {video.name || video.filename || video.url.split("/").pop()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">
                      Duration: {video.duration || "00:00"}
                    </span>
                    <span className="truncate text-gray-400 max-w-[180px] sm:max-w-[240px]">
                      {video.url}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Reorder Arrows & Delete Button */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => handleMoveUp(index)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Move Up"
                  aria-label={`Move video ${index + 1} up`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={disabled || index === videos.length - 1}
                  onClick={() => handleMoveDown(index)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Move Down"
                  aria-label={`Move video ${index + 1} down`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDeleteVideo(index)}
                  className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  title="Delete Video"
                  aria-label={`Delete video ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
