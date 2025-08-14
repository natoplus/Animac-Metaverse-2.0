import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TimerReset,
  Film,
  Star,
  Tag,
  Calendar,
  PlayCircle,
  X,
} from "lucide-react";
import axios from "axios";
import { ChevronRight, ChevronLeft } from "lucide-react";
import bgImage from '../assets/watchtower-bg-dreamworks.jpg';
import buzzLogo from '../assets/buzzfeed-logo.svg';


// Import Azonix font (can move to global CSS or head tag)
const azonixFontLink = "https://fonts.googleapis.com/css2?family=Azonix&display=swap";

if (typeof document !== "undefined") {
  if (!document.getElementById("azonix-font")) {
    const link = document.createElement("link");
    link.id = "azonix-font";
    link.rel = "stylesheet";
    link.href = azonixFontLink;
    document.head.appendChild(link);
  }
}

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || "<fallback-your-key>";

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft)
    return <span className="text-green-400 font-semibold">Now Showing</span>;

  return (
    <span className="font-mono text-sm text-blue-400">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}

function TrailerCard({ title, youtubeKey, poster, onClick }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 0, 255, 0.7)" }}
      onClick={onClick}
      className="relative min-w-[280px] h-[158px] rounded-lg cursor-pointer neon-glow border border-white/70 bg-black/20 hover:bg-black/40 p-4 transition overflow-hidden"
      title={title}
    >
      {poster ? (
        <img
          src={poster}
          alt={`${title} poster`}
          className="absolute inset-0 w-full h-full object-cover brightness-75 rounded-lg"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="bg-zinc-800 w-full h-full flex items-center justify-center text-zinc-500 select-none rounded-lg">
          No Poster
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
      <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 text-white font-semibold text-center text-sm leading-tight line-clamp-2 select-none drop-shadow-lg rounded-b-lg">
        {title}
      </div>
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <PlayCircle className="w-16 h-16 text-purple-500 drop-shadow-lg" />
      </div>
    </motion.div>
  );
}

function TrailerModal({ youtubeKey, title, onClose }) {
  return (
    <AnimatePresence>
      {youtubeKey && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-[90vw] max-w-4xl aspect-video rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title={title}
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="w-full h-full rounded-xl"
            />
            <button
              aria-label="Close trailer"
              onClick={onClose}
              className="absolute top-3 right-3 p-2 border-white rounded-full bg-purple-700/80 hover:bg-purple-700 text-white transition"
            >
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroFeatured({ trailer, countdownDate, onPlay }) {
  return (
    <section
      className="relative w-full h-[60vh] md:h-[70vh] rounded-xl overflow-hidden mb-12 neon-glow border border-white/70 bg-black/20 hover:bg-black/40 cursor-pointer select-none"
      onClick={onPlay}
      aria-label={`Play trailer for ${trailer.title}`}
    >
      <img
        src={trailer.poster}
        alt={`Featured trailer poster for ${trailer.title}`}
        className="absolute inset-0 w-full h-full object-cover brightness-75"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-8 text-white max-w-lg">
        <h1
          className="text-5xl md:text-6xl font-azonix font-extrabold drop-shadow-lg"
          style={{ fontFamily: "'Azonix', sans-serif" }}
        >
          {trailer.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 font-mono text-lg text-blue-400">
          <TimerReset />
          <Countdown targetDate={countdownDate} />
        </div>
      </div>
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <PlayCircle className="w-24 h-24 text-purple-500 drop-shadow-lg animate-pulse" />
      </div>

    </section>
  );
}

export default function WatchTowerPage() {
  const [isEast, setIsEast] = useState(true);
  const [eastList, setEastList] = useState([]);
  const [westList, setWestList] = useState([]);
  const [loadingEast, setLoadingEast] = useState(true);
  const [loadingWest, setLoadingWest] = useState(true);
  const [errorEast, setErrorEast] = useState(null);
  const [errorWest, setErrorWest] = useState(null);

  const [westTrailers, setWestTrailers] = useState([]);
  const [eastTrailers, setEastTrailers] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState(null);

  const trailerScrollRef = useRef(null);
  const calendarScrollRef = useRef(null);

  const [modalTrailer, setModalTrailer] = useState(null);
  const scrollTrailerLeft = () => trailerScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollTrailerRight = () => trailerScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  const scrollCalendarLeft = () => calendarScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollCalendarRight = () => calendarScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });




  // Fetch Anime (East)
  useEffect(() => {
    const fetchAnime = async () => {
      const query = `
        query {
          Page(perPage: 15) {
            media(type: ANIME, sort: SCORE_DESC, status: NOT_YET_RELEASED) {
              id
              title { romaji }
              startDate { year month day }
              coverImage { large }
              genres
              averageScore
              trailer {
                id
                site
                thumbnail
              }
            }
          }
        }
      `;
      try {
        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (!response.ok)
          throw new Error(`AniList fetch error: ${response.statusText}`);
        const { data } = await response.json();
        const list = data.Page.media.map((item) => ({
          id: item.id,
          title: item.title.romaji,
          date: `${item.startDate.year}-${String(item.startDate.month).padStart(
            2,
            "0"
          )}-${String(item.startDate.day).padStart(2, "0")}T00:00:00Z`,
          image: item.coverImage.large,
          genres: item.genres,
          score: item.averageScore,
          trailerYoutubeKey:
            item.trailer && item.trailer.site === "youtube"
              ? item.trailer.id
              : "dQw4w9WgXcQ",
          trailerPoster: item.coverImage.large,
        }));
        setEastList(list);
        setErrorEast(null);
        setEastTrailers(
          list
            .filter((i) => i.trailerYoutubeKey)
            .slice(0, 8)
            .map((item) => ({
              title: item.title,
              youtubeKey: item.trailerYoutubeKey,
              poster: item.trailerPoster,
            }))
        );
      } catch (error) {
        console.error("❌ Failed to fetch anime:", error);
        setErrorEast(error.message || "Unknown error fetching anime");
        setEastList([]);
      } finally {
        setLoadingEast(false);
      }
    };
    fetchAnime();
  }, []);

  // Fetch Movies (West)
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        if (!TMDB_API_KEY || TMDB_API_KEY === "<fallback-your-key>")
          throw new Error("TMDB API key not set");
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const list = data.results.slice(0, 15).map((movie) => ({
          id: movie.id,
          title: movie.title,
          date: movie.release_date + "T00:00:00Z",
          image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
          genres: [], // Optionally fill genres here if you want
          score: null,
        }));
        setWestList(list);
        setErrorWest(null);

        // Fetch trailers for first 8 movies
        const trailersData = await Promise.all(
          data.results.slice(0, 8).map(async (movie) => {
            try {
              const videosRes = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
              );
              const trailers = videosRes.data.results.filter(
                (v) => v.type === "Trailer" && v.site === "YouTube"
              );
              if (trailers.length > 0) {
                return {
                  title: movie.title,
                  youtubeKey: trailers[0].key,
                  poster: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null,
                };
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        setWestTrailers(trailersData.filter(Boolean));
      } catch (error) {
        console.error("❌ Failed to fetch movies:", error);
        setErrorWest(error.message || "Unknown error fetching movies");
        setWestList([]);
      } finally {
        setLoadingWest(false);
      }
    };
    fetchMovies();
  }, []);

  // Genres from current list (East or West)
  const allGenres = useMemo(() => {
    const genresSet = new Set();
    (isEast ? eastList : westList).forEach((item) => {
      if (item.genres) item.genres.forEach((g) => genresSet.add(g));
    });
    return [...genresSet].sort();
  }, [eastList, westList, isEast]);

  // Filter trailers by genre (if selected)
  const filteredTrailers = useMemo(() => {
    if (!selectedGenre) return isEast ? eastTrailers : westTrailers;
    return (isEast ? eastTrailers : westTrailers).filter((t) => {
      const list = isEast ? eastList : westList;
      const item = list.find((i) => i.title === t.title);
      return item?.genres?.includes(selectedGenre);
    });
  }, [selectedGenre, eastTrailers, westTrailers, eastList, westList, isEast]);

  // Featured trailer for Hero and Spotlight
  const featuredTrailer = useMemo(() => {
    if (isEast && eastTrailers.length > 0) return eastTrailers[0];
    if (!isEast && westTrailers.length > 0) return westTrailers[0];
    return null;
  }, [eastTrailers, westTrailers, isEast]);

  // Featured trailer date for countdown
  const featuredDate = useMemo(() => {
    if (isEast && eastList.length > 0) return eastList[0].date;
    if (!isEast && westList.length > 0) return westList[0].date;
    return null;
  }, [eastList, westList, isEast]);

  const neonGlowPanel = "neon-glow border border-white/70 bg-black/20 hover:bg-black/40 p-4 rounded-lg transition relative overflow-hidden";

  return (
    <div
      className="min-h-screen bg-black text-white px-6 py-8 font-sans max-w-7xl mx-auto select-none relative"
      style={{ fontFamily: "'Azonix', sans-serif" }}
    >
      {/* Toggle Switch fixed top-right */}
      <div className="fixed top-6 right-6 z-50 p-1 rounded-full shadow-lg">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only"
            checked={!isEast}
            onChange={() => setIsEast((prev) => !prev)}
          />
          <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${isEast ? "bg-purple-700" : "bg-pink-600"}`} />
          <span
            className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${isEast ? "translate-x-0" : "translate-x-7"
              }`}
          />
        </label>
        <div className="flex justify-between mt-1 text-xs text-purple-400 font-semibold">
          <span>East</span>
          <span>West</span>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-netflix-black via-netflix-dark to-netflix-black">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <img
              src={buzzLogo}
              alt="Buzzfeed logo"
              className="mx-auto h-80 w-auto mb-2"
            />

            <p className="text-2xl md:text-3xl font-montserrat font-medium text-gray-300 mb-8">
              Where Culture Meets Commentary
            </p>
            <p className="text-lg font-inter text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Choose your journey through our curated content portals. Each side offers unique perspectives on the entertainment that shapes our world.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Hero Featured Trailer */}
      <div className="mb-14 mt-20">
        {featuredTrailer && featuredDate && (
          <HeroFeatured
            trailer={featuredTrailer}
            countdownDate={featuredDate}
            onPlay={() => setModalTrailer(featuredTrailer)}
          />
        )}
      </div>

      <div className="relative flex-1 mx-4 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full"></div>

      {/* Genre Filter Buttons */}
      <div className="mb-16 mt-16 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition border border-purple-700 ${selectedGenre === null
              ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
              : "bg-zinc-900 text-zinc-400 hover:bg-purple-800 hover:text-white"
            }`}
        >
          All Genres
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition border border-purple-700 ${selectedGenre === genre
                ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
                : "bg-zinc-900 text-zinc-400 hover:bg-purple-800 hover:text-white"
              }`}
          >
            <Tag className="inline w-4 h-4 mr-1 -mt-0.5" />
            {genre}
          </button>
        ))}
      </div>

      <div className="relative flex-1 mx-4 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full"></div>

      {/* Trailer Cards Section */}
      <div className="relative mb-13">
        <button
          aria-label="Scroll trailers left"
          onClick={scrollTrailerLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full hover:bg-purple-700 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <motion.div
          ref={trailerScrollRef}
          layout
          className={`${neonGlowPanel} px-6 py-8 flex overflow-x-auto space-x-6 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black mt-20`}
        >
          {filteredTrailers.map(({ title, youtubeKey, poster }, i) => (
            <TrailerCard
              key={`${title}-${i}`}
              title={title}
              youtubeKey={youtubeKey}
              poster={poster}
              onClick={() => setModalTrailer({ youtubeKey, title })}
            />
          ))}
        </motion.div>

        <button
          aria-label="Scroll trailers right"
          onClick={scrollTrailerRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full hover:bg-purple-700 transition text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>


      {/* Spotlight section */}
      <div className="mb-10 mt-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${neonGlowPanel} max-w-5xl mx-auto mb-20 mt-20`}
        >
          <h2 className="text-3xl font-extrabold mb-7 flex items-center gap-3">
            <Film className="w-8 h-8 text-purple-500" />
            Spotlight Upcoming {isEast ? "Anime" : "Movies"}
          </h2>

          {(isEast ? eastList : westList).length === 0 && (
            <p className="text-red-500 font-semibold">No upcoming titles found.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(isEast ? eastList : westList)
              .filter((item) =>
                selectedGenre ? item.genres.includes(selectedGenre) : true
              )
              .slice(0, 9)
              .map((item) => (
                <motion.article
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg overflow-hidden cursor-pointer bg-black/30 border border-white/50 neon-glow"
                  title={`${item.title} (${new Date(item.date).getFullYear()})`}
                >
                  <img
                    src={item.image}
                    alt={`${item.title} cover`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[180px] object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="p-4 text-center select-text">
                    <h3 className="text-lg font-semibold line-clamp-2">{item.title}</h3>
                    <p className="text-sm mt-1 text-gray-400">
                      Release:{" "}
                      {new Date(item.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {item.score && (
                      <p className="flex items-center justify-center mt-1 gap-1 text-yellow-400 font-semibold">
                        <Star className="w-4 h-4" />
                        {item.score}%
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
          </div>
        </motion.section>
      </div>

      <div className="relative flex-1 mx-4 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full"></div>

      {/* Release Calendar Section */}
      <section className="mt-20 relative mb-20">
        <h2 className="text-3xl font-extrabold text-purple-400 mb-6 text-center drop-shadow-[0_0_12px_rgba(180,100,255,0.9)] flex justify-center items-center gap-2">
          <Calendar className="w-8 h-8" /> Release Calendar
        </h2>

        <button
          aria-label="Scroll calendar left"
          onClick={scrollCalendarLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full hover:bg-purple-700 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={calendarScrollRef}
          className="flex overflow-x-auto space-x-4 px-2 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black"
        >
          {(isEast ? eastList : westList)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(({ id, title, date, image }) => {
              const d = new Date(date);
              const day = d.toLocaleString("en-US", { day: "numeric" });
              const month = d.toLocaleString("en-US", { month: "short" });
              const year = d.getFullYear();

              return (
                <motion.div
                  key={id}
                  className={`${neonGlowPanel} flex-shrink-0 w-36 cursor-pointer hover:shadow-[0_0_20px_rgba(180,100,255,0.8)] transition`}
                  onClick={() => {
                    const trailer = (isEast ? eastTrailers : westTrailers).find(
                      (t) => t.title === title
                    );
                    if (trailer) setModalTrailer(trailer);
                    else alert(`${title} is releasing on ${month} ${day}, ${year}`);
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center text-white font-mono font-bold text-lg">
                      {day}
                    </div>
                    <div className="text-center text-purple-400 font-semibold text-sm uppercase tracking-wide">
                      {month}
                    </div>
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-24 object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-24 bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 select-none">
                        No Image
                      </div>
                    )}
                    <div className="text-center text-sm mt-1 font-semibold line-clamp-2">
                      {title}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        <button
          aria-label="Scroll calendar right"
          onClick={scrollCalendarRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full hover:bg-purple-700 transition text-white"
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Top Rated Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-extrabold text-purple-400 mb-6 text-center drop-shadow-[0_0_12px_rgba(180,100,255,0.9)] flex justify-center items-center gap-2">
          <Star className="w-8 h-8" /> Top Rated {isEast ? "Anime" : "Movies"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isEast
            ? [...eastList]
              .filter(i => typeof i.score === "number" && !isNaN(i.score))
              .sort((a, b) => b.score - a.score)
              .slice(0, 6)
            : [...westList]
          ).map((item) => (
            <div
              key={item.id}
              className={`${neonGlowPanel} cursor-pointer hover:shadow-[0_0_20px_rgba(180,100,255,0.8)] transition`}
              onClick={() => {
                const trailer = (isEast ? eastTrailers : westTrailers).find(
                  (t) => t.title === item.title
                );
                if (trailer) setModalTrailer(trailer);
                else alert(item.title);
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-lg mb-3"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-56 bg-purple-900 rounded-lg mb-3 flex items-center justify-center text-purple-600">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-purple-300">
                <Film className="w-5 h-5" />
                {item.title}
              </h3>
              {item.score !== null && item.score !== undefined && (
                <p className="text-purple-400 font-mono font-bold text-lg">⭐ {item.score.toFixed(1)}</p>
              )}
              <Countdown targetDate={item.date} />
            </div>
          ))}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        youtubeKey={modalTrailer?.youtubeKey}
        title={modalTrailer?.title}
        onClose={() => setModalTrailer(null)}
      />
    </div>
  );
}
