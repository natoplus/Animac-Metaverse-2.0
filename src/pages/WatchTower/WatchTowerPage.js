import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@headlessui/react";
import { Clock10, TimerReset, Film } from "lucide-react";
import axios from "axios";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(targetDate) - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return <span className="text-green-400 font-semibold">Now Streaming</span>;

  return (
    <div className="font-mono text-xs text-blue-300 tracking-wide">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

export default function WatchTower() {
  const [isEast, setIsEast] = useState(true);
  const [eastList, setEastList] = useState([]);
  const [westList, setWestList] = useState([]);

  useEffect(() => {
    async function fetchAnime() {
      const query = `
        query {
          Page(perPage: 12) {
            media(type: ANIME, sort: START_DATE, status: NOT_YET_RELEASED) {
              id
              title { romaji }
              startDate { year month day }
              coverImage { large }
              genres
            }
          }
        `;
      try {
        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const { data } = await response.json();
        const list = data.Page.media.map((item) => ({
          title: item.title.romaji,
          date: `${item.startDate.year}-${String(item.startDate.month).padStart(2, "0")}-${String(item.startDate.day).padStart(2, "0")}T00:00:00Z`,
          image: item.coverImage.large,
          genres: item.genres,
        }));
        setEastList(list);
      } catch (error) {
        console.error("❌ Error fetching anime:", error);
      }
    }
    fetchAnime();
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const list = res.data.results.slice(0, 12).map((movie) => ({
          title: movie.title,
          date: movie.release_date + "T00:00:00Z",
          image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          genres: [],
        }));
        setWestList(list);
      } catch (error) {
        console.error("❌ Error fetching movies:", error);
      }
    }
    fetchMovies();
  }, []);

  const currentList = isEast ? eastList : westList;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-12 font-inter">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-red-500 neon-glow"
        >
          ⏱️ Watch Tower: Upcoming {isEast ? "Anime" : "Movies"}
        </motion.h1>

        <Switch
          checked={!isEast}
          onChange={() => setIsEast(!isEast)}
          className={`${
            isEast ? "bg-red-600" : "bg-blue-600"
          } relative inline-flex h-8 w-20 items-center rounded-full transition duration-300 ring-1 ring-white/20`}
        >
          <span className="sr-only">Toggle East/West</span>
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-300 ${
              isEast ? "translate-x-2" : "translate-x-12"
            }`}
          />
        </Switch>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isEast ? "anime" : "movies"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {currentList.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-neon transition-all duration-300 p-4"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-xl mb-4 border border-white/10"
              />
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-yellow-400" />
                {item.title}
              </h2>
              {item.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1 text-xs text-pink-300 mb-3">
                  {item.genres.slice(0, 3).map((g, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full border border-pink-500 bg-pink-900/40"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Countdown targetDate={item.date} />
                <Clock10 className="text-cyan-300 w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
