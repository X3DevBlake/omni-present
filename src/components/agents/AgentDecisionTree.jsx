import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, ShoppingCart, Book, Zap } from 'lucide-react';

export default function AgentDecisionTree({ decision }) {
  const getDecisionIcon = (type) => {
    switch (type) {
      case 'purchase': return ShoppingCart;
      case 'investment': return TrendingUp;
      case 'learning': return Book;
      default: return Brain;
    }
  };

  const DecisionIcon = getDecisionIcon(decision?.decision_type);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <DecisionIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Decision Analysis</h3>
          <div className="text-white/60 text-sm capitalize">{decision?.decision_type || 'Unknown'}</div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-6">
        <div className="text-cyan-400 text-sm font-medium mb-2">AI Reasoning</div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-white/80 text-sm">{decision?.reasoning || 'No reasoning provided'}</p>
        </div>
      </div>

      {/* Factors */}
      <div className="mb-6">
        <div className="text-purple-400 text-sm font-medium mb-3">Factors Considered</div>
        <div className="space-y-2">
          {decision?.factors_considered?.map((factor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{factor.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-black/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${factor.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-purple-400 text-xs font-bold">{(factor.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          )) || (
            <div className="text-white/40 text-sm text-center py-4">No factors recorded</div>
          )}
        </div>
      </div>

      {/* Confidence & Cost */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
          <div className="text-cyan-400 text-xs mb-1">Confidence</div>
          <div className="text-white text-2xl font-bold">{decision?.confidence_score || 0}%</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-green-400 text-xs mb-1">Omni Cost</div>
          <div className="text-white text-2xl font-bold">{decision?.omni_cost?.toFixed(2) || 0}</div>
        </div>
      </div>

      {/* Outcome */}
      {decision?.outcome && (
        <div className="mt-4 bg-white/5 rounded-xl p-4">
          <div className="text-white/60 text-xs mb-1">Outcome</div>
          <p className="text-white text-sm">{decision.outcome}</p>
        </div>
      )}
    </div>
  );
}