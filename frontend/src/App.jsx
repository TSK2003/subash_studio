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
const Reviews = lazy(() => import("./pages/Reviews"));
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
import { ADMIN_BASE_PATH, ADMIN_ROUTES, ADMIN_SUBPATHS } from "./admin/constants/adminRoutes";

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
                <Route path="/reviews" element={<PageWrapper><Reviews /></PageWrapper>} />
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
              {/* Admin Login (Direct Alias & Opaque Path) */}
              <Route path="/login" element={<AdminLogin />} />
              <Route path={ADMIN_ROUTES.LOGIN} element={<AdminLogin />} />

              {/* Opaque Admin Root Redirect */}
              <Route
                path={ADMIN_BASE_PATH}
                element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />}
              />

              {/* Protected Opaque Admin Routes */}
              <Route
                path={ADMIN_BASE_PATH}
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route path={ADMIN_SUBPATHS.OVERVIEW} element={<Dashboard />} />
                <Route path={ADMIN_SUBPATHS.BOOKINGS} element={<Bookings />} />
                <Route path={ADMIN_SUBPATHS.ENQUIRIES} element={<Enquiries />} />
                <Route path={ADMIN_SUBPATHS.FRAMES} element={<FramesManager />} />
                <Route path={ADMIN_SUBPATHS.GALLERY} element={<GalleryManager />} />
                <Route path={ADMIN_SUBPATHS.PORTFOLIO} element={<PortfolioManager />} />
                <Route path={ADMIN_SUBPATHS.SERVICES} element={<ServicesManager />} />
                <Route path={ADMIN_SUBPATHS.FILMS} element={<FilmsManager />} />
                <Route path={ADMIN_SUBPATHS.BRANCHES} element={<BranchesManager />} />
                <Route path={ADMIN_SUBPATHS.TESTIMONIALS} element={<TestimonialsManager />} />
                <Route path={ADMIN_SUBPATHS.CONTENT} element={<WebsiteContent />} />
                <Route path={ADMIN_SUBPATHS.SETTINGS} element={<Settings />} />
                <Route path="*" element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />} />
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
