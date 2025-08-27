// src/components/NewsletterModal.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger popup when user scrolls 50% down the page
    const handleScroll = () => {
      if (!show && window.scrollY > document.body.scrollHeight / 2) {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [show]);

  useEffect(() => {
    if (show) {
      const script = document.createElement("script");
      script.src =
        "https://animac-metaverse-buzzfeed.kit.com/94bd2a2f44/index.js";
      script.async = true;
      script.dataset.uid = "94bd2a2f44";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 p-6 rounded-xl max-w-xl w-full relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShow(false)}
            >
              ✕
            </button>
            <div id="kit-embed-container"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
