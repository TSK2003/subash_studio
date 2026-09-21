import React, { useState, useRef, useEffect } from "react";
import { Upload, Film, CheckCircle2, AlertCircle, X, RotateCcw, Play } from "lucide-react";
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

export default function VideoUploader({ value, onChange, disabled }) {
  const [uploadState, setUploadState] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({ loaded: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    setErrorMessage("");

    // Validate size (100MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File is too large (${formatBytes(file.size)}). The maximum video file size is 100MB.`
      );
      setUploadState("error");
      return;
    }

    // Validate extension & type
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setErrorMessage(
        "Invalid video file format. Only MP4, WebM, and QuickTime (MOV) files are supported."
      );
      setUploadState("error");
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file) => {
    setUploadState("uploading");
    setUploadProgress(0);
    setUploadStats({ loaded: 0, total: file.size });
    setSelectedFileName(file.name);
    setErrorMessage("");
    setPreviewFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "films/videos");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await uploadWithProgress("/api/uploads/video", formData, {
        signal: controller.signal,
        onProgress: ({ percent, loaded, total }) => {
          setUploadProgress(percent);
          setUploadStats({ loaded, total });
        },
      });

      if (res && res.url) {
        setUploadState("success");
        setUploadProgress(100);
        // Inform parent of new URL only after confirmed storage success!
        onChange(res.url, {
          filename: res.filename || file.name,
          size: res.size || file.size,
          storage: res.storage,
        });
      } else {
        throw new Error("Upload response did not contain a valid file URL.");
      }
    } catch (err) {
      if (err.name === "AbortError" || err.message?.includes("aborted") || err.message?.includes("cancelled")) {
        setErrorMessage("Upload was cancelled.");
      } else {
        setErrorMessage(err.message || "Video upload failed. Please try again.");
      }
      setUploadState("error");
    } finally {
      abortControllerRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRemove = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setSelectedFileName("");
    setPreviewFile(null);
    setErrorMessage("");
    onChange("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled || uploadState === "uploading") return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // If a video URL is already present and not currently uploading
  const hasExistingVideo = Boolean(value) && uploadState !== "uploading";

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
        className="hidden"
        disabled={disabled || uploadState === "uploading"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Case 1: Video Already Attached & Idle */}
      {hasExistingVideo && (
        <div className="p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E7E0D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#C9A669]/20 text-[#9C7B3D] flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2B2B2B] truncate">
                  {selectedFileName || value.split("/").pop()}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-[#6F6A62] truncate mt-0.5">{value}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E7E0D2] text-[#2B2B2B] hover:bg-[#F2ECE4] hover:border-[#C9A669] transition-colors"
            >
              Replace Video
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="p-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title="Remove video"
              aria-label="Remove video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Upload in Progress (Real Progress) */}
      {uploadState === "uploading" && (
        <div className="p-4 bg-[#F8F6F2] rounded-xl border border-[#C9A669] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#C9A669]/20 text-[#9C7B3D] flex items-center justify-center shrink-0 animate-pulse">
                <Upload className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2B2B2B] truncate">{selectedFileName}</p>
                <p className="text-[11px] text-[#6F6A62]">
                  Uploading... {formatBytes(uploadStats.loaded)} / {formatBytes(uploadStats.total)} ({uploadProgress}%)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelUpload}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white rounded-lg border border-[#E7E0D2] hover:border-rose-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Actual progress bar */}
          <div className="w-full bg-[#E7E0D2] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#C9A669] h-full rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Case 3: Empty State / Drag & Drop Dropzone */}
      {!hasExistingVideo && uploadState !== "uploading" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer group p-6 rounded-xl border-2 border-dashed border-[#E7E0D2] hover:border-[#C9A669] bg-[#F8F6F2]/60 hover:bg-[#F8F6F2] transition-all flex flex-col items-center justify-center text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-[#C9A669]/10 text-[#9C7B3D] group-hover:scale-110 flex items-center justify-center transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2B2B2B]">
              Click to upload or drag and drop video
            </p>
            <p className="text-[11px] text-[#6F6A62] mt-0.5">
              MP4, WebM, or QuickTime (MOV) up to 100MB
            </p>
          </div>
        </div>
      )}

      {/* Error state alert with retry */}
      {uploadState === "error" && errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-0.5 bg-white border border-rose-300 rounded text-rose-700 font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
