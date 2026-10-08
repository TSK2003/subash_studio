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
      className="bg-[#FAF8F5] rounded-xl sm:rounded-2xl border border-[#E7E0D2] p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-[#E7E0D2] gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-display font-bold text-[#2B2B2B]">
            Update Password &amp; Credentials
          </h3>
          <p className="text-[11px] sm:text-xs text-[#6F6A62]">
            Keep your studio administration portal protected.
          </p>
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
        >
          <Lock className="w-3.5 h-3.5 text-[#E4D3A6]" />
          <span>{savingPassword ? "Updating..." : "Change Password"}</span>
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
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
              className="w-full p-2.5 pr-10 bg-white border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B] cursor-pointer"
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
            <label className="font-semibold text-[#6F6A62]">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={securityForm.newPassword}
                onChange={(e) =>
                  setSecurityForm({ ...securityForm, newPassword: e.target.value })
                }
                className="w-full p-2.5 pr-10 bg-white border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B] cursor-pointer"
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
                className="w-full p-2.5 pr-10 bg-white border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B] cursor-pointer"
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
            currentTab === "profile"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentTab === "studio"
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
            currentTab === "notifications"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts &amp; Notifications</span>
        </button>
      </div>

      {/* Tab: Profile */}
      {currentTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E7E0D2] p-5 sm:p-6 lg:p-8 shadow-sm transition-all space-y-6">
            {/* Top Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 sm:pb-6 border-b border-[#E7E0D2] gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
                  Admin Profile Details
                </h3>
                <p className="text-xs sm:text-sm text-[#6F6A62] mt-0.5">
                  Your director profile displayed across the admin portal and studio headers.
                </p>
              </div>
              <button
                type="submit"
                form="admin-profile-form"
                className="self-start sm:self-auto px-6 py-2.5 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
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
                      <label className="text-xs sm:text-sm font-semibold text-[#2B2B2B] block">
                        Admin Full Name <span className="text-[#9C7B3D]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.adminName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, adminName: e.target.value })
                        }
                        placeholder="Enter admin name"
                        className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs sm:text-sm text-[#2B2B2B] focus:border-[#C9A669] focus:bg-white focus:outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-[#2B2B2B] block">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={profileForm.role}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, role: e.target.value })
                        }
                        placeholder="e.g. Studio Director & Lead Photographer"
                        className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs sm:text-sm text-[#2B2B2B] focus:border-[#C9A669] focus:bg-white focus:outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-[#2B2B2B] block">
                        Admin Email <span className="text-[#9C7B3D]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        placeholder="admin@subashstudio.com"
                        className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs sm:text-sm text-[#2B2B2B] focus:border-[#C9A669] focus:bg-white focus:outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-[#2B2B2B] block">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        placeholder="+91 93457 06609"
                        className="w-full px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs sm:text-sm text-[#2B2B2B] focus:border-[#C9A669] focus:bg-white focus:outline-none transition-all font-medium"
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
                <div className="pt-3 border-t border-[#E7E0D2]/80">
                  <p className="text-xs text-[#6F6A62]">
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
      {currentTab === "notifications" && (
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

    </div>
  );
}
