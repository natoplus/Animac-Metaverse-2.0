// components/NewsletterModal.js
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function NewsletterModal({ isOpen, onClose }) {
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
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-xl"
              aria-label="Close newsletter modal"
            >
              ✕
            </button>

            {/* Embed Newsletter Form */}
            <div
              dangerouslySetInnerHTML={{
                 __html: `<script async data-uid="94bd2a2f44" src="https://animac-metaverse-buzzfeed.kit.com/94bd2a2f44/index.js"></script>`
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
