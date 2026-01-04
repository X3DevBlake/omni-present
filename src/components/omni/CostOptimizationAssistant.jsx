import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function CostOptimizationAssistant({ blueprint, historicalTelemetry, benchmarkResults, onApplyOptimization }) {
  const [optimizations, setOptimizations] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState(0);

  useEffect(() => {
    analyzeCostOptimizations();
  }, [blueprint, historicalTelemetry, benchmarkResults]);

  const analyzeCostOptimizations = () => {
    const opts = [];
    let totalSavings = 0;

    if (!blueprint) return;

    // Component rightsizing
    if (historicalTelemetry?.length > 5) {
      const avgUtilization = historicalTelemetry.reduce((a, b) => 
        a + (b.cpuLoad + b.gpuLoad) / 2, 0
      ) / historicalTelemetry.length;

      if (avgUtilization < 40) {
        const savings = Math.round(blueprint.estimatedCost * 0.35);
        totalSavings += savings;
        opts.push({
          type: 'rightsizing',
          title: 'Downsize Over-Provisioned Components',
          description: `Average utilization ${Math.round(avgUtilization)}%. Reduce to medium-tier instances.`,
          savings: savings,
          impact: 'Low risk - gradual migration',
          action: 'Migrate to cost-optimized instance types',
          autoApply: () => ({
            type: 'cost-optimization',
            action: 'rightsize-components',
            targetUtilization: 65,
            estimatedSavings: savings
          })
        });
      }
    }

    // Storage tier optimization
    if (blueprint.configuration?.components?.some(c => c.type === 'storage')) {
      const savings = Math.round(blueprint.estimatedCost * 0.15);
      totalSavings += savings;
      opts.push({
        type: 'storage',
        title: 'Optimize Storage Tiers',
        description: 'Move infrequently accessed data to cold storage. Implement lifecycle policies.',
        savings: savings,
        impact: 'Zero performance impact',
        action: 'Configure tiered storage with auto-archival',
        autoApply: () => ({
          type: 'cost-optimization',
          action: 'storage-tiering',
          coldStorageThreshold: 30,
          estimatedSavings: savings
        })
      });
    }

    // Spot instances for non-critical workloads
    const spotSavings = Math.round(blueprint.estimatedCost * 0.60);
    totalSavings += spotSavings;
    opts.push({
      type: 'spot-instances',
      title: 'Use Spot Instances for Training',
      description: 'Run non-critical training workloads on spot instances at 60-70% discount.',
      savings: spotSavings,
      impact: 'Requires checkpoint/restart capability',
      action: 'Migrate training workloads to spot with auto-checkpointing',
      autoApply: () => ({
        type: 'cost-optimization',
        action: 'enable-spot-instances',
        workloadType: 'training',
        fallbackStrategy: 'on-demand',
        estimatedSavings: spotSavings
      })
    });

    // Reserved capacity
    if (historicalTelemetry?.length > 10) {
      const consistentLoad = historicalTelemetry.every(t => t.cpuLoad > 40);
      if (consistentLoad) {
        const savings = Math.round(blueprint.estimatedCost * 0.40);
        totalSavings += savings;
        opts.push({
          type: 'reserved',
          title: 'Purchase Reserved Capacity',
          description: 'Consistent baseline load detected. 1-year commitment saves 40%.',
          savings: savings,
          impact: '1-year commitment required',
          action: 'Convert to reserved instances',
          autoApply: () => ({
            type: 'cost-optimization',
            action: 'reserved-instances',
            commitment: '1-year',
            percentage: 70,
            estimatedSavings: savings
          })
        });
      }
    }

    // Idle resource shutdown
    const idleSavings = Math.round(blueprint.estimatedCost * 0.20);
    totalSavings += idleSavings;
    opts.push({
      type: 'automation',
      title: 'Auto-Shutdown Idle Resources',
      description: 'Automatically stop dev/test environments during off-hours.',
      savings: idleSavings,
      impact: 'Dev/test only - production unaffected',
      action: 'Configure auto-shutdown schedules',
      autoApply: () => ({
        type: 'cost-optimization',
        action: 'idle-shutdown',
        schedule: { weekdays: '19:00-07:00', weekends: 'all' },
        estimatedSavings: idleSavings
      })
    });

    setOptimizations(opts);
    setEstimatedSavings(totalSavings);
  };

  const getTypeColor = (type) => {
    const colors = {
      rightsizing: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      storage: 'text-green-400 bg-green-500/10 border-green-500/30',
      'spot-instances': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      reserved: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      automation: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    };
    return colors[type] || colors.automation;
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-40 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <DollarSign className="w-6 h-6" />
        {estimatedSavings > 0 && (
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-yellow-500 text-white text-xs font-bold">
            ${(estimatedSavings / 1000).toFixed(0)}k
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-56 right-6 z-40 w-96 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">Cost Optimization</h3>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="text-green-400 text-xs font-semibold mb-1">Total Potential Savings</div>
              <div className="text-white text-2xl font-bold">${estimatedSavings.toLocaleString()}<span className="text-sm font-normal">/month</span></div>
            </div>

            <div className="space-y-3">
              {optimizations.map((opt, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border ${getTypeColor(opt.type)}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <TrendingDown className="w-5 h-5 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm mb-1">{opt.title}</h4>
                      <p className="text-white/70 text-xs mb-2">{opt.description}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white/50">Savings:</span>
                        <span className="text-green-400 font-bold">${opt.savings.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white/50">Impact:</span>
                        <span className="text-white/70">{opt.impact}</span>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2 mb-2">
                        <div className="text-white text-xs">{opt.action}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyOptimization?.(opt.autoApply());
                      toast.success(`Applied: ${opt.title}`);
                    }}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                  >
                    Apply Optimization
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}