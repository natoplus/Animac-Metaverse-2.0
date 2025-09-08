import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, Users, BookOpen, TrendingUp } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import clsx from 'clsx';

const PortraitSlideshow = () => {
  // Update these with your actual local images and captions
  const slides = [
    {
      src: '/assets/east-poster-animac-website.jpg',
      alt: 'Anime trends',
      caption: ' ',
      link: '/buzzfeed/east',
    },
    {
      src: '/assets/west-poster-animac-website.jpg',
      alt: 'Western blockbusters',
      caption: ' ',
      link: '/buzzfeed/west',
    },
    {
      src: '/assets/animac-neutral-poster.jpg',
      alt: 'Cartoon behind scenes',
      caption: ' ',
      link: '/buzzfeed/west',
    },
    // Add more slides if needed
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="mx-auto mb-10 w-[300px] h-[450px] rounded-xl overflow-hidden relative shadow-xl cursor-pointer">
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={current}
          href={slides[current].link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="block w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].src})` }}
          aria-label={slides[current].alt}
          title={slides[current].caption}
        >
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent p-4 text-white text-center font-semibold text-lg">
            {slides[current].caption}
          </div>
        </motion.a>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-7 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition ${idx === current ? 'bg-east-500' : 'bg-gray-600 hover:bg-gray-400'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const BuzzfeedHub = () => {
  const { articles: eastArticles } = useArticles('east');
  const { articles: westArticles } = useArticles('west');
  // BuzzfeedHub.js
  const pageTitle = "Buzzfeed Hub";
  const pageDescription = "Latest viral trends, news, and entertainment from Buzzfeed Hub.";
  const pageUrl = window.location.href;
  const previewImage = "https://animac-metaverse.vercel.app/assets/buzzfeed-redblue.jpg";



  const portalData = [
    {
      id: 'east',
      title: 'EAST',
      subtitle: 'Anime Culture',
      description:
        'Dive deep into the world of anime, manga, and Japanese pop culture. From seasonal breakdowns to studio spotlights.',
      color: 'east',
      gradient: 'from-east-600 via-east-700 to-east-800',
      borderColor: 'border-east-500/30',
      hoverGlow: 'hover-glow-east',
      textGlow: 'text-glow-east',
      path: '/buzzfeed/east',
      articles: eastArticles,
      stats: {
        articles: eastArticles?.length || 0,
        readers: '125K',
        trending: 'Attack on Titan Final Season',
      },
    },
    {
      id: 'west',
      title: 'WEST',
      subtitle: 'Movies & Cartoons',
      description:
        'Explore Hollywood blockbusters, indie animations, and western cartoon classics. Reviews, features, and deep dives.',
      color: 'west',
      gradient: 'from-west-600 via-west-700 to-west-800',
      borderColor: 'border-west-500/30',
      hoverGlow: 'hover-glow-west',
      textGlow: 'text-glow-west',
      path: '/buzzfeed/west',
      articles: westArticles,
      stats: {
        articles: westArticles?.length || 0,
        readers: '98K',
        trending: 'Spider-Verse Revolution',
      },
    },
  ];

  return (
    <>
      <SEO
        title={pageTitle || 'Animac Metaverse - Buzzfeed Hub'}
        description={pageDescription || 'Explore the latest in anime and western entertainment culture on Animac Metaverse.'}
        url={pageUrl || '/buzzfeed'}
        image={previewImage || '/assets/buzzfeed-redblue.jpg'}
        type="website"
      />


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-20"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-netflix-black via-netflix-dark to-netflix-black">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1720576127187-12d4b9045d93')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 container mx-auto px-4 py-20">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >


              <img
                src="/assets/buzzfeed-logo.svg"
                alt="Buzzfeed logo"
                className="mx-auto h-80 w-auto mb-2"
              />

              {/* Portrait slideshow inserted here */}
              <PortraitSlideshow />

              <p className="text-2xl md:text-3xl font-montserrat font-medium text-gray-300 mb-8">
                Where Culture Meets Commentary
              </p>
              <p className="text-lg font-inter text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Choose your journey through our curated content portals. Each side offers unique perspectives on the entertainment that shapes our world.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Portals */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {portalData.map((portal, index) => (
              <motion.div
                key={portal.id}
                initial={{ x: index === 0 ? -100 : 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.3, duration: 0.8 }}
                className="group"
              >
                <Link to={portal.path} aria-label={`Enter ${portal.title} portal`}>
                  <div
                    className={clsx(
                      'relative overflow-hidden rounded-2xl bg-gradient-to-br p-1 transition-all duration-500 group-hover:scale-105',
                      portal.gradient,
                      portal.hoverGlow
                    )}
                  >
                    <div className="bg-netflix-dark rounded-xl p-8 h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2
                            className={clsx(
                              'font-bold mb-2',
                              portal.textGlow,
                              portal.id === 'east' && 'font-japanese text-5xl',
                              portal.id === 'west' && 'font-ackno text-4xl'
                            )}
                          >
                            {portal.title}
                          </h2>
                          <p className="text-xl font-montserrat font-medium text-gray-300">{portal.subtitle}</p>
                        </div>

                        <motion.div
                          whileHover={{ x: 5 }}
                          className={clsx(
                            'p-3 rounded-full border',
                            `bg-${portal.color}-500/20`,
                            `border-${portal.color}-500/30`
                          )}
                        >
                          <ArrowRight className={`text-${portal.color}-400`} size={24} />
                        </motion.div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 font-inter leading-relaxed mb-8">{portal.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                          { icon: <BookOpen size={20} />, value: portal.stats.articles, label: 'Articles' },
                          { icon: <Users size={20} />, value: portal.stats.readers, label: 'Readers' },
                          { icon: <TrendingUp size={20} />, value: portal.stats.trending, label: 'Trending' },
                        ].map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="flex items-center justify-center mb-2 text-sm text-gray-400">
                              {React.cloneElement(stat.icon, {
                                className: `text-${portal.color}-400`,
                              })}
                            </div>
                            <div
                              className={clsx(
                                'font-bold',
                                i === 2 ? 'text-sm text-white' : `text-2xl text-${portal.color}-400`
                              )}
                            >
                              {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 font-inter">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Articles Preview */}
                      <div className="space-y-3">
                        <h4 className="font-montserrat font-semibold text-white text-sm mb-3">
                          Recent Articles:
                        </h4>
                        {(portal.articles || []).slice(0, 3).map((article, idx) => (
                          <div key={idx} className="flex items-center space-x-3 group/item">
                            <div className={`w-2 h-2 rounded-full bg-${portal.color}-500 opacity-60`} />
                            <span className="text-sm text-gray-300 font-inter group-hover/item:text-white transition-colors line-clamp-1">
                              {article.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.div whileHover={{ scale: 1.02 }} className="mt-8">
                        <div
                          className={clsx(
                            `w-full py-3 px-6 text-white font-montserrat font-semibold rounded-lg text-center transition-all duration-300`,
                            `bg-gradient-to-r from-${portal.color}-600 to-${portal.color}-500`,
                            `hover:from-${portal.color}-700 hover:to-${portal.color}-600`
                          )}
                        >
                          Enter {portal.title} Portal
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-16"
          >
            <h3 className="font-azonix text-3xl font-bold text-white mb-4">Can't Choose?</h3>
            <p className="text-gray-400 font-inter mb-6 max-w-2xl mx-auto">
              Explore both portals and discover the full spectrum of entertainment culture.
              Each side offers unique insights and passionate community discussions.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-gray-500 text-gray-300 font-inter font-medium rounded-lg hover:border-gray-400 hover:text-white transition-all duration-300"
            >
              Return to Homepage
            </Link>
          </motion.div>
        </div>
      </motion.div>

    </>
  );
};

export default BuzzfeedHub;
