// pages/Home.jsx
import React, { useEffect, useState } from "react";
import { fetchArticles, fetchFeaturedContent } from "../utils/api";

const Home = () => {
  const [eastArticles, setEastArticles] = useState([]);
  const [westArticles, setWestArticles] = useState([]);
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    fetchFeaturedContent().then((data) => {
      setHeroContent(data.hero);
      setEastArticles(data.recent_content.east || []);
      setWestArticles(data.recent_content.west || []);
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">🎥 ANIMAC: Streaming Culture</h1>

      {heroContent && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">🌟 Featured Articles</h2>
          <div>
            <h3 className="font-medium">East: {heroContent.east?.title}</h3>
            <h3 className="font-medium">West: {heroContent.west?.title}</h3>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-2">🔥 Recent East</h2>
        <ul className="list-disc ml-6 mb-4">
          {eastArticles.map((a) => (
            <li key={a.id}>{a.title}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">🎬 Recent West</h2>
        <ul className="list-disc ml-6">
          {westArticles.map((a) => (
            <li key={a.id}>{a.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
