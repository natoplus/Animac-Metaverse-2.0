// components/NewsletterModal.js
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

export default function NewsletterModal({ isOpen = false, onClose }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    onClose?.();
  };

  // Replace external provider with native form

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-xl p-8 max-w-lg w-full relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white"
            >
              ✕
            </button>

            {/* Native Newsletter Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (submitting) return;
                setSubmitting(true);
                try {
                  const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, source: 'modal' })
                  });
                  if (!res.ok) throw new Error('Subscribe failed');
                  setSubmitted(true);
                  setEmail('');
                  setTimeout(() => handleClose(), 1200);
                } catch (err) {
                  console.error(err);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-inter placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-east-500 to-west-500 text-white font-inter font-semibold rounded-lg hover:from-east-600 hover:to-west-600 transition-all duration-300 hover:scale-105 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Join Newsletter'}
              </button>
              {submitted && (
                <div className="text-green-400 text-center">Thanks! Check your inbox.</div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
