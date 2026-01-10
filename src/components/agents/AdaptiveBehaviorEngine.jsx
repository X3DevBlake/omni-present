import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AdaptiveBehaviorEngine({ agent, interactions = [] }) {
  const [adaptations, setAdaptations] = useState([]);
  const [learningRate, setLearningRate] = useState(0);

  useEffect(() => {
    if (interactions.length === 0) return;

    const positiveCount = interactions.filter(i => i.feedback === 'positive').length;
    const totalCount = interactions.length;
    setLearningRate((positiveCount / totalCount) * 100);

    // Detect patterns
    const recentInteractions = interactions.slice(-10);
    const patterns = {
      preferredTone: detectTonePreference(recentInteractions),
      preferredTopics: detectTopicPreference(recentInteractions),
      responseLength: detectLengthPreference(recentInteractions),
    };

    setAdaptations(prev => [...prev, {
      timestamp: new Date(),
      patterns,
      confidence: learningRate,
    }].slice(-5));
  }, [interactions]);

  const detectTonePreference = (recent) => {
    const tones = recent.map(i => i.tone).filter(Boolean);
    const toneCounts = tones.reduce((acc, tone) => {
      acc[tone] = (acc[tone] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  };

  const detectTopicPreference = (recent) => {
    return ['technology', 'business', 'personal'];
  };

  const detectLengthPreference = (recent) => {
    const avgLength = recent.reduce((sum, i) => sum + (i.responseLength || 0), 0) / recent.length;
    return avgLength > 200 ? 'detailed' : 'concise';
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        Adaptive Learning
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-white/60 text-xs mb-1">Interactions</div>
          <div className="text-white text-2xl font-bold">{interactions.length}</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-white/60 text-xs mb-1">Learning Rate</div>
          <div className="text-purple-400 text-2xl font-bold">{learningRate.toFixed(1)}%</div>
        </div>
      </div>

      {adaptations.length > 0 && (
        <div className="space-y-2">
          <div className="text-white/70 text-sm font-medium">Recent Adaptations</div>
          {adaptations.map((adaptation, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/20 rounded p-2 text-sm"
            >
              <div className="text-white/80">Preferred tone: <span className="text-purple-400">{adaptation.patterns.preferredTone}</span></div>
              <div className="text-white/80">Response style: <span className="text-purple-400">{adaptation.patterns.responseLength}</span></div>
              <div className="text-white/40 text-xs mt-1">
                {new Date(adaptation.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 border border-green-500/40 rounded text-green-400 text-sm hover:bg-green-500/30">
          <ThumbsUp className="w-4 h-4" />
          Good Response
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-sm hover:bg-red-500/30">
          <ThumbsDown className="w-4 h-4" />
          Adjust
        </button>
      </div>
    </div>
  );
}