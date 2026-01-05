import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Network, FileText, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIObservabilityDashboard({ deployedServices, onClose }) {
  const [insights, setInsights] = useState(null);
  const [dependencyMap, setDependencyMap] = useState(null);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    analyzeSystem();
  }, [deployedServices]);

  const analyzeSystem = async () => {
    setIsAnalyzing(true);

    try {
      // Predictive Analytics
      const predictiveResult = await base44.integrations.Core.InvokeLLM({
        prompt: `
          AI-powered predictive analytics for resource utilization.
          
          Deployed Services: ${JSON.stringify(deployedServices)}
          
          Analyze and predict:
          1. RESOURCE UTILIZATION: Forecast CPU, memory, storage needs for next 7-30 days
          2. CAPACITY PLANNING: When will current resources be insufficient
          3. PERFORMANCE BOTTLENECKS: Predict potential slowdowns before they occur
          4. SCALING RECOMMENDATIONS: Proactive scaling actions
          5. COST PROJECTIONS: Budget impact of predicted resource needs
          
          Provide actionable predictions with confidence levels.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            resourceForecasts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resource: { type: 'string' },
                  currentUsage: { type: 'number' },
                  predictedUsage: { type: 'number' },
                  daysUntilCapacity: { type: 'number' },
                  confidence: { type: 'number' }
                }
              }
            },
            bottleneckPredictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  predictedIssue: { type: 'string' },
                  timeframe: { type: 'string' },
                  preventativeAction: { type: 'string' }
                }
              }
            },
            scalingRecommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Dependency Map Analysis
      const dependencyResult = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Create AI-driven dependency map and critical path analysis.
          
          Services: ${JSON.stringify(deployedServices)}
          
          Analyze:
          1. SERVICE DEPENDENCIES: Map relationships between services
          2. CRITICAL PATHS: Identify paths where failure impacts entire system
          3. SINGLE POINTS OF FAILURE: Services with no redundancy
          4. CASCADING FAILURE RISKS: How failures propagate
          5. RESILIENCE SCORE: Overall system resilience
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  to: { type: 'string' },
                  criticality: { type: 'string' }
                }
              }
            },
            criticalPaths: { type: 'array', items: { type: 'string' } },
            singlePointsOfFailure: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  impact: { type: 'string' },
                  recommendation: { type: 'string' }
                }
              }
            },
            resilienceScore: { type: 'number' }
          }
        }
      });

      // Executive Summary
      const summaryResult = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Generate natural language executive summary for system health.
          
          Predictive Analytics: ${JSON.stringify(predictiveResult)}
          Dependency Analysis: ${JSON.stringify(dependencyResult)}
          
          Create executive-level summary:
          1. SYSTEM HEALTH OVERVIEW: Current state in plain language
          2. KEY TRENDS: Important patterns and changes
          3. POTENTIAL RISKS: Critical issues requiring attention
          4. RESOURCE NEEDS: Budget and capacity requirements
          5. STRATEGIC RECOMMENDATIONS: High-level actions
          
          Write for executives, not technical staff. Focus on business impact.
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            overallHealth: { type: 'string' },
            keyInsights: { type: 'array', items: { type: 'string' } },
            criticalRisks: { type: 'array', items: { type: 'string' } },
            budgetImpact: { type: 'string' },
            strategicActions: { type: 'array', items: { type: 'string' } },
            executiveSummary: { type: 'string' }
          }
        }
      });

      setInsights(predictiveResult);
      setDependencyMap(dependencyResult);
      setExecutiveSummary(summaryResult);
    } catch (error) {
      console.error('Observability analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Observability Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-white/70">Analyzing system with AI...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Executive Summary */}
            {executiveSummary && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold text-lg">Executive Summary</h3>
                </div>
                <div className="text-white/80 text-sm mb-4 leading-relaxed">
                  {executiveSummary.executiveSummary}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-black/30">
                    <div className="text-white/50 text-xs mb-2">Overall Health</div>
                    <div className="text-white font-medium">{executiveSummary.overallHealth}</div>
                  </div>
                  <div className="p-3 rounded bg-black/30">
                    <div className="text-white/50 text-xs mb-2">Budget Impact</div>
                    <div className="text-white font-medium">{executiveSummary.budgetImpact}</div>
                  </div>
                </div>
                {executiveSummary.criticalRisks?.length > 0 && (
                  <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20">
                    <div className="text-red-400 text-sm font-semibold mb-2">Critical Risks</div>
                    {executiveSummary.criticalRisks.map((risk, idx) => (
                      <div key={idx} className="text-white/70 text-xs mb-1">⚠️ {risk}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Predictive Analytics */}
            {insights && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Predictive Resource Analytics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {insights.resourceForecasts?.map((forecast, idx) => (
                    <div key={idx} className="p-4 rounded bg-black/30">
                      <div className="text-white font-medium mb-2">{forecast.resource}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${forecast.currentUsage}%` }}
                          />
                        </div>
                        <span className="text-white text-xs">{forecast.currentUsage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-white/50">Predicted</div>
                          <div className="text-cyan-400">{forecast.predictedUsage}%</div>
                        </div>
                        <div>
                          <div className="text-white/50">Until Capacity</div>
                          <div className={forecast.daysUntilCapacity < 7 ? 'text-red-400' : 'text-white'}>
                            {forecast.daysUntilCapacity} days
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 text-white/50 text-xs">
                        Confidence: {forecast.confidence}%
                      </div>
                    </div>
                  ))}
                </div>

                {insights.bottleneckPredictions?.length > 0 && (
                  <div className="p-3 rounded bg-orange-500/10 border border-orange-500/20">
                    <div className="text-orange-400 text-sm font-semibold mb-2">Predicted Bottlenecks</div>
                    {insights.bottleneckPredictions.map((bottleneck, idx) => (
                      <div key={idx} className="mb-2 p-2 rounded bg-black/30">
                        <div className="text-white text-xs font-medium mb-1">{bottleneck.service}</div>
                        <div className="text-white/70 text-xs mb-1">{bottleneck.predictedIssue}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-orange-400">{bottleneck.timeframe}</span>
                          <span className="text-cyan-400">{bottleneck.preventativeAction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dependency Map */}
            {dependencyMap && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold text-lg">Dependency Map & Critical Paths</h3>
                  <span className={`ml-auto px-3 py-1 rounded ${
                    dependencyMap.resilienceScore >= 80 ? 'bg-green-500/20 text-green-400' :
                    dependencyMap.resilienceScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Resilience: {dependencyMap.resilienceScore}/100
                  </span>
                </div>

                <div className="mb-4 p-3 rounded bg-black/30">
                  <div className="text-white/50 text-xs mb-2">Critical Paths</div>
                  {dependencyMap.criticalPaths?.map((path, idx) => (
                    <div key={idx} className="text-white text-xs mb-1 font-mono">
                      → {path}
                    </div>
                  ))}
                </div>

                {dependencyMap.singlePointsOfFailure?.length > 0 && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                    <div className="text-red-400 text-sm font-semibold mb-2">
                      ⚠️ Single Points of Failure
                    </div>
                    {dependencyMap.singlePointsOfFailure.map((spof, idx) => (
                      <div key={idx} className="mb-2 p-2 rounded bg-black/30">
                        <div className="text-white text-xs font-medium mb-1">{spof.service}</div>
                        <div className="text-white/70 text-xs mb-1">Impact: {spof.impact}</div>
                        <div className="text-cyan-400 text-xs">→ {spof.recommendation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}