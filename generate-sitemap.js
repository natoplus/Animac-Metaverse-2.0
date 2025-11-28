// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream, mkdirSync } = require('fs');
const { resolve, dirname } = require('path');
const axios = require('axios');

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://animac-metaverse.vercel.app' });

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.6 },
    { url: '/careers', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/press-kit', changefreq: 'monthly', priority: 0.5 },
    { url: '/login', changefreq: 'yearly', priority: 0.3 },
    { url: '/sitemap', changefreq: 'monthly', priority: 0.4 },
    { url: '/buzzfeed-hub', changefreq: 'weekly', priority: 0.8 },
    { url: '/east-portal', changefreq: 'weekly', priority: 0.8 },
    { url: '/west-portal', changefreq: 'weekly', priority: 0.8 },
    { url: '/watchtower', changefreq: 'weekly', priority: 0.7 },
    { url: '/admin', changefreq: 'monthly', priority: 0.5 }
  ];

  // Add static pages
  staticPages.forEach(page => sitemap.write(page));

  // Fetch dynamic articles
  try {
    console.log('🔍 Fetching articles for sitemap...');
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';
    const response = await axios.get(`${backendUrl}/api/articles`, {
      params: { is_published: true, limit: 1000 } // Fetch all published articles
    });

    const articles = response.data;
    console.log(`✅ Found ${articles.length} published articles for sitemap`);

    // Add article pages (only published articles)
    articles.filter(article => article.is_published === true).forEach(article => {
      sitemap.write({
        url: `/article/${article.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: article.updated_at || article.created_at
      });
    });
  } catch (error) {
    console.error('❌ Error fetching articles for sitemap:', error.message);
    // Continue with static pages only
  }

  sitemap.end();

  const data = await streamToPromise(sitemap);

  const path = resolve(__dirname, 'public', 'sitemap.xml');

  // ensure public/ exists
  mkdirSync(dirname(path), { recursive: true });

  const writeStream = createWriteStream(path);
  writeStream.write(data.toString());
  writeStream.end();

  console.log('✅ Sitemap generated successfully at', path);
}

generateSitemap().catch(console.error);
