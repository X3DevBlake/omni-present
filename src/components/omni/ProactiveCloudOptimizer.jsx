import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, TrendingUp, Zap, DollarSign, Activity, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProactiveCloudOptimizer({ blueprint, historicalUsage, onOptimize }) {
  const [optimization, setOptimization] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoScale, setAutoScale] = useState(false);

  useEffect(() => {
    analyzeAndOptimize();
    if (autoScale) {
      const interval = setInterval(analyzeAndOptimize, 60000);
      return () => clearInterval(interval);
    }
  }, [blueprint, historicalUsage, autoScale]);

  const analyzeAndOptimize = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `
        Analyze multi-cloud resource optimization:
        
        Blueprint: ${JSON.stringify(blueprint)}
        Historical Usage: ${JSON.stringify(historicalUsage?.slice(-100))}
        
        Provide:
        1. DEMAND FORECAST: Predict resource needs for next 7 days
        2. AUTO-SCALING STRATEGY: When and how to scale resources
        3. CROSS-CLOUD OPTIMIZATION: Best provider for each workload considering real-time pricing
        4. COST-BENEFIT ANALYSIS: Expected savings vs performance impact
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            forecast: {
              type: 'object',
              properties: {
                expectedLoad: { type: 'string' },
                peakTimes: { type: 'array', items: { type: 'string' } },
                recommendedCapacity: { type: 'string' }
              }
            },
            scalingActions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  trigger: { type: 'string' },
                  resource: { type: 'string' },
                  adjustment: { type: 'string' }
                }
              }
            },
            cloudOptimization: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  workload: { type: 'string' },
                  currentProvider: { type: 'string' },
                  recommendedProvider: { type: 'string' },
                  monthlySavings: { type: 'number' },
                  performanceImpact: { type: 'string' }
                }
              }
            },
            totalMonthlySavings: { type: 'number' }
          }
        }
      });

      setOptimization(result);

      if (autoScale && result.scalingActions?.length > 0) {
        executeOptimizations(result.scalingActions);
      }
    } catch (error) {
      console.error('Optimization analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeOptimizations = async (actions) => {
    for (const action of actions) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Auto-scaled: ${action.action}`);
      onOptimize?.(action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Proactive Cloud Optimizer</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScale}
            onChange={(e) => setAutoScale(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-white/70 text-sm">Auto-scale</span>
        </label>
      </div>

      {optimization && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5">
            <h4 className="text-cyan-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Demand Forecast (7 days)
            </h4>
            <div className="text-white/80 text-sm mb-2">{optimization.forecast?.expectedLoad}</div>
            <div className="text-white/60 text-xs">
              Peak times: {optimization.forecast?.peakTimes?.join(', ')}
            </div>
            <div className="mt-2 text-green-400 text-sm">
              Recommended: {optimization.forecast?.recommendedCapacity}
            </div>
          </div>

          <div>
            <h4 className="text-white/80 text-sm font-semibold mb-2">Scaling Actions</h4>
            <div className="space-y-2">
              {optimization.scalingActions?.map((action, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{action.action}</span>
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-white/60 text-xs mb-1">Trigger: {action.trigger}</div>
                  <div className="text-white/60 text-xs">{action.resource}: {action.adjustment}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white/80 text-sm font-semibold mb-2">Cross-Cloud Optimization</h4>
            <div className="space-y-2 mb-3">
              {optimization.cloudOptimization?.map((opt, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="text-white text-sm font-medium mb-1">{opt.workload}</div>
                  <div className="text-white/70 text-xs mb-2">
                    {opt.currentProvider} → {opt.recommendedProvider}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs">${opt.monthlySavings}/mo saved</span>
                    <span className="text-white/60 text-xs">{opt.performanceImpact}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 text-sm font-semibold">Total Monthly Savings</span>
                <span className="text-white text-xl font-bold">
                  ${optimization.totalMonthlySavings?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {!autoScale && (
            <button
              onClick={() => executeOptimizations(optimization.scalingActions || [])}
              className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm"
            >
              Apply Optimizations Now
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}