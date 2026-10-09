import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  User,
  Building,
  Bell,
  Save,
  Lock,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

function PasswordCredentialsCard({
  formId = "admin-profile-password-form",
  securityForm,
  setSecurityForm,
  handleSaveSecurity,
  savingPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  return (
    <form
      id={formId}
      onSubmit={handleSaveSecurity}
      className="bg-gray-50/70 rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
            Update Password &amp; Credentials
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Keep your studio administration portal protected.
          </p>
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60 cursor-pointer shrink-0"
        >
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <span>{savingPassword ? "Updating..." : "Change Password"}</span>
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={securityForm.currentPassword}
              onChange={(e) =>
                setSecurityForm({ ...securityForm, currentPassword: e.target.value })
              }
              className="w-full p-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label={
                showCurrentPassword ? "Hide current password" : "Show current password"
              }
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={securityForm.newPassword}
                onChange={(e) =>
                  setSecurityForm({ ...securityForm, newPassword: e.target.value })
                }
                className="w-full p-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Confirm New Password</label>
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
                className="w-full p-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

const VALID_TABS = ["profile", "studio", "notifications"];

export default function Settings() {
  const { adminUser, updateProfile, changePassword } = useAdminAuth();
  const { settings, updateSettings } = useAdminData();
  const { addToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const rawTab = searchParams.get("tab") || location.hash.replace("#", "");
    if (rawTab && VALID_TABS.includes(rawTab)) {
      return rawTab;
    }
    return "profile";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // If URL query points to removed security tab, cleanly sanitize the search param
  useEffect(() => {
    if (searchParams.get("tab") === "security") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("tab");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const currentTab = VALID_TABS.includes(activeTab) ? activeTab : "profile";

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
    if (securityForm.newPassword.length < 8) {
      addToast("New password must be at least 8 characters long.", "warning");
      return;
    }
    if (securityForm.currentPassword === securityForm.newPassword) {
      addToast("New password cannot be the same as the current password.", "warning");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E5EAF1] border border-[#CAD3DF] flex items-center justify-center text-[#334155] shadow-xs shrink-0">
          <SettingsIcon className="w-5 h-5 text-[#334155] stroke-[1.75]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Admin &amp; Studio Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure admin access credentials, studio business metadata, and alert preferences.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            currentTab === "profile"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            currentTab === "studio"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Studio Business Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            currentTab === "notifications"
              ? "bg-black text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts &amp; Notifications</span>
        </button>
      </div>

      {/* Tab: Profile */}
      {currentTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 lg:p-8 shadow-xs space-y-6">
            {/* Top Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 sm:pb-6 border-b border-gray-100 gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Admin Profile Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your director profile displayed across the admin portal and studio headers.
                </p>
              </div>
              <button
                type="submit"
                form="admin-profile-form"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>

            {/* Grid Layout: Left Photo, Right Fields + Password Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Photo Preview Column */}
              <div className="lg:col-span-5 xl:col-span-4 w-full flex flex-col justify-start">
                <div className="w-full max-w-[320px] sm:max-w-[340px] mx-auto lg:max-w-none lg:mx-0 [&_.group]:!max-w-none [&_.group]:!max-h-none [&_.group]:!w-full [&_.group]:!aspect-square [&_.group]:!h-auto [&_.group]:rounded-2xl [&_img]:!object-cover [&_img]:!object-top [&_.pointer-events-none]:hidden [&_.border-dashed]:!aspect-square [&_.border-dashed]:!h-auto [&_.border-dashed]:!max-w-none [&_.border-dashed]:rounded-2xl">
                  <ImageUploader
                    value={profileForm.avatar}
                    onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
                    label="Profile Avatar Photo"
                    aspect="portrait"
                    category="profile"
                    helpText="Portrait or square photo recommended (PNG, JPG, WEBP)."
                  />
                </div>
              </div>

              {/* Form Fields & Password Credentials Column */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-5 w-full min-w-0">
                {/* 1. Independent Profile Fields Form */}
                <form
                  id="admin-profile-form"
                  onSubmit={handleSaveProfile}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 block">
                        Admin Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.adminName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, adminName: e.target.value })
                        }
                        placeholder="Enter admin name"
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 block">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={profileForm.role}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, role: e.target.value })
                        }
                        placeholder="e.g. Studio Director & Lead Photographer"
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 block">
                        Admin Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        placeholder="admin@subashstudio.com"
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700 block">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        placeholder="+91 93457 06609"
                        className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </form>

                {/* 2. Compact Bordered Password & Credentials Section (Independent Sibling Form) */}
                <PasswordCredentialsCard
                  formId="admin-profile-password-form"
                  securityForm={securityForm}
                  setSecurityForm={setSecurityForm}
                  handleSaveSecurity={handleSaveSecurity}
                  savingPassword={savingPassword}
                  showCurrentPassword={showCurrentPassword}
                  setShowCurrentPassword={setShowCurrentPassword}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />

                {/* 3. Bottom Helper Text */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Updates to your credentials and contact information apply immediately across the studio portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Studio Business */}
      {currentTab === "studio" && (
        <form onSubmit={handleSaveStudio} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Studio Legal &amp; Business Info
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registered company name, tax registration, and default pricing currency.
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Studio Info</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 block">Registered Studio Name</label>
                <input
                  type="text"
                  value={studioForm.studioName}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, studioName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none font-semibold transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 block">Tagline</label>
                <input
                  type="text"
                  value={studioForm.tagline}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 block">GST / Tax Identification</label>
                <input
                  type="text"
                  value={studioForm.gstNumber}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, gstNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 block">Billing Currency</label>
                <input
                  type="text"
                  value={studioForm.currency}
                  onChange={(e) =>
                    setStudioForm({ ...studioForm, currency: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white focus:outline-none font-medium transition-colors"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Notifications */}
      {currentTab === "notifications" && (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 lg:p-8 shadow-xs space-y-6 max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Alert &amp; Lead Notification Triggers
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Control WhatsApp and enquiry indicators for new leads.
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Alerts</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50/70 cursor-pointer transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={notifForm.bookingAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, bookingAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black/20 accent-black"
                />
                <div>
                  <span className="font-semibold text-gray-900 block text-xs">New Shoot Booking Notifications</span>
                  <span className="text-gray-500 text-xs mt-0.5 block">Receive immediate app notification when a new shoot is scheduled.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50/70 cursor-pointer transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={notifForm.enquiryAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, enquiryAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black/20 accent-black"
                />
                <div>
                  <span className="font-semibold text-gray-900 block text-xs">Website Lead Enquiry Alerts</span>
                  <span className="text-gray-500 text-xs mt-0.5 block">Show red badge indicator in top navigation bar for unread leads.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50/70 cursor-pointer transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={notifForm.whatsappAlerts}
                  onChange={(e) =>
                    setNotifForm({ ...notifForm, whatsappAlerts: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black/20 accent-black"
                />
                <div>
                  <span className="font-semibold text-gray-900 block text-xs">WhatsApp Lead Forwarding</span>
                  <span className="text-gray-500 text-xs mt-0.5 block">Forward incoming bride/groom enquiries directly to studio owner WhatsApp.</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
