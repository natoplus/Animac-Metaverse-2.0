import React from "react";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white p-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold mb-4 text-blue-400">About ANIMAC</h1>
      <p className="text-lg max-w-3xl">
        ANIMAC is a futuristic hub connecting East and West cultures through
        animation, storytelling, and immersive experiences. Our mission is to
        build a metaverse where creativity thrives.
      </p>
    </motion.div>
  );
}
