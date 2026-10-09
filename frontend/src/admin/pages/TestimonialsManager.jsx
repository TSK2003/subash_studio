import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";
import {
  fetchGoogleIntegrationStatus,
  getGoogleOAuthUrl,
  disconnectGoogleAccount,
  fetchGoogleReviewsFromApi,
} from "../../services/googleReviewsService";

function GoogleGIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function TestimonialsManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialApproved,
    toggleTestimonialFeatured,
    syncGoogleReviews,
    googleReviewsMeta,
  } = useAdminData();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Google status & sync states
  const [googleStatus, setGoogleStatus] = useState({
    configured: false,
    connected: false,
    status: "CHECKING",
    businessName: null,
    locationName: null,
    lastSynced: null,
    message: "Checking Google Business Profile status...",
  });
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Search and Filter tabs
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const initialForm = {
    customerName: "",
    customerRole: "",
    customerImage: "",
    rating: 5,
    eventType: "",
    review: "",
    date: "",
    approved: true,
    featured: false,
  };
  const [formData, setFormData] = useState(initialForm);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTestimonial(null);
    setFormData(initialForm);
  };

  // Check integration status
  const refreshGoogleStatus = async () => {
    const status = await fetchGoogleIntegrationStatus();
    setGoogleStatus(status);
  };

  useEffect(() => {
    refreshGoogleStatus();
  }, []);

  // Handle OAuth redirect query parameters (google_connected=1 or google_error=...)
  useEffect(() => {
    const connected = searchParams.get("google_connected");
    const error = searchParams.get("google_error");

    if (connected) {
      addToast("Google Business Profile connected successfully!", "success");
      searchParams.delete("google_connected");
      setSearchParams(searchParams, { replace: true });
      refreshGoogleStatus();
    } else if (error) {
      addToast(`Google connection failed: ${error}`, "error");
      searchParams.delete("google_error");
      setSearchParams(searchParams, { replace: true });
      refreshGoogleStatus();
    }
  }, [searchParams, setSearchParams, addToast]);

  const handleOpenAdd = () => {
    setEditingTestimonial(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const isNewParam = searchParams.get("new") === "true";
  useEffect(() => {
    if (isNewParam) {
      handleOpenAdd();
    }
  }, [isNewParam]);

  const handleOpenEdit = (tst) => {
    setEditingTestimonial(tst);
    setFormData({
      customerName: tst.customerName || "",
      customerRole: tst.customerRole || "",
      customerImage: tst.customerImage || "",
      rating: tst.rating || 5,
      eventType: tst.eventType || "",
      review: tst.review || "",
      date: tst.date || "",
      approved: tst.approved ?? true,
      featured: tst.featured ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.review.trim()) {
      addToast("Customer name and review content are required.", "warning");
      return;
    }

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, formData);
      addToast("Client testimonial updated.", "success");
    } else {
      addTestimonial(formData);
      addToast("New testimonial added successfully.", "success");
    }

    handleCloseModal();
  };

  const handleDeletePrompt = (tst) => {
    setItemToDelete(tst);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteTestimonial(itemToDelete.id);
      addToast(`Testimonial from "${itemToDelete.customerName}" deleted.`, "info");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Google OAuth Connection
  const handleConnectGoogle = async () => {
    setConnecting(true);
    try {
      const url = await getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      addToast(err.message || "Failed to initiate Google connection.", "error");
      setConnecting(false);
    }
  };

  // Disconnect Google Account
  const handleDisconnectGoogle = async () => {
    try {
      await disconnectGoogleAccount();
      addToast("Google Business Profile disconnected.", "info");
      await refreshGoogleStatus();
    } catch (err) {
      addToast(err.message || "Failed to disconnect Google account.", "error");
    }
  };

  // Sync Google Reviews
  const handleSyncReviews = async () => {
    setSyncing(true);
    try {
      const result = await fetchGoogleReviewsFromApi();
      if (result.status === "NOT_CONFIGURED" || result.status === "NOT_CONNECTED") {
        addToast(result.message, "warning");
        await refreshGoogleStatus();
        return;
      }

      const summary = syncGoogleReviews(result.reviews || []);
      addToast(
        `Google Reviews Synced: ${summary.checked} checked (${summary.added} new, ${summary.updated} updated, ${summary.unchanged} unchanged).`,
        "success"
      );
      await refreshGoogleStatus();
    } catch (err) {
      addToast(err.message || "Error syncing Google reviews.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Filter Counts
  const counts = useMemo(() => {
    return {
      all: testimonials.length,
      manual: testimonials.filter((t) => t.source !== "google").length,
      google: testimonials.filter((t) => t.source === "google").length,
      pending: testimonials.filter((t) => !t.approved && !t.hidden).length,
      approved: testimonials.filter((t) => t.approved && !t.hidden).length,
      featured: testimonials.filter((t) => t.featured).length,
    };
  }, [testimonials]);

  // Filtered & Searched testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((tst) => {
      // Tab filter
      if (activeFilter === "MANUAL" && tst.source === "google") return false;
      if (activeFilter === "GOOGLE" && tst.source !== "google") return false;
      if (activeFilter === "PENDING" && (tst.approved || tst.hidden)) return false;
      if (activeFilter === "APPROVED" && (!tst.approved || tst.hidden)) return false;
      if (activeFilter === "FEATURED" && !tst.featured) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (tst.customerName || tst.googleReviewerName || "").toLowerCase();
        const review = (tst.review || "").toLowerCase();
        const eventType = (tst.eventType || "").toLowerCase();
        if (!name.includes(query) && !review.includes(query) && !eventType.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [testimonials, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5EAF1] text-[#334155] flex items-center justify-center border border-[#CAD3DF] shadow-xs">
            <Star className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Client Reviews &amp; Testimonials
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage feedback from manual studio clients and Google Business Profile reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Sync Button */}
          <button
            type="button"
            onClick={handleSyncReviews}
            disabled={syncing || !googleStatus.connected}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium shadow-xs transition-colors shrink-0 ${
              googleStatus.connected
                ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-75"
            }`}
            title={
              !googleStatus.configured
                ? "Configure Google API credentials to enable sync"
                : !googleStatus.connected
                ? "Connect Google Business Profile to enable sync"
                : "Sync latest Google reviews"
            }
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Google Reviews"}</span>
          </button>

          {/* Add Manual Review */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "ALL", label: "All", count: counts.all },
            { id: "MANUAL", label: "Manual", count: counts.manual },
            { id: "GOOGLE", label: "Google Reviews", count: counts.google },
            { id: "PENDING", label: "Pending", count: counts.pending },
            { id: "APPROVED", label: "Approved", count: counts.approved },
            { id: "FEATURED", label: "Featured", count: counts.featured },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-black text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-gray-800 text-gray-200" : "bg-gray-200/70 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or review..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <EmptyState
          icon={Star}
          title={searchQuery ? "No matching testimonials found" : "No testimonials in this view"}
          description={
            searchQuery
              ? `No testimonials matched "${searchQuery}". Try a different keyword.`
              : activeFilter === "GOOGLE"
              ? "No Google reviews synced yet. Click 'Sync Google Reviews' to import latest reviews."
              : "Add client testimonials and reviews."
          }
          actionLabel={activeFilter === "GOOGLE" ? "Sync Reviews" : "Add Testimonial"}
          onAction={activeFilter === "GOOGLE" ? handleSyncReviews : handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((tst) => {
            const isGoogle = tst.source === "google";

            return (
              <div
                key={tst.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between space-y-3.5 relative"
              >
                <div className="space-y-3">
                  {/* Card Header: Rating, Source Badge & Moderation Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < (tst.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Source Badge */}
                      {isGoogle ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <GoogleGIcon className="w-2.5 h-2.5" />
                          GOOGLE REVIEW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          MANUAL
                        </span>
                      )}

                      {/* Featured Badge */}
                      {tst.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Featured
                        </span>
                      )}

                      {/* Approval Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          tst.approved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tst.hidden
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {tst.approved ? "Approved" : tst.hidden ? "Hidden" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-gray-700 leading-relaxed italic line-clamp-4">
                    &ldquo;{tst.review}&rdquo;
                  </p>

                  {/* Optional Google Studio Reply */}
                  {tst.googleReply && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                      <span className="font-semibold text-gray-900 block mb-0.5">
                        Studio Reply:
                      </span>
                      &ldquo;{tst.googleReply}&rdquo;
                    </div>
                  )}
                </div>

                {/* Client Info & Card Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center font-semibold text-gray-600 text-xs shrink-0">
                      {tst.customerImage || tst.googleReviewerPhoto ? (
                        <img
                          src={tst.customerImage || tst.googleReviewerPhoto}
                          alt={tst.customerName || tst.googleReviewerName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        (tst.customerName || tst.googleReviewerName || "C").charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">
                        {tst.customerName || tst.googleReviewerName}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate">
                        {tst.eventType || tst.category || "Client"} • {tst.date}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* View on Google link */}
                    {tst.googleReviewUrl && (
                      <a
                        href={tst.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View review on Google"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Feature / Unfeature Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleTestimonialFeatured(tst.id);
                        addToast(
                          `Review is ${!tst.featured ? "marked as Featured" : "unfeatured"}.`,
                          "info"
                        );
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        tst.featured
                          ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                          : "text-gray-400 hover:text-amber-500 hover:bg-gray-50"
                      }`}
                      title={tst.featured ? "Remove from Homepage Featured" : "Feature on Homepage"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          tst.featured ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>

                    {/* Approve / Hide Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleTestimonialApproved(tst.id);
                        addToast(
                          `Review is now ${!tst.approved ? "Approved" : "Hidden"}.`,
                          "info"
                        );
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        tst.approved
                          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      title={tst.approved ? "Hide from website" : "Approve for website"}
                    >
                      {tst.approved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit Button (for manual testimonials) */}
                    {!isGoogle && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tst)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit Review"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(tst)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add / Edit Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {modalOpen && (
              <div
                className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden admin-portal"
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
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 z-10 max-h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-64px)] my-auto flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Fixed Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {editingTestimonial ? "Edit Review" : "New Client Testimonial"}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingTestimonial
                          ? `Update ${editingTestimonial.customerName}'s Review`
                          : "Add Client Feedback"}
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
                      <ImageUploader
                        value={formData.customerImage}
                        onChange={(url) => setFormData({ ...formData, customerImage: url })}
                        label="Customer Photo / Portrait (Optional)"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Customer Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Arvind & Kavitha"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Shoot / Event Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Wedding & Reception"
                            value={formData.eventType}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Star Rating (1 to 5)</label>
                          <div className="flex items-center gap-1.5 pt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= formData.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Date / Period</label>
                          <input
                            type="text"
                            placeholder="e.g. August 2026"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Client Review Text *</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Write the full feedback or quote from the couple/family..."
                          value={formData.review}
                          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                          className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.approved}
                            onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 accent-black"
                          />
                          <span>Approved for Website</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 accent-black"
                          />
                          <span>Feature on Homepage</span>
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
                        {editingTestimonial ? "Save Changes" : "Add Review"}
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
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${itemToDelete?.customerName || itemToDelete?.googleReviewerName}"?`}
        confirmText="Delete Review"
        isDestructive={true}
      />
    </div>
  );
}
