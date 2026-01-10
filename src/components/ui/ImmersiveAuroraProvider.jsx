/**
 * Immersive Aurora Provider
 * - Global aurora background across app
 * - Contextual 3D loading screens
 * - Haptic feedback integration
 * - Spatial audio cues
 * - Dynamic UI element animations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from '@/components/omni/AuroraBackground';

const ImmersiveContext = createContext();

export function ImmersiveProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState('default');

  const triggerHaptic = useCallback((pattern = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [30],
        heavy: [50],
        double: [20, 50, 20],
        success: [20, 100, 20],
        error: [50, 100, 50]
      };
      navigator.vibrate(patterns[pattern] || patterns.light);
    }
  }, []);

  const playAudio = useCallback((type = 'notification') => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const sounds = {
      notification: { freq: 800, duration: 0.1 },
      success: { freq: 1000, duration: 0.2 },
      error: { freq: 400, duration: 0.3 },
      click: { freq: 600, duration: 0.05 }
    };

    const sound = sounds[type] || sounds.notification;
    oscillator.frequency.value = sound.freq;
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  }, []);

  const startLoading = useCallback((context = 'default') => {
    setLoadingContext(context);
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <ImmersiveContext.Provider value={{ triggerHaptic, playAudio, startLoading, stopLoading }}>
      <AuroraBackground>
        {children}

        {/* Loading Screen */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <div className="text-center space-y-6">
                {loadingContext === 'financial' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto"
                  >
                    <div className="w-full h-full border-4 border-cyan-400 border-t-transparent rounded-full" />
                  </motion.div>
                )}

                {loadingContext === 'ai' && (
                  <motion.div className="space-y-3">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="h-2 w-2 bg-purple-400 rounded-full mx-auto"
                      />
                    ))}
                  </motion.div>
                )}

                {loadingContext === 'defi' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-200 rounded-full" />
                  </motion.div>
                )}

                <p className="text-white text-sm">Loading {loadingContext}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AuroraBackground>
    </ImmersiveContext.Provider>
  );
}

export function useImmersive() {
  const context = useContext(ImmersiveContext);
  if (!context) {
    throw new Error('useImmersive must be used within ImmersiveProvider');
  }
  return context;
}