import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Eye,
  Edit2,
  Trash2,
  PhoneCall,
  MessageCircle,
  CheckCircle,
  FileText,
  Building2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";
import {
  BOOKING_STATUS_FILTERS,
  normalizeBookingStatus,
  formatBookingStatusLabel,
} from "../../lib/bookingStatus.js";

export default function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, addBooking, updateBooking, deleteBooking, services, branches } =
    useAdminData();
  const { addToast } = useToast();

  // URL Query Sync
  const urlSearch = searchParams.get("search") || "";
  const urlId = searchParams.get("id");
  const isNewParam = searchParams.get("new") === "true";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals & Drawers state
  const [activeBooking, setActiveBooking] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Open booking details if requested via URL ID
  useEffect(() => {
    if (urlId) {
      const found = bookings.find((b) => b.id === urlId);
      if (found) {
        setActiveBooking(found);
        setDrawerOpen(true);
      }
    }
  }, [urlId, bookings]);

  // Open New Form if requested via URL ?new=true
  useEffect(() => {
    if (isNewParam) {
      setEditingBooking(null);
      setFormData(initialFormState);
      setFormErrors({});
      setFormModalOpen(true);
    }
  }, [isNewParam]);

  // Form State
  const initialFormState = {
    customerName: "",
    phone: "",
    email: "",
    eventType: "",
    eventDate: "",
    location: "",
    numberOfDays: "",
    requiredService: "",
    photographyRequirement: "",
    cinematographyRequirement: "",
    budget: "",
    branch: "",
    status: "NEW",
    adminNotes: "",
  };

  const FIELD_ORDER = [
    "customerName",
    "phone",
    "email",
    "eventType",
    "eventDate",
    "numberOfDays",
    "budget",
    "requiredService",
    "branch",
    "status",
    "location",
    "photographyRequirement",
    "cinematographyRequirement",
  ];

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        searchQuery === "" ||
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone?.includes(searchQuery) ||
        b.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const canonicalStatus = normalizeBookingStatus(b.status);
      const matchesStatus =
        selectedStatus === "ALL" || canonicalStatus === selectedStatus;
      const matchesBranch =
        selectedBranch === "All" || b.branch === selectedBranch;
      const matchesService =
        selectedService === "All" || b.requiredService === selectedService;

      return matchesSearch && matchesStatus && matchesBranch && matchesService;
    });
  }, [bookings, searchQuery, selectedStatus, selectedBranch, selectedService]);

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const handleOpenAddModal = () => {
    setEditingBooking(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsSubmitting(false);
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingBooking(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleOpenEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      customerName: booking.customerName || booking.clientName || "",
      phone: (booking.phone || "").replace(/\D/g, "").slice(0, 10),
      email: booking.email || "",
      eventType: booking.eventType || "",
      eventDate: booking.eventDate ? (booking.eventDate.includes("T") ? booking.eventDate.split("T")[0] : booking.eventDate) : "",
      location: booking.location || booking.venue || "",
      numberOfDays: booking.numberOfDays || "",
      requiredService: booking.requiredService || booking.service || "",
      photographyRequirement: booking.photographyRequirement || "",
      cinematographyRequirement: booking.cinematographyRequirement || "",
      budget: booking.budget || "",
      branch: booking.branch || "",
      status: normalizeBookingStatus(booking.status),
      adminNotes: booking.adminNotes || booking.notes || "",
    });
    setFormErrors({});
    setIsSubmitting(false);
    setFormModalOpen(true);
  };

  const handlePhoneChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: numeric }));
    if (formErrors.phone) {
      if (numeric.length === 10) {
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next.phone;
          return next;
        });
      } else if (numeric.length === 0) {
        setFormErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
      } else {
        setFormErrors((prev) => ({ ...prev, phone: "Phone number must be exactly 10 digits." }));
      }
    }
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
    ];
    if (allowedKeys.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData("text") || "";
    const digits = pasted.replace(/\D/g, "");
    setFormData((prev) => {
      const current = prev.phone || "";
      const combined = (current + digits).slice(0, 10);
      return { ...prev, phone: combined };
    });
    if (formErrors.phone) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Customer Name *
    if (!formData.customerName || !formData.customerName.trim()) {
      errors.customerName = "Customer name is required.";
    }

    // 2. Phone Number *
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (formData.phone.trim().length !== 10 || !/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }

    // 3. Email Address *
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    // 4. Event Type *
    if (!formData.eventType || !formData.eventType.trim()) {
      errors.eventType = "Event type is required.";
    }

    // 5. Event Date *
    if (!formData.eventDate || !formData.eventDate.trim()) {
      errors.eventDate = "Event date is required.";
    }

    // 6. Duration / Days *
    if (!formData.numberOfDays || !formData.numberOfDays.trim()) {
      errors.numberOfDays = "Duration / Days is required.";
    }

    // 7. Package Budget *
    if (!formData.budget || !formData.budget.trim()) {
      errors.budget = "Package budget is required.";
    }

    // 8. Primary Service *
    if (!formData.requiredService || !formData.requiredService.trim()) {
      errors.requiredService = "Please select a primary service.";
    }

    // 9. Studio Branch *
    if (!formData.branch || !formData.branch.trim()) {
      errors.branch = "Please select a studio branch.";
    }

    // 10. Status *
    if (!formData.status || !formData.status.trim()) {
      errors.status = "Status is required.";
    }

    // 11. Venue Location *
    if (!formData.location || !formData.location.trim()) {
      errors.location = "Venue location is required.";
    }

    // 12. Photography Details *
    if (!formData.photographyRequirement || !formData.photographyRequirement.trim()) {
      errors.photographyRequirement = "Photography details are required.";
    }

    // 13. Cinematography Details *
    if (!formData.cinematographyRequirement || !formData.cinematographyRequirement.trim()) {
      errors.cinematographyRequirement = "Cinematography details are required.";
    }

    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstInvalidKey = FIELD_ORDER.find((k) => errors[k]);
      if (firstInvalidKey) {
        const el = document.getElementById(`booking-${firstInvalidKey}`);
        if (el) {
          el.focus();
          if (el.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, formData);
        addToast(`Booking ${editingBooking.id} updated successfully.`, "success");
        if (activeBooking?.id === editingBooking.id) {
          setActiveBooking({ ...activeBooking, ...formData });
        }
      } else {
        const created = await addBooking(formData);
        addToast(`Booking ${created?.id || ""} created successfully.`, "success");
      }
      handleCloseModal();
    } catch (err) {
      console.error("Booking submission error:", err);
      addToast(err?.message || "Failed to save booking. Please check all fields.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async (adminPassword) => {
    if (bookingToDelete) {
      await deleteBooking(bookingToDelete.id, adminPassword);
      addToast(`Booking ${bookingToDelete.id} permanently removed.`, "success");
      if (activeBooking?.id === bookingToDelete.id) {
        setDrawerOpen(false);
        setActiveBooking(null);
      }
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleStatusQuickChange = async (id, newStatus) => {
    const canonical = normalizeBookingStatus(newStatus);
    try {
      await updateBooking(id, { status: canonical });
      addToast(`Booking status updated to "${formatBookingStatusLabel(canonical)}".`, "success");
      if (activeBooking?.id === id) {
        setActiveBooking((prev) => ({ ...prev, status: canonical }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      addToast("Failed to update booking status.", "error");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedBranch("All");
    setSelectedService("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "ALL" ||
    selectedBranch !== "All" ||
    selectedService !== "All";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Studio Shoot Bookings
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage upcoming client shoots, venue schedules, and project requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
            <input
              type="text"
              placeholder="Search by customer, booking ID, phone, venue..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669]"
            />
          </div>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Service"
            className="px-3 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:outline-none focus:border-[#C9A669]"
          >
            <option value="All">All Services</option>
            {services.map((s) => (
              <option key={s.id || s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Branch"
            className="px-3 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:outline-none focus:border-[#C9A669]"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id || b.city} value={b.city}>
                {b.city}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shrink-0"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#F8F6F2]">
          <span className="text-[11px] text-[#6F6A62] font-semibold mr-1 shrink-0">
            Status:
          </span>
          {BOOKING_STATUS_FILTERS.map(({ key, label }) => {
            const count =
              key === "ALL"
                ? bookings.length
                : bookings.filter((b) => normalizeBookingStatus(b.status) === key).length;
            const isSelected = selectedStatus === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedStatus(key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm font-semibold"
                    : "bg-[#F8F6F2] text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F3EFE8]"
                }`}
              >
                <span>{label}</span>
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

      {/* Bookings Table / Grid */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings match your filter"
          description="Try selecting a different status or clear search terms to see bookings."
          actionLabel="Add New Booking"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E7E0D2] shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] border-b border-[#E7E0D2] text-[#6F6A62]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                  <th className="py-3.5 px-4 font-semibold">Service &amp; Event</th>
                  <th className="py-3.5 px-4 font-semibold">Shoot Date</th>
                  <th className="py-3.5 px-4 font-semibold">Branch / Venue</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F6F2]">
                {paginatedBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-[#FDFBF7] transition-colors group cursor-pointer"
                    onClick={() => {
                      setActiveBooking(b);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#9C7B3D]">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2B2B2B]">
                        {b.customerName}
                      </div>
                      <div className="text-[11px] text-[#6F6A62] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#8E867B]" />
                        {b.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#2B2B2B]">
                        {b.requiredService}
                      </div>
                      <div className="text-[11px] text-[#8E867B]">
                        {b.eventType} ({b.numberOfDays})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#2B2B2B]">
                        {new Date(b.eventDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-[#8E867B]">
                        Budget: {b.budget || "N/A"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#2B2B2B]">
                        {b.branch}
                      </div>
                      <div className="text-[11px] text-[#8E867B] truncate max-w-[140px]">
                        {b.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative group/status inline-block">
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                    </td>
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBooking(b);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 text-[#6F6A62] hover:text-[#9C7B3D] hover:bg-[#F8F6F2] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(b)}
                          className="p-1.5 text-[#6F6A62] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-[#E7E0D2]">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Booking Detail Modal (Standardized to match View Enquiry modal) */}
      <AnimatePresence>
        {drawerOpen && activeBooking && (
          <div className="admin-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDrawerOpen(false);
                setActiveBooking(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-[#9C7B3D]">
                      {activeBooking.id}
                    </span>
                    <StatusBadge status={activeBooking.status} size="sm" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {activeBooking.customerName || activeBooking.clientName || "Valued Client"}
                  </h3>
                  <p className="text-xs text-[#6F6A62]">
                    Booked on {activeBooking.createdAt ? (activeBooking.createdAt.includes("T") ? activeBooking.createdAt.split("T")[0] : activeBooking.createdAt) : "Recent"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveBooking(null);
                  }}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs modal-scrollbar">
                {/* Quick Communication Bar */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {activeBooking.phone ? (
                    <a
                      href={`tel:${activeBooking.phone}`}
                      className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#9C7B3D]" />
                      <span>{activeBooking.phone}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] text-[#8E867B] flex items-center justify-center gap-1.5 opacity-60">
                      <PhoneCall className="w-3.5 h-3.5 text-[#8E867B]" />
                      <span>No Phone</span>
                    </div>
                  )}

                  {activeBooking.phone ? (
                    <a
                      href={`https://wa.me/${activeBooking.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50 text-emerald-900/50 flex items-center justify-center gap-1.5 opacity-60">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600/50" />
                      <span>WhatsApp</span>
                    </div>
                  )}

                  {activeBooking.email ? (
                    <a
                      href={`mailto:${activeBooking.email}`}
                      className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all truncate"
                      title={activeBooking.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#9C7B3D]" />
                      <span className="truncate">{activeBooking.email}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] text-[#8E867B] flex items-center justify-center gap-1.5 opacity-60">
                      <Mail className="w-3.5 h-3.5 text-[#8E867B]" />
                      <span>No Email</span>
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D2] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6F6A62]">Event Type:</span>
                    <span className="font-bold text-[#2B2B2B]">{activeBooking.eventType || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6F6A62]">Event Date:</span>
                    <span className="font-semibold text-[#2B2B2B]">
                      {activeBooking.eventDate
                        ? new Date(activeBooking.eventDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6F6A62]">Shoot Duration:</span>
                    <span className="font-semibold text-[#2B2B2B]">{activeBooking.numberOfDays || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6F6A62]">Estimated Budget:</span>
                    <span className="font-bold text-[#9C7B3D]">{activeBooking.budget || "₹0"}</span>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
                    Venue &amp; Branch Assignment
                  </span>
                  <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D2] space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#6F6A62] flex items-center gap-1.5 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#9C7B3D] shrink-0" />
                        Venue Location:
                      </span>
                      <span className="font-semibold text-[#2B2B2B] text-right">
                        {activeBooking.location || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-[#F0EBE1]">
                      <span className="text-[#6F6A62] flex items-center gap-1.5 shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-[#9C7B3D] shrink-0" />
                        Studio Branch:
                      </span>
                      <span className="font-semibold text-[#2B2B2B]">
                        {activeBooking.branch || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shoot Requirements */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
                    Shoot Requirements
                  </span>
                  <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D2] space-y-2 text-xs">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[#6F6A62]">Primary Service:</span>
                      <span className="font-bold text-[#2B2B2B]">
                        {activeBooking.requiredService || "General Photography"}
                      </span>
                    </div>
                    {activeBooking.photographyRequirement && (
                      <div className="pt-2 border-t border-[#F0EBE1] flex justify-between items-start gap-4">
                        <span className="text-[#6F6A62] shrink-0">Photography Details:</span>
                        <span className="font-medium text-[#2B2B2B] text-right">
                          {activeBooking.photographyRequirement}
                        </span>
                      </div>
                    )}
                    {activeBooking.cinematographyRequirement && (
                      <div className="pt-2 border-t border-[#F0EBE1] flex justify-between items-start gap-4">
                        <span className="text-[#6F6A62] shrink-0">Cinematography Details:</span>
                        <span className="font-medium text-[#2B2B2B] text-right">
                          {activeBooking.cinematographyRequirement}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Shoot Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
                    Change Shoot Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_STATUS_FILTERS.filter((s) => s.key !== "ALL").map(({ key, label }) => {
                      const isSelected =
                        normalizeBookingStatus(activeBooking.status) === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleStatusQuickChange(activeBooking.id, key)}
                          className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                            isSelected
                              ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                              : "bg-white text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F8F6F2]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Studio Operations Notes */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
                    Studio Operations Notes
                  </span>
                  <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] text-[#2B2B2B] leading-relaxed text-sm whitespace-pre-wrap">
                    {activeBooking.adminNotes?.trim() ? (
                      `"${activeBooking.adminNotes.trim()}"`
                    ) : (
                      <span className="text-[#8E867B] italic text-xs">
                        No operational notes added for this booking yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeletePrompt(activeBooking)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs transition-colors"
                >
                  Delete Booking
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setActiveBooking(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEditModal(activeBooking);
                    }}
                    className="px-5 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl font-semibold text-xs transition-all shadow flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Booking</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Booking Modal */}
      <AnimatePresence>
        {formModalOpen && (
          <div className="admin-modal-overlay !z-[60]">
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
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingBooking ? "Update Shoot" : "New Client Booking"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingBooking ? `Edit ${editingBooking.id}` : "Schedule Shoot Session"}
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
              <form onSubmit={handleFormSubmit} noValidate autoComplete="off" className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Customer Name * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-customerName" className="font-semibold text-[#6F6A62]">
                        Customer Name *
                      </label>
                      <input
                        id="booking-customerName"
                        type="text"
                        placeholder="e.g. Kavitha & Arvind"
                        value={formData.customerName}
                        onChange={(e) => handleFieldChange("customerName", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.customerName ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.customerName && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.customerName}</p>
                      )}
                    </div>

                    {/* Phone Number * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-phone" className="font-semibold text-[#6F6A62]">
                        Phone Number *
                      </label>
                      <input
                        id="booking-phone"
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="e.g. 9840123456"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={handlePhonePaste}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.phone ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.phone && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-email" className="font-semibold text-[#6F6A62]">
                        Email Address *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="client@gmail.com"
                        value={formData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.email ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.email && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Event Type * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-eventType" className="font-semibold text-[#6F6A62]">
                        Event Type *
                      </label>
                      <input
                        id="booking-eventType"
                        type="text"
                        placeholder="e.g. Wedding & Reception"
                        value={formData.eventType}
                        onChange={(e) => handleFieldChange("eventType", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.eventType ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.eventType && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.eventType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Event Date * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-eventDate" className="font-semibold text-[#6F6A62]">
                        Event Date *
                      </label>
                      <input
                        id="booking-eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleFieldChange("eventDate", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.eventDate ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.eventDate && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.eventDate}</p>
                      )}
                    </div>

                    {/* Duration / Days * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-numberOfDays" className="font-semibold text-[#6F6A62]">
                        Duration / Days *
                      </label>
                      <input
                        id="booking-numberOfDays"
                        type="text"
                        placeholder="e.g. 2 Days / Half Day"
                        value={formData.numberOfDays}
                        onChange={(e) => handleFieldChange("numberOfDays", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.numberOfDays ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.numberOfDays && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.numberOfDays}</p>
                      )}
                    </div>

                    {/* Package Budget * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-budget" className="font-semibold text-[#6F6A62]">
                        Package Budget *
                      </label>
                      <input
                        id="booking-budget"
                        type="text"
                        placeholder="e.g. ₹1,50,000"
                        value={formData.budget}
                        onChange={(e) => handleFieldChange("budget", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.budget ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.budget && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.budget}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Primary Service * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-requiredService" className="font-semibold text-[#6F6A62]">
                        Primary Service *
                      </label>
                      <select
                        id="booking-requiredService"
                        value={formData.requiredService}
                        onChange={(e) => handleFieldChange("requiredService", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.requiredService ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      >
                        <option value="">Select service</option>
                        {services.map((s) => (
                          <option key={s.id || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.requiredService && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.requiredService}</p>
                      )}
                    </div>

                    {/* Studio Branch * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-branch" className="font-semibold text-[#6F6A62]">
                        Studio Branch *
                      </label>
                      <select
                        id="booking-branch"
                        value={formData.branch}
                        onChange={(e) => handleFieldChange("branch", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.branch ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      >
                        <option value="">Select branch</option>
                        {branches.map((b) => (
                          <option key={b.id || b.city} value={b.city}>
                            {b.city}
                          </option>
                        ))}
                      </select>
                      {formErrors.branch && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.branch}</p>
                      )}
                    </div>

                    {/* Status * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-status" className="font-semibold text-[#6F6A62]">
                        Status *
                      </label>
                      <select
                        id="booking-status"
                        value={normalizeBookingStatus(formData.status)}
                        onChange={(e) => handleFieldChange("status", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.status ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      >
                        {BOOKING_STATUS_FILTERS.filter((s) => s.key !== "ALL").map(({ key, label }) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {formErrors.status && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.status}</p>
                      )}
                    </div>
                  </div>

                  {/* Venue Location * */}
                  <div className="space-y-1">
                    <label htmlFor="booking-location" className="font-semibold text-[#6F6A62]">
                      Venue Location *
                    </label>
                    <input
                      id="booking-location"
                      type="text"
                      placeholder="e.g. Le Royal Méridien, Chennai"
                      value={formData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      className={`w-full p-2.5 bg-[#F8F6F2] border ${
                        formErrors.location ? "border-rose-400" : "border-[#E7E0D2]"
                      } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                    />
                    {formErrors.location && (
                      <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.location}</p>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photography Details * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-photographyRequirement" className="font-semibold text-[#6F6A62]">
                        Photography Details *
                      </label>
                      <input
                        id="booking-photographyRequirement"
                        type="text"
                        placeholder="e.g. Candid + Traditional + Drone"
                        value={formData.photographyRequirement}
                        onChange={(e) => handleFieldChange("photographyRequirement", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.photographyRequirement ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.photographyRequirement && (
                        <p className="text-rose-600 text-[10px] mt-0.5">
                          {formErrors.photographyRequirement}
                        </p>
                      )}
                    </div>

                    {/* Cinematography Details * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-cinematographyRequirement" className="font-semibold text-[#6F6A62]">
                        Cinematography Details *
                      </label>
                      <input
                        id="booking-cinematographyRequirement"
                        type="text"
                        placeholder="e.g. 4K Film + 60sec Teaser"
                        value={formData.cinematographyRequirement}
                        onChange={(e) => handleFieldChange("cinematographyRequirement", e.target.value)}
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          formErrors.cinematographyRequirement ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {formErrors.cinematographyRequirement && (
                        <p className="text-rose-600 text-[10px] mt-0.5">
                          {formErrors.cinematographyRequirement}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label htmlFor="booking-adminNotes" className="font-semibold text-[#6F6A62]">
                      Admin &amp; Operational Notes
                    </label>
                    <textarea
                      id="booking-adminNotes"
                      rows={3}
                      placeholder="Advance paid, drone permit status, special requests..."
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pinned Submit Footer */}
                <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    )}
                    <span>{isSubmitting ? "Saving..." : editingBooking ? "Save Changes" : "Create Booking"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Enter your admin password to permanently delete this record."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        requirePassword={true}
        itemDetails={
          bookingToDelete
            ? `${bookingToDelete.customerName || bookingToDelete.clientName} (${bookingToDelete.id})`
            : ""
        }
      />
    </div>
  );
}
