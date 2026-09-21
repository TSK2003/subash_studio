import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import Logomark from "./Logomark";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Footer() {
  const { branches, loading, error, websiteContent } = useAdminData();
  const contactData = websiteContent?.contact || {};
  const primaryPhone = contactData.phone || "+91 93457 06609";
  const phoneHref = "tel:" + primaryPhone.replace(/[^\d+]/g, "");
  const studioEmail = contactData.email || "hello@subashstudio.com";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http") ? whatsappRaw : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;
  const instagramHref = contactData.instagram || "https://www.instagram.com/subash_studio/";
  const facebookHref = contactData.facebook || "https://facebook.com";

  const activeBranches = (branches || []).filter((branch) => branch.active !== false);

  // Responsive grid class determination based on active branch count
  const getGridColsClass = () => {
    if (loading && (!branches || branches.length === 0)) {
      return "lg:grid-cols-4";
    }
    if (error && (!branches || branches.length === 0)) {
      return "lg:grid-cols-4";
    }
    const count = activeBranches.length;
    if (count === 0) return "lg:grid-cols-4";
    if (count === 1) return "lg:grid-cols-3";
    if (count === 2) return "lg:grid-cols-4";
    if (count === 3) return "lg:grid-cols-5";
    return "lg:grid-cols-6";
  };

  const gridColsClass = getGridColsClass();

  return (
    <footer className="bg-[#262626] text-[#FAF8F5]/80 relative z-20">
      <div className={`max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-8 lg:gap-10`}>
        {/* COLUMN 1 — BRAND */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm">
              <Logomark size={28} />
            </div>
            <span className="font-display text-lg tracking-[0.18em] text-[#FAF8F5] font-medium">
              SUBASH STUDIO
            </span>
          </div>

          <p className="text-sm leading-relaxed max-w-sm text-[#FAF8F5]/65 mb-5">
            A fine photography and cinematography studio creating timeless imagery across our studio locations.
          </p>

          <div className="space-y-2 text-xs text-[#FAF8F5]/80 mb-6">
            <a
              href={phoneHref}
              className="flex items-center gap-2.5 hover:text-[#C9A669] transition-colors"
            >
              <Phone size={13} className="text-[#C9A669] shrink-0" />
              <span>{primaryPhone}</span>
            </a>
            <a
              href={`mailto:${studioEmail}`}
              className="flex items-center gap-2.5 hover:text-[#C9A669] transition-colors"
            >
              <Mail size={13} className="text-[#C9A669] shrink-0" />
              <span>{studioEmail}</span>
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaWhatsapp size={15} />
            </a>
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaInstagram size={15} />
            </a>
            <a
              href={facebookHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaFacebookF size={14} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Pinterest"
              className="w-9 h-9 rounded-full border border-white/20 text-[#FAF8F5]/80 flex items-center justify-center hover:border-[#C9A669] hover:text-[#C9A669] transition-colors"
            >
              <FaPinterestP size={14} />
            </a>
          </div>
        </div>

        {/* COLUMN 2 — EXPLORE */}
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669] mb-5">
            EXPLORE
          </h4>
          <ul className="space-y-2.5 text-sm text-[#FAF8F5]/75">
            <li>
              <Link to="/about" className="hover:text-[#C9A669] transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/order-booking" className="hover:text-[#C9A669] transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link to="/frames" className="hover:text-[#C9A669] transition-colors">
                Order Frames
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className="hover:text-[#C9A669] transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-[#C9A669] transition-colors">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/films" className="hover:text-[#C9A669] transition-colors">
                Films
              </Link>
            </li>
            <li>
              <Link to="/branches" className="hover:text-[#C9A669] transition-colors">
                Branches
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#C9A669] transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* LOADING SKELETON */}
        {loading && (!branches || branches.length === 0) && (
          <>
            {[1, 2].map((i) => (
              <div key={`branch-skeleton-${i}`} className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-32 mb-5"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-28"></div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ERROR STATE */}
        {!loading && error && (!branches || branches.length === 0) && (
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669] mb-5">
              STUDIO LOCATIONS
            </h4>
            <div className="space-y-3 text-xs leading-relaxed text-[#FAF8F5]/75">
              <p className="text-[#FAF8F5]/65">
                Unable to load current branch details at this time.
              </p>
              <div className="space-y-1.5 pt-1">
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 hover:text-[#C9A669] transition-colors"
                >
                  <Phone size={13} className="text-[#C9A669] shrink-0" />
                  <span>Call: {primaryPhone}</span>
                </a>
                <a
                  href={`mailto:${studioEmail}`}
                  className="flex items-center gap-2 hover:text-[#C9A669] transition-colors"
                >
                  <Mail size={13} className="text-[#C9A669] shrink-0" />
                  <span>{studioEmail}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && activeBranches.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669] mb-5">
              STUDIO LOCATIONS
            </h4>
            <div className="space-y-3 text-xs leading-relaxed text-[#FAF8F5]/75">
              <p className="text-[#FAF8F5]/65">
                Our studio locations are currently being updated. For bookings, consultations, or studio visits, please reach out to our team directly.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C9A669] hover:text-[#FAF8F5] transition-colors font-medium"
                >
                  <span>Schedule Consultation</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC DATABASE BRANCHES */}
        {!loading && activeBranches.length > 0 &&
          activeBranches.map((branch) => {
            const branchName = (branch.name || `${branch.city || "Studio"} Branch`).toUpperCase();
            return (
              <div key={branch.id || branch.city || branch.name}>
                <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#C9A669] mb-5">
                  {branchName}
                </h4>
                <div className="space-y-3 text-xs leading-relaxed text-[#FAF8F5]/75">
                  {branch.tag && (
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#C9A669]/15 text-[#C9A669] border border-[#C9A669]/30">
                      {branch.tag}
                    </span>
                  )}
                  {branch.address && (
                    <div className="flex items-start gap-2 pt-1">
                      <MapPin size={14} className="text-[#C9A669] shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.hours && (
                    <p className="text-[#FAF8F5]/60 pl-5">{branch.hours}</p>
                  )}
                  {branch.mapsUrl && (
                    <div className="pt-1 pl-5">
                      <a
                        href={branch.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#C9A669] hover:text-[#FAF8F5] transition-colors font-medium"
                      >
                        <span>View on Map</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>

      {/* BOTTOM FOOTER BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FAF8F5]/50 text-center sm:text-left">
          <p>© {new Date().getFullYear()} SUBASH STUDIO. All rights reserved.</p>
          <p className="tracking-wide">Crafted with care, one frame at a time.</p>
        </div>
      </div>
    </footer>
  );
}
