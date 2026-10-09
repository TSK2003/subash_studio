import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Upload,
  Link2,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import VideoUploader from "../components/VideoUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import FilmVideoModal from "../../components/FilmVideoModal";
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
  const [playingFilm, setPlayingFilm] = useState(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);

  const initialForm = {
    title: "",
    category: "",
    videoSourceType: "upload",
    videoUrl: "",
    duration: "",
    thumbnail: "",
    description: "",
    featured: false,
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFilm(null);
    setFormData(initialForm);
  };

  // Auto-open Add modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (film) => {
    setEditingFilm(film);
    const initialSourceType =
      film.videoSourceType ||
      (film.videoUrl?.startsWith("/uploads/") || film.videoUrl?.includes("films/videos") ? "upload" : "external");
    setFormData({
      title: film.title || "",
      category: film.category || "",
      videoSourceType: initialSourceType,
      videoUrl: film.videoUrl || "",
      duration: film.duration || "",
      thumbnail: film.thumbnail || "",
      description: film.description || "",
      featured: film.featured ?? false,
      published: film.published ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast("Film title is required.", "warning");
      return;
    }
    if (formData.videoSourceType === "upload" && !formData.videoUrl.trim()) {
      addToast("Please upload a video file before saving.", "warning");
      return;
    }
    if (formData.videoSourceType === "external") {
      if (!formData.videoUrl.trim()) {
        addToast("A YouTube or Vimeo video link is required.", "warning");
        return;
      }
      const isYt = /(?:youtube\.com|youtu\.be)/i.test(formData.videoUrl);
      const isVimeo = /vimeo\.com/i.test(formData.videoUrl);
      if (!isYt && !isVimeo) {
        addToast("Please provide a valid YouTube or Vimeo URL.", "warning");
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        category: formData.category || "Wedding Film",
      };
      if (editingFilm) {
        await updateFilm(editingFilm.id, payload);
        addToast("Cinematic film updated successfully.", "success");
      } else {
        await addFilm(payload);
        addToast("New cinematic film published.", "success");
      }
      handleCloseModal();
    } catch (err) {
      addToast(err.message || "Failed to save film.", "error");
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5EAF1] text-[#334155] flex items-center justify-center border border-[#CAD3DF] shadow-xs">
            <Film className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Cinematic Films &amp; Teasers
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage 4K wedding cinema films, teasers, highlight reels, and streaming links.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Film</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search films by title, couple or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-gray-100">
          <span className="text-[11px] text-gray-500 font-medium mr-1 shrink-0">
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
                    ? "bg-black text-white shadow-xs font-medium"
                    : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-gray-800 text-gray-200"
                      : "bg-gray-200/70 text-gray-600"
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
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Video Thumbnail */}
                <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                  <img
                    src={film.thumbnail || "/images/portfolio/port-1.jpg"}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    onError={(e) => {
                      e.currentTarget.src = "/images/portfolio/port-1.jpg";
                    }}
                  />
                  {/* Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setPlayingFilm(film)}
                    aria-label={`Play ${film.title}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </button>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/75 backdrop-blur-md text-white">
                      {film.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white/90">
                      {film.videoSourceType === "upload" || film.videoUrl?.startsWith("/uploads/") ? "Uploaded Video" : "External Stream"}
                    </span>
                    {film.featured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500 text-white shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  {film.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-medium">
                      {film.duration}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                    {film.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {film.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3.5 sm:p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setPlayingFilm(film)}
                  className="text-gray-900 hover:text-black font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(film)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                    title="Edit Film"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(film)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalOpen && (
              <div
                className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden admin-portal"
                role="dialog"
                aria-modal="true"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseModal}
                  className="fixed inset-0"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Fixed Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {editingFilm ? "Edit Cinematic Film" : "New Cinematic Film"}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingFilm ? `Edit ${editingFilm.title}` : "Upload Film Showcase"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form with scrollable body & pinned footer */}
                  <form onSubmit={handleSave} autoComplete="off" className="flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs modal-scrollbar">
                      <ImageUploader
                        value={formData.thumbnail}
                        onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                        label="Film Video Poster / Thumbnail"
                      />

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Film Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. A Story Written in the Stars — Ananya & Siddharth"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                          >
                            <option value="">Select category</option>
                            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Runtime Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 4:32 or 10 mins"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Video Source Selector & Input / Uploader */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-medium text-gray-700 block">Video Source *</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                videoSourceType: "upload",
                                videoUrl: prev.videoSourceType === "upload" ? prev.videoUrl : "",
                              }))
                            }
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                              formData.videoSourceType === "upload"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Video</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                videoSourceType: "external",
                                videoUrl: prev.videoSourceType === "external" ? prev.videoUrl : "",
                              }))
                            }
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                              formData.videoSourceType === "external"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>YouTube / Vimeo URL</span>
                          </button>
                        </div>

                        {formData.videoSourceType === "upload" ? (
                          <VideoUploader
                            value={formData.videoUrl}
                            onChange={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                          />
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="url"
                              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                              value={formData.videoUrl}
                              onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                              className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                            />
                            <p className="text-[11px] text-gray-500">
                              Paste a valid YouTube (standard, shorts, embed) or Vimeo link.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Film Description</label>
                        <textarea
                          rows={3}
                          placeholder="Story narrative, equipment used, music composers, location..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 accent-black"
                          />
                          <span>Feature on Homepage</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 accent-black"
                          />
                          <span>Publish to Live Site</span>
                        </label>
                      </div>
                    </div>

                    {/* Pinned Action Footer */}
                    <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-200 flex items-center justify-end gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-white text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium shadow-xs active:scale-95 transition-all"
                      >
                        {editingFilm ? "Save Changes" : "Publish Film"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

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

      {/* Cinematic Film Video Modal */}
      <FilmVideoModal
        isOpen={Boolean(playingFilm)}
        film={playingFilm}
        onClose={() => setPlayingFilm(null)}
      />
    </div>
  );
}
