import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin = false, loading = false } = useAdmin();

  const baseNavItems = [
    { path: '/', label: 'HOME' },
    { path: '/buzzfeed', label: 'BUZZFEED' },
    { path: '/buzzfeed/east', label: 'EAST' },
    { path: '/buzzfeed/west', label: 'WEST' },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { path: '/admin', label: 'ADMIN' }]
    : baseNavItems;

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 bg-gradient-to-b from-black via-black/80 to-transparent"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/assets/svg-animac-logo.svg"
              alt="ANIMAC Logo"
              className="h-10 w-auto"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="hidden md:block text-sm text-gray-400 font-inter"
            >
              Streaming Culture. Streaming Stories.
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 font-inter font-medium transition-all duration-300 ${
                  isActiveRoute(item.path)
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActiveRoute(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-east-500 to-west-500"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </motion.button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="flex flex-col space-y-4 pt-4 border-t border-gray-800 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-2 font-inter font-medium transition-all duration-300 ${
                      isActiveRoute(item.path)
                        ? 'text-white bg-gray-800 rounded'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800 rounded'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
