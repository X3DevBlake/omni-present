import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Zap, AlertTriangle, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function HolographicAnalytics() {
  const [userEmail, setUserEmail] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        loadAnalytics();
      })
      .catch(() => setUserEmail(null));
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsList = await base44.entities.SimulationAnalytics.list('-created_date', 1);
      if (analyticsList.length > 0) {
        setAnalytics(analyticsList[0]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: 'Run holographic simulation analytics for the last 24 hours'
      });
      await loadAnalytics();
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Holographic Analytics</h1>
            <p className="text-white/60">AI-powered simulation insights and predictions</p>
          </div>
          <button
            onClick={generateAnalytics}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            {loading ? 'Analyzing...' : 'Generate Analytics'}
          </button>
        </motion.div>

        {analytics ? (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-cyan-400" />
                  <span className="text-2xl font-bold text-cyan-400">
                    {analytics.agent_performance?.efficiency_score?.toFixed(1) || 0}%
                  </span>
                </div>
                <p className="text-white/60 text-sm">Efficiency Score</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">
                    {analytics.agent_performance?.success_rate?.toFixed(1) || 0}%
                  </span>
                </div>
                <p className="text-white/60 text-sm">Success Rate</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-purple-400">
                    {analytics.communication_metrics?.total_interactions || 0}
                  </span>
                </div>
                <p className="text-white/60 text-sm">Total Interactions</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-8 h-8 text-orange-400" />
                  <span className="text-2xl font-bold text-orange-400">
                    {analytics.communication_metrics?.collaboration_sessions || 0}
                  </span>
                </div>
                <p className="text-white/60 text-sm">Collaborations</p>
              </motion.div>
            </div>

            {/* Communication Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">Communication Channels</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4 text-center">
                  <p className="text-cyan-400 text-3xl font-bold">
                    {analytics.communication_metrics?.text_messages || 0}
                  </p>
                  <p className="text-white/60 text-sm mt-2">Text Messages</p>
                </div>
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 text-3xl font-bold">
                    {analytics.communication_metrics?.voice_calls || 0}
                  </p>
                  <p className="text-white/60 text-sm mt-2">Voice Calls</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 text-center">
                  <p className="text-purple-400 text-3xl font-bold">
                    {analytics.communication_metrics?.video_calls || 0}
                  </p>
                  <p className="text-white/60 text-sm mt-2">Video Calls</p>
                </div>
              </div>
            </motion.div>

            {/* Behavior Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                AI-Detected Behavior Patterns
              </h3>
              <div className="space-y-3">
                {analytics.behavior_patterns?.slice(0, 5).map((pattern, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white font-semibold">{pattern.pattern_name || 'Pattern ' + (idx + 1)}</p>
                    <p className="text-white/60 text-sm mt-1">{pattern.description || 'Behavior pattern detected'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                        Frequency: {pattern.frequency || 'High'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        Impact: {pattern.impact || 'Medium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Conflict Predictions */}
            {analytics.conflict_predictions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-lg p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Predicted Conflicts & Preventative Actions
                </h3>
                <div className="space-y-3">
                  {analytics.conflict_predictions.map((conflict, idx) => (
                    <div key={idx} className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-red-400 font-semibold">
                            Risk Level: {conflict.risk_level || 'Medium'}
                          </p>
                          <p className="text-white/80 text-sm mt-1">{conflict.reason}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          conflict.risk_level === 'high' ? 'bg-red-500/20 text-red-300' :
                          conflict.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {conflict.risk_level?.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 bg-green-500/10 border border-green-400/30 rounded p-3">
                        <p className="text-green-400 text-sm font-semibold mb-1">Preventative Action:</p>
                        <p className="text-white/70 text-sm">{conflict.preventative_action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Market Learning Insights */}
            {analytics.market_learning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4">Market Data Learning Insights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Learning Opportunities</p>
                    <div className="space-y-2">
                      {analytics.market_learning.learning_opportunities?.slice(0, 3).map((opp, idx) => (
                        <div key={idx} className="bg-cyan-500/10 border border-cyan-400/30 rounded p-2">
                          <p className="text-cyan-400 text-sm">{opp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Risk Factors</p>
                    <div className="space-y-2">
                      {analytics.market_learning.risk_factors?.slice(0, 3).map((risk, idx) => (
                        <div key={idx} className="bg-red-500/10 border border-red-400/30 rounded p-2">
                          <p className="text-red-400 text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No analytics data available</p>
            <p className="text-white/40 text-sm mt-2">Click "Generate Analytics" to analyze simulation data</p>
          </div>
        )}
      </div>
    </div>
  );
}