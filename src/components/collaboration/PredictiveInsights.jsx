import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PredictiveInsights({ collaborationId }) {
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', collaborationId],
    queryFn: () => collaborationId ? base44.entities.CollaborationPrediction.filter({ collaboration_id: collaborationId }).catch(() => []) : [],
    refetchInterval: 5000
  });

  const latest = predictions[0];

  if (!latest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h4 className="text-white font-bold">Predictive Insights</h4>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Success Probability</span>
          <span className={`text-lg font-bold ${
            latest.success_probability >= 70 ? 'text-green-400' :
            latest.success_probability >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {latest.success_probability}%
          </span>
        </div>

        {latest.bottleneck_predictions && latest.bottleneck_predictions.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 font-bold text-xs">Predicted Bottlenecks</p>
            </div>
            {latest.bottleneck_predictions.slice(0, 2).map((bottleneck, idx) => (
              <p key={idx} className="text-white/70 text-xs">• {bottleneck.bottleneck_type}</p>
            ))}
          </div>
        )}

        {latest.suggested_reassignments && latest.suggested_reassignments.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 font-bold text-xs">Suggested Optimizations</p>
            </div>
            <p className="text-white/70 text-xs">
              {latest.suggested_reassignments.length} task reassignment(s) recommended
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}