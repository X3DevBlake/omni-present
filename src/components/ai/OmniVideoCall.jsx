import React from 'react';
import { motion } from 'framer-motion';

export default function OmniVideoCall({ isSpeaking }) {
  const activeColor = isSpeaking ? "#ec4899" : "#00f5ff";
  
  return (
    <motion.div
      className="relative w-full h-64 bg-gradient-to-br from-black via-purple-900/20 to-black border-b border-white/10 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 256 }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Central orb */}
      <motion.div
        className="relative w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${activeColor}, ${activeColor}80)`,
          boxShadow: `0 0 60px ${activeColor}`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isSpeaking ? 0.5 : 2,
          repeat: Infinity,
        }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, white, transparent)',
        }}
        animate={{
          opacity: isSpeaking ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />

      {/* Orbiting particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 80;
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-purple-400"
            style={{
              boxShadow: '0 0 10px #a855f7',
            }}
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
              opacity: isSpeaking ? [0.5, 1, 0.5] : [0.3, 0.5, 0.3],
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

      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-pink-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span className="text-white text-xs">
            {isSpeaking ? 'Omni is speaking...' : 'Omni is listening'}
          </span>
        </div>
      </div>

      {isSpeaking && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
              'radial-gradient(circle at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}