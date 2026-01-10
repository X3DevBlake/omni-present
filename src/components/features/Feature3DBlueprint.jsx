import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Network, Shield, Zap, Globe, Sparkles } from 'lucide-react';

const iconMap = {
  layers: Layers,
  network: Network,
  shield: Shield,
  zap: Zap,
  globe: Globe,
  sparkles: Sparkles,
};

export default function Feature3DBlueprint({ type = 'layers', color = '#00f5ff', height = 200 }) {
  const Icon = iconMap[type] || Layers;
  
  return (
    <div style={{ width: '100%', height: `${height}px` }} className="relative flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${color}20, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
      <motion.div
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <Icon
          size={height * 0.4}
          style={{ color }}
          className="drop-shadow-[0_0_20px_currentColor]"
        />
      </motion.div>
    </div>
  );
}