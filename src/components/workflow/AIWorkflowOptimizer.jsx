import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, CheckCircle, Edit, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIWorkflowOptimizer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    analyzeWorkflows();
  }, []);

  const analyzeWorkflows = async () => {
    setAnalyzing(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent performance data, task completion patterns, and knowledge graph usage to identify workflow optimization opportunities. Suggest 3-5 automated workflows with specific agent action chains, conditional logic, and efficiency estimates.`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                bottleneck_identified: { type: 'string' },
                workflow_steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      agent: { type: 'string' },
                      action: { type: 'string' },
                      condition: { type: 'string' }
                    }
                  }
                },
                efficiency_gain: { type: 'string' },
                time_saved: { type: 'string' },
                complexity: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setSuggestions(response.suggestions);
    setAnalyzing(false);
  };

  const deployWorkflow = async (workflow) => {
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Workflow "${workflow.title}" deployed successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-bold text-xl mb-2">AI Workflow Optimizer</h3>
            <p className="text-white/60 text-sm">Automated workflow suggestions based on performance analysis</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={analyzeWorkflows}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Re-analyze'}
          </motion.button>
        </div>

        {/* Workflow Suggestions */}
        <div className="grid gap-4">
          {suggestions.map((workflow, idx) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-2">{workflow.title}</h4>
                  <p className="text-white/70 text-sm mb-3">{workflow.description}</p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold text-sm">{workflow.efficiency_gain}</span>
                    </div>
                    <div className="text-cyan-400 text-sm">⏱ {workflow.time_saved}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      workflow.complexity === 'low' ? 'bg-green-500/20 text-green-400' :
                      workflow.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {workflow.complexity} complexity
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-3 mb-3">
                <p className="text-white/60 text-xs mb-2">Bottleneck Identified:</p>
                <p className="text-orange-400 text-sm">{workflow.bottleneck_identified}</p>
              </div>

              {/* Workflow Steps */}
              <div className="mb-4">
                <p className="text-white/60 text-xs mb-2">Proposed Workflow:</p>
                <div className="space-y-2">
                  {workflow.workflow_steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                        {stepIdx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-purple-400 font-semibold text-sm">{step.agent}</span>
                          <span className="text-white/40">→</span>
                          <span className="text-white text-sm">{step.action}</span>
                        </div>
                        {step.condition && (
                          <p className="text-yellow-400 text-xs">IF {step.condition}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modify
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => deployWorkflow(workflow)}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Deploy
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Workflow Editor Modal */}
        {selectedWorkflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWorkflow(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/50 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-white font-bold text-xl mb-4">Edit Workflow: {selectedWorkflow.title}</h3>
              
              <div className="space-y-4 mb-6">
                {selectedWorkflow.workflow_steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <label className="text-white/60 text-xs mb-2 block">Step {idx + 1} - Agent</label>
                    <input
                      type="text"
                      defaultValue={step.agent}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white mb-2"
                    />
                    <label className="text-white/60 text-xs mb-2 block">Action</label>
                    <input
                      type="text"
                      defaultValue={step.action}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white mb-2"
                    />
                    <label className="text-white/60 text-xs mb-2 block">Condition (optional)</label>
                    <input
                      type="text"
                      defaultValue={step.condition || ''}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    deployWorkflow(selectedWorkflow);
                    setSelectedWorkflow(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold"
                >
                  Save & Deploy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedWorkflow(null)}
                  className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 rounded-lg text-gray-400 font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}