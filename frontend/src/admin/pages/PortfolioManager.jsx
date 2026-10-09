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
  SlidersHorizontal,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { AddCategoryModal, ManageCategoriesModal } from "../components/CategoryModals";
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

function normalizeDateForInput(val) {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();
  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  // ISO with timestamp: YYYY-MM-DDTHH:mm:ss...
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.split("T")[0];
  }
  // If DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // Parseable date string (e.g. "June 2026")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    if (year >= 1900 && year <= 2100) {
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  return "";
}

export default function PortfolioManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const {
    portfolio,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    togglePortfolioFeatured,
    portfolioCategories,
    addPortfolioCategory,
    togglePortfolioCategoryStatus,
  } = useAdminData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [manageCategoriesModalOpen, setManageCategoriesModalOpen] = useState(false);

  const activeCategoryNames = useMemo(() => {
    if (portfolioCategories && portfolioCategories.length > 0) {
      return portfolioCategories.filter((c) => c.active).map((c) => c.name);
    }
    return PORTFOLIO_CATEGORIES.filter((c) => c !== "All");
  }, [portfolioCategories]);

  // Form state
  const initialForm = {
    title: "",
    subtitle: "",
    category: "",
    coverImage: "",
    eventDate: "",
    location: "",
    description: "",
    featured: false,
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData(initialForm);
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
      category: item.category || "",
      coverImage: item.coverImage || item.image || item.imageUrl || "",
      eventDate: normalizeDateForInput(item.eventDate),
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
      category: formData.category || "Wedding",
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

    handleCloseModal();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Portfolio Stories
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage comprehensive wedding and couple story showcases featured on the website.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Category Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search portfolio by couple name, location, ceremony..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-gray-500 font-medium mr-1 shrink-0">
              Category:
            </span>
            {["All", ...activeCategoryNames].map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === "All"
                  ? portfolio.length
                  : portfolio.filter(
                      (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
                    ).length;

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

            {/* + Add Category Button */}
            <button
              type="button"
              onClick={() => setAddCategoryModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 shrink-0"
              title="Add New Category"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Manage Categories Action */}
          <button
            type="button"
            onClick={() => setManageCategoriesModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 shrink-0 ml-auto border border-gray-200"
            title="Manage Category Status"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <span>Manage</span>
          </button>
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
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm hover:border-gray-300 transition-all flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/images/portfolio/wedding-01.jpg";
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/75 backdrop-blur-md text-white">
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500 text-white shadow-xs">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 shadow-sm border border-gray-200"
                    title="Edit Story"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(item)}
                    className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 shadow-sm border border-rose-100"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 font-medium">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate max-w-[130px]">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
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
          <div className="admin-modal-overlay admin-portal bg-black/60 backdrop-blur-sm">
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
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 z-10 max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {editingItem ? "Edit Portfolio Story" : "New Portfolio Story"}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingItem ? `Edit ${editingItem.title}` : "Create Showcase Project"}
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
                  {/* Cover Image */}
                  <ImageUploader
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    label="Project Cover Image"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Story Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya & Siddharth"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Subtitle / Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. A Grand Chettinad Palace Celebration"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                      >
                        <option value="">Select category</option>
                        {activeCategoryNames.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        {/* Preserve existing item category even if inactive */}
                        {formData.category &&
                          !activeCategoryNames.some(
                            (c) => c.toLowerCase() === formData.category.toLowerCase()
                          ) && (
                            <option value={formData.category}>
                              {formData.category} (Inactive)
                            </option>
                          )}
                      </select>
                    </div>

                    {/* Event Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Shoot Date / Month</label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate || ""}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        onClick={(e) => {
                          try {
                            e.target.showPicker?.();
                          } catch (err) {}
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Tab" && e.key !== "Escape") {
                            e.preventDefault();
                            try {
                              e.target.showPicker?.();
                            } catch (err) {}
                          }
                        }}
                        className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white cursor-pointer transition-all"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Location / Venue</label>
                      <input
                        type="text"
                        placeholder="e.g. Karaikudi, Tamil Nadu"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Story Overview</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the aesthetic, emotions, rituals and vibe of the session..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Checkboxes */}
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
                      <span>Publish Story Live</span>
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
                    {editingItem ? "Save Changes" : "Publish Project"}
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

      {/* Dynamic Category Modals */}
      <AddCategoryModal
        isOpen={addCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        title="Add Portfolio Category"
        existingCategories={portfolioCategories}
        onAdd={addPortfolioCategory}
      />

      <ManageCategoriesModal
        isOpen={manageCategoriesModalOpen}
        onClose={() => setManageCategoriesModalOpen(false)}
        title="Manage Portfolio Categories"
        categories={portfolioCategories}
        items={portfolio}
        onToggleStatus={togglePortfolioCategoryStatus}
        onOpenAdd={() => setAddCategoryModalOpen(true)}
      />
    </div>
  );
}
