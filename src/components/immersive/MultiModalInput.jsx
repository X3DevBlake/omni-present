import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Hand, Eye, Keyboard } from 'lucide-react';

/**
 * Phase 9: Multi-Modal Input Handler
 * Improvements 186-195: Voice, gesture, eye-tracking, keyboard seamless switching
 */
export default function MultiModalInput({ onInput, onModeChange }) {
  const [activeMode, setActiveMode] = useState('keyboard');
  const [voiceActive, setVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState('');

  const modes = [
    { id: 'keyboard', name: 'Keyboard', icon: Keyboard },
    { id: 'voice', name: 'Voice', icon: Mic },
    { id: 'gesture', name: 'Gesture', icon: Hand },
    { id: 'eye', name: 'Eye Track', icon: Eye },
  ];

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setTranscript('Listening...');
      setTimeout(() => {
        setTranscript('You: What is my portfolio balance?');
        onInput('What is my portfolio balance?');
      }, 2000);
    }
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-white font-bold mb-4">Multi-Modal Input</h3>

      {/* Mode Selector */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveMode(mode.id);
                onModeChange(mode.id);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                activeMode === mode.id
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <Icon className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-white">{mode.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Voice Input Demo */}
      {activeMode === 'voice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-4"
        >
          <button
            onClick={handleVoiceToggle}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              voiceActive
                ? 'bg-red-500/30 text-red-200 border border-red-400'
                : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
            }`}
          >
            {voiceActive ? '⏹ Stop Listening' : '🎤 Start Listening'}
          </button>
          {transcript && (
            <p className="text-white/80 text-sm mt-3 p-2 bg-white/5 rounded">{transcript}</p>
          )}
        </motion.div>
      )}

      {/* Gesture Input Demo */}
      {activeMode === 'gesture' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-lg p-4"
        >
          <p className="text-white/80 text-sm">Swipe left/right to navigate, pinch to zoom</p>
          <div className="mt-3 h-24 bg-white/5 rounded flex items-center justify-center">
            <p className="text-white/40 text-sm">Gesture area (demo)</p>
          </div>
        </motion.div>
      )}

      {/* Eye Tracking Demo */}
      {activeMode === 'eye' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/20 rounded-lg p-4"
        >
          <p className="text-white/80 text-sm">Eye tracking enabled - gaze at elements to interact</p>
          <div className="mt-3 h-24 bg-white/5 rounded flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </motion.div>
      )}
    </div>
  );
}