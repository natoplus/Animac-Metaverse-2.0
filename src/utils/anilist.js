// /pages/api/anilist.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, variables } = req.body;

    // simple in-memory cache (per server instance)
    const key = JSON.stringify({ query, variables });
    if (!global.anilistCache) {
      global.anilistCache = new Map();
    }

    const cached = global.anilistCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return res.status(200).json(cached.data);
    }

    // forward to AniList GraphQL
    const upstream = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await upstream.json();

    if (!upstream.ok || data.errors) {
      return res
        .status(upstream.status || 500)
        .json({ error: "AniList error", details: data.errors || null });
    }

    // cache result for 5 minutes
    global.anilistCache.set(key, {
      data,
      expiry: Date.now() + 1000 * 60 * 5,
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error("AniList proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
