import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Images,
  Camera,
  Clapperboard,
  MapPin,
  Star,
  PanelsTopLeft,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Frame,
  ExternalLink,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminData } from "../context/AdminDataContext";
import { ADMIN_ROUTES } from "../constants/adminRoutes";

export const navSections = [
  {
    group: "MAIN",
    items: [
      {
        path: ADMIN_ROUTES.DASHBOARD,
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "STUDIO MANAGEMENT",
    items: [
      {
        path: ADMIN_ROUTES.BOOKINGS,
        label: "Bookings",
        icon: CalendarDays,
        badgeKey: "bookings",
      },
      {
        path: ADMIN_ROUTES.ENQUIRIES,
        label: "Enquiries",
        icon: MessageSquare,
        badgeKey: "enquiries",
      },
      {
        path: ADMIN_ROUTES.FRAMES,
        label: "Frames",
        icon: Frame,
        badgeKey: "frames",
      },
      {
        path: ADMIN_ROUTES.GALLERY,
        label: "Gallery",
        icon: Images,
      },
      {
        path: ADMIN_ROUTES.SERVICES,
        label: "Services",
        icon: Camera,
      },
      {
        path: ADMIN_ROUTES.FILMS,
        label: "Films",
        icon: Clapperboard,
      },
      {
        path: ADMIN_ROUTES.BRANCHES,
        label: "Branches",
        icon: MapPin,
      },
      {
        path: ADMIN_ROUTES.TESTIMONIALS,
        label: "Testimonials",
        icon: Star,
        badgeKey: "testimonials",
      },
    ],
  },
  {
    group: "WEBSITE",
    items: [
      {
        path: ADMIN_ROUTES.CONTENT,
        label: "Website Content",
        icon: PanelsTopLeft,
      },
    ],
  },
  {
    group: "ACCOUNT",
    items: [
      {
        path: ADMIN_ROUTES.SETTINGS,
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];

export const navItems = navSections.flatMap((s) => s.items);

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const { bookings, enquiries, frameOrders, testimonials } = useAdminData();

  const handleLogout = async () => {
    await logout();
    navigate(ADMIN_ROUTES.LOGIN, { replace: true });
  };

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
      <div className="flex flex-col h-full bg-white text-gray-900 select-none border-r border-gray-200">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-sm shrink-0 border border-gray-200 overflow-hidden p-1">
              <img
                src="/images/admin/logo.png"
                alt="SUBASH STUDIO"
                className="w-full h-full object-contain filter invert"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.parentElement) {
                    e.target.parentElement.innerHTML = '<span class="text-xs font-bold">SS</span>';
                  }
                }}
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs tracking-wider text-gray-900 uppercase truncate">
                  SUBASH STUDIO
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[9px] tracking-wider uppercase text-gray-400 font-semibold">
                    Admin Portal
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-1 pb-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const badge = getBadge(item.badgeKey);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
                          }`}
                        />
                        {!collapsed && (
                          <span className="flex-1 truncate tracking-tight">
                            {item.label}
                          </span>
                        )}
                        {!collapsed && badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 shrink-0">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-3 border-t border-gray-200 bg-white shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              onClick={() => navigate(ADMIN_ROUTES.SETTINGS)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-700 text-xs">
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
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {adminUser?.name || "Subash"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {adminUser?.role || "Studio Director & Lead P..."}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={() => navigate(ADMIN_ROUTES.SETTINGS)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                title="Profile Settings"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-1 border-t border-gray-100 space-y-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-2 py-1.5 text-xs text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-600 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>

            {/* Desktop Collapse Toggle */}
            <div className="hidden lg:flex">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-2 py-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 mx-auto" />
                ) : (
                  <>
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? "w-16" : "w-56"
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
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 max-w-[80vw] z-50 shadow-2xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
