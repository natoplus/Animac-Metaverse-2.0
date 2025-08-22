// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://animac-metaverse.vercel.app' });

  // Add your static routes
  const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/buzzfeed-hub', changefreq: 'weekly', priority: 0.8 },
    { url: '/east-portal', changefreq: 'weekly', priority: 0.8 },
    { url: '/west-portal', changefreq: 'weekly', priority: 0.8 },
    { url: '/watchtower', changefreq: 'weekly', priority: 0.7 },
    { url: '/admin', changefreq: 'monthly', priority: 0.5 }
  ];

  pages.forEach(page => sitemap.write(page));
  sitemap.end();

  const data = await streamToPromise(sitemap);
  const writeStream = createWriteStream('./public/sitemap.xml');
  writeStream.write(data.toString());
  writeStream.end();
}

generateSitemap();
