import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoTuningAssistant({ telemetry, benchmarkResults, onApplyTuning }) {
  const [tuningInProgress, setTuningInProgress] = useState(false);
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (telemetry && !tuningInProgress) {
        performAutoTuning();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [telemetry, benchmarkResults, tuningInProgress]);

  const performAutoTuning = () => {
    setTuningInProgress(true);
    const optimizations = [];

    // Thread pool optimization
    if (telemetry.cpuLoad > 85) {
      const newThreadCount = Math.ceil(telemetry.cpuLoad / 10) * 2;
      optimizations.push({
        id: Date.now() + 1,
        parameter: 'Thread Pool Size',
        oldValue: 'Auto',
        newValue: newThreadCount,
        reasoning: `CPU at ${telemetry.cpuLoad.toFixed(0)}%. Increasing threads to improve parallelism.`,
        expectedGain: '12-18% throughput increase',
        timestamp: new Date()
      });
    }

    // Memory cache tuning
    if (telemetry.memoryUsage < 60) {
      optimizations.push({
        id: Date.now() + 2,
        parameter: 'L2 Cache Size',
        oldValue: '256MB',
        newValue: '512MB',
        reasoning: 'Underutilized memory. Expanding cache to reduce latency.',
        expectedGain: '8-12% latency reduction',
        timestamp: new Date()
      });
    }

    // Network buffer optimization
    if (telemetry.networkTraffic > 70) {
      optimizations.push({
        id: Date.now() + 3,
        parameter: 'Network Buffer',
        oldValue: '64KB',
        newValue: '128KB',
        reasoning: `High network utilization (${telemetry.networkTraffic.toFixed(0)}%). Increasing buffers to prevent drops.`,
        expectedGain: '15-20% network throughput',
        timestamp: new Date()
      });
    }

    // Batch size optimization based on benchmarks
    if (benchmarkResults?.length > 0) {
      const latestBenchmark = benchmarkResults[benchmarkResults.length - 1];
      if (latestBenchmark.metrics?.latency > 30) {
        optimizations.push({
          id: Date.now() + 4,
          parameter: 'Batch Size',
          oldValue: '32',
          newValue: '16',
          reasoning: 'High latency detected in benchmarks. Reducing batch size for faster response.',
          expectedGain: '40-50% latency improvement',
          timestamp: new Date()
        });
      } else if (latestBenchmark.metrics?.throughput < 1000) {
        optimizations.push({
          id: Date.now() + 5,
          parameter: 'Batch Size',
          oldValue: '16',
          newValue: '64',
          reasoning: 'Low throughput in benchmarks. Increasing batch size for better efficiency.',
          expectedGain: '30-40% throughput increase',
          timestamp: new Date()
        });
      }
    }

    // GPU memory optimization
    if (telemetry.gpuLoad > 80) {
      optimizations.push({
        id: Date.now() + 6,
        parameter: 'GPU Memory Pool',
        oldValue: 'Conservative',
        newValue: 'Aggressive',
        reasoning: `GPU highly utilized (${telemetry.gpuLoad.toFixed(0)}%). Enabling aggressive memory pooling.`,
        expectedGain: '10-15% GPU efficiency',
        timestamp: new Date()
      });
    }

    // Connection pool tuning
    if (telemetry.activeWorkflows > 100) {
      optimizations.push({
        id: Date.now() + 7,
        parameter: 'Connection Pool',
        oldValue: '100',
        newValue: '200',
        reasoning: `${telemetry.activeWorkflows} active workflows. Expanding connection pool to reduce wait time.`,
        expectedGain: '20-25% reduced connection latency',
        timestamp: new Date()
      });
    }

    if (optimizations.length > 0) {
      // Apply optimizations automatically
      optimizations.forEach(opt => {
        setTimeout(() => {
          setAppliedOptimizations(prev => [opt, ...prev].slice(0, 10));
          onApplyTuning?.(opt);
          toast.success(`Auto-tuned: ${opt.parameter}`, {
            description: opt.expectedGain
          });
        }, Math.random() * 2000);
      });
    }

    setTuningInProgress(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-72 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={tuningInProgress ? { rotate: [0, 360] } : {}}
        transition={tuningInProgress ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
      >
        <Settings className="w-6 h-6" />
        {appliedOptimizations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
            {appliedOptimizations.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-88 right-6 z-40 w-96 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Auto-Tuning</h3>
                {tuningInProgress && (
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                )}
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-cyan-400 text-xs font-semibold mb-1">Status</div>
              <div className="text-white text-sm">
                {tuningInProgress ? 'Analyzing performance...' : 'Continuously optimizing'}
              </div>
            </div>

            {appliedOptimizations.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Settings className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No optimizations yet</p>
                <p className="text-xs mt-1">Monitoring for opportunities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appliedOptimizations.map((opt) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white mb-1">{opt.parameter}</div>
                        <div className="text-xs text-white/70 mb-2">
                          {opt.oldValue} → {opt.newValue}
                        </div>
                        <p className="text-white/60 text-xs mb-2">{opt.reasoning}</p>
                        <div className="bg-green-500/10 border border-green-500/30 rounded px-2 py-1 text-green-400 text-xs">
                          Expected: {opt.expectedGain}
                        </div>
                        <div className="text-white/40 text-xs mt-2">
                          {opt.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}