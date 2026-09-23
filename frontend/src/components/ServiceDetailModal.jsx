import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Check, ArrowRight, Sparkles } from "lucide-react";

/**
 * Service-specific fallback features used ONLY when the database
 * `service.features` array is empty or missing.
 * Database/API values ALWAYS take strict precedence.
 */
const SERVICE_FALLBACK_FEATURES = {
  "wedding-cinematography": [
    "Cinematic storytelling & emotional narrative direction",
    "Full-day multi-camera 4K wedding coverage",
    "Candid emotional moments & vows capture",
    "Ceremony highlights & sacred ritual documentation",
    "Professional color grading & cinematic sound design",
    "Cinematic teaser reel & full-length keepsake film",
  ],
  "wedding-photography": [
    "Full-day documentary & ceremonial coverage",
    "Unscripted candid moments & authentic emotion",
    "Traditional ceremony & sacred rituals documentation",
    "Extended couple creative portraits",
    "Family & guest generational portraits",
    "High-resolution professionally retouched digital gallery",
  ],
  "traditional-photography": [
    "Comprehensive ceremony & ritual documentation",
    "Formal stage portraits & large family group coverage",
    "Muhurtham, reception & religious rites coverage",
    "Dedicated stage & ambient flash lighting setup",
    "High-resolution archive gallery with full guest coverage",
  ],
  "traditional-videography": [
    "Complete ceremony & stage video coverage",
    "Crystal-clear audio capture of mantras and rituals",
    "Uncut archival record of all traditional rites",
    "Multi-angle traditional stage documentation",
    "High-definition video master for family archives",
  ],
  "candid-photography": [
    "Unobtrusive, natural emotional expressions",
    "Spontaneous moments with family and friends",
    "Artistic compositions using natural & ambient light",
    "Zero forced poses — genuine emotions as they happen",
    "Signature editorial color grading & black & white edits",
  ],
  "pre-wedding-shoot": [
    "Curated scenic outdoor or heritage locations",
    "Multiple outfit styling & concept themes",
    "Relaxed, guided couple portraits",
    "Cinematic couple stills & digital lookbook",
    "Teaser imagery for wedding invitations & social media",
  ],
  "post-wedding-shoot": [
    "Relaxed portrait session without wedding-day time pressure",
    "Scenic golden-hour & destination locations",
    "Artistic bridal & groom signature portraits",
    "Customized heirloom album spread imagery",
  ],
  "baby-photography": [
    "Safe, cozy and hygienic studio environment",
    "Gentle natural lighting tailored for newborn & infant comfort",
    "Curated soft wraps, backdrops & heirloom props",
    "Tender milestone expressions & parent bonding moments",
  ],
  "kids-photography": [
    "Fun, playful and patience-driven session",
    "Natural candids capturing innocent laughter & energy",
    "Themed setups and favorite toy interactions",
    "Milestone birthday & growth portraits",
  ],
  "birthday-photography": [
    "Complete party & cake-cutting event coverage",
    "Guest interactions, family portraits & kid games",
    "Venue decoration & theme details documentation",
    "High-energy candids and celebration photos",
  ],
  "maternity-photography": [
    "Graceful portraits celebrating motherhood and new life",
    "Flattering studio lighting & artistic silhouettes",
    "Partner & family inclusion options",
    "Indoor atelier & golden-hour outdoor settings",
  ],
  "puberty-ceremony": [
    "Traditional rites & sacred ritual documentation",
    "Elaborate silk attire & jewelry detail portraits",
    "Family blessings & generational group portraits",
    "Vibrant festive atmosphere & cultural traditions",
  ],
  "house-warming": [
    "Grihapravesam ritual & pooja coverage",
    "Architectural & interior detail photography",
    "Ceremonial homam & auspicious moments documentation",
    "Welcoming guest & family portraiture",
  ],
  "corporate-events": [
    "Keynote speeches, conferences & summit coverage",
    "Professional attendee candids & networking moments",
    "Stage lighting adaptation & branding alignment",
    "Rapid turnaround for PR, social & press releases",
  ],
  "fashion-photography": [
    "Editorial lighting, direction & concept styling",
    "High-end commercial lookbooks & portfolio shoots",
    "Detailed fabric, jewelry & apparel focus",
    "Color-calibrated magazine-ready retouching",
  ],
  "product-photography": [
    "Clean studio tabletop lighting & macro details",
    "White-background e-commerce & contextual lifestyle shots",
    "Consistent color fidelity & shadow control",
    "High-resolution deliverables for web & print catalogs",
  ],
  "drone-photography": [
    "Certified aerial drone cinematography & photography",
    "Grand venue overviews, landscapes & processions",
    "4K aerial vantage points & cinematic pans",
    "Dramatic perspective complementing ground coverage",
  ],
  "live-streaming": [
    "Multi-camera 1080p Full HD live broadcast",
    "Direct crystal-clear audio feed from soundboard",
    "Private YouTube, Zoom, or custom streaming links",
    "Instant access for overseas family and friends",
  ],
  "album-design": [
    "Handcrafted heirloom leather & silk photo albums",
    "Archival museum-grade paper with anti-fade printing",
    "Minimalist, narrative layout design",
    "Durable lay-flat binding with custom embossing",
  ],
};

const GENERIC_FALLBACK_FEATURES = [
  "High-Resolution Edited Digital Stills",
  "Professional Lighting & Audio Setup",
  "Experienced Lead Creatives",
  "Online Client Proofing Gallery",
];

export default function ServiceDetailModal({ isOpen, service, onClose }) {
  const prefersReducedMotion = useReducedMotion();

  // Close on Escape key press & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Determine active description following strict user priority:
  // 1. service.fullDesc
  // 2. service.description
  // 3. service.shortDesc || service.blurb
  const detailedDescription = useMemo(() => {
    if (!service) return "";
    const full = (service.fullDesc || "").trim();
    if (full) return full;
    const desc = (service.description || "").trim();
    if (desc) return desc;
    const short = (service.shortDesc || service.blurb || "").trim();
    return short;
  }, [service]);

  // Optional lead summary if shortDesc exists and differs from fullDesc
  const leadSummary = useMemo(() => {
    if (!service) return "";
    const short = (service.shortDesc || service.blurb || "").trim();
    const full = (service.fullDesc || service.description || "").trim();
    if (short && full && short !== full) {
      return short;
    }
    return "";
  }, [service]);

  // Determine features following strict user priority:
  // 1. service.features from PostgreSQL
  // 2. Fallback ONLY if database features array is genuinely empty/missing
  const resolvedFeatures = useMemo(() => {
    if (!service) return [];
    if (Array.isArray(service.features) && service.features.length > 0) {
      return service.features;
    }
    const slugKey = (service.slug || service.name || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    return SERVICE_FALLBACK_FEATURES[slugKey] || GENERIC_FALLBACK_FEATURES;
  }, [service]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && service && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
        >
          {/* Modal Container */}
          <motion.div
            initial={{
              opacity: 0,
              scale: prefersReducedMotion ? 1 : 0.96,
              y: prefersReducedMotion ? 0 : 16,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: prefersReducedMotion ? 1 : 0.96,
              y: prefersReducedMotion ? 0 : 16,
            }}
            transition={{
              duration: prefersReducedMotion ? 0.05 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#1C1B19] text-[#FAF8F5] rounded-2xl overflow-hidden shadow-2xl border border-[#3A3833] flex flex-col md:flex-row my-auto max-h-[92vh]"
          >
            {/* Close Button (Top-Right) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close service details"
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A669]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column (Desktop) / Top Banner (Mobile): Service Photography */}
            <div className="relative w-full md:w-[42%] shrink-0 h-56 sm:h-72 md:h-auto min-h-[220px] bg-[#141414] overflow-hidden">
              <img
                src={service.image || service.imageUrl || "/images/services/wedding-photography.jpg"}
                alt={service.name || "Subash Studio Service"}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle Atmospheric Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Starting Price Pill (if present) */}
              {service.startingPrice && (
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1C1B19]/90 text-[#E4D3A6] border border-[#C9A669]/40 backdrop-blur-md shadow-md">
                    <Sparkles className="w-3 h-3 text-[#C9A669]" />
                    <span>Starts {service.startingPrice}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Service Content & Actions */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(92vh-14rem)] md:max-h-[92vh]">
              <div>
                {/* Eyebrow Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-px w-6 bg-[#C9A669]/60" />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.25em] font-semibold text-[#C9A669] uppercase">
                    SUBASH STUDIO · BESPOKE SERVICES
                  </p>
                </div>

                {/* Service Title */}
                <h2
                  id="service-modal-title"
                  className="font-display font-bold text-2xl sm:text-3xl text-[#FAF8F5] leading-tight mb-4"
                >
                  {service.name || service.title}
                </h2>

                {/* Optional Lead Summary */}
                {leadSummary && (
                  <p className="text-sm sm:text-base font-serif italic text-[#C9A669] leading-relaxed mb-3">
                    &ldquo;{leadSummary}&rdquo;
                  </p>
                )}

                {/* Detailed Description */}
                <p className="text-xs sm:text-sm text-[#FAF8F5]/80 leading-relaxed mb-6 whitespace-pre-line">
                  {detailedDescription}
                </p>

                {/* Service Features / Key Highlights */}
                {resolvedFeatures && resolvedFeatures.length > 0 && (
                  <div className="pt-4 border-t border-white/10 mb-6">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C9A669] mb-3">
                      Service Highlights &amp; Inclusions
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {resolvedFeatures.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-[#FAF8F5]/85 leading-snug"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#C9A669]/15 border border-[#C9A669]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#C9A669]">
                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
                {/* Secondary: Close Action */}
                <button
                  type="button"
                  onClick={onClose}
                  className="order-2 sm:order-1 px-5 py-2.5 rounded-full border border-white/20 text-xs font-semibold tracking-[0.14em] uppercase text-white/70 hover:text-white hover:border-white/40 transition-colors text-center cursor-pointer"
                >
                  Back to Services
                </button>

                {/* Primary CTA: Existing Book Now Flow */}
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="order-1 sm:order-2 group px-7 py-3 bg-[#B38F4D] hover:bg-[#9C7B3D] text-white rounded-full text-xs font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(179,143,77,0.38)] hover:shadow-lg hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                  />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
