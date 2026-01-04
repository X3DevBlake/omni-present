import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Activity, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';

export default function ScenarioSimulator({ blueprint, telemetry, onSimulate, onClose }) {
  const [scenario, setScenario] = useState({
    loadMultiplier: 1.0,
    networkLatency: 0,
    componentFailures: [],
    aiWorkloadShift: 0,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // Simulate impact calculation
    setTimeout(() => {
      const baseCPU = telemetry?.cpuLoad || 50;
      const baseGPU = telemetry?.gpuLoad || 60;
      
      const results = {
        cpuLoad: Math.min(100, baseCPU * scenario.loadMultiplier + scenario.aiWorkloadShift),
        gpuLoad: Math.min(100, baseGPU * scenario.loadMultiplier + scenario.aiWorkloadShift * 0.8),
        memoryUsage: Math.min(100, (telemetry?.memoryUsage || 40) * scenario.loadMultiplier),
        networkLatency: scenario.networkLatency,
        affectedComponents: scenario.componentFailures,
        status: scenario.componentFailures.length > 0 ? 'degraded' : 
                (baseCPU * scenario.loadMultiplier > 90 ? 'critical' : 'healthy'),
        recommendations: generateRecommendations(scenario, baseCPU, baseGPU)
      };
      
      setSimulationResults(results);
      onSimulate?.(results);
      setIsSimulating(false);
    }, 2000);
  };

  const generateRecommendations = (scenario, baseCPU, baseGPU) => {
    const recs = [];
    if (scenario.loadMultiplier > 1.5) {
      recs.push('Consider adding more GPU nodes for high-load scenarios');
    }
    if (scenario.networkLatency > 50) {
      recs.push('Implement caching layers to mitigate network latency');
    }
    if (scenario.componentFailures.length > 0) {
      recs.push('Add redundancy for critical components');
    }
    if (baseCPU * scenario.loadMultiplier > 85) {
      recs.push('CPU bottleneck detected - scale horizontally');
    }
    return recs;
  };

  const reset = () => {
    setScenario({
      loadMultiplier: 1.0,
      networkLatency: 0,
      componentFailures: [],
      aiWorkloadShift: 0,
    });
    setSimulationResults(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-green-400',
      degraded: 'text-yellow-400',
      critical: 'text-red-400',
    };
    return colors[status] || colors.healthy;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Scenario Simulation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Controls */}
            <div>
              <h3 className="text-white font-semibold mb-3">Define Scenario</h3>
              
              {/* Load Multiplier */}
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">
                  Load Multiplier: {scenario.loadMultiplier.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={scenario.loadMultiplier}
                  onChange={(e) => setScenario({...scenario, loadMultiplier: parseFloat(e.target.value)})}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Network Latency */}
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">
                  Network Latency: +{scenario.networkLatency}ms
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={scenario.networkLatency}
                  onChange={(e) => setScenario({...scenario, networkLatency: parseInt(e.target.value)})}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* AI Workload Shift */}
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">
                  AI Workload Shift: {scenario.aiWorkloadShift > 0 ? '+' : ''}{scenario.aiWorkloadShift}%
                </label>
                <input
                  type="range"
                  min="-20"
                  max="40"
                  step="5"
                  value={scenario.aiWorkloadShift}
                  onChange={(e) => setScenario({...scenario, aiWorkloadShift: parseInt(e.target.value)})}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* Component Failures */}
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Simulate Component Failures</label>
                <div className="flex flex-wrap gap-2">
                  {['Neural Core', 'GPU Array 1', 'GPU Array 2', 'Memory Pool', 'Network Hub'].map((comp) => (
                    <button
                      key={comp}
                      onClick={() => {
                        const failures = scenario.componentFailures.includes(comp)
                          ? scenario.componentFailures.filter(c => c !== comp)
                          : [...scenario.componentFailures, comp];
                        setScenario({...scenario, componentFailures: failures});
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        scenario.componentFailures.includes(comp)
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                          : 'bg-white/5 text-white/60 border border-white/10'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {simulationResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Simulation Results
                  </h3>

                  {/* Status */}
                  <div className={`text-center py-4 rounded-xl bg-white/5 border border-white/10`}>
                    <div className={`text-2xl font-bold ${getStatusColor(simulationResults.status)}`}>
                      {simulationResults.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <div className="text-cyan-400 text-xs mb-1">CPU Load</div>
                      <div className="text-white text-2xl font-bold">
                        {Math.round(simulationResults.cpuLoad)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="text-purple-400 text-xs mb-1">GPU Load</div>
                      <div className="text-white text-2xl font-bold">
                        {Math.round(simulationResults.gpuLoad)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                      <div className="text-pink-400 text-xs mb-1">Memory</div>
                      <div className="text-white text-2xl font-bold">
                        {Math.round(simulationResults.memoryUsage)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="text-blue-400 text-xs mb-1">Latency</div>
                      <div className="text-white text-2xl font-bold">
                        {simulationResults.networkLatency}ms
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {simulationResults.recommendations?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-sm font-semibold">Recommendations</span>
                      </div>
                      <div className="space-y-2">
                        {simulationResults.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs"
                          >
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}