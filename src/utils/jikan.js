// /pages/api/jikan.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint } = req.query; // e.g. "seasons/upcoming?limit=24"
    if (!endpoint) {
      return res.status(400).json({ error: "Missing endpoint" });
    }

    // Simple in-memory cache
    if (!global.jikanCache) {
      global.jikanCache = new Map();
    }

    const key = endpoint;
    const cached = global.jikanCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return res.status(200).json(cached.data);
    }

    // Forward request to Jikan
    const upstream = await fetch(`https://api.jikan.moe/v4/${endpoint}`);
    const data = await upstream.json();

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: "Jikan error", details: data });
    }

    // Cache for 5 minutes
    global.jikanCache.set(key, {
      data,
      expiry: Date.now() + 1000 * 60 * 5,
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error("Jikan proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
