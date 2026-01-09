import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Settings, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentEthicsModule() {
  const [guidelines, setGuidelines] = useState([
    { id: 1, name: 'No Harm Principle', description: 'Agents must not take actions that could cause harm', active: true },
    { id: 2, name: 'Transparency', description: 'All agent decisions must be explainable', active: true },
    { id: 3, name: 'Fairness', description: 'No discrimination based on protected attributes', active: true },
    { id: 4, name: 'Privacy', description: 'Respect user data privacy', active: true }
  ]);

  const [newGuideline, setNewGuideline] = useState({ name: '', description: '' });
  const [violations, setViolations] = useState([
    { timestamp: '2026-01-09 14:15:32', agent: 'Beta', guideline: 'Fairness', severity: 'medium', details: 'Showed preference toward certain data sources' },
    { timestamp: '2026-01-09 13:42:18', agent: 'Alpha', guideline: 'Transparency', severity: 'low', details: 'Decision reasoning not fully logged' }
  ]);

  const [analyzing, setAnalyzing] = useState(false);
  const [biasAnalysis, setBiasAnalysis] = useState(null);

  const analyzeDecisionMaking = async () => {
    setAnalyzing(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze recent agent decision-making processes for potential biases, harmful outcomes, or ethical violations. Consider fairness, transparency, privacy, and safety principles.`,
      response_json_schema: {
        type: 'object',
        properties: {
          bias_detected: { type: 'boolean' },
          bias_types: { type: 'array', items: { type: 'string' } },
          risk_level: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          affected_agents: { type: 'array', items: { type: 'string' } },
          mitigation_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                action: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setBiasAnalysis(response);
    setAnalyzing(false);
  };

  const addGuideline = () => {
    if (!newGuideline.name || !newGuideline.description) return;
    setGuidelines([...guidelines, {
      id: Date.now(),
      name: newGuideline.name,
      description: newGuideline.description,
      active: true
    }]);
    setNewGuideline({ name: '', description: '' });
  };

  const toggleGuideline = (id) => {
    setGuidelines(guidelines.map(g => 
      g.id === id ? { ...g, active: !g.active } : g
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Agent Ethics & Safety Module
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={analyzeDecisionMaking}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Run Ethics Audit'}
          </motion.button>
        </div>

        {/* Ethical Guidelines */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3 text-sm">Active Ethical Guidelines</h4>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {guidelines.map(guideline => (
              <div key={guideline.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-white font-semibold text-sm mb-1">{guideline.name}</h5>
                    <p className="text-white/60 text-xs">{guideline.description}</p>
                  </div>
                  <button
                    onClick={() => toggleGuideline(guideline.id)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      guideline.active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {guideline.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Guideline */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <h5 className="text-cyan-400 font-semibold text-sm mb-3">Define New Guideline</h5>
            <input
              type="text"
              value={newGuideline.name}
              onChange={(e) => setNewGuideline({ ...newGuideline, name: e.target.value })}
              placeholder="Guideline name..."
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm mb-2"
            />
            <textarea
              value={newGuideline.description}
              onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
              placeholder="Describe the ethical principle..."
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-20 mb-2"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={addGuideline}
              className="w-full px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm"
            >
              Add Guideline
            </motion.button>
          </div>
        </div>

        {/* Violations Log */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Recent Violations
          </h4>
          <div className="space-y-2">
            {violations.map((violation, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                violation.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                violation.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-xs">{violation.timestamp}</span>
                    <span className="text-purple-400 font-semibold text-sm">{violation.agent}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      violation.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      violation.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {violation.severity}
                    </span>
                  </div>
                </div>
                <p className="text-white text-sm mb-1">Guideline: <span className="text-orange-400">{violation.guideline}</span></p>
                <p className="text-white/70 text-xs">{violation.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bias Analysis Results */}
        {biasAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border ${
              biasAnalysis.risk_level === 'high' ? 'bg-red-500/10 border-red-500/30' :
              biasAnalysis.risk_level === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-green-500/10 border-green-500/30'
            }`}
          >
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ethics Audit Results
            </h4>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {biasAnalysis.bias_detected ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">Bias Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">No Bias Detected</span>
                    </>
                  )}
                </div>
                {biasAnalysis.bias_types.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs mb-1">Types:</p>
                    {biasAnalysis.bias_types.map((type, idx) => (
                      <p key={idx} className="text-orange-400 text-sm">• {type}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-white/60 text-xs mb-2">Affected Agents:</p>
                {biasAnalysis.affected_agents.map((agent, idx) => (
                  <span key={idx} className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs mr-2 mb-2">
                    {agent}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white/60 text-xs mb-2">Recommendations:</p>
              {biasAnalysis.recommendations.map((rec, idx) => (
                <p key={idx} className="text-cyan-400 text-sm mb-1">→ {rec}</p>
              ))}
            </div>

            <div>
              <p className="text-white/60 text-xs mb-2">Mitigation Steps:</p>
              <div className="space-y-2">
                {biasAnalysis.mitigation_steps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-black/20 rounded-lg">
                    <p className="text-white font-semibold text-sm mb-1">{step.issue}</p>
                    <p className="text-green-400 text-sm">Action: {step.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Guardrails Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">{guidelines.filter(g => g.active).length}</p>
            <p className="text-white/60 text-xs">Active Guardrails</p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">{violations.length}</p>
            <p className="text-white/60 text-xs">Total Violations</p>
          </div>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
            <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">98.7%</p>
            <p className="text-white/60 text-xs">Compliance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}