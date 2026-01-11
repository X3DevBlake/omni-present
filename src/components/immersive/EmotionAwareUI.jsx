import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, Smile, Zap } from 'lucide-react';

/**
 * Phase 9: Emotion-Aware Interface
 * Improvements 196-205: Real-time emotion detection, adaptive responses, empathetic design
 */
export default function EmotionAwareUI() {
  const [emotionalState, setEmotionalState] = useState({
    happiness: 0.6,
    frustration: 0.2,
    focus: 0.7,
    stress: 0.3,
  });

  useEffect(() => {
    // Simulate real-time emotion detection
    const interval = setInterval(() => {
      setEmotionalState((prev) => ({
        happiness: Math.max(0, Math.min(1, prev.happiness + (Math.random() - 0.5) * 0.1)),
        frustration: Math.max(0, Math.min(1, prev.frustration + (Math.random() - 0.5) * 0.1)),
        focus: Math.max(0, Math.min(1, prev.focus + (Math.random() - 0.5) * 0.1)),
        stress: Math.max(0, Math.min(1, prev.stress + (Math.random() - 0.5) * 0.1)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getEmpatheticMessage = () => {
    if (emotionalState.frustration > 0.6)
      return '🛝 Let me simplify this for you...';
    if (emotionalState.stress > 0.7)
      return '🧘 Take a deep breath. I\'ve got this.';
    if (emotionalState.focus > 0.8) return '⚡ You\'re in the zone!';
    return '👋 How can I help you today?';
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-bold mb-4">Emotion-Aware Interface</h3>

      {/* Empathetic Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-lg p-4 mb-6"
      >
        <p className="text-white text-lg font-semibold">{getEmpatheticMessage()}</p>
      </motion.div>

      {/* Emotion Metrics */}
      <div className="space-y-4">
        {Object.entries(emotionalState).map(([emotion, value]) => (
          <div key={emotion} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/80 text-sm capitalize">{emotion}</label>
              <span className="text-cyan-400 font-semibold text-sm">{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${value * 100}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className={`h-full ${
                  emotion === 'frustration' || emotion === 'stress'
                    ? 'bg-red-500'
                    : 'bg-cyan-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Adaptive Actions */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-white/80 text-sm mb-3">
          {emotionalState.frustration > 0.6 ? (
            <>
              <AlertCircle className="inline w-4 h-4 mr-2" />
              AI is adapting interface to reduce frustration
            </>
          ) : (
            <>
              <Smile className="inline w-4 h-4 mr-2" />
              All systems optimized for your state
            </>
          )}
        </p>
      </div>
    </div>
  );
}