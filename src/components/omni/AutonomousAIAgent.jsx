import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, Settings, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AutonomousAIAgent({ 
  deployedBlueprints, 
  riskTolerance = 'medium',
  onOptimizationApplied,
  onRetrainingTriggered 
}) {
  const [agentStatus, setAgentStatus] = useState('monitoring');
  const [actions, setActions] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [learningData, setLearningData] = useState([]);
  const [multiCloudRecommendations, setMultiCloudRecommendations] = useState([]);

  useEffect(() => {
    if (isActive) {
      monitorAndOptimize();
      const interval = setInterval(monitorAndOptimize, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isActive, deployedBlueprints, riskTolerance]);

  const monitorAndOptimize = async () => {
    setAgentStatus('analyzing');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Act as an autonomous AI agent managing blueprint optimization.
          
          Deployed Blueprints: ${JSON.stringify(deployedBlueprints)}
          Risk Tolerance: ${riskTolerance}
          
          Monitor and identify:
          1. PERFORMANCE BOTTLENECKS: CPU/memory/network constraints
          2. COST INEFFICIENCIES: Underutilized resources, expensive configurations
          3. MODEL DRIFT: ML models needing retraining
          4. OPTIMIZATION OPPORTUNITIES: Configuration improvements
          5. MULTI-CLOUD PATTERNS: Identify optimal deployment patterns across AWS/Azure/GCP
          6. RIGHTSIZING OPPORTUNITIES: Auto-implement resource adjustments
          7. LEARNING FROM FEEDBACK: User overrides: ${JSON.stringify(learningData.slice(-5))}
          
          For each issue, decide:
          - Should I auto-apply optimization? (based on risk tolerance)
          - Should I trigger retraining/fine-tuning?
          - Should I alert user?
          
          Risk tolerance rules:
          - LOW: Only alert, no auto-actions
          - MEDIUM: Auto-apply low-risk optimizations
          - HIGH: Auto-apply all optimizations
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  blueprintId: { type: 'string' },
                  description: { type: 'string' },
                  recommendedAction: { type: 'string' },
                  autoApply: { type: 'boolean' },
                  estimatedImpact: { type: 'string' }
                }
              }
            },
            actionsToExecute: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  blueprintId: { type: 'string' },
                  parameters: { type: 'object' }
                }
              }
            },
            multiCloudOptimizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pattern: { type: 'string' },
                  provider: { type: 'string' },
                  costSavings: { type: 'number' },
                  performanceGain: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setActions(result.findings || []);
      setMultiCloudRecommendations(result.multiCloudOptimizations || []);

      // Execute auto-approved actions
      for (const actionItem of result.actionsToExecute || []) {
        await executeAction(actionItem);
      }

      setAgentStatus('monitoring');
    } catch (error) {
      console.error('Autonomous agent failed:', error);
      setAgentStatus('error');
    }
  };

  const executeAction = async (actionItem, userOverride = false) => {
    const { action, blueprintId, parameters } = actionItem;

    // Learn from user feedback
    if (userOverride) {
      setLearningData(prev => [...prev, { action, override: true, timestamp: Date.now() }]);
    }

    if (action.includes('optimize')) {
      toast.info(`Agent: Applying optimization to ${blueprintId}`);
      await onOptimizationApplied?.({ blueprintId, parameters });
    } else if (action.includes('retrain')) {
      toast.info(`Agent: Triggering model retraining for ${blueprintId}`);
      await onRetrainingTriggered?.({ blueprintId, parameters });
    } else if (action.includes('rightsize')) {
      toast.info(`Agent: Auto-rightsizing resources for ${blueprintId}`);
      await onOptimizationApplied?.({ blueprintId, parameters, type: 'rightsize' });
    }

    toast.success(`Agent: ${action} completed`);
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-24 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-2 border-green-500/40"
        animate={agentStatus === 'analyzing' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Bot className="w-6 h-6 text-green-400" />
        {actions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
            {actions.length}
          </span>
        )}
      </motion.button>

      {showPanel && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-24 right-20 z-40 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">Autonomous Agent</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                agentStatus === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                agentStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {agentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`px-2 py-1 rounded text-xs ${
                  isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isActive ? 'Active' : 'Paused'}
              </button>
              <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            <div className="mb-3 p-2 rounded bg-white/5">
              <div className="text-white/60 text-xs mb-1">Risk Tolerance</div>
              <div className="text-white text-sm font-medium">{riskTolerance.toUpperCase()}</div>
            </div>

            {actions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-white/70 text-sm">All systems optimized</div>
              </div>
            ) : (
              <div className="space-y-2">
                {actions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${
                      action.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      action.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white text-sm font-medium">{action.type}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        action.autoApply ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {action.autoApply ? 'Auto-applied' : 'Review'}
                      </span>
                    </div>
                    <div className="text-white/70 text-xs mb-2">{action.description}</div>
                    <div className="text-cyan-400 text-xs mb-1">{action.recommendedAction}</div>
                    <div className="text-white/50 text-xs">{action.estimatedImpact}</div>
                    {!action.autoApply && (
                      <button
                        onClick={() => executeAction({ action: action.recommendedAction, blueprintId: action.blueprintId }, true)}
                        className="mt-2 w-full py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs"
                      >
                        Apply Override
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {multiCloudRecommendations.length > 0 && (
              <div className="mt-4">
                <div className="text-white/70 text-xs mb-2">Multi-Cloud Optimizations:</div>
                {multiCloudRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 rounded bg-green-500/10 border border-green-500/30 mb-2">
                    <div className="text-white text-xs">{rec.pattern}</div>
                    <div className="text-green-400 text-xs">{rec.provider}: -${rec.costSavings}/mo</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}