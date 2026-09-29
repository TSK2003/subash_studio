import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  User,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  Building2,
  Power,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import AdminStatusBadge from "../components/AdminStatusBadge";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function BranchesManager() {
  const [searchParams] = useSearchParams();
  const isNewParam = searchParams.get("new") === "true";

  const { branches, addBranch, updateBranch, deleteBranch, toggleBranchStatus } =
    useAdminData();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const initialForm = {
    name: "",
    city: "",
    tag: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    mapsUrl: "",
    hours: "",
    image: "",
    manager: "",
    active: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FIELD_ORDER = [
    "image",
    "name",
    "city",
    "address",
    "phone",
    "hours",
    "manager",
    "mapsUrl",
  ];

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsSubmitting(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBranch(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Auto-open Add modal if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || "",
      city: branch.city || "",
      tag: branch.tag || "",
      address: branch.address || "",
      phone: branch.phone || "",
      whatsapp: branch.whatsapp || "",
      email: branch.email || "",
      mapsUrl: branch.mapsUrl || "",
      hours: branch.hours || "",
      image: branch.image || "",
      manager: branch.manager || "",
      active: branch.active ?? true,
    });
    setFormErrors({});
    setIsSubmitting(false);
    setModalOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Branch Studio Exterior Photo *
    if (!formData.image || !formData.image.trim()) {
      errors.image = "Branch studio exterior photo is required.";
    }

    // 2. Branch Name / Title *
    if (!formData.name || !formData.name.trim()) {
      errors.name = "Branch name is required.";
    }

    // 3. City / Region *
    if (!formData.city || !formData.city.trim()) {
      errors.city = "City / Region is required.";
    }

    // 4. Full Postal Address *
    if (!formData.address || !formData.address.trim()) {
      errors.address = "Full postal address is required.";
    }

    // 5. Phone / Mobile *
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone / Mobile number is required.";
    } else if (/[a-zA-Z]/.test(formData.phone.trim())) {
      errors.phone = "Phone number must contain only numeric characters.";
    } else if (!/^[+]?[\d\s-]+$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid numeric phone number.";
    } else {
      const digits = formData.phone.trim().replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) {
        errors.phone = "Phone number must contain at least 10 digits.";
      }
    }

    // 6. Working Hours *
    if (!formData.hours || !formData.hours.trim()) {
      errors.hours = "Working hours are required.";
    }

    // 7. Branch Manager / Lead *
    if (!formData.manager || !formData.manager.trim()) {
      errors.manager = "Branch manager / lead is required.";
    }

    // 8. Google Maps URL *
    if (!formData.mapsUrl || !formData.mapsUrl.trim()) {
      errors.mapsUrl = "Google Maps URL is required.";
    } else {
      try {
        const parsed = new URL(formData.mapsUrl.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.mapsUrl = "Google Maps URL must start with http:// or https://";
        }
      } catch {
        errors.mapsUrl = "Please enter a valid Google Maps URL.";
      }
    }

    return errors;
  };

  const scrollToFirstError = (errors) => {
    const firstInvalidKey = FIELD_ORDER.find((k) => errors[k]);
    if (firstInvalidKey) {
      if (firstInvalidKey === "image") {
        const container = document.getElementById("branch-image-container");
        if (container) {
          container.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        const el = document.getElementById(`branch-${firstInvalidKey}`);
        if (el) {
          el.focus();
          if (el.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      scrollToFirstError(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        tag: (formData.tag || "Studio & Consultation Lounge").trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        whatsapp: (formData.whatsapp || formData.phone).trim(),
        email: (formData.email || "").trim(),
        mapsUrl: formData.mapsUrl.trim(),
        hours: formData.hours.trim(),
        image: formData.image.trim(),
        manager: formData.manager.trim(),
        active: formData.active,
      };

      if (editingBranch) {
        await updateBranch(editingBranch.id, payload);
        addToast(`Branch "${payload.name}" updated successfully.`, "success");
      } else {
        await addBranch(payload);
        addToast(`New branch "${payload.name}" added.`, "success");
      }

      handleCloseModal();
    } catch (err) {
      addToast(err.message || "Failed to save branch.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = (branch) => {
    setBranchToDelete(branch);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (branchToDelete) {
      deleteBranch(branchToDelete.id);
      addToast(`Branch "${branchToDelete.name || branchToDelete.city}" deleted.`, "info");
      setDeleteConfirmOpen(false);
      setBranchToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Studio Branches &amp; Locations
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage Kalladaikurichi flagship headquarters, Tirunelveli gallery, Tenkasi lounge, and working hours.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Branches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const isBranchActive = branch.active !== false;

          return (
            <div
              key={branch.id || branch.city}
              className="bg-white rounded-xl border border-[#E7E0D2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C9A669]/60 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Branch Exterior / Interior Photo */}
                <div className="relative aspect-[16/9] bg-[#F8F6F2] overflow-hidden">
                  <img
                    src={
                      branch.image && !branch.image.includes("outdoor-01.jpg")
                        ? branch.image
                        : branch.city?.toLowerCase().includes("tirunelveli")
                        ? "/images/gallery/branches/tirunelveli.jpg"
                        : branch.city?.toLowerCase().includes("tenkasi")
                        ? "/images/storefront.jpg"
                        : "/images/gallery/branches/kalladaikurichi.jpg"
                    }
                    alt={branch.city}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: branch.city?.toLowerCase().includes("tirunelveli")
                        ? "center 28%"
                        : "center top",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/gallery/branches/kalladaikurichi.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <AdminStatusBadge active={isBranchActive} size="sm" />
                  </div>
                  {branch.tag && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#1C1B19]/80 backdrop-blur-md rounded-xl text-[10px] font-bold text-[#E4D3A6] border border-[#3D3A34]">
                      {branch.tag}
                    </div>
                  )}
                </div>

                {/* Branch Information */}
                <div className="p-6 space-y-4 text-xs">
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                      {branch.name || `${branch.city} Studio`}
                    </h3>
                    <p className="text-[#6F6A62] mt-1 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-4 h-4 text-[#9C7B3D] shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#F8F6F2]">
                    <div className="flex items-center justify-between text-[#6F6A62]">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#9C7B3D]" />
                        <span>Phone:</span>
                      </span>
                      <span className="font-semibold text-[#2B2B2B]">{branch.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#6F6A62]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9C7B3D]" />
                        <span>Hours:</span>
                      </span>
                      <span className="font-semibold text-[#2B2B2B] truncate max-w-[150px]">{branch.hours}</span>
                    </div>

                    {branch.manager && (
                      <div className="flex items-center justify-between text-[#6F6A62]">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#9C7B3D]" />
                          <span>Studio Lead:</span>
                        </span>
                        <span className="font-semibold text-[#2B2B2B]">{branch.manager}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between">
                <a
                  href={branch.mapsUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#9C7B3D] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toggleBranchStatus(branch.id);
                      addToast(
                        `Branch "${branch.name || branch.city}" is now ${isBranchActive ? "Inactive" : "Active"}.`,
                        "info"
                      );
                    }}
                    className="text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19] transition-colors"
                  >
                    {isBranchActive ? "Set Inactive" : "Set Active"}
                  </button>

                <div className="flex items-center gap-1 border-l border-[#E7E0D2] pl-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white rounded-lg transition-colors"
                    title="Edit Branch"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(branch)}
                    className="p-1.5 text-[#6F6A62] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

      {/* Add / Edit Branch Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="admin-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingBranch ? "Edit Branch" : "New Studio Branch"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingBranch ? `Update ${editingBranch.name || editingBranch.city}` : "Add Studio Location"}
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
              <form onSubmit={handleSave} noValidate autoComplete="off" className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <div id="branch-image-container" className="space-y-1">
                    <ImageUploader
                      value={formData.image}
                      onChange={(url) => handleFieldChange("image", url)}
                      label="Branch Studio Exterior Photo *"
                    />
                    {formErrors.image && (
                      <p className="text-rose-600 text-[10px] mt-1 font-medium">{formErrors.image}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="branch-name" className="font-semibold text-[#6F6A62]">
                        Branch Name / Title *
                      </label>
                      <input
                        id="branch-name"
                        type="text"
                        placeholder="e.g. Kalladaikurichi Headquarters"
                        value={formData.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.name ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.name && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-city" className="font-semibold text-[#6F6A62]">
                        City / Region *
                      </label>
                      <input
                        id="branch-city"
                        type="text"
                        placeholder="e.g. Tirunelveli"
                        value={formData.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.city ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.city && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="branch-address" className="font-semibold text-[#6F6A62]">
                      Full Postal Address *
                    </label>
                    <textarea
                      id="branch-address"
                      rows={2}
                      placeholder="Shop/Complex details, street, district, PIN code..."
                      value={formData.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      className={`w-full p-2.5 bg-[#F8F6F2] border ${
                        formErrors.address ? "border-rose-400" : "border-[#E7E0D2]"
                      } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                    />
                    {formErrors.address && (
                      <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="branch-phone" className="font-semibold text-[#6F6A62]">
                        Phone / Mobile *
                      </label>
                      <input
                        id="branch-phone"
                        type="text"
                        placeholder="e.g. +91 93457 06609 or 9345706609"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.phone ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.phone && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-hours" className="font-semibold text-[#6F6A62]">
                        Working Hours *
                      </label>
                      <input
                        id="branch-hours"
                        type="text"
                        placeholder="Mon – Sun, 08:00 AM – 09:00 PM"
                        value={formData.hours}
                        onChange={(e) => handleFieldChange("hours", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.hours ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.hours && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.hours}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="branch-manager" className="font-semibold text-[#6F6A62]">
                        Branch Manager / Lead *
                      </label>
                      <input
                        id="branch-manager"
                        type="text"
                        placeholder="e.g. Subash (Founder)"
                        value={formData.manager}
                        onChange={(e) => handleFieldChange("manager", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.manager ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.manager && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.manager}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-mapsUrl" className="font-semibold text-[#6F6A62]">
                        Google Maps URL *
                      </label>
                      <input
                        id="branch-mapsUrl"
                        type="url"
                        placeholder="https://maps.google.com/?q=..."
                        value={formData.mapsUrl}
                        onChange={(e) => handleFieldChange("mapsUrl", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.mapsUrl ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.mapsUrl && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.mapsUrl}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] font-semibold shadow-md active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : (editingBranch ? "Save Branch" : "Add Branch")}
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
        title="Delete Studio Branch"
        message={`Are you sure you want to remove the ${branchToDelete?.city} branch?`}
        confirmText="Delete Branch"
        isDestructive={true}
      />
    </div>
  );
}
