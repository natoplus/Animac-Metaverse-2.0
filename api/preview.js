// Edge Function: Returns HTML with injected Open Graph/Twitter meta tags for crawlers
export const config = { runtime: 'edge' };

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://animac-metaverse.vercel.app';
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

function absoluteUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${SITE_ORIGIN}${url}`;
}

function htmlWithMeta({ title, description, image, url, type = 'website', author }) {
  const absUrl = absoluteUrl(url);
  const absImg = absoluteUrl(image);
  const meta = `
    <title>${title || 'Animac Metaverse'}</title>
    <meta name="description" content="${description || ''}" />
    <link rel="canonical" href="${absUrl}" />

    <meta property="og:title" content="${title || 'Animac Metaverse'}" />
    <meta property="og:description" content="${description || ''}" />
    <meta property="og:image" content="${absImg}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${absUrl}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="Animac Metaverse" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title || 'Animac Metaverse'}" />
    <meta name="twitter:description" content="${description || ''}" />
    <meta name="twitter:image" content="${absImg}" />
    ${author ? `<meta property="article:author" content="${author}" />` : ''}
  `;

  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${meta}
  </head>
  <body>
    <noscript>Open Graph preview for ${title || 'Animac Metaverse'}</noscript>
    <script>
      // Client-side redirect to SPA route
      location.replace(${JSON.stringify(absUrl)});
    </script>
  </body>
  </html>`;
}

async function fetchArticleMeta(slug) {
  const res = await fetch(`${API_URL}/api/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Failed to fetch article');
  const a = await res.json();
  return {
    title: a.title || 'Article • Animac Metaverse',
    description: a.excerpt || 'Read this amazing article on Animac Metaverse.',
    image: a.featured_image || '/assets/buzzfeed-purple.jpg',
    url: `/article/${a.slug || slug}`,
    type: 'article',
    author: a.author,
  };
}

function pagePreset(pathname) {
  switch (pathname) {
    case '/':
      return {
        title: 'ANIMAC METAVERSE - Your Mainstream for Anime & Western Entertainment',
        description: 'Dive into curated anime and western entertainment culture on Animac Metaverse.',
        image: '/assets/animac-preview-logo.svg',
        url: '/',
        type: 'website',
      };
    case '/buzzfeed':
      return {
        title: 'Animac Metaverse - Buzzfeed Hub',
        description: 'Explore the latest in anime and western entertainment culture on Animac Metaverse.',
        image: '/assets/buzzfeed-redblue.jpg',
        url: '/buzzfeed',
        type: 'website',
      };
    case '/buzzfeed/east':
      return {
        title: 'East Portal • Anime Culture Chronicles',
        description: 'Deep dives, reviews and culture from the anime world.',
        image: '/assets/buzzfeed-east.jpg',
        url: '/buzzfeed/east',
        type: 'website',
      };
    case '/buzzfeed/west':
      return {
        title: 'West Portal • Movies & Cartoons Chronicles',
        description: 'Hollywood blockbusters, indie animation and western classics.',
        image: '/assets/buzzfeed-west.jpg',
        url: '/buzzfeed/west',
        type: 'website',
      };
    case '/watch-tower':
      return {
        title: 'Watch Tower - Discover Trending Anime & Movies',
        description: 'Trending anime, upcoming releases, and top-rated movies & TV shows.',
        image: '/assets/watch-tower-preview.jpg',
        url: '/watch-tower',
        type: 'website',
      };
  }
  return null;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pathname = searchParams.get('path') || '/';

    // Article path detection
    const articleMatch = pathname.match(/^\/article\/(.+)$/);
    let meta;
    if (articleMatch) {
      const slug = articleMatch[1];
      meta = await fetchArticleMeta(slug);
    } else {
      meta = pagePreset(pathname) || { title: 'Animac Metaverse', url: pathname };
    }

    const html = htmlWithMeta(meta);
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200,
    });
  } catch (e) {
    return new Response('<!doctype html><html><head><title>Animac Metaverse</title></head><body>Preview unavailable</body></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200,
    });
  }
}


