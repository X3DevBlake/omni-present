import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PageTransitionLoader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handlePageStart = () => setIsVisible(true);
    const handlePageEnd = () => {
      setTimeout(() => setIsVisible(false), 300);
    };

    window.addEventListener('pageLoadStart', handlePageStart);
    window.addEventListener('pageLoadEnd', handlePageEnd);

    return () => {
      window.removeEventListener('pageLoadStart', handlePageStart);
      window.removeEventListener('pageLoadEnd', handlePageEnd);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 z-[999]"
      style={{ transformOrigin: 'top' }}
    >
      <motion.div
        animate={{ x: ['0%', '100%'] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="h-full w-1/2 bg-gradient-to-r from-cyan-300 to-purple-300"
      />
    </motion.div>
  );
}