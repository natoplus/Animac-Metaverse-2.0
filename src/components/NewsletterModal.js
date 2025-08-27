// components/NewsletterModal.js
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Dynamically load the ConvertKit script when modal opens
    if (isOpen) {
      const script = document.createElement("script");
      script.src = "https://animac-metaverse-buzzfeed.kit.com/94bd2a2f44/index.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

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

            {/* The ConvertKit toggle link */}
            <a
              data-formkit-toggle="94bd2a2f44"
              href="https://animac-metaverse-buzzfeed.kit.com/94bd2a2f44"
              className="px-6 py-3 bg-gradient-to-r from-east-500 to-west-500 text-white font-semibold rounded-lg hover:from-east-600 hover:to-west-600 transition-all duration-300 hover:scale-105 block text-center"
            >
              Join the Newsletter 🚀
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
