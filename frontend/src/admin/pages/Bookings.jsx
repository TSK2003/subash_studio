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

const STATUSES = [
  "All",
  "New",
  "Contacted",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

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
  const [selectedStatus, setSelectedStatus] = useState("All");
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
      setFormModalOpen(true);
    }
  }, [isNewParam]);

  // Form State
  const initialFormState = {
    customerName: "",
    phone: "",
    email: "",
    eventType: "Wedding & Reception",
    eventDate: "",
    location: "",
    numberOfDays: "1 Day",
    requiredService: "Wedding Photography",
    photographyRequirement: "Candid + Traditional Stills",
    cinematographyRequirement: "Cinematic 4K Film + Highlights",
    budget: "₹1,50,000",
    branch: "Tirunelveli",
    status: "New",
    adminNotes: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        searchQuery === "" ||
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone?.includes(searchQuery) ||
        b.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || b.status === selectedStatus;
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
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      customerName: booking.customerName || "",
      phone: booking.phone || "",
      email: booking.email || "",
      eventType: booking.eventType || "Wedding",
      eventDate: booking.eventDate || "",
      location: booking.location || "",
      numberOfDays: booking.numberOfDays || "1 Day",
      requiredService: booking.requiredService || "Wedding Photography",
      photographyRequirement: booking.photographyRequirement || "",
      cinematographyRequirement: booking.cinematographyRequirement || "",
      budget: booking.budget || "",
      branch: booking.branch || "Tirunelveli",
      status: booking.status || "New",
      adminNotes: booking.adminNotes || "",
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.customerName.trim()) errors.customerName = "Customer name is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    if (!formData.eventDate) errors.eventDate = "Event date is required.";
    if (!formData.location.trim()) errors.location = "Location is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingBooking) {
      updateBooking(editingBooking.id, formData);
      addToast(`Booking ${editingBooking.id} updated successfully.`, "success");
      if (activeBooking?.id === editingBooking.id) {
        setActiveBooking({ ...activeBooking, ...formData });
      }
    } else {
      const created = addBooking(formData);
      addToast(`Booking ${created.id} created successfully.`, "success");
    }

    setFormModalOpen(false);
  };

  const handleDeletePrompt = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete.id);
      addToast(`Booking ${bookingToDelete.id} removed.`, "info");
      if (activeBooking?.id === bookingToDelete.id) {
        setDrawerOpen(false);
        setActiveBooking(null);
      }
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleStatusQuickChange = (id, newStatus) => {
    updateBooking(id, { status: newStatus });
    addToast(`Booking status updated to "${newStatus}".`, "success");
    if (activeBooking?.id === id) {
      setActiveBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedBranch("All");
    setSelectedService("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
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
          {STATUSES.map((status) => {
            const count =
              status === "All"
                ? bookings.length
                : bookings.filter((b) => b.status === status).length;
            const isSelected = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm font-semibold"
                    : "bg-[#F8F6F2] text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F3EFE8]"
                }`}
              >
                <span>{status}</span>
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

      {/* Booking Details Drawer */}
      <AnimatePresence>
        {drawerOpen && activeBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto flex flex-col border-l border-[#E7E0D2]"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-[#FCFAF7] border-b border-[#E7E0D2] flex items-center justify-between sticky top-0 z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#9C7B3D]">
                      {activeBooking.id}
                    </span>
                    <StatusBadge status={activeBooking.status} size="sm" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#2B2B2B]">
                    {activeBooking.customerName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Communication Bar */}
              <div className="p-4 bg-[#F8F6F2] border-b border-[#E7E0D2] grid grid-cols-3 gap-2 text-center text-xs">
                <a
                  href={`tel:${activeBooking.phone}`}
                  className="py-2 px-3 bg-white border border-[#E7E0D2] rounded-xl hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#9C7B3D]" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${activeBooking.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 text-emerald-900 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${activeBooking.email || ""}`}
                  className="py-2 px-3 bg-white border border-[#E7E0D2] rounded-xl hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9C7B3D]" />
                  <span>Email</span>
                </a>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1 text-xs text-[#2B2B2B]">
                {/* Event Highlights */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D2]">
                  <div>
                    <span className="text-[#6F6A62] block mb-1">Event Type</span>
                    <span className="font-bold text-sm text-[#2B2B2B]">
                      {activeBooking.eventType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6A62] block mb-1">Event Date</span>
                    <span className="font-bold text-sm text-[#2B2B2B]">
                      {new Date(activeBooking.eventDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6A62] block mb-1">Shoot Duration</span>
                    <span className="font-bold text-[#2B2B2B]">
                      {activeBooking.numberOfDays}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6A62] block mb-1">Estimated Budget</span>
                    <span className="font-bold text-sm text-[#9C7B3D]">
                      {activeBooking.budget || "₹0"}
                    </span>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A62]">
                    Venue &amp; Branch Assignment
                  </span>
                  <div className="p-4 rounded-xl border border-[#E7E0D2] bg-white space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#9C7B3D] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{activeBooking.location}</span>
                        <span className="text-[#6F6A62] text-[11px]">
                          Assigned Studio Branch: {activeBooking.branch}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A62]">
                    Shoot Requirements
                  </span>
                  <div className="p-4 rounded-xl border border-[#E7E0D2] bg-white space-y-3">
                    <div>
                      <span className="text-[#6F6A62] block text-[11px]">Primary Service</span>
                      <span className="font-bold text-sm text-[#2B2B2B]">{activeBooking.requiredService}</span>
                    </div>
                    {activeBooking.photographyRequirement && (
                      <div className="pt-2 border-t border-[#F8F6F2]">
                        <span className="text-[#6F6A62] block text-[11px]">Photography Stills</span>
                        <span className="text-[#2B2B2B] font-medium">{activeBooking.photographyRequirement}</span>
                      </div>
                    )}
                    {activeBooking.cinematographyRequirement && (
                      <div className="pt-2 border-t border-[#F8F6F2]">
                        <span className="text-[#6F6A62] block text-[11px]">Cinematography / Films</span>
                        <span className="text-[#2B2B2B] font-medium">{activeBooking.cinematographyRequirement}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Quick Switch */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A62]">
                    Change Shoot Status
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUSES.filter((s) => s !== "All").map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusQuickChange(activeBooking.id, status)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          activeBooking.status === status
                            ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                            : "bg-[#F8F6F2] text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F3EFE8]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A62]">
                    Studio Operations Notes
                  </span>
                  <div className="p-4 rounded-xl border border-[#E7E0D2] bg-[#FDFBF7] text-[#2B2B2B] leading-relaxed">
                    {activeBooking.adminNotes || "No notes added for this booking yet."}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between sticky bottom-0">
                <button
                  type="button"
                  onClick={() => handleDeletePrompt(activeBooking)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs transition-colors"
                >
                  Delete Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(activeBooking);
                  }}
                  className="px-5 py-2 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl font-semibold text-xs transition-all shadow"
                >
                  Edit Booking
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Booking Modal */}
      <AnimatePresence>
        {formModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormModalOpen(false)}
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
                    {editingBooking ? "Update Shoot" : "New Client Booking"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingBooking ? `Edit ${editingBooking.id}` : "Schedule Shoot Session"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with scrollable body & pinned footer */}
              <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavitha & Arvind"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                    {formErrors.customerName && (
                      <p className="text-rose-600 text-[10px]">{formErrors.customerName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98401 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                    {formErrors.phone && (
                      <p className="text-rose-600 text-[10px]">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Email Address</label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  {/* Event Type */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Event Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Wedding & Reception"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Event Date */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                    {formErrors.eventDate && (
                      <p className="text-rose-600 text-[10px]">{formErrors.eventDate}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Duration / Days</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Days / Half Day"
                      value={formData.numberOfDays}
                      onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Package Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1,50,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Required Service */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Primary Service</label>
                    <select
                      value={formData.requiredService}
                      onChange={(e) => setFormData({ ...formData, requiredService: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    >
                      {services.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Assignment */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Studio Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id || b.city} value={b.city}>
                          {b.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    >
                      {STATUSES.filter((s) => s !== "All").map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Venue Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Le Royal Méridien, Chennai"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                  />
                  {formErrors.location && (
                    <p className="text-rose-600 text-[10px]">{formErrors.location}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Photography Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Candid + Traditional + Drone"
                      value={formData.photographyRequirement}
                      onChange={(e) => setFormData({ ...formData, photographyRequirement: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Cinematography Details</label>
                    <input
                      type="text"
                      placeholder="e.g. 4K Film + 60sec Teaser"
                      value={formData.cinematographyRequirement}
                      onChange={(e) => setFormData({ ...formData, cinematographyRequirement: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Admin &amp; Operational Notes</label>
                  <textarea
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
                    onClick={() => setFormModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingBooking ? "Save Changes" : "Create Booking"}
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
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Booking Record"
        message={`Are you sure you want to remove the booking for ${bookingToDelete?.customerName} (${bookingToDelete?.id})? This action cannot be undone.`}
        confirmText="Delete Booking"
        isDestructive={true}
      />
    </div>
  );
}
