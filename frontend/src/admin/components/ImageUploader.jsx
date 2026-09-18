import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Check, Link2, Loader2 } from "lucide-react";
import api from "../../lib/api.js";

export default function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  helpText = "PNG, JPG, WEBP up to 25MB.",
  category = "general",
}) {
  const [dragActive, setDragActive] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.upload(`/api/uploads?category=${encodeURIComponent(category)}`, formData);
      if (res && res.url) {
        onChange(res.url);
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
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setUseUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#6F6A62]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-xs text-[#9C7B3D] hover:underline flex items-center gap-1 font-medium"
        >
          <Link2 className="w-3.5 h-3.5" />
          {useUrlInput ? "Upload File instead" : "Use Image URL"}
        </button>
      </div>

      {useUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg or /images/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-sm focus:outline-none focus:border-[#C9A669]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2.5 bg-[#2B2B2B] text-white rounded-xl text-sm font-medium hover:bg-[#1C1B19]"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        <div className="relative group rounded-xl overflow-hidden border border-[#E7E0D2] bg-[#F8F6F2] aspect-[16/9] max-h-56 flex items-center justify-center">
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A669]" />
              <span>Uploading to server...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-[#2B2B2B] rounded-lg text-xs font-medium shadow hover:bg-[#F8F6F2]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-rose-600 text-white rounded-lg text-xs shadow hover:bg-rose-700"
              aria-label="Remove image"
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
              ? "border-[#C9A669] bg-[#FDFBF7]"
              : "border-[#E7E0D2] hover:border-[#C9A669] bg-[#FDFBF7]/60"
          }`}
        >
          <div className="p-3 bg-[#F4EFE6] text-[#9C7B3D] rounded-full mb-3">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <p className="text-sm font-medium text-[#2B2B2B]">
            {uploading ? "Uploading..." : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-[#6F6A62] mt-1">{helpText}</p>
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
    </div>
  );
}
