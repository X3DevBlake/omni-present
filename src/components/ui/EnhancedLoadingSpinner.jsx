import React from 'react';
import { motion } from 'framer-motion';

export default function EnhancedLoadingSpinner({ size = 'md', color = '#00f5ff', text = '' }) {
  const sizes = {
    sm: 24,
    md: 48,
    lg: 72,
    xl: 96
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="relative"
        style={{ width: spinnerSize, height: spinnerSize }}
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{ borderTopColor: color, borderRightColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent"
          style={{ borderBottomColor: color, borderLeftColor: color }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Core */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center Glow */}
        <motion.div
          className="absolute inset-6 rounded-full blur-md"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {text && (
        <motion.p
          className="text-white/80 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}