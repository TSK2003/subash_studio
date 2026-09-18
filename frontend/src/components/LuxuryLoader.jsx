export default function LuxuryLoader({ label = "Loading Subash Studio..." }) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
        {/* Subtle pulsing background ring */}
        <div className="absolute inset-0 rounded-full border border-gold/20 animate-ping opacity-25" />
        {/* Rotating luxury gold spinner */}
        <div className="w-12 h-12 rounded-full border-2 border-line border-t-gold animate-spin" />
        {/* Center accent */}
        <div className="absolute w-2 h-2 rounded-full bg-gold" />
      </div>
      <p className="font-display text-xs tracking-widest2 uppercase text-ink-soft">
        Subash Studio
      </p>
    </div>
  );
}
