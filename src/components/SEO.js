import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = "website",
  siteName = "Animac Metaverse",
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  // Ensure we have absolute URLs for images
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://animac-metaverse.vercel.app${url}`;
  };

  const absoluteImage = getAbsoluteUrl(image);
  const absoluteUrl = url ? (url.startsWith('http') ? url : `https://animac-metaverse.vercel.app${url}`) : '';

  return (
    <Helmet>
      {/* Standard Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author || "Animac Metaverse"} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={absoluteUrl} />

      {/* Open Graph / Universal Social Media */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific meta tags */}
      {type === "article" && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@animacmetaverse" />
      <meta name="twitter:creator" content="@animacmetaverse" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* WhatsApp */}
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:secure_url" content={absoluteImage} />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="animac-metaverse" />
      
      {/* Discord */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Telegram */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Reddit */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Slack */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Microsoft Teams */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Apple Messages */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Instagram (for stories and posts) */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* TikTok (for link previews) */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Snapchat */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* YouTube (for community posts) */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Twitch */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Mastodon */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Bluesky */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Threads (Meta) */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Additional Universal Meta Tags */}
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Schema.org structured data for better search engine understanding */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebPage",
          "headline": title,
          "description": description,
          "image": absoluteImage,
          "url": absoluteUrl,
          "author": type === "article" && author ? {
            "@type": "Person",
            "name": author
          } : undefined,
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": "https://animac-metaverse.vercel.app/assets/animac-preview-logo.svg"
            }
          },
          "datePublished": type === "article" && publishedTime ? publishedTime : undefined,
          "dateModified": type === "article" && modifiedTime ? modifiedTime : undefined,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": absoluteUrl
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
