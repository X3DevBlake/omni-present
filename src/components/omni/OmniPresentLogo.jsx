import React from 'react';
import { motion } from 'framer-motion';

export default function OmniPresentLogo({ size = 200 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      {/* Central rotating orb */}
      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, #00f5ff, #a855f7)',
          boxShadow: '0 0 40px #00f5ff, 0 0 80px #a855f7',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity },
        }}
      />

      {/* Orbital rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: size * (0.4 + i * 0.15),
            height: size * (0.4 + i * 0.15),
            borderColor: i % 2 === 0 ? '#00f5ff40' : '#a855f740',
          }}
          animate={{
            rotate: [0, i % 2 === 0 ? 360 : -360],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size * 0.35;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#00f5ff' : '#a855f7',
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#00f5ff' : '#a855f7'}`,
            }}
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          />
        );
      })}
    </div>
  );
}