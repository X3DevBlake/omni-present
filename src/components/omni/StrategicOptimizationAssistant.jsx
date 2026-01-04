import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Activity, Target } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

export default function StrategicOptimizationAssistant({ 
  historicalTelemetry, 
  simulationHistory, 
  versionHistory, 
  currentBlueprint,
  benchmarkResults,
  onApplyOptimization 
}) {
  const [strategicInsights, setStrategicInsights] = useState([]);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    analyzeStrategicOptimizations();
  }, [historicalTelemetry, simulationHistory, versionHistory, benchmarkResults]);

  const analyzeStrategicOptimizations = () => {
    const insights = [];

    // Analyze historical trends
    if (historicalTelemetry?.length > 10) {
      const recentLoad = historicalTelemetry.slice(-10);
      const avgCPU = recentLoad.reduce((a, b) => a + b.cpuLoad, 0) / recentLoad.length;
      const avgGPU = recentLoad.reduce((a, b) => a + b.gpuLoad, 0) / recentLoad.length;
      const trend = recentLoad[recentLoad.length - 1].cpuLoad - recentLoad[0].cpuLoad;

      // Predict future bottlenecks
      if (trend > 20) {
        insights.push({
          type: 'predictive',
          severity: 'warning',
          title: 'Future Capacity Bottleneck Predicted',
          description: `CPU load trending upward (+${trend.toFixed(0)}% over recent period). At current growth rate, capacity will be exhausted in ~${Math.round(100 / (trend / 10))} measurement cycles.`,
          recommendation: 'Consider architectural refactor: Migrate to distributed processing with 3-4 additional nodes',
          impact: 'Prevents future saturation, ensures 40% headroom',
          timeframe: 'Plan for next 2-4 weeks',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'capacity-expansion',
            nodes: 4,
            reasoning: 'preventive-scaling'
          })
        });
      }

      // Long-term efficiency optimization
      if (avgCPU < 40 && avgGPU < 40) {
        insights.push({
          type: 'efficiency',
          severity: 'info',
          title: 'Over-Provisioned Infrastructure',
          description: `Average utilization: CPU ${avgCPU.toFixed(0)}%, GPU ${avgGPU.toFixed(0)}%. System consistently under-utilized.`,
          recommendation: 'Architectural optimization: Consolidate workloads onto fewer, higher-efficiency nodes. Potential cost savings: 30-40%',
          impact: '$5,000-8,000 monthly savings',
          timeframe: 'Implement gradually over 1 month',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'consolidation',
            targetUtilization: 70,
            costSavings: 35
          })
        });
      }
    }

    // Analyze simulation patterns
    if (simulationHistory?.length > 3) {
      const failures = simulationHistory.filter(s => s.performance?.stability < 70);
      if (failures.length > simulationHistory.length * 0.3) {
        insights.push({
          type: 'reliability',
          severity: 'critical',
          title: 'Fault Tolerance Improvement Required',
          description: `${failures.length} of ${simulationHistory.length} simulations showed stability issues. Current architecture lacks resilience.`,
          recommendation: 'Strategic upgrade: Implement N+2 redundancy architecture with automated failover. Add geographically distributed backup nodes.',
          impact: 'Increases uptime from ~85% to 99.9%',
          timeframe: 'Critical - implement within 1-2 weeks',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'redundancy-upgrade',
            redundancyLevel: 'N+2',
            distributedBackup: true
          })
        });
      }
    }

    // Component upgrade recommendations
    if (currentBlueprint?.configuration?.components) {
      const oldComponents = currentBlueprint.configuration.components.filter(c => 
        c.name?.includes('A100') || c.name?.includes('V100')
      );
      
      if (oldComponents.length > 0) {
        insights.push({
          type: 'upgrade',
          severity: 'info',
          title: 'Next-Generation Component Upgrade Path',
          description: `Detected ${oldComponents.length} previous-gen components. Newer alternatives available with 60-80% performance improvement.`,
          recommendation: 'Phased upgrade plan: Replace A100s with H100s over 3 months. ROI achieved in 8-10 months through improved efficiency.',
          impact: '2.5x performance boost, 40% power reduction',
          timeframe: 'Plan for Q2 2026',
          autoApply: () => ({
            type: 'strategic-upgrade',
            action: 'component-modernization',
            targetComponents: oldComponents.map(c => c.id),
            replacement: 'H100'
          })
        });
      }
    }

    // Benchmark-based optimization recommendations
    if (benchmarkResults?.length > 0) {
      const latestBenchmark = benchmarkResults[benchmarkResults.length - 1];
      
      if (latestBenchmark.metrics?.latency > 50) {
        insights.push({
          type: 'performance',
          severity: 'warning',
          title: 'Latency Optimization Required',
          description: `Benchmark shows ${latestBenchmark.metrics.latency}ms latency, above target of 20ms. Root cause: Network topology and memory hierarchy.`,
          recommendation: 'Strategic refactor: Implement NUMA-aware scheduling, upgrade to 400Gbps InfiniBand fabric, add Redis caching layer.',
          impact: '70% latency reduction, 3x throughput improvement',
          timeframe: 'High priority - 2-3 weeks',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'latency-optimization',
            upgrades: ['infiniband-400g', 'numa-scheduling', 'redis-cache'],
            expectedLatency: 15
          })
        });
      }

      if (latestBenchmark.metrics?.throughput < 1000) {
        insights.push({
          type: 'performance',
          severity: 'critical',
          title: 'Throughput Bottleneck Detected',
          description: `Benchmark throughput ${latestBenchmark.metrics.throughput} req/s is insufficient for production scale (target: 5000 req/s).`,
          recommendation: 'Multi-phase scaling strategy: 1) Add load balancing tier 2) Implement request batching 3) Deploy edge caching 4) Scale to 8+ replicas',
          impact: '5x throughput increase, supports 10M+ daily users',
          timeframe: 'Critical - begin immediately, complete in 4 weeks',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'throughput-scaling',
            phases: ['load-balancer', 'batching', 'edge-cache', 'scale-replicas'],
            targetThroughput: 5000
          })
        });
      }
    }

    // Simulation-driven architectural insights
    if (simulationHistory?.length > 3) {
      const worstCaseSimulation = simulationHistory.reduce((worst, sim) => 
        (sim.performance?.stability || 100) < (worst.performance?.stability || 100) ? sim : worst
      );
      
      if (worstCaseSimulation.performance?.stability < 85) {
        insights.push({
          type: 'reliability',
          severity: 'critical',
          title: 'Resilience Architecture Upgrade Required',
          description: `Worst-case simulation shows ${worstCaseSimulation.performance.stability}% stability under stress. Production requires 99.9% uptime.`,
          recommendation: 'Implement advanced fault tolerance: Active-active replication across 3 regions, circuit breakers, graceful degradation, automated failover with sub-minute recovery.',
          impact: 'Achieves 99.95% uptime SLA, zero data loss guarantee',
          timeframe: 'Mission-critical - 3-4 week implementation',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'resilience-architecture',
            features: ['multi-region', 'circuit-breakers', 'auto-failover'],
            targetUptime: 99.95
          })
        });
      }
    }

    // Workload rebalancing strategy
    if (historicalTelemetry?.length > 5) {
      const imbalanceCount = historicalTelemetry.filter(t => 
        Math.abs(t.cpuLoad - t.gpuLoad) > 30
      ).length;
      
      if (imbalanceCount > historicalTelemetry.length * 0.6) {
        insights.push({
          type: 'architecture',
          severity: 'warning',
          title: 'Persistent Workload Imbalance',
          description: `${Math.round(imbalanceCount / historicalTelemetry.length * 100)}% of time shows CPU/GPU imbalance. Suboptimal architecture for workload patterns.`,
          recommendation: 'Architectural refactor: Implement hybrid CPU+GPU pipeline with intelligent work distribution. Add specialized inference accelerators.',
          impact: '35% throughput improvement, better resource utilization',
          timeframe: 'Major refactor - plan for 6-8 weeks',
          autoApply: () => ({
            type: 'strategic-refactor',
            action: 'workload-architecture',
            pipelineType: 'hybrid',
            addAccelerators: true
          })
        });
      }
    }

    // Cost-effectiveness analysis
    if (currentBlueprint?.estimatedCost) {
      const performancePerDollar = currentBlueprint.estimatedPerformance / currentBlueprint.estimatedCost;
      if (performancePerDollar < 0.1) {
        insights.push({
          type: 'cost',
          severity: 'warning',
          title: 'Cost-Performance Ratio Below Industry Standard',
          description: `Current ratio: ${performancePerDollar.toFixed(3)} TFLOPS/$. Industry benchmark: 0.12-0.15 TFLOPS/$.`,
          recommendation: 'Strategic optimization: Replace underutilized high-end components with mid-tier alternatives. Implement tiered processing architecture.',
          impact: '25-30% cost reduction while maintaining 95% performance',
          timeframe: 'Implement over 2-3 months',
          autoApply: () => ({
            type: 'strategic-optimization',
            action: 'cost-performance-balance',
            targetRatio: 0.13
          })
        });
      }
    }

    setStrategicInsights(insights);
    
    // Generate trend analysis
    if (historicalTelemetry?.length > 5) {
      setTrendAnalysis({
        cpuTrend: calculateTrend(historicalTelemetry.map(t => t.cpuLoad)),
        gpuTrend: calculateTrend(historicalTelemetry.map(t => t.gpuLoad)),
        memoryTrend: calculateTrend(historicalTelemetry.map(t => t.memoryUsage)),
        predictedBottleneck: predictBottleneck(historicalTelemetry)
      });
    }

    if (insights.length > 0 && insights.some(i => i.severity === 'critical')) {
      setShowPanel(true);
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return recentAvg - olderAvg;
  };

  const predictBottleneck = (data) => {
    const cpuTrend = calculateTrend(data.map(t => t.cpuLoad));
    const gpuTrend = calculateTrend(data.map(t => t.gpuLoad));
    const memTrend = calculateTrend(data.map(t => t.memoryUsage));

    if (cpuTrend > 10) return 'CPU capacity within 4-6 weeks';
    if (gpuTrend > 10) return 'GPU saturation within 3-5 weeks';
    if (memTrend > 10) return 'Memory exhaustion within 2-4 weeks';
    return 'No immediate bottlenecks predicted';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'from-red-500/20 to-red-500/5 border-red-500/40';
    if (severity === 'warning') return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/40';
    return 'from-blue-500/20 to-blue-500/5 border-blue-500/40';
  };

  const getTypeIcon = (type) => {
    if (type === 'predictive') return Activity;
    if (type === 'efficiency') return Target;
    if (type === 'reliability') return AlertCircle;
    if (type === 'upgrade') return TrendingUp;
    return Lightbulb;
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-24 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-6 h-6" />
        {strategicInsights.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
            {strategicInsights.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-40 right-6 z-40 w-96 max-h-[70vh] overflow-y-auto"
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Strategic Intelligence</h3>
                </div>
              </div>

              {trendAnalysis && (
                <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="text-purple-400 text-xs font-semibold mb-2">Trend Analysis</div>
                  <div className="space-y-1 text-xs text-white/70">
                    <div>CPU Trend: {trendAnalysis.cpuTrend > 0 ? '↑' : '↓'} {Math.abs(trendAnalysis.cpuTrend).toFixed(1)}%</div>
                    <div>GPU Trend: {trendAnalysis.gpuTrend > 0 ? '↑' : '↓'} {Math.abs(trendAnalysis.gpuTrend).toFixed(1)}%</div>
                    <div className="pt-1 border-t border-white/10 text-yellow-400">
                      Prediction: {trendAnalysis.predictedBottleneck}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {strategicInsights.map((insight, idx) => {
                  const Icon = getTypeIcon(insight.type);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border bg-gradient-to-br ${getSeverityColor(insight.severity)}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-1">{insight.title}</h4>
                          <p className="text-white/70 text-xs mb-2">{insight.description}</p>
                          <div className="bg-white/10 rounded-lg p-2 mb-2">
                            <div className="text-white text-xs font-medium mb-1">Recommendation:</div>
                            <div className="text-white/80 text-xs">{insight.recommendation}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-white/50">Impact:</span>
                              <div className="text-green-400">{insight.impact}</div>
                            </div>
                            <div>
                              <span className="text-white/50">Timeline:</span>
                              <div className="text-cyan-400">{insight.timeframe}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onApplyOptimization?.(insight.autoApply());
                          toast.success(`Strategic optimization applied: ${insight.title}`);
                        }}
                        className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                      >
                        Implement Strategy
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}