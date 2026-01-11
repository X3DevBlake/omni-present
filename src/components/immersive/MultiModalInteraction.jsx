import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Hand, Eye, Keyboard } from 'lucide-react';

export default function MultiModalInteraction({ onCommand }) {
  const [activeMode, setActiveMode] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gestureDetected, setGestureDetected] = useState(null);

  // Voice input simulation
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setActiveMode('voice');
      setTimeout(() => {
        setTranscript('Show portfolio analysis');
        if (onCommand) onCommand({ type: 'voice', text: 'Show portfolio analysis' });
      }, 1500);
    }
  };

  const modes = [
    {
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      color: 'from-cyan-500 to-blue-500',
      active: activeMode === 'voice'
    },
    {
      id: 'gesture',
      label: 'Gesture',
      icon: Hand,
      color: 'from-purple-500 to-pink-500',
      active: activeMode === 'gesture'
    },
    {
      id: 'eye',
      label: 'Eye Tracking',
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
      active: activeMode === 'eye'
    },
    {
      id: 'keyboard',
      label: 'Keyboard',
      icon: Keyboard,
      color: 'from-yellow-500 to-orange-500',
      active: activeMode === 'keyboard'
    },
  ];

  return (
    <div className="fixed bottom-32 left-6 z-40 flex flex-col gap-4">
      {/* Mode Indicators */}
      <div className="flex gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              onClick={() => {
                if (mode.id === 'voice') toggleVoiceInput();
                else setActiveMode(mode.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full border transition-all ${
                mode.active
                  ? `bg-gradient-to-r ${mode.color} border-white/50 shadow-lg`
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              title={mode.label}
            >
              <Icon className={`w-5 h-5 ${mode.active ? 'text-white' : 'text-white/60'}`} />
            </motion.button>
          );
        })}
      </div>

      {/* Voice Feedback */}
      <AnimatePresence>
        {activeMode === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-white/10 rounded-lg p-4 max-w-xs"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.6, repeat: isListening ? Infinity : 0 }}
                className="w-2 h-2 rounded-full bg-cyan-400"
              />
              <span className="text-white font-semibold text-sm">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
            </div>
            {transcript && (
              <p className="text-white/80 text-sm italic">"{transcript}"</p>
            )}
            <button
              onClick={toggleVoiceInput}
              className="mt-3 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg text-cyan-400 text-xs font-semibold transition-all"
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
          </motion.div>
        )}

        {activeMode === 'gesture' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/10 rounded-lg p-4 max-w-xs"
          >
            <p className="text-white font-semibold text-sm mb-3">Gesture Detection Active</p>
            <div className="space-y-2 text-xs text-white/70">
              <p>👆 Swipe Up - Scroll data</p>
              <p>👆 Swipe Down - Go back</p>
              <p>✌️ Two fingers - Zoom</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <motion.div
        className="text-xs text-white/60 flex items-center gap-2"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Multi-modal ready
      </motion.div>
    </div>
  );
}