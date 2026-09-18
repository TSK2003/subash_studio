import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import LuxuryLoader from "./components/LuxuryLoader";
import { useLenis, scrollToTop } from "./lib/useLenis";

// Critical landing page loaded synchronously for optimal FCP
import Home from "./pages/Home";

// Public Pages (Lazy Loaded)
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Films = lazy(() => import("./pages/Films"));
const Branches = lazy(() => import("./pages/Branches"));
const Contact = lazy(() => import("./pages/Contact"));
const OrderFrames = lazy(() => import("./pages/OrderFrames"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Contexts & Components
import { ToastProvider } from "./admin/context/ToastContext";
import { AdminAuthProvider, ProtectedAdminRoute } from "./admin/context/AdminAuthContext";
import { AdminDataProvider } from "./admin/context/AdminDataContext";

// Admin Layout & Pages (Lazy Loaded)
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Bookings = lazy(() => import("./admin/pages/Bookings"));
const Enquiries = lazy(() => import("./admin/pages/Enquiries"));
const FramesManager = lazy(() => import("./admin/pages/FramesManager"));
const GalleryManager = lazy(() => import("./admin/pages/GalleryManager"));
const PortfolioManager = lazy(() => import("./admin/pages/PortfolioManager"));
const ServicesManager = lazy(() => import("./admin/pages/ServicesManager"));
const FilmsManager = lazy(() => import("./admin/pages/FilmsManager"));
const BranchesManager = lazy(() => import("./admin/pages/BranchesManager"));
const TestimonialsManager = lazy(() => import("./admin/pages/TestimonialsManager"));
const WebsiteContent = lazy(() => import("./admin/pages/WebsiteContent"));
const Settings = lazy(() => import("./admin/pages/Settings"));

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
          <Suspense fallback={<LuxuryLoader />}>
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
          </Suspense>
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
          <Suspense fallback={<LuxuryLoader />}>
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
          </Suspense>
        </AdminDataProvider>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
