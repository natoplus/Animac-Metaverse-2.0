export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const { query, variables } = req.body;

    // Forward to backend proxy
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';
    const params = new URLSearchParams({
      query: query,
      variables: JSON.stringify(variables || {})
    });

    const response = await fetch(`${backendUrl}/api/proxy/anilist?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("[AniList Proxy Error]", err);
    return res.status(500).json({ error: "AniList Proxy failed" });
  }
}
