import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Menu, X, ChevronDown, Camera, Frame, ArrowRight } from "lucide-react";
import { useAdminData } from "../admin/context/AdminDataContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/order-booking", label: "Services", hasDropdown: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/gallery", label: "Gallery" },
  { to: "/films", label: "Films" },
  { to: "/branches", label: "Branches" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ introActive = false, brandReady = false }) {
  const { websiteContent } = useAdminData();
  const contactData = websiteContent?.contact || {};
  const instagramHref = contactData.instagram || "https://www.instagram.com/subash_studio/";
  const whatsappRaw = contactData.whatsapp || "+91 93457 06609";
  const whatsappHref = whatsappRaw.startsWith("http") ? whatsappRaw : `https://wa.me/${whatsappRaw.replace(/\D/g, "")}`;

  const location = useLocation();
  const [visible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isServicesActive =
    location.pathname === "/order-booking" ||
    location.pathname === "/services" ||
    location.pathname === "/frames";

  const isIntroHidden = introActive && !brandReady;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.header
            initial={introActive ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              isIntroHidden
                ? "bg-transparent border-transparent shadow-none backdrop-blur-none pointer-events-none"
                : scrolled
                ? "bg-[#141311]/92 backdrop-blur-md border-b border-white/10 shadow-lg"
                : "bg-black/35 backdrop-blur-md border-b border-white/10"
            }`}
            style={{
              backgroundColor: isIntroHidden
                ? "transparent"
                : scrolled
                ? "rgba(20, 19, 17, 0.92)"
                : "rgba(0, 0, 0, 0.38)",
            }}
          >
            <div className="w-full px-4 sm:px-6 lg:px-10 h-[84px] flex items-center justify-between">
              {/* Brand Logo & Name (Screenshot 1) */}
              <Link
                to="/"
                id="navbar-brand-logo"
                className={`flex items-center gap-2.5 sm:gap-3 group shrink-0 transition-opacity duration-300 select-none ${
                  isIntroHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#FAF7F2]/40 flex items-center justify-center text-[#FAF7F2] shrink-0 bg-black/20 group-hover:border-[#E4D3A6] transition-colors">
                  <Camera size={18} strokeWidth={1.75} className="text-[#FAF7F2]" />
                </div>
                <span className="font-display text-[15px] sm:text-[17px] font-bold tracking-[0.24em] text-[#FAF7F2] uppercase leading-none drop-shadow-sm">
                  SUBASH STUDIO
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav
                className={`hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-8 transition-opacity duration-700 ${
                  isIntroHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                {NAV_LINKS.map((l) => {
                  if (l.hasDropdown) {
                    return (
                      <div
                        key={l.to}
                        ref={dropdownRef}
                        className="relative"
                        onMouseEnter={() => setServicesOpen(true)}
                        onMouseLeave={() => setServicesOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setServicesOpen((prev) => !prev);
                          }}
                          className={`text-[13px] tracking-[0.08em] uppercase font-medium transition-colors duration-300 relative py-1 flex items-center gap-1 cursor-pointer select-none ${
                            isServicesActive
                              ? "text-[#E4D3A6] font-bold"
                              : "text-[#FAF7F2]/80 hover:text-white"
                          }`}
                          aria-expanded={servicesOpen}
                          aria-haspopup="true"
                        >
                          <span>{l.label}</span>
                          <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${
                              servicesOpen ? "rotate-180" : ""
                            }`}
                          />
                          {isServicesActive && (
                            <motion.span
                              layoutId="nav-underline"
                              className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#E4D3A6]"
                            />
                          )}
                        </button>

                        <AnimatePresence>
                          {servicesOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.18 }}
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#181715]/95 border border-[#E4D3A6]/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl z-50 space-y-1 text-[#FAF8F5]"
                            >
                              <Link
                                to="/order-booking"
                                onClick={() => setServicesOpen(false)}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-[#E4D3A6]/15 flex items-center justify-center text-[#E4D3A6] shrink-0 group-hover:bg-[#C9A669] group-hover:text-black transition-colors">
                                  <Camera size={18} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-[#FAF8F5] tracking-wider uppercase">
                                    Order Booking
                                  </div>
                                  <div className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-snug">
                                    Studio packages, wedding shoots &amp; cinematic films
                                  </div>
                                </div>
                              </Link>

                              <Link
                                to="/frames"
                                onClick={() => setServicesOpen(false)}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-[#E4D3A6]/15 flex items-center justify-center text-[#E4D3A6] shrink-0 group-hover:bg-[#C9A669] group-hover:text-black transition-colors">
                                  <Frame size={18} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-[#FAF8F5] tracking-wider uppercase flex items-center gap-1.5">
                                    <span>Order Frames</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E4D3A6]/20 text-[#E4D3A6] font-bold">
                                      NEW
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-snug">
                                    Handcrafted wood frames with photo upload
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      end={l.to === "/"}
                      className={({ isActive }) =>
                        `text-[13px] tracking-[0.08em] uppercase font-medium transition-colors duration-300 relative py-1 ${
                          isActive
                            ? "text-[#E4D3A6] font-bold"
                            : "text-[#FAF7F2]/80 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {l.label}
                          {isActive && (
                            <motion.span
                              layoutId="nav-underline"
                              className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#E4D3A6]"
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Book a Shoot Outlined Button (Screenshot 1) */}
              <div
                className={`hidden lg:flex items-center gap-5 transition-opacity duration-700 ${
                  isIntroHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#E4D3A6]/45 hover:border-[#E4D3A6] bg-black/25 hover:bg-[#C9A669] text-[#FAF7F2] hover:text-[#181715] text-xs font-semibold tracking-wider rounded-lg transition-all duration-300 shadow-sm group"
                >
                  <span>Book a Shoot</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                className={`lg:hidden text-[#FAF7F2] transition-opacity duration-700 p-1.5 rounded-lg hover:bg-white/10 ${
                  isIntroHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
            className="fixed top-[84px] left-0 right-0 z-40 bg-[#141311]/98 border-b border-white/10 lg:hidden overflow-hidden backdrop-blur-xl text-[#FAF8F5]"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {NAV_LINKS.map((l) => {
                if (l.hasDropdown) {
                  return (
                    <div key={l.to} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm tracking-[0.1em] uppercase font-medium text-[#FAF8F5]">
                        <button
                          type="button"
                          onClick={() => setMobileServicesOpen((v) => !v)}
                          className="flex items-center justify-between w-full py-1 text-left select-none cursor-pointer"
                          aria-expanded={mobileServicesOpen}
                        >
                          <span className={isServicesActive ? "text-[#E4D3A6] font-semibold" : "text-[#FAF8F5]/85"}>
                            {l.label}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 text-[#FAF8F5]/60 ${
                              mobileServicesOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {mobileServicesOpen && (
                        <div className="pl-4 flex flex-col gap-3 py-2 border-l-2 border-[#E4D3A6]/40 ml-1">
                          <NavLink
                            to="/order-booking"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                              `text-xs tracking-[0.08em] uppercase font-medium flex items-center gap-2 ${
                                isActive ? "text-[#E4D3A6] font-semibold" : "text-[#FAF8F5]/70"
                              }`
                            }
                          >
                            <Camera size={14} className="text-[#E4D3A6]" />
                            <span>Order Booking</span>
                          </NavLink>
                          <NavLink
                            to="/frames"
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                              `text-xs tracking-[0.08em] uppercase font-medium flex items-center gap-2 ${
                                isActive ? "text-[#E4D3A6] font-semibold" : "text-[#FAF8F5]/70"
                              }`
                            }
                          >
                            <Frame size={14} className="text-[#E4D3A6]" />
                            <span className="flex items-center gap-2">
                              <span>Order Frames</span>
                              <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#E4D3A6]/20 text-[#E4D3A6] font-bold">
                                NEW
                              </span>
                            </span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm tracking-[0.1em] uppercase font-medium ${
                        isActive ? "text-[#E4D3A6] font-semibold" : "text-[#FAF8F5]/80 hover:text-white"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                );
              })}
              <div className="flex items-center gap-5 pt-2">
                <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-[#FAF8F5]/70 hover:text-[#E4D3A6] transition-colors"><FaWhatsapp size={20} /></a>
                <a href={instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#FAF8F5]/70 hover:text-[#E4D3A6] transition-colors"><FaInstagram size={20} /></a>
              </div>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-5 py-3 border border-[#E4D3A6]/50 bg-[#C9A669] text-[#181715] hover:bg-[#E4D3A6] text-center text-[12px] tracking-[0.14em] uppercase font-bold rounded-lg transition-all"
              >
                BOOK A SHOOT
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
