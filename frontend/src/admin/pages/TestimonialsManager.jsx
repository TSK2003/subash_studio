import { useState, useEffect, useMemo } from "react";
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
  HelpCircle,
  Unlink,
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
  const [setupModalOpen, setSetupModalOpen] = useState(false);

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
    customerRole: "Wedding Clients",
    customerImage: "",
    rating: 5,
    eventType: "Wedding & Reception",
    review: "",
    date: "August 2026",
    approved: true,
    featured: true,
  };
  const [formData, setFormData] = useState(initialForm);

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
      customerRole: tst.customerRole || "Wedding Clients",
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

    setModalOpen(false);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
            Client Reviews &amp; Testimonials
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Manage feedback from manual studio clients and Google Business Profile reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Sync Button */}
          <button
            type="button"
            onClick={handleSyncReviews}
            disabled={syncing || !googleStatus.connected}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 ${
              googleStatus.connected
                ? "bg-[#C9A669] text-white hover:bg-[#9C7B3D]"
                : "bg-[#E7E0D2] text-[#8E867B] cursor-not-allowed opacity-70"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E4D3A6]" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Google Business Profile Integration Banner */}
      <div className="bg-white rounded-xl border border-[#E7E0D2] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Status Details */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] flex items-center justify-center shrink-0 shadow-inner">
              <GoogleGIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display font-bold text-sm text-[#2B2B2B]">
                  Google Business Profile Reviews
                </h3>

                {/* Status Indicator */}
                {googleStatus.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : googleStatus.configured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Not Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    Not Configured
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6F6A62] leading-relaxed max-w-2xl">
                {googleStatus.connected ? (
                  <>
                    Connected to{" "}
                    <strong className="text-[#2B2B2B]">
                      {googleStatus.businessName || "Subash Studio"}
                    </strong>{" "}
                    ({googleStatus.locationName || "Authorized Location"}). Last synced:{" "}
                    <span className="text-[#9C7B3D] font-medium">
                      {googleReviewsMeta?.lastSynced
                        ? new Date(googleReviewsMeta.lastSynced).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </span>
                    .
                  </>
                ) : googleStatus.configured ? (
                  "OAuth credentials are ready. Connect your Google account to authorize the Google Business Profile Reviews API."
                ) : (
                  "Google Business Profile API is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable OAuth reviews sync."
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            {googleStatus.connected ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncReviews}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  <span>{syncing ? "Syncing..." : "Sync Now"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E7E0D2] text-[#6F6A62] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl text-xs font-semibold transition-all"
                  title="Disconnect Google Business Profile"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : googleStatus.configured ? (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <GoogleGIcon className="w-4 h-4" />
                <span>{connecting ? "Redirecting..." : "Connect Google Business Profile"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSetupModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8F6F2] hover:bg-[#EFECE6] border border-[#E7E0D2] text-[#2B2B2B] rounded-xl text-xs font-semibold transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C9A669]" />
                <span>Setup Guide</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E7E0D2] pb-4">
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
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#2B2B2B] text-[#F8F6F2] shadow-sm"
                    : "bg-[#F8F6F2] text-[#6F6A62] hover:bg-[#EFECE6] hover:text-[#2B2B2B]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#E7E0D2] text-[#6F6A62]"
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
          <Search className="w-3.5 h-3.5 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or review..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
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
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 relative ${
                  isGoogle
                    ? "border-[#E7E0D2] hover:border-[#4285F4]/50"
                    : "border-[#E7E0D2] hover:border-[#C9A669]/60"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Rating, Source Badge & Moderation Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-[#9C7B3D]">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < (tst.rating || 5)
                              ? "fill-[#9C7B3D] text-[#9C7B3D]"
                              : "text-[#E7E0D2]"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Source Badge */}
                      {isGoogle ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4285F4]/10 text-[#1A73E8] border border-[#4285F4]/20">
                          <GoogleGIcon className="w-2.5 h-2.5" />
                          GOOGLE REVIEW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EFE6] text-[#6F6A62] border border-[#E7E0D2]">
                          MANUAL
                        </span>
                      )}

                      {/* Featured Badge */}
                      {tst.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EFE6] text-[#9C7B3D] border border-[#E4D3A6]">
                          Featured
                        </span>
                      )}

                      {/* Approval Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tst.approved
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : tst.hidden
                            ? "bg-stone-100 text-stone-600 border-stone-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {tst.approved ? "Approved" : tst.hidden ? "Hidden" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-[#2B2B2B] leading-relaxed italic line-clamp-4">
                    &ldquo;{tst.review}&rdquo;
                  </p>

                  {/* Optional Google Studio Reply */}
                  {tst.googleReply && (
                    <div className="p-2.5 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] text-[11px] text-[#6F6A62]">
                      <span className="font-semibold text-[#2B2B2B] block mb-0.5">
                        Studio Reply:
                      </span>
                      &ldquo;{tst.googleReply}&rdquo;
                    </div>
                  )}
                </div>

                {/* Client Info & Card Actions */}
                <div className="pt-3 border-t border-[#F8F6F2] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#F4EFE6] border border-[#E7E0D2] overflow-hidden flex items-center justify-center font-bold text-[#9C7B3D] text-xs shrink-0">
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
                      <h4 className="font-bold text-xs text-[#2B2B2B] truncate">
                        {tst.customerName || tst.googleReviewerName}
                      </h4>
                      <p className="text-[10px] text-[#8E867B] truncate">
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
                        className="p-1.5 text-[#6F6A62] hover:text-[#1A73E8] rounded-lg hover:bg-[#F8F6F2] transition-colors"
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
                          ? "text-[#9C7B3D] bg-[#F4EFE6] hover:bg-[#E4D3A6]"
                          : "text-[#6F6A62] hover:text-[#9C7B3D] hover:bg-[#F8F6F2]"
                      }`}
                      title={tst.featured ? "Remove from Homepage Featured" : "Feature on Homepage"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          tst.featured ? "fill-[#9C7B3D] text-[#9C7B3D]" : ""
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
                          ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2]"
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
                        className="p-1.5 text-[#6F6A62] hover:text-[#2B2B2B] rounded-lg hover:bg-[#F8F6F2] transition-colors"
                        title="Edit Review"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(tst)}
                      className="p-1.5 text-[#6F6A62] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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

      {/* Setup Guide Modal */}
      <AnimatePresence>
        {setupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSetupModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] flex items-center justify-center shrink-0">
                    <GoogleGIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                      Google Business Profile Setup
                    </h3>
                    <p className="text-[11px] text-[#6F6A62]">
                      Instructions to connect your official Google Business Profile reviews.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs text-[#2B2B2B] modal-scrollbar">
                <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E7E0D2] space-y-3">
                  <p className="font-semibold text-[#9C7B3D]">1. Required Environment Variables</p>
                  <p className="text-[#6F6A62]">
                    Add the following credentials to your server environment file (e.g.{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-[#E7E0D2]">.env</code>{" "}
                    or deployment dashboard):
                  </p>
                  <pre className="bg-[#1C1B19] text-[#E4D3A6] p-3 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
{`GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google/callback`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-[#2B2B2B]">2. Google Cloud Console Configuration</p>
                  <ul className="list-disc pl-5 space-y-1 text-[#6F6A62]">
                    <li>Enable <strong>My Business Account Management API</strong> & <strong>My Business Business Information API</strong>.</li>
                    <li>Configure your OAuth Consent Screen with scope: <code className="bg-[#F8F6F2] px-1 py-0.5 rounded">https://www.googleapis.com/auth/business.manage</code>.</li>
                    <li>Create an OAuth 2.0 Web Application Client ID.</li>
                    <li>Add your authorized redirect URI: <code className="bg-[#F8F6F2] px-1 py-0.5 rounded">/api/auth/google/callback</code>.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-[#2B2B2B]">3. Connect &amp; Moderate</p>
                  <p className="text-[#6F6A62] leading-relaxed">
                    Once environment variables are supplied, reload the page and click <strong>&ldquo;Connect Google Business Profile&rdquo;</strong>.
                    Imported reviews default to <em>Pending</em> so the studio director can approve or feature them before they appear on the homepage carousel.
                  </p>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(false)}
                  className="px-5 py-2.5 bg-[#2B2B2B] text-white hover:bg-[#1C1B19] rounded-xl font-semibold transition-colors"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E7E0D2] z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0EBE1] shrink-0 bg-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                    {editingTestimonial ? "Edit Review" : "New Client Testimonial"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                    {editingTestimonial
                      ? `Update ${editingTestimonial.customerName}'s Review`
                      : "Add Client Feedback"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-[#6F6A62] hover:text-[#2B2B2B] rounded-xl hover:bg-[#F8F6F2] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with scrollable body & pinned footer */}
              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-4 text-xs modal-scrollbar">
                  <ImageUploader
                    value={formData.customerImage}
                    onChange={(url) => setFormData({ ...formData, customerImage: url })}
                    label="Customer Photo / Portrait (Optional)"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Arvind & Kavitha"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Shoot / Event Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Wedding & Reception"
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Star Rating (1 to 5)</label>
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-1 text-[#9C7B3D] hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= formData.rating
                                  ? "fill-[#9C7B3D] text-[#9C7B3D]"
                                  : "text-[#E7E0D2]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6F6A62]">Date / Period</label>
                      <input
                        type="text"
                        placeholder="e.g. August 2026"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Client Review Text *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write the full feedback or quote from the couple/family..."
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#2B2B2B]">
                      <input
                        type="checkbox"
                        checked={formData.approved}
                        onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E7E0D2] text-[#9C7B3D] focus:ring-[#C9A669]"
                      />
                      <span>Approved for Website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#2B2B2B]">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-[#E7E0D2] text-[#9C7B3D] focus:ring-[#C9A669]"
                      />
                      <span>Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="px-6 sm:px-8 py-4 bg-[#FCFAF7] border-t border-[#E7E0D2] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-[#6F6A62] hover:bg-[#F8F6F2] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingTestimonial ? "Save Review" : "Add Review"}
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
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${itemToDelete?.customerName || itemToDelete?.googleReviewerName}"?`}
        confirmText="Delete Review"
        isDestructive={true}
      />
    </div>
  );
}
