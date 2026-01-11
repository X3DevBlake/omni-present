import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PredictionDashboard({ userEmail }) {
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', userEmail],
    queryFn: () => userEmail ? base44.entities.LongTermPrediction.filter({ user_email: userEmail }).catch(() => []) : []
  });

  const latestPrediction = predictions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-bold">AI Predictions & Insights</h3>
      </div>

      {latestPrediction && (
        <>
          {/* Main Prediction Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-bold">{latestPrediction.prediction_type}</h4>
                <p className="text-white/60 text-xs">{latestPrediction.timeframe}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-bold">{latestPrediction.confidence_score}%</p>
                <p className="text-white/40 text-xs">Confidence</p>
              </div>
            </div>

            {latestPrediction.predictions && (
              <div className="bg-black/30 rounded p-3 mb-3">
                <p className="text-white/80 text-sm">
                  {JSON.stringify(latestPrediction.predictions).substring(0, 200)}...
                </p>
              </div>
            )}

            {/* Data Sources */}
            {latestPrediction.data_sources && latestPrediction.data_sources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {latestPrediction.data_sources.map((source, idx) => (
                  <span key={idx} className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded">
                    {source}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Risk Factors */}
          {latestPrediction.risk_factors && latestPrediction.risk_factors.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            >
              <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Factors
              </h4>
              <div className="space-y-1">
                {latestPrediction.risk_factors.map((risk, idx) => (
                  <p key={idx} className="text-white/70 text-sm">
                    • {risk.factor || JSON.stringify(risk)}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actionable Insights */}
          {latestPrediction.actionable_insights && latestPrediction.actionable_insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
            >
              <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Recommended Actions
              </h4>
              <div className="space-y-1">
                {latestPrediction.actionable_insights.map((insight, idx) => (
                  <p key={idx} className="text-white/70 text-sm">
                    • {insight}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* All Predictions */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs font-bold">PREDICTION HISTORY</p>
        {predictions.slice(0, 5).map((pred, idx) => (
          <motion.div
            key={pred.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded p-2 text-xs"
          >
            <div className="flex justify-between">
              <span className="text-white">{pred.prediction_type}</span>
              <span className="text-cyan-400">{pred.confidence_score}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}