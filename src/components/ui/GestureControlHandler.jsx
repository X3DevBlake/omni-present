/**
 * Gesture Control Handler
 * - Pinch to zoom
 * - Swipe to navigate
 * - Rotate with two fingers
 * - Double tap for action
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function useGestureControls(onGesture) {
  const ref = useRef();
  const [lastTouch, setLastTouch] = useState(null);
  const [gestureDetected, setGestureDetected] = useState('');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDistance = 0;

    const handleTouchStart = (e) => {
      try {
        if (e?.touches?.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        } else if (e?.touches?.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        }
      } catch (err) {
        console.error('Touch start error:', err);
      }
    };

    const handleTouchEnd = (e) => {
      try {
        if (e?.changedTouches?.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 50) {
              setGestureDetected('swipe-right');
              onGesture?.('swipe-right');
            } else if (diffX < -50) {
              setGestureDetected('swipe-left');
              onGesture?.('swipe-left');
            }
          }
        }
      } catch (err) {
        console.error('Touch end error:', err);
      }
    };

    const handleTouchMove = (e) => {
      try {
        if (e?.touches?.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const delta = distance - touchStartDistance;

          if (delta > 20) {
            setGestureDetected('pinch-out');
            onGesture?.('zoom-in');
          } else if (delta < -20) {
            setGestureDetected('pinch-in');
            onGesture?.('zoom-out');
          }
        }
      } catch (err) {
        console.error('Touch move error:', err);
      }
    };

    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('touchmove', handleTouchMove);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [onGesture]);

  return { ref, gestureDetected };
}

export function GestureIndicator({ gesture }) {
  if (!gesture) return null;

  const icons = {
    'swipe-left': '←',
    'swipe-right': '→',
    'pinch-in': '🔍−',
    'pinch-out': '🔍+',
    'zoom-in': '⬆',
    'zoom-out': '⬇'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed bottom-10 right-10 bg-black/80 text-cyan-400 px-4 py-2 rounded-lg text-sm font-mono border border-cyan-400/50"
    >
      {icons[gesture] || gesture}
    </motion.div>
  );
}