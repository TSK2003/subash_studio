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
  X,
  Calendar,
  Sparkles,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

const STATUSES = ["All", "New", "Read", "Contacted", "Closed"];

export default function Enquiries() {
  const { enquiries, updateEnquiryStatus, deleteEnquiry, services } = useAdminData();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

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

      const matchesStatus =
        selectedStatus === "All" || e.status === selectedStatus;
      const matchesService =
        selectedService === "All" || service === selectedService;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [enquiries, searchQuery, selectedStatus, selectedService]);

  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnquiries.slice(start, start + pageSize);
  }, [filteredEnquiries, currentPage, pageSize]);

  const handleStatusChange = (id, newStatus) => {
    updateEnquiryStatus(id, newStatus);
    addToast(`Enquiry marked as "${newStatus}".`, "success");
    if (activeEnquiry?.id === id) {
      setActiveEnquiry((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleDeletePrompt = (enq) => {
    setEnquiryToDelete(enq);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (enquiryToDelete) {
      deleteEnquiry(enquiryToDelete.id);
      addToast(`Enquiry from ${enquiryToDelete.clientName || enquiryToDelete.name} deleted.`, "info");
      if (activeEnquiry?.id === enquiryToDelete.id) {
        setActiveEnquiry(null);
      }
      setDeleteConfirmOpen(false);
      setEnquiryToDelete(null);
    }
  };

  const handleOpenDetail = (enq) => {
    setActiveEnquiry(enq);
    if (enq.status === "New") {
      updateEnquiryStatus(enq.id, "Read");
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
            {enquiries.filter((e) => e.status === "New").length} New Leads
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
          {STATUSES.map((status) => {
            const count =
              status === "All"
                ? enquiries.length
                : enquiries.filter((e) => e.status === status).length;
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-2xl border border-[#E7E0D2] z-10 space-y-5"
            >
              <button
                onClick={() => setActiveEnquiry(null)}
                className="absolute top-6 right-6 p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2]"
              >
                <X className="w-5 h-5" />
              </button>

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
                  {STATUSES.filter((s) => s !== "All").map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(activeEnquiry.id, status)}
                      className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                        activeEnquiry.status === status
                          ? "bg-[#2B2B2B] text-[#E4D3A6] border-[#2B2B2B]"
                          : "bg-white text-[#6F6A62] border-[#E7E0D2] hover:bg-[#F8F6F2]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Enquiry"
        message={`Are you sure you want to delete the lead enquiry from ${enquiryToDelete?.clientName || enquiryToDelete?.name}?`}
        confirmText="Delete Enquiry"
        isDestructive={true}
      />
    </div>
  );
}
