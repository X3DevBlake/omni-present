import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

export default function PredictiveConflictAnalysis({ predictions }) {
  const getRiskColor = (level) => {
    if (level === 'high') return 'text-red-400 bg-red-500/20 border-red-400';
    if (level === 'medium') return 'text-orange-400 bg-orange-500/20 border-orange-400';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-400';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        Predictive Conflict Analysis
      </h3>
      
      {!predictions || predictions.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-semibold">No Conflicts Predicted</p>
          <p className="text-white/60 text-xs mt-1">All agents operating smoothly</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {predictions.map((prediction, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-lg p-3 ${getRiskColor(prediction.risk_level)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold text-sm uppercase">{prediction.risk_level} Risk</span>
                </div>
              </div>
              
              <p className="text-white text-sm mb-2">{prediction.reason}</p>
              
              {prediction.preventative_action && (
                <div className="bg-white/10 rounded p-2 mt-2">
                  <p className="text-white/80 text-xs font-semibold mb-1">Recommended Action:</p>
                  <p className="text-white/70 text-xs">{prediction.preventative_action}</p>
                </div>
              )}
              
              {prediction.agent_ids && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {prediction.agent_ids.map(id => (
                    <span key={id} className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                      Agent {id.slice(0, 8)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}