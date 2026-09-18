import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  RefreshCw,
  Plus,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function AdminHeader({ onMobileMenuClick }) {
  const { adminUser, logout } = useAdminAuth();
  const { bookings, enquiries, frameOrders, resetAllDemoData } = useAdminData();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Page Title from location
  const getPageMeta = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin/dashboard":
        return { title: "Studio Dashboard", subtitle: "Real-time overview of bookings & activity" };
      case "/admin/bookings":
        return { title: "Shoot Bookings", subtitle: "Manage client bookings, status & schedules" };
      case "/admin/enquiries":
        return { title: "Client Enquiries", subtitle: "Direct client inquiries and consultation leads" };
      case "/admin/frames":
        return { title: "Frame Management", subtitle: "Manage timber frames, sizes & customer orders" };
      case "/admin/gallery":
        return { title: "Gallery Management", subtitle: "Organize client images, categories & featured photos" };
      case "/admin/portfolio":
        return { title: "Portfolio Projects", subtitle: "Showcase curated studio wedding & couple stories" };
      case "/admin/services":
        return { title: "Studio Services", subtitle: "Manage photography packages, descriptions & rates" };
      case "/admin/films":
        return { title: "Cinematic Films", subtitle: "Curate 4K wedding films, teasers and trailers" };
      case "/admin/branches":
        return { title: "Studio Branches", subtitle: "Manage Kalladaikurichi, Tirunelveli & Tenkasi locations" };
      case "/admin/testimonials":
        return { title: "Client Testimonials", subtitle: "Review and feature client reviews & star ratings" };
      case "/admin/content":
        return { title: "Website Content CMS", subtitle: "Update public website hero text, about story & contact" };
      case "/admin/settings":
        return { title: "Admin & Studio Settings", subtitle: "Configure account security, preferences and studio details" };
      default:
        return { title: "Admin Portal", subtitle: "SUBASH STUDIO Management" };
    }
  };

  const pageMeta = getPageMeta();

  // Active unread alerts derived from AdminDataContext
  const unreadEnquiries = (enquiries || []).filter((e) => e.status === "New");
  const newBookings = (bookings || []).filter((b) => b.status === "New");
  const newOrders = (frameOrders || []).filter((o) => o.status === "New");
  const totalNotifications = unreadEnquiries.length + newBookings.length + newOrders.length;

  const handleResetData = () => {
    if (window.confirm("Reset all admin data back to initial demo seeds?")) {
      resetAllDemoData();
      addToast("Demo data successfully reset to initial state.", "info");
      setProfileMenuOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/bookings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#E7E0D2] sticky top-0 z-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all min-w-0">
      {/* Left Title & Mobile Trigger */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 mr-2">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#2B2B2B] hover:bg-[#F8F6F2] border border-[#E7E0D2] shrink-0"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl xl:text-2xl font-display font-bold text-[#2B2B2B] tracking-tight truncate">
            {pageMeta.title}
          </h1>
          <p className="text-xs text-[#6F6A62] hidden sm:block truncate">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 absolute left-3 text-[#6F6A62] pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 lg:w-40 xl:w-60 pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E0D2] rounded-lg text-xs text-[#2B2B2B] placeholder:text-[#8E867B] focus:outline-none focus:border-[#C9A669] focus:bg-white transition-all"
          />
        </form>

        {/* Quick Add Booking */}
        <Link
          to="/admin/bookings?new=true"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#E4D3A6]" />
          <span className="hidden md:inline">New Booking</span>
        </Link>

        {/* Live Site Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="p-2 sm:p-2.5 rounded-lg border border-[#E7E0D2] text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium shrink-0"
          title="Open Public Website"
        >
          <ExternalLink className="w-4 h-4 text-[#9C7B3D]" />
          <span className="hidden xl:inline">Live Site</span>
        </a>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-lg border border-[#E7E0D2] text-[#2B2B2B] hover:bg-[#F8F6F2] transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A669] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {totalNotifications}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-[#E7E0D2] p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D2]">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-sm text-[#2B2B2B]">
                    Studio Activity
                  </h4>
                  {totalNotifications > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {totalNotifications} New Alert{totalNotifications > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <Link
                  to="/admin/enquiries"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-[#9C7B3D] hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-[#F8F6F2] max-h-72 overflow-y-auto mt-2">
                {unreadEnquiries.length > 0 ? (
                  unreadEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      onClick={() => {
                        navigate("/admin/enquiries");
                        setNotificationsOpen(false);
                      }}
                      className="py-2.5 px-2 hover:bg-[#FDFBF7] rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-xs text-[#2B2B2B] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#9C7B3D]" />
                          {enq.clientName || enq.name || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-[#8E867B]">
                          {enq.receivedDate || enq.createdAt || ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6A62] mt-1 line-clamp-1">
                        {enq.message || enq.notes || enq.clientMessage || "New enquiry received."}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-[#6F6A62]">
                    No new enquiries at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-[#E7E0D2] hover:bg-[#F8F6F2] transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-[#2B2B2B] text-[#E4D3A6] flex items-center justify-center font-display font-semibold text-xs overflow-hidden">
              {adminUser?.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                adminUser?.name?.charAt(0) || "S"
              )}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-[#2B2B2B] leading-none">
                {adminUser?.name || "Admin"}
              </p>
              <p className="text-[10px] text-[#8E867B] mt-0.5 leading-none">
                {adminUser?.role || "Director"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6F6A62]" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-[#E7E0D2] p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#E7E0D2]/60 mb-1">
                <p className="text-xs font-bold text-[#2B2B2B]">
                  {adminUser?.name || "Subash Admin"}
                </p>
                <p className="text-[11px] text-[#6F6A62] truncate">
                  {adminUser?.email || "subashstudio009@gmail.com"}
                </p>
              </div>

              <Link
                to="/admin/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors font-medium"
              >
                <User className="w-4 h-4 text-[#9C7B3D]" />
                <span>Admin Profile</span>
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors font-medium"
              >
                <SettingsIcon className="w-4 h-4 text-[#9C7B3D]" />
                <span>Studio Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleResetData}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-[#F8F6F2] rounded-lg transition-colors font-medium text-left"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Reset Demo Data</span>
              </button>

              <div className="pt-1 border-t border-[#E7E0D2]/60 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
