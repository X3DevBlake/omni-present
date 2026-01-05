import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIAdvancedOptimizer({ 
  blueprint, 
  historicalData, 
  monitoringData, 
  costData,
  onApplyOptimization,
  onClose 
}) {
  const [optimizations, setOptimizations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoApply, setAutoApply] = useState(false);

  useEffect(() => {
    analyzeOptimizations();
    const interval = setInterval(analyzeOptimizations, 30000);
    return () => clearInterval(interval);
  }, [blueprint, historicalData]);

  const analyzeOptimizations = async () => {
    if (!blueprint) return;
    
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Perform advanced AI-driven blueprint optimization with feedback loops.
          
          Current Blueprint: ${JSON.stringify(blueprint)}
          Historical Performance Data: ${JSON.stringify(historicalData?.slice(-10))}
          Monitoring Metrics: ${JSON.stringify(monitoringData)}
          Cost Data: ${JSON.stringify(costData)}
          
          FEEDBACK LOOPS - Analyze impact from:
          1. AI Model Marketplace: Recent model deployments and their performance/cost impact
          2. CI/CD Pipeline: Deployment success rates, rollback frequency, performance changes
          3. Multi-Cloud Metrics: Cost and performance differences across AWS, Azure, GCP
          4. User-Defined Goals: Risk tolerance (low/medium/high), performance targets, budget constraints
          
          Provide comprehensive optimization strategy:
          1. RESOURCE OPTIMIZATION: Multi-cloud reallocation based on actual deployment results
          2. ARCHITECTURAL CHANGES: Recommendations from CI/CD feedback and marketplace trends
          3. MODEL OPTIMIZATION: Fine-tune or replace models based on performance feedback
          4. COST REDUCTION: Apply learnings from successful deployments
          5. PERFORMANCE ENHANCEMENT: Based on real-world monitoring data
          6. AUTOMATED ACTIONS: What can be auto-applied based on risk tolerance
          
          For each optimization:
          - Specific action with evidence from feedback loops
          - Expected impact with confidence based on historical data
          - Risk level and user risk tolerance alignment
          - Auto-apply eligibility based on risk and confidence
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            resourceOptimizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  provider: { type: 'string' },
                  expectedCostReduction: { type: 'number' },
                  expectedPerformanceGain: { type: 'number' },
                  riskLevel: { type: 'string' },
                  priority: { type: 'number' }
                }
              }
            },
            hyperparameterTuning: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  parameter: { type: 'string' },
                  currentValue: { type: 'string' },
                  recommendedValue: { type: 'string' },
                  reasoning: { type: 'string' },
                  expectedImprovement: { type: 'string' }
                }
              }
            },
            architecturalChanges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  change: { type: 'string' },
                  impact: { type: 'string' },
                  complexity: { type: 'string' },
                  priority: { type: 'number' }
                }
              }
            },
            predictiveScaling: {
              type: 'object',
              properties: {
                nextPeakTime: { type: 'string' },
                recommendedScaleUp: { type: 'string' },
                confidenceLevel: { type: 'number' }
              }
            },
            feedbackInsights: {
              type: 'object',
              properties: {
                marketplaceImpact: { type: 'string' },
                cicdLearnings: { type: 'string' },
                multiCloudComparison: { type: 'string' }
              }
            },
            overallSavings: { type: 'number' },
            overallPerformanceGain: { type: 'number' },
            confidenceScore: { type: 'number' }
          }
        }
      });

      setOptimizations(result);

      // Auto-apply low-risk, high-priority optimizations if enabled
      if (autoApply) {
        const lowRiskOptimizations = result.resourceOptimizations?.filter(
          opt => opt.riskLevel === 'low' && opt.priority > 80
        ) || [];

        for (const opt of lowRiskOptimizations) {
          await onApplyOptimization?.(opt);
          toast.success(`Auto-applied: ${opt.action}`);
        }
      }

    } catch (error) {
      console.error('Optimization analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (optimization) => {
    await onApplyOptimization?.(optimization);
    toast.success('Optimization applied successfully');
  };

  if (!optimizations) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-30 p-4 rounded-xl bg-black/90 border border-purple-500/30"
      >
        <div className="flex items-center gap-2 text-purple-400">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Analyzing optimizations...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Advanced Optimizer</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
                className="rounded"
              />
              Auto-apply low-risk optimizations
            </label>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Overall Impact */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Cost Savings</span>
            </div>
            <div className="text-2xl font-bold text-white">{optimizations.overallSavings}%</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold">Performance Gain</span>
            </div>
            <div className="text-2xl font-bold text-white">{optimizations.overallPerformanceGain}%</div>
          </div>
        </div>

        {/* Resource Optimizations */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Multi-Cloud Resource Optimization</h3>
          <div className="space-y-2">
            {optimizations.resourceOptimizations?.map((opt, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{opt.action}</div>
                    <div className="text-white/60 text-sm mb-2">Provider: {opt.provider}</div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-400">Cost: -{opt.expectedCostReduction}%</span>
                      <span className="text-cyan-400">Performance: +{opt.expectedPerformanceGain}%</span>
                      <span className={`${
                        opt.riskLevel === 'low' ? 'text-green-400' :
                        opt.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        Risk: {opt.riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                      Priority: {opt.priority}
                    </span>
                    <button
                      onClick={() => applyOptimization(opt)}
                      className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hyperparameter Tuning */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Hyperparameter Tuning</h3>
          <div className="space-y-2">
            {optimizations.hyperparameterTuning?.map((tune, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{tune.parameter}</div>
                    <div className="text-sm text-white/60 mb-2">
                      <span className="text-red-400">{tune.currentValue}</span> → <span className="text-green-400">{tune.recommendedValue}</span>
                    </div>
                    <div className="text-xs text-white/70 mb-1">{tune.reasoning}</div>
                    <div className="text-xs text-cyan-400">Expected: {tune.expectedImprovement}</div>
                  </div>
                  <button
                    onClick={() => applyOptimization(tune)}
                    className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architectural Changes */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Architectural Improvements</h3>
          <div className="space-y-2">
            {optimizations.architecturalChanges?.map((change, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{change.change}</div>
                    <div className="text-sm text-white/70 mb-2">{change.impact}</div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-white/60">Complexity: {change.complexity}</span>
                      <span className="text-orange-400">Priority: {change.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => applyOptimization(change)}
                    className="px-3 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Scaling */}
        {optimizations.predictiveScaling && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <h3 className="text-blue-400 font-semibold mb-3">Predictive Scaling Recommendation</h3>
            <div className="text-white/80 text-sm mb-2">
              Next peak expected: <span className="text-blue-400">{optimizations.predictiveScaling.nextPeakTime}</span>
            </div>
            <div className="text-white/80 text-sm mb-2">
              Recommended action: <span className="text-blue-400">{optimizations.predictiveScaling.recommendedScaleUp}</span>
            </div>
            <div className="text-white/60 text-xs">
              Confidence: {optimizations.predictiveScaling.confidenceLevel}%
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}