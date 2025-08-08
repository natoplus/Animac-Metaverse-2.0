import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TimerReset,
  Film,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
  Calendar,
} from "lucide-react";
import axios from "axios";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || "<fallback-your-key>";

// Countdown component (same as before)
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

// Slideshow (same as before)
function Slideshow({ slides }) {
  const [current, setCurrent] = useState(0);
  if (!slides.length) return null;
  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  return (
    <div className="relative w-full max-w-5xl mx-auto mb-8 select-none">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slides[current].title}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-72 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
            <h3 className="text-3xl font-bold drop-shadow-lg flex items-center gap-3">
              <Film className="w-7 h-7 text-yellow-400" />
              {slides[current].title}
            </h3>
            <Countdown targetDate={slides[current].date} />
          </div>
        </motion.div>
      </AnimatePresence>
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition"
      >
        <ChevronRight size={28} />
      </button>
    </div>
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

  // For genre filtering
  const [selectedGenre, setSelectedGenre] = useState(null);

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
        if (!response.ok) throw new Error(`AniList fetch error: ${response.statusText}`);
        const { data } = await response.json();
        const list = data.Page.media.map((item) => ({
          id: item.id,
          title: item.title.romaji,
          date: `${item.startDate.year}-${String(item.startDate.month).padStart(2, "0")}-${String(item.startDate.day).padStart(2, "0")}T00:00:00Z`,
          image: item.coverImage.large,
          genres: item.genres,
          score: item.averageScore,
        }));
        setEastList(list);
        setErrorEast(null);
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
        if (!TMDB_API_KEY || TMDB_API_KEY === "<fallback-your-key>") throw new Error("TMDB API key not set");
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        // To get top rated we will fetch top_rated endpoint later, for now store upcoming
        const list = data.results.slice(0, 15).map((movie) => ({
          id: movie.id,
          title: movie.title,
          date: movie.release_date + "T00:00:00Z",
          image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
          genres: [], // You can map genre_ids if needed
          score: null,
        }));
        setWestList(list);
        setErrorWest(null);
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

  // Fetch top rated movies (West)
  const [westTopRated, setWestTopRated] = useState([]);
  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        if (!TMDB_API_KEY || TMDB_API_KEY === "<fallback-your-key>") return;
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const list = data.results.slice(0, 5).map((movie) => ({
          id: movie.id,
          title: movie.title,
          date: movie.release_date + "T00:00:00Z",
          image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
          genres: [],
          score: movie.vote_average,
        }));
        setWestTopRated(list);
      } catch (error) {
        console.error("❌ Failed to fetch top rated movies:", error);
      }
    };
    fetchTopRated();
  }, []);

  // Top rated anime (East) filter by score descending
  const eastTopRated = useMemo(() => {
    return [...eastList]
      .filter((a) => a.score)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [eastList]);

  // Genres from current list (East or West)
  const allGenres = useMemo(() => {
    const genresSet = new Set();
    (isEast ? eastList : westList).forEach((item) => {
      if (item.genres) item.genres.forEach((g) => genresSet.add(g));
    });
    return [...genresSet].sort();
  }, [eastList, westList, isEast]);

  // Filtered list by genre (if selected)
  const filteredList = useMemo(() => {
    if (!selectedGenre) return isEast ? eastList : westList;
    return (isEast ? eastList : westList).filter((item) =>
      item.genres?.includes(selectedGenre)
    );
  }, [selectedGenre, eastList, westList, isEast]);

  // Release Calendar items (next 15 releases sorted by date)
  const releaseCalendarItems = useMemo(() => {
    const combined = [...eastList, ...westList];
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));
    return combined.slice(0, 15);
  }, [eastList, westList]);

  const loading = loadingEast || loadingWest;
  const error = isEast ? errorEast : errorWest;

  // Segment title styles
  const eastTitleStyle = "text-4xl font-extrabold text-red-500 font-serif tracking-widest drop-shadow-lg";
  const westTitleStyle = "text-4xl font-extrabold text-blue-500 font-mono tracking-wide drop-shadow-lg";

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 font-sans max-w-7xl mx-auto">
      {/* Slideshow Section */}
      <Slideshow slides={[...eastList.slice(0, 5), ...westList.slice(0, 5)]} />

      {/* Toggle Switch below slideshow */}
      <div className="flex justify-center mb-6">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={!isEast}
            onChange={() => setIsEast((prev) => !prev)}
          />
          <div
            className={`${
              isEast ? "bg-red-600" : "bg-blue-600"
            } w-16 h-8 rounded-full transition-colors duration-300`}
          />
          <span
            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${
              isEast ? "translate-x-0" : "translate-x-8"
            }`}
          />
        </label>
      </div>

      {/* Segment Title */}
      <h2 className={`${isEast ? eastTitleStyle : westTitleStyle} mb-6 text-center`}>
        {isEast ? "East Releases" : "West Releases"}
      </h2>

      {/* Genres Spotlight */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            !selectedGenre
              ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
              : "bg-zinc-800 text-zinc-300 hover:bg-purple-700 hover:text-white"
          }`}
          onClick={() => setSelectedGenre(null)}
        >
          All Genres
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedGenre === genre
                ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
                : "bg-zinc-800 text-zinc-300 hover:bg-purple-700 hover:text-white"
            }`}
            onClick={() => setSelectedGenre(genre)}
          >
            <Tag className="inline w-4 h-4 mr-1 -mt-0.5" />
            {genre}
          </button>
        ))}
      </div>

      {/* Loading/Error/Empty states for main list */}
      {loading ? (
        <div className="text-center text-zinc-400 text-sm animate-pulse mb-10">
          Loading upcoming titles...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold mb-10">
          Error loading {isEast ? "Anime" : "Movies"}: {error}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center text-zinc-400 font-semibold mb-10">
          No upcoming {isEast ? "Anime" : "Movies"} releases found in this genre.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={isEast ? "east" : "west"}
            initial={{ opacity: 0, x: isEast ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isEast ? 50 : -50 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12"
          >
            {filteredList.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,80,80,0.8)" }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900/70 border border-zinc-700 backdrop-blur-md p-4 rounded-2xl shadow-xl cursor-pointer"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-cover rounded-xl mb-3 shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,80,80,0.7)]"
                  />
                ) : (
                  <div className="w-full h-56 bg-zinc-700 rounded-xl mb-3 flex items-center justify-center text-zinc-400">
                    No Image
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-1 flex items-center gap-2 text-white drop-shadow-sm">
                  <Film className="w-5 h-5 text-yellow-400" />
                  {item.title}
                </h3>

                {item.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2 text-xs text-pink-300">
                    {item.genres.slice(0, 3).map((g, i) => (
                      <span
                        key={i}
                        className="bg-pink-900/30 px-2 py-0.5 rounded-full border border-pink-700"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Countdown targetDate={item.date} />
                  <TimerReset className="text-cyan-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Top Rated Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center drop-shadow-md flex justify-center items-center gap-2">
          <Star className="w-8 h-8" /> Top Rated {isEast ? "Anime" : "Movies"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isEast ? eastTopRated : westTopRated).map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/80 border border-yellow-700 backdrop-blur-md p-4 rounded-2xl shadow-lg cursor-pointer hover:shadow-yellow-500 transition"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-xl mb-3"
                />
              ) : (
                <div className="w-full h-56 bg-zinc-700 rounded-xl mb-3 flex items-center justify-center text-zinc-400">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-yellow-300">
                <Film className="w-5 h-5" />
                {item.title}
              </h3>
              {item.score && (
                <p className="text-yellow-400 font-mono font-bold text-lg">
                  ⭐ {item.score.toFixed(1)}
                </p>
              )}
              <Countdown targetDate={item.date} />
            </div>
          ))}
        </div>
      </div>

      {/* Release Calendar */}
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold text-green-400 mb-6 text-center drop-shadow-md flex justify-center items-center gap-2">
          <Calendar className="w-8 h-8" /> Release Calendar
        </h2>
        <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 py-2 px-4">
          {releaseCalendarItems.map((item) => {
            const dateObj = new Date(item.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString("default", { month: "short" });
            return (
              <div
                key={item.id}
                className="min-w-[140px] bg-zinc-900/70 rounded-xl p-3 flex flex-col items-center shadow-lg"
              >
                <div className="text-yellow-300 font-bold text-xl">{day}</div>
                <div className="text-zinc-400 uppercase text-sm mb-2">{month}</div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
                <p className="text-white text-center text-sm font-semibold line-clamp-2">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
