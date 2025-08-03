// src/components/LoadingScreen.js
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex flex-col items-center space-y-4">
        {/* Glowing Ring */}
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-spin blur-sm" />
          <div className="absolute w-full h-full border-4 border-blue-500 rounded-full animate-ping blur-sm" />
          <div className="absolute w-full h-full border-2 border-white rounded-full" />
        </div>

        {/* Text */}
        <p className="text-xl font-bold text-transparent bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text animate-pulse tracking-widest">
          ANIMAC
        </p>

        <p className="text-sm text-white font-medium tracking-wider animate-pulse">
          Loading the Metaverse...
        </p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
