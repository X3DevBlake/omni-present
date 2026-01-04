import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertCircle, Lightbulb, DollarSign, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdvancedAnalyticsEngine({ blueprint, telemetry, historicalData, onApplyRecommendation }) {
  const [analytics, setAnalytics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (blueprint && historicalData?.length > 20) {
      performAdvancedAnalysis();
    }
  }, [blueprint, historicalData]);

  const performAdvancedAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `
        Perform advanced analytics on this AI infrastructure:
        
        Blueprint: ${JSON.stringify(blueprint)}
        Historical Telemetry (last 50 points): ${JSON.stringify(historicalData.slice(-50))}
        Current State: ${JSON.stringify(telemetry)}
        
        Provide:
        1. PREDICTIVE INSIGHTS: Forecast performance degradation, capacity issues, or bottlenecks in next 7-30 days
        2. ROOT CAUSE ANALYSIS: Deep dive into any detected anomalies with causal chains
        3. ARCHITECTURAL RECOMMENDATIONS: Suggest major design changes (not micro-optimizations) like:
           - Migration from monolithic to distributed architecture
           - Adding caching layers
           - Database sharding strategies
           - Load balancer configuration changes
        4. COST-BENEFIT ANALYSIS: For each recommendation, provide ROI calculation with implementation cost vs savings
        
        Be specific with metrics, timelines, and quantified impacts.
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            predictiveInsights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prediction: { type: 'string' },
                  probability: { type: 'number' },
                  timeframe: { type: 'string' },
                  impact: { type: 'string' },
                  preventiveMeasures: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            rootCauseAnalysis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  anomaly: { type: 'string' },
                  rootCause: { type: 'string' },
                  contributingFactors: { type: 'array', items: { type: 'string' } },
                  cascadingEffects: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            architecturalRecommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  rationale: { type: 'string' },
                  implementationCost: { type: 'number' },
                  monthlySavings: { type: 'number' },
                  performanceGain: { type: 'string' },
                  roi: { type: 'number' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setAnalytics(analysis);
      setShowPanel(true);
    } catch (error) {
      console.error('Advanced analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-40 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
        transition={isAnalyzing ? { repeat: Infinity, duration: 2 } : {}}
      >
        <TrendingUp className="w-6 h-6" />
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
                  <TrendingUp className="w-6 h-6 text-violet-400" />
                  <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
                </div>
                <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {analytics && (
                <div className="space-y-6">
                  {/* Predictive Insights */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      Predictive Performance Insights
                    </h3>
                    <div className="grid gap-3">
                      {analytics.predictiveInsights?.map((insight, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">{insight.prediction}</div>
                              <div className="text-white/60 text-sm mb-2">
                                Probability: {(insight.probability * 100).toFixed(0)}% • Timeframe: {insight.timeframe}
                              </div>
                              <div className="text-orange-400 text-sm mb-2">Impact: {insight.impact}</div>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-white/50 text-xs mb-1">Preventive Measures:</div>
                            <ul className="space-y-1">
                              {insight.preventiveMeasures?.map((measure, i) => (
                                <li key={i} className="text-white/80 text-sm">• {measure}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Root Cause Analysis */}
                  {analytics.rootCauseAnalysis?.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Root Cause Analysis
                      </h3>
                      <div className="space-y-3">
                        {analytics.rootCauseAnalysis.map((rca, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/30">
                            <div className="text-red-400 font-medium mb-2">{rca.anomaly}</div>
                            <div className="bg-white/5 rounded p-3 mb-2">
                              <div className="text-white/50 text-xs mb-1">Root Cause:</div>
                              <div className="text-white text-sm">{rca.rootCause}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-white/50 text-xs mb-1">Contributing Factors:</div>
                                <ul className="space-y-1">
                                  {rca.contributingFactors?.map((factor, i) => (
                                    <li key={i} className="text-white/70 text-xs">→ {factor}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="text-white/50 text-xs mb-1">Cascading Effects:</div>
                                <ul className="space-y-1">
                                  {rca.cascadingEffects?.map((effect, i) => (
                                    <li key={i} className="text-white/70 text-xs">⚠ {effect}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architectural Recommendations */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Architectural Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analytics.architecturalRecommendations?.map((rec, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${
                          rec.priority === 'high' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30' :
                          rec.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-yellow-500/30' :
                          'bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-blue-500/30'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium">{rec.recommendation}</span>
                                <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                                  rec.priority === 'high' ? 'bg-green-500/30 text-green-400' :
                                  rec.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-400' :
                                  'bg-blue-500/30 text-blue-400'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-white/70 text-sm mb-3">{rec.rationale}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div className="p-2 rounded bg-white/5">
                              <DollarSign className="w-4 h-4 text-red-400 mb-1" />
                              <div className="text-white/50 text-xs">Implementation</div>
                              <div className="text-white text-sm font-semibold">${rec.implementationCost.toLocaleString()}</div>
                            </div>
                            <div className="p-2 rounded bg-white/5">
                              <DollarSign className="w-4 h-4 text-green-400 mb-1" />
                              <div className="text-white/50 text-xs">Monthly Savings</div>
                              <div className="text-white text-sm font-semibold">${rec.monthlySavings.toLocaleString()}</div>
                            </div>
                            <div className="p-2 rounded bg-white/5">
                              <TrendingUp className="w-4 h-4 text-cyan-400 mb-1" />
                              <div className="text-white/50 text-xs">Performance</div>
                              <div className="text-white text-sm font-semibold">{rec.performanceGain}</div>
                            </div>
                            <div className="p-2 rounded bg-white/5">
                              <Lightbulb className="w-4 h-4 text-yellow-400 mb-1" />
                              <div className="text-white/50 text-xs">ROI</div>
                              <div className="text-white text-sm font-semibold">{rec.roi}x</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onApplyRecommendation?.(rec);
                              toast.success('Applying architectural changes...');
                            }}
                            className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                          >
                            Apply Recommendation
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}