import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, XIcon, Instagram, Mail } from 'lucide-react';
import NewsletterModal from './NewsletterModal'; // import the modal
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openNewsletter = () => setIsNewsletterOpen(true);
  const closeNewsletter = () => setIsNewsletterOpen(false);

  const footerLinks = {
    Company: [
      { label: 'About ANIMAC', path: '/about' },
      { label: 'Terms & Agreement', path: 'https://www.termsfeed.com/live/078404e4-889d-453b-ac6c-fc3458d9394c' },
      { label: 'Careers', path: '#' },
      { label: 'Press Kit', path: '/press-kit' }
    ],
    Content: [
      { label: 'BUZZFEED Hub', path: '/buzzfeed' },
      { label: 'EAST Portal', path: '/buzzfeed/east' },
      { label: 'WEST Portal', path: '/buzzfeed/west' },
      { label: 'Submit Article', path: 'https://forms.gle/yLHrENNdyCDpVtkdA' }
    ],
    Community: [
      { label: 'Linktree', path: '#' },
      { label: 'Reddit', path: '#' },
      { label: 'Newsletter', path: 'https://animac-metaverse-buzzfeed.kit.com/621519eebb' },
      { label: 'Contact Us', path: 'https://forms.gle/FHkorLKUmybNVu5j8' }
    ]
  };

  return (
    <footer className="bg-gradient-to-t from-black to-netflix-dark mt-20 relative">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="inline-block mb-4">
                <div className="text-3xl font-azonix font-bold text-white">
                  ANIMAC
                </div>
                <div className="text-sm text-gray-400 font-inter mt-1">
                  Streaming Culture. Streaming Stories.
                </div>
              </Link>

              <p className="text-gray-400 font-inter leading-relaxed mb-6 max-w-sm">
                Your ultimate destination for anime, movies, and western cartoons content.
                Discover stories that shape our streaming culture.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                {[
                  { icon: XIcon, href: 'https://x.com/Animac_Official?t=TVShBCQ6mbL-85Q5TFv02A&s=09', label: 'x' },
                  { icon: Instagram, href: 'https://www.instagram.com/animacbuzzfeed?igsh=b2d6aHdlN2RnMXBw', label: 'Instagram' },
                  { icon: Facebook, href: 'https://www.facebook.com/share/16J2CHYuEW/', label: 'Facebook' },
                  { icon: Mail, href: 'iconanimac@gmail.com', label: 'Email' }
                ].map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-all duration-300"
                    aria-label={label}
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
              className="lg:col-span-1"
            >
              <h3 className="font-montserrat font-semibold text-white mb-4 text-lg">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white font-inter transition-colors duration-300 hover:translate-x-1 inline-block"
                      aria-label={link.label}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-azonix text-2xl text-white mb-2">
              Stay in the Loop
            </h3>
            <p className="text-gray-400 font-inter mb-6">
              Get weekly updates on the latest anime releases, movie reviews, and cartoon spotlights.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (submitting) return;
                setSubmitting(true);
                try {
                  const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, source: 'footer' })
                  });
                  if (!res.ok) throw new Error('Subscribe failed');
                  setSubmitted(true);
                  setEmail('');
                  setTimeout(() => setSubmitted(false), 3000);
                } catch (err) {
                  console.error(err);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-inter placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-east-500 to-west-500 text-white font-inter font-semibold rounded-lg hover:from-east-600 hover:to-west-600 transition-all duration-300 hover:scale-105 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Subscribe'}
              </button>
            </form>
            {submitted && (
              <div className="mt-4 text-green-400 font-inter">Thanks! Check your inbox.</div>
            )}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-gray-400 font-inter text-sm">
            © {currentYear} ANIMAC. All rights reserved.
          </div>

          <div className="flex space-x-6 text-sm">
            {[
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Content Guidelines'
            ].map((item, index) => (
              <Link
                key={index}
                to="#"
                aria-label={item}
                className="text-gray-400 hover:text-white font-inter transition-colors duration-300"
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Newsletter Modal */}
      {isNewsletterOpen && <NewsletterModal isOpen={isNewsletterOpen} onClose={closeNewsletter} />}
    </footer>
  );
};

export default Footer;
