import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

export function formatBookingDateTime(dateStr, timeStr) {
  if (!dateStr) return { date: "Not specified", time: "" };

  let timePart = timeStr || "";
  let datePart = dateStr;

  if (dateStr.includes("T")) {
    const parts = dateStr.split("T");
    datePart = parts[0];
    if (!timePart && parts[1]) timePart = parts.slice(1).join("T");
  }

  const parsed = new Date(datePart + "T00:00:00");
  const formattedDate = !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : datePart;

  let formattedTime = "";
  if (timePart) {
    const trimmed = timePart.trim();
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const ampm = match12[3].toUpperCase();
      formattedTime = `${hours}:${minutes} ${ampm}`;
    } else {
      const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
      if (match24) {
        let hours = parseInt(match24[1], 10);
        const minutes = match24[2];
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        formattedTime = `${hours}:${minutes} ${ampm}`;
      } else {
        formattedTime = trimmed;
      }
    }
  }

  return { date: formattedDate, time: formattedTime };
}

export function parseTimeValue(val) {
  if (!val || typeof val !== "string") {
    return { hour: "", minute: "", period: "AM" };
  }
  const str = val.trim();
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const p = match12[3].toUpperCase();
    if (h > 12) h = h % 12 || 12;
    if (h === 0) h = 12;
    return {
      hour: String(h).padStart(2, "0"),
      minute: m,
      period: p,
    };
  }

  const match24 = str.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return {
      hour: String(h).padStart(2, "0"),
      minute: m,
      period: p,
    };
  }

  return { hour: "", minute: "", period: "AM" };
}

function Time12Picker({ value, onChange, id }) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState("AM");

  const hourInputRef = useRef(null);
  const minuteInputRef = useRef(null);
  const lastEmittedRef = useRef(value || "");

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value || "";
    const parsed = parseTimeValue(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [value]);

  const triggerChange = (h, m, p) => {
    if (!h && !m) {
      lastEmittedRef.current = "";
      onChange("");
      return;
    }
    const cleanH = h ? h.padStart(2, "0") : "12";
    const cleanM = (m || "00").padStart(2, "0");
    const formatted = `${cleanH}:${cleanM} ${p}`;
    lastEmittedRef.current = formatted;
    onChange(formatted);
  };

  const handleHourChange = (e) => {
    const raw = e.target.value;
    // Allow pasting full time e.g. "10:30 PM" or "14:20"
    if (raw.includes(":")) {
      const parsed = parseTimeValue(raw);
      if (parsed.hour) {
        setHour(parsed.hour);
        setMinute(parsed.minute || "00");
        setPeriod(parsed.period);
        triggerChange(parsed.hour, parsed.minute || "00", parsed.period);
        return;
      }
    }

    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
      setHour("");
      triggerChange("", minute, period);
      return;
    }

    const num = parseInt(digits, 10);
    // Strict 12-hour limit: typing > 12 is rejected and does not work
    if (num > 12) {
      return;
    }

    // Allow typing "0" so user can type "01"-"09"
    if (digits === "0") {
      setHour("0");
      return;
    }

    // Single digit 2-9 cannot have another digit since 20+ > 12
    if (digits.length === 1 && num >= 2) {
      const padded = `0${num}`;
      setHour(padded);
      triggerChange(padded, minute, period);
      minuteInputRef.current?.focus();
      minuteInputRef.current?.select();
      return;
    }

    if (digits.length === 2) {
      if (num === 0) return; // 00 is invalid in 12h clock
      setHour(digits);
      triggerChange(digits, minute, period);
      minuteInputRef.current?.focus();
      minuteInputRef.current?.select();
      return;
    }

    // Single digit "1"
    setHour(digits);
    triggerChange(digits, minute, period);
  };

  const handleMinuteChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
      setMinute("");
      triggerChange(hour, "", period);
      return;
    }

    const num = parseInt(digits, 10);
    // Strict minute limit: typing > 59 is rejected and does not work
    if (num > 59) {
      return;
    }

    // Single digit 6-9 cannot have a second digit since 60+ > 59
    if (digits.length === 1 && num >= 6) {
      const padded = `0${num}`;
      setMinute(padded);
      triggerChange(hour, padded, period);
      return;
    }

    if (digits.length === 2) {
      setMinute(digits);
      triggerChange(hour, digits, period);
      return;
    }

    // Single digit 0-5
    setMinute(digits);
    triggerChange(hour, digits, period);
  };

  const handleHourBlur = () => {
    if (!hour) return;
    const num = parseInt(hour, 10);
    if (isNaN(num) || num === 0) {
      setHour("12");
      triggerChange("12", minute, period);
    } else {
      const padded = String(num).padStart(2, "0");
      setHour(padded);
      triggerChange(padded, minute, period);
    }
  };

  const handleMinuteBlur = () => {
    if (!minute) return;
    const num = parseInt(minute, 10);
    const padded = String(isNaN(num) ? 0 : num).padStart(2, "0");
    setMinute(padded);
    triggerChange(hour, padded, period);
  };

  const handleKeyDownCommon = (e) => {
    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      handlePeriodChange("AM");
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      handlePeriodChange("PM");
    }
  };

  const handleHourKeyDown = (e) => {
    handleKeyDownCommon(e);
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const current = parseInt(hour, 10);
      const next = isNaN(current) ? 12 : current >= 12 ? 1 : current + 1;
      const nextStr = String(next).padStart(2, "0");
      setHour(nextStr);
      triggerChange(nextStr, minute, period);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const current = parseInt(hour, 10);
      const next = isNaN(current) ? 12 : current <= 1 ? 12 : current - 1;
      const nextStr = String(next).padStart(2, "0");
      setHour(nextStr);
      triggerChange(nextStr, minute, period);
    } else if (e.key === "ArrowRight" || e.key === ":") {
      e.preventDefault();
      minuteInputRef.current?.focus();
      minuteInputRef.current?.select();
    }
  };

  const handleMinuteKeyDown = (e) => {
    handleKeyDownCommon(e);
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const current = parseInt(minute, 10);
      const next = isNaN(current) ? 0 : current >= 59 ? 0 : current + 1;
      const nextStr = String(next).padStart(2, "0");
      setMinute(nextStr);
      triggerChange(hour, nextStr, period);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const current = parseInt(minute, 10);
      const next = isNaN(current) ? 59 : current <= 0 ? 59 : current - 1;
      const nextStr = String(next).padStart(2, "0");
      setMinute(nextStr);
      triggerChange(hour, nextStr, period);
    } else if (e.key === "ArrowLeft") {
      if (e.target.selectionStart === 0 || !minute) {
        e.preventDefault();
        hourInputRef.current?.focus();
        hourInputRef.current?.select();
      }
    } else if (e.key === "Backspace" && !minute) {
      e.preventDefault();
      hourInputRef.current?.focus();
      hourInputRef.current?.select();
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    triggerChange(hour, minute, newPeriod);
  };

  const handleClear = () => {
    setHour("");
    setMinute("");
    lastEmittedRef.current = "";
    onChange("");
    hourInputRef.current?.focus();
  };

  return (
    <div className="flex items-center justify-between w-full p-2 bg-gray-50 border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 focus-within:bg-white rounded-xl transition-all">
      <div className="flex items-center gap-1.5 text-xs text-gray-900">
        <Clock className="w-4 h-4 text-gray-400 shrink-0 ml-1" />

        {/* Hour Input (1-12) */}
        <input
          ref={hourInputRef}
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="HH"
          value={hour}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
          onBlur={handleHourBlur}
          maxLength={2}
          aria-label="Hour (1 to 12)"
          className="w-7 text-center bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none select-all"
        />

        <span className="text-gray-400 font-bold select-none">:</span>

        {/* Minute Input (0-59) */}
        <input
          ref={minuteInputRef}
          type="text"
          inputMode="numeric"
          placeholder="MM"
          value={minute}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
          onBlur={handleMinuteBlur}
          maxLength={2}
          aria-label="Minute (0 to 59)"
          className="w-7 text-center bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none select-all"
        />
      </div>

      {/* AM / PM Segmented Control & Optional Clear */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => handlePeriodChange("AM")}
            className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md transition-all ${
              period === "AM"
                ? "bg-black text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange("PM")}
            className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md transition-all ${
              period === "PM"
                ? "bg-black text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            PM
          </button>
        </div>

        {(hour || minute) && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear time"
            aria-label="Clear time"
            className="p-1 text-gray-400 hover:text-rose-600 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

const INITIAL_FORM_STATE = {
  customerName: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
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
  "eventTime",
  "numberOfDays",
  "budget",
  "requiredService",
  "branch",
  "status",
  "location",
  "photographyRequirement",
  "cinematographyRequirement",
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
      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
      setFormModalOpen(true);
    }
  }, [isNewParam]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
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
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsSubmitting(false);
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingBooking(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleOpenEditModal = (booking) => {
    setEditingBooking(booking);
    let initialDate = "";
    let initialTime = booking.eventTime || "";
    if (booking.eventDate) {
      if (booking.eventDate.includes("T")) {
        const parts = booking.eventDate.split("T");
        initialDate = parts[0];
        if (!initialTime && parts[1]) initialTime = parts.slice(1).join("T");
      } else {
        initialDate = booking.eventDate;
      }
    }
    setFormData({
      customerName: booking.customerName || booking.clientName || "",
      phone: (booking.phone || "").replace(/\D/g, "").slice(0, 10),
      email: booking.email || "",
      eventType: booking.eventType || "",
      eventDate: initialDate,
      eventTime: initialTime,
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
    const cleanDateOnly = formData.eventDate ? formData.eventDate.split("T")[0] : "";
    const cleanTime = (formData.eventTime || "").trim();
    const finalEventDate = cleanTime ? `${cleanDateOnly}T${cleanTime}` : cleanDateOnly;

    const payload = {
      ...formData,
      eventDate: finalEventDate,
      eventTime: cleanTime,
    };

    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, payload);
        addToast(`Booking ${editingBooking.id} updated successfully.`, "success");
        if (activeBooking?.id === editingBooking.id) {
          setActiveBooking({ ...activeBooking, ...payload });
        }
      } else {
        const created = await addBooking(payload);
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
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
            Studio Shoot Bookings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage upcoming client shoots, venue schedules, and project requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, booking ID, phone, venue..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white"
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
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
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
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:bg-white"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-gray-100">
          <span className="text-[11px] text-gray-500 font-semibold mr-1 shrink-0">
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
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
              <tbody className="divide-y divide-gray-100">
                {paginatedBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    onClick={() => {
                      setActiveBooking(b);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {b.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">
                        {b.customerName}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {b.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">
                        {b.requiredService}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {b.eventType} ({b.numberOfDays})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const { date: fDate, time: fTime } = formatBookingDateTime(b.eventDate, b.eventTime);
                        return (
                          <>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5 flex-wrap">
                              <span>{fDate}</span>
                              {fTime && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  {fTime}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Budget: {b.budget || "N/A"}
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">
                        {b.branch}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
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
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(b)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          <div className="p-3 border-t border-gray-200">
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
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {drawerOpen && activeBooking && (
              <div
                className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
                role="dialog"
                aria-modal="true"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveBooking(null);
                  }}
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
                      {activeBooking.id}
                    </span>
                    <StatusBadge status={activeBooking.status} size="sm" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    {activeBooking.customerName || activeBooking.clientName || "Valued Client"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Booked on {activeBooking.createdAt ? (activeBooking.createdAt.includes("T") ? activeBooking.createdAt.split("T")[0] : activeBooking.createdAt) : "Recent"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveBooking(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
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
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-gray-500" />
                      <span>{activeBooking.phone}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center gap-1.5 opacity-60">
                      <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                      <span>No Phone</span>
                    </div>
                  )}

                  {activeBooking.phone ? (
                    <a
                      href={`https://wa.me/${activeBooking.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center gap-1.5 transition-all"
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
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold flex items-center justify-center gap-1.5 transition-all truncate"
                      title={activeBooking.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span className="truncate">{activeBooking.email}</span>
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center gap-1.5 opacity-60">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>No Email</span>
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Event Type:</span>
                    <span className="font-bold text-gray-900">{activeBooking.eventType || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Event Date:</span>
                    <span className="font-semibold text-gray-900">
                      {activeBooking.eventDate
                        ? (() => {
                            const datePart = activeBooking.eventDate.includes("T")
                              ? activeBooking.eventDate.split("T")[0]
                              : activeBooking.eventDate;
                            const parsed = new Date(datePart + "T00:00:00");
                            return !isNaN(parsed.getTime())
                              ? parsed.toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : datePart;
                          })()
                        : "Not specified"}
                    </span>
                  </div>
                  {(() => {
                    const { time: detailTime } = formatBookingDateTime(activeBooking.eventDate, activeBooking.eventTime);
                    if (!detailTime) return null;
                    return (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Event Time:</span>
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {detailTime}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Shoot Duration:</span>
                    <span className="font-semibold text-gray-900">{activeBooking.numberOfDays || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Estimated Budget:</span>
                    <span className="font-bold text-gray-900">{activeBooking.budget || "₹0"}</span>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500">
                    Venue &amp; Branch Assignment
                  </span>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-gray-500 flex items-center gap-1.5 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        Venue Location:
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {activeBooking.location || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 flex items-center gap-1.5 shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        Studio Branch:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {activeBooking.branch || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shoot Requirements */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500">
                    Shoot Requirements
                  </span>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-gray-500">Primary Service:</span>
                      <span className="font-bold text-gray-900">
                        {activeBooking.requiredService || "General Photography"}
                      </span>
                    </div>
                    {activeBooking.photographyRequirement && (
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-start gap-4">
                        <span className="text-gray-500 shrink-0">Photography Details:</span>
                        <span className="font-medium text-gray-900 text-right">
                          {activeBooking.photographyRequirement}
                        </span>
                      </div>
                    )}
                    {activeBooking.cinematographyRequirement && (
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-start gap-4">
                        <span className="text-gray-500 shrink-0">Cinematography Details:</span>
                        <span className="font-medium text-gray-900 text-right">
                          {activeBooking.cinematographyRequirement}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Shoot Status */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500">
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
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
                  <span className="font-bold uppercase tracking-wider text-gray-500">
                    Studio Operations Notes
                  </span>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 leading-relaxed text-sm whitespace-pre-wrap">
                    {activeBooking.adminNotes?.trim() ? (
                      `"${activeBooking.adminNotes.trim()}"`
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        No operational notes added for this booking yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
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
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEditModal(activeBooking);
                    }}
                    className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Booking</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* Add / Edit Booking Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {formModalOpen && (
              <div
                className="admin-portal fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden"
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
                  className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {editingBooking ? "Update Shoot" : "New Client Booking"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                    {editingBooking ? `Edit ${editingBooking.id}` : "Schedule Shoot Session"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
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
                      <label htmlFor="booking-customerName" className="font-semibold text-gray-700">
                        Customer Name *
                      </label>
                      <input
                        id="booking-customerName"
                        type="text"
                        placeholder="e.g. Kavitha & Arvind"
                        value={formData.customerName}
                        onChange={(e) => handleFieldChange("customerName", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.customerName ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.customerName && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.customerName}</p>
                      )}
                    </div>

                    {/* Phone Number * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-phone" className="font-semibold text-gray-700">
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
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.phone ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.phone && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-email" className="font-semibold text-gray-700">
                        Email Address *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="client@gmail.com"
                        value={formData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.email ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.email && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Event Type * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-eventType" className="font-semibold text-gray-700">
                        Event Type *
                      </label>
                      <input
                        id="booking-eventType"
                        type="text"
                        placeholder="e.g. Wedding & Reception"
                        value={formData.eventType}
                        onChange={(e) => handleFieldChange("eventType", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.eventType ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.eventType && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.eventType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Event Date * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-eventDate" className="font-semibold text-gray-700">
                        Event Date *
                      </label>
                      <input
                        id="booking-eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleFieldChange("eventDate", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.eventDate ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.eventDate && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.eventDate}</p>
                      )}
                    </div>

                    {/* Event Time */}
                    <div className="space-y-1">
                      <label htmlFor="booking-eventTime" className="font-semibold text-gray-700 block">
                        Event Time
                      </label>
                      <Time12Picker
                        id="booking-eventTime"
                        value={formData.eventTime}
                        onChange={(val) => handleFieldChange("eventTime", val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Duration / Days * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-numberOfDays" className="font-semibold text-gray-700">
                        Duration / Days *
                      </label>
                      <input
                        id="booking-numberOfDays"
                        type="text"
                        placeholder="e.g. 2 Days / Half Day"
                        value={formData.numberOfDays}
                        onChange={(e) => handleFieldChange("numberOfDays", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.numberOfDays ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.numberOfDays && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.numberOfDays}</p>
                      )}
                    </div>

                    {/* Package Budget * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-budget" className="font-semibold text-gray-700">
                        Package Budget *
                      </label>
                      <input
                        id="booking-budget"
                        type="text"
                        placeholder="e.g. ₹1,50,000"
                        value={formData.budget}
                        onChange={(e) => handleFieldChange("budget", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.budget ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.budget && (
                        <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.budget}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Primary Service * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-requiredService" className="font-semibold text-gray-700">
                        Primary Service *
                      </label>
                      <select
                        id="booking-requiredService"
                        value={formData.requiredService}
                        onChange={(e) => handleFieldChange("requiredService", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.requiredService ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
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
                      <label htmlFor="booking-branch" className="font-semibold text-gray-700">
                        Studio Branch *
                      </label>
                      <select
                        id="booking-branch"
                        value={formData.branch}
                        onChange={(e) => handleFieldChange("branch", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.branch ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
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
                      <label htmlFor="booking-status" className="font-semibold text-gray-700">
                        Status *
                      </label>
                      <select
                        id="booking-status"
                        value={normalizeBookingStatus(formData.status)}
                        onChange={(e) => handleFieldChange("status", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.status ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
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
                    <label htmlFor="booking-location" className="font-semibold text-gray-700">
                      Venue Location *
                    </label>
                    <input
                      id="booking-location"
                      type="text"
                      placeholder="e.g. Le Royal Méridien, Chennai"
                      value={formData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      className={`w-full p-2.5 bg-gray-50 border ${
                        formErrors.location ? "border-rose-400" : "border-gray-200"
                      } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                    />
                    {formErrors.location && (
                      <p className="text-rose-600 text-[10px] mt-0.5">{formErrors.location}</p>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photography Details * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-photographyRequirement" className="font-semibold text-gray-700">
                        Photography Details *
                      </label>
                      <input
                        id="booking-photographyRequirement"
                        type="text"
                        placeholder="e.g. Candid + Traditional + Drone"
                        value={formData.photographyRequirement}
                        onChange={(e) => handleFieldChange("photographyRequirement", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.photographyRequirement ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
                      />
                      {formErrors.photographyRequirement && (
                        <p className="text-rose-600 text-[10px] mt-0.5">
                          {formErrors.photographyRequirement}
                        </p>
                      )}
                    </div>

                    {/* Cinematography Details * */}
                    <div className="space-y-1">
                      <label htmlFor="booking-cinematographyRequirement" className="font-semibold text-gray-700">
                        Cinematography Details *
                      </label>
                      <input
                        id="booking-cinematographyRequirement"
                        type="text"
                        placeholder="e.g. 4K Film + 60sec Teaser"
                        value={formData.cinematographyRequirement}
                        onChange={(e) => handleFieldChange("cinematographyRequirement", e.target.value)}
                        className={`w-full p-2.5 bg-gray-50 border ${
                          formErrors.cinematographyRequirement ? "border-rose-400" : "border-gray-200"
                        } rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none`}
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
                    <label htmlFor="booking-adminNotes" className="font-semibold text-gray-700">
                      Admin &amp; Operational Notes
                    </label>
                    <textarea
                      id="booking-adminNotes"
                      rows={3}
                      placeholder="Advance paid, drone permit status, special requests..."
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pinned Submit Footer */}
                <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2"
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
      </AnimatePresence>,
      document.body
    )}

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
