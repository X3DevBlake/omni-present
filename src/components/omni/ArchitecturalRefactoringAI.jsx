import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, TrendingUp, DollarSign, Zap, X, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ArchitecturalRefactoringAI({ blueprint, simulationHistory, telemetryHistory, onApplyRefactoring }) {
  const [refactoringStrategies, setRefactoringStrategies] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (blueprint && simulationHistory?.length > 3 && telemetryHistory?.length > 50) {
      analyzeArchitecture();
    }
  }, [blueprint, simulationHistory, telemetryHistory]);

  const analyzeArchitecture = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `
        Perform deep architectural analysis for fundamental refactoring:
        
        Current Blueprint: ${JSON.stringify(blueprint)}
        Simulation History: ${JSON.stringify(simulationHistory.slice(-5))}
        Telemetry Trends: ${JSON.stringify(telemetryHistory.slice(-100))}
        
        Analyze and recommend MAJOR architectural shifts:
        
        1. MICROSERVICES TRANSITION: Should this system adopt microservices? Analyze monolithic bottlenecks.
        2. EVENT-DRIVEN ARCHITECTURE: Would event-driven patterns improve scalability and resilience?
        3. HARDWARE TRANSITIONS: Recommend GPU upgrades (A100→H100, V100→A100) based on workload characteristics
        4. DISTRIBUTED COMPUTING: Should we move to multi-node distributed training/inference?
        5. SERVERLESS PATTERNS: Are there components that would benefit from serverless architecture?
        6. DATA TIER REFACTORING: Recommend database sharding, caching layers, or NoSQL transitions
        
        For each recommendation:
        - Provide 3-5 year cost-benefit analysis
        - Implementation complexity and timeline
        - Performance improvement projections
        - Risk assessment
        - Migration strategy
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  strategy: { type: 'string' },
                  currentState: { type: 'string' },
                  proposedState: { type: 'string' },
                  rationale: { type: 'string' },
                  implementationComplexity: { type: 'string' },
                  timeline: { type: 'string' },
                  costBenefitAnalysis: {
                    type: 'object',
                    properties: {
                      implementationCost: { type: 'number' },
                      year1Savings: { type: 'number' },
                      year3Savings: { type: 'number' },
                      year5Savings: { type: 'number' },
                      roi: { type: 'number' },
                      breakEvenMonths: { type: 'number' }
                    }
                  },
                  performanceImpact: {
                    type: 'object',
                    properties: {
                      throughputIncrease: { type: 'string' },
                      latencyReduction: { type: 'string' },
                      scalabilityImprovement: { type: 'string' }
                    }
                  },
                  risks: { type: 'array', items: { type: 'string' } },
                  migrationStrategy: {
                    type: 'object',
                    properties: {
                      phases: { type: 'array', items: { type: 'string' } },
                      rollbackPlan: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setRefactoringStrategies(analysis);
      setShowPanel(true);
    } catch (error) {
      console.error('Architectural analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplexityColor = (complexity) => {
    if (complexity === 'low') return 'text-green-400 bg-green-500/20';
    if (complexity === 'medium') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-56 left-6 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
        transition={isAnalyzing ? { repeat: Infinity, duration: 2 } : {}}
      >
        <GitBranch className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Architectural Refactoring Strategies</h2>
                </div>
                <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {refactoringStrategies && (
                <div className="space-y-6">
                  {refactoringStrategies.recommendations?.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/30"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white text-xl font-bold mb-2">{rec.strategy}</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${getComplexityColor(rec.implementationComplexity)}`}>
                              {rec.implementationComplexity} complexity
                            </span>
                            <span className="text-white/60 text-sm">Timeline: {rec.timeline}</span>
                          </div>
                        </div>
                      </div>

                      {/* Current vs Proposed */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="text-red-400 text-sm mb-2">Current State</div>
                          <div className="text-white">{rec.currentState}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="text-green-400 text-sm mb-2">Proposed State</div>
                          <div className="text-white">{rec.proposedState}</div>
                        </div>
                      </div>

                      {/* Rationale */}
                      <div className="mb-4 p-4 rounded-lg bg-white/5">
                        <div className="text-white/60 text-sm mb-1">Strategic Rationale</div>
                        <p className="text-white/90">{rec.rationale}</p>
                      </div>

                      {/* Cost-Benefit Analysis */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Cost-Benefit Analysis (5-Year Projection)
                        </h4>
                        <div className="grid grid-cols-5 gap-3">
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="text-red-400 text-xs mb-1">Implementation</div>
                            <div className="text-white font-bold">${rec.costBenefitAnalysis?.implementationCost?.toLocaleString()}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div className="text-green-400 text-xs mb-1">Year 1 Savings</div>
                            <div className="text-white font-bold">${rec.costBenefitAnalysis?.year1Savings?.toLocaleString()}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div className="text-green-400 text-xs mb-1">Year 3 Savings</div>
                            <div className="text-white font-bold">${rec.costBenefitAnalysis?.year3Savings?.toLocaleString()}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div className="text-green-400 text-xs mb-1">Year 5 Savings</div>
                            <div className="text-white font-bold">${rec.costBenefitAnalysis?.year5Savings?.toLocaleString()}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                            <div className="text-cyan-400 text-xs mb-1">ROI / Break-even</div>
                            <div className="text-white font-bold">{rec.costBenefitAnalysis?.roi}x</div>
                            <div className="text-white/60 text-xs">{rec.costBenefitAnalysis?.breakEvenMonths}mo</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Impact */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Performance Impact
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-white/5">
                            <div className="text-white/60 text-xs mb-1">Throughput</div>
                            <div className="text-green-400 font-semibold">{rec.performanceImpact?.throughputIncrease}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5">
                            <div className="text-white/60 text-xs mb-1">Latency</div>
                            <div className="text-green-400 font-semibold">{rec.performanceImpact?.latencyReduction}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5">
                            <div className="text-white/60 text-xs mb-1">Scalability</div>
                            <div className="text-green-400 font-semibold">{rec.performanceImpact?.scalabilityImprovement}</div>
                          </div>
                        </div>
                      </div>

                      {/* Migration Strategy */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2">Migration Strategy</h4>
                        <div className="space-y-2">
                          {rec.migrationStrategy?.phases?.map((phase, i) => (
                            <div key={i} className="flex items-start gap-2 text-white/70 text-sm">
                              <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5" />
                              Phase {i + 1}: {phase}
                            </div>
                          ))}
                        </div>
                        {rec.migrationStrategy?.rollbackPlan && (
                          <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                            <div className="text-yellow-400 text-xs mb-1">Rollback Plan:</div>
                            <div className="text-white/80 text-xs">{rec.migrationStrategy.rollbackPlan}</div>
                          </div>
                        )}
                      </div>

                      {/* Risks */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2">Risk Assessment</h4>
                        <div className="space-y-1">
                          {rec.risks?.map((risk, i) => (
                            <div key={i} className="flex items-start gap-2 text-orange-400 text-sm">
                              <span className="mt-1">⚠</span>
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          onApplyRefactoring?.(rec);
                          toast.success(`Initiating ${rec.strategy} refactoring`);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Initiate Refactoring
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}