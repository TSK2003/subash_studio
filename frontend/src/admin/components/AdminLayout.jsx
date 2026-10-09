import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateSidebarWidth = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) {
          document.documentElement.style.setProperty(
            "--admin-sidebar-w",
            isCollapsed ? "5rem" : "14rem"
          );
        } else {
          document.documentElement.style.setProperty("--admin-sidebar-w", "0px");
        }
      }
    };

    updateSidebarWidth();
    window.addEventListener("resize", updateSidebarWidth);
    return () => {
      window.removeEventListener("resize", updateSidebarWidth);
      document.documentElement.style.removeProperty("--admin-sidebar-w");
    };
  }, [isCollapsed]);

  return (
    <div className="admin-portal min-h-screen bg-[#F7F7F8] flex flex-row font-body text-gray-900 antialiased selection:bg-gray-900 selection:text-white relative">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <AdminHeader onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
