// components/NewsletterModal.js
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(true); // default open

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      // Remove old script if it exists (prevents duplicates)
      const oldScript = document.querySelector(
        'script[src="https://animac-metaverse-buzzfeed.kit.com/eb0868ded1/index.js"]'
      );
      if (oldScript) oldScript.remove();

      // Create new script tag
      const script = document.createElement("script");
      script.src =
        "https://animac-metaverse-buzzfeed.kit.com/eb0868ded1/index.js";
      script.async = true;
      script.dataset.uid = "eb0868ded1";

      // Append to modal container
      const container = document.getElementById("newsletter-form");
      if (container) container.innerHTML = ""; // clear previous form
      container?.appendChild(script);
    }
  }, [isOpen]);

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

            {/* Embed Newsletter Form */}
            <div id="newsletter-form"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
