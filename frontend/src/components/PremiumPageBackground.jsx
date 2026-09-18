import { useLocation } from "react-router-dom";

/**
 * PremiumPageBackground
 *
 * Master global background system for SUBASH STUDIO.
 * Uses the exact client-supplied master background asset:
 *   /images/backgrounds/subash-premium-background.webp
 *
 * Architectural Features:
 * - Fixed full-viewport layer so long pages (3,000px–6,000px) never vertically stretch or distort the artwork.
 * - Desktop (>= 1024px): Dual-wing edge architecture scaled to 100vh contain.
 *   Anchors top-left botanical & bottom-left filmstrip ribbon on the left edge,
 *   and top-right filmstrip ribbon & bottom-right botanical sprigs on the right edge.
 *   Gentle linear gradient masks fade seamlessly into the center warm ivory (#FAF7F2) negative space.
 * - Mobile / Tablet (< 1024px): Full portrait cover framing where corner motifs frame phone screens naturally.
 * - Controlled visual subtlety: Visible botanical & filmstrip elements without washing them out.
 */
export default function PremiumPageBackground({
  variant = "default", // "default" | "subtle" | "admin" | "login"
  className = "",
}) {
  const location = useLocation();
  const pathname = location?.pathname || "";

  // Auto-tune subtlety for photo-first pages (Portfolio / Gallery / Films)
  const isPhotoPage =
    variant === "subtle" ||
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/films");

  const isAdminDashboard =
    variant === "admin" ||
    (pathname.startsWith("/admin") && pathname !== "/admin/login");
  const isAdminLogin = variant === "login" || pathname === "/admin/login";

  // Calibrated opacities so the background art is CLEARLY visible
  // while keeping content/cards readable
  let artworkOpacity = "opacity-100"; // default public pages: flowers, gold lines & filmstrip clearly and beautifully visible

  if (isPhotoPage) {
    artworkOpacity = "opacity-90"; // photo gallery: slightly softer so photos dominate
  } else if (isAdminDashboard) {
    artworkOpacity = "opacity-30"; // admin dashboard: subtle hint of texture behind data tables
  } else if (isAdminLogin) {
    artworkOpacity = "opacity-100"; // login: full presence
  }

  return (
    <div
      className={`page-background-root fixed inset-0 pointer-events-none select-none z-0 overflow-hidden ${
        isAdminDashboard ? "bg-transparent" : "bg-[#FAF7F2]"
      } ${className}`}
      aria-hidden="true"
    >
      {/* =========================================================
          1. MOBILE & TABLET VIEW ( < 1024px )
          Natural portrait cover using tall mobile artwork (455x1024)
      ========================================================= */}
      <div
        className={`lg:hidden absolute inset-0 bg-cover bg-center bg-no-repeat ${artworkOpacity} transition-opacity duration-500`}
        style={{
          backgroundImage: `url('/images/backgrounds/subash-bg-tall.webp')`,
        }}
      />

      {/* =========================================================
          2. DESKTOP WIDESCREEN VIEW ( >= 1024px )
          True Dual-Wing Architecture using wide desktop artwork (682x1024):
          - Left wing: Left side (golden olive leaves, photographer profile, gold wave) anchored to left edge
          - Right wing: Right side (wedding photo wall, DSLR camera, romantic couple prints) anchored to right edge
          - Center: Seamless fade into clean #FAF7F2 ivory reading canvas
      ========================================================= */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {/* Left Wing */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-[calc(100vh*0.666*0.75)] max-w-[580px] bg-no-repeat bg-left-top ${artworkOpacity} transition-opacity duration-500`}
          style={{
            backgroundImage: `url('/images/backgrounds/subash-bg-wide.webp')`,
            backgroundSize: "calc(100vh * 0.666) 100vh",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Right Wing */}
        <div
          className={`absolute top-0 bottom-0 right-0 w-[calc(100vh*0.666*0.75)] max-w-[580px] bg-no-repeat bg-right-top ${artworkOpacity} transition-opacity duration-500`}
          style={{
            backgroundImage: `url('/images/backgrounds/subash-bg-wide.webp')`,
            backgroundSize: "calc(100vh * 0.666) 100vh",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}
