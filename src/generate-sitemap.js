// generate-sitemap.js
import { writeFileSync, createWriteStream } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

const BASE_URL = "https://animac-metaverse.vercel.app/";  
const API_URL = "https://animac-metaverse.onrender.com/api/articles";

// Fetch article slugs + lastmod
async function fetchArticles() {
  try {
    const res = await fetch(API_URL);
    const articles = await res.json();

    return articles.map((a) => ({
      url: `/articles/${a.slug}`,
      lastmod: a.updated_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error("❌ Failed to fetch articles:", err);
    return [];
  }
}

async function generateSitemaps() {
  // ---- Static Pages Sitemap ----
  const staticRoutes = [
    { url: "/", changefreq: "weekly", priority: 1.0 },                  // Home
    { url: "/buzzfeedhub", changefreq: "weekly", priority: 0.8 },       // BuzzfeedHub
    { url: "/eastportal", changefreq: "weekly", priority: 0.9 },        // EastPortal
    { url: "/westportal", changefreq: "weekly", priority: 0.9 },        // WestPortal
    { url: "/articles", changefreq: "daily", priority: 0.9 },           // Articles index/list
    { url: "/watchtower", changefreq: "weekly", priority: 0.8 },        // WatchTowerPage
    { url: "/admindashboard", changefreq: "monthly", priority: 0.3 }    // AdminDashboard (low priority, but included)
  ];

  const staticStream = new SitemapStream({ hostname: BASE_URL });
  const staticWrite = createWriteStream("./public/sitemap-static.xml");
  staticStream.pipe(staticWrite);

  staticRoutes.forEach((route) => staticStream.write(route));
  staticStream.end();
  await streamToPromise(staticStream);
  console.log("✅ sitemap-static.xml generated");

  // ---- Articles Sitemap ----
  const articleRoutes = await fetchArticles();

  const articleStream = new SitemapStream({ hostname: BASE_URL });
  const articleWrite = createWriteStream("./public/sitemap-articles.xml");
  articleStream.pipe(articleWrite);

  articleRoutes.forEach((article) => {
    articleStream.write({
      url: article.url,
      lastmod: article.lastmod,
      changefreq: "weekly",
      priority: 0.9
    });
  });

  articleStream.end();
  await streamToPromise(articleStream);
  console.log("✅ sitemap-articles.xml generated with lastmod");

  // ---- Sitemap Index ----
  const indexXML = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>${BASE_URL}/sitemap-static.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
    <sitemap>
      <loc>${BASE_URL}/sitemap-articles.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  </sitemapindex>`;

  writeFileSync("./public/sitemap-index.xml", indexXML);
  console.log("✅ sitemap-index.xml generated");
}

generateSitemaps();
