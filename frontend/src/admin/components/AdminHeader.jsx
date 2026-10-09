import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Plus,
  ExternalLink,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

import { ADMIN_ROUTES } from "../constants/adminRoutes";

function getNotificationIcon(type) {
  switch (type) {
    case "BOOKING":
      return <Calendar className="w-3.5 h-3.5 text-[#9C7B3D] shrink-0" />;
    case "FRAME_ORDER":
      return <Sparkles className="w-3.5 h-3.5 text-[#9C7B3D] shrink-0" />;
    case "ENQUIRY":
    default:
      return <MessageSquare className="w-3.5 h-3.5 text-[#9C7B3D] shrink-0" />;
  }
}

function getNotificationRoute(notif) {
  if (notif?.type === "BOOKING") return ADMIN_ROUTES.BOOKINGS;
  if (notif?.type === "FRAME_ORDER") return ADMIN_ROUTES.FRAMES;
  return ADMIN_ROUTES.ENQUIRIES;
}

export default function AdminHeader({ onMobileMenuClick }) {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Page Title from location
  const getPageMeta = () => {
    switch (location.pathname) {
      case ADMIN_ROUTES.BASE:
      case `${ADMIN_ROUTES.BASE}/`:
      case ADMIN_ROUTES.DASHBOARD:
        return { title: "Studio Dashboard", subtitle: "Real-time overview of bookings, enquiries & media" };
      case ADMIN_ROUTES.BOOKINGS:
        return { title: "Client Bookings", subtitle: "Manage photo shoot schedules and client inquiries" };
      case ADMIN_ROUTES.ENQUIRIES:
        return { title: "Lead Inquiries", subtitle: "Track and follow up on client contact messages" };
      case ADMIN_ROUTES.GALLERY:
      case ADMIN_ROUTES.PORTFOLIO:
        return { title: "Gallery Albums", subtitle: "Curate event and client photo albums with category filters" };
      case ADMIN_ROUTES.SERVICES:
        return { title: "Studio Offerings", subtitle: "Configure photography packages, pricing & descriptions" };
      case ADMIN_ROUTES.FILMS:
        return { title: "Cinematic Films", subtitle: "Manage featured wedding films, teasers and YouTube embeds" };
      case ADMIN_ROUTES.FRAMES:
        return { title: "Custom Frames & Orders", subtitle: "Configure wood types, designs, aspect ratios and customer orders" };
      case ADMIN_ROUTES.BRANCHES:
        return { title: "Studio Branches", subtitle: "Manage Kalladaikurichi, Tirunelveli & Tenkasi locations" };
      case ADMIN_ROUTES.TESTIMONIALS:
        return { title: "Client Testimonials", subtitle: "Review and feature client reviews & star ratings" };
      case ADMIN_ROUTES.CONTENT:
        return { title: "Website Content CMS", subtitle: "Update public website hero text, about story & contact" };
      case ADMIN_ROUTES.SETTINGS:
        return { title: "Admin & Studio Settings", subtitle: "Configure account security, preferences and studio details" };
      default:
        return { title: "Admin Portal", subtitle: "SUBASH STUDIO Management" };
    }
  };

  const pageMeta = getPageMeta();

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    setNotificationsOpen(false);
    navigate(getNotificationRoute(notif));
  };

  return (
    <header className="h-16 bg-[#E7EBF0] border-b border-[#C9D1DC] sticky top-0 z-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all min-w-0">
      {/* Left Title & Mobile Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#334155] hover:bg-[#DFE5EC] border border-[#C9D1DC] bg-[#EEF1F5] shrink-0"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50/80 text-rose-600 border border-rose-200/70 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ADMIN PORTAL
          </span>
          <span className="text-[#C9D1DC] font-normal select-none">/</span>
          <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#111827] tracking-tight truncate">
            {pageMeta.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Quick Add Booking */}
        <Link
          to={`${ADMIN_ROUTES.BOOKINGS}?new=true`}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-black text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Booking</span>
        </Link>
        {/* Live Site Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#C9D1DC] bg-[#EEF1F5] text-[#334155] hover:text-[#111827] hover:bg-[#DFE5EC] transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 shadow-xs"
          title="Open Public Website"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#475569]" />
          <span className="hidden sm:inline">Live Site</span>
        </a>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg border border-[#C9D1DC] bg-[#EEF1F5] text-[#334155] hover:bg-[#DFE5EC] transition-colors cursor-pointer shadow-xs"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-[#475569]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#EEF1F5] rounded-xl shadow-xl border border-[#C9D1DC] p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#C9D1DC]">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-[#111827]">
                    Studio Activity
                  </h4>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-xs text-[#475569] hover:text-[#111827] hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                ) : (
                  <span className="text-[11px] text-[#475569]">All caught up</span>
                )}
              </div>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mt-2">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`py-2.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                        !notif.isRead
                          ? "bg-gray-50/80 hover:bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs truncate ${
                                !notif.isRead
                                  ? "font-bold text-gray-900"
                                  : "font-medium text-gray-700"
                              }`}
                            >
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${
                              !notif.isRead ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {notif.message}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"
                            title="Unread"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No notifications at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
