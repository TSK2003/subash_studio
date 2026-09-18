import { useState, useId, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  FileText,
  Plus,
  Minus,
  AlertCircle,
  Eye,
  Building2,
  Home as HomeIcon,
  ShoppingBag,
  Trash2,
  Edit3,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import FramePrintReceipt from "../components/FramePrintReceipt";
import FrameLivePreview from "../components/frames/FrameLivePreview";
import PhotoAdjusterControls from "../components/frames/PhotoAdjusterControls";
import CartDrawer from "../components/frames/CartDrawer";
import { useAdminData } from "../admin/context/AdminDataContext";
import {
  calculateFramePrice,
  formatRupee,
  isDesignCompatible,
} from "../lib/framePricing";
import {
  formatRatioDisplayLabel,
  formatDimensionsLabel,
} from "../lib/frameDimensions";

// 4-Step Simplified Workflow Navigator
const STEPS = [
  { id: 1, label: "Customize", desc: "Craft size, timber, photo & finish" },
  { id: 2, label: "Review", desc: "Verify specs & approval" },
  { id: 3, label: "Details", desc: "Shipping & fulfillment" },
  { id: 4, label: "Success", desc: "Receipt & confirmation" },
];

export default function OrderFrames() {
  const fileInputId = useId();
  const fileInputRef = useRef(null);
  const previewSectionRef = useRef(null);

  const {
    frameWoodTypes,
    frameDesigns,
    frameRatios,
    branches,
    addFrameOrder,
  } = useAdminData();

  // Active catalog items from admin context
  const activeWoods = (frameWoodTypes || []).filter((w) => w.active !== false);
  const activeDesigns = (frameDesigns || []).filter((d) => d.active !== false);
  const activeRatios = (frameRatios || []).filter((r) => r.active !== false);

  // Active branches for studio pickup
  const activeBranches = (branches || []).filter((b) => b.active !== false);
  const fallbackBranches = [
    { city: "Tirunelveli", name: "Tirunelveli Atelier (Near Junction)" },
    { city: "Kalladaikurichi", name: "Kalladaikurichi Heritage Studio (Main Road)" },
  ];
  const verifiedBranches = activeBranches.length > 0 ? activeBranches : fallbackBranches;

  // Wizard Stage (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // ==========================================================
  // CENTRALIZED PERSISTENT CONFIGURATION STATE
  // ==========================================================
  const [selectedWood, setSelectedWood] = useState(() => activeWoods[0] || null);
  const [selectedDesign, setSelectedDesign] = useState(() => activeDesigns[0] || null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [selectedRatio, setSelectedRatio] = useState(() => activeRatios[0] || activeRatios[1] || null);
  const [orientation, setOrientation] = useState("portrait"); // "portrait" | "landscape"

  // Photo editing state (separate from original image)
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPan, setPhotoPan] = useState({ x: 0, y: 0 });
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoFitMode, setPhotoFitMode] = useState("fill"); // "fill" | "contain"

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("subash_frame_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [editingCartItemId, setEditingCartItemId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("subash_frame_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [cartItems]);

  const totalCartItemsCount = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const cartGrandTotal = cartItems.reduce((sum, it) => sum + (it.totalAmount || 0), 0);

  // Customer Details Form State
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    deliveryType: "Home Delivery",
    address: "",
    city: "Tirunelveli",
    district: "Tirunelveli",
    state: "Tamil Nadu",
    pincode: "",
    branchPickup: verifiedBranches[0]?.name || verifiedBranches[0]?.city || "Tirunelveli Atelier",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Set default selections once active lists load
  useEffect(() => {
    if (!selectedWood && activeWoods.length > 0) setSelectedWood(activeWoods[0]);
    if (!selectedDesign && activeDesigns.length > 0) setSelectedDesign(activeDesigns[0]);
    if (!selectedRatio && activeRatios.length > 0) setSelectedRatio(activeRatios[1] || activeRatios[0]);
  }, [activeWoods, activeDesigns, activeRatios, selectedWood, selectedDesign, selectedRatio]);

  // Centralized authoritative pricing calculation
  const pricing = calculateFramePrice({
    wood: selectedWood,
    design: selectedDesign,
    ratio: selectedRatio,
    quantity,
  });

  // Photo upload & client-side compression handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setPhotoError("Image size exceeds 25MB. Please choose a smaller image.");
      return;
    }

    setPhotoError("");
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress photo to max 1200px dimension for crystal-clear client-side rendering
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setUploadedPhoto(compressedDataUrl);

        // Reset adjustments on new photo upload
        setPhotoZoom(1);
        setPhotoPan({ x: 0, y: 0 });
        setPhotoRotation(0);
        setPhotoFitMode("fill");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhotoAdjustments = () => {
    setPhotoZoom(1);
    setPhotoPan({ x: 0, y: 0 });
    setPhotoRotation(0);
    setPhotoFitMode("fill");
  };

  // Step 1 Validation: All required controls must be completed
  const isCustomizerComplete = () => {
    return Boolean(selectedWood && selectedDesign && uploadedPhoto && selectedRatio);
  };

  // Add current configurator item to cart
  const handleAddToCart = () => {
    if (!isCustomizerComplete()) return;

    const currentItem = {
      id: editingCartItemId || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      wood: selectedWood,
      woodType: selectedWood?.name,
      woodPrice: pricing.woodPrice,
      design: selectedDesign,
      frameDesign: selectedDesign?.name,
      designPrice: pricing.designPrice,
      ratio: selectedRatio,
      frameRatio: selectedRatio?.name,
      ratioPrice: pricing.ratioPrice,
      orientation,
      quantity,
      unitPrice: pricing.unitPrice,
      totalAmount: pricing.totalAmount,
      photoUrl: uploadedPhoto,
      photoName: photoFileName || "custom-framed-photo.jpg",
      customizationParams: {
        zoom: photoZoom,
        pan: photoPan,
        rotation: photoRotation,
        fitMode: photoFitMode,
        orientation,
      },
    };

    if (editingCartItemId) {
      setCartItems((prev) =>
        prev.map((it) => (it.id === editingCartItemId ? currentItem : it))
      );
      setEditingCartItemId(null);
    } else {
      setCartItems((prev) => [...prev, currentItem]);
    }

    setCartDrawerOpen(true);
  };

  // Update quantity in cart
  const handleUpdateCartQuantity = (itemId, newQty) => {
    setCartItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const qty = Math.max(1, Math.min(20, newQty));
          return {
            ...it,
            quantity: qty,
            totalAmount: (it.unitPrice || 0) * qty,
          };
        }
        return it;
      })
    );
  };

  // Remove item from cart
  const handleRemoveCartItem = (itemId) => {
    setCartItems((prev) => prev.filter((it) => it.id !== itemId));
    if (editingCartItemId === itemId) {
      setEditingCartItemId(null);
    }
  };

  // Edit item from cart in the customizer
  const handleEditCartItem = (item) => {
    setEditingCartItemId(item.id);
    if (item.wood) setSelectedWood(item.wood);
    else if (item.woodType) {
      const match = activeWoods.find((w) => w.name === item.woodType);
      if (match) setSelectedWood(match);
    }

    if (item.design) setSelectedDesign(item.design);
    else if (item.frameDesign) {
      const match = activeDesigns.find((d) => d.name === item.frameDesign);
      if (match) setSelectedDesign(match);
    }

    if (item.ratio) setSelectedRatio(item.ratio);
    else if (item.frameRatio) {
      const match = activeRatios.find((r) => r.name === item.frameRatio);
      if (match) setSelectedRatio(match);
    }

    if (item.orientation) setOrientation(item.orientation);
    if (item.quantity) setQuantity(item.quantity);
    if (item.photoUrl) setUploadedPhoto(item.photoUrl);
    if (item.photoName) setPhotoFileName(item.photoName);

    if (item.customizationParams) {
      setPhotoZoom(item.customizationParams.zoom ?? 1);
      setPhotoPan(item.customizationParams.pan ?? { x: 0, y: 0 });
      setPhotoRotation(item.customizationParams.rotation ?? 0);
      setPhotoFitMode(item.customizationParams.fitMode ?? "fill");
    }

    setCartDrawerOpen(false);
    setCurrentStep(1);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Cancel editing cart item
  const handleCancelEdit = () => {
    setEditingCartItemId(null);
  };

  // Customize another frame (clears photo & adjustments for a clean canvas)
  const handleCustomizeAnother = () => {
    setEditingCartItemId(null);
    setUploadedPhoto(null);
    setPhotoFileName("");
    setPhotoZoom(1);
    setPhotoPan({ x: 0, y: 0 });
    setPhotoRotation(0);
    setPhotoFitMode("fill");
    setQuantity(1);
    setCartDrawerOpen(false);
    setCurrentStep(1);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Navigation handlers
  const handleProceedToReview = () => {
    if (isCustomizerComplete()) {
      const alreadyInCart =
        editingCartItemId ||
        cartItems.some(
          (it) =>
            it.photoUrl === uploadedPhoto &&
            it.woodType === selectedWood?.name &&
            it.frameDesign === selectedDesign?.name &&
            it.frameRatio === selectedRatio?.name &&
            it.orientation === orientation &&
            it.quantity === quantity
        );

      if (!alreadyInCart) {
        const itemData = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          wood: selectedWood,
          woodType: selectedWood?.name,
          woodPrice: pricing.woodPrice,
          design: selectedDesign,
          frameDesign: selectedDesign?.name,
          designPrice: pricing.designPrice,
          ratio: selectedRatio,
          frameRatio: selectedRatio?.name,
          ratioPrice: pricing.ratioPrice,
          orientation,
          quantity,
          unitPrice: pricing.unitPrice,
          totalAmount: pricing.totalAmount,
          photoUrl: uploadedPhoto,
          photoName: photoFileName || "custom-framed-photo.jpg",
          customizationParams: {
            zoom: photoZoom,
            pan: photoPan,
            rotation: photoRotation,
            fitMode: photoFitMode,
            orientation,
          },
        };
        setCartItems((prev) => [...prev, itemData]);
      } else if (editingCartItemId) {
        const itemData = {
          id: editingCartItemId,
          wood: selectedWood,
          woodType: selectedWood?.name,
          woodPrice: pricing.woodPrice,
          design: selectedDesign,
          frameDesign: selectedDesign?.name,
          designPrice: pricing.designPrice,
          ratio: selectedRatio,
          frameRatio: selectedRatio?.name,
          ratioPrice: pricing.ratioPrice,
          orientation,
          quantity,
          unitPrice: pricing.unitPrice,
          totalAmount: pricing.totalAmount,
          photoUrl: uploadedPhoto,
          photoName: photoFileName || "custom-framed-photo.jpg",
          customizationParams: {
            zoom: photoZoom,
            pan: photoPan,
            rotation: photoRotation,
            fitMode: photoFitMode,
            orientation,
          },
        };
        setCartItems((prev) =>
          prev.map((it) => (it.id === editingCartItemId ? itemData : it))
        );
        setEditingCartItemId(null);
      }
    } else if (cartItems.length === 0) {
      return;
    }

    setCartDrawerOpen(false);
    setCurrentStep(2);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleEditCustomization = () => {
    // Return to Step 1 without modifying/resetting any state
    setCurrentStep(1);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleApproveAndContinue = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Step 3 Customer Form Validation
  const validateForm = () => {
    const errs = {};
    if (!customerForm.name.trim()) errs.name = "Full name is required.";
    if (!customerForm.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^[0-9+-\s()]{7,16}$/.test(customerForm.phone.trim())) {
      errs.phone = "Please enter a valid contact number.";
    }
    if (!customerForm.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (customerForm.deliveryType === "Home Delivery") {
      if (!customerForm.address.trim()) errs.address = "Street address is required.";
      if (!customerForm.city.trim()) errs.city = "City is required.";
      if (!customerForm.state.trim()) errs.state = "State is required.";
      if (!customerForm.pincode.trim()) {
        errs.pincode = "Pincode is required.";
      } else if (!/^\d{6}$/.test(customerForm.pincode.trim())) {
        errs.pincode = "Please enter a valid 6-digit postal pincode.";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Final Order Submission
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = Math.floor(100 + Math.random() * 900);
      const generatedOrderId = `SS-FR-${today}-${rand}`;

      const fullAddress =
        customerForm.deliveryType === "Home Delivery"
          ? `${customerForm.address.trim()}, ${customerForm.city.trim()}, ${customerForm.district.trim() ? customerForm.district.trim() + ", " : ""}${customerForm.state.trim()} - ${customerForm.pincode.trim()}`
          : `Studio Atelier Pickup at ${customerForm.branchPickup}`;

      const primaryItem = cartItems[0] || {
        wood: selectedWood,
        woodType: selectedWood?.name || "Selected Wood",
        woodPrice: pricing.woodPrice,
        design: selectedDesign,
        frameDesign: selectedDesign?.name || "Selected Design",
        designPrice: pricing.designPrice,
        ratio: selectedRatio,
        frameRatio: selectedRatio?.name || "Selected Size",
        ratioPrice: pricing.ratioPrice,
        orientation,
        quantity,
        unitPrice: pricing.unitPrice,
        totalAmount: pricing.totalAmount,
        photoUrl: uploadedPhoto || "/images/couple.jpg",
        photoName: photoFileName || "custom-framed-photo.jpg",
        customizationParams: {
          zoom: photoZoom,
          pan: photoPan,
          rotation: photoRotation,
          fitMode: photoFitMode,
          orientation,
        },
      };

      const finalTotal = cartItems.length > 0 ? cartGrandTotal : pricing.totalAmount;
      const orderItems = cartItems.length > 0 ? cartItems : [primaryItem];

      const orderPayload = {
        id: generatedOrderId,
        customerName: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        whatsapp: customerForm.whatsapp.trim() || customerForm.phone.trim(),
        email: customerForm.email.trim(),
        deliveryType: customerForm.deliveryType,
        address: fullAddress,
        notes: customerForm.notes.trim(),
        woodType: primaryItem.woodType || primaryItem.wood?.name || selectedWood?.name || "Selected Wood",
        woodPrice: primaryItem.woodPrice ?? pricing.woodPrice,
        frameDesign: primaryItem.frameDesign || primaryItem.design?.name || selectedDesign?.name || "Selected Design",
        designPrice: primaryItem.designPrice ?? pricing.designPrice,
        frameRatio: primaryItem.frameRatio || primaryItem.ratio?.name || selectedRatio?.name || "Selected Size",
        ratioPrice: primaryItem.ratioPrice ?? pricing.ratioPrice,
        orientation: primaryItem.orientation || orientation,
        quantity: orderItems.reduce((sum, it) => sum + (it.quantity || 1), 0),
        unitPrice: primaryItem.unitPrice ?? pricing.unitPrice,
        totalAmount: finalTotal,
        photoUrl: primaryItem.photoUrl || uploadedPhoto || "/images/couple.jpg",
        photoName: primaryItem.photoName || photoFileName || "custom-framed-photo.jpg",
        customizationParams: primaryItem.customizationParams || {
          zoom: photoZoom,
          pan: photoPan,
          rotation: photoRotation,
          fitMode: photoFitMode,
          orientation,
        },
        items: orderItems,
        status: "New",
        createdAt: new Date().toISOString(),
      };

      addFrameOrder(orderPayload);
      setPlacedOrder(orderPayload);
      setCartItems([]);
      try {
        localStorage.removeItem("subash_frame_cart");
      } catch {}
      setIsSubmitting(false);
      setCurrentStep(4);
      window.scrollTo({ top: 80, behavior: "smooth" });
    }, 700);
  };

  // Reset order to customize another frame
  const handleOrderAnother = () => {
    setPlacedOrder(null);
    setUploadedPhoto(null);
    setPhotoFileName("");
    setPhotoZoom(1);
    setPhotoPan({ x: 0, y: 0 });
    setPhotoRotation(0);
    setPhotoFitMode("fill");
    setQuantity(1);
    setEditingCartItemId(null);
    setCurrentStep(1);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  return (
    <>
      <div className="min-h-screen bg-transparent text-[#2B2B2B] pt-28 pb-20 px-4 sm:px-6 lg:px-10 no-print">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ==========================================================
              ATELIER HEADER (TOP BADGE REMOVED)
          ========================================================== */}
          <div className="text-center space-y-3 pt-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1C1B19]">
              Design Your Heirloom Frame
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A62] max-w-2xl mx-auto leading-relaxed">
              Curate solid timber, fine artisan profiles, upload your photograph with live client-side sizing, and watch your heirloom portrait come to life.
            </p>
          </div>

          {/* ==========================================================
              4-STEP PROGRESS NAVIGATOR & CART ACTION
          ========================================================== */}
          <div className="max-w-3xl mx-auto space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="hidden sm:flex items-center gap-2 text-xs font-serif tracking-wider uppercase text-[#8C6D32]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A669]" />
                <span>Bespoke Framing Workflow</span>
              </div>
              <div className="sm:hidden" />

              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E7E0D2] hover:border-[#C9A669] rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs font-bold text-[#1C1B19] group ml-auto"
                title="Open Framing Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#8C6D32] group-hover:text-[#C9A669] transition-colors" />
                  {totalCartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#C9A669] text-[#1C1B19] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      {totalCartItemsCount}
                    </span>
                  )}
                </div>
                <span>Cart ({totalCartItemsCount})</span>
                {cartGrandTotal > 0 && (
                  <span className="text-[#8C6D32] font-semibold">
                    &bull; {formatRupee(cartGrandTotal)}
                  </span>
                )}
              </button>
            </div>

            <nav
              aria-label="Order progress"
              className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E7E0D2] shadow-sm"
            >
              <div className="flex items-center justify-between">
                {STEPS.map((step, idx) => {
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;

                  return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                      <button
                        type="button"
                        disabled={step.id > currentStep && currentStep !== 4}
                        onClick={() => {
                          // Allow clicking back to completed steps
                          if (step.id < currentStep && currentStep !== 4) {
                            setCurrentStep(step.id);
                          }
                        }}
                        className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-left transition-all ${
                          isCurrent
                            ? "bg-[#1C1B19] text-[#F8F6F2] shadow"
                            : isCompleted
                            ? "hover:bg-[#F8F6F2] text-[#1C1B19] cursor-pointer"
                            : "text-[#9E988E] cursor-not-allowed opacity-50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isCurrent
                              ? "bg-[#C9A669] text-[#1C1B19]"
                              : isCompleted
                              ? "bg-[#EAE3D2] text-[#8C6D32]"
                              : "border border-[#DCD3C0] text-[#9E988E]"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                        </div>
                        <div className="hidden md:block min-w-0">
                          <div className="text-xs font-bold leading-none truncate">{step.label}</div>
                          <div
                            className={`text-[10px] mt-0.5 truncate ${
                              isCurrent ? "text-[#C9A669]" : "text-[#9E988E]"
                            }`}
                          >
                            {step.desc}
                          </div>
                        </div>
                      </button>

                      {idx < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-[2px] mx-2 transition-colors ${
                            isCompleted ? "bg-[#C9A669]" : "bg-[#E7E0D2]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>

          <AnimatePresence mode="wait">
            {/* ==========================================================
                PAGE 1: FRAME CUSTOMIZER (TWO-COLUMN DESKTOP CONFIGURATOR)
            ========================================================== */}
            {currentStep === 1 && (
              <motion.div
                key="stage-1-customize"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Editing Cart Item Notice Banner */}
                {editingCartItemId && (
                  <div className="bg-[#FAF6EE] border-2 border-[#C9A669] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A669] text-[#1C1B19] flex items-center justify-center shrink-0">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1C1B19]">
                          Editing Frame from Cart
                        </div>
                        <div className="text-xs text-[#6F6A62]">
                          Adjust wood, profile, photo, or sizing below. Click &ldquo;Update Cart Item&rdquo; to save changes.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs font-bold text-[#8C6D32] hover:text-[#1C1B19] bg-white border border-[#DCD3C0] rounded-xl hover:bg-[#FAF8F5] transition-colors self-end sm:self-auto"
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                {/* Mobile Quick Live Preview Jump Anchor */}
                <div className="lg:hidden bg-white p-3 rounded-2xl border border-[#E7E0D2] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#1C1B19]">Live Preview:</span>
                    <span className="text-[#8C6D32]">
                      {selectedWood?.name} &bull; {formatRatioDisplayLabel(selectedRatio?.name, orientation)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => previewSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="px-3 py-1.5 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C9A669]" />
                    <span>View Frame</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* ====================================================
                      LEFT COLUMN (58%): ALL CUSTOMIZATION CONTROLS
                  ==================================================== */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* SECTION 01: CHOOSE RATIO / SIZE & ORIENTATION */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            01
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Frame Dimensions &amp; Orientation
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C6D32] border border-[#E7E0D2]">
                          Selected: {formatRatioDisplayLabel(selectedRatio?.name, orientation)} ({orientation})
                        </span>
                      </div>

                      {/* Orientation Switcher */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1B19]">
                          Display Orientation
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                          <button
                            type="button"
                            onClick={() => setOrientation("portrait")}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              orientation === "portrait"
                                ? "border-[#C9A669] bg-[#1C1B19] text-[#F8F6F2] shadow-sm"
                                : "border-[#E7E0D2] bg-[#FAF8F5] text-[#2B2B2B] hover:bg-[#F0EBE0]"
                            }`}
                          >
                            <div className="w-3.5 h-5 border border-current rounded-sm" />
                            <span>Portrait (Vertical)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrientation("landscape")}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              orientation === "landscape"
                                ? "border-[#C9A669] bg-[#1C1B19] text-[#F8F6F2] shadow-sm"
                                : "border-[#E7E0D2] bg-[#FAF8F5] text-[#2B2B2B] hover:bg-[#F0EBE0]"
                            }`}
                          >
                            <div className="w-5 h-3.5 border border-current rounded-sm" />
                            <span>Landscape (Horizontal)</span>
                          </button>
                        </div>
                      </div>

                      {/* Frame Sizes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-2">
                        {activeRatios.map((ratio) => {
                          const isSelected = selectedRatio?.id === ratio.id;
                          const ratioDisplayName = formatRatioDisplayLabel(ratio.name, orientation);
                          const dimensionsDisplayName = formatDimensionsLabel(ratio.dimensions, orientation);

                          return (
                            <div
                              key={ratio.id}
                              onClick={() => setSelectedRatio(ratio)}
                              className={`group cursor-pointer rounded-2xl border transition-all p-3.5 flex flex-col justify-between relative ${
                                isSelected
                                  ? "border-[#C9A669] ring-2 ring-[#C9A669]/25 bg-[#FDFBF7] shadow-sm"
                                  : "border-[#E7E0D2] hover:border-[#C9A669]/60 hover:bg-[#FAF8F5]"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h3 className="font-display font-bold text-base text-[#1C1B19]">
                                        {ratioDisplayName}
                                      </h3>
                                      {ratio.popular && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-[#C9A669]/20 text-[#8C6D32] text-[9px] font-bold">
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-[#6F6A62]">{ratio.label}</div>
                                  </div>
                                  <div className="text-sm font-bold text-[#8C6D32]">
                                    {formatRupee(ratio.price)}
                                  </div>
                                </div>

                                <div className="h-20 rounded-xl bg-[#F4EFE6] border border-[#E7E0D2] flex items-center justify-center p-2">
                                  <div
                                    className="border border-[#8C6D32] bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-[#2B2B2B] transition-all"
                                    style={{
                                      width: orientation === "landscape" ? "75px" : "55px",
                                      height: orientation === "landscape" ? "55px" : "75px",
                                    }}
                                  >
                                    {ratioDisplayName}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-[#E7E0D2]/70 flex items-center justify-between text-[11px]">
                                <span className="text-[#6F6A62] text-[10px]">{dimensionsDisplayName}</span>
                                <span className={isSelected ? "font-bold text-[#C9A669]" : "text-[#9E988E]"}>
                                  {isSelected ? "Selected" : "Select"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 02: CHOOSE WOOD TYPE */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            02
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Choose Timber Wood
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C6D32] border border-[#E7E0D2]">
                          Selected: {selectedWood?.name}
                        </span>
                      </div>

                      <p className="text-xs text-[#6F6A62]">
                        Select sustainably harvested solid timber. Timber grain patterns and tones update in the live preview immediately.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {activeWoods.map((wood) => {
                          const isSelected = selectedWood?.id === wood.id;
                          return (
                            <div
                              key={wood.id}
                              onClick={() => setSelectedWood(wood)}
                              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all p-3 flex flex-col justify-between relative ${
                                isSelected
                                  ? "border-[#C9A669] ring-2 ring-[#C9A669]/25 bg-[#FDFBF7] shadow-sm"
                                  : "border-[#E7E0D2] hover:border-[#C9A669]/60 hover:bg-[#FAF8F5]"
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="relative h-28 rounded-xl overflow-hidden bg-[#ECE7DC] border border-[#E7E0D2]">
                                  <img
                                    src={wood.image}
                                    alt={wood.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C9A669] text-[#1C1B19] flex items-center justify-center shadow">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-[#1C1B19]/80 backdrop-blur-sm text-[#F8F6F2] text-[10px] font-semibold">
                                    {formatRupee(wood.basePrice)} base
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-display font-bold text-sm text-[#1C1B19] flex items-center justify-between">
                                    <span>{wood.name}</span>
                                    <span className="text-xs font-semibold text-[#8C6D32]">
                                      {formatRupee(wood.basePrice)}
                                    </span>
                                  </h3>
                                  <p className="text-[11px] text-[#6F6A62] mt-1 line-clamp-2 leading-relaxed">
                                    {wood.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-[#E7E0D2]/70 flex items-center justify-between text-[10px]">
                                <span className="text-[#8C6D32] truncate">{wood.grain || "Natural Grain"}</span>
                                <span className={isSelected ? "font-bold text-[#C9A669]" : "text-[#9E988E]"}>
                                  {isSelected ? "Selected" : "Select"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 03: CHOOSE FRAME PROFILE & FINISH */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            03
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Choose Frame Profile &amp; Finish
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C6D32] border border-[#E7E0D2]">
                          Selected: {selectedDesign?.name}
                        </span>
                      </div>

                      <p className="text-xs text-[#6F6A62]">
                        Add an artisan lip or gallery accent to complement your chosen timber.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                        {activeDesigns.map((design) => {
                          const isSelected = selectedDesign?.id === design.id;
                          const compatible = isDesignCompatible(design, selectedWood);

                          return (
                            <div
                              key={design.id}
                              onClick={() => {
                                if (compatible) setSelectedDesign(design);
                              }}
                              className={`group rounded-2xl overflow-hidden border transition-all p-3 flex flex-col justify-between relative ${
                                !compatible
                                  ? "opacity-40 bg-[#F5F2EC] border-[#DCD3C0] cursor-not-allowed"
                                  : isSelected
                                  ? "border-[#C9A669] ring-2 ring-[#C9A669]/25 bg-[#FDFBF7] shadow-sm cursor-pointer"
                                  : "border-[#E7E0D2] hover:border-[#C9A669]/60 hover:bg-[#FAF8F5] cursor-pointer"
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="relative h-24 rounded-xl overflow-hidden bg-[#ECE7DC] border border-[#E7E0D2]">
                                  <img
                                    src={design.image}
                                    alt={design.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C9A669] text-[#1C1B19] flex items-center justify-center shadow">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-[#1C1B19]/80 backdrop-blur-sm text-[#F8F6F2] text-[10px] font-semibold">
                                    {design.additionalPrice > 0
                                      ? `+${formatRupee(design.additionalPrice)}`
                                      : "Included (+₹0)"}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-display font-bold text-sm text-[#1C1B19] flex items-center justify-between">
                                    <span className="truncate">{design.name}</span>
                                    <span className="text-xs font-semibold text-[#8C6D32] shrink-0">
                                      {design.additionalPrice > 0
                                        ? `+${formatRupee(design.additionalPrice)}`
                                        : "₹0"}
                                    </span>
                                  </h3>
                                  <p className="text-[11px] text-[#6F6A62] mt-1 line-clamp-2 leading-relaxed">
                                    {design.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-[#E7E0D2]/70 text-[10px]">
                                {!compatible ? (
                                  <span className="text-red-700 font-medium">Incompatible</span>
                                ) : (
                                  <span className={isSelected ? "font-bold text-[#C9A669]" : "text-[#8C6D32]"}>
                                    {isSelected ? "Selected" : "Select"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 04: UPLOAD PHOTOGRAPH */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            04
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Upload Photograph
                          </h2>
                        </div>
                        {uploadedPhoto && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>Photo Loaded</span>
                          </div>
                        )}
                      </div>

                      <input
                        id={fileInputId}
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      {/* Dropzone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#C9A669]/70 hover:border-[#9C7B3D] bg-[#FDFBF7] hover:bg-[#FAF6EE] rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#EFE9DD] group-hover:bg-[#E5DEC7] text-[#9C7B3D] mx-auto flex items-center justify-center transition-colors shadow-sm">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-[#1C1B19]">
                            {uploadedPhoto ? "Change / Upload Different Photograph" : "Click or Drag to Upload Portrait"}
                          </h3>
                          <p className="text-xs text-[#6F6A62] mt-0.5">
                            Supports JPG, JPEG, PNG, WebP up to 25MB (Auto-fitted for live preview)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-1.5 bg-[#1C1B19] text-[#F8F6F2] rounded-xl text-xs font-semibold hover:bg-[#322F2A] transition-colors inline-block"
                        >
                          Browse Image
                        </button>
                      </div>

                      {photoError && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{photoError}</span>
                        </div>
                      )}

                      {uploadedPhoto && (
                        <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E7E0D2] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ImageIcon className="w-4 h-4 text-[#C9A669] shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#1C1B19] truncate">
                                {photoFileName || "Uploaded Photograph"}
                              </div>
                              <div className="text-[10px] text-[#6F6A62]">Ready for framing &bull; Drag to pan in preview</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-[#8C6D32] hover:underline shrink-0"
                          >
                            Replace
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-[#6F6A62] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E7E0D2]">
                        <ShieldCheck className="w-4 h-4 text-[#C9A669] shrink-0" />
                        <span>Client-side protection active &bull; Original photograph is preserved untouched.</span>
                      </div>
                    </div>

                    {/* SECTION 05: FINE ADJUST & CROP PHOTOGRAPH */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            05
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Fine Adjust &amp; Crop Photograph
                          </h2>
                        </div>
                        {uploadedPhoto ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C6D32] border border-[#E7E0D2]">
                            Zoom {Math.round(photoZoom * 100)}% &bull; {photoRotation}&deg;
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#9E988E] border border-[#E7E0D2]">
                            Photo Required
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6F6A62]">
                        Pan, zoom, or rotate your photo. You can also click and drag directly inside the live preview on the right.
                      </p>

                      {!uploadedPhoto && (
                        <div className="p-3.5 bg-[#FAF8F5] text-[#8C6D32] rounded-2xl border border-[#E7E0D2] flex items-center gap-3 text-xs">
                          <div className="w-8 h-8 rounded-xl bg-[#EFE9DD] flex items-center justify-center text-[#8C6D32] shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#1C1B19]">
                              Upload a photo to enable adjustment controls
                            </div>
                            <div className="text-[11px] text-[#6F6A62]">
                              Once a portrait is uploaded in Section 04 above, zoom, rotation, and button-based nudging will unlock immediately.
                            </div>
                          </div>
                        </div>
                      )}

                      <PhotoAdjusterControls
                        zoom={photoZoom}
                        pan={photoPan}
                        rotation={photoRotation}
                        fitMode={photoFitMode}
                        disabled={!uploadedPhoto}
                        onZoomChange={setPhotoZoom}
                        onPanChange={setPhotoPan}
                        onRotationChange={setPhotoRotation}
                        onFitModeChange={setPhotoFitMode}
                        onReset={handleResetPhotoAdjustments}
                      />
                    </div>



                    {/* SECTION 06: QUANTITY & ADD TO CART */}
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E7E0D2] shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1C1B19] text-[#F8F6F2] text-xs font-bold flex items-center justify-center">
                            06
                          </span>
                          <h2 className="text-base sm:text-lg font-display font-bold text-[#1C1B19]">
                            Quantity &amp; Add to Cart
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C6D32] border border-[#E7E0D2]">
                          {quantity} Frame{quantity > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E0D2]">
                        <div>
                          <div className="font-bold text-sm text-[#1C1B19]">Number of identical frames</div>
                          <div className="text-xs text-[#6F6A62]">Ideal for gifting, family sets, or dual exhibitions</div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-[#E7E0D2] shadow-xs">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="w-8 h-8 rounded-xl bg-white border border-[#E7E0D2] flex items-center justify-center hover:bg-[#F4EFE6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#1C1B19]"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-base text-[#1C1B19]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                            disabled={quantity >= 20}
                            className="w-8 h-8 rounded-xl bg-white border border-[#E7E0D2] flex items-center justify-center hover:bg-[#F4EFE6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#1C1B19]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Customization Checklist */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#8C6D32]">
                          Customization Checklist
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-[#1C1B19]">
                            <CheckCircle2 className={`w-4 h-4 ${selectedRatio ? "text-emerald-600" : "text-gray-300"}`} />
                            <span>Ratio &amp; Size</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#1C1B19]">
                            <CheckCircle2 className={`w-4 h-4 ${selectedWood ? "text-emerald-600" : "text-gray-300"}`} />
                            <span>Wood Selected</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#1C1B19]">
                            <CheckCircle2 className={`w-4 h-4 ${selectedDesign ? "text-emerald-600" : "text-gray-300"}`} />
                            <span>Design Profile</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#1C1B19]">
                            <CheckCircle2 className={`w-4 h-4 ${uploadedPhoto ? "text-emerald-600" : "text-gray-300"}`} />
                            <span>Photo Uploaded</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Row with Total, Add to Cart, Review My Frame */}
                      <div className="pt-4 border-t border-[#E7E0D2] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-[#6F6A62]">
                            {editingCartItemId ? "Item Amount" : "Current Frame Price"}
                          </div>
                          <div className="text-2xl font-display font-bold text-[#8C6D32]">
                            {pricing.formattedTotal}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            type="button"
                            disabled={!isCustomizerComplete()}
                            onClick={handleAddToCart}
                            className="px-6 py-3.5 bg-gradient-to-r from-[#1C1B19] to-[#322F2A] hover:from-[#C9A669] hover:to-[#9C7B3D] text-[#F8F6F2] hover:text-[#1C1B19] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#C9A669]" />
                            <span>
                              {editingCartItemId ? "Update Cart Item" : "Add to Cart"} &mdash; {pricing.formattedTotal}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={!isCustomizerComplete() && cartItems.length === 0}
                            onClick={handleProceedToReview}
                            className="px-6 py-3.5 bg-white hover:bg-[#FAF8F5] text-[#1C1B19] rounded-xl text-xs font-bold tracking-wider uppercase border border-[#E7E0D2] transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <span>Review My Frame</span>
                            {cartItems.length > 0 && (
                              <span className="text-[10px] text-[#8C6D32] font-bold px-1.5 py-0.5 rounded bg-[#F8F6F2] border border-[#E7E0D2]">
                                {totalCartItemsCount} in cart
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-[#8C6D32]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ====================================================
                      RIGHT COLUMN (42%): STICKY LIVE ARTISAN PREVIEW
                  ==================================================== */}
                  <div
                    ref={previewSectionRef}
                    className="lg:col-span-5 lg:sticky lg:top-28 space-y-4"
                  >
                    <FrameLivePreview
                      wood={selectedWood}
                      design={selectedDesign}
                      ratio={selectedRatio}
                      orientation={orientation}
                      photoUrl={uploadedPhoto}
                      photoName={photoFileName}
                      zoom={photoZoom}
                      pan={photoPan}
                      rotation={photoRotation}
                      fitMode={photoFitMode}
                      quantity={quantity}
                      pricing={pricing}
                      onPanChange={setPhotoPan}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                PAGE 2: REVIEW ORDER & FULL SPECIFICATION
            ========================================================== */}
            {currentStep === 2 && (
              <motion.div
                key="stage-2-review"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E7E0D2] shadow-sm space-y-8">
                  <div className="border-b border-[#E7E0D2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1C1B19]">
                        Stage 2: Review Artisan Frame Specification
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6F6A62]">
                        {cartItems.length > 1
                          ? `Review all ${cartItems.length} handcrafted frames in your cart before continuing to fulfillment.`
                          : "Verify your timber selection, finish profile, sizing, and pricing before submitting customer fulfillment details."}
                      </p>
                    </div>
                    <div className="text-xs font-semibold px-3 py-1 bg-[#C9A669]/15 border border-[#C9A669]/40 rounded-full text-[#8C6D32] self-start sm:self-auto">
                      Total: {formatRupee(cartItems.length > 0 ? cartGrandTotal : pricing.totalAmount)}
                    </div>
                  </div>

                  {cartItems.length > 1 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cartItems.map((item, idx) => {
                          const itemSizeDisplay = formatRatioDisplayLabel(
                            item.ratio?.name || item.frameRatio,
                            item.orientation
                          );
                          return (
                            <div
                              key={item.id || idx}
                              className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D2] flex gap-4 items-start relative group"
                            >
                              <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#24221F] border-2 border-[#DCD3C0] shrink-0 relative flex items-center justify-center">
                                {item.photoUrl ? (
                                  <img
                                    src={item.photoUrl}
                                    alt={item.photoName || "Framed item"}
                                    className="w-full h-full object-cover pointer-events-none select-none"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-[#8C6D32] opacity-40" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="font-display font-bold text-sm text-[#1C1B19]">
                                    Frame #{idx + 1}: {item.wood?.name || item.woodType}
                                  </h4>
                                  <span className="font-bold text-sm text-[#8C6D32]">
                                    {formatRupee(item.totalAmount)}
                                  </span>
                                </div>
                                <div className="text-xs text-[#6F6A62] space-y-0.5">
                                  <div>Profile: <strong className="text-[#1C1B19]">{item.design?.name || item.frameDesign}</strong></div>
                                  <div>
                                    Size: <strong className="text-[#1C1B19]">{itemSizeDisplay}</strong> (<span className="capitalize">{item.orientation}</span>)
                                  </div>
                                  <div>
                                    Qty: <strong className="text-[#1C1B19]">{item.quantity || 1}</strong> &bull; Unit: {formatRupee(item.unitPrice)}
                                  </div>
                                </div>

                                <div className="pt-2 flex items-center gap-3 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleEditCartItem(item)}
                                    className="text-[#8C6D32] hover:text-[#C9A669] font-semibold flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <span className="text-[#DCD3C0]">&bull;</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCartItem(item.id)}
                                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Grand Total Summary Box */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-[#E7E0D2] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-[#1C1B19]">
                            {cartItems.length} Handcrafted Heirloom Frames ({totalCartItemsCount} Units)
                          </div>
                          <div className="text-xs text-[#6F6A62]">
                            Includes archival mounting, glass protection, and studio packaging
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#6F6A62] uppercase tracking-wider">Grand Total</div>
                          <div className="text-2xl font-display font-bold text-[#8C6D32]">
                            {formatRupee(cartGrandTotal)}
                          </div>
                        </div>
                      </div>

                      {/* Multi-Item Action Buttons */}
                      <div className="pt-4 border-t border-[#E7E0D2] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={handleCustomizeAnother}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E7E0D2] text-xs font-bold uppercase tracking-wider text-[#2B2B2B] hover:bg-[#F8F6F2] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-[#8C6D32]" />
                          <span>Customize Another Frame</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApproveAndContinue}
                          className="w-full sm:w-auto px-7 py-3 bg-[#1C1B19] hover:bg-[#322F2A] text-[#F8F6F2] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Continue to Customer Details ({formatRupee(cartGrandTotal)})</span>
                          <ChevronRight className="w-4 h-4 text-[#C9A669]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Large Final Preview */}
                      <div className="lg:col-span-5">
                        <FrameLivePreview
                          wood={selectedWood}
                          design={selectedDesign}
                          ratio={selectedRatio}
                          orientation={orientation}
                          photoUrl={uploadedPhoto}
                          photoName={photoFileName}
                          zoom={photoZoom}
                          pan={photoPan}
                          rotation={photoRotation}
                          fitMode={photoFitMode}
                          quantity={quantity}
                          pricing={pricing}
                          showPriceBreakdown={false}
                          isReviewMode={true}
                        />
                      </div>

                      {/* Right: Full Specifications & Pricing Breakdown */}
                      <div className="lg:col-span-7 space-y-5">
                        {/* Specifications Card */}
                        <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E7E0D2] space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B19]">
                            Selected Specifications
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D2]">
                              <span className="text-[10px] uppercase font-bold text-[#8C6D32]">Timber Species</span>
                              <div className="font-bold text-sm text-[#1C1B19] mt-0.5">{selectedWood?.name}</div>
                              <div className="text-[#6F6A62] mt-0.5">{formatRupee(selectedWood?.basePrice)} base price</div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D2]">
                              <span className="text-[10px] uppercase font-bold text-[#8C6D32]">Frame Design Profile</span>
                              <div className="font-bold text-sm text-[#1C1B19] mt-0.5">{selectedDesign?.name}</div>
                              <div className="text-[#6F6A62] mt-0.5">
                                {selectedDesign?.additionalPrice > 0
                                  ? `+${formatRupee(selectedDesign.additionalPrice)} charge`
                                  : "Included (+₹0)"}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D2]">
                              <span className="text-[10px] uppercase font-bold text-[#8C6D32]">Frame Size &amp; Ratio</span>
                              <div className="font-bold text-sm text-[#1C1B19] mt-0.5">
                                {formatRatioDisplayLabel(selectedRatio?.name, orientation)}
                              </div>
                              <div className="text-[#6F6A62] mt-0.5">
                                {formatDimensionsLabel(selectedRatio?.dimensions, orientation)}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D2]">
                              <span className="text-[10px] uppercase font-bold text-[#8C6D32]">Display Orientation</span>
                              <div className="font-bold text-sm text-[#1C1B19] mt-0.5 capitalize">{orientation}</div>
                              <div className="text-[#6F6A62] mt-0.5">Quantity: {quantity} Frame{quantity > 1 ? "s" : ""}</div>
                            </div>
                          </div>

                          {/* Photo Spec Line */}
                          <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D2] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ImageIcon className="w-4 h-4 text-[#C9A669] shrink-0" />
                              <div className="min-w-0 text-xs">
                                <span className="font-bold text-[#1C1B19] truncate block">
                                  {photoFileName || "Uploaded Client Photograph"}
                                </span>
                                <span className="text-[#6F6A62] text-[11px]">
                                  Custom zoom: {Math.round(photoZoom * 100)}% &bull; Rotation: {photoRotation}&deg; &bull; Protected
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleEditCustomization}
                              className="text-xs font-semibold text-[#8C6D32] hover:underline shrink-0"
                            >
                              Edit Photo
                            </button>
                          </div>
                        </div>

                        {/* Pricing Calculation Card */}
                        <div className="bg-white rounded-2xl p-5 border-2 border-[#E7E0D2] shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
                            <span className="font-display font-bold text-base text-[#1C1B19]">
                              Itemized Pricing Summary
                            </span>
                            <span className="text-xs text-[#6F6A62]">INR (₹)</span>
                          </div>

                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex items-center justify-between text-[#2B2B2B]">
                              <span>Wood Base Price ({selectedWood?.name})</span>
                              <span className="font-semibold">{pricing.formattedWoodPrice}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#2B2B2B]">
                              <span>Design Profile ({selectedDesign?.name})</span>
                              <span className="font-semibold">{pricing.formattedDesignPrice}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#2B2B2B]">
                              <span>
                                Size Price ({formatRatioDisplayLabel(selectedRatio?.name, orientation)})
                              </span>
                              <span className="font-semibold">{pricing.formattedRatioPrice}</span>
                            </div>
                            <div className="pt-2 border-t border-[#E7E0D2] flex items-center justify-between text-[#2B2B2B]">
                              <span>Unit Price per Frame</span>
                              <span className="font-bold">{pricing.formattedUnitPrice || formatRupee(pricing.unitPrice)}</span>
                            </div>
                            {quantity > 1 && (
                              <div className="flex items-center justify-between text-[#8C6D32]">
                                <span>Quantity Multiplier</span>
                                <span className="font-bold">&times; {quantity}</span>
                              </div>
                            )}
                            <div className="pt-3 border-t border-[#E7E0D2] flex items-center justify-between text-base sm:text-lg font-bold text-[#1C1B19]">
                              <span>Final Total Amount</span>
                              <span className="text-xl font-display text-[#8C6D32]">
                                {pricing.formattedTotal}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Approval CTA Box */}
                        <div className="pt-4 border-t border-[#E7E0D2] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={handleEditCustomization}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-xs font-bold uppercase tracking-wider text-[#2B2B2B] hover:bg-[#F8F6F2] transition-colors flex items-center justify-center gap-1.5"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCustomizeAnother}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-xs font-bold uppercase tracking-wider text-[#8C6D32] hover:bg-[#F8F6F2] transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Another Frame</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleApproveAndContinue}
                            className="w-full sm:w-auto px-7 py-3 bg-[#1C1B19] hover:bg-[#322F2A] text-[#F8F6F2] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>Yes, This Frame Looks Good — Continue</span>
                            <ChevronRight className="w-4 h-4 text-[#C9A669]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                PAGE 3: CUSTOMER DETAILS & FULFILLMENT FORM
            ========================================================== */}
            {currentStep === 3 && (
              <motion.div
                key="stage-3-details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E7E0D2] shadow-sm space-y-6">
                  <div className="border-b border-[#E7E0D2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1C1B19]">
                        Stage 3: Customer Details &amp; Fulfillment
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6F6A62]">
                        Provide your delivery address or select studio atelier pickup in Tirunelveli or Kalladaikurichi.
                      </p>
                    </div>
                    <div className="text-xs font-semibold px-3 py-1 bg-[#F8F6F2] border border-[#E7E0D2] rounded-full text-[#8C6D32] self-start sm:self-auto">
                      Order Total: {pricing.formattedTotal}
                    </div>
                  </div>

                  {/* Compact Persistent Order Summary Banner */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#E7E0D2] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E7E0D2]/70 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D32]">
                        <Sparkles className="w-4 h-4 text-[#C9A669]" />
                        <span>
                          {cartItems.length > 1
                            ? `Order Summary (${cartItems.length} Frames)`
                            : "Frame Customization Summary"}
                        </span>
                      </div>
                      <span className="text-xs text-[#6F6A62]">
                        Total:{" "}
                        <strong className="text-[#1C1B19]">
                          {formatRupee(cartItems.length > 0 ? cartGrandTotal : pricing.totalAmount)}
                        </strong>
                      </span>
                    </div>

                    {cartItems.length > 1 ? (
                      <div className="space-y-2">
                        {cartItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-[#E7E0D2]/40 last:border-b-0"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#EAE3D2] text-[#8C6D32] text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="truncate">
                                <span className="font-bold text-[#1C1B19]">
                                  {item.wood?.name || item.woodType}
                                </span>{" "}
                                &bull; {item.design?.name || item.frameDesign} &bull;{" "}
                                <span className="text-[#8C6D32] font-semibold">
                                  {formatRatioDisplayLabel(
                                    item.ratio?.name || item.frameRatio,
                                    item.orientation
                                  )}
                                </span>{" "}
                                ({item.orientation})
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="text-[#6F6A62] text-[11px] mr-2">
                                Qty: {item.quantity || 1}
                              </span>
                              <strong className="text-[#1C1B19]">
                                {formatRupee(item.totalAmount)}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EAE3D2] text-[#8C6D32] flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-[#C9A669]" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#1C1B19]">
                              {selectedWood?.name} &bull; {selectedDesign?.name} (
                              {formatRatioDisplayLabel(selectedRatio?.name, orientation)})
                            </div>
                            <div className="text-[#6F6A62] capitalize">
                              {orientation} orientation &bull; Qty: {quantity} &bull; Protected client upload
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] uppercase font-bold text-[#8C6D32]">
                            Authoritative Total
                          </div>
                          <div className="font-display font-bold text-lg text-[#1C1B19]">
                            {pricing.formattedTotal}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kavitha Ramachandran"
                          value={customerForm.name}
                          onChange={(e) => {
                            setCustomerForm((prev) => ({ ...prev, name: e.target.value }));
                            if (formErrors.name) setFormErrors((err) => ({ ...err, name: "" }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                            formErrors.name ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-xs text-red-600">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98401 23456"
                          value={customerForm.phone}
                          onChange={(e) => {
                            setCustomerForm((prev) => ({ ...prev, phone: e.target.value }));
                            if (formErrors.phone) setFormErrors((err) => ({ ...err, phone: "" }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                            formErrors.phone ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-xs text-red-600">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. kavitha@example.com"
                          value={customerForm.email}
                          onChange={(e) => {
                            setCustomerForm((prev) => ({ ...prev, email: e.target.value }));
                            if (formErrors.email) setFormErrors((err) => ({ ...err, email: "" }));
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                            formErrors.email ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-xs text-red-600">{formErrors.email}</p>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                          WhatsApp Number (Optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="Leave blank to use phone number"
                          value={customerForm.whatsapp}
                          onChange={(e) => setCustomerForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
                        />
                      </div>
                    </div>

                    {/* Fulfillment Method Selection */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                        Fulfillment Preference
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setCustomerForm((prev) => ({ ...prev, deliveryType: "Home Delivery" }))}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            customerForm.deliveryType === "Home Delivery"
                              ? "border-[#C9A669] bg-[#FDFBF7] ring-1 ring-[#C9A669]"
                              : "border-[#E7E0D2] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <HomeIcon className="w-5 h-5 text-[#8C6D32] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-sm text-[#1C1B19]">Home Doorstep Delivery</div>
                            <div className="text-xs text-[#6F6A62] mt-0.5">
                              Shipped securely with multi-layer archival foam cushion packaging
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setCustomerForm((prev) => ({ ...prev, deliveryType: "Studio Pickup" }))}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            customerForm.deliveryType === "Studio Pickup"
                              ? "border-[#C9A669] bg-[#FDFBF7] ring-1 ring-[#C9A669]"
                              : "border-[#E7E0D2] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <Building2 className="w-5 h-5 text-[#8C6D32] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-sm text-[#1C1B19]">Studio Atelier Pickup</div>
                            <div className="text-xs text-[#6F6A62] mt-0.5">
                              Collect directly in person from Tirunelveli or Kalladaikurichi branch
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Form Fields OR Branch Selector */}
                    {customerForm.deliveryType === "Home Delivery" ? (
                      <div className="space-y-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                            Street Address / House / Flat <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="House / Flat No, Building Name, Street & Landmark"
                            value={customerForm.address}
                            onChange={(e) => {
                              setCustomerForm((prev) => ({ ...prev, address: e.target.value }));
                              if (formErrors.address) setFormErrors((err) => ({ ...err, address: "" }));
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                              formErrors.address ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                            }`}
                          />
                          {formErrors.address && (
                            <p className="text-xs text-red-600">{formErrors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                              City <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Tirunelveli"
                              value={customerForm.city}
                              onChange={(e) => {
                                setCustomerForm((prev) => ({ ...prev, city: e.target.value }));
                                if (formErrors.city) setFormErrors((err) => ({ ...err, city: "" }));
                              }}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                                formErrors.city ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                              }`}
                            />
                            {formErrors.city && (
                              <p className="text-xs text-red-600">{formErrors.city}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                              District
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Tirunelveli"
                              value={customerForm.district}
                              onChange={(e) => setCustomerForm((prev) => ({ ...prev, district: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                              State <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Tamil Nadu"
                              value={customerForm.state}
                              onChange={(e) => {
                                setCustomerForm((prev) => ({ ...prev, state: e.target.value }));
                                if (formErrors.state) setFormErrors((err) => ({ ...err, state: "" }));
                              }}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                                formErrors.state ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                              }`}
                            />
                            {formErrors.state && (
                              <p className="text-xs text-red-600">{formErrors.state}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                              Pincode <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 627001"
                              value={customerForm.pincode}
                              onChange={(e) => {
                                setCustomerForm((prev) => ({ ...prev, pincode: e.target.value }));
                                if (formErrors.pincode) setFormErrors((err) => ({ ...err, pincode: "" }));
                              }}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] ${
                                formErrors.pincode ? "border-red-400 bg-red-50/40" : "border-[#E7E0D2]"
                              }`}
                            />
                            {formErrors.pincode && (
                              <p className="text-xs text-red-600">{formErrors.pincode}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                          Select Active Pickup Branch <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={customerForm.branchPickup}
                          onChange={(e) => setCustomerForm((prev) => ({ ...prev, branchPickup: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669] bg-white"
                        >
                          {verifiedBranches.map((branch, idx) => (
                            <option key={idx} value={branch.name || `${branch.city} Branch`}>
                              {branch.name || `${branch.city} Studio`} {branch.address ? `— ${branch.address}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Special Instructions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                        Special Instructions / Lab Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Please use luster finish paper, or adjust contrast for evening skin tones"
                        value={customerForm.notes}
                        onChange={(e) => setCustomerForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-4 border-t border-[#E7E0D2] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E7E0D2] text-xs font-bold uppercase tracking-wider text-[#2B2B2B] hover:bg-[#F8F6F2] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Review</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#C9A669] to-[#9C7B3D] hover:brightness-110 text-[#1C1B19] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span>PLACING ORDER...</span>
                        ) : (
                          <>
                            <span>
                              CONFIRM &amp; PLACE ORDER &mdash;{" "}
                              {formatRupee(cartItems.length > 0 ? cartGrandTotal : pricing.totalAmount)}
                            </span>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                PAGE 4: ORDER SUCCESSFUL & ACTIONS
            ========================================================== */}
            {currentStep === 4 && placedOrder && (
              <motion.div
                key="stage-4-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center max-w-lg mx-auto py-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EAE3D2] text-[#8C6D32] mx-auto flex items-center justify-center shadow-inner">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-wider uppercase text-[#1C1B19]">
                    ORDER SUCCESSFUL
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6F6A62]">
                    Your handcrafted heirloom frame order has been placed with Subash Studio atelier.
                  </p>
                </div>

                {/* Order ID Box */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D2] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D32]">
                    Order ID
                  </span>
                  <div className="font-mono text-base sm:text-lg font-bold text-[#1C1B19]">
                    {placedOrder.id}
                  </div>
                </div>

                {/* Compact Order Details Box (Multi-Item or Single Item) */}
                <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E7E0D2] text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                    <span className="text-[#6F6A62] font-medium">Customer:</span>
                    <span className="font-semibold text-[#1C1B19]">{placedOrder.customerName}</span>
                  </div>

                  {placedOrder.items && placedOrder.items.length > 1 ? (
                    <div className="py-2 border-b border-[#E7E0D2]/60 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#8C6D32]">
                        Ordered Frames ({placedOrder.items.length} items)
                      </div>
                      {placedOrder.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#E7E0D2] space-y-1">
                          <div className="flex justify-between items-center font-bold text-[#1C1B19]">
                            <span>
                              #{idx + 1}: {it.wood?.name || it.woodType}
                            </span>
                            <span className="text-[#8C6D32]">{formatRupee(it.totalAmount)}</span>
                          </div>
                          <div className="text-[11px] text-[#6F6A62] flex justify-between">
                            <span>
                              {it.design?.name || it.frameDesign} &bull;{" "}
                              {formatRatioDisplayLabel(it.ratio?.name || it.frameRatio, it.orientation)} (
                              {it.orientation})
                            </span>
                            <span>Qty: {it.quantity || 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62] font-medium">Timber Wood:</span>
                        <span className="font-bold text-[#1C1B19]">{placedOrder.woodType}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62] font-medium">Frame Design:</span>
                        <span className="font-bold text-[#1C1B19]">{placedOrder.frameDesign}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62] font-medium">Size &amp; Orientation:</span>
                        <span className="font-bold text-[#1C1B19]">
                          {formatRatioDisplayLabel(placedOrder.frameRatio, placedOrder.orientation)} &bull;{" "}
                          <span className="capitalize">{placedOrder.orientation}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                        <span className="text-[#6F6A62] font-medium">Quantity:</span>
                        <span className="font-bold text-[#1C1B19]">{placedOrder.quantity || 1} Frame(s)</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center py-1 border-b border-[#E7E0D2]/60">
                    <span className="text-[#6F6A62] font-medium">Fulfillment:</span>
                    <span className="font-medium text-[#1C1B19]">{placedOrder.deliveryType}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 font-bold text-sm">
                    <span className="text-[#1C1B19] uppercase tracking-wider">Final Total:</span>
                    <span className="text-base text-[#8C6D32]">
                      {formatRupee(placedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Primary Actions: WhatsApp, Print Receipt, Order Another, Home */}
                <div className="space-y-3 pt-2">
                  <a
                    href={`https://wa.me/919345706609?text=${encodeURIComponent(
                      placedOrder.items && placedOrder.items.length > 1
                        ? `Hello Subash Studio! I have placed custom frame order ${placedOrder.id} for ${placedOrder.customerName}.\n\nOrdered Frames (${placedOrder.items.length} items):\n${placedOrder.items
                            .map(
                              (it, idx) =>
                                `*Frame #${idx + 1}:* ${it.wood?.name || it.woodType} + ${
                                  it.design?.name || it.frameDesign
                                }, ${formatRatioDisplayLabel(
                                  it.ratio?.name || it.frameRatio,
                                  it.orientation
                                )} (${it.orientation}) × Qty: ${it.quantity || 1} — ${formatRupee(
                                  it.totalAmount
                                )}`
                            )
                            .join("\n")}\n\nGrand Total: ${formatRupee(
                            placedOrder.totalAmount
                          )}\nFulfillment: ${placedOrder.deliveryType}.`
                        : `Hello Subash Studio! I have placed custom frame order ${placedOrder.id} for ${placedOrder.customerName}.\n- Frame: ${placedOrder.woodType} with ${placedOrder.frameDesign}\n- Dimensions: ${formatRatioDisplayLabel(placedOrder.frameRatio, placedOrder.orientation)} (${placedOrder.orientation})\n- Quantity: ${placedOrder.quantity || 1}\n- Total: ${formatRupee(placedOrder.totalAmount)}\n- Fulfillment: ${placedOrder.deliveryType}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-6 bg-[#25D366] text-white hover:bg-[#1EBE5D] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>CONFIRM ORDER ON WHATSAPP</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-3.5 px-6 bg-[#1C1B19] text-[#F8F6F2] hover:bg-[#322F2A] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#C9A669]" />
                    <span>PRINT / DOWNLOAD RECEIPT</span>
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs pt-2">
                    <Link
                      to="/"
                      className="py-2 px-3 font-bold tracking-wider uppercase text-[#6F6A62] hover:text-[#1C1B19] transition-colors"
                    >
                      BACK TO HOME
                    </Link>
                    <span className="text-[#DCD3C0]">&bull;</span>
                    <button
                      type="button"
                      onClick={handleOrderAnother}
                      className="py-2 px-3 font-bold tracking-wider uppercase text-[#8C6D32] hover:text-[#C9A669] transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ORDER ANOTHER FRAME</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onEditItem={handleEditCartItem}
        onProceedToCheckout={() => {
          setCartDrawerOpen(false);
          setCurrentStep(3);
          window.scrollTo({ top: 100, behavior: "smooth" });
        }}
        onCustomizeAnother={handleCustomizeAnother}
      />

      {/* Floating Cart Button for Mobile */}
      {totalCartItemsCount > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-5 right-5 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#1C1B19] text-[#F8F6F2] rounded-full shadow-2xl border border-[#C9A669]/60 text-xs font-bold active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A669]" />
            <span>Cart ({totalCartItemsCount})</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#C9A669] text-[#1C1B19] text-[10px]">
              {formatRupee(cartGrandTotal)}
            </span>
          </button>
        </div>
      )}

      {/* Standalone print-only receipt portal */}
      <FramePrintReceipt order={placedOrder} />
    </>
  );
}
