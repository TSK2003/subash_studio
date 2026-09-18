import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Crop,
} from "lucide-react";
import DirectionalPanControl from "./DirectionalPanControl";

export default function PhotoAdjusterControls({
  zoom = 1,
  pan = { x: 0, y: 0 },
  rotation = 0,
  fitMode = "fill",
  disabled = false,
  onZoomChange,
  onPanChange,
  onRotationChange,
  onFitModeChange,
  onReset,
}) {
  const handleZoomIn = () => {
    if (disabled || !onZoomChange) return;
    onZoomChange(Math.min(3, +(zoom + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    if (disabled || !onZoomChange) return;
    onZoomChange(Math.max(1, +(zoom - 0.15).toFixed(2)));
  };

  const handleRotate = () => {
    if (disabled || !onRotationChange) return;
    onRotationChange((rotation + 90) % 360);
  };

  const isAdjusted =
    zoom !== 1 ||
    pan.x !== 0 ||
    pan.y !== 0 ||
    rotation !== 0 ||
    fitMode !== "fill";

  return (
    <div
      className={`bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#E7E0D2] space-y-5 transition-opacity ${
        disabled ? "opacity-50 pointer-events-none select-none" : "opacity-100"
      }`}
    >
      {/* Panel Header with Section Title and Quick Reset */}
      <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-[#8C6D32]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B19]">
            Photo Positioning &amp; Crop Adjustments
          </h4>
        </div>
        <button
          type="button"
          disabled={disabled || !isAdjusted}
          onClick={onReset}
          className="text-[11px] font-semibold text-[#8C6D32] hover:text-[#C9A669] flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white border border-transparent hover:border-[#E7E0D2] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Reset to default framing"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column (7 cols): Sizing, Fit, Rotate */}
        <div className="md:col-span-7 space-y-4">
          {/* 1. Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C1B19] flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#8C6D32]" />
                <span>Zoom Scale</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6A62] bg-white px-2 py-0.5 rounded border border-[#E7E0D2]">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={disabled || zoom <= 1}
                className="w-8 h-8 rounded-lg bg-white border border-[#E7E0D2] text-[#1C1B19] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                disabled={disabled}
                value={zoom}
                onChange={(e) => onZoomChange && onZoomChange(parseFloat(e.target.value))}
                className="w-full accent-[#8C6D32] cursor-pointer h-1.5 bg-[#E7E0D2] rounded-lg disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={disabled || zoom >= 3}
                className="w-8 h-8 rounded-lg bg-white border border-[#E7E0D2] text-[#1C1B19] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Fit vs Fill Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C1B19]">Framing Fit Mode</span>
              <span className="text-[10px] text-[#6F6A62]">Viewport Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onFitModeChange && onFitModeChange("fill")}
                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  fitMode === "fill"
                    ? "border-[#C9A669] bg-[#1C1B19] text-[#F8F6F2] shadow-sm"
                    : "border-[#E7E0D2] bg-white text-[#2B2B2B] hover:bg-[#F4EFE6]"
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fill Frame</span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onFitModeChange && onFitModeChange("contain")}
                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  fitMode === "contain"
                    ? "border-[#C9A669] bg-[#1C1B19] text-[#F8F6F2] shadow-sm"
                    : "border-[#E7E0D2] bg-white text-[#2B2B2B] hover:bg-[#F4EFE6]"
                }`}
              >
                <Minimize2 className="w-3 h-3" />
                <span>Fit Entire Photo</span>
              </button>
            </div>
          </div>

          {/* 3. Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C1B19] flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#8C6D32]" />
                <span>Rotate Orientation</span>
              </span>
              <span className="font-mono text-[11px] text-[#6F6A62] bg-white px-2 py-0.5 rounded border border-[#E7E0D2]">
                {rotation}&deg;
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={handleRotate}
                className="flex-1 py-1.5 px-3 rounded-xl border border-[#E7E0D2] bg-white hover:bg-[#F0EBE0] text-xs font-semibold text-[#1C1B19] flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#8C6D32]" />
                <span>Rotate 90&deg;</span>
              </button>

              {rotation !== 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRotationChange && onRotationChange(0)}
                  className="py-1.5 px-2.5 rounded-xl border border-[#E7E0D2] bg-white hover:bg-[#F0EBE0] text-[11px] text-[#6F6A62] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Reset angle to 0°"
                >
                  0&deg;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Directional Buttons */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#E7E0D2] shadow-sm space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B19]">
            Position &amp; Nudge
          </div>
          <DirectionalPanControl
            pan={pan}
            onPanChange={onPanChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
