import React from 'react';
import { motion } from 'framer-motion';
import { Hand, ThumbsUp, Heart, Zap, MessageCircle, Star } from 'lucide-react';
import { useAvatar } from './AvatarContext';

const GESTURES = [
  { id: 'waving', label: 'Wave', icon: Hand, animation: 'waving' },
  { id: 'thumbsup', label: 'Thumbs Up', icon: ThumbsUp, animation: 'celebrating' },
  { id: 'nodding', label: 'Nod', icon: MessageCircle, animation: 'nodding' },
  { id: 'heart', label: 'Heart', icon: Heart, animation: 'celebrating' },
  { id: 'excited', label: 'Excited', icon: Zap, animation: 'celebrating' },
  { id: 'praise', label: 'Praise', icon: Star, animation: 'celebrating' }
];

export default function GestureEmoteSystem({ compact = false }) {
  const { setAnimationState, activeAvatar } = useAvatar();

  const handleGesture = (gesture) => {
    setAnimationState(gesture.animation);
    
    // Reset to idle after gesture duration
    const duration = gesture.animation === 'waving' ? 2000 : 1000;
    setTimeout(() => setAnimationState('idle'), duration);
  };

  if (!activeAvatar) return null;

  if (compact) {
    return (
      <div className="flex gap-2">
        {GESTURES.slice(0, 3).map(gesture => {
          const Icon = gesture.icon;
          return (
            <motion.button
              key={gesture.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGesture(gesture)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
              title={gesture.label}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
    >
      <h3 className="text-white font-semibold mb-3 text-sm">Quick Gestures</h3>
      <div className="grid grid-cols-3 gap-2">
        {GESTURES.map(gesture => {
          const Icon = gesture.icon;
          return (
            <motion.button
              key={gesture.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGesture(gesture)}
              className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/15 rounded-lg transition-all"
            >
              <Icon className="w-5 h-5 text-white" />
              <span className="text-white text-xs">{gesture.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}