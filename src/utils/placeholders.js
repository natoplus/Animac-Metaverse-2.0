// src/utils/placeholders.js

// Some fallback images (royalty-free placeholders or your own CDN paths)
export const PLACEHOLDER = {
  posters: [
    "https://via.placeholder.com/300x450?text=Poster",
    "https://via.placeholder.com/300x450?text=Movie",
    "https://via.placeholder.com/300x450?text=Anime",
  ],
  backdrops: [
    "https://via.placeholder.com/1280x720?text=Backdrop",
    "https://via.placeholder.com/1280x720?text=Scenery",
    "https://via.placeholder.com/1280x720?text=Background",
  ],
};

// Utility to grab a random sample
export function sample(arr = []) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
