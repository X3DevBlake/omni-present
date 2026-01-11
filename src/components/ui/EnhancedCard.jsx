import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function EnhancedCard({ 
  children, 
  glowColor = '#00f5ff',
  hover3D = true,
  className = ""
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
    });
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        transform: hover3D && isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.05)`
          : 'none',
        transition: 'transform 0.2s ease-out'
      }}
    >
      {/* Animated Glow */}
      <motion.div
        className="absolute inset-0 opacity-0 blur-xl"
        style={{ backgroundColor: glowColor }}
        animate={{
          opacity: isHovered ? 0.2 : 0
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Gradient Overlay on Hover */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x + 50}% ${mousePosition.y + 50}%, ${glowColor}20, transparent 50%)`
        }}
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Border Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 20px ${glowColor}40, 0 0 20px ${glowColor}20`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}