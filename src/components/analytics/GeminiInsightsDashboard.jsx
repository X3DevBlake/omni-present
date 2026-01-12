import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiInsightsDashboard({ simulationId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    const [agents, interactions, analytics] = await Promise.all([
      base44.entities.HolographicAgent.list(),
      base44.entities.AgentInteraction.list('-timestamp', 50),
      base44.entities.SimulationAnalytics.list({ simulation_id: simulationId }, '-created_date', 1)
    ]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze holographic simulation data:
Agents: ${agents.length}
Recent Interactions: ${interactions.length}
Performance Metrics: ${JSON.stringify(analytics[0]?.agent_performance || {})}

Provide:
1. Key behavioral patterns
2. Efficiency optimization suggestions
3. Potential conflict predictions
4. Resource utilization insights`,
      response_json_schema: {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'string' } },
          optimizations: { type: 'array', items: { type: 'string' } },
          conflicts: { type: 'array', items: { type: 'string' } },
          resources: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    generateInsights();
  }, [simulationId]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Gemini AI Insights
        </h3>
        <button 
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {insights && (
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg p-4"
          >
            <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Behavioral Patterns
            </h4>
            <ul className="space-y-2">
              {insights.patterns?.map((pattern, i) => (
                <li key={i} className="text-white/80 text-sm">• {pattern}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4"
          >
            <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Optimizations
            </h4>
            <ul className="space-y-2">
              {insights.optimizations?.map((opt, i) => (
                <li key={i} className="text-white/80 text-sm">• {opt}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-lg p-4"
          >
            <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Conflict Predictions
            </h4>
            <ul className="space-y-2">
              {insights.conflicts?.map((conflict, i) => (
                <li key={i} className="text-white/80 text-sm">• {conflict}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-4"
          >
            <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Resource Insights
            </h4>
            <ul className="space-y-2">
              {insights.resources?.map((resource, i) => (
                <li key={i} className="text-white/80 text-sm">• {resource}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </div>
  );
}