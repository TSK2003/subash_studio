import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PanelsTopLeft,
  Home,
  Info,
  PhoneCall,
  Save,
  CheckCircle2,
  Sparkles,
  Clock,
  Share2,
  Loader2,
  Edit3,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import ImageUploader from "../components/ImageUploader";
import HeroImageManager from "../components/HeroImageManager";
import AboutContentEditor from "../components/about/AboutContentEditor";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function WebsiteContent() {
  const { websiteContent, updateWebsiteContent, getMediaLibrary } = useAdminData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("home");
  const [savingSection, setSavingSection] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Local editable copies
  const [homeForm, setHomeForm] = useState(websiteContent?.home || {});
  const [aboutForm, setAboutForm] = useState(websiteContent?.about || {});
  const [contactForm, setContactForm] = useState(websiteContent?.contact || {});
  const [formErrors, setFormErrors] = useState({});

  // Keep local tabs synced when context updates
  useEffect(() => {
    if (websiteContent?.home) setHomeForm(websiteContent.home);
    if (websiteContent?.about) setAboutForm(websiteContent.about);
    if (websiteContent?.contact) setContactForm(websiteContent.contact);
  }, [websiteContent]);

  const [editingField, setEditingField] = useState(null);
  const [savingField, setSavingField] = useState(null);

  const HERO_FIELDS = [
    {
      key: "heroMainTitle",
      fallbackKey: "heroHeading",
      label: "Main Title",
      defaultValue: "SUBASH STUDIO",
      max: 100,
      description: "Primary headline for the studio (largest and strongest luxury headline).",
    },
    {
      key: "heroSubtitle",
      fallbackKey: "heroEyebrow",
      label: "Subtitle",
      defaultValue: "WEDDING FILM COMPANY",
      max: 100,
      description: "Elegant secondary line defining your atelier craft (use 'FILM', not 'FLIM').",
    },
    {
      key: "heroSinceText",
      fallbackKey: null,
      label: "Since Text",
      defaultValue: "SINCE 1933",
      max: 50,
      description: "Refined heritage accent line establishing studio legacy and trust.",
    },
    {
      key: "heroDeliveryTagline",
      fallbackKey: "heroTagline",
      label: "Delivery Tagline",
      defaultValue: "WE PROMISE ON TIME DELIVERY",
      max: 120,
      description: "Premium supporting brand promise, clearly visible on the hero.",
    },
  ];

  const getFieldValue = (field) => {
    if (homeForm[field.key] !== undefined && homeForm[field.key] !== null) {
      return homeForm[field.key];
    }
    if (field.fallbackKey && homeForm[field.fallbackKey] !== undefined && homeForm[field.fallbackKey] !== null) {
      if (field.key === "heroDeliveryTagline" && homeForm.heroTagline?.includes("Preserving timeless heritage")) {
        return field.defaultValue;
      }
      return homeForm[field.fallbackKey];
    }
    return field.defaultValue;
  };

  const handleFieldChange = (key, val) => {
    setHomeForm((prev) => ({
      ...prev,
      [key]: val,
    }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const buildHomePayload = () => {
    const mainTitle = (getFieldValue(HERO_FIELDS[0]) || "SUBASH STUDIO").trim();
    const subtitle = (getFieldValue(HERO_FIELDS[1]) || "WEDDING FILM COMPANY").trim();
    const sinceText = (getFieldValue(HERO_FIELDS[2]) || "SINCE 1933").trim();
    const deliveryTagline = (getFieldValue(HERO_FIELDS[3]) || "WE PROMISE ON TIME DELIVERY").trim();

    return {
      ...homeForm,
      heroMainTitle: mainTitle,
      heroHeading: mainTitle,
      heroSubtitle: subtitle,
      heroEyebrow: subtitle,
      heroSinceText: sinceText,
      heroDeliveryTagline: deliveryTagline,
      heroTagline: deliveryTagline,
      heroImages: Array.isArray(homeForm.heroImages) ? homeForm.heroImages : [],
      heroImageLoop: homeForm.heroImageLoop !== false,
      heroCtaText: "BOOK A SHOOT",
    };
  };

  const handleSaveIndividualField = async (fieldKey, fieldLabel) => {
    const field = HERO_FIELDS.find((f) => f.key === fieldKey);
    const val = getFieldValue(field);
    if (!val || String(val).trim().length === 0) {
      setFormErrors((prev) => ({ ...prev, [fieldKey]: `${fieldLabel} cannot be empty.` }));
      addToast(`${fieldLabel} cannot be empty.`, "error");
      return;
    }
    if (String(val).length > field.max) {
      setFormErrors((prev) => ({ ...prev, [fieldKey]: `${fieldLabel} cannot exceed ${field.max} characters.` }));
      addToast(`${fieldLabel} exceeds maximum character limit.`, "error");
      return;
    }

    try {
      setSavingField(fieldKey);
      const payload = buildHomePayload();
      const updated = await updateWebsiteContent("home", payload);
      if (updated) setHomeForm(updated);
      addToast(`${fieldLabel} updated successfully.`, "success");
      setEditingField(null);
    } catch (err) {
      addToast(err?.message || `Failed to update ${fieldLabel}.`, "error");
    } finally {
      setSavingField(null);
    }
  };

  const handleSaveHome = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const errors = {};
    HERO_FIELDS.forEach((field) => {
      const val = getFieldValue(field);
      if (!val || String(val).trim().length === 0) {
        errors[field.key] = `${field.label} cannot be empty.`;
      } else if (String(val).length > field.max) {
        errors[field.key] = `${field.label} cannot exceed ${field.max} characters (currently ${val.length}).`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast("Please satisfy character count limits before saving.", "error");
      return;
    }

    if (isImageUploading) {
      addToast("Please wait for all image uploads to finish before saving.", "warning");
      return;
    }

    setFormErrors({});
    try {
      setSavingSection("home");
      const payload = buildHomePayload();
      const updated = await updateWebsiteContent("home", payload);
      if (updated) setHomeForm(updated);
      setEditingField(null);
      addToast("Homepage Hero content saved successfully.", "success");
    } catch (err) {
      addToast(err?.message || "Failed to save Homepage content.", "error");
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAbout = async (payload, targetSection = "all") => {
    try {
      setSavingSection(targetSection === "all" ? "about" : targetSection);
      const updated = await updateWebsiteContent("about", payload);
      if (updated) setAboutForm(updated);
      const label = targetSection === "all" ? "About Page content" : `About ${targetSection}`;
      addToast(`${label} saved successfully.`, "success");
      return updated;
    } catch (err) {
      addToast(err?.message || "Failed to save About content.", "error");
      throw err;
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      setSavingSection("contact");
      const updated = await updateWebsiteContent("contact", contactForm);
      if (updated) setContactForm(updated);
      addToast("Contact & Social details updated successfully.", "success");
    } catch (err) {
      addToast(err?.message || "Failed to save Contact details.", "error");
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E5EAF1] text-[#334155] flex items-center justify-center border border-[#CAD3DF] shadow-xs">
          <PanelsTopLeft className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Website Content Management (CMS)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Edit headlines, hero banners, studio story paragraphs, and contact information displayed across the public website.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "home"
              ? "bg-black text-white shadow-xs font-medium"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Homepage Hero</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "about"
              ? "bg-black text-white shadow-xs font-medium"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Studio &amp; Story</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "contact"
              ? "bg-black text-white shadow-xs font-medium"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact &amp; Social Links</span>
        </button>
      </div>

      {/* Tab 1: Homepage */}
      {activeTab === "home" && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span>Hero Section Content</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase tracking-wider border border-gray-200">
                    4 Core Fields
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The primary headlines and brand statements visitors see upon landing on SUBASH STUDIO.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={savingSection !== null || savingField !== null}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {savingSection === "home" ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-white" />
                  )}
                  <span>{savingSection === "home" ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* HERO SECTION CONTENT (4 EDITABLE TEXT FIELDS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Editorial Text Hierarchy
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Click &ldquo;Edit&rdquo; on any field to modify or save independently
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {HERO_FIELDS.map((field, idx) => {
                    const isEditing = editingField === field.key;
                    const isSavingThis = savingField === field.key;
                    const currentVal = getFieldValue(field);
                    const charCount = (currentVal || "").length;
                    const hasError = formErrors[field.key];

                    return (
                      <div
                        key={field.key}
                        className={`rounded-xl border transition-all ${
                          isEditing
                            ? "border-black bg-gray-50/60 shadow-xs p-4 sm:p-5"
                            : "border-gray-200 bg-white hover:bg-gray-50/50 p-4"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-semibold text-gray-900 tracking-wide uppercase">
                                {idx + 1}. {field.label}
                              </span>
                              <span className="text-[10.5px] text-gray-400">
                                (Max {field.max} chars)
                              </span>
                            </div>

                            {!isEditing ? (
                              <div className="mt-1">
                                <p className="text-sm font-semibold text-gray-900 tracking-wide break-words">
                                  {currentVal || <span className="text-gray-400 italic">Not set</span>}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1">
                                  {field.description}
                                </p>
                              </div>
                            ) : (
                              <div className="mt-2.5 space-y-2">
                                <input
                                  id={`cms-${field.key}`}
                                  type="text"
                                  maxLength={field.max}
                                  value={currentVal}
                                  onChange={(e) => handleFieldChange(field.key, e.target.value.slice(0, field.max))}
                                  placeholder={field.defaultValue}
                                  autoFocus
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all shadow-xs"
                                />
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-gray-400">{field.description}</span>
                                  <span
                                    className={
                                      charCount > field.max
                                        ? "text-rose-600 font-semibold"
                                        : "text-gray-500 font-medium"
                                    }
                                  >
                                    {charCount} / {field.max}
                                  </span>
                                </div>
                                {hasError && (
                                  <p className="text-[11px] text-rose-600 font-medium">{hasError}</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="shrink-0 flex items-center gap-2 pt-0.5">
                            {!isEditing ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingField(field.key);
                                  if (homeForm[field.key] === undefined) {
                                    setHomeForm((prev) => ({
                                      ...prev,
                                      [field.key]: getFieldValue(field),
                                    }));
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isSavingThis}
                                  onClick={() => handleSaveIndividualField(field.key, field.label)}
                                  className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                                >
                                  {isSavingThis ? (
                                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5 text-white" />
                                  )}
                                  <span>Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingField(null)}
                                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors cursor-pointer"
                                >
                                  Done
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HERO IMAGES SECTION */}
              <HeroImageManager
                images={Array.isArray(homeForm.heroImages) ? homeForm.heroImages : []}
                onChange={(updatedImages) => {
                  if (typeof updatedImages === "function") {
                    setHomeForm((prev) => ({
                      ...prev,
                      heroImages: updatedImages(prev.heroImages || []),
                    }));
                  } else {
                    setHomeForm((prev) => ({ ...prev, heroImages: updatedImages }));
                  }
                }}
                loopEnabled={homeForm.heroImageLoop !== false}
                onLoopChange={(loop) =>
                  setHomeForm((prev) => ({ ...prev, heroImageLoop: loop }))
                }
                disabled={savingSection !== null}
                onUploadingStateChange={setIsImageUploading}
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: About Studio */}
      {activeTab === "about" && (
        <AboutContentEditor
          aboutData={aboutForm}
          onSave={handleSaveAbout}
          isSaving={savingSection !== null}
          savingSection={savingSection}
          getMediaLibrary={getMediaLibrary}
          addToast={addToast}
        />
      )}

      {/* Tab 3: Contact & Social */}
      {activeTab === "contact" && (
        <form onSubmit={handleSaveContact} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Studio Contact Details &amp; Social Channels
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage central phone number, WhatsApp, email address, and social links.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingSection !== null}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium flex items-center gap-2 shadow-xs transition-colors active:scale-95 disabled:opacity-60"
              >
                {savingSection === "contact" ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>{savingSection === "contact" ? "Saving..." : "Save Contact Details"}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Primary Phone</label>
                  <input
                    type="text"
                    value={contactForm.phone || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={contactForm.whatsapp || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, whatsapp: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Studio Email</label>
                  <input
                    type="email"
                    value={contactForm.email || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Business &amp; Atelier Hours</label>
                <input
                  type="text"
                  value={contactForm.hours || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, hours: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="font-semibold text-sm text-gray-900">
                  Social Media Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                      <FaInstagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>Instagram URL</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.instagram || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, instagram: e.target.value })
                      }
                      className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                      <FaFacebookF className="w-3.5 h-3.5 text-blue-600" />
                      <span>Facebook URL</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.facebook || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, facebook: e.target.value })
                      }
                      className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                      <FaYoutube className="w-3.5 h-3.5 text-red-600" />
                      <span>YouTube Channel</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.youtube || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, youtube: e.target.value })
                      }
                      className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
