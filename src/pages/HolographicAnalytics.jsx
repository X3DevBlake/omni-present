import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, AlertTriangle, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AgentBehaviorNetwork from '../components/analytics/AgentBehaviorNetwork';
import PredictiveConflictAnalysis from '../components/analytics/PredictiveConflictAnalysis';
import GeminiInsightsDashboard from '../components/analytics/GeminiInsightsDashboard';

export default function HolographicAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [agents, setAgents] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    const [analyticsData, agentsData, interactionsData, tiers] = await Promise.all([
      base44.entities.SimulationAnalytics.list('-created_date', 10),
      base44.entities.HolographicAgent.list(),
      base44.entities.AgentInteraction.list('-timestamp', 50),
      base44.entities.AgentPerformanceTier.list()
    ]);
    
    const enrichedAgents = agentsData.map(agent => ({
      ...agent,
      tier: tiers.find(t => t.agent_id === agent.id)
    }));
    
    setAnalytics(analyticsData);
    setAgents(enrichedAgents);
    setInteractions(interactionsData);
    
    if (analyticsData.length > 0) {
      setPredictions(analyticsData[0].conflict_predictions);
    }
  };

  const latestAnalytics = analytics[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Holographic Analytics</h1>
          <p className="text-white/60">AI-powered insights and predictive analysis</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-4">
            <Users className="w-8 h-8 text-cyan-400 mb-2" />
            <p className="text-white/60 text-xs">Active Agents</p>
            <p className="text-white text-3xl font-bold">{agents.length}</p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-white/60 text-xs">Efficiency Score</p>
            <p className="text-white text-3xl font-bold">
              {latestAnalytics?.agent_performance?.efficiency_score?.toFixed(1) || '0'}
            </p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-white/60 text-xs">Tasks Completed</p>
            <p className="text-white text-3xl font-bold">
              {latestAnalytics?.agent_performance?.total_tasks_completed || 0}
            </p>
          </motion.div>

          <motion.div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4">
            <AlertTriangle className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-white/60 text-xs">Predicted Conflicts</p>
            <p className="text-white text-3xl font-bold">
              {predictions?.length || 0}
            </p>
          </motion.div>
        </div>

        <div className="mb-6">
          <GeminiInsightsDashboard simulationId={latestAnalytics?.simulation_id} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <AgentBehaviorNetwork agents={agents} interactions={interactions} />
          <PredictiveConflictAnalysis predictions={predictions} />
        </div>

        {/* Communication Metrics */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Communication Patterns
          </h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-xs">Text Messages</p>
              <p className="text-cyan-400 text-2xl font-bold">
                {latestAnalytics?.communication_metrics?.text_messages || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs">Voice Calls</p>
              <p className="text-green-400 text-2xl font-bold">
                {latestAnalytics?.communication_metrics?.voice_calls || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs">Video Calls</p>
              <p className="text-purple-400 text-2xl font-bold">
                {latestAnalytics?.communication_metrics?.video_calls || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs">Collaborations</p>
              <p className="text-orange-400 text-2xl font-bold">
                {latestAnalytics?.communication_metrics?.collaboration_sessions || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs">Total Interactions</p>
              <p className="text-white text-2xl font-bold">
                {latestAnalytics?.communication_metrics?.total_interactions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}