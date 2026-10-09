import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  PhoneCall,
  MessageCircle,
  Mail,
  Trash2,
  CheckCircle,
  Eye,
  Edit2,
  X,
  Calendar,
  Sparkles,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAdminData, normalizeEnquiryStatus } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CLOSED", label: "Closed" },
];

export default function Enquiries() {
  const { enquiries, updateEnquiry, updateEnquiryStatus, deleteEnquiry, services } =
    useAdminData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedService, setSelectedService] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  // Edit Enquiry Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [editFormData, setEditFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    interestedService: "Wedding Photography",
    eventDate: "",
    location: "",
    message: "",
    status: "NEW",
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEditModal = (enq) => {
    setEditingEnquiry(enq);
    setEditFormData({
      clientName: enq.clientName || enq.name || "",
      phone: enq.phone || "",
      email: enq.email || "",
      interestedService:
        enq.interestedService || enq.service || services[0]?.name || "General Inquiry",
      eventDate: enq.eventDate || enq.proposedDate || "",
      location: enq.location || enq.venue || "",
      message: enq.message || enq.notes || enq.clientMessage || "",
      status: normalizeEnquiryStatus(enq.status),
    });
    setEditFormErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingEnquiry(null);
    setEditFormErrors({});
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.clientName.trim()) {
      errors.clientName = "Client name is required.";
    } else if (editFormData.clientName.trim().length < 2) {
      errors.clientName = "Client name must be at least 2 characters.";
    }

    const cleanPhone = editFormData.phone.trim();
    if (!cleanPhone) {
      errors.phone = "Phone number is required.";
    }

    const cleanEmail = editFormData.email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!editFormData.message.trim()) {
      errors.message = "Client message / inquiry notes are required.";
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        clientName: editFormData.clientName.trim(),
        name: editFormData.clientName.trim(),
        phone: editFormData.phone.trim(),
        email: editFormData.email.trim(),
        interestedService: editFormData.interestedService,
        service: editFormData.interestedService,
        eventDate: editFormData.eventDate,
        proposedDate: editFormData.eventDate,
        location: editFormData.location.trim(),
        venue: editFormData.location.trim(),
        message: editFormData.message.trim(),
        notes: editFormData.message.trim(),
        status: editFormData.status,
      };

      const updated = await updateEnquiry(editingEnquiry.id, payload);
      addToast(
        `Enquiry for ${updated.clientName || "Client"} updated successfully.`,
        "success"
      );

      if (activeEnquiry?.id === editingEnquiry.id) {
        setActiveEnquiry(updated);
      }

      handleCloseEditModal();
    } catch (err) {
      addToast(err?.message || "Failed to update enquiry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamically calculate status counts directly from actual enquiry data
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: enquiries.length,
      NEW: 0,
      READ: 0,
      CONTACTED: 0,
      CLOSED: 0,
    };

    enquiries.forEach((e) => {
      const norm = normalizeEnquiryStatus(e.status);
      if (counts[norm] !== undefined) {
        counts[norm] += 1;
      }
    });

    return counts;
  }, [enquiries]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const clientName = e.clientName || e.name || "";
      const phone = e.phone || "";
      const message = e.message || e.notes || e.clientMessage || "";
      const service = e.interestedService || e.service || "";
      const location = e.location || e.venue || "";
      const eventDate = e.proposedDate || e.eventDate || "";

      const matchesSearch =
        searchQuery === "" ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery) ||
        message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eventDate.toLowerCase().includes(searchQuery.toLowerCase());

      const normalizedStatus = normalizeEnquiryStatus(e.status);
      const matchesStatus =
        selectedStatus === "ALL" || normalizedStatus === selectedStatus;
      const matchesService =
        selectedService === "All" || service === selectedService;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [enquiries, searchQuery, selectedStatus, selectedService]);

  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnquiries.slice(start, start + pageSize);
  }, [filteredEnquiries, currentPage, pageSize]);

  const handleStatusChange = async (id, newStatus) => {
    const canonical = normalizeEnquiryStatus(newStatus);
    await updateEnquiryStatus(id, canonical);
    const label = STATUS_FILTERS.find((f) => f.key === canonical)?.label || canonical;
    addToast(`Enquiry marked as "${label}".`, "success");
    if (activeEnquiry?.id === id) {
      setActiveEnquiry((prev) => ({ ...prev, status: canonical }));
    }
  };

  const handleDeletePrompt = (enq) => {
    setEnquiryToDelete(enq);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async (adminPassword) => {
    if (enquiryToDelete) {
      await deleteEnquiry(enquiryToDelete.id, adminPassword);
      addToast(`Enquiry from ${enquiryToDelete.clientName || enquiryToDelete.name} permanently deleted.`, "success");
      if (activeEnquiry?.id === enquiryToDelete.id) {
        setActiveEnquiry(null);
      }
      setDeleteConfirmOpen(false);
      setEnquiryToDelete(null);
    }
  };

  const handleOpenDetail = (enq) => {
    setActiveEnquiry(enq);
    if (normalizeEnquiryStatus(enq.status) === "NEW") {
      updateEnquiryStatus(enq.id, "READ");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
            Client Leads &amp; Enquiries
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Website visitors interested in bookings, consultations, and studio quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800">
            {statusCounts.NEW} New Leads
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search enquiries by client name, phone, message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white"
            />
          </div>

          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Service"
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
          >
            <option value="All">All Interested Services</option>
            {services.map((s) => (
              <option key={s.id || s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-gray-100">
          <span className="text-[11px] text-gray-500 font-semibold mr-1 shrink-0">
            Status:
          </span>
          {STATUS_FILTERS.map(({ key, label }) => {
            const count = statusCounts[key] ?? 0;
            const isSelected = selectedStatus === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedStatus(key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-black text-white shadow-xs font-semibold"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enquiries Grid/Table */}
      {filteredEnquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries found"
          description="Incoming lead messages submitted through the website contact form will appear here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Client Name</th>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Message Preview</th>
                  <th className="py-3.5 px-4 font-semibold">Received</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Connect &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEnquiries.map((enq) => {
                  const isNew = enq.status === "New";
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => handleOpenDetail(enq)}
                      className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                        isNew ? "bg-blue-50/20 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isNew && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                          )}
                          <div>
                            <div className="font-bold text-gray-900">
                              {enq.clientName || enq.name || "Anonymous"}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {enq.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900">
                          {enq.interestedService || enq.service || "General Inquiry"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-gray-500 truncate text-xs">
                          {enq.message || enq.notes || enq.clientMessage || "No message provided."}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                        {enq.receivedDate || enq.createdAt || "Recent"}
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge status={enq.status} size="sm" />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${(enq.phone || "").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${enq.phone || ""}`}
                            className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Direct Call"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(enq)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Full Enquiry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(enq)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Enquiry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(enq)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredEnquiries.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeEnquiry && (
              <div
                className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
                role="dialog"
                aria-modal="true"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveEnquiry(null)}
                  className="fixed inset-0"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-blue-600">
                      {activeEnquiry.id}
                    </span>
                    <StatusBadge status={activeEnquiry.status} size="sm" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    {activeEnquiry.clientName || activeEnquiry.name || "Anonymous"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Received on {activeEnquiry.receivedDate || activeEnquiry.createdAt || "Recent"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs modal-scrollbar">
                {/* Communication Bar */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <a
                    href={`tel:${activeEnquiry.phone || ""}`}
                    className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-gray-500" />
                    <span>{activeEnquiry.phone || "Call"}</span>
                  </a>
                  <a
                    href={`https://wa.me/${(activeEnquiry.phone || "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  {activeEnquiry.email ? (
                    <a
                      href={`mailto:${activeEnquiry.email}`}
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold flex items-center justify-center gap-1.5 transition-all truncate"
                      title={activeEnquiry.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span className="truncate">{activeEnquiry.email}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center gap-1.5 opacity-60">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>No Email</span>
                    </div>
                  )}
                </div>

                {/* Service & Event Info */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interested Service:</span>
                    <span className="font-bold text-gray-900">
                      {activeEnquiry.interestedService || activeEnquiry.service || "General Inquiry"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Proposed Date:</span>
                    <span className="font-semibold text-gray-900">
                      {activeEnquiry.proposedDate || activeEnquiry.eventDate || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-semibold text-gray-900">
                      {activeEnquiry.location || activeEnquiry.venue || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Client Message */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500">
                    Client Inquiry Message
                  </span>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 leading-relaxed text-sm whitespace-pre-wrap">
                    {(activeEnquiry.message || activeEnquiry.notes || activeEnquiry.clientMessage)?.trim() ? (
                      `"${(activeEnquiry.message || activeEnquiry.notes || activeEnquiry.clientMessage).trim()}"`
                    ) : (
                      <span className="text-gray-400 italic">No message provided.</span>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500">
                    Update Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.filter((s) => s.key !== "ALL").map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleStatusChange(activeEnquiry.id, key)}
                        className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                          normalizeEnquiryStatus(activeEnquiry.status) === key
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const enq = activeEnquiry;
                    setActiveEnquiry(null);
                    handleDeletePrompt(enq);
                  }}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs transition-colors"
                >
                  Delete Enquiry
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEnquiry(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const enq = activeEnquiry;
                      setActiveEnquiry(null);
                      handleOpenEditModal(enq);
                    }}
                    className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Enquiry</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* Edit Enquiry Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {editModalOpen && editingEnquiry && (
              <div
                className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
                role="dialog"
                aria-modal="true"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseEditModal}
                  className="fixed inset-0"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-blue-600">
                      {editingEnquiry.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Edit Lead &amp; Enquiry
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    Edit Enquiry Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleEditSubmit} noValidate className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs modal-scrollbar">
                  {/* Row 1: Client Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="enquiry-clientName" className="font-semibold text-gray-700">
                        Client / Lead Name *
                      </label>
                      <input
                        id="enquiry-clientName"
                        type="text"
                        placeholder="e.g. Ramesh & Sneha"
                        value={editFormData.clientName}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, clientName: e.target.value }))
                        }
                        className={`w-full p-2.5 bg-gray-50 border ${
                          editFormErrors.clientName ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {editFormErrors.clientName && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.clientName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-phone" className="font-semibold text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        id="enquiry-phone"
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className={`w-full p-2.5 bg-gray-50 border ${
                          editFormErrors.phone ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {editFormErrors.phone && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email & Interested Service */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="enquiry-email" className="font-semibold text-gray-700">
                        Email Address
                      </label>
                      <input
                        id="enquiry-email"
                        type="email"
                        placeholder="client@gmail.com"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className={`w-full p-2.5 bg-gray-50 border ${
                          editFormErrors.email ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {editFormErrors.email && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-service" className="font-semibold text-gray-700">
                        Interested Service
                      </label>
                      <select
                        id="enquiry-service"
                        value={editFormData.interestedService}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, interestedService: e.target.value }))
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        {services.map((s) => (
                          <option key={s.id || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Proposed Date & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="enquiry-eventDate" className="font-semibold text-gray-700">
                        Proposed / Event Date
                      </label>
                      <input
                        id="enquiry-eventDate"
                        type="date"
                        value={editFormData.eventDate}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, eventDate: e.target.value }))
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-location" className="font-semibold text-gray-700">
                        Location / Venue
                      </label>
                      <input
                        id="enquiry-location"
                        type="text"
                        placeholder="e.g. Tirunelveli, Tamil Nadu"
                        value={editFormData.location}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, location: e.target.value }))
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Status */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Enquiry Status</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FILTERS.filter((s) => s.key !== "ALL").map(({ key, label }) => {
                        const isSelected = editFormData.status === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setEditFormData((prev) => ({ ...prev, status: key }))}
                            className={`px-3 py-1.5 rounded-xl font-semibold border text-xs transition-all ${
                              isSelected
                                ? "bg-black text-white border-black"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 5: Message / Client Notes */}
                  <div className="space-y-1">
                    <label htmlFor="enquiry-message" className="font-semibold text-gray-700">
                      Client Message &amp; Notes *
                    </label>
                    <textarea
                      id="enquiry-message"
                      rows={4}
                      placeholder="Client requirements, budget discussions, or consultation notes..."
                      value={editFormData.message}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      className={`w-full p-3 bg-gray-50 border ${
                        editFormErrors.message ? "border-rose-400" : "border-gray-200"
                      } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none resize-none leading-relaxed`}
                    />
                    {editFormErrors.message && (
                      <p className="text-rose-600 text-[10px]">{editFormErrors.message}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>Save Changes</span>
                      </>
                    )}
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
        onClose={() => {
          setDeleteConfirmOpen(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Enter your admin password to permanently delete this record."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        requirePassword={true}
        itemDetails={
          enquiryToDelete
            ? `${enquiryToDelete.clientName || enquiryToDelete.name} (${enquiryToDelete.id})`
            : ""
        }
      />
    </div>
  );
}
