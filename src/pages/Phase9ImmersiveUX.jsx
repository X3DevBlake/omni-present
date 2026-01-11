import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdaptiveUISystem from '../components/immersive/AdaptiveUISystem';
import MultiModalInput from '../components/immersive/MultiModalInput';
import EmotionAwareUI from '../components/immersive/EmotionAwareUI';
import CollaborativeVisualization from '../components/immersive/CollaborativeVisualization';
import { Sparkles } from 'lucide-react';

export default function Phase9ImmersiveUX() {
  const [emotionalState, setEmotionalState] = useState({
    frustration: 0.3,
    focus: 0.7,
  });

  const handleInput = (input) => {
    console.log('Input received:', input);
  };

  const handleModeChange = (mode) => {
    console.log('Input mode changed to:', mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Phase 9: Immersive UI/UX
          </h1>
          <p className="text-white/60">Multi-modal, emotion-aware, adaptive interfaces (30 improvements)</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AdaptiveUISystem userContext={{}} emotionalState={emotionalState} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MultiModalInput onInput={handleInput} onModeChange={handleModeChange} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EmotionAwareUI />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CollaborativeVisualization />
          </motion.div>
        </div>

        {/* Key Features Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Key Improvements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Adaptive Layouts', desc: 'Context-aware UI that adjusts based on task and emotion' },
              { title: 'Multi-Modal Input', desc: 'Seamless voice, gesture, eye-tracking, keyboard' },
              { title: 'Emotion Detection', desc: 'Real-time emotional state analysis with empathetic responses' },
              { title: 'Collaboration', desc: 'Live presence, shared cursors, real-time sync' },
              { title: 'Accessibility', desc: 'Full customization for text size, contrast, motion' },
              { title: '3D Interactions', desc: 'Holographic elements and immersive visualizations' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}