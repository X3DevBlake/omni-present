import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SelfLearningAgent({ agentId = 'agent-1' }) {
  const [learningProgress, setLearningProgress] = useState([]);
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    generateLearningInsights();
  }, [agentId]);

  const generateLearningInsights = async () => {
    try {
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: `Agent ${agentId} has processed 150 transactions and 10 market cycles.
        Based on learning patterns, suggest 3 evolved strategies the agent should adopt.
        Return JSON with learnings array containing {strategy, confidence, improvement, example}`,
        response_json_schema: {
          type: 'object',
          properties: {
            learnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  strategy: { type: 'string' },
                  confidence: { type: 'number' },
                  improvement: { type: 'string' },
                  example: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setLearningProgress(insights.learnings || []);
    } catch (err) {
      console.error('Failed to generate insights:', err);
    }
  };

  const adoptStrategy = (strategy) => {
    setStrategies(prev => [...prev, { ...strategy, adopted: new Date(), status: 'active' }]);
  };

  return (
    <div className="bg-black/40 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Brain className="w-5 h-5 text-indigo-400" />
        Self-Learning Adaptation
      </h3>

      <div className="space-y-2">
        {learningProgress.length === 0 ? (
          <div className="text-white/40 text-sm">Analyzing behavioral patterns...</div>
        ) : (
          learningProgress.map((learning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-indigo-500/20 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{learning.strategy}</p>
                  <p className="text-white/60 text-xs mt-1">{learning.improvement}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-bold text-sm">{Math.round(learning.confidence * 100)}%</p>
                  <p className="text-white/50 text-xs">confidence</p>
                </div>
              </div>
              <p className="text-white/50 text-xs italic mb-2">Example: {learning.example}</p>
              <motion.button
                onClick={() => adoptStrategy(learning)}
                whileHover={{ scale: 1.05 }}
                className="w-full py-1 text-xs bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded"
              >
                Adopt Strategy
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      {strategies.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-white/70 text-xs font-bold mb-2">Active Strategies: {strategies.length}</p>
          <div className="space-y-1">
            {strategies.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-indigo-300">
                <Zap className="w-3 h-3" />
                <span>{s.strategy}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}