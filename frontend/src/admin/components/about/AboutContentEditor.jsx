import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  Camera,
  Award,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import AboutImageControl from "./AboutImageControl";

const INITIAL_ABOUT_FALLBACK = {
  intro: {
    eyebrow: "OUR HERITAGE",
    heroTitle: "About",
    title: "The story behind the lens.",
    subtitle: "A chance beginning. A lifelong passion.",
    backgroundImage: "",
    bannerImage: "",
    imageAlt: "About Subash Studio heritage",
    establishedYear: "1993",
  },
  founder: {
    label: "THE STORY OF THE FOUNDER",
    name: "P. Arunachalam",
    role: "FOUNDER, SUBASH STUDIO",
    descParagraph1: "His story began in a village in the Western Ghats, with just a few cows and goats.",
    descParagraph2: "In 1987, a camera won in a lottery revealed his artistic talent — and became the beginning of a business that would grow to three branches.",
    caption: "Where the journey began.",
    photo1: "/images/about/founder-camera.jpeg",
    photo1Alt: "P. Arunachalam holding an Agfa camera",
    photo2: "/images/about/founder-field.jpeg",
    photo2Alt: "P. Arunachalam in a marigold flower field",
  },
  camera: {
    label: "1987 • THE TURNING POINT",
    heading: "A camera. A new beginning.",
    cameraName: "Agfa Click III",
    description: "An Agfa Click III camera, won in a lottery in 1987, changed his life and helped him discover his artistic skills.",
    image: "",
    imageAlt: "Agfa Click III camera",
  },
  community: {
    label: "2018 • COMMUNITY & LEADERSHIP",
    heading: "Serving the photography community.",
    headingAccent: "community.",
    description: "Became Vice President of the Tirunelveli District Photography Labour Welfare Association.",
    role: "VICE PRESIDENT",
    organization: "Tirunelveli District Photography Labour Welfare Association",
    appointedYear: "Appointed in 2018",
    caption: "P. Arunachalam",
    portrait: "/images/about/founder-field.jpeg",
    portraitAlt: "P. Arunachalam portrait",
  },
  journey: {
    eyebrow: "OUR STUDIO JOURNEY",
    title: "From one studio to a shared legacy.",
    subtitle: "Four milestones. One enduring passion.",
  },
  milestones: [
    {
      id: "m-1993",
      date: "5 February 1993",
      heading: "The first Subash Studio.",
      description: "P. Arunachalam began his career as a professional photographer and opened the first Subash Studio in Kallidaikurichi.",
      quoteLine: "",
      layout: "photo-left",
      image: "/images/about/studio-1993.jpeg",
      imageAlt: "The first Subash Studio in Kallidaikurichi opened in 1993",
    },
    {
      id: "m-2021",
      date: "July 2021",
      heading: "A studio, reimagined.",
      description: "The Kallidaikurichi studio was reconstructed with modern equipment.",
      quoteLine: "",
      layout: "content-left",
      image: "/images/about/studio-2021.jpeg",
      imageAlt: "Reconstructed Kallidaikurichi studio with modern equipment",
    },
    {
      id: "m-2022",
      date: "2022",
      heading: "A partner branch in Chennai.",
      description: "A new chapter through a partner branch in Chennai.",
      quoteLine: "When soul makes love",
      layout: "photo-left",
      image: "",
      imageAlt: "Chennai partner branch",
    },
    {
      id: "m-2026",
      date: "2026",
      heading: "New beginnings in Tirunelveli.",
      description: "Subash Studio opened a new branch in Tirunelveli, continuing the founder's journey.",
      quoteLine: "",
      layout: "content-left",
      image: "/images/about/studio-2026.jpg",
      imageAlt: "Subash Studio Tirunelveli branch",
    },
  ],
  closingSummary: {
    locations: "Kallidaikurichi · Chennai · Tirunelveli",
    tagline: "THREE BRANCHES. ONE SHARED LEGACY.",
  },
};

export default function AboutContentEditor({
  aboutData = {},
  onSave,
  isSaving = false,
  savingSection = null,
  getMediaLibrary,
  addToast,
}) {
  // Local working state
  const [formData, setFormData] = useState(() => ({
    intro: { ...INITIAL_ABOUT_FALLBACK.intro, ...(aboutData.intro || {}) },
    founder: { ...INITIAL_ABOUT_FALLBACK.founder, ...(aboutData.founder || {}) },
    camera: { ...INITIAL_ABOUT_FALLBACK.camera, ...(aboutData.camera || {}) },
    community: { ...INITIAL_ABOUT_FALLBACK.community, ...(aboutData.community || {}) },
    journey: { ...INITIAL_ABOUT_FALLBACK.journey, ...(aboutData.journey || {}) },
    milestones:
      Array.isArray(aboutData.milestones) && aboutData.milestones.length > 0
        ? aboutData.milestones
        : INITIAL_ABOUT_FALLBACK.milestones,
    closingSummary: { ...INITIAL_ABOUT_FALLBACK.closingSummary, ...(aboutData.closingSummary || {}) },
  }));

  // Sync when external server aboutData updates (e.g. after save or fresh fetch)
  useEffect(() => {
    if (aboutData && Object.keys(aboutData).length > 0) {
      setFormData({
        intro: { ...INITIAL_ABOUT_FALLBACK.intro, ...(aboutData.intro || {}) },
        founder: { ...INITIAL_ABOUT_FALLBACK.founder, ...(aboutData.founder || {}) },
        camera: { ...INITIAL_ABOUT_FALLBACK.camera, ...(aboutData.camera || {}) },
        community: { ...INITIAL_ABOUT_FALLBACK.community, ...(aboutData.community || {}) },
        journey: { ...INITIAL_ABOUT_FALLBACK.journey, ...(aboutData.journey || {}) },
        milestones:
          Array.isArray(aboutData.milestones) && aboutData.milestones.length > 0
            ? aboutData.milestones
            : INITIAL_ABOUT_FALLBACK.milestones,
        closingSummary: { ...INITIAL_ABOUT_FALLBACK.closingSummary, ...(aboutData.closingSummary || {}) },
      });
    }
  }, [aboutData]);

  // Section-by-section save handler
  const handleSaveSection = async (sectionKey) => {
    try {
      const payload = {
        ...formData,
        [sectionKey]: formData[sectionKey],
      };
      await onSave(payload, sectionKey);
    } catch {
      // Retain edits on error
    }
  };

  // Section-by-section cancel handler (reverts that section to server state)
  const handleCancelSection = (sectionKey) => {
    const serverVal = aboutData[sectionKey] || INITIAL_ABOUT_FALLBACK[sectionKey];
    setFormData((prev) => ({
      ...prev,
      [sectionKey]: Array.isArray(serverVal) ? [...serverVal] : { ...serverVal },
    }));
    addToast?.(`Reset ${sectionKey} changes to last saved state.`, "info");
  };

  // Save all sections
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    await onSave(formData, "all");
  };

  // Milestone helpers
  const handleAddMilestone = () => {
    const newId = `milestone-${Date.now()}`;
    const nextMilestones = [
      ...formData.milestones,
      {
        id: newId,
        date: "New Date",
        heading: "Milestone Heading",
        description: "Milestone story and details...",
        quoteLine: "",
        layout: formData.milestones.length % 2 === 0 ? "photo-left" : "content-left",
        image: "",
        imageAlt: "",
      },
    ];
    setFormData((prev) => ({ ...prev, milestones: nextMilestones }));
  };

  const handleRemoveMilestone = (idx) => {
    const nextMilestones = formData.milestones.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, milestones: nextMilestones }));
  };

  const handleMoveMilestone = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= formData.milestones.length) return;
    const nextMilestones = [...formData.milestones];
    const [moved] = nextMilestones.splice(idx, 1);
    nextMilestones.splice(targetIdx, 0, moved);
    setFormData((prev) => ({ ...prev, milestones: nextMilestones }));
  };

  const handleUpdateMilestone = (idx, fields) => {
    const nextMilestones = [...formData.milestones];
    nextMilestones[idx] = { ...nextMilestones[idx], ...fields };
    setFormData((prev) => ({ ...prev, milestones: nextMilestones }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Global Save */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
            About Studio &amp; Story CMS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">
            Manage About Page Heritage &amp; Timeline
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Update all narrative texts, founder photographs, turning point camera, community leadership, and timeline milestones.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-medium transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 shrink-0"
        >
          {isSaving && savingSection === "all" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Everything...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save All Sections</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          CARD 1: PAGE INTRODUCTION & HERO BANNER
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 1</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Page Hero &amp; Introduction</h3>
            <p className="text-xs text-gray-500 mt-0.5">Upper photographic banner image, eyebrow, main title, and story introduction.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("intro")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("intro")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "intro" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Intro</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={formData.intro.eyebrow}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, eyebrow: e.target.value },
                }))
              }
              placeholder="OUR HERITAGE"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Main Page Title
            </label>
            <input
              type="text"
              value={formData.intro.heroTitle !== undefined ? formData.intro.heroTitle : "About"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, heroTitle: e.target.value },
                }))
              }
              placeholder="About"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Supporting Introduction
            </label>
            <input
              type="text"
              value={formData.intro.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, title: e.target.value },
                }))
              }
              placeholder="The story behind the lens."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Supporting Tagline
            </label>
            <textarea
              rows={2}
              value={formData.intro.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, subtitle: e.target.value },
                }))
              }
              placeholder="A chance beginning. A lifelong passion."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Established Year (Optional)
            </label>
            <input
              type="text"
              value={formData.intro.establishedYear || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, establishedYear: e.target.value },
                }))
              }
              placeholder="1993"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          {/* About Banner Background Image */}
          <div className="sm:col-span-2 pt-3 border-t border-gray-100">
            <AboutImageControl
              label="About Banner Background Image"
              value={formData.intro.backgroundImage || formData.intro.bannerImage || ""}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: {
                    ...prev.intro,
                    backgroundImage: url,
                    bannerImage: url,
                  },
                }))
              }
              altValue={formData.intro.imageAlt || ""}
              onAltChange={(alt) =>
                setFormData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, imageAlt: alt },
                }))
              }
              category="about"
              getMediaLibrary={getMediaLibrary}
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Leave blank to use the default cinematic studio banner. Uploading or choosing a photo customizes the About page banner independently without changing the Films banner.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 2: FOUNDER (P. ARUNACHALAM)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 2</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">The Story of the Founder</h3>
            <p className="text-xs text-gray-500 mt-0.5">Founder identity, dual photo composition, narrative paragraphs, and handwritten caption.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("founder")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("founder")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "founder" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Founder</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={formData.founder.label}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founder: { ...prev.founder, label: e.target.value },
                }))
              }
              placeholder="THE STORY OF THE FOUNDER"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Founder Name
            </label>
            <input
              type="text"
              value={formData.founder.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founder: { ...prev.founder, name: e.target.value },
                }))
              }
              placeholder="P. Arunachalam"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Role &amp; Title
            </label>
            <input
              type="text"
              value={formData.founder.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founder: { ...prev.founder, role: e.target.value },
                }))
              }
              placeholder="FOUNDER, SUBASH STUDIO"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description Paragraph 1
            </label>
            <textarea
              rows={2}
              value={formData.founder.descParagraph1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founder: { ...prev.founder, descParagraph1: e.target.value },
                }))
              }
              placeholder="His story began in a village in the Western Ghats..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Description Paragraph 2
            </label>
            <textarea
              rows={2}
              value={formData.founder.descParagraph2}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founder: { ...prev.founder, descParagraph2: e.target.value },
                }))
              }
              placeholder="In 1987, a camera won in a lottery revealed his artistic talent..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Founder Photos Composition */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AboutImageControl
            label="Founder Photo 1 (Camera Profile)"
            value={formData.founder.photo1}
            onChange={(url) =>
              setFormData((prev) => ({
                ...prev,
                founder: { ...prev.founder, photo1: url },
              }))
            }
            altValue={formData.founder.photo1Alt}
            onAltChange={(alt) =>
              setFormData((prev) => ({
                ...prev,
                founder: { ...prev.founder, photo1Alt: alt },
              }))
            }
            captionValue={formData.founder.caption}
            onCaptionChange={(caption) =>
              setFormData((prev) => ({
                ...prev,
                founder: { ...prev.founder, caption },
              }))
            }
            captionLabel="Cursive Caption Under Photos"
            category="about"
            getMediaLibrary={getMediaLibrary}
          />

          <AboutImageControl
            label="Founder Photo 2 (Flower Field)"
            value={formData.founder.photo2}
            onChange={(url) =>
              setFormData((prev) => ({
                ...prev,
                founder: { ...prev.founder, photo2: url },
              }))
            }
            altValue={formData.founder.photo2Alt}
            onAltChange={(alt) =>
              setFormData((prev) => ({
                ...prev,
                founder: { ...prev.founder, photo2Alt: alt },
              }))
            }
            category="about"
            getMediaLibrary={getMediaLibrary}
          />
        </div>
      </div>

      {/* =========================================================================
          CARD 3: CAMERA / 1987 THE TURNING POINT
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 3</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">1987 • The Turning Point (Camera Section)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Section settings matching reference: label, heading, camera name &amp; story narrative.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("camera")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("camera")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "camera" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Camera</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={formData.camera.label}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  camera: { ...prev.camera, label: e.target.value },
                }))
              }
              placeholder="1987 • THE TURNING POINT"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Camera Model Name
            </label>
            <input
              type="text"
              value={formData.camera.cameraName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  camera: { ...prev.camera, cameraName: e.target.value },
                }))
              }
              placeholder="Agfa Click III"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Section Heading
            </label>
            <input
              type="text"
              value={formData.camera.heading}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  camera: { ...prev.camera, heading: e.target.value },
                }))
              }
              placeholder="A camera. A new beginning."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Tip: The final word of this heading automatically receives gold italic accent styling on the public page.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Camera Turning Point Story
            </label>
            <textarea
              rows={2}
              value={formData.camera.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  camera: { ...prev.camera, description: e.target.value },
                }))
              }
              placeholder="An Agfa Click III camera, won in a lottery in 1987, changed his life..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Fixed Camera Visual Notice */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 border border-gray-800 shadow-xs overflow-hidden">
            <img
              src="/images/about/agfa-camera-1987.png"
              alt="Agfa Camera Visual"
              className="w-10 h-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-900">Fixed Camera Visual</span>
              <span className="text-[10px] uppercase font-semibold text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded-md border border-gray-300">Permanent Asset</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              The iconic Agfa Click III camera photograph is permanently integrated into the studio heritage section. Admins edit only the narrative text fields above.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 4: COMMUNITY & LEADERSHIP (2018)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 4</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Community &amp; Leadership (2018)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Honoring the founder's service as Vice President of the Photography Welfare Association.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("community")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("community")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "community" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Leadership</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Section Label
            </label>
            <input
              type="text"
              value={formData.community.label}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, label: e.target.value },
                }))
              }
              placeholder="2018 • COMMUNITY & LEADERSHIP"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Official Leadership Role
            </label>
            <input
              type="text"
              value={formData.community.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, role: e.target.value },
                }))
              }
              placeholder="VICE PRESIDENT"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Full Section Heading
            </label>
            <input
              type="text"
              value={formData.community.heading || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, heading: e.target.value },
                }))
              }
              placeholder="Serving the photography community."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Main editorial heading text.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Italic Heading Phrase (Accent Text)
            </label>
            <input
              type="text"
              value={formData.community.headingAccent ?? "community."}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, headingAccent: e.target.value },
                }))
              }
              placeholder="community."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Phrase within the heading styled on line 2 in warm gold italics on the public site.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Association Description
            </label>
            <textarea
              rows={2}
              value={formData.community.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, description: e.target.value },
                }))
              }
              placeholder="Became Vice President of the Tirunelveli District Photography Labour Welfare Association."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Appointment Year Tagline
            </label>
            <input
              type="text"
              value={formData.community.appointedYear}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, appointedYear: e.target.value },
                }))
              }
              placeholder="Appointed in 2018"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Portrait Caption
            </label>
            <input
              type="text"
              value={formData.community.caption}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  community: { ...prev.community, caption: e.target.value },
                }))
              }
              placeholder="P. Arunachalam"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Leadership Portrait Control */}
        <div className="pt-3 border-t border-gray-100">
          <AboutImageControl
            label="Community Leadership Portrait"
            value={formData.community.portrait}
            onChange={(url) =>
              setFormData((prev) => ({
                ...prev,
                community: { ...prev.community, portrait: url },
              }))
            }
            altValue={formData.community.portraitAlt}
            onAltChange={(alt) =>
              setFormData((prev) => ({
                ...prev,
                community: { ...prev.community, portraitAlt: alt },
              }))
            }
            category="about"
            getMediaLibrary={getMediaLibrary}
          />
        </div>
      </div>

      {/* =========================================================================
          CARD 5: STUDIO JOURNEY INTRODUCTION
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 5</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Studio Journey Introduction</h3>
            <p className="text-xs text-gray-500 mt-0.5">Header for the two-column history timeline.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("journey")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("journey")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "journey" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Journey Intro</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={formData.journey.eyebrow}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  journey: { ...prev.journey, eyebrow: e.target.value },
                }))
              }
              placeholder="OUR STUDIO JOURNEY"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Journey Title
            </label>
            <input
              type="text"
              value={formData.journey.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  journey: { ...prev.journey, title: e.target.value },
                }))
              }
              placeholder="From one studio to a shared legacy."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Journey Subtitle
            </label>
            <input
              type="text"
              value={formData.journey.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  journey: { ...prev.journey, subtitle: e.target.value },
                }))
              }
              placeholder="Four milestones. One enduring passion."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD 6: INDIVIDUAL STUDIO MILESTONES
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 6</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Individual Studio Milestones</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ordered milestone records. Manage dates, headings, descriptions, cursive quotations, desktop layout, and images.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span>Add Milestone</span>
            </button>
            <button
              type="button"
              onClick={() => handleCancelSection("milestones")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("milestones")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "milestones" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Milestones</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-5">
          {formData.milestones.map((milestone, idx) => (
            <div
              key={milestone.id || `m-idx-${idx}`}
              className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {milestone.date || "Milestone"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveMilestone(idx, -1)}
                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === formData.milestones.length - 1}
                    onClick={() => handleMoveMilestone(idx, 1)}
                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-red-100 text-red-500 hover:text-red-700 ml-1 transition-colors"
                    title="Remove Milestone"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={milestone.date}
                    onChange={(e) => handleUpdateMilestone(idx, { date: e.target.value })}
                    placeholder="e.g. 5 February 1993"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={milestone.heading}
                    onChange={(e) => handleUpdateMilestone(idx, { heading: e.target.value })}
                    placeholder="e.g. The first Subash Studio."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Desktop Layout
                  </label>
                  <select
                    value={milestone.layout || "photo-left"}
                    onChange={(e) => handleUpdateMilestone(idx, { layout: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors"
                  >
                    <option value="photo-left">Photo Left, Content Right</option>
                    <option value="content-left">Content Left, Photo Right</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Milestone Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={milestone.description}
                    onChange={(e) => handleUpdateMilestone(idx, { description: e.target.value })}
                    placeholder="Story and milestone details..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cursive Tagline Line (Optional)
                  </label>
                  <input
                    type="text"
                    value={milestone.quoteLine || ""}
                    onChange={(e) => handleUpdateMilestone(idx, { quoteLine: e.target.value })}
                    placeholder='e.g. "When soul makes love"'
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-serif italic transition-colors"
                  />
                </div>
              </div>

              {/* Milestone Image Control */}
              <AboutImageControl
                label={`Milestone Photo (${milestone.date || "Milestone"})`}
                value={milestone.image}
                onChange={(url) => handleUpdateMilestone(idx, { image: url })}
                altValue={milestone.imageAlt}
                onAltChange={(alt) => handleUpdateMilestone(idx, { imageAlt: alt })}
                category="about"
                getMediaLibrary={getMediaLibrary}
              />
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          CARD 7: CLOSING LOCATION SUMMARY
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Section 7</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Closing Location Summary</h3>
            <p className="text-xs text-gray-500 mt-0.5">Display summary underneath timeline. Not calculated automatically from milestones.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCancelSection("closingSummary")}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSection("closingSummary")}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isSaving && savingSection === "closingSummary" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Save Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Locations Line
            </label>
            <input
              type="text"
              value={formData.closingSummary.locations}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  closingSummary: { ...prev.closingSummary, locations: e.target.value },
                }))
              }
              placeholder="Kallidaikurichi · Chennai · Tirunelveli"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Legacy Tagline
            </label>
            <input
              type="text"
              value={formData.closingSummary.tagline}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  closingSummary: { ...prev.closingSummary, tagline: e.target.value },
                }))
              }
              placeholder="THREE BRANCHES. ONE SHARED LEGACY."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bottom Global Save */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          {isSaving && savingSection === "all" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Everything...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save All About Content</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
