import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedButton = ({ children, onClick, variant = 'default', ...props }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.button>
);

export const AnimatedCard = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedInput = ({ children, ...props }) => (
  <motion.div
    whileFocus={{ scale: 1.02, borderColor: '#8b5cf6' }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    className="inline-block"
  >
    <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </svg>
  </motion.div>
);

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} border-4 border-purple-500 border-t-transparent rounded-full`}
    />
  );
};

export const PulseRing = ({ color = '#8b5cf6' }) => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{ border: `2px solid ${color}` }}
    animate={{
      scale: [1, 1.5, 1.5],
      opacity: [0.8, 0, 0]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeOut'
    }}
  />
);

export const FloatingParticles = ({ count = 20 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-purple-400 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
      />
    ))}
  </>
);