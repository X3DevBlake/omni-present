import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, Volume2, Hand } from 'lucide-react';

/**
 * Phase 9: Adaptive UI System
 * Improvements 176-185: Context-aware layouts, emotion detection, dynamic theming
 */
export default function AdaptiveUISystem({ userContext, emotionalState }) {
  const [uiMode, setUiMode] = useState('default');
  const [theme, setTheme] = useState('dark');
  const [accessibility, setAccessibility] = useState({
    textSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
  });

  useEffect(() => {
    // Adapt UI based on context and emotion
    if (emotionalState?.frustration > 0.7) {
      setUiMode('simplified');
    } else if (emotionalState?.focus > 0.8) {
      setUiMode('focused');
    } else {
      setUiMode('default');
    }
  }, [emotionalState]);

  const modes = {
    default: 'Standard interface with all features',
    simplified: 'Reduced clutter, essential functions only',
    focused: 'Minimalist with active task highlighted',
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Adaptive UI System</h2>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(modes).map(([mode, desc]) => (
          <motion.button
            key={mode}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUiMode(mode)}
            className={`p-3 rounded-lg border transition-all ${
              uiMode === mode
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <p className="text-white font-semibold text-sm capitalize">{mode}</p>
            <p className="text-white/60 text-xs mt-1">{desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Accessibility Controls */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-white font-semibold mb-3">Accessibility</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-white/80">
            <input
              type="range"
              min="0"
              max="2"
              value={['small', 'medium', 'large'].indexOf(accessibility.textSize)}
              onChange={(e) => setAccessibility({ ...accessibility, textSize: ['small', 'medium', 'large'][e.target.value] })}
              className="w-32"
            />
            <span>Text Size: {accessibility.textSize}</span>
          </label>
          <label className="flex items-center gap-3 text-white/80">
            <input
              type="checkbox"
              checked={accessibility.reducedMotion}
              onChange={(e) => setAccessibility({ ...accessibility, reducedMotion: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Reduce Motion</span>
          </label>
        </div>
      </div>
    </div>
  );
}