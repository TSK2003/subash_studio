import { useState } from "react";
import { Play } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import FilmVideoModal from "../components/FilmVideoModal";
import { img } from "../data/images";
import { films as defaultFilms } from "../data/films";
import { useAdminData } from "../admin/context/AdminDataContext";

export default function Films() {
  const { films: adminFilms } = useAdminData();
  const [active, setActive] = useState(null);

  const filmsList = (adminFilms && adminFilms.length > 0
    ? adminFilms.filter((f) => f.published !== false)
    : defaultFilms
  ).map((f) => ({
    ...f,
    title: f.title || "Subash Studio Film",
    type: f.type || f.category || "Wedding Film",
    category: f.category || f.type || "Wedding Film",
    duration: f.duration || "Highlight",
    poster: f.posterImage || f.thumbnail || f.image || (f.seed ? img(f.seed, 900, 506) : "/images/films.png"),
    thumbnail: f.thumbnail || f.posterImage || f.image || (f.seed ? img(f.seed, 900, 506) : "/images/films.png"),
    videoUrl: f.videoUrl || f.youtubeUrl || "",
    videoSourceType: f.videoSourceType,
  }));

  return (
    <>
      <Seo title="Films" description="Cinematic wedding films and showreels by SUBASH STUDIO." />

      <section className="relative h-[68vh] min-h-[460px] flex items-center justify-center overflow-hidden">
        <picture>
          <source srcSet="/images/films.webp" type="image/webp" />
          <img src="/images/films.png" alt="A still from a SUBASH STUDIO wedding film" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-ink/65" />
        <div className="relative text-center px-6">
          <p className="eyebrow text-gold-light mb-5">Motion Studio</p>
          <h1 className="font-display font-medium text-5xl sm:text-6xl text-bg-soft">Films</h1>
          <p className="mt-5 max-w-lg mx-auto text-bg-soft/75 text-sm leading-relaxed">
            Wedding films and showreels, cut and colour-graded in-house — every story scored to feel exactly like it did in the room.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <SectionHeading eyebrow="Watch" title="Recent cinematic work." align="center" />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filmsList.map((f, i) => (
            <Reveal key={f.id} delay={(i % 4) * 0.08}>
              <button
                type="button"
                onClick={() => setActive(f)}
                className="group relative block w-full aspect-video rounded-md overflow-hidden shadow-card cursor-pointer text-left"
              >
                <img src={f.poster} alt={f.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-ink/45 group-hover:bg-ink/55 transition-colors duration-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-bg-soft/90 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-400">
                    <Play size={22} className="text-ink ml-1" fill="currentColor" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                  <p className="eyebrow text-gold-light mb-1">{f.type} · {f.duration}</p>
                  <p className="font-display text-lg text-bg-soft">{f.title}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cinematic Internal Video Modal */}
      <FilmVideoModal
        isOpen={Boolean(active)}
        film={active}
        onClose={() => setActive(null)}
      />
    </>
  );
}

