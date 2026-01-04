import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Zap, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BlueprintAnalytics({ blueprint, telemetry, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runHealthCheck = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this AI infrastructure blueprint for health, bottlenecks, and optimizations:
        
Blueprint Configuration: ${JSON.stringify(blueprint, null, 2)}
Current Telemetry: CPU ${telemetry?.cpuLoad}%, GPU ${telemetry?.gpuLoad}%, Memory ${telemetry?.memoryUsage}GB

Provide analysis in this exact JSON structure:
{
  "healthScore": <number 0-100>,
  "criticalIssues": [{"issue": "description", "severity": "high|medium|low", "component": "name"}],
  "bottlenecks": [{"location": "component", "description": "issue", "impact": "performance impact"}],
  "singlePointsOfFailure": ["component names"],
  "optimizations": [{"recommendation": "description", "expectedGain": "percentage or description"}],
  "summary": "overall assessment"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            healthScore: { type: 'number' },
            criticalIssues: { type: 'array', items: { type: 'object' } },
            bottlenecks: { type: 'array', items: { type: 'object' } },
            singlePointsOfFailure: { type: 'array', items: { type: 'string' } },
            optimizations: { type: 'array', items: { type: 'object' } },
            summary: { type: 'string' }
          }
        }
      });
      setAnalysis(result);
    } catch (error) {
      toast.error('Analysis failed');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    if (blueprint) runHealthCheck();
  }, [blueprint]);

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/40',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    };
    return colors[severity] || colors.low;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Blueprint Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500 mb-4" />
              <p className="text-white/60">Analyzing blueprint...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Health Score */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Overall Health Score</span>
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div className={`text-5xl font-bold ${getHealthColor(analysis.healthScore)}`}>
                  {analysis.healthScore}%
                </div>
                <p className="text-white/70 text-sm mt-2">{analysis.summary}</p>
              </div>

              {/* Critical Issues */}
              {analysis.criticalIssues?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-white font-semibold">Critical Issues</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.criticalIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{issue.issue}</div>
                            <div className="text-white/50 text-xs mt-1">Component: {issue.component}</div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-black/20">
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottlenecks */}
              {analysis.bottlenecks?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">Performance Bottlenecks</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.bottlenecks.map((bottleneck, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-white font-medium text-sm">{bottleneck.location}</div>
                        <div className="text-white/60 text-xs mt-1">{bottleneck.description}</div>
                        <div className="text-yellow-400 text-xs mt-1">Impact: {bottleneck.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Points of Failure */}
              {analysis.singlePointsOfFailure?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-semibold">Single Points of Failure</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.singlePointsOfFailure.map((component, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs border border-orange-500/40"
                      >
                        {component}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimizations */}
              {analysis.optimizations?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Optimization Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.optimizations.map((opt, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="text-white font-medium text-sm">{opt.recommendation}</div>
                        <div className="text-green-400 text-xs mt-1">
                          Expected gain: {opt.expectedGain}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}