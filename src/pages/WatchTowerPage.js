import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@headlessui/react";
import { TimerReset, Film } from "lucide-react";
import axios from "axios";

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

export default function WatchTowerPage() {
  const [isEast, setIsEast] = useState(true);
  const [eastList, setEastList] = useState([]);
  const [westList, setWestList] = useState([]);
  const [loadingEast, setLoadingEast] = useState(true);
  const [loadingWest, setLoadingWest] = useState(true);
  const [errorEast, setErrorEast] = useState(null);
  const [errorWest, setErrorWest] = useState(null);

  // Fetch Anime from AniList
  useEffect(() => {
    const fetchAnime = async () => {
      const query = `
        query {
          Page(perPage: 10) {
            media(type: ANIME, sort: START_DATE, status: NOT_YET_RELEASED) {
              id
              title { romaji }
              startDate { year month day }
              coverImage { large }
              genres
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

        if (!response.ok) {
          throw new Error(`AniList fetch error: ${response.statusText}`);
        }

        const { data } = await response.json();

        const list = data.Page.media.map((item) => ({
          title: item.title.romaji,
          date: `${item.startDate.year}-${String(item.startDate.month).padStart(2, "0")}-${String(item.startDate.day).padStart(2, "0")}T00:00:00Z`,
          image: item.coverImage.large,
          genres: item.genres,
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

  // Fetch Movies from TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        if (!TMDB_API_KEY || TMDB_API_KEY === "<fallback-your-key>") {
          throw new Error("TMDB API key not set");
        }

        const { data } = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );

        const list = data.results.slice(0, 10).map((movie) => ({
          title: movie.title,
          date: movie.release_date + "T00:00:00Z",
          image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
          genres: [], // You can map genre_ids if needed
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

  const loading = loadingEast || loadingWest;

  const displayedList = isEast ? eastList : westList;
  const error = isEast ? errorEast : errorWest;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-glow-red drop-shadow-md">
          Upcoming {isEast ? "Anime" : "Western"} Releases
        </h1>
        <Switch
          checked={!isEast}
          onChange={() => {
            setIsEast((prev) => !prev);
            console.log("🌀 Toggled to:", !isEast ? "Anime" : "Movies");
          }}
          className={`${
            isEast ? "bg-red-600" : "bg-blue-600"
          } relative inline-flex h-6 w-14 items-center rounded-full transition duration-300`}
        >
          <span className="sr-only">Toggle East/West</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
              isEast ? "translate-x-1" : "translate-x-9"
            }`}
          />
        </Switch>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400 text-sm animate-pulse">
          Loading upcoming titles...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">
          Error loading {isEast ? "Anime" : "Movies"}: {error}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="text-center text-zinc-400 font-semibold">
          No upcoming {isEast ? "Anime" : "Movies"} releases found.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={isEast ? "east" : "west"}
            initial={{ opacity: 0, x: isEast ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isEast ? 50 : -50 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayedList.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-900/70 border border-zinc-700 backdrop-blur-md p-4 rounded-2xl shadow-xl hover:shadow-glow transition duration-300"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-cover rounded-xl mb-3 shadow-md"
                  />
                ) : (
                  <div className="w-full h-56 bg-zinc-700 rounded-xl mb-3 flex items-center justify-center text-zinc-400">
                    No Image
                  </div>
                )}

                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2 text-white drop-shadow-sm">
                  <Film className="w-5 h-5 text-yellow-400" />
                  {item.title}
                </h2>
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
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
