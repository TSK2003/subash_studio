import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Building,
  Bell,
  Save,
  Lock,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { adminUser, updateProfile, changePassword } = useAdminAuth();
  const {
    settings,
    updateSettings,
    resetAllDemoData,
    bookings,
    enquiries,
    gallery,
    portfolio,
    services,
    films,
    branches,
    testimonials,
    websiteContent,
    frameWoodTypes,
    frameDesigns,
    frameRatios,
    frameOrders,
  } = useAdminData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    adminName: adminUser?.name || "Subash",
    role: adminUser?.role || "Studio Director & Lead Photographer",
    email: adminUser?.email || "subashstudio009@gmail.com",
    avatar: adminUser?.avatar || "/images/admin/profile.png",
    phone: "+91 93457 06609",
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Studio Form
  const [studioForm, setStudioForm] = useState(
    settings.studio || {
      studioName: "SUBASH STUDIO",
      tagline: "Fine Photography & Cinematic Films",
      gstNumber: "33AAAAA0000A1Z5",
      currency: "INR (₹)",
    }
  );

  // Notification Form
  const [notifForm, setNotifForm] = useState(
    settings.notifications || {
      bookingAlerts: true,
      enquiryAlerts: true,
      emailDigest: true,
      whatsappAlerts: true,
    }
  );

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.adminName,
      role: profileForm.role,
      email: profileForm.email,
      avatar: profileForm.avatar,
    });
    updateSettings("profile", profileForm);
    addToast("Admin profile updated successfully.", "success");
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword.trim()) {
      addToast("Please enter your current password.", "warning");
      return;
    }
    if (!securityForm.newPassword.trim()) {
      addToast("Please enter a new password.", "warning");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    if (securityForm.newPassword.length < 4) {
      addToast("New password must be at least 4 characters long.", "warning");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(securityForm.currentPassword, securityForm.newPassword);
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      addToast("Admin password changed successfully! Please use it on your next login.", "success");
    } catch (err) {
      addToast(err.message || "Failed to update password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveStudio = (e) => {
    e.preventDefault();
    updateSettings("studio", studioForm);
    addToast("Studio settings saved.", "success");
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    updateSettings("notifications", notifForm);
    addToast("Notification preferences updated.", "success");
  };

  const handleExportDataSnapshot = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      studio: "SUBASH STUDIO",
      counts: {
        bookings: bookings.length,
        enquiries: enquiries.length,
        gallery: gallery.length,
        portfolio: (portfolio || []).length,
        services: services.length,
        films: (films || []).length,
        branches: branches.length,
        testimonials: (testimonials || []).length,
        frameOrders: (frameOrders || []).length,
      },
      bookings,
      enquiries,
      gallery,
      portfolio,
      services,
      films,
      branches,
      testimonials,
      websiteContent,
      settings,
      frameWoodTypes,
      frameDesigns,
      frameRatios,
      frameOrders,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `subash_studio_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("Complete studio backup exported as JSON.", "success");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
          Admin &amp; Studio Settings
        </h2>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          Configure admin access credentials, studio business metadata, and alert preferences.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E7E0D2] pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "profile"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "security"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "studio"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Studio Business Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "notifications"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts &amp; Notifications</span>
        </button>
      </div>

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Admin Profile Details
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Your user identity displayed in the sidebar and header.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ImageUploader
                  value={profileForm.avatar}
                  onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
                  label="Profile Avatar Photo"
                />
              </div>

              <div className="md:col-span-2 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.adminName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, adminName: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Designation / Role</label>
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, role: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62]">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <form onSubmit={handleSaveSecurity} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Update Password &amp; Credentials
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Keep your studio administration portal protected.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                <Lock className="w-4 h-4 text-[#E4D3A6]" />
                <span>{savingPassword ? "Updating..." : "Change Password"}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={securityForm.currentPassword}
                    onChange={(e) =>
                      setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                    }
                    className="w-full p-2.5 pr-10 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B]"
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={securityForm.newPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, newPassword: e.target.value })
                      }
                      className="w-full p-2.5 pr-10 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B]"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={securityForm.confirmPassword}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full p-2.5 pr-10 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B]"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Studio Business */}
      {activeTab === "studio" && (
        <form onSubmit={handleSaveStudio} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Studio Legal &amp; Business Info
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Registered company name, tax registration and default pricing currency.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save Studio Info</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Registered Studio Name</label>
                <input
                  type="text"
                  value={studioForm.studioName}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, studioName: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Tagline</label>
                <input
                  type="text"
                  value={studioForm.tagline}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, tagline: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">GST / Tax Identification</label>
                <input
                  type="text"
                  value={studioForm.gstNumber}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, gstNumber: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Billing Currency</label>
                <input
                  type="text"
                  value={studioForm.currency}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, currency: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Notifications */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E7E0D2] p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Alert &amp; Lead Notification Triggers
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Control SMS, WhatsApp and email triggers for new leads.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save Alerts</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#E7E0D2] hover:bg-[#FDFBF7] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifForm.bookingAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, bookingAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-[#9C7B3D] focus:ring-[#C9A669]"
                />
                <div>
                  <span className="font-bold text-[#2B2B2B] block">New Shoot Booking Notifications</span>
                  <span className="text-[#6F6A62]">Receive immediate app notification when a new shoot is scheduled.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#E7E0D2] hover:bg-[#FDFBF7] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifForm.enquiryAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, enquiryAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-[#9C7B3D] focus:ring-[#C9A669]"
                />
                <div>
                  <span className="font-bold text-[#2B2B2B] block">Website Lead Enquiry Alerts</span>
                  <span className="text-[#6F6A62]">Show red badge indicator in top navigation bar for unread leads.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#E7E0D2] hover:bg-[#FDFBF7] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifForm.whatsappAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, whatsappAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-[#9C7B3D] focus:ring-[#C9A669]"
                />
                <div>
                  <span className="font-bold text-[#2B2B2B] block">WhatsApp Lead Forwarding</span>
                  <span className="text-[#6F6A62]">Forward incoming bride/groom enquiries directly to studio owner WhatsApp.</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Data Backup & System Management */}
      <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-display font-bold text-[#2B2B2B]">
            Data Management &amp; Backup
          </h3>
          <p className="text-xs text-[#6F6A62]">
            Export snapshots or reset mock demonstration data for client presentations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportDataSnapshot}
            className="px-4 py-2.5 rounded-xl border border-[#E7E0D2] hover:border-[#C9A669] hover:bg-[#FDFBF7] text-xs font-semibold text-[#2B2B2B] flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-[#9C7B3D]" />
            <span>Export Data Snapshot (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all data back to original demo seeds?")) {
                resetAllDemoData();
                addToast("All studio demo data reset.", "info");
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-amber-700" />
            <span>Reset Demo Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
