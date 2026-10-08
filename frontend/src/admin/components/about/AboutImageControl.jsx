import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Trash2, RefreshCw, FolderOpen, Loader2 } from "lucide-react";
import api from "../../../lib/api.js";

/**
 * AboutImageControl
 * Full-featured image picker for About CMS sections with:
 * - Native device file picker upload with progress
 * - Replace Image
 * - Remove Image
 * - Media Library modal selection
 * - Compact preview
 * - Editable alternative text & optional caption
 */
export default function AboutImageControl({
  label = "Image",
  value = "",
  onChange,
  altValue = "",
  onAltChange,
  captionValue = "",
  onCaptionChange,
  captionLabel = "Caption",
  category = "about",
  getMediaLibrary,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.uploadWithProgress(
        `/api/uploads?category=${encodeURIComponent(category)}`,
        formData,
        {
          onProgress: ({ percent }) => {
            setUploadProgress(Math.min(percent, 95));
          },
        }
      );

      const uploadedUrl = res.url || res.path || (res.files && res.files[0]?.url);
      if (!uploadedUrl) throw new Error("Upload did not return a valid image URL.");

      setUploadProgress(100);
      onChange?.(uploadedUrl);
    } catch (err) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenMediaLibrary = async () => {
    if (!getMediaLibrary) return;
    setMediaModalOpen(true);
    setLoadingMedia(true);
    try {
      const items = await getMediaLibrary();
      setMediaItems(Array.isArray(items) ? items : []);
    } catch {
      setMediaItems([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectMedia = (url) => {
    onChange?.(url);
    setMediaModalOpen(false);
  };

  const handleRemove = () => {
    onChange?.("");
    if (onAltChange) onAltChange("");
    if (onCaptionChange) onCaptionChange("");
    setUploadError("");
  };

  return (
    <div className="space-y-3 bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E7E0D2]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#6F6A62]">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 size={12} />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview or Empty State */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {value ? (
          <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-lg overflow-hidden border border-[#D8CFC0] bg-white shadow-sm shrink-0 group">
            <img
              src={value}
              alt={altValue || label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-lg border-2 border-dashed border-[#D8CFC0] bg-white/70 flex flex-col items-center justify-center text-[#A39987] shrink-0">
            <ImageIcon size={22} className="mb-1 opacity-70" />
            <span className="text-[10px] uppercase font-semibold">No Image</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex-1 space-y-2 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#D8CFC0] text-xs font-semibold text-[#3C3830] hover:bg-[#F2ECE1] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-[#9C7B3D]" />
                  <span>Uploading {uploadProgress}%...</span>
                </>
              ) : value ? (
                <>
                  <RefreshCw size={13} />
                  <span>Replace Image</span>
                </>
              ) : (
                <>
                  <UploadCloud size={13} />
                  <span>Upload Image</span>
                </>
              )}
            </button>

            {getMediaLibrary && (
              <button
                type="button"
                onClick={handleOpenMediaLibrary}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D8CFC0] text-xs font-semibold text-[#6F6A62] hover:bg-[#F2ECE1] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FolderOpen size={13} />
                <span>Media Library</span>
              </button>
            )}
          </div>

          {/* Progress Bar when uploading */}
          {uploading && (
            <div className="w-full bg-[#E7E0D2] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#C9A669] h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Validation/Error Message */}
          {uploadError && (
            <p className="text-xs text-red-600 font-medium">{uploadError}</p>
          )}

          <p className="text-[11px] text-[#8C8270]">
            Supports JPG, PNG, WEBP. Stored permanently on server.
          </p>
        </div>
      </div>

      {/* Editable Alternative Text */}
      {onAltChange && (
        <div className="pt-1">
          <label className="block text-[11px] font-semibold text-[#6F6A62] mb-1">
            Image Alt Text (Accessibility &amp; SEO)
          </label>
          <input
            type="text"
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="e.g. Founder P. Arunachalam with camera"
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8CFC0] focus:outline-none focus:border-[#C9A669] text-[#2B2B2B]"
          />
        </div>
      )}

      {/* Editable Caption if provided */}
      {onCaptionChange && (
        <div className="pt-1">
          <label className="block text-[11px] font-semibold text-[#6F6A62] mb-1">
            {captionLabel}
          </label>
          <input
            type="text"
            value={captionValue || ""}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="e.g. Where the journey began."
            className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#D8CFC0] focus:outline-none focus:border-[#C9A669] text-[#2B2B2B]"
          />
        </div>
      )}

      {/* Media Library Selection Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 border border-[#E7E0D2] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="font-display text-lg text-ink">Choose from Media Library</h3>
                <p className="text-xs text-ink-soft">Select any existing photograph from your studio gallery.</p>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-ink-soft"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-48 py-2">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#9C7B3D]">
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <p className="text-xs text-ink-soft">Loading library photos...</p>
                </div>
              ) : mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaItems.map((item) => (
                    <button
                      key={item.id || item.url}
                      type="button"
                      onClick={() => handleSelectMedia(item.url)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-[#E7E0D2] hover:border-[#C9A669] hover:ring-2 hover:ring-[#C9A669]/40 group transition-all"
                    >
                      <img
                        src={item.url}
                        alt={item.title || "Media asset"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-ink-soft text-xs">
                  No images found in the Media Library.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#FAF8F5] text-ink hover:bg-[#EDE8DE]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
