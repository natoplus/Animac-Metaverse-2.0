const { createProxyMiddleware } = require("http-proxy-middleware");

// Simple delay helper
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = function (app) {
  const commonOptions = {
    changeOrigin: true,
    logLevel: "warn", // cleaner logs
    onProxyReq: async (proxyReq, req, res) => {
      // Add optional delay to avoid 429 rate-limits
      await wait(100); // 100ms delay between requests
    },
    onError(err, req, res) {
      console.error("[Proxy Error]", err.message);
      res.status(500).json({ error: "Proxy request failed" });
    },
  };

  app.use(
    "/api/anilist",
    createProxyMiddleware({
      ...commonOptions,
      target: "https://graphql.anilist.co",
      pathRewrite: { "^/api/anilist": "" },
    })
  );

  app.use(
    "/api/jikan",
    createProxyMiddleware({
      ...commonOptions,
      target: "https://api.jikan.moe/v4",
      pathRewrite: { "^/api/jikan": "" },
    })
  );

  app.use(
    "/api/tmdb",
    createProxyMiddleware({
      ...commonOptions,
      target: "https://api.themoviedb.org/3",
      pathRewrite: { "^/api/tmdb": "" },
    })
  );

  app.use(
    "/api/trakt",
    createProxyMiddleware({
      ...commonOptions,
      target: "https://api.trakt.tv",
      pathRewrite: { "^/api/trakt": "" },
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
      },
    })
  );
};
