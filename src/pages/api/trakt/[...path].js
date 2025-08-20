// /api/trakt/*
const TRAKT_BASE = "https://api.trakt.tv";

export default async function handler(req, res) {
  const { path = [] } = req.query;
  const endpoint = "/" + path.join("/");
  const url = `${TRAKT_BASE}${endpoint}?${new URLSearchParams(req.query).toString()}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "trakt-api-key": process.env.REACT_APP_TRAKT_KEY,
        "trakt-api-version": "2",
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[API: Trakt] Error", err);
    res.status(500).json({ error: "Trakt proxy error" });
  }
}
