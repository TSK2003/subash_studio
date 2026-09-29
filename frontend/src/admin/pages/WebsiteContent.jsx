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
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import ImageUploader from "../components/ImageUploader";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function WebsiteContent() {
  const { websiteContent, updateWebsiteContent } = useAdminData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("home");
  const [savingSection, setSavingSection] = useState(null);

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

  const headlineChars = (homeForm.heroHeading || "").length;
  const subtitleChars = (homeForm.heroTagline || "").length;

  const handleHeadlineChange = (e) => {
    // Limit typed or pasted content to maximum 20 characters
    const val = e.target.value.slice(0, 20);
    setHomeForm((prev) => ({ ...prev, heroHeading: val }));
    if (formErrors.heroHeading && val.length <= 20) {
      setFormErrors((prev) => ({ ...prev, heroHeading: null }));
    }
  };

  const handleTaglineChange = (e) => {
    // Limit typed or pasted content to maximum 150 characters
    const val = e.target.value.slice(0, 150);
    setHomeForm((prev) => ({ ...prev, heroTagline: val }));
    if (formErrors.heroTagline && val.length <= 150) {
      setFormErrors((prev) => ({ ...prev, heroTagline: null }));
    }
  };

  const handleSaveHome = async (e) => {
    e.preventDefault();
    const heading = homeForm.heroHeading !== undefined ? String(homeForm.heroHeading) : "";
    const tagline = homeForm.heroTagline !== undefined ? String(homeForm.heroTagline) : "";

    const errors = {};
    if (heading.length > 20) {
      errors.heroHeading = `Hero Main Headline cannot exceed 20 characters (currently ${heading.length}).`;
    }

    if (tagline.length > 150) {
      errors.heroTagline = `Hero Subtitle / Tagline cannot exceed 150 characters (currently ${tagline.length}).`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast("Please satisfy the character count limits before saving.", "error");
      return;
    }

    setFormErrors({});
    try {
      setSavingSection("home");
      const payload = {
        ...homeForm,
        heroHeading: heading,
        heroTagline: tagline,
        heroCtaText: "BOOK A SHOOT",
      };
      const updated = await updateWebsiteContent("home", payload);
      if (updated) setHomeForm(updated);
      addToast("Homepage CMS content saved successfully.", "success");
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
          Edit headlines, hero banners, studio story paragraphs, stats, and contact information displayed across the public website.
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
          <span>Homepage Hero &amp; Stats</span>
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
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D2]">
              <div>
                <h3 className="text-lg font-display font-bold text-[#2B2B2B]">
                  Hero Banner Section
                </h3>
                <p className="text-xs text-[#6F6A62]">
                  The first visual headline brides and grooms see upon landing on SUBASH STUDIO.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingSection !== null}
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {savingSection === "home" ? (
                  <Loader2 className="w-4 h-4 text-[#E4D3A6] animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-[#E4D3A6]" />
                )}
                <span>{savingSection === "home" ? "Saving..." : "Save Homepage"}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="cms-heroHeading" className="font-semibold text-[#6F6A62]">
                    Hero Main Headline
                  </label>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      headlineChars > 20
                        ? "text-rose-600 font-semibold"
                        : "text-[#9C7B3D]"
                    }`}
                  >
                    {headlineChars} / 20
                  </span>
                </div>
                <input
                  id="cms-heroHeading"
                  type="text"
                  maxLength={20}
                  placeholder="e.g. Subash Photography"
                  value={homeForm.heroHeading || ""}
                  onChange={handleHeadlineChange}
                  className={`w-full p-3 bg-[#F8F6F2] border ${
                    formErrors.heroHeading ? "border-rose-400" : "border-[#E7E0D2]"
                  } rounded-xl text-sm font-display font-bold text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none transition-colors`}
                />
                {formErrors.heroHeading && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.heroHeading}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="cms-heroTagline" className="font-semibold text-[#6F6A62]">
                    Hero Subtitle / Tagline
                  </label>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      subtitleChars > 150
                        ? "text-rose-600 font-semibold"
                        : "text-[#9C7B3D]"
                    }`}
                  >
                    {subtitleChars} / 150
                  </span>
                </div>
                <textarea
                  id="cms-heroTagline"
                  rows={4}
                  maxLength={150}
                  placeholder="Enter a descriptive subtitle (up to 150 characters)..."
                  value={homeForm.heroTagline || ""}
                  onChange={handleTaglineChange}
                  className={`w-full p-3 bg-[#F8F6F2] border ${
                    formErrors.heroTagline ? "border-rose-400" : "border-[#E7E0D2]"
                  } rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none leading-relaxed resize-none transition-colors`}
                />
                {formErrors.heroTagline && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.heroTagline}</p>
                )}
              </div>
            </div>

            {/* Studio Metrics / Statistics */}
            <div className="pt-6 border-t border-[#E7E0D2] space-y-4">
              <h4 className="font-display font-semibold text-sm text-[#2B2B2B]">
                Studio Milestone Counters (Stats Bar)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Weddings Captured</label>
                  <input
                    type="text"
                    value={homeForm.stats?.weddingsCaptured || "1,200+"}
                    onChange={(e) =>
                      setHomeForm({
                        ...homeForm,
                        stats: {
                          ...homeForm.stats,
                          weddingsCaptured: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Years of Craft</label>
                  <input
                    type="text"
                    value={homeForm.stats?.yearsOfCraft || "18+"}
                    onChange={(e) =>
                      setHomeForm({
                        ...homeForm,
                        stats: { ...homeForm.stats, yearsOfCraft: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Signature Films</label>
                  <input
                    type="text"
                    value={homeForm.stats?.signatureFilms || "450+"}
                    onChange={(e) =>
                      setHomeForm({
                        ...homeForm,
                        stats: { ...homeForm.stats, signatureFilms: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#6F6A62]">Happy Families</label>
                  <input
                    type="text"
                    value={homeForm.stats?.happyFamilies || "2,800+"}
                    onChange={(e) =>
                      setHomeForm({
                        ...homeForm,
                        stats: { ...homeForm.stats, happyFamilies: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none font-bold"
                  />
                </div>
              </div>
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
