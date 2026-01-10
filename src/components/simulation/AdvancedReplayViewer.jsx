import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdvancedReplayViewer({ replayId }) {
  const { data: analytics } = useQuery({
    queryKey: ['replayAnalytics', replayId],
    queryFn: () => replayId ? base44.entities.AdvancedReplayAnalytics.filter({ replay_id: replayId }).catch(() => []) : []
  });

  const data = analytics?.[0];

  if (!data) {
    return <div className="text-white/60">Loading analytics...</div>;
  }

  // Prepare chart data
  const agentPerformanceData = Object.entries(data.agent_performance || {}).map(([agent, stats]) => ({
    name: agent,
    efficiency: (stats.efficiency_score || 0).toFixed(1),
    events: stats.events
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-bold">Advanced Replay Analytics</h3>
      </div>

      {/* Performance Chart */}
      {agentPerformanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <h4 className="text-white font-bold mb-3">Agent Performance</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Legend />
              <Bar dataKey="efficiency" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Behavior Patterns */}
      {data.behavior_patterns && data.behavior_patterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <h4 className="text-white font-bold mb-3">Detected Patterns</h4>
          <div className="space-y-2">
            {data.behavior_patterns.slice(0, 5).map((pattern, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm p-2 bg-white/5 rounded">
                <div className="flex-1">
                  <p className="text-white font-mono text-xs">{pattern.pattern}</p>
                  <p className="text-white/50 text-xs">Frequency: {pattern.frequency}x</p>
                </div>
                <p className="text-cyan-400 font-bold">{pattern.significance.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Anomalies */}
      {data.anomalies && data.anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Anomalies Detected
          </h4>
          <div className="space-y-1 text-xs">
            {data.anomalies.map((anomaly, idx) => (
              <p key={idx} className="text-white/70">
                {anomaly.event_type}: Expected {anomaly.expected.toFixed(0)}, Got {anomaly.actual}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Optimization Suggestions */}
      {data.optimization_suggestions && data.optimization_suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Optimization Suggestions
          </h4>
          <div className="space-y-2">
            {data.optimization_suggestions.map((suggestion, idx) => (
              <p key={idx} className="text-white/70 text-sm">• {suggestion}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {data.learning_summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <h4 className="text-green-400 font-bold mb-3">Learning Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-white/60">Key Learnings</p>
              <ul className="list-disc list-inside text-white/70 mt-1">
                {data.learning_summary.key_learnings?.map((learning, idx) => (
                  <li key={idx}>{learning}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}