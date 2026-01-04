import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Zap, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProactiveAssistant({ telemetry, blueprint, onApplyAdjustment }) {
  const [recommendations, setRecommendations] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!telemetry) return;

    const newRecommendations = [];

    // CPU overload detection
    if (telemetry.cpuLoad > 85) {
      newRecommendations.push({
        id: 'cpu-overload',
        severity: 'critical',
        title: 'CPU Critical Load Detected',
        description: 'Neural Core operating at critical capacity. Immediate action required.',
        action: 'Scale horizontally by adding 2 GPU nodes',
        expectedImprovement: '40% load reduction',
        autoApply: () => ({
          type: 'scale',
          target: 'cpu',
          action: 'add-nodes',
          count: 2
        })
      });
    } else if (telemetry.cpuLoad > 75) {
      newRecommendations.push({
        id: 'cpu-high',
        severity: 'warning',
        title: 'CPU Approaching Capacity',
        description: 'Neural Core load trending upward. Proactive scaling recommended.',
        action: 'Enable dynamic frequency scaling',
        expectedImprovement: '15% efficiency gain',
        autoApply: () => ({
          type: 'optimize',
          target: 'cpu',
          action: 'dynamic-frequency'
        })
      });
    }

    // GPU optimization
    if (telemetry.gpuLoad > 90) {
      newRecommendations.push({
        id: 'gpu-saturated',
        severity: 'critical',
        title: 'GPU Arrays Saturated',
        description: 'All GPU resources fully utilized. Add compute nodes or reduce batch size.',
        action: 'Add 4 GPU nodes to array',
        expectedImprovement: '50% capacity increase',
        autoApply: () => ({
          type: 'scale',
          target: 'gpu',
          action: 'add-nodes',
          count: 4
        })
      });
    } else if (telemetry.gpuLoad < 30) {
      newRecommendations.push({
        id: 'gpu-underutilized',
        severity: 'info',
        title: 'GPU Underutilization Detected',
        description: 'GPU arrays operating below 30% capacity. Consider workload reallocation.',
        action: 'Consolidate workloads to 50% of arrays',
        expectedImprovement: '25% power savings',
        autoApply: () => ({
          type: 'optimize',
          target: 'gpu',
          action: 'consolidate-workloads'
        })
      });
    }

    // Memory pressure
    if (telemetry.memoryUsage > 85) {
      newRecommendations.push({
        id: 'memory-pressure',
        severity: 'critical',
        title: 'Memory Pressure Critical',
        description: 'System memory approaching capacity. Risk of thrashing and performance degradation.',
        action: 'Add 256GB memory module',
        expectedImprovement: 'Eliminate thrashing risk',
        autoApply: () => ({
          type: 'scale',
          target: 'memory',
          action: 'add-capacity',
          amount: 256
        })
      });
    }

    // Network optimization
    if (telemetry.networkTraffic > 350) {
      newRecommendations.push({
        id: 'network-congestion',
        severity: 'warning',
        title: 'Network Approaching Bandwidth Limit',
        description: 'Network traffic nearing capacity. Enable compression or add bandwidth.',
        action: 'Enable adaptive compression',
        expectedImprovement: '2x effective bandwidth',
        autoApply: () => ({
          type: 'optimize',
          target: 'network',
          action: 'enable-compression'
        })
      });
    }

    // Workload balancing
    const cpuGpuRatio = telemetry.cpuLoad / (telemetry.gpuLoad || 1);
    if (cpuGpuRatio > 1.5) {
      newRecommendations.push({
        id: 'workload-imbalance',
        severity: 'warning',
        title: 'Workload Imbalance Detected',
        description: 'CPU-heavy workload pattern. Offload to GPU for better performance.',
        action: 'Migrate preprocessing to GPU',
        expectedImprovement: '30% throughput increase',
        autoApply: () => ({
          type: 'optimize',
          target: 'workload',
          action: 'migrate-to-gpu'
        })
      });
    }

    // Thermal optimization
    if (telemetry.cpuLoad > 80 && telemetry.gpuLoad > 80) {
      newRecommendations.push({
        id: 'thermal-concern',
        severity: 'warning',
        title: 'High Thermal Load Detected',
        description: 'Multiple components under sustained high load. Monitor thermals.',
        action: 'Increase cooling capacity by 20%',
        expectedImprovement: '10°C reduction',
        autoApply: () => ({
          type: 'adjust',
          target: 'cooling',
          action: 'increase-capacity',
          percentage: 20
        })
      });
    }

    setRecommendations(newRecommendations);
    
    // Auto-show panel if critical recommendations
    if (newRecommendations.some(r => r.severity === 'critical')) {
      setShowPanel(true);
      toast.error('Critical optimization recommendations available');
    }
  }, [telemetry]);

  const applyRecommendation = (recommendation) => {
    const adjustment = recommendation.autoApply();
    onApplyAdjustment?.(adjustment);
    toast.success(`Applied: ${recommendation.action}`);
    
    // Remove recommendation after applying
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'from-red-500/20 to-red-500/5 border-red-500/40 text-red-400',
      warning: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/40 text-yellow-400',
      info: 'from-blue-500/20 to-blue-500/5 border-blue-500/40 text-blue-400',
    };
    return colors[severity] || colors.info;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return AlertTriangle;
    if (severity === 'warning') return TrendingUp;
    return Sparkles;
  };

  if (recommendations.length === 0) return null;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {recommendations.length}
        </span>
      </motion.button>

      {/* Recommendations Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-6 bottom-24 z-40 w-96 max-h-[70vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">AI Recommendations</h3>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => {
                const Icon = getSeverityIcon(rec.severity);
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border bg-gradient-to-br ${getSeverityColor(rec.severity)}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm mb-1">{rec.title}</h4>
                        <p className="text-white/70 text-xs mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <Zap className="w-3 h-3" />
                          <span className="text-white/90">{rec.action}</span>
                        </div>
                        <div className="text-[10px] text-white/50">
                          Expected: {rec.expectedImprovement}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => applyRecommendation(rec)}
                      className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    >
                      Apply Now
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}