// WatchTowerPage.js (refactored, inline version)
// -----------------------------------------------------------------------------
// Now all API logic is centralized in /utils/watchtowerData.js.
// UI components (HeroSection, TrailerModal, etc.) remain inline here.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play as PlayIcon,
  Sparkles as SparklesIcon,
  Star as StarIcon,
  Tv as TvIcon,
  Film as FilmIcon,
  Timer as TimerIcon,
  Flame as FlameIcon,
} from "lucide-react";

import { useWatchTowerData } from "../utils/watchtowerData";

// -----------------------------------------------------------------------------
// Skeletons
// -----------------------------------------------------------------------------
const LineSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-800 rounded-md ${className}`} />
);
const PosterSkeleton = () => (
  <div className="w-40 h-60 bg-gray-800 animate-pulse rounded-lg" />
);

// -----------------------------------------------------------------------------
// Trailer Modal
// -----------------------------------------------------------------------------
const TrailerModal = ({ open, onClose, title, trailerUrl }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        {trailerUrl ? (
          <iframe
            src={trailerUrl}
            title="Trailer"
            className="w-full h-[500px] rounded-lg"
            allowFullScreen
          />
        ) : (
          <p className="text-gray-400 text-center">No trailer available</p>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Hero Section
// -----------------------------------------------------------------------------
const HeroSection = ({ mode, onPlayTrailer }) => (
  <div className="relative w-full h-[60vh] bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-center px-4">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-6xl font-bold mb-4"
    >
      WatchTower: {mode === "east" ? "Anime & Asian Dramas" : "Movies & TV"}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-lg md:text-xl text-gray-300 max-w-2xl"
    >
      Explore trending, upcoming, and top-rated {mode === "east" ? "anime" : "movies and shows"}.
    </motion.p>
    <motion.button
      onClick={onPlayTrailer}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-6 px-6 py-3 bg-red-600 rounded-full text-lg font-semibold flex items-center gap-2 hover:bg-red-700 transition"
    >
      <PlayIcon size={20} /> Watch Trailer
    </motion.button>
  </div>
);

// -----------------------------------------------------------------------------
// East/West Toggle
// -----------------------------------------------------------------------------
const EastWestToggle = ({ mode, setMode, refresh }) => (
  <div className="flex justify-center gap-4 mt-6">
    <button
      onClick={() => {
        setMode("east");
        refresh();
      }}
      className={`px-4 py-2 rounded-lg font-medium ${
        mode === "east" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
      }`}
    >
      <TvIcon className="inline-block mr-2" size={18} />
      East
    </button>
    <button
      onClick={() => {
        setMode("west");
        refresh();
      }}
      className={`px-4 py-2 rounded-lg font-medium ${
        mode === "west" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
      }`}
    >
      <FilmIcon className="inline-block mr-2" size={18} />
      West
    </button>
  </div>
);

// -----------------------------------------------------------------------------
// Horizontal Carousel
// -----------------------------------------------------------------------------
const HorizontalCarousel = ({ title, items, onItemClick }) => (
  <section className="mt-10 px-6">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      {title}
      <SparklesIcon size={20} className="text-yellow-400" />
    </h2>
    <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
      {items?.map((item, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05 }}
          onClick={() => onItemClick(item)}
          className="min-w-[160px] cursor-pointer"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="rounded-lg shadow-md w-40 h-60 object-cover"
          />
          <p className="mt-2 text-sm text-center line-clamp-1">{item.title}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// -----------------------------------------------------------------------------
// Recommended Grid
// -----------------------------------------------------------------------------
const RecommendedGrid = ({ title, items, onItemClick }) => (
  <section className="mt-12 px-6">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      {title}
      <FlameIcon size={20} className="text-red-500" />
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {items?.map((item, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05 }}
          onClick={() => onItemClick(item)}
          className="cursor-pointer"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="rounded-lg shadow-md w-full h-60 object-cover"
          />
          <p className="mt-2 text-sm text-center line-clamp-1">{item.title}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// -----------------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------------
export default function WatchTowerPage() {
  const [mode, setMode] = useState("east"); // east | west
  const { trending, upcoming, topRated, recommended, loading, error, refresh } =
    useWatchTowerData(mode);

  // Trailer modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowTrailer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black text-white">
      {/* Hero Section */}
      <HeroSection
        mode={mode}
        onPlayTrailer={() => {
          if (trending?.[0]) {
            setSelectedItem(trending[0]);
            setShowTrailer(true);
          }
        }}
      />

      {/* East/West Toggle */}
      <EastWestToggle mode={mode} setMode={setMode} refresh={refresh} />

      {/* Loading/Error states */}
      {loading && (
        <div className="space-y-6 px-6 mt-6">
          <LineSkeleton className="h-10 w-64" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <PosterSkeleton key={i} />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center mt-6">
          Something went wrong loading content.
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Carousels */}
          <HorizontalCarousel
            title="Trending Now"
            items={trending}
            onItemClick={handleItemClick}
          />
          <HorizontalCarousel
            title="New Releases & Upcoming"
            items={upcoming}
            onItemClick={handleItemClick}
          />
          <HorizontalCarousel
            title="Top Rated"
            items={topRated}
            onItemClick={handleItemClick}
          />

          {/* Recommended Grid */}
          <RecommendedGrid
            title="Recommended"
            items={recommended}
            onItemClick={handleItemClick}
          />
        </>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        open={showTrailer}
        onClose={() => setShowTrailer(false)}
        title={selectedItem?.title}
        trailerUrl={selectedItem?.trailerUrl}
      />
    </div>
  );
}
