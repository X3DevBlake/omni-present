import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile, AlertCircle, Lightbulb, HelpCircle, ThumbsUp } from 'lucide-react';

const EMOTES = [
  { id: 'happy', label: 'Happy', icon: '😊', color: 'from-yellow-400 to-orange-400' },
  { id: 'thinking', label: 'Thinking', icon: '🤔', color: 'from-blue-400 to-purple-400' },
  { id: 'confused', label: 'Confused', icon: '😕', color: 'from-orange-400 to-red-400' },
  { id: 'excited', label: 'Excited', icon: '🤩', color: 'from-pink-400 to-red-400' },
  { id: 'calm', label: 'Calm', icon: '😌', color: 'from-cyan-400 to-blue-400' },
  { id: 'concerned', label: 'Concerned', icon: '😟', color: 'from-orange-400 to-yellow-400' },
  { id: 'nodding', label: 'Nodding', icon: '👤', color: 'from-green-400 to-cyan-400' },
  { id: 'gesturing', label: 'Gesturing', icon: '🙋', color: 'from-purple-400 to-pink-400' },
];

export default function AgentEmoteSystem({ agentName = 'Agent' }) {
  const [currentEmote, setCurrentEmote] = useState('happy');
  const [emoteHistory, setEmoteHistory] = useState([]);
  const [autoEmote, setAutoEmote] = useState(false);

  useEffect(() => {
    if (autoEmote) {
      const interval = setInterval(() => {
        const randomEmote = EMOTES[Math.floor(Math.random() * EMOTES.length)];
        setCurrentEmote(randomEmote.id);
        addToHistory(randomEmote.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoEmote]);

  const addToHistory = (emoteId) => {
    setEmoteHistory(prev => [
      { emoteId, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };

  const selectEmote = (emoteId) => {
    setCurrentEmote(emoteId);
    addToHistory(emoteId);
  };

  const currentEmoteData = EMOTES.find(e => e.id === currentEmote);

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold mb-4">😊 Agent Emote System</h3>

      {/* Large Emote Display */}
      <motion.div
        key={currentEmote}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${currentEmoteData?.color} flex items-center justify-center text-6xl shadow-lg border-2 border-white/20`}
      >
        {currentEmoteData?.icon}
      </motion.div>

      <p className="text-center text-white font-bold">
        {agentName} is <span className="text-purple-400">{currentEmoteData?.label}</span>
      </p>

      {/* Emote Selection Grid */}
      <div className="grid grid-cols-4 gap-2">
        {EMOTES.map(emote => (
          <motion.button
            key={emote.id}
            onClick={() => selectEmote(emote.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg transition-all ${
              currentEmote === emote.id
                ? `bg-gradient-to-br ${emote.color} border-2 border-white`
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
            title={emote.label}
          >
            <span className="text-2xl block">{emote.icon}</span>
            <span className="text-xs text-white block mt-1">{emote.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Auto Emote Toggle */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3">
        <input
          type="checkbox"
          id="autoEmote"
          checked={autoEmote}
          onChange={(e) => setAutoEmote(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="autoEmote" className="text-white text-sm flex-1">
          Auto-cycle emotes
        </label>
        <span className="text-xs text-white/60">{autoEmote ? 'On' : 'Off'}</span>
      </div>

      {/* Emote History */}
      <div>
        <p className="text-white/60 text-xs font-bold mb-2">Recent Emotes:</p>
        <div className="space-y-1 max-h-20 overflow-y-auto">
          {emoteHistory.length === 0 ? (
            <p className="text-white/40 text-xs">No emote history</p>
          ) : (
            emoteHistory.map((entry, i) => {
              const emote = EMOTES.find(e => e.id === entry.emoteId);
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                  <span>{emote?.icon}</span>
                  <span>{emote?.label}</span>
                  <span className="text-white/40 ml-auto">{entry.timestamp}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gesture Instructions */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/70 space-y-1">
        <p>💡 <strong>Tip:</strong> Agent emotes update based on:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Conversation context & sentiment</li>
          <li>Task progress & challenges</li>
          <li>User interactions</li>
          <li>Simulation events</li>
        </ul>
      </div>
    </div>
  );
}