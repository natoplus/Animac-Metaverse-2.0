// /api/jikan/*
const JIKAN_BASE = "https://api.jikan.moe/v4";

export default async function handler(req, res) {
  const { path = [] } = req.query;
  const endpoint = "/" + path.join("/");
  const url = `${JIKAN_BASE}${endpoint}?${new URLSearchParams(req.query).toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[API: Jikan] Error", err);
    res.status(500).json({ error: "Jikan proxy error" });
  }
}
