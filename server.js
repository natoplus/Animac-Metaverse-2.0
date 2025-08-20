const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// -------- Serve React build --------
app.use(express.static(path.join(__dirname, "build")));

// -------- Proxy APIs --------

// TMDB (hide API key in backend)
app.use(
  "/api/tmdb",
  createProxyMiddleware({
    target: "https://api.themoviedb.org/3",
    changeOrigin: true,
    pathRewrite: { "^/api/tmdb": "" },
  })
);

// Trakt (hide API key in backend)
app.use(
  "/api/trakt",
  createProxyMiddleware({
    target: "https://api.trakt.tv",
    changeOrigin: true,
    pathRewrite: { "^/api/trakt": "" },
  })
);

// -------- React fallback (for client routing) --------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
