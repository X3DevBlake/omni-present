import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Smartphone, AlertTriangle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AutonomyControlCenter() {
  const [userEmail, setUserEmail] = useState(null);
  const [agents, setAgents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        loadData();
      })
      .catch(() => setUserEmail(null));
  }, []);

  const loadData = async () => {
    try {
      const [agentsList, goalsList, behaviorsList, devicesList, anomaliesList] = await Promise.all([
        base44.entities.HolographicAgent.list(),
        base44.entities.AgentGoalDynamic.list('-created_date', 10),
        base44.entities.EmergentBehavior.list('-created_date', 10),
        base44.entities.RealWorldDevice.list(),
        base44.entities.SimulationAnomaly.list({ auto_resolved: false })
      ]);
      
      setAgents(agentsList);
      setGoals(goalsList);
      setBehaviors(behaviorsList);
      setDevices(devicesList);
      setAnomalies(anomaliesList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const triggerOptimization = async (agentId) => {
    setLoading(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Run self-optimization for agent ${agentId}`
      });
      await loadData();
      alert('Optimization complete!');
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnomalyDetection = async () => {
    setLoading(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: 'Run comprehensive anomaly detection on all simulations'
      });
      await loadData();
    } catch (error) {
      console.error('Anomaly detection error:', error);
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Autonomy Control Center</h1>
          <p className="text-white/60">Core AI autonomy, real-world integration & system monitoring</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-4"
          >
            <Brain className="w-8 h-8 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-cyan-400">{agents.length}</p>
            <p className="text-white/60 text-sm">Active Agents</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4"
          >
            <Target className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-purple-400">{goals.length}</p>
            <p className="text-white/60 text-sm">Dynamic Goals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4"
          >
            <Zap className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-green-400">{behaviors.length}</p>
            <p className="text-white/60 text-sm">Learned Behaviors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-lg p-4"
          >
            <Smartphone className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-orange-400">{devices.length}</p>
            <p className="text-white/60 text-sm">Real Devices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-lg p-4"
          >
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-red-400">{anomalies.length}</p>
            <p className="text-white/60 text-sm">Active Anomalies</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Dynamic Goals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Agent-Proposed Goals
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {goals.map((goal, idx) => (
                <div key={goal.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{goal.goal_name}</p>
                      <p className="text-white/60 text-xs">{goal.goal_type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      goal.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      goal.status === 'proposed' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{goal.reasoning}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-xs">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emergent Behaviors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Emergent Behaviors
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {behaviors.map((behavior, idx) => (
                <div key={behavior.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">{behavior.behavior_type}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      behavior.was_expected ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {behavior.was_expected ? 'Expected' : 'Unexpected'}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mb-2">Trigger: {behavior.trigger_event}</p>
                  <p className="text-green-400 text-sm">Adaptation: {behavior.adaptation_made}</p>
                  {behavior.replicated && (
                    <p className="text-purple-400 text-xs mt-2">✓ Replicated by other agents</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Real-World Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-400" />
              Real-World Device Integration
            </h3>
            <div className="space-y-3">
              {devices.map((device, idx) => (
                <div key={device.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{device.device_name}</p>
                      <p className="text-white/60 text-xs">{device.os_type.toUpperCase()} • {device.device_brand}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-white/60">Access Level</p>
                      <p className="text-cyan-400">{device.agent_access_level}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Apps</p>
                      <p className="text-purple-400">{device.installed_apps?.length || 0}</p>
                    </div>
                  </div>
                  {device.haptic_capable && (
                    <p className="text-green-400 text-xs mt-2">✓ Haptic feedback enabled</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Anomalies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                System Anomalies
              </h3>
              <button
                onClick={runAnomalyDetection}
                disabled={loading}
                className="px-3 py-1 bg-red-500/20 border border-red-400 text-red-300 rounded text-sm hover:bg-red-500/30 disabled:opacity-50"
              >
                Scan
              </button>
            </div>
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <div key={anomaly.id} className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold">{anomaly.anomaly_type}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      anomaly.severity === 'critical' ? 'bg-red-500/30 text-red-300' :
                      anomaly.severity === 'high' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{anomaly.root_cause}</p>
                  <div className="bg-green-500/10 border border-green-400/30 rounded p-2">
                    <p className="text-green-400 text-xs">{anomaly.recommended_action}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Agent Optimization Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-6"
        >
          <h3 className="text-white font-bold text-lg mb-4">Agent Self-Optimization</h3>
          <div className="grid grid-cols-4 gap-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => triggerOptimization(agent.id)}
                disabled={loading}
                className="p-3 bg-white/5 border border-white/20 rounded hover:bg-white/10 transition-all disabled:opacity-50 text-left"
              >
                <p className="text-white font-semibold text-sm">{agent.name}</p>
                <p className="text-cyan-400 text-xs mt-1">
                  Efficiency: {agent.state?.efficiency_score?.toFixed(1) || 'N/A'}%
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}