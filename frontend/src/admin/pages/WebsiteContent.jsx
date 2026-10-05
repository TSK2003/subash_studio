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
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function WebsiteContent() {
  const { websiteContent, updateWebsiteContent } = useAdminData();
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

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      setSavingSection("about");
      const updated = await updateWebsiteContent("about", aboutForm);
      if (updated) setAboutForm(updated);
      addToast("About Page content saved successfully.", "success");
    } catch (err) {
      addToast(err?.message || "Failed to save About content.", "error");
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2B2B2B]">
          Website Content Management (CMS)
        </h2>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          Edit headlines, hero banners, studio story paragraphs, and contact information displayed across the public website.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E0D2] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "home"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Homepage Hero</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "about"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Studio &amp; Story</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "contact"
              ? "bg-[#2B2B2B] text-[#E4D3A6] shadow-sm"
              : "text-[#6F6A62] hover:text-[#2B2B2B] hover:bg-white"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact &amp; Social Links</span>
        </button>
      </div>

      {/* Tab 1: Homepage */}
      {activeTab === "home" && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E0D2] gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B] flex items-center gap-2">
                  <span>Hero Section Content</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4D3A6]/25 text-[#9C7B3D] font-sans font-semibold uppercase tracking-wider">
                    4 Core Fields
                  </span>
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  The first visual headlines brides and grooms see upon landing on SUBASH STUDIO.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={savingSection !== null || savingField !== null}
                  className="px-4 sm:px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {savingSection === "home" ? (
                    <Loader2 className="w-4 h-4 text-[#E4D3A6] animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-[#E4D3A6]" />
                  )}
                  <span>{savingSection === "home" ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* HERO SECTION CONTENT (4 EDITABLE TEXT FIELDS) */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E7E0D2]/60">
                  <span className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider">
                    Editorial Text Hierarchy
                  </span>
                  <span className="text-[11px] text-[#8C8275]">
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
                            ? "border-[#C9A669] bg-[#FAF8F5] shadow-xs p-4 sm:p-5"
                            : "border-[#E7E0D2] bg-[#FBF9F6]/70 hover:bg-[#FBF9F6] p-4"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11.5px] font-bold text-[#9C7B3D] tracking-wide uppercase">
                                {idx + 1}. {field.label}
                              </span>
                              <span className="text-[10.5px] text-[#8C8275]">
                                (Max {field.max} chars)
                              </span>
                            </div>

                            {!isEditing ? (
                              <div className="mt-1">
                                <p className="text-sm font-semibold text-[#2B2B2B] tracking-wide break-words">
                                  {currentVal || <span className="text-[#8C8275] italic">Not set</span>}
                                </p>
                                <p className="text-[11px] text-[#8C8275] mt-1">
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
                                  className="w-full p-2.5 bg-white border border-[#E7E0D2] rounded-lg text-xs font-semibold text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none transition-colors shadow-2xs"
                                />
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-[#8C8275]">{field.description}</span>
                                  <span
                                    className={
                                      charCount > field.max
                                        ? "text-rose-600 font-semibold"
                                        : "text-[#9C7B3D] font-medium"
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
                                className="px-3.5 py-1.5 rounded-lg border border-[#E7E0D2] bg-white hover:bg-[#F4EFE6] text-[#2B2B2B] hover:text-[#9C7B3D] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
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
                                  className="px-3 py-1.5 rounded-lg bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
                                >
                                  {isSavingThis ? (
                                    <Loader2 className="w-3.5 h-3.5 text-[#E4D3A6] animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5 text-[#E4D3A6]" />
                                  )}
                                  <span>Save</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingField(null)}
                                  className="px-2.5 py-1.5 rounded-lg border border-[#E7E0D2] bg-white hover:bg-[#F4EFE6] text-[#6F6A62] text-xs font-medium transition-all cursor-pointer"
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

              {/* HERO IMAGES SECTION (Screenshot 2) */}
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
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Studio Story &amp; Philosophy
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Customize the About page background story, heritage, and creative vision.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingSection !== null}
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {savingSection === "about" ? (
                  <Loader2 className="w-4 h-4 text-[#E4D3A6] animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-[#E4D3A6]" />
                )}
                <span>{savingSection === "about" ? "Saving..." : "Save About Content"}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#6F6A62]">About Page Heading</label>
                  <input
                    type="text"
                    value={aboutForm.heading || ""}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, heading: e.target.value })
                    }
                    className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-sm font-display font-bold text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Established Year</label>
                  <input
                    type="text"
                    value={aboutForm.establishedYear || ""}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        establishedYear: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-sm font-bold text-[#9C7B3D] focus:border-[#C9A669] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Studio Story &amp; History</label>
                <textarea
                  rows={4}
                  value={aboutForm.studioStory || ""}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, studioStory: e.target.value })
                  }
                  className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] leading-relaxed focus:border-[#C9A669] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Artistic Philosophy</label>
                <textarea
                  rows={3}
                  value={aboutForm.philosophy || ""}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, philosophy: e.target.value })
                  }
                  className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] leading-relaxed focus:border-[#C9A669] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Contact & Social */}
      {activeTab === "contact" && (
        <form onSubmit={handleSaveContact} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E7E0D2] p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Studio Contact Details &amp; Social Channels
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  Manage central phone number, WhatsApp, email address, and social links.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingSection !== null}
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {savingSection === "contact" ? (
                  <Loader2 className="w-4 h-4 text-[#E4D3A6] animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-[#E4D3A6]" />
                )}
                <span>{savingSection === "contact" ? "Saving..." : "Save Contact Details"}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Primary Phone</label>
                  <input
                    type="text"
                    value={contactForm.phone || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={contactForm.whatsapp || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, whatsapp: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Studio Email</label>
                  <input
                    type="email"
                    value={contactForm.email || ""}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#6F6A62]">Business &amp; Atelier Hours</label>
                <input
                  type="text"
                  value={contactForm.hours || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, hours: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-medium"
                />
              </div>

              <div className="pt-4 border-t border-[#E7E0D2] space-y-4">
                <h4 className="font-display font-semibold text-sm text-[#2B2B2B]">
                  Social Media Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62] flex items-center gap-1.5">
                      <FaInstagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>Instagram URL</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.instagram || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, instagram: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62] flex items-center gap-1.5">
                      <FaFacebookF className="w-3.5 h-3.5 text-blue-600" />
                      <span>Facebook URL</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.facebook || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, facebook: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#6F6A62] flex items-center gap-1.5">
                      <FaYoutube className="w-3.5 h-3.5 text-red-600" />
                      <span>YouTube Channel</span>
                    </label>
                    <input
                      type="url"
                      value={contactForm.youtube || ""}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, youtube: e.target.value })
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
    </div>
  );
}
