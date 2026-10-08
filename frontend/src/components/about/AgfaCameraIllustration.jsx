/**
 * AgfaCameraIllustration.jsx
 * Clean gold line illustration of the vintage Agfa Click III camera matching the design reference.
 */
export default function AgfaCameraIllustration({ className = "w-64 h-auto mx-auto text-[#C9A669]" }) {
  return (
    <svg
      viewBox="0 0 280 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Agfa Click III camera illustration"
    >
      {/* Top Plate & Controls */}
      <path
        d="M 52 46 L 228 46 L 224 54 L 56 54 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Shutter Button (Right side top) */}
      <rect
        x="202"
        y="34"
        width="14"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <line x1="200" y1="46" x2="218" y2="46" stroke="currentColor" strokeWidth="1.5" />

      {/* Film Winder Knob (Left side top) */}
      <rect
        x="64"
        y="32"
        width="22"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <line x1="68" y1="36" x2="82" y2="36" stroke="currentColor" strokeWidth="1.2" />
      <line x1="68" y1="40" x2="82" y2="40" stroke="currentColor" strokeWidth="1.2" />

      {/* Viewfinder Window Top Housing (Center) */}
      <path
        d="M 118 46 L 122 36 L 158 36 L 162 46 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <rect
        x="130"
        y="40"
        width="20"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Main Camera Body (Rounded Rectangle) */}
      <rect
        x="24"
        y="54"
        width="232"
        height="112"
        rx="10"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Inner Decorative Texture Border / Leatherette Panels */}
      <rect
        x="32"
        y="62"
        width="216"
        height="96"
        rx="7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 2"
        opacity="0.65"
      />

      {/* Left Grip Texture Accent Lines */}
      <line x1="42" y1="74" x2="42" y2="146" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <line x1="48" y1="74" x2="48" y2="146" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />

      {/* Right Grip Texture Accent Lines */}
      <line x1="238" y1="74" x2="238" y2="146" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <line x1="232" y1="74" x2="232" y2="146" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />

      {/* Central Lens Housing - Outer Bezel Ring */}
      <circle
        cx="140"
        cy="110"
        r="44"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Stepped Ring */}
      <circle
        cx="140"
        cy="110"
        r="39"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Aperture / Shutter Speed Ring */}
      <circle
        cx="140"
        cy="110"
        r="33"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Lens Optical Element Glass */}
      <circle
        cx="140"
        cy="110"
        r="24"
        stroke="currentColor"
        strokeWidth="1.75"
      />

      {/* Inner Lens Reflection / Center Core */}
      <circle
        cx="140"
        cy="110"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <circle
        cx="140"
        cy="110"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Subtle Lens Glare Curved Highlight */}
      <path
        d="M 126 98 A 18 18 0 0 1 154 98"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Viewfinder Front Window */}
      <rect
        x="50"
        y="68"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="53"
        y="71"
        width="12"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />

      {/* Flash Sync / Agfa Badge Accent */}
      <circle
        cx="212"
        cy="74"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="212"
        cy="74"
        r="2"
        fill="currentColor"
        opacity="0.8"
      />

      {/* Bottom Camera Feet */}
      <rect x="56" y="166" width="24" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="200" y="166" width="24" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
