import React from 'react';
import { motion } from 'framer-motion';

export default function Rotating3DIcon({ icon, color = '#00f5ff', size = 120 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }} className="flex items-center justify-center">
      {/* Pulsing background glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      
      {/* Orbital rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderColor: `${color}40`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = size * 0.35;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.1,
            }}
          />
        );
      })}
      
      {/* Icon overlay */}
      <motion.div
        className="relative z-10"
        style={{
          fontSize: size * 0.35,
          filter: `drop-shadow(0 0 ${size * 0.1}px ${color})`,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
}