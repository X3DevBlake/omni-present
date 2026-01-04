import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = "", 
  hover = true,
  glow = false,
  glowColor = "cyan"
}) {
  const glowColors = {
    cyan: "shadow-[0_0_30px_rgba(0,245,255,0.15)]",
    purple: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    pink: "shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    blue: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  };

  return (
    <motion.div
      className={`
        relative rounded-2xl
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        ${glow ? glowColors[glowColor] : ''}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02,
        borderColor: 'rgba(255,255,255,0.15)',
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Spectral refraction effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}