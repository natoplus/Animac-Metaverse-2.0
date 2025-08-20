// WatchTowerPage.js
// A single-file, fully-featured East (Anime) / West (Movies & TV) content hub
// Built with React + Tailwind CSS + Framer Motion + lucide-react icons
// -----------------------------------------------------------------------------
// REGENERATED: Now wired to REAL APIs with real trailer links.
//   East  = AniList (GraphQL) + Jikan (REST)
//   West  = TMDB (REST) + Trakt (REST)
// - Trailer modal pulls actual YouTube trailers from AniList, Jikan and TMDB; uses Trakt's
//   trailer URLs when available (YouTube/Vimeo). Fallbacks included.
// - Uses environment variables for API keys:
//     REACT_APP_TMDB_KEY  (required)
//     REACT_APP_TRAKT_KEY (required)
// - Fully self-contained single-file React component with all sections:
//     HeroSection, EastWestToggle, HorizontalCarousel, PosterSkeleton, LineSkeleton,
//     TrailerModal, RecommendedGrid, HeaderBar, FooterBar, plus hooks & utilities.
// - Infinite autoplaying carousels with hover-scale posters, Netflix-style.
// - Responsive & mobile-first. Fonts: Azonix (titles), Montserrat (text).
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play as PlayIcon,
  X as XIcon,
  Star as StarIcon,
  Film as FilmIcon,
  Tv as TvIcon,
  RefreshCw as RefreshIcon,
  Triangle as TriangleIcon,
  MonitorSmartphone as MonitorIcon,
  Smartphone as PhoneIcon,
  Timer as TimerIcon,
  Sparkles as SparklesIcon,
  Flame as FlameIcon,
  Crown as CrownIcon,
} from "lucide-react";

import { useWatchTowerData } from "../utils/watchtowerData";

// -----------------------------------------------------------------------------
// Global Style Injection: Fonts, Keyframes, Reusable CSS
// -----------------------------------------------------------------------------
const GlobalStyles = () => (
  <style>{`
  /* ----------------- Fonts ----------------- */
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  @font-face {
    font-family: 'Azonix';
    src: url('https://fonts.cdnfonts.com/s/15163/Azonix.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  :root {
    --title-font: 'Azonix', 'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    --text-font: 'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  }

  /* ----------------- Marquee Animations for Infinite Rows ----------------- */
  @keyframes marqueeLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes marqueeRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
  .marquee-left { animation: marqueeLeft var(--marquee-duration, 45s) linear infinite; }
  .marquee-right { animation: marqueeRight var(--marquee-duration, 45s) linear infinite; }
  .marquee-pause:hover { animation-play-state: paused; }

  /* ----------------- Scrollbar styling (subtle) ----------------- */
  .thin-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
  .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 9999px; }
  .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }

  /* Gradient overlay for poster readability */
  .poster-gradient { background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.0) 60%); }
  .focus-ring { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.6); }
  img { image-rendering: auto; }
  .will-change-transform { will-change: transform; }
  `}</style>
);

// -----------------------------------------------------------------------------
// Utility Helpers
// -----------------------------------------------------------------------------
const cx = (...classes) => classes.filter(Boolean).join(" ");

function debounce(fn, wait = 150) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

function dedupeByKey(items, key = 'id') { const map = new Map(); for (const it of items) { if (!map.has(it[key])) map.set(it[key], it); } return Array.from(map.values()); }
function mergeDedup(lists, key = 'id') { return dedupeByKey(lists.flat().filter(Boolean), key); }
function shuffle(array) { const a = array.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function randomSlice(items, count) { return shuffle(items).slice(0, Math.min(count, items.length)); }

// Simple concurrency limiter to avoid hammering APIs with too many requests at once
function pLimit(concurrency) {
  let activeCount = 0;
  const queue = [];
  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      const fn = queue.shift();
      fn();
    }
  };
  const run = (fn, resolve, ...args) => {
    activeCount++;
    const result = fn(...args);
    Promise.resolve(result).then(resolve).then(next, next);
  };
  return (fn, ...args) => new Promise((resolve) => {
    const task = run.bind(null, fn, resolve, ...args);
    if (activeCount < concurrency) task(); else queue.push(task);
  });
}

// -----------------------------------------------------------------------------
// Placeholder Media Assets (for hero GIFs & fallback images)
// -----------------------------------------------------------------------------
const PLACEHOLDER = {
  heroEast: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzl3a3BqYmk2dzhjM2dvbHh3MnNmOHg0NmR1YWN2eHR0cGhkbjhhcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEdv1G8vz9p8GmGgQ/giphy.gif", // Attack on Titan vibe
  heroWest: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHhwd3B0Y3UxaG9iNnhsenQwY3E3djk4cDk1Y2l1eDltcWQ2bWZnaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KQ8a0OZ7dZK00/giphy.gif", // Spider-Verse vibe
  posters: [
    "https://picsum.photos/342/513?random=101",
    "https://picsum.photos/342/513?random=102",
    "https://picsum.photos/342/513?random=103",
  ],
  backdrops: [
    "https://picsum.photos/1280/720?random=201",
    "https://picsum.photos/1280/720?random=202",
  ],
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
/**
 * @typedef {Object} MediaItem
 * @property {string} id - unique id with source prefix
 * @property {string} title
 * @property {number|string} year
 * @property {number} rating - 0-10 (normalized)
 * @property {string} poster
 * @property {string} backdrop
 * @property {string} type - 'movie' | 'tv' | 'anime'
 * @property {string} region - 'east' | 'west'
 * @property {string=} trailerUrl - YouTube/Vimeo url
 * @property {string=} synopsis
 * @property {object=} _meta - optional raw source hints (ids, types)
 */




// -----------------------------------------------------------------------------
// Skeleton Loaders
// -----------------------------------------------------------------------------
export const LineSkeleton = ({ className = "" }) => (
  <div className={cx("animate-pulse rounded-full bg-white/10", className)} />
);

export const PosterSkeleton = ({ className = "w-[180px] h-[270px] md:w-[190px] md:h-[285px] rounded-2xl" }) => (
  <div className={cx("animate-pulse bg-white/10", className)} />
);

// -----------------------------------------------------------------------------
// Trailer Modal (YouTube/Vimeo, Accessible, Animated)
// -----------------------------------------------------------------------------
function toEmbedUrl(url){
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      // watch?v= -> embed/
      const vid = u.searchParams.get('v');
      return vid ? `https://www.youtube.com/embed/${vid}` : url;
    }
    if (u.hostname.includes('youtu.be')) {
      const vid = u.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const vid = u.pathname.split('/').filter(Boolean)[0];
      return vid ? `https://player.vimeo.com/video/${vid}` : url;
    }
    return url;
  } catch { return url; }
}

function TrailerModal({ open, onClose, title, trailerUrl }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const embed = toEmbedUrl(trailerUrl || '');

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title || 'Trailer'} modal`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
          >
            {embed ? (
              <iframe
                title={title || 'Trailer'}
                src={embed}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                <div>
                  <div className="text-lg font-semibold" style={{ fontFamily: 'var(--text-font)' }}>Trailer not available</div>
                  <div className="mt-2 text-white/70 text-sm">Try another title or switch regions.</div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-black/70 hover:bg-black/80 focus:ring-2 focus:ring-white p-2"
              aria-label="Close trailer"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

// -----------------------------------------------------------------------------
// East/West Toggle
// -----------------------------------------------------------------------------
function EastWestToggle({ value, onChange }) {
  const isEast = value === 'east';
  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="relative bg-white/10 backdrop-blur rounded-full p-1 flex items-center shadow-lg">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cx(
            "absolute top-1 bottom-1 rounded-full w-1/2",
            isEast ? "left-1" : "left-1/2",
            "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md"
          )}
        />
        <button onClick={() => onChange('east')} className={cx("relative z-10 flex-1 px-4 py-2 text-center transition-colors", isEast ? "text-white" : "text-white/60 hover:text-white")}> 
          <span className="font-semibold tracking-wide" style={{ fontFamily: 'var(--text-font)' }}>East (Anime)</span>
        </button>
        <button onClick={() => onChange('west')} className={cx("relative z-10 flex-1 px-4 py-2 text-center transition-colors", !isEast ? "text-white" : "text-white/60 hover:text-white")}> 
          <span className="font-semibold tracking-wide" style={{ fontFamily: 'var(--text-font)' }}>West (Movies/TV)</span>
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Hero Section
// -----------------------------------------------------------------------------
function HeroSection({ mode, onPlayTrailer }) {
  const isEast = mode === 'east';
  const gif = isEast ? PLACEHOLDER.heroEast : PLACEHOLDER.heroWest;
  const headline = isEast ? 'ATTACK ON TITAN' : 'SPIDER-VERSE';
  const subhead = isEast ? 'Survey Corps vs the Titans. Walls will fall.' : 'Into the Spider-Verse. Infinite styles.';

  return (
    <motion.section initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="relative w-full overflow-hidden rounded-3xl shadow-2xl">
      <div className="relative h-[52vh] md:h-[62vh] w-full">
        <img src={gif} alt={headline} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
          <div className="max-w-5xl">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-wider drop-shadow-lg" style={{ fontFamily: 'var(--title-font)' }}>{headline}</h1>
            <p className="mt-3 md:mt-4 text-sm md:text-base lg:text-lg text-white/90 max-w-2xl" style={{ fontFamily: 'var(--text-font)' }}>{subhead}</p>
            <div className="mt-4 md:mt-6 flex items-center gap-3">
              <button onClick={onPlayTrailer} className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold shadow-lg bg-white text-black hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white">
                <PlayIcon className="w-4 h-4 md:w-5 md:h-5" /> Play Trailer
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold shadow-lg bg-white/10 text-white hover:bg白/20 focus:outline-none focus:ring-2 focus:ring-white">
                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" /> Add to Watchlist
              </button>
            </div>
            <div className="mt-4 md:mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full bg-white/10">
                <StarIcon className="w-4 h-4 text-yellow-300" /> Top Rated Pick
              </span>
              <span className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full bg-white/10">
                {isEast ? <TvIcon className="w-4 h-4" /> : <FilmIcon className="w-4 h-4" />} {isEast ? 'Anime' : 'Cinematic'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1 rounded-full bg-white/10">
                <TimerIcon className="w-4 h-4" /> New & Trending
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// -----------------------------------------------------------------------------
// Poster Card
// -----------------------------------------------------------------------------
function PosterCard({ item, onClick }) {
  return (
    <div className="group relative flex-shrink-0 w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[240px] 2xl:w-[260px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10 bg-white/5">
        <img src={item.poster} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.06]" />
        <div className="poster-gradient absolute inset-x-0 bottom-0 h-1/2" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold truncate" style={{ fontFamily: 'var(--text-font)' }}>{item.title}</h4>
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-black/60 rounded-full px-2 py-0.5">
              <StarIcon className="w-3 h-3 text-yellow-300" />
              <span>{(item.rating ?? 0).toFixed ? item.rating.toFixed(1) : item.rating}</span>
            </div>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-white/80 flex items-center gap-2">
            <span className="uppercase tracking-wider">{item.type}</span>
            <span>•</span>
            <span>{item.year}</span>
            <span>•</span>
            <span className="capitalize">{item.region}</span>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <button onClick={() => onClick?.(item)} className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white" aria-label={`Open ${item.title}`} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Horizontal Carousel (Infinite loop via marquee duplication)
// -----------------------------------------------------------------------------

function HorizontalCarousel({ title, icon: Icon, items = [], speed = 0.5, onItemClick }) {
  const scrollRef = useRef(null);

  // Duplicate items for seamless loop
  const loopItems = useMemo(() => [...items, ...items], [items]);

  // Auto scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame;
    function step() {
      el.scrollLeft += speed;

      // instead of snapping at half, reset earlier invisibly
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      }

      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [speed]);


  // Swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
      }
    },
    onSwipedRight: () => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
      }
    },
    trackMouse: true,
  });

  return (
    <section className="mt-8">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-3 px-1">
        {Icon ? <Icon className="w-5 h-5 text-white/90" /> : <FlameIcon className="w-5 h-5 text-white/90" />}
        <h3 className="text-lg md:text-xl tracking-wider" style={{ fontFamily: "var(--title-font)" }}>
          {title}
        </h3>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden" {...handlers}>
        <div
          ref={scrollRef}
          className="flex gap-3 pr-3 overflow-x-scroll scrollbar-hide" // removed scroll-smooth here
        >
          {loopItems.map((item, idx) => (
            <PosterCard key={`${item.id}-${idx}`} item={item} onClick={onItemClick} />
          ))}
        </div>


        {/* gradient fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
      </div>
    </section>
  );
}


// -----------------------------------------------------------------------------
// Recommended Grid
// -----------------------------------------------------------------------------
function RecommendedGrid({ title, items, onItemClick }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <CrownIcon className="w-5 h-5 text-white/90" />
        <h3 className="text-lg md:text-xl tracking-wider" style={{ fontFamily: 'var(--title-font)' }}>{title}</h3>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {items.map((item) => (
          <PosterCard key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Page Chrome: Header, Footer, Utility Bars
// -----------------------------------------------------------------------------
function HeaderBar({ mode, setMode, onRefresh }) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-black/70 to-black/0 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center">
            <TriangleIcon className="w-5 h-5 text-white rotate-180" />
          </div>
          <div>
            <div className="text-base md:text-lg tracking-widest" style={{ fontFamily: 'var(--title-font)' }}>WATCHTOWER</div>
            <div className="text-[10px] md:text-xs text-white/70" style={{ fontFamily: 'var(--text-font)' }}>East / West Hub</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-white/80" style={{ fontFamily: 'var(--text-font)' }}>
          <MonitorIcon className="w-4 h-4" />
          <span>Optimized for laptops</span>
          <span className="mx-1">•</span>
          <PhoneIcon className="w-4 h-4" />
          <span>and phones</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs md:text-sm font-semibold shadow bg-white/10 hover:bg-white/20">
            <RefreshIcon className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto pb-3 px-4">
        <EastWestToggle value={mode} onChange={setMode} />
      </div>
    </header>
  );
}

function FooterBar() {
  return (
    <footer className="mt-16 py-8 text-center text-white/60 text-xs" style={{ fontFamily: 'var(--text-font)' }}>
      <div className="max-w-7xl mx-auto px-4">
        Built with ❤️ using AniList, Jikan, TMDB & Trakt. Supply API keys in .env. Respect each provider's terms.
      </div>
    </footer>
  );
}

// -----------------------------------------------------------------------------
// Error/Empty States
// -----------------------------------------------------------------------------
function ErrorState({ onRetry, error }) {
  return (
    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
      <div className="text-red-300 font-semibold" style={{ fontFamily: 'var(--text-font)' }}>Something went wrong loading content.</div>
      {error?.message && <div className="mt-1 text-red-200 text-xs">{String(error.message)}</div>}
      <button onClick={onRetry} className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow bg-red-500/20 hover:bg-red-500/30">
        <RefreshIcon className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <LineSkeleton className="h-10 w-64" />
      <div className="flex gap-3 overflow-hidden">{Array.from({ length: 8 }).map((_, i) => <PosterSkeleton key={i} />)}</div>
      <LineSkeleton className="h-10 w-72" />
      <div className="flex gap-3 overflow-hidden">{Array.from({ length: 8 }).map((_, i) => <PosterSkeleton key={i} />)}</div>
      <LineSkeleton className="h-10 w-80" />
      <div className="flex gap-3 overflow-hidden">{Array.from({ length: 8 }).map((_, i) => <PosterSkeleton key={i} />)}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------
export default function WatchTowerPage() {
  const [mode, setMode] = useState('east');
  const { trending, upcoming, topRated, recommended, loading, error, refresh } = useWatchTowerData(mode);
  const [trailer, setTrailer] = useState({ open: false, item: null });

  const onItemClick = useCallback((item) => { if (item?.trailerUrl) setTrailer({ open: true, item }); }, []);

  const onPlayHeroTrailer = useCallback(() => {
    const heroItem = {
      title: mode === 'east' ? 'Attack on Titan' : 'Spider-Verse',
      trailerUrl: mode === 'east' ? 'https://www.youtube.com/watch?v=MGRm4IzK1SQ' : 'https://www.youtube.com/watch?v=g4Hbz2jLxvQ',
    };
    setTrailer({ open: true, item: heroItem });
  }, [mode]);

  const fadeKey = `mode-${mode}`;

  return (
    <div className="min-h-screen bg-black text-white">
      <GlobalStyles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-indigo-600" />
        <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-pink-600" />
      </div>

      <HeaderBar mode={mode} setMode={setMode} onRefresh={refresh} />

      <main className="max-w-7xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div key={fadeKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <HeroSection mode={mode} onPlayTrailer={onPlayHeroTrailer} />

            {error ? (
              <div className="mt-8"><ErrorState onRetry={refresh} error={error} /></div>
            ) : loading ? (
              <div className="mt-8"><LoadingState /></div>
            ) : (
              <>
                <HorizontalCarousel title="Trending Now" icon={FlameIcon} items={trending} speed={42} direction="left" onItemClick={onItemClick} />
                <HorizontalCarousel title="New Releases & Upcoming" icon={SparklesIcon} items={upcoming} speed={48} direction="right" onItemClick={onItemClick} />
                <HorizontalCarousel title="Top Rated" icon={StarIcon} items={topRated} speed={40} direction="left" onItemClick={onItemClick} />
                <RecommendedGrid title="Recommended For You" items={recommended} onItemClick={onItemClick} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <FooterBar />

      <TrailerModal open={trailer.open} onClose={() => setTrailer({ open: false, item: null })} title={trailer.item?.title} trailerUrl={trailer.item?.trailerUrl} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Developer Notes & Setup
// -----------------------------------------------------------------------------
// 1) Environment Variables (.env at project root):
//    REACT_APP_TMDB_KEY=your_tmdb_key
//    REACT_APP_TRAKT_KEY=your_trakt_client_id
//    Restart dev server after adding.
// 2) Rate limits: Jikan is free but rate-limited; Trakt requires API key and adherence to
//    their terms. AniList GraphQL also has limits—batch responsibly.
// 3) Image CDN: TMDB images used for West and to enrich Trakt items. For East, AniList and
//    Jikan provide cover images; we display those directly.
// 4) Trailer logic priority:
//    - East: Use AniList trailer if present; else Jikan trailer; fallback none.
//    - West: Use Trakt trailer if present; else TMDB videos endpoint; else none.
// 5) Infinite carousels are CSS-powered (no timers) using marquee-style keyframes. Hover
//    pauses animation. Duplicate arrays ensure seamless looping.
// 6) Accessibility: Modal supports ESC and backdrop click to close. Posters are buttons with
//    focus rings. Consider focus trapping for complex modals.
// 7) Performance tips: You may virtualize rows, lazy-load carousels with IntersectionObserver,
//    or lower image sizes for low-end devices.
// 8) Security/CORS: In some setups, Trakt/TMDB calls from the browser may need a proxy if
//    your environment enforces strict CORS. In that case, add a tiny server middleware or use
//    a Next.js API route to forward requests securely.
// 9) Future enhancements: Authentication, user watchlist, genre filters, search, continue
//    watching rail, and server-side caching for API responses.
