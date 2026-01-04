import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AnomalyDetectionSystem({ telemetry, historicalData, onAnomalyDetected }) {
  const [anomalies, setAnomalies] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  useEffect(() => {
    if (telemetry && historicalData?.length > 10) {
      analyzeForAnomalies();
    }
  }, [telemetry, historicalData]);

  const analyzeForAnomalies = () => {
    setAnalysisRunning(true);
    const detected = [];

    // Calculate baselines from historical data
    const avgCPU = historicalData.reduce((a, b) => a + b.cpuLoad, 0) / historicalData.length;
    const avgGPU = historicalData.reduce((a, b) => a + b.gpuLoad, 0) / historicalData.length;
    const avgMemory = historicalData.reduce((a, b) => a + b.memoryUsage, 0) / historicalData.length;
    
    const stdDevCPU = Math.sqrt(historicalData.reduce((a, b) => a + Math.pow(b.cpuLoad - avgCPU, 2), 0) / historicalData.length);
    const stdDevGPU = Math.sqrt(historicalData.reduce((a, b) => a + Math.pow(b.gpuLoad - avgGPU, 2), 0) / historicalData.length);

    // Spike detection (>3 standard deviations)
    if (Math.abs(telemetry.cpuLoad - avgCPU) > stdDevCPU * 3) {
      detected.push({
        id: Date.now() + 1,
        type: 'spike',
        severity: 'critical',
        metric: 'CPU Load',
        current: telemetry.cpuLoad,
        expected: avgCPU,
        deviation: Math.abs(telemetry.cpuLoad - avgCPU),
        description: `CPU load ${telemetry.cpuLoad.toFixed(1)}% is ${(Math.abs(telemetry.cpuLoad - avgCPU) / avgCPU * 100).toFixed(0)}% above baseline`,
        recommendation: 'Check for runaway processes or DDoS attack. Consider emergency scaling.',
        timestamp: new Date()
      });
    }

    if (Math.abs(telemetry.gpuLoad - avgGPU) > stdDevGPU * 3) {
      detected.push({
        id: Date.now() + 2,
        type: 'spike',
        severity: 'warning',
        metric: 'GPU Load',
        current: telemetry.gpuLoad,
        expected: avgGPU,
        deviation: Math.abs(telemetry.gpuLoad - avgGPU),
        description: `GPU utilization spike detected: ${telemetry.gpuLoad.toFixed(1)}% (baseline: ${avgGPU.toFixed(1)}%)`,
        recommendation: 'Verify workload distribution. May indicate batch processing overload.',
        timestamp: new Date()
      });
    }

    // Unusual pattern detection
    const recentTrend = historicalData.slice(-5).reduce((a, b) => a + b.cpuLoad, 0) / 5;
    const olderTrend = historicalData.slice(-10, -5).reduce((a, b) => a + b.cpuLoad, 0) / 5;
    
    if (recentTrend > olderTrend * 1.5) {
      detected.push({
        id: Date.now() + 3,
        type: 'trend',
        severity: 'warning',
        metric: 'CPU Trend',
        description: `Unusual upward trend: ${((recentTrend / olderTrend - 1) * 100).toFixed(0)}% increase over baseline`,
        recommendation: 'Investigate recent deployments or configuration changes. Potential memory leak or resource exhaustion.',
        timestamp: new Date()
      });
    }

    // Oscillation detection
    const oscillations = historicalData.slice(-10).reduce((count, curr, idx, arr) => {
      if (idx === 0) return 0;
      const diff = curr.cpuLoad - arr[idx - 1].cpuLoad;
      const prevDiff = idx > 1 ? arr[idx - 1].cpuLoad - arr[idx - 2].cpuLoad : 0;
      return diff * prevDiff < 0 ? count + 1 : count;
    }, 0);

    if (oscillations > 6) {
      detected.push({
        id: Date.now() + 4,
        type: 'oscillation',
        severity: 'warning',
        metric: 'System Stability',
        description: 'Rapid oscillation detected in resource utilization',
        recommendation: 'Check auto-scaling configuration. May be experiencing thrashing or control loop instability.',
        timestamp: new Date()
      });
    }

    // Error rate anomaly
    if (telemetry.dataFlowRate < historicalData[historicalData.length - 1].dataFlowRate * 0.5) {
      detected.push({
        id: Date.now() + 5,
        type: 'degradation',
        severity: 'critical',
        metric: 'Data Flow Rate',
        current: telemetry.dataFlowRate,
        expected: historicalData[historicalData.length - 1].dataFlowRate,
        description: 'Sudden drop in data throughput detected',
        recommendation: 'URGENT: Check network connectivity, database connections, and service health. Possible partial outage.',
        timestamp: new Date()
      });
    }

    if (detected.length > 0) {
      setAnomalies(prev => [...detected, ...prev].slice(0, 20));
      setShowPanel(true);
      
      // Alert for critical anomalies
      const critical = detected.filter(a => a.severity === 'critical');
      if (critical.length > 0) {
        toast.error(`${critical.length} critical anomalies detected`, {
          description: critical[0].description
        });
        onAnomalyDetected?.(detected);
      }
    }

    setAnalysisRunning(false);
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'from-red-500/20 to-red-500/5 border-red-500/60 text-red-400';
    if (severity === 'warning') return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/60 text-yellow-400';
    return 'from-blue-500/20 to-blue-500/5 border-blue-500/60 text-blue-400';
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-56 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={analysisRunning ? { scale: [1, 1.1, 1] } : {}}
        transition={analysisRunning ? { repeat: Infinity, duration: 1.5 } : {}}
      >
        <AlertTriangle className="w-6 h-6" />
        {anomalies.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {anomalies.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-72 right-6 z-40 w-96 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-semibold">Anomaly Detection</h3>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {anomalies.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No anomalies detected</p>
                <p className="text-xs mt-1">System operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border bg-gradient-to-br ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{anomaly.metric}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            anomaly.severity === 'critical' ? 'bg-red-500/30' : 'bg-yellow-500/30'
                          }`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-white/80 text-xs mb-2">{anomaly.description}</p>
                        {anomaly.current !== undefined && (
                          <div className="text-xs mb-2">
                            <span className="text-white/50">Current:</span> {anomaly.current.toFixed(1)}
                            {anomaly.expected !== undefined && (
                              <> | <span className="text-white/50">Expected:</span> {anomaly.expected.toFixed(1)}</>
                            )}
                          </div>
                        )}
                        <div className="bg-white/10 rounded p-2 text-xs text-white/80">
                          <span className="text-white/50">Action:</span> {anomaly.recommendation}
                        </div>
                        <div className="text-white/40 text-xs mt-2">
                          {anomaly.timestamp.toLocaleTimeString()}
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