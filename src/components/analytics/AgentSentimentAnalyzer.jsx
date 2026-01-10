import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Frown, Meh, Smile } from 'lucide-react';

export default function AgentSentimentAnalyzer() {
  const [messages, setMessages] = useState([]);
  const [sentiment, setSentiment] = useState({ positive: 0, neutral: 0, negative: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const sentiments = ['positive', 'neutral', 'negative'];
      const selected = sentiments[Math.floor(Math.random() * sentiments.length)];
      const agents = ['Agent Alpha', 'Agent Beta', 'Agent Gamma'];
      const newMsg = {
        agent: agents[Math.floor(Math.random() * agents.length)],
        text: selected === 'positive' ? 'Great collaboration!' : 
              selected === 'negative' ? 'Facing challenges' : 
              'Working on task',
        sentiment: selected,
        timestamp: new Date()
      };
      setMessages(prev => [newMsg, ...prev.slice(0, 9)]);
      setSentiment(prev => ({ ...prev, [selected]: prev[selected] + 1 }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;

  return (
    <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-pink-400" />
        Agent Sentiment Analysis
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <Smile className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-white font-bold text-2xl">{total ? ((sentiment.positive / total) * 100).toFixed(0) : 0}%</div>
          <div className="text-white/60 text-xs">Positive</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <Meh className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-white font-bold text-2xl">{total ? ((sentiment.neutral / total) * 100).toFixed(0) : 0}%</div>
          <div className="text-white/60 text-xs">Neutral</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <Frown className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-white font-bold text-2xl">{total ? ((sentiment.negative / total) * 100).toFixed(0) : 0}%</div>
          <div className="text-white/60 text-xs">Negative</div>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg ${
              msg.sentiment === 'positive' ? 'bg-green-500/10' :
              msg.sentiment === 'negative' ? 'bg-red-500/10' :
              'bg-yellow-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-white font-medium text-sm">{msg.agent}</div>
              <div className="text-white/40 text-xs">{msg.timestamp.toLocaleTimeString()}</div>
            </div>
            <div className="text-white/80 text-sm">{msg.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}