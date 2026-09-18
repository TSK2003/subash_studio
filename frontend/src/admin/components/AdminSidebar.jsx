import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Images,
  Briefcase,
  Camera,
  Clapperboard,
  MapPin,
  Star,
  PanelsTopLeft,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Aperture,
  Frame,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminData } from "../context/AdminDataContext";

export const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/bookings",
    label: "Bookings",
    icon: CalendarDays,
    badgeKey: "bookings",
  },
  {
    path: "/admin/enquiries",
    label: "Enquiries",
    icon: MessageSquare,
    badgeKey: "enquiries",
  },
  {
    path: "/admin/frames",
    label: "Frames",
    icon: Frame,
    badgeKey: "frames",
  },
  {
    path: "/admin/gallery",
    label: "Gallery",
    icon: Images,
  },
  {
    path: "/admin/portfolio",
    label: "Portfolio",
    icon: Briefcase,
  },
  {
    path: "/admin/services",
    label: "Services",
    icon: Camera,
  },
  {
    path: "/admin/films",
    label: "Films",
    icon: Clapperboard,
  },
  {
    path: "/admin/branches",
    label: "Branches",
    icon: MapPin,
  },
  {
    path: "/admin/testimonials",
    label: "Testimonials",
    icon: Star,
    badgeKey: "testimonials",
  },
  {
    path: "/admin/content",
    label: "Website Content",
    icon: PanelsTopLeft,
  },
  {
    path: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { adminUser, logout } = useAdminAuth();
  const { bookings, enquiries, frameOrders, testimonials } = useAdminData();

  const newBookingsCount = (bookings || []).filter((b) => b.status === "New").length;
  const newEnquiriesCount = (enquiries || []).filter((e) => e.status === "New").length;
  const newFrameOrdersCount = (frameOrders || []).filter((o) => o.status === "New").length;
  const pendingTestimonialsCount = (testimonials || []).filter((t) => !t.approved && !t.hidden).length;

  const getBadge = (key) => {
    if (key === "bookings" && newBookingsCount > 0) return newBookingsCount;
    if (key === "enquiries" && newEnquiriesCount > 0) return newEnquiriesCount;
    if (key === "frames" && newFrameOrdersCount > 0) return newFrameOrdersCount;
    if (key === "testimonials" && pendingTestimonialsCount > 0) return pendingTestimonialsCount;
    return null;
  };

  const renderSidebarContent = (forceExpanded = false) => {
    const collapsed = forceExpanded ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-[#1C1B19] text-[#E7E0D2] select-none border-r border-[#2C2A26]">
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#2C2A26]/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0 border border-[#E4D3A6]/40 overflow-hidden">
              <img
                src="/images/admin/logo.png"
                alt="SUBASH STUDIO"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-display font-bold text-base tracking-widest text-[#F8F6F2] uppercase truncate">
                  SUBASH STUDIO
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A669] animate-pulse" />
                  <span className="text-[10px] tracking-widest2 uppercase text-[#C9A669] font-semibold">
                    Admin Portal
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#6F6A62] hover:text-[#F8F6F2] hover:bg-[#2A2926]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest2 text-[#6F6A62]">
            {!collapsed && "Management"}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = getBadge(item.badgeKey);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#2A2824] text-[#E4D3A6] font-semibold shadow-inner"
                      : "text-[#B3AAA0] hover:text-[#F8F6F2] hover:bg-[#252420]"
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeSideIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#C9A669] rounded-r-full"
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#C9A669]" : "text-[#8E867B] group-hover:text-[#C9A669]"
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate tracking-wide">
                        {item.label}
                      </span>
                    )}
                    {!collapsed && badge && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#9C7B3D] text-[#1C1B19] shrink-0">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-3 border-t border-[#2C2A26] bg-[#171614] shrink-0 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#9C7B3D] hover:text-[#E4D3A6] hover:bg-[#252420] rounded-xl transition-colors"
            title="Open Public Website in new tab"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span>View Public Website</span>}
          </a>

          <div className="pt-2 border-t border-[#2C2A26]/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#2A2824] border border-[#3D3A34] overflow-hidden shrink-0 flex items-center justify-center font-display font-bold text-[#E4D3A6] text-sm">
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
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F8F6F2] truncate">
                    {adminUser?.name || "Subash Admin"}
                  </p>
                  <p className="text-[10px] text-[#8E867B] truncate">
                    {adminUser?.role || "Director"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-[#8E867B] hover:text-rose-400 hover:bg-[#252420] rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-xs text-[#8E867B] hover:text-[#E4D3A6] hover:bg-[#252420] rounded-lg transition-colors flex items-center gap-1.5"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px]">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
