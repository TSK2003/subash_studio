import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Images,
  Camera,
  MapPin,
  Plus,
  ArrowRight,
  Briefcase,
  Clapperboard,
  Eye,
  Frame,
  Star,
} from "lucide-react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAdminData } from "../context/AdminDataContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import { ADMIN_ROUTES } from "../constants/adminRoutes";
import { normalizeBookingStatus } from "../../lib/bookingStatus.js";
import {
  filterAndSortUpcomingShoots,
  formatShootDate,
  parseBookingDateMidnight,
} from "../../lib/bookingDate.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const {
    bookings,
    enquiries,
    gallery,
    services,
    branches,
    portfolio,
    films,
    frameOrders,
    testimonials,
  } = useAdminData();

  // Dynamic Time of Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Metrics directly derived from AdminDataContext with single-pass memoization
  const {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedShoots,
    cancelledBookings,
    totalEnquiries,
    newEnquiries,
    totalGallery,
    totalPortfolio,
    totalServices,
    totalFilms,
    totalBranches,
    totalTestimonials,
    totalFrameOrders,
    newFrameOrders,
  } = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;

    for (const b of bookings) {
      const s = normalizeBookingStatus(b.status);
      if (s === "NEW" || s === "CONTACTED") pending++;
      else if (s === "CONFIRMED") confirmed++;
      else if (s === "COMPLETED") completed++;
      else if (s === "CANCELLED") cancelled++;
    }

    const totalEnq = enquiries.length;
    let newEnq = 0;
    for (const e of enquiries) {
      if ((e.status || "").toString().trim().toUpperCase() === "NEW") newEnq++;
    }

    const newOrders = (frameOrders || []).filter(
      (o) => (o.status || "").toString().trim().toUpperCase() === "NEW"
    ).length;

    return {
      totalBookings: bookings.length,
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedShoots: completed,
      cancelledBookings: cancelled,
      totalEnquiries: totalEnq,
      newEnquiries: newEnq,
      totalGallery: gallery.length,
      totalPortfolio: (portfolio || []).length,
      totalServices: services.length,
      totalFilms: (films || []).length,
      totalBranches: branches.length,
      totalTestimonials: (testimonials || []).length,
      totalFrameOrders: (frameOrders || []).length,
      newFrameOrders: newOrders,
    };
  }, [bookings, enquiries, gallery, portfolio, services, films, branches, testimonials, frameOrders]);

  // Upcoming shoots: actual future or today bookings, sorted nearest-date first, excluding COMPLETED and CANCELLED
  const upcomingShoots = useMemo(() => {
    return filterAndSortUpcomingShoots(bookings).slice(0, 6);
  }, [bookings]);

  // Recent enquiries
  const recentEnquiries = useMemo(() => {
    return [...enquiries].slice(0, 4);
  }, [enquiries]);

  // Dynamic monthly shoot visualizer derived from actual bookings
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        count: 0,
        revenueNum: 0,
      });
    }

    bookings.forEach((b) => {
      const dateStr = b.eventDate || b.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const target = result.find((m) => m.monthIndex === mIdx && m.year === yr);
      if (target) {
        target.count += 1;
        const rawBudget = parseInt((b.budget || "0").replace(/[^0-9]/g, ""), 10) || 0;
        target.revenueNum += rawBudget;
      }
    });

    return result.map((m) => {
      let revenueStr = "₹0";
      if (m.revenueNum >= 100000) {
        revenueStr = `₹${(m.revenueNum / 100000).toFixed(1)}L`;
      } else if (m.revenueNum > 0) {
        revenueStr = `₹${(m.revenueNum / 1000).toFixed(0)}k`;
      }
      return {
        month: m.month,
        count: m.count,
        revenue: revenueStr,
      };
    });
  }, [bookings]);

  const maxCount = Math.max(1, ...monthlyData.map((d) => d.count));

  // Dynamic service demand distribution derived from services and bookings
  const serviceStats = useMemo(() => {
    if (!services || services.length === 0) return [];
    const counts = {};
    services.forEach((s) => {
      counts[s.name] = 0;
    });

    bookings.forEach((b) => {
      const srvName = b.requiredService || b.service;
      if (!srvName) return;
      if (counts[srvName] !== undefined) {
        counts[srvName] += 1;
      } else {
        const match = services.find((s) =>
          s.name.toLowerCase().includes(srvName.toLowerCase()) ||
          srvName.toLowerCase().includes(s.name.toLowerCase())
        );
        if (match) counts[match.name] = (counts[match.name] || 0) + 1;
      }
    });

    const totalAssigned = Object.values(counts).reduce((a, b) => a + b, 0);

    return services
      .map((s) => {
        const count = counts[s.name] || 0;
        const percentage = totalAssigned > 0 ? Math.round((count / totalAssigned) * 100) : 0;
        return {
          name: s.name,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [services, bookings]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Greeting Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}, {adminUser?.name || "Subash"}
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl">
            Real-time synchronization across bookings, client enquiries, portfolio, framing orders, and studio operations.
          </p>
        </div>

        {/* Action Button & Quick Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {newFrameOrders > 0 ? (
            <Link
              to={ADMIN_ROUTES.FRAMES}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs group"
            >
              <Frame className="w-3.5 h-3.5 text-rose-500 group-hover:scale-105 transition-transform" />
              <span>Frame Orders</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {newFrameOrders}
              </span>
            </Link>
          ) : (
            <Link
              to={ADMIN_ROUTES.BOOKINGS}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs group"
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-500 group-hover:scale-105 transition-transform" />
              <span>Shoot Schedule</span>
            </Link>
          )}

          <Link
            to={`${ADMIN_ROUTES.BOOKINGS}?new=true`}
            className="px-3.5 py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Statistics Cards Grid - Row 1 (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={CalendarDays}
          description="All studio shoots"
          accent="blue"
          onClick={() => navigate(ADMIN_ROUTES.BOOKINGS)}
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          icon={Clock}
          description="Awaiting shoot date"
          accent="lavender"
          onClick={() => navigate(ADMIN_ROUTES.BOOKINGS)}
        />
        <StatCard
          title="Total Enquiries"
          value={totalEnquiries}
          icon={MessageSquare}
          trend={newEnquiries > 0 ? `${newEnquiries} new lead${newEnquiries > 1 ? "s" : ""}` : undefined}
          description={newEnquiries === 0 ? "All leads addressed" : undefined}
          accent="amber"
          onClick={() => navigate(ADMIN_ROUTES.ENQUIRIES)}
        />
        <StatCard
          title="Frame Orders"
          value={totalFrameOrders}
          icon={Frame}
          trend={newFrameOrders > 0 ? `${newFrameOrders} new order${newFrameOrders > 1 ? "s" : ""}` : undefined}
          description={newFrameOrders === 0 ? "Bespoke framing orders" : undefined}
          accent="coral"
          onClick={() => navigate(ADMIN_ROUTES.FRAMES)}
        />
        <StatCard
          title="Gallery Items"
          value={totalGallery}
          icon={Images}
          description="High-res photos"
          accent="mint"
          onClick={() => navigate(ADMIN_ROUTES.GALLERY)}
        />
      </div>

      {/* Dynamic Statistics Cards Grid - Row 2 (7 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3.5">
        <StatCard
          title="Portfolio Items"
          value={totalPortfolio}
          icon={Briefcase}
          description="Curated stories"
          accent="purple"
          onClick={() => navigate(ADMIN_ROUTES.PORTFOLIO)}
        />
        <StatCard
          title="Services"
          value={totalServices}
          icon={Camera}
          description="Active packages"
          accent="blue"
          onClick={() => navigate(ADMIN_ROUTES.SERVICES)}
        />
        <StatCard
          title="Films"
          value={totalFilms}
          icon={Clapperboard}
          description="Cinematic films"
          accent="coral"
          onClick={() => navigate(ADMIN_ROUTES.FILMS)}
        />
        <StatCard
          title="Branches"
          value={totalBranches}
          icon={MapPin}
          description="Studios & lounges"
          accent="mint"
          onClick={() => navigate(ADMIN_ROUTES.BRANCHES)}
        />
        <StatCard
          title="Testimonials"
          value={totalTestimonials}
          icon={Star}
          description="Client reviews"
          accent="lavender"
          onClick={() => navigate(ADMIN_ROUTES.TESTIMONIALS)}
        />
        <StatCard
          title="Confirmed Shoots"
          value={confirmedBookings}
          icon={CheckCircle2}
          description="Confirmed on calendar"
          accent="green"
          onClick={() => navigate(ADMIN_ROUTES.BOOKINGS)}
        />
        <StatCard
          title="Completed Shoots"
          value={completedShoots}
          icon={Clock}
          description="Successfully archived"
          accent="amber"
          onClick={() => navigate(ADMIN_ROUTES.BOOKINGS)}
        />
      </div>

      {/* Quick Management Actions Strip */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-xs sm:text-sm text-gray-900">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to={`${ADMIN_ROUTES.BOOKINGS}?new=true`}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group min-w-0"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/60 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-black truncate w-full">+ New Booking</span>
          </Link>

          <Link
            to={`${ADMIN_ROUTES.GALLERY}?new=true`}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group min-w-0"
          >
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100/60 group-hover:scale-105 transition-transform">
              <Images className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-black truncate w-full">+ Upload Image</span>
          </Link>

          <Link
            to={`${ADMIN_ROUTES.PORTFOLIO}?new=true`}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group min-w-0"
          >
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100/60 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-black truncate w-full">+ Add Project</span>
          </Link>

          <Link
            to={`${ADMIN_ROUTES.SERVICES}?new=true`}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group min-w-0"
          >
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100/60 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-black truncate w-full">+ Add Service</span>
          </Link>

          <Link
            to={`${ADMIN_ROUTES.FILMS}?new=true`}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group min-w-0"
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/60 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-black truncate w-full">+ Add Film</span>
          </Link>
        </div>
      </div>

      {/* Analytics Section: Monthly Shoot Visualizer & Dynamic Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left: Monthly Shoots Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Studio Analytics
              </span>
              <h3 className="font-bold text-base text-gray-900 truncate">
                Monthly Bookings &amp; Shoots
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full font-medium border border-amber-200/60 shrink-0">
              {new Date().getFullYear()} Season
            </span>
          </div>

          {/* Minimalist Interactive Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 sm:px-2 border-b border-gray-100 relative">
            {monthlyData.map((item, idx) => {
              const heightPercent = Math.max(item.count > 0 ? 8 : 2, (item.count / maxCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-0">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-20">
                    <span className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md font-bold shadow whitespace-nowrap">
                      {item.count} Shoot{item.count === 1 ? "" : "s"} ({item.revenue})
                    </span>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[42px] bg-slate-200 group-hover:bg-slate-700 rounded-t-lg transition-all duration-200 relative overflow-hidden"
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Label */}
                  <span className="text-[11px] font-medium text-gray-500 mt-2.5 group-hover:text-gray-900">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-gray-500 pt-1 min-w-0">
            <span className="flex items-center gap-2 min-w-0 truncate">
              <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
              <span className="truncate">Active Calendar Shoots &amp; Muhurtham Seasons</span>
            </span>
            <span className="font-semibold text-gray-900 shrink-0">
              {totalBookings} Total Shoot{totalBookings === 1 ? "" : "s"} YTD
            </span>
          </div>
        </div>

        {/* Right: Popular Services Breakdown (Dynamically Computed) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Package Demand
            </span>
            <h3 className="font-bold text-base text-gray-900">
              Popular Studio Services
            </h3>
          </div>

          <div className="space-y-3.5 my-auto">
            {serviceStats.length > 0 ? (
              serviceStats.map((srv, idx) => (
                <div key={idx} className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-medium gap-2 min-w-0">
                    <span className="text-gray-900 truncate">{srv.name}</span>
                    <span className="text-gray-500 font-semibold shrink-0">
                      {srv.count} shoot{srv.count === 1 ? "" : "s"} ({srv.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E293B] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(srv.percentage > 0 ? 4 : 0, srv.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                No services configured yet.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              to={ADMIN_ROUTES.SERVICES}
              className="text-xs text-gray-700 hover:text-black hover:underline font-semibold flex items-center justify-between"
            >
              <span>Manage Service Pricing &amp; Features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Shoots & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upcoming Shoots Table */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Upcoming Scheduled Shoots
              </h3>
              <p className="text-xs text-gray-400">Next client sessions in calendar order</p>
            </div>
            <Link
              to={ADMIN_ROUTES.BOOKINGS}
              className="text-xs text-gray-600 hover:text-gray-900 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="pb-2.5 font-semibold">Customer</th>
                  <th className="pb-2.5 font-semibold">Service</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingShoots.length > 0 ? (
                  upcomingShoots.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 font-medium text-gray-900">
                        <div className="font-semibold">{b.customerName || b.clientName || "Client"}</div>
                        <div className="text-[10px] text-gray-400">{b.location || b.venue || "Studio Location"}</div>
                      </td>
                      <td className="py-2.5 text-gray-600">{b.requiredService || b.service || "Photography Session"}</td>
                      <td className="py-2.5 font-medium text-gray-900">
                        {formatShootDate(b.eventDate || b.date)}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => navigate(`${ADMIN_ROUTES.BOOKINGS}?id=${b.id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="View Shoot Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarDays className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <span>No upcoming shoots scheduled.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Client Enquiries Box */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Recent Client Enquiries
              </h3>
              <p className="text-xs text-gray-400">Leads received via website</p>
            </div>
            <Link
              to={ADMIN_ROUTES.ENQUIRIES}
              className="text-xs text-gray-600 hover:text-gray-900 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEnquiries.length > 0 ? (
              recentEnquiries.map((enq, idx) => {
                const borderColors = [
                  "border-l-indigo-500",
                  "border-l-blue-500",
                  "border-l-purple-500",
                  "border-l-amber-500",
                ];
                const borderClass = borderColors[idx % borderColors.length];
                return (
                  <div
                    key={enq.id}
                    onClick={() => navigate(ADMIN_ROUTES.ENQUIRIES)}
                    className={`p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 cursor-pointer transition-all space-y-1.5 min-w-0 border-l-4 ${borderClass}`}
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {enq.clientName || enq.name || "Anonymous"}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium truncate">
                          {enq.interestedService || enq.service || "General Inquiry"}
                        </p>
                      </div>
                      <StatusBadge status={enq.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed break-words">
                      "{enq.message || enq.notes || enq.clientMessage || "No message provided."}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                      <span>{enq.phone || "No phone"}</span>
                      <span>{enq.receivedDate || enq.createdAt || ""}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                No client enquiries yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
