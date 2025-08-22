// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const { resolve } = require('path');

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://animac-metaverse.vercel.app' });

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
  const path = resolve(__dirname, 'public', 'sitemap.xml');
  const writeStream = createWriteStream(path);
  writeStream.write(data.toString());
  writeStream.end();
}

generateSitemap();
