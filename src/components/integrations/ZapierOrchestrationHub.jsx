import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ZapierOrchestrationHub() {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Slack Alert to Voice', trigger: 'slack_alert', actions: ['gemini_analyze', 'elevenlabs_voice', 'twilio_sms'] },
    { id: 2, name: 'Email to Slack', trigger: 'email_received', actions: ['gemini_summary', 'slack_post'] },
  ]);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: '', actions: [] });
  const [creating, setCreating] = useState(false);

  const availableTriggers = [
    'slack_alert', 'email_received', 'twilio_call', 'copilot_query', 'gemini_insight'
  ];

  const availableActions = [
    'gemini_analyze', 'elevenlabs_voice', 'twilio_sms', 'twilio_call', 'slack_post', 
    'google_docs_save', 'email_send', 'copilot_notify'
  ];

  const createWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.trigger || newWorkflow.actions.length === 0) return;

    setCreating(true);
    try {
      const workflow = await base44.integrations.Core.InvokeLLM({
        prompt: `Create Zapier automation workflow:
        
Name: ${newWorkflow.name}
Trigger: ${newWorkflow.trigger}
Actions: ${newWorkflow.actions.join(', ')}

Setup the workflow to orchestrate these services together.`,
      });

      setWorkflows(prev => [...prev, {
        id: Date.now(),
        ...newWorkflow,
        status: 'active'
      }]);

      setNewWorkflow({ name: '', trigger: '', actions: [] });
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleAction = (action) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Create Workflow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
      >
        <p className="text-white font-bold text-sm">Create Workflow</p>

        <input
          type="text"
          value={newWorkflow.name}
          onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Workflow name..."
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm"
          disabled={creating}
        />

        <select
          value={newWorkflow.trigger}
          onChange={(e) => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          disabled={creating}
        >
          <option value="">Select trigger...</option>
          {availableTriggers.map(trigger => (
            <option key={trigger} value={trigger}>{trigger}</option>
          ))}
        </select>

        <div className="space-y-2">
          <p className="text-white/60 text-xs">Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map(action => (
              <label key={action} className="flex items-center gap-2 text-white text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={newWorkflow.actions.includes(action)}
                  onChange={() => toggleAction(action)}
                  disabled={creating}
                  className="w-3 h-3 rounded"
                />
                {action}
              </label>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={createWorkflow}
          disabled={!newWorkflow.name || !newWorkflow.trigger || newWorkflow.actions.length === 0 || creating}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating...' : 'Create Workflow'}
        </motion.button>
      </motion.div>

      {/* Active Workflows */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Active Workflows</p>
        {workflows.map((workflow, idx) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{workflow.name}</p>
                <p className="text-white/60 text-xs">Trigger: {workflow.trigger}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Play className="w-3 h-3 text-cyan-400" />
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-1">
              {workflow.actions.map(action => (
                <span key={action} className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded text-cyan-300">
                  {action}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}