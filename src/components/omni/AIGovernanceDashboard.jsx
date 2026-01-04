import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingDown, AlertTriangle, DollarSign, Activity, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIGovernanceDashboard({ onClose }) {
  const [governance, setGovernance] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    analyzeAIGovernance();
    const interval = setInterval(analyzeAIGovernance, 30000);
    return () => clearInterval(interval);
  }, []);

  const analyzeAIGovernance = async () => {
    try {
      const prompt = `
        Generate comprehensive AI governance metrics and insights:
        
        Analyze:
        1. MODEL VERSIONS: Track deployed AI models and their versions
        2. PERFORMANCE DRIFT: Detect accuracy/performance degradation over time
        3. ETHICAL COMPLIANCE: Identify potential bias and fairness issues
        4. AUDIT TRAIL: Decision-making transparency and explainability
        5. RESOURCE COSTS: AI compute usage and optimization opportunities
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            models: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  status: { type: 'string' },
                  accuracy: { type: 'number' },
                  drift: { type: 'number' },
                  lastUpdated: { type: 'string' }
                }
              }
            },
            ethicalAlerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  model: { type: 'string' },
                  issue: { type: 'string' },
                  severity: { type: 'string' },
                  recommendation: { type: 'string' }
                }
              }
            },
            auditLog: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  model: { type: 'string' },
                  decision: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            },
            costs: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                byModel: { type: 'array', items: { 
                  type: 'object',
                  properties: {
                    model: { type: 'string' },
                    cost: { type: 'number' }
                  }
                }}
              }
            }
          }
        }
      });

      setGovernance(result);
    } catch (error) {
      console.error('Governance analysis failed:', error);
    }
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
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Governance Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {governance && (
          <div className="space-y-6">
            {/* Model Overview */}
            <div>
              <h3 className="text-white font-semibold mb-3">AI Models ({governance.models?.length})</h3>
              <div className="grid grid-cols-3 gap-4">
                {governance.models?.map((model, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedModel(model)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{model.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        model.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm mb-2">v{model.version}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                      <span className={`flex items-center gap-1 ${
                        model.drift > 0.05 ? 'text-orange-400' : 'text-green-400'
                      }`}>
                        <TrendingDown className="w-3 h-3" />
                        {(model.drift * 100).toFixed(1)}% drift
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical Compliance */}
            {governance.ethicalAlerts?.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Ethical & Bias Alerts
                </h3>
                <div className="space-y-2">
                  {governance.ethicalAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm mb-1">{alert.model}</div>
                          <div className="text-orange-400 text-sm mb-1">{alert.issue}</div>
                          <div className="text-white/60 text-xs">{alert.recommendation}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail */}
            <div>
              <h3 className="text-white font-semibold mb-3">Recent AI Decisions</h3>
              <div className="space-y-2">
                {governance.auditLog?.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white text-sm mb-1">{entry.model}: {entry.decision}</div>
                        <div className="text-white/50 text-xs">{entry.timestamp}</div>
                      </div>
                      <div className="text-cyan-400 text-sm">
                        {(entry.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                AI Resource Consumption
              </h3>
              <div className="mb-4">
                <div className="text-white text-3xl font-bold mb-1">
                  ${governance.costs?.total?.toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Total monthly AI costs</div>
              </div>
              <div className="space-y-2">
                {governance.costs?.byModel?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/30">
                    <span className="text-white text-sm">{item.model}</span>
                    <span className="text-green-400 text-sm">${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}