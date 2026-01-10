import React from 'react';
import { motion } from 'framer-motion';

export default function Hub3DIcon({ icon, color }) {
  return (
    <div className="w-12 h-12 flex items-center justify-center relative">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${color}40, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.div
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          fontSize: '2rem',
          filter: `drop-shadow(0 0 8px ${color})`,
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
}