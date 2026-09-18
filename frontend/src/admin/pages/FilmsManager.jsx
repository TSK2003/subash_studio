import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clapperboard,
  Plus,
  Search,
  Play,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  Film,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  "All",
  "Wedding Film",
  "Pre-Wedding Film",
  "Engagement",
  "Traditional",
  "Event Film",
  "Highlights",
];

export default function FilmsManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const {
    films,
    addFilm,
    updateFilm,
    deleteFilm,
    toggleFilmFeatured,
    toggleFilmPublished,
  } = useAdminData();
  const { addToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);

  const initialForm = {
    title: "",
    category: "Wedding Film",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "3:45",
    thumbnail: "",
    description: "",
    featured: true,
    published: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const filteredFilms = useMemo(() => {
    return films.filter((f) => {
      const matchesCat =
        selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [films, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingFilm(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  // Auto-open Add modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (film) => {
    setEditingFilm(film);
    setFormData({
      title: film.title || "",
      category: film.category || "Wedding Film",
      videoUrl: film.videoUrl || "",
      duration: film.duration || "",
      thumbnail: film.thumbnail || "",
      description: film.description || "",
      featured: film.featured ?? false,
      published: film.published ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      addToast("Film title and video link are required.", "warning");
      return;
    }

    if (editingFilm) {
      updateFilm(editingFilm.id, formData);
      addToast("Cinematic film updated successfully.", "success");
    } else {
      addFilm(formData);
      addToast("New cinematic film published.", "success");
    }

    setModalOpen(false);
  };

  const handleDeletePrompt = (film) => {
    setFilmToDelete(film);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (filmToDelete) {
      deleteFilm(filmToDelete.id);
      addToast(`Film "${filmToDelete.title}" removed.`, "info");
      setDeleteConfirmOpen(false);
      setFilmToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Cinematic Films &amp; Teasers
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage 4K wedding cinema films, teasers, highlight reels, and streaming links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>Add Film</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
          <input
            type="text"
            placeholder="Search films by title, couple or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-lg text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669]"
          />
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
                ? films.length
                : films.filter((f) => f.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
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

      {/* Films Grid */}
      {filteredFilms.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="No cinematic films found"
          description="Add YouTube or Vimeo link for your wedding cinema films."
          actionLabel="Add Film"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFilms.map((film) => (
            <div
              key={film.id}
              className="bg-white rounded-xl border border-[#E7E0D2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C9A669]/60 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Video Thumbnail */}
                <div className="relative aspect-[16/9] bg-[#1C1B19] overflow-hidden">
                  <img
                    src={film.thumbnail || "/images/portfolio/port-1.jpg"}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    onError={(e) => {
                      e.currentTarget.src = "/images/portfolio/port-1.jpg";
                    }}
                  />
                  {/* Play Button Overlay */}
                  <a
                    href={film.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#1C1B19] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#C9A669] transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </a>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1C1B19]/80 backdrop-blur-md text-[#E4D3A6]">
                      {film.category}
                    </span>
                    {film.featured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9C7B3D] text-[#1C1B19]">
                        Featured
                      </span>
                    )}
                  </div>

                  {film.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-semibold">
                      {film.duration}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <h3 className="font-display font-bold text-base text-[#2B2B2B] line-clamp-1">
                    {film.title}
                  </h3>
                  <p className="text-xs text-[#6F6A62] line-clamp-2 leading-relaxed">
                    {film.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between text-xs">
                <a
                  href={film.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9C7B3D] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Watch Video</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(film)}
                    className="p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white rounded-lg transition-colors"
                    title="Edit Film"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(film)}
                    className="p-1.5 text-[#6F6A62] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Film"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingFilm ? "Edit Cinematic Film" : "New Cinematic Film"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingFilm ? `Edit ${editingFilm.title}` : "Upload Film Showcase"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with scrollable body & pinned footer */}
              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <ImageUploader
                    value={formData.thumbnail}
                    onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                    label="Film Video Poster / Thumbnail"
                  />

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Film Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A Story Written in the Stars — Ananya & Siddharth"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <label className="font-semibold text-[#6F6A62]">Runtime Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 4:32 or 10 mins"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">YouTube / Vimeo URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Film Description</label>
                    <textarea
                      rows={3}
                      placeholder="Story narrative, equipment used, music composers, location..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

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
                      <span>Publish to Live Site</span>
                    </label>
                  </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingFilm ? "Save Film" : "Publish Film"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Film"
        message={`Are you sure you want to delete "${filmToDelete?.title}"?`}
        confirmText="Delete Film"
        isDestructive={true}
      />
    </div>
  );
}
