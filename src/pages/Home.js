import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ContentRow from '../components/ContentRow';
import { useFeaturedContent, useArticles } from '../hooks/useArticles';

const Home = () => {
  const { featuredContent, loading: featuredLoading } = useFeaturedContent();
  const { articles: eastArticles, loading: eastLoading } = useArticles('east');
  const { articles: westArticles, loading: westLoading } = useArticles('west');
  const { articles: allArticles, loading: allLoading } = useArticles();

  console.log('eastArticles', eastArticles);
  console.log('westArticles', westArticles);
  console.log('allArticles', allArticles);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <HeroSection featuredContent={featuredContent} />

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 pt-32 bg-gradient-to-t from-netflix-black to-transparent">
        <div className="container mx-auto">
          {/* East Content */}
          {!eastLoading && eastArticles.length > 0 ? (
            <ContentRow
              title="This Week in Anime"
              articles={eastArticles}
              category="east"
              emptyMessage="No eastern articles found yet."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">
              No eastern articles found yet.
            </p>
          )}

          {/* West Content */}
          {!westLoading && westArticles.length > 0 ? (
            <ContentRow
              title="Movies & Cartoons Spotlight"
              articles={westArticles}
              category="west"
              emptyMessage="No western articles found yet."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">
              No western articles found yet.
            </p>
          )}

          {/* Featured Stories */}
          {!allLoading && allArticles.length > 0 ? (
            <ContentRow
              title="Trending Now"
              articles={allArticles.filter(article => article.is_featured)}
              category="neutral"
              emptyMessage="No featured stories available."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">
              No featured stories available.
            </p>
          )}

          {/* Editor's Picks */}
          {!allLoading && allArticles.length > 0 ? (
            <ContentRow
              title="Editor's Choice"
              articles={allArticles.slice(0, 8)}
              category="neutral"
              emptyMessage="No editor picks at the moment."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">
              No editor picks at the moment.
            </p>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="py-16 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-azonix text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent">
                Dive Deeper into BUZZFEED
              </h2>
              <p className="text-xl text-gray-300 font-inter mb-8 leading-relaxed">
                Explore our dedicated portals for anime culture and western entertainment.
                Choose your journey and discover stories that resonate with your passion.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.a
                  href="/buzzfeed/east"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-east-600 to-east-500 text-white font-montserrat font-semibold rounded-lg hover:from-east-700 hover:to-east-600 transition-all duration-300 hover-glow-east"
                >
                  Explore EAST Portal <span className="ml-2 text-lg">→</span>
                </motion.a>

                <motion.a
                  href="/buzzfeed/west"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-west-600 to-west-500 text-white font-montserrat font-semibold rounded-lg hover:from-west-700 hover:to-west-600 transition-all duration-300 hover-glow-west"
                >
                  Explore WEST Portal <span className="ml-2 text-lg">→</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
