import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

export default function SubNavigation({ items, title, isVisible }) {
  if (!isVisible || !items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-16 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={createPageUrl(item.page)}
            className="group p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{item.icon}</span>
              <h4 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                {item.label}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
            </div>
            {item.description && (
              <p className="text-white/60 text-xs ml-7">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}