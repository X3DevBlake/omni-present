import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Settings, Trash2, ChevronRight } from 'lucide-react';

export default function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'Market Analysis to Trading',
      trigger: 'event',
      steps: [
        { action: 'analyze_market', agent: 'Research Agent' },
        { action: 'validate_risk', agent: 'Risk Agent' },
        { action: 'execute_trade', agent: 'Trading Agent' }
      ],
      enabled: true
    }
  ]);
  const [creatingWorkflow, setCreatingWorkflow] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    trigger: 'event',
    triggerCondition: '',
    steps: []
  });

  const stepTypes = [
    'analyze_market', 'validate_risk', 'execute_trade', 'request_data',
    'generate_report', 'send_alert', 'update_strategy'
  ];

  const addStep = () => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: [...prev.steps, { action: stepTypes[0], agent: 'Select Agent', condition: '' }]
    }));
  };

  const updateStep = (idx, field, value) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === idx ? { ...step, [field]: value } : step)
    }));
  };

  const removeStep = (idx) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  const saveWorkflow = () => {
    if (!workflowForm.name.trim() || workflowForm.steps.length === 0) return;
    
    setWorkflows([...workflows, { ...workflowForm, id: Date.now().toString(), enabled: true }]);
    setWorkflowForm({ name: '', trigger: 'event', triggerCondition: '', steps: [] });
    setCreatingWorkflow(false);
  };

  const deleteWorkflow = (id) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const toggleWorkflow = (id) => {
    setWorkflows(workflows.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <div className="space-y-6">
      {/* Workflow Creator */}
      {creatingWorkflow ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4">Create Workflow</h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Workflow Name</label>
              <input
                type="text"
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                placeholder="e.g., Market Alert to Action"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Trigger Type</label>
                <select
                  value={workflowForm.trigger}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, trigger: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="event">Event-Based</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Trigger Condition</label>
                <input
                  type="text"
                  value={workflowForm.triggerCondition}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, triggerCondition: e.target.value })}
                  placeholder="e.g., price > 100"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
                />
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/70 text-sm font-semibold">Workflow Steps</label>
                <button
                  onClick={addStep}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="space-y-3">
                {workflowForm.steps.map((step, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm font-bold">Step {idx + 1}</span>
                      {idx > 0 && <ChevronRight className="w-4 h-4 text-white/40" />}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={step.action}
                        onChange={(e) => updateStep(idx, 'action', e.target.value)}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      >
                        {stepTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={step.agent}
                        onChange={(e) => updateStep(idx, 'agent', e.target.value)}
                        placeholder="Agent name"
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40"
                      />
                    </div>
                    <input
                      type="text"
                      value={step.condition}
                      onChange={(e) => updateStep(idx, 'condition', e.target.value)}
                      placeholder="Condition (optional)"
                      className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm placeholder-white/40"
                    />
                    <button
                      onClick={() => removeStep(idx)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveWorkflow}
                disabled={!workflowForm.name.trim() || workflowForm.steps.length === 0}
                className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold disabled:opacity-50"
              >
                Save Workflow
              </button>
              <button
                onClick={() => {
                  setCreatingWorkflow(false);
                  setWorkflowForm({ name: '', trigger: 'event', triggerCondition: '', steps: [] });
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setCreatingWorkflow(true)}
          className="w-full p-4 border-2 border-dashed border-cyan-500/30 rounded-2xl hover:border-cyan-500/60 transition-colors text-cyan-400 font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Workflow
        </button>
      )}

      {/* Workflows List */}
      <div className="space-y-3">
        <h3 className="text-white font-bold">Active Workflows ({workflows.length})</h3>
        <AnimatePresence>
          {workflows.map((workflow, idx) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={workflow.enabled}
                      onChange={() => toggleWorkflow(workflow.id)}
                      className="w-4 h-4"
                    />
                    <h4 className="text-white font-semibold">{workflow.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {workflow.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
                          {step.action}
                        </span>
                        {i < workflow.steps.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-white/40" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-xs text-white/40">{workflow.steps.length} steps</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Play className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}