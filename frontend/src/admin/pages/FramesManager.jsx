import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Frame,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit2,
  Clock,
  Package,
  TrendingUp,
  Layers,
  Sparkles,
  X,
  FileText,
  Download,
  ImageDown,
  Loader2,
  Check,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";
import { formatRupee, parsePrice } from "../../lib/framePricing";
import FrameImageUploader from "../components/FrameImageUploader";
import FramePrintReceipt from "../../components/FramePrintReceipt";
import FrameOrderPreview, {
  exportFrameImage,
  downloadOriginalFrameOrderImage,
} from "../components/FrameOrderPreview";

const STATUS_OPTIONS = [
  "All",
  "New",
  "Confirmed",
  "In Production",
  "Ready",
  "Delivered",
  "Cancelled",
];

export default function FramesManager() {
  const {
    frameOrders,
    updateFrameOrderStatus,
    deleteFrameOrder,
    frameWoodTypes,
    addFrameWoodType,
    updateFrameWoodType,
    deleteFrameWoodType,
    toggleFrameWoodTypeStatus,
    frameDesigns,
    addFrameDesign,
    updateFrameDesign,
    deleteFrameDesign,
    toggleFrameDesignStatus,
    frameRatios,
    addFrameRatio,
    updateFrameRatio,
    deleteFrameRatio,
    toggleFrameRatioStatus,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("orders"); // "orders", "woods", "designs", "ratios"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Drawer / Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [woodModal, setWoodModal] = useState({ open: false, mode: "add", data: null });
  const [designModal, setDesignModal] = useState({ open: false, mode: "add", data: null });
  const [ratioModal, setRatioModal] = useState({ open: false, mode: "add", data: null });

  // Download state & handler
  const { addToast } = useToast();
  const [downloadStatus, setDownloadStatus] = useState("idle"); // "idle" | "loading" | "success"
  const [downloadOriginalStatus, setDownloadOriginalStatus] = useState("idle"); // "idle" | "loading" | "success"

  const handleDownloadFrame = async () => {
    if (!selectedOrder || downloadStatus === "loading") return;
    try {
      setDownloadStatus("loading");
      const filename = await exportFrameImage(
        selectedOrder,
        frameWoodTypes,
        frameDesigns
      );
      setDownloadStatus("success");
      addToast(`Frame downloaded: ${filename}`, "success", 3000);
      setTimeout(() => {
        setDownloadStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Frame export error:", err);
      setDownloadStatus("idle");
      addToast("Unable to generate frame image. Please try again.", "error", 4000);
    }
  };

  const handleDownloadOriginal = async () => {
    if (!selectedOrder || downloadOriginalStatus === "loading") return;
    try {
      setDownloadOriginalStatus("loading");
      const filename = await downloadOriginalFrameOrderImage(selectedOrder);
      setDownloadOriginalStatus("success");
      addToast(`Original photo downloaded: ${filename}`, "success", 3000);
      setTimeout(() => {
        setDownloadOriginalStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Original photo download error:", err);
      setDownloadOriginalStatus("idle");
      addToast("Unable to download the original image. Please try again.", "error", 4000);
    }
  };

  // Metrics
  const totalOrders = (frameOrders || []).length;
  const newOrdersCount = (frameOrders || []).filter((o) => o.status === "New").length;
  const inProductionCount = (frameOrders || []).filter(
    (o) => o.status === "In Production" || o.status === "Processing" || o.status === "Confirmed"
  ).length;
  const totalRevenue = (frameOrders || []).reduce(
    (acc, cur) => acc + (parsePrice(cur.totalAmount) || 0),
    0
  );

  // Filtered orders
  const filteredOrders = (frameOrders || []).filter((order) => {
    const matchesSearch =
      (order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone || "").includes(searchQuery) ||
      (order.woodType || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 text-[#2B2B2B] shadow-sm border border-[#E7E0D2] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#C9A669] before:via-[#DFCA9F] before:to-[#9C7B3D]">
        {/* Subtle decorative warm background aura */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 bg-[#FBF7F0] rounded-full blur-2xl opacity-70" />

        <div className="space-y-1.5 relative z-10 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#1C1B19] tracking-tight">
            Custom Frame{" "}
            <span className="bg-gradient-to-r from-[#8C6D32] to-[#C9A669] bg-clip-text text-transparent">
              Management
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6A62] max-w-xl leading-relaxed">
            Manage incoming handcrafted frame orders, configure timber woods, manage profiles &amp; finishes, and adjust pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("designs");
              setDesignModal({ open: true, mode: "add", data: null });
            }}
            className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-[#2B2B2B] border border-[#E7E0D2] rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-sm group active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A669] group-hover:scale-110 transition-transform" />
            <span>Add Profile Design</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("woods");
              setWoodModal({ open: true, mode: "add", data: null });
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#C9A669] to-[#9C7B3D] hover:from-[#D4B376] hover:to-[#A88544] text-[#1C1B19] rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Wood Type</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={Frame}
          description="All framing requests"
          accent="neutral"
        />
        <StatCard
          title="New Orders"
          value={newOrdersCount}
          icon={Clock}
          trend={`${newOrdersCount} awaiting review`}
          accent="gold"
        />
        <StatCard
          title="In Production"
          value={inProductionCount}
          icon={Package}
          description="Atelier workshop queue"
          accent="neutral"
        />
        <StatCard
          title="Total Frame Revenue"
          value={formatRupee(totalRevenue)}
          icon={TrendingUp}
          description="Estimated gross volume"
          accent="gold"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E7E0D2] gap-2 overflow-x-auto min-w-0 pb-1">
        {[
          { id: "orders", label: `Frame Orders (${totalOrders})`, icon: Frame },
          { id: "woods", label: `Wood Types (${(frameWoodTypes || []).length})`, icon: Layers },
          { id: "designs", label: `Frame Designs (${(frameDesigns || []).length})`, icon: Sparkles },
          { id: "ratios", label: `Sizes & Ratios (${(frameRatios || []).length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#1C1B19] text-[#F8F6F2] shadow"
                  : "text-[#6F6A62] hover:text-[#1C1B19] hover:bg-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#C9A669]" : "text-[#8C6D32]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FRAME ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4 min-w-0">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 min-w-0">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8C6D32] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, customer, wood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E7E0D2] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto min-w-0">
              <span className="text-xs text-[#6F6A62] font-semibold shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E7E0D2] rounded-xl text-xs font-semibold text-[#1C1B19] focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container with Contained Scroll */}
          <div className="bg-white rounded-xl border border-[#E7E0D2] shadow-sm overflow-hidden min-w-0 w-full">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E7E0D2] bg-[#FAF8F5] text-[#6F6A62] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Wood &amp; Profile</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D2]/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-sm text-[#8E867B]">
                        No frame orders found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1C1B19]">
                          {order.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1C1B19]">{order.customerName}</div>
                          <div className="text-[11px] text-[#6F6A62]">{order.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1C1B19]">{order.woodType}</div>
                          <div className="text-[11px] text-[#8C6D32]">{order.frameDesign}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#2B2B2B] font-medium">
                          {order.frameRatio}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#8C6D32]">
                          {formatRupee(order.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "New"
                                ? "bg-amber-100 text-amber-800"
                                : order.status === "Confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "In Production" || order.status === "Processing"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "Ready"
                                ? "bg-teal-100 text-teal-800"
                                : order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-[#F8F6F2] text-[#1C1B19] transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete order ${order.id}?`)) {
                                  deleteFrameOrder(order.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WOOD TYPES */}
      {activeTab === "woods" && (
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#1C1B19]">
              Configured Timber Species
            </h3>
            <button
              type="button"
              onClick={() => setWoodModal({ open: true, mode: "add", data: null })}
              className="px-4 py-2 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-bold hover:bg-[#322F2A] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A669]" />
              <span>Add Wood</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(frameWoodTypes || []).map((wood) => (
              <div
                key={wood.id}
                className="bg-white rounded-xl p-4 border border-[#E7E0D2] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-[#ECE7DC] border border-[#E7E0D2]">
                    <img src={wood.image} alt={wood.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          wood.active !== false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {wood.active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-base text-[#1C1B19]">{wood.name}</h4>
                      <span className="font-bold text-sm text-[#8C6D32]">
                        {formatRupee(wood.basePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6A62] mt-1 line-clamp-2">{wood.description}</p>
                    <div className="text-[11px] text-[#8C6D32] mt-2 font-medium">
                      Grain: {wood.grain || "Natural"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E0D2] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFrameWoodTypeStatus(wood.id)}
                    className="text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19]"
                  >
                    {wood.active !== false ? "Set Inactive" : "Set Active"}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWoodModal({ open: true, mode: "edit", data: wood })}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-[#F8F6F2] text-[#1C1B19]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete wood ${wood.name}?`)) deleteFrameWoodType(wood.id);
                      }}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FRAME DESIGNS */}
      {activeTab === "designs" && (
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#1C1B19]">
              Profiles &amp; Artisan Finishes
            </h3>
            <button
              type="button"
              onClick={() => setDesignModal({ open: true, mode: "add", data: null })}
              className="px-4 py-2 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-bold hover:bg-[#322F2A] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A669]" />
              <span>Add Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(frameDesigns || []).map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-xl p-4 border border-[#E7E0D2] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative h-36 rounded-xl overflow-hidden bg-[#ECE7DC] border border-[#E7E0D2]">
                    <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          design.active !== false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {design.active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-base text-[#1C1B19]">{design.name}</h4>
                      <span className="font-bold text-xs text-[#8C6D32]">
                        {design.additionalPrice > 0 ? `+${formatRupee(design.additionalPrice)}` : "₹0"}
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6A62] mt-1 line-clamp-2">{design.description}</p>
                    <div className="text-[10px] text-[#8C6D32] mt-2 font-medium truncate">
                      Compatible: {(design.compatibleWoods || ["All"]).join(", ")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E0D2] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFrameDesignStatus(design.id)}
                    className="text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19]"
                  >
                    {design.active !== false ? "Set Inactive" : "Set Active"}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDesignModal({ open: true, mode: "edit", data: design })}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-[#F8F6F2] text-[#1C1B19]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete design ${design.name}?`)) deleteFrameDesign(design.id);
                      }}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FRAME RATIOS */}
      {activeTab === "ratios" && (
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#1C1B19]">
              Standard Dimensions &amp; Ratio Surcharges
            </h3>
            <button
              type="button"
              onClick={() => setRatioModal({ open: true, mode: "add", data: null })}
              className="px-4 py-2 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-bold hover:bg-[#322F2A] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A669]" />
              <span>Add Size</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(frameRatios || []).map((ratio) => (
              <div
                key={ratio.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-[#E7E0D2] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-lg text-[#1C1B19]">{ratio.name}</h4>
                      {ratio.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A669]/20 text-[#8C6D32] text-[10px] font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-base text-[#8C6D32]">
                      {formatRupee(ratio.price)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6F6A62]">{ratio.label || ratio.dimensions}</p>
                </div>

                <div className="pt-3 border-t border-[#E7E0D2] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFrameRatioStatus(ratio.id)}
                    className="text-xs font-semibold text-[#6F6A62] hover:text-[#1C1B19]"
                  >
                    {ratio.active !== false ? "Set Inactive" : "Set Active"}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRatioModal({ open: true, mode: "edit", data: ratio })}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-[#F8F6F2] text-[#1C1B19]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete ratio ${ratio.name}?`)) deleteFrameRatio(ratio.id);
                      }}
                      className="p-1.5 rounded-lg border border-[#E7E0D2] hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL / DRAWER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-xl p-5 sm:p-6 max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto modal-scrollbar space-y-5 shadow-2xl border border-[#E7E0D2]"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D32]">
                    Order Details &amp; Specifications
                  </span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#1C1B19]">
                      {selectedOrder.id}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                        selectedOrder.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : selectedOrder.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : selectedOrder.status === "Ready"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : selectedOrder.status === "In Production"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-[#F4EFE6] text-[#8C6D32] border border-[#DCD3C0]"
                      }`}
                    >
                      {selectedOrder.status || "New"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-[#F8F6F2] text-[#6F6A62] hover:text-[#1C1B19] transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-Column Responsive Layout (Stacked on mobile/tablet, 2-column on desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* LEFT: FRAME PREVIEW (lg:col-span-5) */}
                <div className="lg:col-span-5 w-full flex flex-col items-center">
                  <FrameOrderPreview
                    order={selectedOrder}
                    woodTypes={frameWoodTypes}
                    designs={frameDesigns}
                    className="w-full"
                  />
                </div>

                {/* RIGHT: ORDER INFORMATION & ACTIONS (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                  {/* Status Actions Control */}
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E0D2] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1C1B19] uppercase tracking-wider">
                        Update Order Status
                      </span>
                      <span className="text-xs text-[#6F6A62]">
                        {selectedOrder.createdAt
                          ? new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: "Confirm", value: "Confirmed" },
                        { label: "Processing", value: "In Production" },
                        { label: "Ready", value: "Ready" },
                        { label: "Delivered", value: "Delivered" },
                        { label: "Cancel", value: "Cancelled" },
                      ].map(({ label, value }) => {
                        const isCurrent = selectedOrder.status === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              updateFrameOrderStatus(selectedOrder.id, value);
                              setSelectedOrder((prev) => ({ ...prev, status: value }));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isCurrent
                                ? "bg-[#1C1B19] text-[#F8F6F2] border-[#1C1B19] shadow-sm"
                                : "bg-white text-[#2B2B2B] border-[#E7E0D2] hover:bg-[#F8F6F2]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D2] space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C6D32]">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#6F6A62]">Full Name:</span>
                        <div className="font-semibold text-sm text-[#1C1B19] mt-0.5">
                          {selectedOrder.customerName}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#6F6A62]">Phone:</span>
                        <div className="font-semibold font-mono text-[#1C1B19] mt-0.5">
                          {selectedOrder.phone}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#6F6A62]">WhatsApp:</span>
                        <div className="font-semibold font-mono text-[#1C1B19] mt-0.5">
                          {selectedOrder.whatsapp || selectedOrder.phone}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#6F6A62]">Email:</span>
                        <div className="font-semibold text-[#1C1B19] mt-0.5 truncate">
                          {selectedOrder.email || "N/A"}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#6F6A62]">Fulfillment:</span>
                        <div className="font-semibold text-[#1C1B19] mt-0.5">
                          {selectedOrder.deliveryType || "Home Delivery"}
                        </div>
                      </div>
                      {selectedOrder.address && (
                        <div className="sm:col-span-2">
                          <span className="text-[#6F6A62]">Delivery Address:</span>
                          <div className="text-[#2B2B2B] mt-0.5 leading-relaxed bg-white p-2.5 rounded-xl border border-[#E7E0D2]/70">
                            {selectedOrder.address}
                          </div>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-[#6F6A62]">Customer Notes:</span>
                          <div className="text-[#2B2B2B] italic mt-0.5 bg-white p-2.5 rounded-xl border border-[#E7E0D2]/70">
                            {selectedOrder.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frame Specification & Pricing Breakdown */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D2] space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C6D32]">
                      Frame Specification &amp; Pricing
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62]">Wood Timber ({selectedOrder.woodType})</span>
                        <span className="font-semibold font-mono text-[#1C1B19]">
                          {formatRupee(selectedOrder.woodPrice ?? 800)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62]">Frame Design ({selectedOrder.frameDesign})</span>
                        <span className="font-semibold font-mono text-[#1C1B19]">
                          {formatRupee(selectedOrder.designPrice ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62]">Frame Ratio / Size ({selectedOrder.frameRatio})</span>
                        <span className="font-semibold font-mono text-[#1C1B19]">
                          {formatRupee(selectedOrder.ratioPrice ?? 1200)}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between items-center font-bold text-sm text-[#1C1B19]">
                        <span className="uppercase tracking-wider">Total Amount:</span>
                        <span className="text-base text-[#8C6D32] font-mono">
                          {formatRupee(selectedOrder.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="pt-3 border-t border-[#E7E0D2] space-y-3">
                    {/* Download Actions: Composed Frame vs Original Customer Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadFrame}
                        disabled={downloadStatus === "loading"}
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#1C1B19] border border-[#DCD3C0] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Download complete framed artwork image (composed with timber, design profile, and matboard)"
                      >
                        {downloadStatus === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 text-[#8C6D32] animate-spin" />
                            <span>Preparing frame...</span>
                          </>
                        ) : downloadStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Downloaded</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-[#8C6D32]" />
                            <span>Download Frame</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadOriginal}
                        disabled={downloadOriginalStatus === "loading"}
                        className="w-full px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#1C1B19] border border-[#DCD3C0] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Download customer's original uploaded photograph (unframed for physical production)"
                      >
                        {downloadOriginalStatus === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 text-[#8C6D32] animate-spin" />
                            <span>Preparing image...</span>
                          </>
                        ) : downloadOriginalStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Downloaded</span>
                          </>
                        ) : (
                          <>
                            <ImageDown className="w-4 h-4 text-[#8C6D32]" />
                            <span>Download Original Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Document Actions: Print Receipt & Close */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 sm:px-5 py-2.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#1C1B19] border border-[#DCD3C0] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 active:scale-95"
                      >
                        <FileText className="w-4 h-4 text-[#8C6D32]" />
                        <span>Print Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(null);
                          setDownloadStatus("idle");
                          setDownloadOriginalStatus("idle");
                        }}
                        className="px-6 py-2.5 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-[#322F2A] transition-colors active:scale-95 text-center"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WOOD MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {woodModal.open && (
          <WoodTypeModal
            isOpen={woodModal.open}
            mode={woodModal.mode}
            initialData={woodModal.data}
            onClose={() => setWoodModal({ open: false, mode: "add", data: null })}
            onSave={(payload) => {
              if (woodModal.mode === "add") {
                addFrameWoodType(payload);
              } else {
                updateFrameWoodType(woodModal.data.id, payload);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* DESIGN MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {designModal.open && (
          <FrameDesignModal
            isOpen={designModal.open}
            mode={designModal.mode}
            initialData={designModal.data}
            onClose={() => setDesignModal({ open: false, mode: "add", data: null })}
            onSave={(payload) => {
              if (designModal.mode === "add") {
                addFrameDesign(payload);
              } else {
                updateFrameDesign(designModal.data.id, payload);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* RATIO MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {ratioModal.open && (
          <RatioModal
            isOpen={ratioModal.open}
            mode={ratioModal.mode}
            initialData={ratioModal.data}
            onClose={() => setRatioModal({ open: false, mode: "add", data: null })}
            onSave={(payload) => {
              if (ratioModal.mode === "add") {
                addFrameRatio(payload);
              } else {
                updateFrameRatio(ratioModal.data.id, payload);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Standalone print receipt for admin order details */}
      <FramePrintReceipt order={selectedOrder} />
    </div>
  );
}

/* ==========================================================
   SUB-COMPONENTS: MODAL FORMS WITH LUXURY IMAGE UPLOAD
========================================================== */

function WoodTypeModal({ isOpen, mode, initialData, onClose, onSave }) {
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setImage(initialData?.image || (mode === "add" ? "" : "/images/frames/teak-wood.jpg"));
      setImageError("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const finalImage = image || "/images/frames/teak-wood.jpg";
    const payload = {
      name: form.name.value.trim(),
      basePrice: parseFloat(form.basePrice.value) || 0,
      grain: form.grain.value.trim(),
      description: form.description.value.trim(),
      image: finalImage,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E7E0D2]"
      >
        <div className="flex items-center justify-between border-b border-[#E7E0D2] px-5 py-4 shrink-0 bg-white">
          <h3 className="font-display font-bold text-lg text-[#1C1B19]">
            {mode === "add" ? "Add New Wood Timber" : "Edit Wood Timber"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6A62] hover:bg-[#F8F6F2] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-5 space-y-3.5 text-xs modal-scrollbar">
            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Wood Name</label>
              <input
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="e.g. Teak Wood, Rose Wood..."
                required
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Base Price (₹)</label>
              <input
                name="basePrice"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData?.basePrice ?? 800}
                required
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Stock Status</label>
              <select
                name="inStock"
                defaultValue={initialData ? (initialData.inStock ? "true" : "false") : "true"}
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              >
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Grain & Craft Description</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={initialData?.description || ""}
                placeholder="Brief craftsmanship and timber description..."
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            {/* Wood Image Upload */}
            <div className="pt-1">
              <FrameImageUploader
                label="Wood Image"
                value={image}
                onChange={(newVal) => {
                  setImage(newVal);
                  setImageError("");
                }}
                helpText="JPG, PNG or WEBP • Max 5MB"
              />
              {imageError && (
                <p className="text-xs text-rose-600 mt-1">{imageError}</p>
              )}
            </div>
          </div>

          <div className="px-5 py-3.5 bg-[#FCFAF7] border-t border-[#E7E0D2] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E7E0D2] text-[#2B2B2B] rounded-xl font-medium hover:bg-[#F8F6F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1C1B19] text-[#F8F6F2] font-bold rounded-xl shadow hover:bg-[#322F2A] transition-colors"
            >
              Save Wood
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FrameDesignModal({ isOpen, mode, initialData, onClose, onSave }) {
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setImage(initialData?.image || (mode === "add" ? "" : "/images/frames/classic-gold.jpg"));
      setImageError("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const finalImage = image || "/images/frames/classic-gold.jpg";
    const rawWoods = form.compatibleWoods.value || "All";
    const compatibleWoods = rawWoods
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.value.trim(),
      additionalPrice: parseFloat(form.additionalPrice.value) || 0,
      description: form.description.value.trim(),
      image: finalImage,
      compatibleWoods: compatibleWoods.length > 0 ? compatibleWoods : ["All"],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E7E0D2]"
      >
        <div className="flex items-center justify-between border-b border-[#E7E0D2] px-5 py-4 shrink-0 bg-white">
          <h3 className="font-display font-bold text-lg text-[#1C1B19]">
            {mode === "add" ? "Add New Frame Profile" : "Edit Frame Profile"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6A62] hover:bg-[#F8F6F2] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-5 space-y-3.5 text-xs modal-scrollbar">
            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Profile Name</label>
              <input
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="e.g. Classic Gold, Modern Black..."
                required
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Additional Price (₹)</label>
              <input
                name="additionalPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData?.additionalPrice ?? 0}
                required
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">
                Compatible Woods (comma-separated or &apos;All&apos;)
              </label>
              <input
                name="compatibleWoods"
                defaultValue={(initialData?.compatibleWoods || ["All"]).join(", ")}
                placeholder="All, or Teak Wood, Rose Wood..."
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Description</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={initialData?.description || ""}
                placeholder="Profile shape, beading, finish..."
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            {/* Frame Design Image Upload */}
            <div className="pt-1">
              <FrameImageUploader
                label="Frame Design Image"
                value={image}
                onChange={(newVal) => {
                  setImage(newVal);
                  setImageError("");
                }}
                helpText="JPG, PNG or WEBP • Max 5MB"
              />
              {imageError && (
                <p className="text-xs text-rose-600 mt-1">{imageError}</p>
              )}
            </div>
          </div>

          <div className="px-5 py-3.5 bg-[#FCFAF7] border-t border-[#E7E0D2] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E7E0D2] text-[#2B2B2B] rounded-xl font-medium hover:bg-[#F8F6F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1C1B19] text-[#F8F6F2] font-bold rounded-xl shadow hover:bg-[#322F2A] transition-colors"
            >
              Save Frame Design
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RatioModal({ isOpen, mode, initialData, onClose, onSave }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value.trim(),
      label: form.label.value.trim(),
      price: parseFloat(form.price.value) || 0,
      dimensions: form.dimensions.value.trim(),
      popular: form.popular.checked,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E7E0D2]"
      >
        <div className="flex items-center justify-between border-b border-[#E7E0D2] px-5 py-4 shrink-0 bg-white">
          <h3 className="font-display font-bold text-lg text-[#1C1B19]">
            {mode === "add" ? "Add New Frame Size" : "Edit Frame Size"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6A62] hover:bg-[#F8F6F2] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-5 space-y-3.5 text-xs modal-scrollbar">
            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">
                Ratio / Size (e.g. 10 × 12)
              </label>
              <input
                name="name"
                defaultValue={initialData?.name || ""}
                required
                placeholder="e.g. 10 × 12"
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Label / Title</label>
              <input
                name="label"
                defaultValue={initialData?.label || ""}
                placeholder="e.g. 10 × 12 inches (Statement Wall)"
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Price (₹)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData?.price ?? 600}
                required
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#1C1B19] block mb-1">Dimensions Note</label>
              <input
                name="dimensions"
                defaultValue={initialData?.dimensions || ""}
                placeholder="e.g. 10 × 12 inches (25 × 30 cm)"
                className="w-full p-2.5 rounded-xl border border-[#E7E0D2] text-xs focus:ring-2 focus:ring-[#C9A669] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="popularCheck"
                name="popular"
                defaultChecked={initialData?.popular || false}
                className="rounded text-[#C9A669] focus:ring-[#C9A669]"
              />
              <label htmlFor="popularCheck" className="text-[#1C1B19] font-medium cursor-pointer">
                Mark as Popular Size
              </label>
            </div>
          </div>

          <div className="px-5 py-3.5 bg-[#FCFAF7] border-t border-[#E7E0D2] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E7E0D2] text-[#2B2B2B] rounded-xl font-medium hover:bg-[#F8F6F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1C1B19] text-[#F8F6F2] font-bold rounded-xl shadow hover:bg-[#322F2A] transition-colors"
            >
              Save Size
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
