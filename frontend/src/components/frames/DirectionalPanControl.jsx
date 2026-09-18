import { useRef, useCallback, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const NUDGE_STEP = 15; // pixels per discrete click
const HOLD_INITIAL_DELAY = 260; // ms before continuous glide starts
const HOLD_INTERVAL = 45; // ms between continuous steps
const HOLD_STEP = 6; // pixels per continuous step
const MAX_PAN = 250; // boundary clamp in pixels

/**
 * DirectionalPanControl
 * Premium button-based directional pan control for fine photograph framing.
 * Layout:
 *         [ ↑ ]
 * [ ← ]   [ ○ ]   [ → ]
 *         [ ↓ ]
 */
export default function DirectionalPanControl({
  pan = { x: 0, y: 0 },
  onPanChange,
  disabled = false,
}) {
  const panRef = useRef(pan);
  panRef.current = pan;

  const repeatTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);

  // Stop any active continuous pan timer
  const stopContinuousPan = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => stopContinuousPan();
  }, [stopContinuousPan]);

  // Apply a delta step to the current pan
  const applyNudge = useCallback(
    (dx, dy) => {
      if (disabled || !onPanChange) return;
      const current = panRef.current || { x: 0, y: 0 };
      const nextX = Math.max(-MAX_PAN, Math.min(MAX_PAN, current.x + dx));
      const nextY = Math.max(-MAX_PAN, Math.min(MAX_PAN, current.y + dy));
      onPanChange({ x: nextX, y: nextY });
    },
    [disabled, onPanChange]
  );

  // Direction handlers for discrete and continuous actions
  const getDirectionDelta = (dir, isContinuous = false) => {
    const step = isContinuous ? HOLD_STEP : NUDGE_STEP;
    switch (dir) {
      case "up":
        return { dx: 0, dy: -step };
      case "down":
        return { dx: 0, dy: step };
      case "left":
        return { dx: -step, dy: 0 };
      case "right":
        return { dx: step, dy: 0 };
      default:
        return { dx: 0, dy: 0 };
    }
  };

  const handlePointerDown = (dir) => {
    if (disabled) return;
    stopContinuousPan();

    // 1. Trigger single initial nudge immediately
    const initial = getDirectionDelta(dir, false);
    applyNudge(initial.dx, initial.dy);

    // 2. Schedule continuous gliding if held
    repeatTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(() => {
        const continuous = getDirectionDelta(dir, true);
        applyNudge(continuous.dx, continuous.dy);
      }, HOLD_INTERVAL);
    }, HOLD_INITIAL_DELAY);
  };

  const handlePointerUp = () => {
    stopContinuousPan();
  };

  const handleRecenter = () => {
    if (disabled || !onPanChange) return;
    stopContinuousPan();
    onPanChange({ x: 0, y: 0 });
  };

  const isShifted = pan.x !== 0 || pan.y !== 0;

  return (
    <div className="flex flex-col items-center space-y-3 select-none">
      {/* 3x3 Button Directional Pad */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#F4EFE6] rounded-2xl border border-[#E7E0D2] shadow-inner">
        {/* Row 1: Empty | Up | Empty */}
        <div />
        <button
          type="button"
          disabled={disabled}
          onMouseDown={() => handlePointerDown("up")}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown("up");
          }}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F5] active:bg-[#ECE6DA] border border-[#E7E0D2] hover:border-[#C9A669] text-[#1C1B19] shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#C9A669]/50"
          title="Nudge Photo Up"
          aria-label="Nudge Photo Up"
        >
          <ChevronUp className="w-5 h-5 text-[#2B2B2B] group-hover:text-[#8C6D32] transition-colors" />
        </button>
        <div />

        {/* Row 2: Left | Center (Recenter) | Right */}
        <button
          type="button"
          disabled={disabled}
          onMouseDown={() => handlePointerDown("left")}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown("left");
          }}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F5] active:bg-[#ECE6DA] border border-[#E7E0D2] hover:border-[#C9A669] text-[#1C1B19] shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#C9A669]/50"
          title="Nudge Photo Left"
          aria-label="Nudge Photo Left"
        >
          <ChevronLeft className="w-5 h-5 text-[#2B2B2B] group-hover:text-[#8C6D32] transition-colors" />
        </button>

        <button
          type="button"
          disabled={disabled || !isShifted}
          onClick={handleRecenter}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F5] active:bg-[#ECE6DA] border border-[#E7E0D2] hover:border-[#C9A669] text-[#1C1B19] shadow-sm flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#C9A669]/50"
          title="Recenter Photo (0, 0)"
          aria-label="Recenter Photo"
        >
          <RotateCcw className="w-4 h-4 text-[#8C6D32] group-hover:rotate-[-90deg] transition-transform" />
          <span className="text-[8px] font-bold tracking-tighter text-[#8C6D32] uppercase leading-none mt-0.5">
            Center
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onMouseDown={() => handlePointerDown("right")}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown("right");
          }}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F5] active:bg-[#ECE6DA] border border-[#E7E0D2] hover:border-[#C9A669] text-[#1C1B19] shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#C9A669]/50"
          title="Nudge Photo Right"
          aria-label="Nudge Photo Right"
        >
          <ChevronRight className="w-5 h-5 text-[#2B2B2B] group-hover:text-[#8C6D32] transition-colors" />
        </button>

        {/* Row 3: Empty | Down | Empty */}
        <div />
        <button
          type="button"
          disabled={disabled}
          onMouseDown={() => handlePointerDown("down")}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown("down");
          }}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white hover:bg-[#FAF8F5] active:bg-[#ECE6DA] border border-[#E7E0D2] hover:border-[#C9A669] text-[#1C1B19] shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#C9A669]/50"
          title="Nudge Photo Down"
          aria-label="Nudge Photo Down"
        >
          <ChevronDown className="w-5 h-5 text-[#2B2B2B] group-hover:text-[#8C6D32] transition-colors" />
        </button>
        <div />
      </div>

      {/* Position Coordinates & Microcopy */}
      <div className="text-center space-y-0.5">
        <div className="text-[11px] font-mono font-semibold text-[#8C6D32] bg-white px-2.5 py-0.5 rounded-full border border-[#E7E0D2] inline-block shadow-xs">
          X: {pan.x > 0 ? `+${pan.x}` : pan.x}px &bull; Y: {pan.y > 0 ? `+${pan.y}` : pan.y}px
        </div>
        <div className="text-[10px] text-[#9E988E]">
          Tap to nudge &bull; Hold to glide
        </div>
      </div>
    </div>
  );
}
