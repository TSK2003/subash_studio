import { useMemo, useRef, useState, useEffect } from "react";
import { Image as ImageIcon, Sparkles, Move, ZoomIn, Lock } from "lucide-react";
import { formatRupee } from "../../lib/framePricing";
import { formatRatioDisplayLabel } from "../../lib/frameDimensions";

/**
 * Parses ratio strings like "8 × 10", "10x12", "4 x 6" to a CSS aspect-ratio value,
 * adjusted dynamically for portrait or landscape orientation.
 */
export function getFrameAspectRatio(ratioString, orientation = "portrait") {
  let w = 4;
  let h = 5;

  if (ratioString) {
    const match = String(ratioString).match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      const parsedW = parseFloat(match[1]);
      const parsedH = parseFloat(match[2]);
      if (parsedW > 0 && parsedH > 0) {
        // Standard convention: smaller number is width, larger is height in portrait
        w = Math.min(parsedW, parsedH);
        h = Math.max(parsedW, parsedH);
      }
    }
  }

  if (orientation === "landscape") {
    return `${h} / ${w}`;
  }
  return `${w} / ${h}`;
}

/**
 * Wood fallback gradient styling when texture image is loading or unavailable
 */
export function getWoodFallbackStyle(woodName = "") {
  const name = String(woodName || "").toLowerCase();
  if (name.includes("rose")) {
    return {
      backgroundImage: "linear-gradient(135deg, #4A1E18 0%, #30130F 50%, #1F0B08 100%)",
      color: "#F8F6F2",
    };
  }
  if (name.includes("teak")) {
    return {
      backgroundImage: "linear-gradient(135deg, #8B5A2B 0%, #653E1B 50%, #47290F 100%)",
      color: "#F8F6F2",
    };
  }
  if (name.includes("pine")) {
    return {
      backgroundImage: "linear-gradient(135deg, #D8B27C 0%, #B88E52 50%, #94713E 100%)",
      color: "#1C1B19",
    };
  }
  if (name.includes("black")) {
    return {
      backgroundImage: "linear-gradient(135deg, #2D2B29 0%, #1A1918 50%, #0F0E0E 100%)",
      color: "#F8F6F2",
    };
  }
  if (name.includes("walnut")) {
    return {
      backgroundImage: "linear-gradient(135deg, #42291B 0%, #2D1A10 50%, #1B0F08 100%)",
      color: "#F8F6F2",
    };
  }
  return {
    backgroundImage: "linear-gradient(135deg, #6E4723 0%, #4D3016 50%, #331E0C 100%)",
    color: "#F8F6F2",
  };
}

/**
 * Returns design profile styling (Classic Gold, Modern Black, Vintage Brown, Minimal White)
 */
export function getDesignProfileStyle(designName = "") {
  const name = String(designName || "").toLowerCase();
  if (name.includes("gold")) {
    return {
      innerBorder: "3px solid #C9A669",
      boxShadow: "inset 0 0 10px rgba(201,166,105,0.7), 0 0 6px rgba(156,123,61,0.4)",
      finishOverlay: "linear-gradient(135deg, rgba(201,166,105,0.22) 0%, rgba(156,123,61,0.08) 100%)",
      matBackground: "#FAF8F5",
      accentTitle: "Classic Gold Foil Lip",
    };
  }
  if (name.includes("black")) {
    return {
      innerBorder: "2.5px solid #141312",
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
      finishOverlay: "linear-gradient(135deg, rgba(20,20,20,0.4) 0%, rgba(0,0,0,0.7) 100%)",
      matBackground: "#F5F3ED",
      accentTitle: "Matte Ebony Bevel",
    };
  }
  if (name.includes("vintage")) {
    return {
      innerBorder: "3.5px double #523520",
      boxShadow: "inset 0 0 12px rgba(0,0,0,0.75), inset 0 2px 4px rgba(255,255,255,0.15)",
      finishOverlay: "linear-gradient(135deg, rgba(82,53,32,0.35) 0%, rgba(30,15,8,0.6) 100%)",
      matBackground: "#EFEAE1",
      accentTitle: "Antique Heritage Patina",
    };
  }
  if (name.includes("white")) {
    return {
      innerBorder: "2.5px solid #EAE5D9",
      boxShadow: "inset 0 1px 5px rgba(0,0,0,0.12)",
      finishOverlay: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,242,235,0.3) 100%)",
      matBackground: "#FFFFFF",
      accentTitle: "Gallery White Lip",
    };
  }
  return {
    innerBorder: "2px solid #DCD3C0",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3)",
    finishOverlay: "transparent",
    matBackground: "#FAF8F5",
    accentTitle: "Standard Artisan Finish",
  };
}

export default function FrameLivePreview({
  wood,
  design,
  ratio,
  orientation = "portrait",
  photoUrl,
  photoName,
  zoom = 1,
  pan = { x: 0, y: 0 },
  rotation = 0,
  fitMode = "fill",
  quantity = 1,
  pricing,
  onPanChange,
  className = "",
  showPriceBreakdown = true,
  isReviewMode = false,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const aspectRatio = useMemo(() => {
    return getFrameAspectRatio(ratio?.name, orientation);
  }, [ratio?.name, orientation]);

  const woodFallback = useMemo(() => getWoodFallbackStyle(wood?.name), [wood?.name]);
  const designProfile = useMemo(() => getDesignProfileStyle(design?.name), [design?.name]);

  // Handle interactive direct drag-to-pan on the preview image
  const handleMouseDown = (e) => {
    if (!photoUrl || !onPanChange) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan?.x || 0,
      panY: pan?.y || 0,
    };
  };

  const handleTouchStart = (e) => {
    if (!photoUrl || !onPanChange || !e.touches[0]) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      panX: pan?.x || 0,
      panY: pan?.y || 0,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!onPanChange) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      onPanChange({
        x: Math.round(dragStartRef.current.panX + dx),
        y: Math.round(dragStartRef.current.panY + dy),
      });
    };

    const handleTouchMove = (e) => {
      if (!onPanChange || !e.touches[0]) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      onPanChange({
        x: Math.round(dragStartRef.current.panX + dx),
        y: Math.round(dragStartRef.current.panY + dy),
      });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, onPanChange]);

  const woodTexture = wood?.image || "";
  const designTexture = design?.image || "";

  // Dynamic max-width based on orientation to provide a balanced stage appearance
  const frameMaxWidth = orientation === "landscape" ? "max-w-[420px]" : "max-w-[340px]";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Artisan Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A669]" />
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[#8C6D32]">
            {isReviewMode ? "Final Artisan Frame Specification" : "Live Artisan Frame Preview"}
          </span>
        </div>
        <div className="text-[10px] font-semibold text-[#6F6A62] capitalize bg-[#EFE9DD] px-2.5 py-0.5 rounded-full border border-[#DCD3C0]">
          {orientation} &bull; {formatRatioDisplayLabel(ratio?.name, orientation) || "Size"}
        </div>
      </div>

      {/* Frame Wall Stage Container */}
      <div
        ref={containerRef}
        className="p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#ECE7DC] border border-[#E7E0D2] flex flex-col items-center justify-center shadow-inner relative overflow-hidden transition-all duration-300"
      >
        {/* Realistic Outer Timber Frame */}
        <div
          className={`relative w-full ${frameMaxWidth} rounded-sm p-4 sm:p-5 transition-all duration-300 select-none`}
          style={{
            color: woodFallback.color,
            backgroundImage: woodTexture ? `url(${woodTexture})` : woodFallback.backgroundImage,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow:
              "0 24px 48px -12px rgba(0, 0, 0, 0.45), 0 10px 20px -4px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.35), inset -1px -1px 3px rgba(0, 0, 0, 0.6)",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Outer Frame Wood Bevel & 3D Lighting Overlay */}
          <div className="absolute inset-0 rounded-sm pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-black/40" />

          {/* Design Profile Layer & Accent Inlay */}
          <div
            className="relative rounded-sm p-2 sm:p-2.5 transition-all overflow-hidden"
            style={{
              backgroundColor: designProfile.matBackground,
              border: designProfile.innerBorder,
              boxShadow: designProfile.boxShadow,
            }}
          >
            {/* Design Profile Texture / Finish Overlay */}
            {designTexture ? (
              <div
                className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply"
                style={{
                  backgroundImage: `url(${designTexture})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: designProfile.finishOverlay,
                }}
              />
            )}

            {/* Museum Matboard Opening with 45° Bevel Cut Shadow */}
            <div
              className={`relative w-full overflow-hidden bg-[#24221F] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] border border-[#DCD3C0] transition-[aspect-ratio] duration-300 select-none ${
                photoUrl && onPanChange ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
              }`}
              style={{
                aspectRatio,
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Customer Photo */}
              {photoUrl ? (
                <div className="relative w-full h-full overflow-hidden select-none">
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-75"
                    style={{
                      transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px) scale(${zoom || 1}) rotate(${rotation || 0}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={photoName || "Customer framed photograph"}
                      className={`w-full h-full select-none pointer-events-none ${
                        fitMode === "contain" ? "object-contain" : "object-cover"
                      }`}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>

                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/10">
                    <div className="px-3.5 py-1.5 rounded-lg bg-black/45 backdrop-blur-[2px] border border-white/20 text-white/85 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-center rotate-[-12deg] shadow-lg">
                      SUBASH STUDIO &bull; ATELIER PREVIEW
                    </div>
                  </div>

                  {/* Interactive Drag Tip Hint (only in customize mode) */}
                  {!isReviewMode && onPanChange && (
                    <div className="absolute bottom-2 right-2 pointer-events-none select-none bg-black/60 backdrop-blur-sm text-white/90 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 opacity-70">
                      <Move className="w-2.5 h-2.5" />
                      <span>Drag to Pan</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Placeholder State */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F7F4EE] text-[#8C6D32] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#EAE3D2] flex items-center justify-center text-[#8C6D32]/70">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C1B19]">Photograph Needed</div>
                    <p className="text-[11px] text-[#6F6A62] mt-0.5 max-w-[200px] leading-tight">
                      Upload your portrait on the left to see it beautifully framed in real time.
                    </p>
                  </div>
                </div>
              )}

              {/* Protective Fine Art Glass Sheen Reflection */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay select-none"
                style={{
                  background:
                    "linear-gradient(130deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Protection Note Under Frame */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#8C6D32] mt-3">
          <Lock className="w-3 h-3 text-[#C9A669]" />
          <span>Client-side protected canvas &bull; Direct image saving disabled</span>
        </div>
      </div>

      {/* Selected Configuration Summary Caption */}
      <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E7E0D2] text-center space-y-1">
        <div className="text-xs sm:text-sm font-bold text-[#1C1B19]">
          {wood?.name || "Select Wood"} &bull; {design?.name || "Select Design"} &bull; {formatRatioDisplayLabel(ratio?.name, orientation) || "Select Size"}
        </div>
        <div className="text-[11px] text-[#6F6A62] flex items-center justify-center gap-2">
          <span>Orientation: <strong className="capitalize text-[#1C1B19]">{orientation}</strong></span>
          <span>&bull;</span>
          <span>Qty: <strong className="text-[#1C1B19]">{quantity}</strong></span>
        </div>
      </div>

      {/* Live Itemized Pricing Breakdown */}
      {showPriceBreakdown && pricing && (
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D2] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B19]">
              Live Price Breakdown
            </span>
            <span className="text-[10px] font-semibold text-[#8C6D32]">INR (₹) Authoritative</span>
          </div>

          <div className="space-y-1.5 text-xs text-[#2B2B2B]">
            <div className="flex items-center justify-between">
              <span className="text-[#6F6A62]">Wood Base Price ({wood?.name || "Timber"})</span>
              <span className="font-semibold">{pricing.formattedWoodPrice}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F6A62]">Frame Design ({design?.name || "Finish"})</span>
              <span className="font-semibold">
                {pricing.designPrice > 0 ? `+${pricing.formattedDesignPrice}` : "₹0 (Included)"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F6A62]">Size ({formatRatioDisplayLabel(ratio?.name, orientation) || "Proportions"})</span>
              <span className="font-semibold">{pricing.formattedRatioPrice}</span>
            </div>

            <div className="pt-2 border-t border-[#E7E0D2]/80 flex items-center justify-between font-medium">
              <span className="text-[#6F6A62]">Subtotal (1 Frame)</span>
              <span className="font-bold">{pricing.formattedSubtotal || pricing.formattedUnitPrice || formatRupee(pricing.unitPrice)}</span>
            </div>

            {quantity > 1 && (
              <div className="flex items-center justify-between text-[#8C6D32]">
                <span>Quantity Multiplier</span>
                <span className="font-bold">&times; {quantity}</span>
              </div>
            )}

            <div className="pt-2.5 border-t-2 border-[#E7E0D2] flex items-center justify-between text-sm sm:text-base font-bold text-[#1C1B19]">
              <div>
                <span>Total Amount</span>
                <span className="block text-[10px] font-normal text-[#6F6A62]">All taxes & studio packaging included</span>
              </div>
              <span className="text-lg sm:text-xl font-display text-[#8C6D32]">
                {pricing.formattedTotal}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
