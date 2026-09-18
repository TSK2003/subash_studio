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

  // Metrics directly derived from AdminDataContext
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "New" || b.status === "Contacted").length;
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
  const completedShoots = bookings.filter((b) => b.status === "Completed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "Cancelled").length;

  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "New").length;

  const totalGallery = gallery.length;
  const totalPortfolio = (portfolio || []).length;
  const totalServices = services.length;
  const totalFilms = (films || []).length;
  const totalBranches = branches.length;
  const totalTestimonials = (testimonials || []).length;

  const totalFrameOrders = (frameOrders || []).length;
  const newFrameOrders = (frameOrders || []).filter((o) => o.status === "New").length;

  // Upcoming shoots (sorted by event date ascending)
  const upcomingShoots = useMemo(() => {
    return [...bookings]
      .filter((b) => b.status === "Confirmed" || b.status === "In Progress" || b.status === "New")
      .sort((a, b) => {
        const timeA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
        const timeB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
        return timeA - timeB;
      })
      .slice(0, 5);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 text-[#2B2B2B] shadow-sm border border-[#E7E0D2] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#C9A669] before:via-[#DFCA9F] before:to-[#9C7B3D]">
        {/* Subtle decorative warm background aura */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 bg-[#FBF7F0] rounded-full blur-2xl opacity-70" />

        <div className="space-y-1.5 relative z-10 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8E867B] font-medium">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B] tracking-tight">
            {getGreeting()}, {adminUser?.name || "Subash"}
          </h2>
          <p className="text-xs text-[#6F6A62] max-w-xl">
            Real-time synchronization across bookings, client enquiries, portfolio, framing orders, and studio operations.
          </p>
        </div>

        {/* Action Button & Quick Status */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          {newFrameOrders > 0 ? (
            <Link
              to="/admin/frames"
              className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-[#2B2B2B] border border-[#E7E0D2] rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-sm group"
            >
              <Frame className="w-3.5 h-3.5 text-[#C9A669] group-hover:scale-110 transition-transform" />
              <span>Frame Orders</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#C9A669]/15 text-[#8C6D32] text-[10px] font-bold">
                {newFrameOrders}
              </span>
            </Link>
          ) : (
            <Link
              to="/admin/bookings"
              className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EFE8] text-[#2B2B2B] border border-[#E7E0D2] rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-sm group"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#C9A669] group-hover:scale-110 transition-transform" />
              <span>Shoot Schedule</span>
            </Link>
          )}

          <Link
            to="/admin/bookings?new=true"
            className="px-4 py-2.5 bg-gradient-to-r from-[#C9A669] to-[#9C7B3D] hover:from-[#D4B376] hover:to-[#A88544] text-[#1C1B19] rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={CalendarDays}
          description="All studio shoots"
          accent="neutral"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          icon={Clock}
          description="Awaiting shoot date"
          accent={pendingBookings > 0 ? "gold" : "neutral"}
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          title="Total Enquiries"
          value={totalEnquiries}
          icon={MessageSquare}
          trend={newEnquiries > 0 ? `${newEnquiries} new lead${newEnquiries > 1 ? "s" : ""}` : undefined}
          description={newEnquiries === 0 ? "All leads addressed" : undefined}
          accent={newEnquiries > 0 ? "gold" : "neutral"}
          onClick={() => navigate("/admin/enquiries")}
        />
        <StatCard
          title="Frame Orders"
          value={totalFrameOrders}
          icon={Frame}
          trend={newFrameOrders > 0 ? `${newFrameOrders} new order${newFrameOrders > 1 ? "s" : ""}` : undefined}
          description={newFrameOrders === 0 ? "Bespoke framing orders" : undefined}
          accent={newFrameOrders > 0 ? "gold" : "neutral"}
          onClick={() => navigate("/admin/frames")}
        />
        <StatCard
          title="Gallery Items"
          value={totalGallery}
          icon={Images}
          description="High-res photos"
          accent="neutral"
          onClick={() => navigate("/admin/gallery")}
        />
        <StatCard
          title="Portfolio Items"
          value={totalPortfolio}
          icon={Briefcase}
          description="Curated stories"
          accent="neutral"
          onClick={() => navigate("/admin/portfolio")}
        />
        <StatCard
          title="Services"
          value={totalServices}
          icon={Camera}
          description="Active packages"
          accent="neutral"
          onClick={() => navigate("/admin/services")}
        />
        <StatCard
          title="Films"
          value={totalFilms}
          icon={Clapperboard}
          description="Cinematic films"
          accent="neutral"
          onClick={() => navigate("/admin/films")}
        />
        <StatCard
          title="Branches"
          value={totalBranches}
          icon={MapPin}
          description="Studios & lounges"
          accent="neutral"
          onClick={() => navigate("/admin/branches")}
        />
        <StatCard
          title="Testimonials"
          value={totalTestimonials}
          icon={Star}
          description="Client reviews"
          accent="neutral"
          onClick={() => navigate("/admin/testimonials")}
        />
        <StatCard
          title="Confirmed Shoots"
          value={confirmedBookings}
          icon={CheckCircle2}
          description="Confirmed on calendar"
          accent="neutral"
          onClick={() => navigate("/admin/bookings")}
        />
        <StatCard
          title="Completed Shoots"
          value={completedShoots}
          icon={Clock}
          description="Successfully archived"
          accent="neutral"
          onClick={() => navigate("/admin/bookings")}
        />
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E7E0D2] shadow-sm min-w-0">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-display font-semibold text-sm text-[#2B2B2B] truncate">
            Quick Management Actions
          </h3>
          <span className="text-xs text-[#6F6A62] shrink-0">One-click shortcuts</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          <Link
            to="/admin/bookings?new=true"
            className="p-2.5 sm:p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] transition-all flex flex-col items-center text-center gap-1.5 group min-w-0"
          >
            <div className="p-2 rounded-md bg-[#F8F6F2] group-hover:bg-[#F4EFE6] text-[#9C7B3D] transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#2B2B2B] truncate w-full">+ New Booking</span>
          </Link>

          <Link
            to="/admin/gallery?new=true"
            className="p-2.5 sm:p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] transition-all flex flex-col items-center text-center gap-1.5 group min-w-0"
          >
            <div className="p-2 rounded-md bg-[#F8F6F2] group-hover:bg-[#F4EFE6] text-[#9C7B3D] transition-colors">
              <Images className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#2B2B2B] truncate w-full">+ Upload Image</span>
          </Link>

          <Link
            to="/admin/portfolio?new=true"
            className="p-2.5 sm:p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] transition-all flex flex-col items-center text-center gap-1.5 group min-w-0"
          >
            <div className="p-2 rounded-md bg-[#F8F6F2] group-hover:bg-[#F4EFE6] text-[#9C7B3D] transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#2B2B2B] truncate w-full">+ Add Project</span>
          </Link>

          <Link
            to="/admin/services?new=true"
            className="p-2.5 sm:p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] transition-all flex flex-col items-center text-center gap-1.5 group min-w-0"
          >
            <div className="p-2 rounded-md bg-[#F8F6F2] group-hover:bg-[#F4EFE6] text-[#9C7B3D] transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#2B2B2B] truncate w-full">+ Add Service</span>
          </Link>

          <Link
            to="/admin/films?new=true"
            className="p-2.5 sm:p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] transition-all flex flex-col items-center text-center gap-1.5 group min-w-0"
          >
            <div className="p-2 rounded-md bg-[#F8F6F2] group-hover:bg-[#F4EFE6] text-[#9C7B3D] transition-colors">
              <Clapperboard className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#2B2B2B] truncate w-full">+ Add Film</span>
          </Link>
        </div>
      </div>

      {/* Analytics Section: Monthly Shoot Visualizer & Dynamic Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left: Monthly Shoots Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 border border-[#E7E0D2] shadow-sm space-y-5 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#6F6A62]">
                Studio Analytics
              </span>
              <h3 className="font-display font-semibold text-base sm:text-lg text-[#2B2B2B] truncate">
                Monthly Bookings &amp; Shoots
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[#F8F6F2] text-[#9C7B3D] rounded-full font-semibold border border-[#E7E0D2] shrink-0">
              {new Date().getFullYear()} Season
            </span>
          </div>

          {/* Minimalist Interactive Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 pt-8 pb-2 px-1 sm:px-2 border-b border-[#E7E0D2] relative">
            {monthlyData.map((item, idx) => {
              const heightPercent = Math.max(item.count > 0 ? 8 : 2, (item.count / maxCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-0">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-20">
                    <span className="bg-[#2B2B2B] text-[#E4D3A6] text-[10px] py-1 px-2 rounded-md font-bold shadow whitespace-nowrap">
                      {item.count} Shoot{item.count === 1 ? "" : "s"} ({item.revenue})
                    </span>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[42px] bg-[#F4EFE6] group-hover:bg-[#C9A669] rounded-t-xl transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#9C7B3D]/30 to-transparent opacity-0 group-hover:opacity-100" />
                  </div>
                  {/* Label */}
                  <span className="text-xs font-semibold text-[#6F6A62] mt-3 group-hover:text-[#2B2B2B]">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-[#6F6A62] pt-1 min-w-0">
            <span className="flex items-center gap-2 min-w-0 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A669] shrink-0" />
              <span className="truncate">Active Calendar Shoots &amp; Muhurtham Seasons</span>
            </span>
            <span className="font-semibold text-[#2B2B2B] shrink-0 pl-4 sm:pl-0">
              {totalBookings} Total Shoot{totalBookings === 1 ? "" : "s"} YTD
            </span>
          </div>
        </div>

        {/* Right: Popular Services Breakdown (Dynamically Computed) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 sm:p-5 border border-[#E7E0D2] shadow-sm space-y-4 min-w-0">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#6F6A62]">
              Package Demand
            </span>
            <h3 className="font-display font-semibold text-base sm:text-lg text-[#2B2B2B]">
              Popular Studio Services
            </h3>
          </div>

          <div className="space-y-4">
            {serviceStats.length > 0 ? (
              serviceStats.map((srv, idx) => (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between text-xs font-medium gap-2 min-w-0">
                    <span className="text-[#2B2B2B] truncate">{srv.name}</span>
                    <span className="text-[#9C7B3D] font-bold shrink-0 pl-2">
                      {srv.count} shoot{srv.count === 1 ? "" : "s"} ({srv.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F6F2] rounded-full overflow-hidden border border-[#E7E0D2]/80">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A669] to-[#9C7B3D] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(srv.percentage > 0 ? 4 : 0, srv.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6F6A62] py-4 text-center">
                No services configured yet.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#E7E0D2]/80">
            <Link
              to="/admin/services"
              className="text-xs text-[#9C7B3D] hover:underline font-semibold flex items-center justify-between"
            >
              <span>Manage Service Pricing &amp; Features</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Shoots & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upcoming Shoots Table */}
        <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 border border-[#E7E0D2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D2]">
            <div>
              <h3 className="font-display font-semibold text-base text-[#2B2B2B]">
                Upcoming Scheduled Shoots
              </h3>
              <p className="text-xs text-[#6F6A62]">Next client sessions in calendar order</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs text-[#9C7B3D] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="text-[#6F6A62] border-b border-[#F8F6F2]">
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F6F2]">
                {upcomingShoots.length > 0 ? (
                  upcomingShoots.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 font-medium text-[#2B2B2B]">
                        <div className="font-semibold">{b.customerName}</div>
                        <div className="text-[10px] text-[#8E867B]">{b.location}</div>
                      </td>
                      <td className="py-3 text-[#6F6A62]">{b.requiredService}</td>
                      <td className="py-3 font-medium text-[#2B2B2B]">
                        {b.eventDate
                          ? new Date(b.eventDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/bookings?id=${b.id}`)}
                          className="p-1.5 text-[#6F6A62] hover:text-[#9C7B3D] rounded-lg hover:bg-[#F8F6F2]"
                          title="View Shoot Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#6F6A62]">
                      No upcoming shoots scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enquiries Box */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 sm:p-5 border border-[#E7E0D2] shadow-sm space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D2]">
            <div>
              <h3 className="font-display font-semibold text-base text-[#2B2B2B]">
                Recent Client Enquiries
              </h3>
              <p className="text-xs text-[#6F6A62]">Leads received via website</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs text-[#9C7B3D] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEnquiries.length > 0 ? (
              recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => navigate("/admin/enquiries")}
                  className="p-3 rounded-lg border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] cursor-pointer transition-all space-y-1.5 min-w-0"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#2B2B2B] truncate">
                        {enq.clientName || enq.name || "Anonymous"}
                      </h4>
                      <p className="text-[11px] text-[#9C7B3D] font-medium truncate">
                        {enq.interestedService || enq.service || "General Inquiry"}
                      </p>
                    </div>
                    <StatusBadge status={enq.status} size="sm" />
                  </div>
                  <p className="text-xs text-[#6F6A62] line-clamp-2 leading-relaxed break-words">
                    "{enq.message || enq.notes || enq.clientMessage || "No message provided."}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#8E867B] pt-1">
                    <span>{enq.phone || "No phone"}</span>
                    <span>{enq.receivedDate || enq.createdAt || ""}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#6F6A62]">
                No client enquiries yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
