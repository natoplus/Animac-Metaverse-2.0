import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY; // put your TMDB API key in .env
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const WatchTowerPreview = () => {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingWithTrailers = async () => {
    try {
      // 1️⃣ Fetch upcoming movies
      const upcomingRes = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          page: 1,
        },
      });

      const upcomingMovies = upcomingRes.data.results;

      // 2️⃣ For each movie, fetch the trailer
      const moviesWithTrailers = await Promise.all(
        upcomingMovies.slice(0, 6).map(async (movie) => {
          const videosRes = await axios.get(
            `${TMDB_BASE_URL}/movie/${movie.id}/videos`,
            {
              params: {
                api_key: TMDB_API_KEY,
                language: "en-US",
              },
            }
          );

          const trailer = videosRes.data.results.find(
            (vid) => vid.type === "Trailer" && vid.site === "YouTube"
          );

          return {
            id: movie.id,
            title: movie.title,
            releaseDate: movie.release_date,
            backdrop: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
            trailerKey: trailer ? trailer.key : null,
          };
        })
      );

      setTrailers(moviesWithTrailers.filter((m) => m.trailerKey));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trailers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingWithTrailers();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading trailers...</div>;
  }

  return (
    <section className="watchtower-preview space-y-8">
      {trailers.map((movie) => (
        <motion.div
          key={movie.id}
          className="trailer-card rounded-lg overflow-hidden shadow-lg bg-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white">{movie.title}</h2>
            <p className="text-sm text-gray-400">
              Release: {movie.releaseDate}
            </p>
            {movie.trailerKey && (
              <iframe
                className="mt-3 w-full aspect-video"
                src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default WatchTowerPreview;
