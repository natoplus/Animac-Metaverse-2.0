const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// -------- Serve React build --------
app.use(express.static(path.join(__dirname, "build")));

// -------- Proxy APIs --------

// TMDB
app.use(
  "/api/tmdb",
  createProxyMiddleware({
    target: "https://api.themoviedb.org/3",
    changeOrigin: true,
    pathRewrite: { "^/api/tmdb": "" },
  })
);

// Trakt
app.use(
  "/api/trakt",
  createProxyMiddleware({
    target: "https://api.trakt.tv",
    changeOrigin: true,
    pathRewrite: { "^/api/trakt": "" },
  })
);

// Jikan
app.use(
  "/api/jikan",
  createProxyMiddleware({
    target: "https://api.jikan.moe/v4",
    changeOrigin: true,
    pathRewrite: { "^/api/jikan": "" },
  })
);

// AniList
app.use(
  "/api/anilist",
  createProxyMiddleware({
    target: "https://graphql.anilist.co",
    changeOrigin: true,
    pathRewrite: { "^/api/anilist": "" },
  })
);

// -------- React fallback (for client routing) --------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
