import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Power,
  DollarSign,
  Tag,
  ListChecks,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import AdminStatusBadge from "../components/AdminStatusBadge";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function ServicesManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const { services, addService, updateService, deleteService, toggleServiceStatus } =
    useAdminData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Form State
  const initialForm = {
    name: "",
    slug: "",
    image: "",
    shortDesc: "",
    fullDesc: "",
    startingPrice: "",
    featuresInput: "",
    status: "Active",
  };
  const [formData, setFormData] = useState(initialForm);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      return (
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [services, searchQuery]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingService(null);
    setFormData(initialForm);
  };

  // Auto-open Add modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name || "",
      slug: srv.slug || "",
      image: srv.image || "",
      shortDesc: srv.shortDesc || srv.blurb || "",
      fullDesc: srv.fullDesc || srv.blurb || "",
      startingPrice: srv.startingPrice || "",
      featuresInput: (srv.features || []).join("\n"),
      status: srv.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast("Service name is required.", "warning");
      return;
    }

    const features = formData.featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const fallbackImage = editingService?.image || "/images/services/wedding-photography.jpg";
    const effectiveImage = formData.image || fallbackImage;

    const payload = {
      name: formData.name,
      title: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      image: effectiveImage,
      imageUrl: effectiveImage,
      shortDesc: formData.shortDesc,
      blurb: formData.shortDesc,
      fullDesc: formData.fullDesc,
      description: formData.fullDesc || formData.shortDesc,
      startingPrice: formData.startingPrice,
      features,
      status: formData.status,
    };

    if (editingService) {
      updateService(editingService.id, payload);
      addToast(`Service "${formData.name}" updated.`, "success");
    } else {
      addService(payload);
      addToast(`New service "${formData.name}" added.`, "success");
    }

    handleCloseModal();
  };

  const handleDeletePrompt = (srv) => {
    setServiceToDelete(srv);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id);
      addToast(`Service "${serviceToDelete.name}" deleted.`, "info");
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Studio Services &amp; Packages
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage packages, pricing, features list, and public website service listings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
          <input
            type="text"
            placeholder="Search studio packages by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-lg text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No services found"
          description="Add your first photography or videography service."
          actionLabel="Add Service"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => {
            const isServiceActive =
              String(srv.status || "Active").trim().toLowerCase() === "active";

            return (
              <div
                key={srv.id || srv.name}
                className="bg-white rounded-xl border border-[#E7E0D2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C9A669]/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header Image Strip */}
                  <div className="relative aspect-[16/9] bg-[#F8F6F2] overflow-hidden">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/services/wedding-photography.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <AdminStatusBadge active={isServiceActive} size="sm" />
                    </div>
                    {srv.startingPrice && (
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#1C1B19]/80 backdrop-blur-md rounded-xl text-xs font-bold text-[#E4D3A6] border border-[#3D3A34]">
                        From {srv.startingPrice}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-display font-bold text-base text-[#2B2B2B]">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-[#6F6A62] line-clamp-2 leading-relaxed">
                      {srv.shortDesc || srv.blurb}
                    </p>

                    {/* Features tags */}
                    {srv.features && srv.features.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C7B3D]">
                          Package Inclusions:
                        </span>
                        <ul className="space-y-1">
                          {srv.features.slice(0, 3).map((feat, idx) => (
                            <li
                              key={idx}
                              className="text-[11px] text-[#2B2B2B] flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      toggleServiceStatus(srv.id);
                      addToast(
                        `Service "${srv.name}" is now ${isServiceActive ? "Inactive" : "Active"}.`,
                        "info"
                      );
                    }}
                    className="text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19] transition-colors"
                  >
                    {isServiceActive ? "Set Inactive" : "Set Active"}
                  </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(srv)}
                    className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white rounded-lg transition-colors"
                    title="Edit Service"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(srv)}
                    className="p-2 text-[#6F6A62] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add/Edit Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalOpen && (
              <div
                className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
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
                  initial={{ opacity: 0, scale: 0.96, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingService ? "Edit Service" : "New Studio Offering"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingService ? `Update ${editingService.name}` : "Add Studio Package"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with scrollable body & pinned footer */}
              <form onSubmit={handleSave} autoComplete="off" className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <ImageUploader
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="Service Banner Image"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Service Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wedding Photography"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Starting Price</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹1,20,000"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Short Blurb (Card Summary)</label>
                    <input
                      type="text"
                      placeholder="Brief 1-sentence description for cards and highlights..."
                      value={formData.shortDesc}
                      onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Package Features (One per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Dedicated Senior Candid Photographers&#10;Full Traditional Ritual Coverage&#10;Drone Aerial Perspectives&#10;Fine-Art Leather Album"
                      value={formData.featuresInput}
                      onChange={(e) => setFormData({ ...formData, featuresInput: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="px-6 sm:px-8 py-5 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingService ? "Save Service" : "Add Service"}
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
        title="Delete Studio Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? Clients will no longer see this package on the public website.`}
        confirmText="Delete Package"
        isDestructive={true}
      />
    </div>
  );
}
