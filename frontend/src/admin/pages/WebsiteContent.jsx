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
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import ImageUploader from "../components/ImageUploader";
import { useAdminData } from "../context/AdminDataContext";
import { useToast } from "../context/ToastContext";

export default function WebsiteContent() {
  const { websiteContent, updateWebsiteContent } = useAdminData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("home");

  // Local editable copies
  const [homeForm, setHomeForm] = useState(websiteContent?.home || {});
  const [aboutForm, setAboutForm] = useState(websiteContent?.about || {});
  const [contactForm, setContactForm] = useState(websiteContent?.contact || {});

  // Keep local tabs synced when context updates
  useEffect(() => {
    if (websiteContent?.home) setHomeForm(websiteContent.home);
    if (websiteContent?.about) setAboutForm(websiteContent.about);
    if (websiteContent?.contact) setContactForm(websiteContent.contact);
  }, [websiteContent]);

  const handleSaveHome = (e) => {
    e.preventDefault();
    updateWebsiteContent("home", homeForm);
    addToast("Homepage CMS content saved successfully.", "success");
  };

  const handleSaveAbout = (e) => {
    e.preventDefault();
    updateWebsiteContent("about", aboutForm);
    addToast("About Page content saved successfully.", "success");
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    updateWebsiteContent("contact", contactForm);
    addToast("Contact & Social details updated.", "success");
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
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save Homepage</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#6F6A62]">Hero Main Headline</label>
                <input
                  type="text"
                  value={homeForm.heroHeading || ""}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroHeading: e.target.value })
                  }
                  className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-sm font-display font-bold text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6F6A62]">Hero Subtitle / Tagline</label>
                <textarea
                  rows={2}
                  value={homeForm.heroTagline || ""}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroTagline: e.target.value })
                  }
                  className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#6F6A62]">Primary Call to Action (CTA) Text</label>
                <input
                  type="text"
                  value={homeForm.heroCtaText || ""}
                  onChange={(e) =>
                    setHomeForm({ ...homeForm, heroCtaText: e.target.value })
                  }
                  className="w-full p-3 bg-[#F8F6F2] border border-[#E7E0D2] rounded-xl text-xs text-[#2B2B2B] focus:border-[#C9A669] focus:outline-none"
                />
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
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save About Content</span>
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
                className="px-5 py-2 rounded-xl bg-[#2B2B2B] text-white hover:bg-[#1C1B19] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#E4D3A6]" />
                <span>Save Contact Details</span>
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
