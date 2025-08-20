// WatchTowerPage.js
// Full East/West toggle entertainment hub — Netflix/Hulu/Crunchyroll style
// Self-contained single file, cyber sleek UI, neon/glassmorphism, responsive
// APIs: AniList (GraphQL), Jikan (MyAnimeList REST), TMDB (REST), Trakt (REST; optional)
// Trailer Modal (YouTube embed), Hero with countdown, Multiple carousels with arrows
// Toggle persists via localStorage. Azonix branding retained.

// ========================= Imports =========================
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Star,
  Tag,
  Calendar,
  PlayCircle,
  X,
  Sparkles,
  Flame,
  Rocket,
  Clock8,
  ThumbsUp,
  Compass,
  Tv,
  Clapperboard,
  Medal,
  ChevronRight,
  ChevronLeft,
  Zap,
  RefreshCcw,
} from "lucide-react";
import axios from "axios";

// ========================= Fonts & Global Helpers =========================

// Import Azonix font (can move to global CSS or head tag)
const AZONIX_FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Azonix&display=swap";

if (typeof document !== "undefined") {
  if (!document.getElementById("azonix-font")) {
    const link = document.createElement("link");
    link.id = "azonix-font";
    link.rel = "stylesheet";
    link.href = AZONIX_FONT_LINK;
    document.head.appendChild(link);
  }
}

// ======= API Keys (read from env; fallbacks allowed but features may reduce)
const TMDB_API_KEY =
  process.env.REACT_APP_TMDB_API_KEY || "<YOUR_TMDB_API_KEY_HERE>";
// Trakt requires a (public) API key (a.k.a. client id) in header "trakt-api-key"
const TRAKT_API_KEY =
  process.env.REACT_APP_TRAKT_API_KEY || "<OPTIONAL_TRAKT_CLIENT_ID>";

// ========================= Utility & Types =========================

/**
 * Normalized media item type for both East and West:
 * {
 *   id: string|number
 *   source: 'anilist'|'jikan'|'tmdb'|'trakt'
 *   title: string
 *   altTitles?: string[]
 *   overview?: string
 *   poster: string|null
 *   backdrop?: string|null
 *   trailerKey?: string|null   // YouTube key
 *   trailerSite?: 'YouTube'|'Vimeo'|null
 *   genres: string[]
 *   score?: number|null        // 0-100 or 0-10 scale normalized to 0-100
 *   popularity?: number|null
 *   type: 'movie'|'series'|'anime'
 *   releaseDate?: string|null  // ISO string
 *   year?: number|null
 *   runtime?: number|null
 *   episodes?: number|null
 * }
 */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const toISODate = (y, m, d) => {
  if (!y || !m || !d) return null;
  try {
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}T00:00:00Z`;
  } catch {
    return null;
  }
};

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) acc[k] = obj[k];
    return acc;
  }, {});

// Human friendly date
const prettyDate = (dateStr) => {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ========================= Small UI Primitives =========================

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      if (Number.isNaN(target.getTime()) || diff <= 0) {
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
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return <span className="text-zinc-400">TBA</span>;
  if (!timeLeft)
    return (
      <span className="text-green-400 font-semibold flex items-center gap-1">
        <Zap className="w-4 h-4" /> Now Showing
      </span>
    );

  return (
    <span className="font-mono text-sm text-blue-300">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}

function NeonPill({ children, active }) {
  return (
    <span
      className={[
        "px-3 py-1 rounded-full border text-xs font-semibold tracking-wide",
        active
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/20 shadow-[0_0_20px_rgba(255,0,255,0.35)]"
          : "bg-black/30 text-zinc-300 border-white/10",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-3">
          <Icon className="w-7 h-7 text-purple-400 drop-shadow-[0_0_12px_rgba(180,100,255,0.75)]" />
          <h2 className="text-2xl md:text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-fuchsia-400 to-purple-300 bg-clip-text text-transparent drop-shadow">
              {title}
            </span>
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-zinc-400 mt-1 ml-10">{subtitle}</p>
        )}
      </div>
      <div>{right}</div>
    </div>
  );
}

function ArrowButton({ direction = "left", onClick, aria }) {
  return (
    <button
      aria-label={aria || `Scroll ${direction}`}
      onClick={onClick}
      className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/70 hover:bg-purple-700 transition text-white border border-white/10 shadow-lg"
    >
      {direction === "left" ? (
        <ChevronLeft className="w-6 h-6" />
      ) : (
        <ChevronRight className="w-6 h-6" />
      )}
    </button>
  );
}

// ========================= Trailer + Hero =========================

function TrailerCard({ item, onClick }) {
  const { title, poster, trailerKey } = item;
  return (
    <motion.div
      layout
      whileHover={{
        scale: 1.04,
        boxShadow: "0 0 24px rgba(255, 0, 255, 0.6)",
      }}
      onClick={() => trailerKey && onClick?.(item)}
      className="relative min-w-[240px] sm:min-w-[280px] h-[150px] sm:h-[158px] rounded-xl cursor-pointer neon-glow border border-white/10 bg-white/5 hover:bg-white/10 p-3 transition overflow-hidden"
      title={title}
    >
      {poster ? (
        <img
          src={poster}
          alt={`${title} poster`}
          className="absolute inset-0 w-full h-full object-cover brightness-75 rounded-xl"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="bg-zinc-900/60 w-full h-full flex items-center justify-center text-zinc-500 select-none rounded-xl">
          No Poster
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent rounded-xl" />
      <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 text-white font-semibold text-center text-sm leading-tight line-clamp-2 select-none drop-shadow-lg rounded-b-xl">
        {title}
      </div>
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <PlayCircle className="w-14 h-14 text-purple-400 drop-shadow-lg" />
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
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-[999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.86 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-[92vw] md:w-[86vw] max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title={title}
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              aria-label="Close trailer"
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-purple-700/80 hover:bg-purple-700 text-white transition border border-white/20"
            >
              <X size={22} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroFeatured({ item, onPlay }) {
  if (!item) return null;
  const { title, backdrop, poster, releaseDate } = item;
  const bg = backdrop || poster;

  return (
    <section
      className="relative w-full h-[60vh] md:h-[72vh] rounded-2xl overflow-hidden mb-12 neon-glow border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer select-none"
      onClick={() => item.trailerKey && onPlay?.(item)}
      aria-label={`Play trailer for ${title}`}
    >
      {bg ? (
        <img
          src={bg}
          alt={`Featured ${title}`}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.65]"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/40 to-fuchsia-900/30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 md:left-12 md:right-12 flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
        <div className="max-w-2xl">
          <h1
            className="text-4xl md:text-6xl font-extrabold drop-shadow-lg"
            style={{ fontFamily: "'Azonix', sans-serif" }}
          >
            {title}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <NeonPill active>Featured</NeonPill>
            <NeonPill>Spotlight</NeonPill>
          </div>
          <div className="mt-4 flex items-center gap-3 font-mono text-base text-blue-300">
            <Clock8 className="w-5 h-5" />
            <Countdown targetDate={releaseDate} />
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-300">{prettyDate(releaseDate)}</span>
          </div>
        </div>
        <div className="flex-1 md:flex md:justify-end md:items-end">
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(item);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-[0_8px_30px_rgba(180,100,255,0.35)] hover:opacity-95 border border-white/10"
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Play Trailer
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <PlayCircle className="w-24 h-24 text-purple-400/80 drop-shadow-[0_0_30px_rgba(180,100,255,0.75)] animate-pulse" />
      </div>
    </section>
  );
}

// ========================= Carousel =========================

function HorizontalCarousel({
  items,
  renderItem,
  ariaPrefix = "carousel",
  className = "",
}) {
  const ref = useRef(null);

  const scrollBy = (dir) => {
    const node = ref.current;
    if (!node) return;
    const delta = dir === "left" ? -window.innerWidth * 0.6 : window.innerWidth * 0.6;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-12 right-0 flex gap-2">
        <ArrowButton
          direction="left"
          onClick={() => scrollBy("left")}
          aria={`${ariaPrefix}-left`}
        />
        <ArrowButton
          direction="right"
          onClick={() => scrollBy("right")}
          aria={`${ariaPrefix}-right`}
        />
      </div>
      <div
        ref={ref}
        className="flex overflow-x-auto gap-4 pr-1 scrollbar-thin scrollbar-thumb-purple-700/70 scrollbar-track-transparent"
      >
        {items.map((it, idx) => (
          <div key={`${ariaPrefix}-${idx}`} className="flex-shrink-0">
            {renderItem(it, idx)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================= Normalizers (APIs -> Unified Items) =========================

// ---- AniList (GraphQL)
async function fetchAniList({ sort = "TRENDING_DESC", status, perPage = 20 }) {
  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status) {
          id
          title { romaji english native }
          popularity
          averageScore
          episodes
          genres
          coverImage { large extraLarge }
          bannerImage
          startDate { year month day }
          trailer { id site thumbnail }
          description(asHtml: false)
        }
      }
    }`;
  const body = JSON.stringify({
    query,
    variables: { perPage, sort: [sort], status: status || null },
  });
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) throw new Error(`AniList error ${res.status}`);
  const json = await res.json();
  const media = json?.data?.Page?.media || [];
  return media.map((m) => ({
    id: m.id,
    source: "anilist",
    title: m.title?.romaji || m.title?.english || m.title?.native || "Untitled",
    altTitles: [m.title?.english, m.title?.native, m.title?.romaji].filter(Boolean),
    overview: m.description || "",
    poster: m.coverImage?.extraLarge || m.coverImage?.large || null,
    backdrop: m.bannerImage || null,
    trailerKey:
      m.trailer && m.trailer.site?.toLowerCase() === "youtube" ? m.trailer.id : null,
    trailerSite:
      m.trailer && m.trailer.site ? m.trailer.site : m.trailer ? "YouTube" : null,
    genres: m.genres || [],
    score:
      typeof m.averageScore === "number"
        ? clamp(Math.round(m.averageScore), 0, 100)
        : null,
    popularity: m.popularity || null,
    type: "anime",
    releaseDate: toISODate(m.startDate?.year, m.startDate?.month, m.startDate?.day),
    year: m.startDate?.year || null,
    runtime: null,
    episodes: m.episodes || null,
  }));
}

// ---- Jikan (MAL REST): seasonal upcoming / top rated backup
async function fetchJikanUpcoming({ limit = 24 }) {
  const url = `https://api.jikan.moe/v4/seasons/upcoming?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jikan upcoming error ${res.status}`);
  const json = await res.json();
  const list = json?.data || [];
  return list.map((a) => ({
    id: a.mal_id,
    source: "jikan",
    title: a.title || a.title_english || a.title_japanese || "Untitled",
    altTitles: [a.title_english, a.title_japanese, ...(a.titles || []).map((t) => t.title)].filter(Boolean),
    overview: a.synopsis || "",
    poster: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
    backdrop: a.trailer?.images?.maximum_image_url || null,
    trailerKey: a.trailer?.youtube_id || null,
    trailerSite: a.trailer?.youtube_id ? "YouTube" : null,
    genres: (a.genres || []).map((g) => g.name),
    score:
      typeof a.score === "number"
        ? clamp(Math.round(a.score * 10), 0, 100)
        : null,
    popularity: a.popularity || null,
    type: a.type?.toLowerCase() === "movie" ? "movie" : "anime",
    releaseDate: a.aired?.from || a.approved ? a.aired?.from : null,
    year: a.year || null,
    runtime: null,
    episodes: a.episodes || null,
  }));
}

async function fetchJikanTop({ limit = 24 }) {
  const url = `https://api.jikan.moe/v4/top/anime?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jikan top error ${res.status}`);
  const json = await res.json();
  const list = json?.data || [];
  return list.map((a) => ({
    id: a.mal_id,
    source: "jikan",
    title: a.title || a.title_english || a.title_japanese || "Untitled",
    altTitles: [a.title_english, a.title_japanese, ...(a.titles || []).map((t) => t.title)].filter(Boolean),
    overview: a.synopsis || "",
    poster: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
    backdrop: a.trailer?.images?.maximum_image_url || null,
    trailerKey: a.trailer?.youtube_id || null,
    trailerSite: a.trailer?.youtube_id ? "YouTube" : null,
    genres: (a.genres || []).map((g) => g.name),
    score:
      typeof a.score === "number"
        ? clamp(Math.round(a.score * 10), 0, 100)
        : null,
    popularity: a.popularity || null,
    type: a.type?.toLowerCase() === "movie" ? "movie" : "anime",
    releaseDate: a.aired?.from || null,
    year: a.year || null,
    runtime: null,
    episodes: a.episodes || null,
  }));
}

// ---- TMDB (movies + tv) Helpers
const TMDB_IMG = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

async function fetchTMDB({ path, params = {} }) {
  if (!TMDB_API_KEY || TMDB_API_KEY === "<YOUR_TMDB_API_KEY_HERE>") {
    throw new Error("TMDB API key missing. Set REACT_APP_TMDB_API_KEY.");
  }
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

function normalizeTMDBMovie(m) {
  return {
    id: m.id,
    source: "tmdb",
    title: m.title || m.original_title || "Untitled",
    altTitles: [m.original_title].filter(Boolean),
    overview: m.overview || "",
    poster: TMDB_IMG(m.poster_path, "w500"),
    backdrop: TMDB_IMG(m.backdrop_path, "w1280"),
    trailerKey: null, // fill after fetching videos
    trailerSite: null,
    genres: [], // optional fetch later
    score:
      typeof m.vote_average === "number"
        ? clamp(Math.round(m.vote_average * 10), 0, 100)
        : null,
    popularity: m.popularity || null,
    type: "movie",
    releaseDate: m.release_date ? `${m.release_date}T00:00:00Z` : null,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    runtime: null,
    episodes: null,
  };
}

function normalizeTMDBTV(m) {
  return {
    id: m.id,
    source: "tmdb",
    title: m.name || m.original_name || "Untitled",
    altTitles: [m.original_name].filter(Boolean),
    overview: m.overview || "",
    poster: TMDB_IMG(m.poster_path, "w500"),
    backdrop: TMDB_IMG(m.backdrop_path, "w1280"),
    trailerKey: null,
    trailerSite: null,
    genres: [],
    score:
      typeof m.vote_average === "number"
        ? clamp(Math.round(m.vote_average * 10), 0, 100)
        : null,
    popularity: m.popularity || null,
    type: "series",
    releaseDate: m.first_air_date ? `${m.first_air_date}T00:00:00Z` : null,
    year: m.first_air_date ? Number(m.first_air_date.slice(0, 4)) : null,
    runtime: null,
    episodes: null,
  };
}

async function enrichTMDBTrailers(items) {
  // Fetch trailer videos for first N items to save requests
  const slice = items.slice(0, 12);
  const promises = slice.map(async (it) => {
    try {
      const path =
        it.type === "series" ? `tv/${it.id}/videos` : `movie/${it.id}/videos`;
      const json = await fetchTMDB({ path, params: {} });
      const vids = json?.results || [];
      const trailer = vids.find(
        (v) =>
          (v.type === "Trailer" || v.type === "Teaser") &&
          v.site === "YouTube" &&
          v.key
      );
      if (trailer) {
        it.trailerKey = trailer.key;
        it.trailerSite = "YouTube";
      }
    } catch {
      // ignore
    }
    return it;
  });
  const enriched = await Promise.all(promises);
  // Return enriched + unchanged remainder
  return enriched.concat(items.slice(slice.length));
}

// ---- Trakt (optional). We will use trending (shows & movies) if key present.
async function fetchTraktTrending({ type = "movies", limit = 20 }) {
  if (
    !TRAKT_API_KEY ||
    TRAKT_API_KEY === "<OPTIONAL_TRAKT_CLIENT_ID>" ||
    TRAKT_API_KEY.trim() === ""
  ) {
    // Graceful fallback: no Trakt key
    return [];
  }
  const url = `https://api.trakt.tv/${type}/trending?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_API_KEY,
    },
  });
  if (!res.ok) {
    // Do not hard fail West if Trakt is down; just return empty
    return [];
  }
  const json = await res.json();
  // Trakt returns array with { watchers, movie } or { watchers, show }
  // We'll normalize minimally; posters/trailers not provided -> we can later match with TMDB if needed.
  return json
    .map((entry) => entry.movie || entry.show)
    .filter(Boolean)
    .map((e) => ({
      id: e.ids?.trakt || e.ids?.slug || e.title,
      source: "trakt",
      title: e.title,
      altTitles: [],
      overview: "", // Not provided in trending; could fetch /summary but keep it light
      poster: null,
      backdrop: null,
      trailerKey: null,
      trailerSite: null,
      genres: [],
      score: null,
      popularity: null,
      type: e.type || (type === "movies" ? "movie" : "series"),
      releaseDate: null,
      year: e.year || null,
      runtime: null,
      episodes: null,
    }));
}

// ========================= East/West Data Hooks =========================

function useEastHubData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trending, setTrending] = useState([]); // top airing / trending
  const [newReleases, setNewReleases] = useState([]); // upcoming, seasonal
  const [topRated, setTopRated] = useState([]); // highest rated
  const [recommended, setRecommended] = useState([]); // curated/random
  const [spotlight, setSpotlight] = useState(null); // first trending
  const [trailers, setTrailers] = useState([]); // items with trailerKey (for trailer strip)

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from AniList
        const [aniTrending, aniTop, aniUpcoming] = await Promise.all([
          // trending/currently popular
          fetchAniList({ sort: "TRENDING_DESC", perPage: 24 }),
          // top rated overall
          fetchAniList({ sort: "SCORE_DESC", perPage: 24 }),
          // not yet released (for upcoming)
          fetchAniList({
            sort: "POPULARITY_DESC",
            status: "NOT_YET_RELEASED",
            perPage: 24,
          }),
        ]);

        // Fetch from Jikan as well to enrich upcoming and top
        const [jkUpcoming, jkTop] = await Promise.all([
          fetchJikanUpcoming({ limit: 24 }).catch(() => []),
          fetchJikanTop({ limit: 24 }).catch(() => []),
        ]);

        // Build sections — merge & de-duplicate by title or id
        const deDup = (arr) => {
          const seen = new Set();
          const out = [];
          for (const x of arr) {
            const key = `${x.source}:${x.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push(x);
            }
          }
          return out;
        };

        const TRENDING = deDup([...aniTrending]);
        const TOP = deDup([...aniTop, ...jkTop]).sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        );
        const UPCOMING = deDup([...aniUpcoming, ...jkUpcoming]).sort(
          (a, b) =>
            new Date(a.releaseDate || "9999-01-01") -
            new Date(b.releaseDate || "9999-01-01")
        );

        const RECO = deDup(
          [...TRENDING.slice(0, 10), ...TOP.slice(0, 10), ...UPCOMING.slice(0, 10)]
            .filter(Boolean)
            .sort(() => Math.random() - 0.5)
        ).slice(0, 18);

        const SPOT = TRENDING[0] || TOP[0] || UPCOMING[0] || null;

        // Trailer strip: prioritize items with trailerKey (AniList/Jikan often have)
        const TRAILERS = deDup(
          [...TRENDING, ...UPCOMING, ...TOP].filter((x) => x.trailerKey)
        ).slice(0, 14);

        if (!alive) return;

        setTrending(TRENDING);
        setTopRated(TOP);
        setNewReleases(UPCOMING);
        setRecommended(RECO);
        setSpotlight(SPOT);
        setTrailers(TRAILERS);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load anime hub");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return {
    loading,
    error,
    trending,
    newReleases,
    topRated,
    recommended,
    spotlight,
    trailers,
  };
}

function useWestHubData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trending, setTrending] = useState([]); // tmdb trending + trakt
  const [newReleases, setNewReleases] = useState([]); // tmdb upcoming + on the air
  const [topRated, setTopRated] = useState([]); // tmdb top_rated
  const [recommended, setRecommended] = useState([]); // curated/random
  const [spotlight, setSpotlight] = useState(null); // first trending/upcoming
  const [trailers, setTrailers] = useState([]); // with trailers

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // TMDB: trending movies + tv
        const [tmdbTrendMovies, tmdbTrendTV] = await Promise.all([
          fetchTMDB({ path: "trending/movie/week" }),
          fetchTMDB({ path: "trending/tv/week" }),
        ]);

        const trendMovies = (tmdbTrendMovies?.results || []).map(normalizeTMDBMovie);
        const trendTV = (tmdbTrendTV?.results || []).map(normalizeTMDBTV);

        // TMDB: upcoming movies + on the air tv
        const [tmdbUpcoming, tmdbOnAir] = await Promise.all([
          fetchTMDB({ path: "movie/upcoming", params: { page: 1 } }),
          fetchTMDB({ path: "tv/on_the_air", params: { page: 1 } }),
        ]);

        const upcomingMovies = (tmdbUpcoming?.results || []).map(normalizeTMDBMovie);
        const onAirTV = (tmdbOnAir?.results || []).map(normalizeTMDBTV);

        // TMDB: top rated
        const [tmdbTopMovies, tmdbTopTV] = await Promise.all([
          fetchTMDB({ path: "movie/top_rated", params: { page: 1 } }),
          fetchTMDB({ path: "tv/top_rated", params: { page: 1 } }),
        ]);
        const topMovies = (tmdbTopMovies?.results || []).map(normalizeTMDBMovie);
        const topTV = (tmdbTopTV?.results || []).map(normalizeTMDBTV);

        // Optional: Trakt trending to enrich variety (no posters, but can mix)
        const [traktMovies, traktShows] = await Promise.all([
          fetchTraktTrending({ type: "movies", limit: 18 }).catch(() => []),
          fetchTraktTrending({ type: "shows", limit: 18 }).catch(() => []),
        ]);

        // Compose sections
        const deDup = (arr) => {
          const seen = new Set();
          const out = [];
          for (const x of arr) {
            const key = `${x.source}:${x.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push(x);
            }
          }
          return out;
        };

        let TRENDING = deDup([...trendMovies.slice(0, 12), ...trendTV.slice(0, 12)]);
        // add trakt (they may lack posters, but still clickable)
        if (traktMovies.length || traktShows.length) {
          TRENDING = deDup([...TRENDING, ...traktMovies.slice(0, 8), ...traktShows.slice(0, 8)]);
        }

        let UPCOMING = deDup([...upcomingMovies.slice(0, 18), ...onAirTV.slice(0, 18)]).sort(
          (a, b) =>
            new Date(a.releaseDate || "9999-01-01") -
            new Date(b.releaseDate || "9999-01-01")
        );

        let TOP = deDup([...topMovies.slice(0, 12), ...topTV.slice(0, 12)]).sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        );

        let RECO = deDup(
          [...TRENDING.slice(0, 8), ...TOP.slice(0, 8), ...UPCOMING.slice(0, 8)]
            .filter(Boolean)
            .sort(() => Math.random() - 0.5)
        ).slice(0, 18);

        // Enrich with trailers from TMDB (for first batch)
        TRENDING = await enrichTMDBTrailers(TRENDING);
        TOP = await enrichTMDBTrailers(TOP);
        UPCOMING = await enrichTMDBTrailers(UPCOMING);

        const SPOT = TRENDING[0] || UPCOMING[0] || TOP[0] || null;

        const TRAILERS = deDup(
          [...TRENDING, ...UPCOMING, ...TOP].filter((x) => x.trailerKey)
        ).slice(0, 16);

        if (!alive) return;
        setTrending(TRENDING);
        setNewReleases(UPCOMING);
        setTopRated(TOP);
        setRecommended(RECO);
        setSpotlight(SPOT);
        setTrailers(TRAILERS);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load movies/shows hub");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return {
    loading,
    error,
    trending,
    newReleases,
    topRated,
    recommended,
    spotlight,
    trailers,
  };
}

// ========================= Cards =========================

function PosterCard({ item, onClick }) {
  const { title, poster, score, releaseDate } = item;
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      className="w-[160px] sm:w-[180px] md:w-[200px] rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      onClick={() => onClick?.(item)}
      title={`${title} • ${releaseDate ? prettyDate(releaseDate) : "TBA"}`}
    >
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="w-full h-[220px] sm:h-[250px] object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-[220px] sm:h-[250px] bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50 flex items-center justify-center text-purple-300">
          No Poster
        </div>
      )}
      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2 min-h-[2.5rem]">{title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-zinc-400">{prettyDate(releaseDate)}</span>
          {typeof score === "number" && (
            <span className="text-xs font-mono text-yellow-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {score}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CalendarCard({ item, onClick }) {
  const { title, releaseDate, poster } = item;
  const d = releaseDate ? new Date(releaseDate) : null;
  const day = d ? d.toLocaleString("en-US", { day: "numeric" }) : "--";
  const month = d ? d.toLocaleString("en-US", { month: "short" }) : "---";
  const year = d ? d.getFullYear() : "----";

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="flex-shrink-0 w-36 rounded-xl p-3 bg-white/5 border border-white/10 hover:border-purple-400/40 transition cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-center text-white font-mono font-bold text-lg">
          {day}
        </div>
        <div className="text-center text-purple-300 font-semibold text-sm uppercase tracking-wide">
          {month}
        </div>
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-24 object-cover rounded-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-24 bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-400 select-none text-xs p-2 text-center">
            No Image
          </div>
        )}
        <div className="text-center text-xs mt-1 font-medium line-clamp-2">
          {title}
        </div>
      </div>
    </motion.div>
  );
}

// ========================= Toggle =========================

function EastWestToggle({ isEast, setIsEast }) {
  return (
    <div className="fixed top-6 right-6 z-[60]">
      <div className="p-1 rounded-2xl backdrop-blur bg-black/40 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!isEast}
            onChange={() => {
              setIsEast((prev) => {
                const next = !prev;
                try {
                  localStorage.setItem("watchtower:isEast", JSON.stringify(next ? false : false)); 
                } catch {}
                return !prev;
              });
              try {
                localStorage.setItem("watchtower:isEast", JSON.stringify(!isEast ? true : false));
              } catch {}
            }}
          />

          {/* Track background */}
          <div
            className={[
              "w-[96px] h-12 rounded-full transition-colors duration-500 flex items-center justify-between px-3",
              isEast
                ? "bg-gradient-to-r from-purple-600/80 to-pink-500/80"
                : "bg-gradient-to-r from-blue-600/80 to-cyan-500/80",
              "border border-white/20 shadow-[0_0_25px_rgba(255,255,255,0.2)]",
            ].join(" ")}
          >
            {/* East Icon */}
            <Sparkles
              className={`w-5 h-5 transition-colors ${
                isEast ? "text-white" : "text-white/40"
              }`}
            />
            {/* West Icon */}
            <Film
              className={`w-5 h-5 transition-colors ${
                !isEast ? "text-white" : "text-white/40"
              }`}
            />
          </div>

          {/* Knob */}
          <span
            className={[
              "absolute top-1 left-1 w-10 h-10 rounded-full shadow-xl transition-transform duration-500",
              "bg-white/90",
              isEast ? "translate-x-0" : "translate-x-[56px]",
            ].join(" ")}
          />
        </label>

        {/* Label */}
        <div className="flex justify-between mt-1 text-[11px] font-semibold tracking-wide">
          <span className={isEast ? "text-purple-300" : "text-gray-400"}>East</span>
          <span className={!isEast ? "text-cyan-300" : "text-gray-400"}>West</span>
        </div>
      </div>
    </div>
  );
}


// ========================= Skeletons =========================

function LineSkeleton({ w = "w-40" }) {
  return (
    <div className={`h-4 ${w} bg-white/10 rounded-full animate-pulse`} />
  );
}
function PosterSkeleton() {
  return (
    <div className="w-[160px] sm:w-[180px] md:w-[200px] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <div className="w-full h-[220px] sm:h-[250px] bg-white/10 animate-pulse" />
      <div className="p-3 space-y-2">
        <LineSkeleton w="w-32" />
        <LineSkeleton w="w-24" />
      </div>
    </div>
  );
}

// ========================= Page =========================

export default function WatchTowerPage() {
  // --- East/West toggle: persist in localStorage
  const [isEast, setIsEast] = useState(() => {
    try {
      const raw = localStorage.getItem("watchtower:isEast");
      if (raw === null) return true;
      // previous code used a weird write; ensure bool
      const parsed = JSON.parse(raw);
      // If a previous write mistakenly wrote "false" strings, handle gracefully
      if (typeof parsed === "boolean") return parsed;
      return true;
    } catch {
      return true;
    }
  });

  // --- Data hooks
  const EAST = useEastHubData();
  const WEST = useWestHubData();

  // Derived current hub
  const HUB = isEast ? EAST : WEST;

  // --- Modal (Trailer)
  const [modalItem, setModalItem] = useState(null);

  // --- Genre filtering across items (from trending + newReleases + topRated)
  const allGenres = useMemo(() => {
    const gset = new Set();
    const pools = [
      ...(HUB.trending || []),
      ...(HUB.newReleases || []),
      ...(HUB.topRated || []),
    ];
    pools.forEach((it) => {
      (it.genres || []).forEach((g) => g && gset.add(g));
    });
    return [...gset].sort();
  }, [HUB.trending, HUB.newReleases, HUB.topRated]);

  const [selectedGenre, setSelectedGenre] = useState(null);

  const matchesGenre = (item) => {
    if (!selectedGenre) return true;
    return (item.genres || []).includes(selectedGenre);
  };

  // --- Featured/Hero item
  const featuredItem = useMemo(() => {
    return HUB.spotlight || HUB.trending?.[0] || HUB.newReleases?.[0] || null;
  }, [HUB.spotlight, HUB.trending, HUB.newReleases]);

  // --- Recommended refresh
  const [reco, setReco] = useState([]);
  useEffect(() => {
    setReco(HUB.recommended || []);
  }, [HUB.recommended]);

  const reshuffleReco = () => {
    const arr = [...(HUB.recommended || [])].sort(
      () => Math.random() - 0.5
    );
    setReco(arr.slice(0, 18));
  };

  // --- Helpful neon panel class
  const neonPanel =
    "neon-glow border border-white/10 bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition relative overflow-visible";

  // --- Scroll Refs (for Trailer strip + Calendar) using shared carousel; not strictly needed
  const onPosterClick = (item) => {
    if (item.trailerKey) {
      setModalItem(item);
    }
  };

  // --- Trailer strip items (with optional genre filter)
  const trailerStrip = useMemo(() => {
    const arr = (HUB.trailers || []).filter(matchesGenre);
    return arr.slice(0, 18);
  }, [HUB.trailers, selectedGenre]);

  // --- Calendar list (merge newReleases + trending future items)
  const calendarList = useMemo(() => {
    const src = [
      ...(HUB.newReleases || []),
      ...(HUB.trending || []),
      ...(HUB.topRated || []),
    ];
    const filtered = src
      .filter((x) => x.releaseDate)
      .filter(matchesGenre)
      .sort(
        (a, b) =>
          new Date(a.releaseDate || "9999-01-01") -
          new Date(b.releaseDate || "9999-01-01")
      );
    // de-duplicate by source:id
    const seen = new Set();
    const out = [];
    for (const it of filtered) {
      const k = `${it.source}:${it.id}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(it);
      }
    }
    return out.slice(0, 32);
  }, [HUB.newReleases, HUB.trending, HUB.topRated, selectedGenre]);

  // --- Error/Loading banners
  const Banner = ({ icon: Icon, text, tone = "info" }) => {
    const tones = {
      info: "from-purple-700/30 to-fuchsia-700/20 text-purple-200",
      warn: "from-yellow-700/20 to-amber-700/10 text-yellow-200",
      error: "from-rose-800/30 to-red-800/20 text-rose-200",
    };
    return (
      <div
        className={[
          "rounded-xl p-4 border border-white/10 bg-gradient-to-r",
          tones[tone] || tones.info,
          "flex items-center gap-2",
        ].join(" ")}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm">{text}</span>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-black text-white px-4 md:px-6 py-8 font-sans max-w-7xl mx-auto relative"
      style={{ fontFamily: "'Azonix', sans-serif" }}
    >
      {/* Background Glow / Grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 400px at 20% 10%, rgba(180,100,255,0.12), transparent 60%), radial-gradient(600px 300px at 80% 0%, rgba(255,80,200,0.10), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* East/West Toggle */}
      <EastWestToggle
        isEast={isEast}
        setIsEast={(val) => {
          setIsEast(val);
          try {
            localStorage.setItem("watchtower:isEast", JSON.stringify(val));
          } catch {}
        }}
      />

      {/* Header / Logo & Tagline */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-10 bg-gradient-to-br from-[#0B0B0C] via-[#0D0B12] to-[#0B0B0C]">
        <div
          className="absolute inset-0 min-h-[240px] bg-fixed bg-center opacity-10"
          style={{
            backgroundImage: "url('/assets/watchtower-bg-dreamworks.jpg')",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.img
              src="/assets/animac_logo_transparent-removebg-preview.png"
              alt="Watchtower logo"
              className="mx-auto h-24 w-auto mb-6 md:mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <p className="text-xl md:text-2xl font-medium text-gray-300 mb-3">
              Where Culture Meets Commentary
            </p>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Switch between{" "}
              <span className="text-purple-300 font-semibold">East</span> (Anime
              & Asian Media) and{" "}
              <span className="text-pink-300 font-semibold">West</span> (Movies
              & Series). A cyber-sleek hub with trailers, calendars, and
              countdowns.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Hero Featured */}
      <div className="mb-12">
        {HUB.loading && !featuredItem && (
          <div className="h-[60vh] md:h-[72vh] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
        )}
        {!HUB.loading && featuredItem && (
          <HeroFeatured
            item={featuredItem}
            onPlay={(it) => setModalItem(it)}
          />
        )}
      </div>

      {/* Quick Divider Glow */}
      <div className="relative mx-1 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full mb-10" />

      {/* Genre Filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedGenre(null)}
          className={[
            "px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition border border-white/10",
            selectedGenre === null
              ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
              : "bg-zinc-900 text-zinc-200 hover:bg-purple-800/50 hover:text-white",
          ].join(" ")}
        >
          All Genres
        </button>
        {allGenres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={[
              "px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition border border-white/10",
              selectedGenre === g
                ? "bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg"
                : "bg-zinc-900 text-zinc-200 hover:bg-purple-800/50 hover:text-white",
            ].join(" ")}
          >
            <Tag className="inline w-4 h-4 mr-1 -mt-0.5" />
            {g}
          </button>
        ))}
      </div>

      {/* Trailer Strip */}
      <section className="mb-14">
        <SectionHeader
          icon={Clapperboard}
          title="Trailers"
          subtitle={
            isEast
              ? "Top airing & upcoming anime trailers"
              : "Trending movie & series trailers"
          }
          right={
            <NeonPill active className="hidden md:inline">
              Autoplay Preview
            </NeonPill>
          }
        />
        <div className={neonPanel + " mt-6"}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={`tskel-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && trailerStrip.length === 0 && (
            <Banner
              icon={Sparkles}
              text="No trailers found right now. Try switching side or clearing your genre filter."
              tone="warn"
            />
          )}
          {!HUB.loading && trailerStrip.length > 0 && (
            <HorizontalCarousel
              items={trailerStrip}
              ariaPrefix="trailers"
              renderItem={(it) => (
                <TrailerCard item={it} onClick={(x) => setModalItem(x)} />
              )}
            />
          )}
        </div>
      </section>

      {/* Spotlight */}
      <section className="mb-16">
        <SectionHeader
          icon={Flame}
          title={`Spotlight Upcoming ${isEast ? "Anime" : "Titles"}`}
          subtitle="Hand-picked highlights arriving soon"
          right={<NeonPill>Curated</NeonPill>}
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <PosterSkeleton key={`sp-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
              {(HUB.newReleases || [])
                .filter(matchesGenre)
                .slice(0, 9)
                .map((it) => (
                  <PosterCard key={`${it.source}:${it.id}`} item={it} onClick={onPosterClick} />
                ))}
            </div>
          )}
          {!HUB.loading && (HUB.newReleases || []).filter(matchesGenre).length === 0 && (
            <Banner icon={Rocket} text="No upcoming titles match this genre." tone="warn" />
          )}
        </div>
      </section>

      {/* Release Calendar */}
      <section className="mb-16">
        <SectionHeader
          icon={Calendar}
          title="Release Calendar"
          subtitle="Mark the dates — countdowns tick in real-time"
          right={null}
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`calskel-${i}`} className="w-36">
                  <div className="h-6 bg-white/10 rounded mb-2 animate-pulse" />
                  <div className="h-24 bg-white/10 rounded mb-2 animate-pulse" />
                  <div className="h-10 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
          {!HUB.loading && calendarList.length > 0 && (
            <HorizontalCarousel
              items={calendarList}
              ariaPrefix="calendar"
              renderItem={(it) => (
                <CalendarCard item={it} onClick={(x) => onPosterClick(x)} />
              )}
            />
          )}
          {!HUB.loading && calendarList.length === 0 && (
            <Banner icon={Calendar} text="No dated items found." tone="warn" />
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="mb-16">
        <SectionHeader
          icon={TrendingIcon}
          title="Trending"
          subtitle={
            isEast
              ? "Top airing and most discussed anime"
              : "Hot right now across movies and TV"
          }
          right={<NeonPill>Live Buzz</NeonPill>}
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={`t-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && (HUB.trending || []).filter(matchesGenre).length === 0 && (
            <Banner icon={Flame} text="Nothing trending for this genre." tone="warn" />
          )}
          {!HUB.loading && (HUB.trending || []).filter(matchesGenre).length > 0 && (
            <HorizontalCarousel
              items={(HUB.trending || []).filter(matchesGenre)}
              ariaPrefix="trending"
              renderItem={(it) => (
                <PosterCard item={it} onClick={(x) => onPosterClick(x)} />
              )}
            />
          )}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-16">
        <SectionHeader
          icon={Tv}
          title="New Releases"
          subtitle={
            isEast
              ? "Fresh simulcasts and latest anime drops"
              : "This week’s new movies and episodes"
          }
          right={<NeonPill>Fresh</NeonPill>}
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={`n-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && (HUB.newReleases || []).filter(matchesGenre).length === 0 && (
            <Banner icon={Tv} text="No new releases match this genre yet." tone="warn" />
          )}
          {!HUB.loading && (HUB.newReleases || []).filter(matchesGenre).length > 0 && (
            <HorizontalCarousel
              items={(HUB.newReleases || []).filter(matchesGenre)}
              ariaPrefix="new"
              renderItem={(it) => (
                <PosterCard item={it} onClick={(x) => onPosterClick(x)} />
              )}
            />
          )}
        </div>
      </section>

      {/* Top Rated */}
      <section className="mb-16">
        <SectionHeader
          icon={Medal}
          title={`Top Rated ${isEast ? "Anime" : "Titles"}`}
          subtitle="Critically acclaimed and fan favorites"
          right={<NeonPill>Elite</NeonPill>}
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={`top-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && (HUB.topRated || []).filter(matchesGenre).length === 0 && (
            <Banner icon={Medal} text="No top rated items match this genre." tone="warn" />
          )}
          {!HUB.loading && (HUB.topRated || []).filter(matchesGenre).length > 0 && (
            <HorizontalCarousel
              items={(HUB.topRated || []).filter(matchesGenre)}
              ariaPrefix="top"
              renderItem={(it) => (
                <PosterCard item={it} onClick={(x) => onPosterClick(x)} />
              )}
            />
          )}
        </div>
      </section>

      {/* Recommended */}
      <section className="mb-20">
        <SectionHeader
          icon={Compass}
          title="Recommended For You"
          subtitle="Smart shuffle based on what’s buzzing"
          right={
            <button
              onClick={reshuffleReco}
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 transition flex items-center gap-2 text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Shuffle
            </button>
          }
        />
        <div className={neonPanel}>
          {HUB.loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={`r-${i}`} />
              ))}
            </div>
          )}
          {!HUB.loading && (reco || []).filter(matchesGenre).length === 0 && (
            <Banner icon={ThumbsUp} text="No recommendations right now." tone="warn" />
          )}
          {!HUB.loading && (reco || []).filter(matchesGenre).length > 0 && (
            <HorizontalCarousel
              items={(reco || []).filter(matchesGenre)}
              ariaPrefix="reco"
              renderItem={(it) => (
                <PosterCard item={it} onClick={(x) => onPosterClick(x)} />
              )}
            />
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        youtubeKey={modalItem?.trailerKey}
        title={modalItem?.title}
        onClose={() => setModalItem(null)}
      />

      {/* Footnote: API Sources */}
      <footer className="mt-8 mb-4 text-center text-[11px] text-zinc-500">
        Data sources: {isEast ? "AniList, Jikan (MAL)" : "TMDB"}
        {isEast
          ? ". For streaming availability, consider JustWatch API in future."
          : TRAKT_API_KEY && TRAKT_API_KEY !== "<OPTIONAL_TRAKT_CLIENT_ID>"
          ? ", Trakt."
          : ". (Trakt optional)."}
      </footer>
    </div>
  );
}

// ========================= Icons =========================
function TrendingIcon(props) {
  return <Flame {...props} />;
}

/* =========================
   Notes & Implementation Details
   =========================
- East (Anime) uses AniList GraphQL (trending/top/upcoming) and Jikan REST
  (upcoming + top) to enrich. Trailers are taken from AniList/Jikan when present.
- West (Movies/Series) uses TMDB trending (movies+tv), upcoming (movies) and
  on_the_air (tv), plus top_rated (movies+tv). Trailers are enriched via TMDB videos.
- Trakt trending is optional (requires REACT_APP_TRAKT_API_KEY). If present, its
  items are merged into Trending (they may have no images/trailers).
- Toggle persists with localStorage key "watchtower:isEast".
- All sections are horizontal carousels with scroll arrows; mobile uses swipe/drag.
- Trailer modal embeds YouTube by trailerKey. If an item has no trailerKey, clicking poster
  simply opens nothing (or can be extended).
- Styling: glassmorphism + neon gradients. Tailwind utility classes.
- Keep Azonix font for headings. The rest can use system fonts.
- This file is self-contained; only expects env keys for TMDB (required) and optional Trakt.
- If TMDB key is missing, West side shows an error banner (via hook error state).
*/
