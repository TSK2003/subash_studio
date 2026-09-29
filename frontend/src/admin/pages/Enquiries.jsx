import { useState, useMemo } from "react";
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
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Client Leads &amp; Enquiries
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Website visitors interested in bookings, consultations, and studio quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#FDFBF7] border border-[#E4D3A6] rounded-full text-xs font-semibold text-[#9C7B3D]">
            {statusCounts.NEW} New Leads
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
            <input
              type="text"
              placeholder="Search enquiries by client name, phone, message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669]"
            />
          </div>

          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Service"
            className="px-3 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:outline-none focus:border-[#C9A669]"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#F8F6F2]">
          <span className="text-[11px] text-[#6F6A62] font-semibold mr-1 shrink-0">
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

      {/* Enquiries Grid/Table */}
      {filteredEnquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries found"
          description="Incoming lead messages submitted through the website contact form will appear here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E7E0D2] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] border-b border-[#E7E0D2] text-[#6F6A62]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Client Name</th>
                  <th className="py-3.5 px-4 font-semibold">Service</th>
                  <th className="py-3.5 px-4 font-semibold">Message Preview</th>
                  <th className="py-3.5 px-4 font-semibold">Received</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Connect &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F6F2]">
                {paginatedEnquiries.map((enq) => {
                  const isNew = enq.status === "New";
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => handleOpenDetail(enq)}
                      className={`hover:bg-[#FDFBF7] transition-colors cursor-pointer ${
                        isNew ? "bg-[#FFFDF9] font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isNew && (
                            <span className="w-2 h-2 rounded-full bg-[#C9A669] shrink-0 animate-ping" />
                          )}
                          <div>
                            <div className="font-bold text-[#2B2B2B]">
                              {enq.clientName || enq.name || "Anonymous"}
                            </div>
                            <div className="text-[11px] text-[#6F6A62]">
                              {enq.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#9C7B3D]">
                          {enq.interestedService || enq.service || "General Inquiry"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[#6F6A62] truncate text-xs">
                          {enq.message || enq.notes || enq.clientMessage || "No message provided."}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#8E867B] whitespace-nowrap">
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
                            className="p-1.5 bg-[#F8F6F2] text-[#2B2B2B] hover:bg-[#E7E0D2] rounded-lg transition-colors"
                            title="Direct Call"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(enq)}
                            className="p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors"
                            title="View Full Enquiry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(enq)}
                            className="p-1.5 text-[#6F6A62] hover:text-[#9C7B3D] hover:bg-[#F8F6F2] rounded-lg transition-colors"
                            title="Edit Enquiry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(enq)}
                            className="p-1.5 text-[#6F6A62] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

          <div className="p-3 border-t border-[#E7E0D2]">
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
      <AnimatePresence>
        {activeEnquiry && (
          <div className="admin-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEnquiry(null)}
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
                      {activeEnquiry.id}
                    </span>
                    <StatusBadge status={activeEnquiry.status} size="sm" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {activeEnquiry.clientName || activeEnquiry.name || "Anonymous"}
                  </h3>
                  <p className="text-xs text-[#6F6A62]">
                    Received on {activeEnquiry.receivedDate || activeEnquiry.createdAt || "Recent"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
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
                    className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#9C7B3D]" />
                    <span>{activeEnquiry.phone || "Call"}</span>
                  </a>
                  <a
                    href={`https://wa.me/${(activeEnquiry.phone || "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  {activeEnquiry.email ? (
                    <a
                      href={`mailto:${activeEnquiry.email}`}
                      className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] hover:border-[#C9A669] text-[#2B2B2B] font-semibold flex items-center justify-center gap-1.5 transition-all truncate"
                      title={activeEnquiry.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#9C7B3D]" />
                      <span className="truncate">{activeEnquiry.email}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-[#E7E0D2] bg-[#F8F6F2] text-[#8E867B] flex items-center justify-center gap-1.5 opacity-60">
                      <Mail className="w-3.5 h-3.5 text-[#8E867B]" />
                      <span>No Email</span>
                    </div>
                  )}
                </div>

                {/* Service & Event Info */}
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D2] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6F6A62]">Interested Service:</span>
                    <span className="font-bold text-[#2B2B2B]">
                      {activeEnquiry.interestedService || activeEnquiry.service || "General Inquiry"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6A62]">Proposed Date:</span>
                    <span className="font-semibold text-[#2B2B2B]">
                      {activeEnquiry.proposedDate || activeEnquiry.eventDate || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6A62]">Location:</span>
                    <span className="font-semibold text-[#2B2B2B]">
                      {activeEnquiry.location || activeEnquiry.venue || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Client Message */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
                    Client Inquiry Message
                  </span>
                  <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] text-[#2B2B2B] leading-relaxed text-sm whitespace-pre-wrap">
                    {(activeEnquiry.message || activeEnquiry.notes || activeEnquiry.clientMessage)?.trim() ? (
                      `"${(activeEnquiry.message || activeEnquiry.notes || activeEnquiry.clientMessage).trim()}"`
                    ) : (
                      <span className="text-[#8E867B] italic">No message provided.</span>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#6F6A62]">
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
                            ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                            : "bg-white text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F8F6F2]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-between shrink-0">
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
                    className="px-5 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold text-xs transition-colors"
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
                    className="px-5 py-2.5 bg-[#2B2B2B] text-[#E4D3A6] hover:bg-[#1C1B19] rounded-xl font-semibold text-xs transition-all shadow flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Enquiry</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Enquiry Modal */}
      <AnimatePresence>
        {editModalOpen && editingEnquiry && (
          <div className="admin-modal-overlay !z-[60]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEditModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-[#9C7B3D]">
                      {editingEnquiry.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6A62]">
                      Edit Lead &amp; Enquiry
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    Edit Enquiry Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
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
                      <label htmlFor="enquiry-clientName" className="font-semibold text-[#6F6A62]">
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
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          editFormErrors.clientName ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {editFormErrors.clientName && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.clientName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-phone" className="font-semibold text-[#6F6A62]">
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
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          editFormErrors.phone ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {editFormErrors.phone && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email & Interested Service */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="enquiry-email" className="font-semibold text-[#6F6A62]">
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
                        className={`w-full p-2.5 bg-[#F8F6F2] border ${
                          editFormErrors.email ? "border-rose-400" : "border-[#E7E0D2]"
                        } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none`}
                      />
                      {editFormErrors.email && (
                        <p className="text-rose-600 text-[10px]">{editFormErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-service" className="font-semibold text-[#6F6A62]">
                        Interested Service
                      </label>
                      <select
                        id="enquiry-service"
                        value={editFormData.interestedService}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, interestedService: e.target.value }))
                        }
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
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
                      <label htmlFor="enquiry-eventDate" className="font-semibold text-[#6F6A62]">
                        Proposed / Event Date
                      </label>
                      <input
                        id="enquiry-eventDate"
                        type="date"
                        value={editFormData.eventDate}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, eventDate: e.target.value }))
                        }
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="enquiry-location" className="font-semibold text-[#6F6A62]">
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
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Status */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Enquiry Status</label>
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
                                ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                                : "bg-[#F8F6F2] text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F3EFE8]"
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
                    <label htmlFor="enquiry-message" className="font-semibold text-[#6F6A62]">
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
                      className={`w-full p-3 bg-[#F8F6F2] border ${
                        editFormErrors.message ? "border-rose-400" : "border-[#E7E0D2]"
                      } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none resize-none leading-relaxed`}
                    />
                    {editFormErrors.message && (
                      <p className="text-rose-600 text-[10px]">{editFormErrors.message}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#2B2B2B] text-[#E4D3A6] hover:bg-[#1C1B19] rounded-xl font-semibold text-xs transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#E4D3A6]" />
                        <span>Save Changes</span>
                      </>
                    )}
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
