// components/NewsletterModal.js
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(true); // default open
  const formContainerRef = useRef(null);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && formContainerRef.current) {
      // Clear any previous form (important for re-opening)
      formContainerRef.current.innerHTML = "";

      // Create script tag
      const script = document.createElement("script");
      script.src =
        "https://animac-metaverse-buzzfeed.kit.com/94bd2a2f44/index.js";
      script.async = true;
      script.dataset.uid = "94bd2a2f44";

      // Append script to container
      formContainerRef.current.appendChild(script);
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

            {/* Inline Newsletter Form */}
            <div ref={formContainerRef}></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
