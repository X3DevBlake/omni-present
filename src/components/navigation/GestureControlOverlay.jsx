import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Hand, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GestureControlOverlay({ onGesture }) {
  const [isActive, setIsActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState(null);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (e.touches.length === 3) {
        setIsActive(true);
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 3) return;

      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      if (Math.abs(deltaX) > 100) {
        const gesture = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        setDetectedGesture(gesture);
        onGesture && onGesture(gesture);
        isDragging = false;
        setIsActive(false);
      } else if (Math.abs(deltaY) > 100) {
        const gesture = deltaY > 0 ? 'swipe-down' : 'swipe-up';
        setDetectedGesture(gesture);
        onGesture && onGesture(gesture);
        isDragging = false;
        setIsActive(false);
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        setIsActive(false);
        setDetectedGesture(null);
      }, 1000);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onGesture]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Card className="bg-black/90 border-cyan-400/50 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Hand className="w-12 h-12 text-cyan-400 animate-pulse" />
                  <p className="text-white text-sm">Gesture Navigation Active</p>
                  
                  {detectedGesture ? (
                    <div className="flex items-center gap-2 text-green-400">
                      {detectedGesture === 'swipe-left' && <ArrowLeft className="w-6 h-6" />}
                      {detectedGesture === 'swipe-right' && <ArrowRight className="w-6 h-6" />}
                      {detectedGesture === 'swipe-up' && <ArrowUp className="w-6 h-6" />}
                      {detectedGesture === 'swipe-down' && <ArrowDown className="w-6 h-6" />}
                      <span className="text-sm">{detectedGesture}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 text-white/40">
                      <ArrowLeft className="w-6 h-6" />
                      <ArrowUp className="w-6 h-6" />
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}