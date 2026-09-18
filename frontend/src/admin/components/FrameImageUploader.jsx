import { useState, useRef } from "react";
import { Upload, X, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../lib/api.js";

/**
 * Compress an image file client-side using an HTML5 canvas.
 * Keeps image dimensions crisp (max 800px) while maintaining small base64 footprint (< 80KB)
 * suitable for localStorage persistence and instant rendering.
 */
function compressImage(file, maxDimension = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract a friendly display name from an image URL or fallback.
 */
function extractFileName(url, fallback = "image.jpg") {
  if (!url) return fallback;
  if (url.startsWith("data:")) return "uploaded-image.jpg";
  const parts = url.split("/");
  return parts[parts.length - 1] || fallback;
}

export default function FrameImageUploader({
  label = "Upload Image",
  value = "",
  onChange,
  fileName = "",
  helpText = "JPG, PNG or WEBP • Max 5MB",
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  maxSizeMB = 5,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayFileName, setDisplayFileName] = useState(
    fileName || extractFileName(value, "frame-texture.jpg")
  );
  const fileInputRef = useRef(null);

  const validateAndProcessFile = async (file) => {
    setError("");

    if (!file) return;

    // Check file format
    const isValidType =
      acceptedTypes.includes(file.type.toLowerCase()) ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isValidType) {
      setError("Unsupported format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    // Check file size (5MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`);
      return;
    }

    try {
      setIsProcessing(true);
      setDisplayFileName(file.name);

      // Attempt backend API upload
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.upload("/api/uploads?category=frames/catalog", formData);
        if (res && res.url) {
          if (onChange) {
            onChange(res.url, file.name);
          }
          return;
        }
      } catch (uploadErr) {
        console.warn("Backend frame image upload failed, falling back to local canvas:", uploadErr.message);
      }

      const compressedDataUrl = await compressImage(file, 800, 0.82);
      if (onChange) {
        onChange(compressedDataUrl, file.name);
      }
    } catch (err) {
      console.error("Image processing error:", err);
      setError("Could not process image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

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
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setDisplayFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onChange) {
      onChange("", "");
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1B19]">
          {label}
        </label>
        {value && (
          <span className="text-[11px] text-[#8C6D32] flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3 text-[#25D366]" />
            Image Ready
          </span>
        )}
      </div>

      {/* Upload Dropzone / Preview */}
      {value ? (
        <div className="rounded-xl border border-[#E7E0D2] bg-[#FAF8F5] p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail Preview */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#ECE7DC] border border-[#E7E0D2] shrink-0 relative group">
              <img
                src={value}
                alt="Frame Asset Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Filename */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs font-mono font-bold text-[#1C1B19] truncate">
                {displayFileName}
              </div>
              <div className="text-[11px] text-[#6F6A62]">
                Optimized for fast rendering &amp; client storage
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-white hover:bg-[#F4EFE6] border border-[#DCD3C0] text-[#1C1B19] rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className="w-3 h-3 text-[#8C6D32]" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            dragActive
              ? "border-[#C9A669] bg-[#FDFBF7]"
              : "border-[#E7E0D2] hover:border-[#C9A669] bg-[#FAF8F5]/80 hover:bg-[#FDFBF7]"
          }`}
        >
          <div className="p-3 bg-[#F4EFE6] text-[#8C6D32] rounded-full mb-2.5 shadow-sm">
            <Upload className="w-5 h-5 text-[#9C7B3D]" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#1C1B19]">
            {isProcessing ? "Optimizing image..." : "Upload Image"}
          </p>
          <p className="text-[11px] text-[#6F6A62] mt-0.5">
            Click to select or drag &amp; drop file
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#A8A196] font-semibold mt-2">
            {helpText}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
