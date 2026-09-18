import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  X,
  MapPin,
  Calendar,
  Layers,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

const PORTFOLIO_CATEGORIES = [
  "All",
  "Wedding",
  "Couple",
  "Baby",
  "Maternity",
  "Fashion",
  "Outdoor",
  "Corporate",
  "Traditional",
];

export default function PortfolioManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const {
    portfolio,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    togglePortfolioFeatured,
  } = useAdminData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form state
  const initialForm = {
    title: "",
    subtitle: "",
    category: "Wedding",
    coverImage: "",
    eventDate: "",
    location: "",
    description: "",
    featured: true,
    published: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter((p) => {
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [portfolio, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  // Auto-open Add modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || item.client || "",
      subtitle: item.subtitle || item.client || "",
      category: item.category || "Wedding",
      coverImage: item.coverImage || item.image || item.imageUrl || "",
      eventDate: item.eventDate || "",
      location: item.location || "",
      description: item.description || item.excerpt || "",
      featured: item.featured ?? false,
      published: item.published ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const effectiveImage = formData.coverImage || "";
    if (!formData.title.trim() || !effectiveImage) {
      addToast("Please provide project title and cover image.", "warning");
      return;
    }

    const payload = {
      ...formData,
      coverImage: effectiveImage,
      image: effectiveImage,
      imageUrl: effectiveImage,
      description: formData.description || "",
      excerpt: formData.description || "",
    };

    if (editingItem) {
      updatePortfolio(editingItem.id, payload);
      addToast("Portfolio project updated successfully.", "success");
    } else {
      addPortfolio(payload);
      addToast("New portfolio story created.", "success");
    }

    setModalOpen(false);
  };

  const handleDeletePrompt = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deletePortfolio(itemToDelete.id);
      addToast(`Portfolio story "${itemToDelete.title}" deleted.`, "info");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Portfolio Stories
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage comprehensive wedding and couple story case studies featured on the website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Category Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
          <input
            type="text"
            placeholder="Search portfolio by couple name, location, ceremony..."
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
          {PORTFOLIO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === "All"
                ? portfolio.length
                : portfolio.filter((p) => p.category === cat).length;

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

      {/* Projects Grid */}
      {filteredPortfolio.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No portfolio projects found"
          description="Create your first curated wedding or portrait project showcase."
          actionLabel="Create Project"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-[#E7E0D2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C9A669]/60 transition-all flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] bg-[#F8F6F2] overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/images/portfolio/wedding-01.jpg";
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1C1B19]/80 backdrop-blur-md text-[#E4D3A6]">
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9C7B3D] text-[#1C1B19]">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white text-[#2B2B2B] hover:bg-[#F8F6F2] shadow"
                    title="Edit Story"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(item)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-[#2B2B2B]">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-[#9C7B3D] font-medium">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-[#6F6A62] line-clamp-2 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F8F6F2] flex items-center justify-between text-xs text-[#8E867B]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9C7B3D]" />
                    <span className="truncate max-w-[130px]">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.eventDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingItem ? "Edit Portfolio Story" : "New Portfolio Story"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingItem ? `Edit ${editingItem.title}` : "Create Showcase Project"}
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
                  {/* Cover Image */}
                  <ImageUploader
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    label="Project Cover Image"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Story Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya & Siddharth"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Subtitle / Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. A Grand Chettinad Palace Celebration"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Couple Shoot">Couple Shoot</option>
                        <option value="Baby Shoot">Baby Shoot</option>
                        <option value="Maternity Shoot">Maternity Shoot</option>
                        <option value="Editorial">Editorial</option>
                      </select>
                    </div>

                    {/* Event Date */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Shoot Date / Month</label>
                      <input
                        type="text"
                        placeholder="e.g. June 2026"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Location / Venue</label>
                      <input
                        type="text"
                        placeholder="e.g. Karaikudi, Tamil Nadu"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Story Overview</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the aesthetic, emotions, rituals and vibe of the session..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
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
                      <span>Publish Story Live</span>
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
                    {editingItem ? "Save Story" : "Publish Project"}
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
        title="Delete Portfolio Story"
        message={`Are you sure you want to remove the portfolio story for "${itemToDelete?.title}"?`}
        confirmText="Delete Story"
        isDestructive={true}
      />
    </div>
  );
}
