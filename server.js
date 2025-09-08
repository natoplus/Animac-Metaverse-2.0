const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 5000;
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://animac-metaverse.vercel.app";
const API_URL = process.env.REACT_APP_BACKEND_URL || "https://animac-metaverse.onrender.com";

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

// -------- Helper: inject meta tags into index.html --------
function loadIndexHtml() {
  const indexPath = path.join(__dirname, "build", "index.html");
  return fs.readFileSync(indexPath, "utf8");
}

function buildMetaTags({
  title,
  description,
  image,
  url,
  type = "website",
  siteName = "Animac Metaverse",
  author,
}) {
  const absUrl = url?.startsWith("http") ? url : `${SITE_ORIGIN}${url || ""}`;
  const absImg = image?.startsWith("http") ? image : (image ? `${SITE_ORIGIN}${image}` : "");
  return `
    <title>${title || siteName}</title>
    <meta name="description" content="${description || ""}" />
    <link rel="canonical" href="${absUrl}" />

    <meta property="og:title" content="${title || siteName}" />
    <meta property="og:description" content="${description || ""}" />
    <meta property="og:image" content="${absImg}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${absUrl}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${siteName}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title || siteName}" />
    <meta name="twitter:description" content="${description || ""}" />
    <meta name="twitter:image" content="${absImg}" />
    ${author ? `<meta property="article:author" content="${author}" />` : ""}
  `;
}

function injectIntoHead(html, metaTags) {
  // Insert as early as possible inside <head>
  return html.replace(/<head>/i, `<head>\n${metaTags}`);
}

async function serveWithMeta(req, res, meta) {
  try {
    const html = loadIndexHtml();
    const tags = buildMetaTags(meta);
    const out = injectIntoHead(html, tags);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(out);
  } catch (e) {
    // Fallback to default SPA if anything goes wrong
    res.sendFile(path.join(__dirname, "build", "index.html"));
  }
}

// -------- SSR meta for key routes (for crawlers and rich previews) --------
app.get("/", async (req, res) => {
  return serveWithMeta(req, res, {
    title: "ANIMAC METAVERSE - Your Mainstream for Anime & Western Entertainment",
    description: "Dive into curated anime and western entertainment culture on Animac Metaverse.",
    image: "/assets/animac-preview-logo.svg",
    url: "/",
    type: "website",
  });
});

app.get(["/buzzfeed", "/buzzfeed/east", "/buzzfeed/west", "/watch-tower"], async (req, res) => {
  const map = {
    "/buzzfeed": {
      title: "Animac Metaverse - Buzzfeed Hub",
      description: "Explore the latest in anime and western entertainment culture on Animac Metaverse.",
      image: "/assets/buzzfeed-redblue.jpg",
      url: "/buzzfeed",
    },
    "/buzzfeed/east": {
      title: "East Portal • Anime Culture Chronicles",
      description: "Deep dives, reviews and culture from the anime world.",
      image: "/assets/buzzfeed-east.jpg",
      url: "/buzzfeed/east",
    },
    "/buzzfeed/west": {
      title: "West Portal • Movies & Cartoons Chronicles",
      description: "Hollywood blockbusters, indie animation and western classics.",
      image: "/assets/buzzfeed-west.jpg",
      url: "/buzzfeed/west",
    },
    "/watch-tower": {
      title: "Watch Tower - Discover Trending Anime & Movies",
      description: "Trending anime, upcoming releases, and top-rated movies & TV shows.",
      image: "/assets/watch-tower-preview.jpg",
      url: "/watch-tower",
    },
  };
  return serveWithMeta(req, res, map[req.path] || { title: "Animac Metaverse", url: req.path });
});

app.get("/article/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const api = `${API_URL}/api/articles/${encodeURIComponent(slug)}`;
    const r = await fetch(api);
    if (!r.ok) throw new Error(`Article fetch failed ${r.status}`);
    const article = await r.json();
    return serveWithMeta(req, res, {
      title: article.title || "Article • Animac Metaverse",
      description: article.excerpt || "Read this amazing article on Animac Metaverse.",
      image: article.featured_image || "/assets/buzzfeed-purple.jpg",
      url: `/article/${slug}`,
      type: "article",
      author: article.author,
    });
  } catch (e) {
    // fallback to default SPA rendering
    return res.sendFile(path.join(__dirname, "build", "index.html"));
  }
});

// -------- React fallback (for client routing) --------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
