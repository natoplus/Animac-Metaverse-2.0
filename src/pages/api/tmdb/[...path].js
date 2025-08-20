// /api/tmdb/*
const TMDB_BASE = "https://api.themoviedb.org/3";

export default async function handler(req, res) {
  const { path = [] } = req.query;
  const endpoint = path.join("/");
  const url = `${TMDB_BASE}/${endpoint}?${new URLSearchParams(req.query).toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[API: TMDB] Error", err);
    res.status(500).json({ error: "TMDB proxy error" });
  }
}
