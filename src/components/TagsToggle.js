import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag } from "lucide-react";

function TagsToggle({ tags }) {
  const [showTags, setShowTags] = useState(false);

  return (
    <div className="mt-3">
      {/* Toggle Button */}
      <button
        onClick={() => setShowTags(!showTags)}
        className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
      >
        <motion.div
          animate={{ rotate: showTags ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tag size={12} className="mr-1" />
        </motion.div>
        {showTags ? "Hide Tags" : "Show Tags"}
      </button>

      {/* Animated Tags List */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 10).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TagsToggle;
