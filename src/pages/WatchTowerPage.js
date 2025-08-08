import { useState, useEffect, useMemo } from "react";
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

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || "<fallback-your-key>";

// Countdown component (unchanged)
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

// TrailerCard with fallback poster thumbnail and click to open modal
function TrailerCard({ title, youtubeKey, poster, onClick }) {
  // Poster fallback if iframe can't load immediately
  // We'll show poster image, and on click open modal with iframe

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(150, 50, 250, 0.8)" }}
      onClick={onClick}
      className="relative min-w-[280px] h-[158px] rounded-xl cursor-pointer overflow-hidden border border-white/20 shadow-lg bg-black/70 backdrop-blur-md flex flex-col justify-center items-center transition-shadow duration-300"
      title={title}
    >
      {poster ? (
        <img
          src={poster}
          alt={`${title} poster`}
          className="absolute inset-0 w-full h-full object-cover brightness-75"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="bg-zinc-800 w-full h-full flex items-center justify-center text-zinc-500 select-none">
          No Poster
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 text-white font-semibold text-center text-sm leading-tight line-clamp-2 select-none drop-shadow-lg">
        {title}
      </div>
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <PlayCircle className="w-16 h-16 text-purple-500 drop-shadow-lg" />
      </div>
    </motion.div>
  );
}

// Modal for showing YouTube trailer video
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

  // Modal state
  const [modalTrailer, setModalTrailer] = useState(null);

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
                url
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
          // AniList trailer object is sometimes null, fallback to a placeholder YouTube ID:
          trailerYoutubeKey:
            item.trailer && item.trailer.site === "youtube"
              ? item.trailer.id
              : "dQw4w9WgXcQ",
          trailerPoster: item.coverImage.large,
        }));
        setEastList(list);
        setErrorEast(null);
        // Use the trailers from the above with YouTube keys:
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
          genres: [], // Can add genre names if needed
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
      // Find the item in eastList or westList by title to check genre
      const list = isEast ? eastList : westList;
      const item = list.find((i) => i.title === t.title);
      return item?.genres?.includes(selectedGenre);
    });
  }, [selectedGenre, eastTrailers, westTrailers, eastList, westList, isEast]);

  const loading = loadingEast || loadingWest;
  const error = isEast ? errorEast : errorWest;

  // Styles for iconic design theme
  const panelBaseStyle =
    "bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_0_15px_rgba(150,50,250,0.7)]";

  const buttonBaseStyle =
    "text-white font-semibold px-4 py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2";

  const buttonActiveStyle =
    "bg-gradient-to-r from-purple-700 to-pink-600 shadow-lg hover:from-purple-600 hover:to-pink-500";

  const genreButtonStyle = (active) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition border border-purple-700 ${
      active
        ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
        : "bg-zinc-900 text-zinc-400 hover:bg-purple-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 font-sans max-w-7xl mx-auto select-none">
      {/* Toggle Switch */}
      <div className="flex justify-center mb-8">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={!isEast}
            onChange={() => setIsEast((prev) => !prev)}
          />
          <div
            className={`${
              isEast ? "bg-purple-700" : "bg-purple-700"
            } w-16 h-8 rounded-full transition-colors duration-300`}
          />
          <span
            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${
              isEast ? "translate-x-0" : "translate-x-8"
            }`}
          />
          <span className="absolute left-1 top-10 text-sm text-purple-400 font-semibold select-none">
            East
          </span>
          <span className="absolute right-1 top-10 text-sm text-purple-400 font-semibold select-none">
            West
          </span>
        </label>
      </div>

      {/* Section Title */}
      <h2
        className={`text-4xl font-extrabold tracking-wide mb-6 text-center ${
          isEast
            ? "text-purple-400 drop-shadow-[0_0_8px_rgba(180,100,255,0.9)] font-japanese"
            : "text-purple-400 drop-shadow-[0_0_8px_rgba(180,100,255,0.9)] font-ackno"
        }`}
      >
        Trending {isEast ? "Anime" : "Movies"} Trailers
      </h2>

      {/* Trailer Cards Container */}
      {loading ? (
        <div className="text-center text-zinc-400 text-sm animate-pulse mb-12">
          Loading trailers...
        </div>
      ) : error ? (
        <div className="text-center text-red-600 font-semibold mb-12">
          Error loading trailers: {error}
        </div>
      ) : filteredTrailers.length === 0 ? (
        <div className="text-center text-zinc-400 font-semibold mb-12">
          No trailers found for this genre.
        </div>
      ) : (
        <motion.div
          layout
          className={`${panelBaseStyle} px-6 py-8 flex overflow-x-auto space-x-6 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black`}
        >
          {filteredTrailers.map(({ title, youtubeKey, poster }, i) => (
            <TrailerCard
              key={`${title}-${i}`}
              title={title}
              youtubeKey={youtubeKey}
              poster={poster}
              onClick={() =>
                setModalTrailer({ youtubeKey, title })
              }
            />
          ))}
        </motion.div>
      )}

      {/* Genre Filter Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedGenre(null)}
          className={genreButtonStyle(selectedGenre === null)}
        >
          All Genres
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={genreButtonStyle(selectedGenre === genre)}
          >
            <Tag className="inline w-4 h-4 mr-1 -mt-0.5" />
            {genre}
          </button>
        ))}
      </div>

      {/* Countdown & Release Calendar Panel */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Upcoming Releases Panel */}
        <div className={`${panelBaseStyle} p-6`}>
          <h3 className="text-2xl font-bold mb-4 text-purple-300 drop-shadow-lg flex items-center gap-2">
            <TimerReset className="w-6 h-6" /> Upcoming Releases
          </h3>
          <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black">
            {(isEast ? eastList : westList)
              .slice(0, 10)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-purple-800 pb-3 last:border-none"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 select-none">
                      No Image
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white line-clamp-2">
                      {item.title}
                    </h4>
                    <Countdown targetDate={item.date} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Release Calendar Panel */}
        <div className={`${panelBaseStyle} p-6`}>
          <h3 className="text-2xl font-bold mb-4 text-purple-300 drop-shadow-lg flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Release Calendar
          </h3>
          <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black py-2 px-2">
            {(isEast ? eastList : westList)
              .slice(0, 15)
              .sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((item) => {
                const dateObj = new Date(item.date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString("default", { month: "short" });
                return (
                  <div
                    key={item.id}
                    className="min-w-[140px] bg-purple-900/60 rounded-xl p-3 flex flex-col items-center shadow-lg"
                  >
                    <div className="text-purple-400 font-bold text-xl">{day}</div>
                    <div className="text-purple-600 uppercase text-sm mb-2">{month}</div>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-28 object-cover rounded-lg mb-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-28 bg-purple-800 rounded-lg mb-2 flex items-center justify-center text-purple-600">
                        No Image
                      </div>
                    )}
                    <p className="text-white text-center text-sm font-semibold line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-extrabold text-purple-400 mb-6 text-center drop-shadow-[0_0_12px_rgba(180,100,255,0.9)] flex justify-center items-center gap-2">
          <Star className="w-8 h-8" /> Top Rated {isEast ? "Anime" : "Movies"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isEast
            ? [...eastList].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6)
            : [...westList].slice(0, 6)
          ).map((item) => (
            <div
              key={item.id}
              className={`${panelBaseStyle} p-4 cursor-pointer hover:shadow-[0_0_20px_rgba(180,100,255,0.8)] transition`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-xl mb-3"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-56 bg-purple-900 rounded-xl mb-3 flex items-center justify-center text-purple-600">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-purple-300">
                <Film className="w-5 h-5" />
                {item.title}
              </h3>
              {item.score && (
                <p className="text-purple-400 font-mono font-bold text-lg">
                  ⭐ {item.score.toFixed(1)}
                </p>
              )}
              <Countdown targetDate={item.date} />
            </div>
          ))}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        youtubeKey={modalTrailer?.youtubeKey}
        title={modalTrailer?.title}
        onClose={() => setModalTrailer(null)}
      />
    </div>
  );
}
