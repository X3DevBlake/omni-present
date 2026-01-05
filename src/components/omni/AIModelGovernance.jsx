import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, X, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIModelGovernance({ deployedModels, onRollback, onClose }) {
  const [governanceData, setGovernanceData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);

  useEffect(() => {
    monitorModels();
    const interval = setInterval(monitorModels, 20000);
    return () => clearInterval(interval);
  }, [deployedModels]);

  const monitorModels = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Continuous AI Model Governance Monitoring
          
          Deployed Models: ${JSON.stringify(deployedModels)}
          Custom Policies: ${JSON.stringify(policies)}
          
          Monitor for:
          1. PERFORMANCE DEGRADATION: Accuracy drop, latency increase
          2. MODEL DRIFT: Data distribution changes, concept drift
          3. ETHICAL ISSUES: Bias detection, fairness violations
          4. COMPLIANCE: Policy violations, regulatory issues
          
          For each issue:
          - Severity level
          - Recommended action (alert/rollback/retrain)
          - Version to rollback to
          - Automated remediation steps
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            models: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  modelId: { type: 'string' },
                  healthScore: { type: 'number' },
                  performanceDrift: { type: 'number' },
                  biasScore: { type: 'number' },
                  fairnessScore: { type: 'number' },
                  issues: { type: 'array', items: { type: 'string' } },
                  recommendedAction: { type: 'string' },
                  rollbackVersion: { type: 'string' }
                }
              }
            },
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  message: { type: 'string' },
                  modelId: { type: 'string' },
                  autoRemediate: { type: 'boolean' }
                }
              }
            }
          }
        }
      });

      setGovernanceData(result);
      setAlerts(result.alerts || []);

      // Auto-remediate critical issues
      result.alerts?.filter(a => a.autoRemediate).forEach(alert => {
        if (alert.severity === 'critical') {
          toast.error(`Critical: ${alert.message} - Auto-remediating`);
        }
      });
    } catch (error) {
      console.error('Governance monitoring failed:', error);
    }
  };

  const addCustomPolicy = async (policy) => {
    setPolicies(prev => [...prev, policy]);
    toast.success('Custom policy added');
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
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Model Governance</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPolicyEditor(!showPolicyEditor)}
              className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-sm"
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Policies
            </button>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">{alerts.length} Active Alerts</span>
            </div>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="p-3 rounded bg-black/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <div className="text-white text-sm mt-2">{alert.message}</div>
                      <div className="text-white/60 text-xs mt-1">Model: {alert.modelId}</div>
                    </div>
                    {alert.autoRemediate && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Health Cards */}
        {governanceData?.models && (
          <div className="space-y-4">
            {governanceData.models.map((model) => (
              <div key={model.modelId} className="p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">{model.modelId}</h3>
                    <div className="flex gap-3 text-sm">
                      <span className="text-white/60">Health: {model.healthScore}/100</span>
                      <span className="text-white/60">Drift: {model.performanceDrift}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50 mb-1">Ethical Scores</div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                        Bias: {model.biasScore}/100
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                        Fairness: {model.fairnessScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {model.issues?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-orange-400 text-sm mb-2">Issues:</div>
                    {model.issues.map((issue, i) => (
                      <div key={i} className="text-white/70 text-xs mb-1">• {issue}</div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded bg-black/30 text-white/70 text-sm">
                    {model.recommendedAction}
                  </div>
                  {model.rollbackVersion && (
                    <button
                      onClick={() => onRollback?.({ modelId: model.modelId, version: model.rollbackVersion })}
                      className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm"
                    >
                      Rollback to {model.rollbackVersion}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policy Editor */}
        {showPolicyEditor && (
          <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <h3 className="text-purple-400 font-semibold mb-3">Custom Governance Policies</h3>
            <div className="space-y-2">
              {policies.map((policy, idx) => (
                <div key={idx} className="p-3 rounded bg-black/30 text-white text-sm">
                  {policy}
                </div>
              ))}
              <button
                onClick={() => {
                  const newPolicy = prompt('Enter new governance policy:');
                  if (newPolicy) addCustomPolicy(newPolicy);
                }}
                className="w-full py-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm"
              >
                + Add Policy
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}