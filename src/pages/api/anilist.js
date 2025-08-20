// /pages/api/anilist.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const { query, variables } = req.body;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error("[AniList Proxy Error]", err);
    return res.status(500).json({ error: "AniList Proxy failed" });
  }
}
