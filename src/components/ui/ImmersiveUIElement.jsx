/**
 * Immersive UI Elements
 * - Dynamic UI panels that emerge from 3D environment
 * - Interactive 3D overlays
 * - Contextual data points
 * - Seamless transitions
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useImmersive } from './ImmersiveAuroraProvider';

export function ImmersivePanel({ 
  title, 
  children, 
  position = 'right',
  onClose 
}) {
  const { triggerHaptic } = useImmersive();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    triggerHaptic('light');
    setIsOpen(false);
    onClose?.();
  };

  const positionVariants = {
    left: {
      initial: { x: -400, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -400, opacity: 0 }
    },
    right: {
      initial: { x: 400, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 400, opacity: 0 }
    },
    top: {
      initial: { y: -300, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -300, opacity: 0 }
    },
    center: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0, opacity: 0 }
    }
  };

  return (
    <motion.div
      initial={positionVariants[position].initial}
      animate={isOpen ? positionVariants[position].animate : positionVariants[position].exit}
      exit={positionVariants[position].exit}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed z-40 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl ${
        position === 'right' ? 'right-6 top-24' : position === 'left' ? 'left-6 top-24' : 
        position === 'top' ? 'top-6 left-1/2 -translate-x-1/2' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      }`}
      style={{ width: position === 'top' || position === 'center' ? '600px' : '350px', maxHeight: '80vh', overflowY: 'auto' }}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export function Immersive3DOverlay({ dataPoints, onPointClick }) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {dataPoints.map((point, idx) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="absolute"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="relative"
            onClick={() => {
              onPointClick?.(point);
            }}
          >
            {/* Outer glow */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-cyan-400/20 rounded-full pointer-events-none"
              style={{ width: '40px', height: '40px', left: '-20px', top: '-20px' }}
            />

            {/* Center point */}
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400 cursor-pointer pointer-events-auto" />

            {/* Label */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-auto"
            >
              {point.label}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function SeamlessTransition({ from, to, duration = 0.6 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      className="w-full"
    >
      {to}
    </motion.div>
  );
}

export function AnimatedDataCard({ data, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm"
    >
      {data}
    </motion.div>
  );
}