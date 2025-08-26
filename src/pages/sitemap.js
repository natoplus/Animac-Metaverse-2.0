// SitemapPage.js
import React from "react";

export default function SitemapPage() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Sitemap</h1>
      <ul className="mt-4 space-y-2">
        <li><a href="/">Home</a></li>
        <li><a href="/buzzfeed-hub">Buzzfeed Hub</a></li>
        <li><a href="/east-portal">East Portal</a></li>
        <li><a href="/west-portal">West Portal</a></li>
        <li><a href="/watchtower">Watchtower</a></li>
      </ul>
      <p className="mt-6 opacity-70">
        Search engines can also use the full XML sitemap at{" "}
        <a href="/sitemap.xml" className="underline">
          /sitemap.xml
        </a>
      </p>
    </div>
  );
}
