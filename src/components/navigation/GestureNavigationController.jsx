import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GestureNavigationController() {
  const [gesture, setGesture] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const navigate = useNavigate();
  const touchStart = React.useRef({ x: 0, y: 0 });
  const touchEnd = React.useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isEnabled) return;

    const handleTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e) => {
      touchEnd.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;

      // Detect swipe direction
      if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            setGesture('right');
            navigate(-1); // Go back
          } else {
            setGesture('left');
            // Could navigate forward or to a specific page
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            setGesture('down');
            // Scroll down or refresh
          } else {
            setGesture('up');
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }

        // Clear gesture after animation
        setTimeout(() => setGesture(null), 1000);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isEnabled, navigate]);

  return (
    <>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`fixed bottom-40 right-6 z-40 rounded-full p-3 shadow-lg transition-all ${
          isEnabled ? 'bg-green-600' : 'bg-gray-600'
        }`}
      >
        <Hand className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence>
        {gesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-8">
              {gesture === 'left' && <ArrowLeft className="w-16 h-16 text-white" />}
              {gesture === 'right' && <ArrowRight className="w-16 h-16 text-white" />}
              {gesture === 'up' && <ArrowUp className="w-16 h-16 text-white" />}
              {gesture === 'down' && <ArrowDown className="w-16 h-16 text-white" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}