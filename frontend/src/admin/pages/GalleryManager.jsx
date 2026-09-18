import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  X,
  UploadCloud,
  Check,
  Sparkles,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  "All",
  "Wedding",
  "Reception",
  "Engagement",
  "Couple Shoot",
  "Baby Shoot",
  "Maternity Shoot",
  "Birthday",
  "Puberty Ceremony",
  "House Warming",
  "Corporate",
  "Outdoor",
  "Fashion",
  "Studio Portrait",
];

export default function GalleryManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const {
    gallery,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    toggleGalleryFeatured,
    toggleGalleryPublished,
  } = useAdminData();
  const { addToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Modal States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  // Form State
  const initialFormState = {
    title: "",
    category: "Wedding",
    imageUrl: "",
    featured: false,
    published: true,
    aspect: "landscape",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filtered images
  const filteredGallery = useMemo(() => {
    return gallery.filter((img) => {
      const matchesCat =
        selectedCategory === "All" || img.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFeatured = !filterFeatured || img.featured;

      return matchesCat && matchesSearch && matchesFeatured;
    });
  }, [gallery, selectedCategory, searchQuery, filterFeatured]);

  const paginatedGallery = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGallery.slice(start, start + pageSize);
  }, [filteredGallery, currentPage, pageSize]);

  const handleOpenUpload = () => {
    setEditingImage(null);
    setFormData(initialFormState);
    setUploadModalOpen(true);
  };

  // Auto-open upload modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenUpload();
    }
  }, [isNewParam]);

  const handleOpenEdit = (img) => {
    setEditingImage(img);
    setFormData({
      title: img.title || img.caption || "",
      category: img.category || "Wedding",
      imageUrl: img.imageUrl || img.src || "",
      featured: img.featured ?? false,
      published: img.published ?? true,
      aspect: img.aspect || "landscape",
    });
    setUploadModalOpen(true);
  };

  const handleSaveImage = (e) => {
    e.preventDefault();
    const effectiveUrl = formData.imageUrl || formData.src || "";
    if (!effectiveUrl) {
      addToast("Please provide or upload an image.", "warning");
      return;
    }

    const payload = {
      ...formData,
      imageUrl: effectiveUrl,
      src: effectiveUrl,
      title: formData.title || `${formData.category} Special Moment`,
      caption: formData.title || `${formData.category} Special Moment`,
    };

    if (editingImage) {
      updateGalleryImage(editingImage.id, payload);
      addToast("Gallery photo updated successfully.", "success");
    } else {
      addGalleryImage(payload);
      addToast("New photo added to gallery.", "success");
    }

    setUploadModalOpen(false);
  };

  const handleDeletePrompt = (img) => {
    setImageToDelete(img);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (imageToDelete) {
      deleteGalleryImage(imageToDelete.id);
      addToast("Image removed from gallery.", "info");
      setDeleteConfirmOpen(false);
      setImageToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Gallery Management
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Curate high-resolution client photos, organize categories, and manage showcase highlights.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filter & Categories Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
            <input
              type="text"
              placeholder="Search images by title or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-lg text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669]"
            />
          </div>

          {/* Featured Toggle */}
          <button
            type="button"
            onClick={() => setFilterFeatured(!filterFeatured)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              filterFeatured
                ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                : "bg-[#F8F6F2] text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F3EFE8]"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFeatured ? "fill-[#E4D3A6] text-[#E4D3A6]" : ""}`} />
            <span>Featured Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#F8F6F2]">
          <span className="text-[11px] text-[#6F6A62] font-semibold mr-1 shrink-0">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === "All"
                ? gallery.length
                : gallery.filter((i) => i.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm font-semibold"
                    : "bg-[#F8F6F2] text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F3EFE8]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-[#3D3A34] text-[#E4D3A6]"
                      : "bg-[#E7E0D2] text-[#6F6A62]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredGallery.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No gallery images found"
          description="Upload your high-definition photography portfolio to showcase to clients."
          actionLabel="Upload Image"
          onAction={handleOpenUpload}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedGallery.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group bg-white rounded-xl border border-[#E7E0D2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C9A669]/60 transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-[#F8F6F2] overflow-hidden cursor-pointer">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onClick={() => setPreviewImage(img)}
                    onError={(e) => {
                      e.currentTarget.src = "/images/gallery/wedding/wedding-01.jpg";
                    }}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1C1B19]/80 backdrop-blur-md text-[#E4D3A6] border border-[#3D3A34]">
                      {img.category}
                    </span>
                    {img.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9C7B3D] text-[#1C1B19] shadow">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(img)}
                      className="p-2 rounded-xl bg-white text-[#2B2B2B] hover:bg-[#F8F6F2] shadow transition-transform hover:scale-110"
                      title="Preview Full Size"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(img)}
                      className="p-2 rounded-xl bg-white text-[#2B2B2B] hover:bg-[#F8F6F2] shadow transition-transform hover:scale-110"
                      title="Edit Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(img)}
                      className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow transition-transform hover:scale-110"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Meta & Toggles */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-semibold text-xs text-[#2B2B2B] line-clamp-1">
                      {img.title}
                    </h4>
                    <span className="text-[10px] text-[#8E867B]">
                      {img.id} • Added {img.createdAt || "Recent"}
                    </span>
                  </div>

                  {/* Toggles Strip */}
                  <div className="pt-2 border-t border-[#F8F6F2] flex items-center justify-between text-xs">
                    {/* Featured Star Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleGalleryFeatured(img.id);
                        addToast(`Toggled featured for "${img.title}".`, "success");
                      }}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        img.featured
                          ? "text-[#9C7B3D] font-bold"
                          : "text-[#8E867B] hover:text-[#2B2B2B]"
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          img.featured ? "fill-[#9C7B3D] text-[#9C7B3D]" : ""
                        }`}
                      />
                      <span>Featured</span>
                    </button>

                    {/* Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleGalleryPublished(img.id);
                        addToast(
                          `Image is now ${!img.published ? "Published" : "Draft"}.`,
                          "info"
                        );
                      }}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        img.published
                          ? "text-emerald-700 font-semibold"
                          : "text-stone-500"
                      }`}
                    >
                      {img.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-[#E7E0D2] shadow-sm p-3">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredGallery.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Upload / Edit Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingImage ? "Edit Gallery Item" : "New Photo Upload"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingImage ? "Update Photo Details" : "Upload High-Res Photo"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with scrollable body & pinned footer */}
              <form onSubmit={handleSaveImage} className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  {/* Cloudinary Ready Uploader */}
                  <ImageUploader
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Photo Image (File or URL)"
                  />

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Photo Title</label>
                    <input
                      type="text"
                      placeholder="e.g. The Royal Muhurtham Garland Exchange"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  {/* Category & Orientation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      >
                        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Orientation</label>
                      <select
                        value={formData.aspect}
                        onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      >
                        <option value="landscape">Landscape (Horizontal)</option>
                        <option value="portrait">Portrait (Vertical)</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#2B2B2B]">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E7E0D2] text-[#9C7B3D] focus:ring-[#C9A669]"
                      />
                      <span>Feature on Homepage</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#2B2B2B]">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E7E0D2] text-[#9C7B3D] focus:ring-[#C9A669]"
                      />
                      <span>Publish to Live Gallery</span>
                    </label>
                  </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingImage ? "Save Changes" : "Publish Photo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Preview Lightbox Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh] z-10 flex flex-col items-center"
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewImage.imageUrl}
                alt={previewImage.title}
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <div className="mt-3 text-center text-white">
                <h4 className="font-display font-semibold text-lg">{previewImage.title}</h4>
                <p className="text-xs text-[#E4D3A6]">{previewImage.category} Collection</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Gallery Image"
        message={`Are you sure you want to remove "${imageToDelete?.title}" from the studio gallery?`}
        confirmText="Delete Photo"
        isDestructive={true}
      />
    </div>
  );
}
