import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import { useLenis, scrollToTop } from "./lib/useLenis";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import Films from "./pages/Films";
import Branches from "./pages/Branches";
import Contact from "./pages/Contact";
import OrderFrames from "./pages/OrderFrames";
import NotFound from "./pages/NotFound";

// Admin Contexts & Components
import { ToastProvider } from "./admin/context/ToastContext";
import { AdminAuthProvider, ProtectedAdminRoute } from "./admin/context/AdminAuthContext";
import { AdminDataProvider } from "./admin/context/AdminDataContext";
import AdminLayout from "./admin/components/AdminLayout";

// Admin Pages
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import Bookings from "./admin/pages/Bookings";
import Enquiries from "./admin/pages/Enquiries";
import FramesManager from "./admin/pages/FramesManager";
import GalleryManager from "./admin/pages/GalleryManager";
import PortfolioManager from "./admin/pages/PortfolioManager";
import ServicesManager from "./admin/pages/ServicesManager";
import FilmsManager from "./admin/pages/FilmsManager";
import BranchesManager from "./admin/pages/BranchesManager";
import TestimonialsManager from "./admin/pages/TestimonialsManager";
import WebsiteContent from "./admin/pages/WebsiteContent";
import Settings from "./admin/pages/Settings";

import PremiumPageBackground from "./components/PremiumPageBackground";

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function PageWrapper({ children }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.main>
  );
}

function PublicWebsiteLayout() {
  const location = useLocation();
  useLenis();

  return (
    <div className="min-h-screen flex flex-col relative text-ink">
      <PremiumPageBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/order-booking" element={<PageWrapper><Services /></PageWrapper>} />
              <Route path="/services" element={<Navigate to="/order-booking" replace />} />
              <Route path="/frames" element={<PageWrapper><OrderFrames /></PageWrapper>} />
              <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
              <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
              <Route path="/films" element={<PageWrapper><Films /></PageWrapper>} />
              <Route path="/branches" element={<PageWrapper><Branches /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </div>
        <Footer />
        <FloatingButtons />
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <ToastProvider>
      <AdminAuthProvider>
        <AdminDataProvider>
          <Routes>
            {/* Admin Login (Public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Redirect */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="frames" element={<FramesManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="portfolio" element={<PortfolioManager />} />
              <Route path="services" element={<ServicesManager />} />
              <Route path="films" element={<FilmsManager />} />
              <Route path="branches" element={<BranchesManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="content" element={<WebsiteContent />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Public Website Routes (Catch-all for non-admin) */}
            <Route path="/*" element={<PublicWebsiteLayout />} />
          </Routes>
        </AdminDataProvider>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
