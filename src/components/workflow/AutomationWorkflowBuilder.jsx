import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Zap, ArrowRight } from 'lucide-react';

const WORKFLOW_TEMPLATES = [
  {
    id: 1,
    name: 'Market Crash Response',
    trigger: 'Market volatility > 20%',
    actions: [
      { hub: 'Simulations', action: 'Analyze risk', delay: 0 },
      { hub: 'Banking', action: 'Rebalance portfolio', delay: 2 },
      { hub: 'Communications', action: 'Send risk alert', delay: 4 },
    ],
    enabled: true,
    executions: 3,
  },
  {
    id: 2,
    name: 'Device Health Check',
    trigger: 'Device anomaly detected',
    actions: [
      { hub: 'Devices', action: 'Run diagnostics', delay: 0 },
      { hub: 'AI Labs', action: 'Predict maintenance', delay: 3 },
      { hub: 'Communications', action: 'Schedule maintenance', delay: 5 },
    ],
    enabled: true,
    executions: 7,
  },
  {
    id: 3,
    name: 'Training Completion Pipeline',
    trigger: 'AI agent training complete',
    actions: [
      { hub: 'AI Labs', action: 'Evaluate model', delay: 0 },
      { hub: 'Simulations', action: 'Run validation', delay: 2 },
      { hub: 'Banking', action: 'Deploy strategy', delay: 5 },
    ],
    enabled: false,
    executions: 1,
  },
];

export default function AutomationWorkflowBuilder() {
  const [workflows, setWorkflows] = useState(WORKFLOW_TEMPLATES);
  const [showBuilder, setShowBuilder] = useState(false);

  const toggleWorkflow = (id) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleExecuteWorkflow = (id) => {
    alert(`Workflow ${id} triggered!`);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Templates */}
      <div className="space-y-3">
        {workflows.map((workflow, idx) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{workflow.name}</h3>
                  <p className="text-white/60 text-xs mt-1 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Trigger: {workflow.trigger}
                  </p>
                </div>
                <Badge className={workflow.enabled ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}>
                  {workflow.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-2 mb-4">
                {workflow.actions.map((action, actionIdx) => (
                  <div key={actionIdx} className="flex items-center gap-2 text-sm">
                    <Badge className="bg-cyan-500/30 text-cyan-300 whitespace-nowrap">{action.hub}</Badge>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                    <span className="text-white/70">{action.action}</span>
                    <span className="text-white/40 text-xs ml-auto">+{action.delay}s</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2 items-center justify-between">
                <span className="text-white/60 text-xs">{workflow.executions} executions</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleWorkflow(workflow.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    {workflow.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    size="sm"
                    disabled={!workflow.enabled}
                    className="bg-cyan-600 hover:bg-cyan-700 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" /> Test
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create New Workflow */}
      <Button onClick={() => setShowBuilder(!showBuilder)} className="w-full bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" /> Create Custom Workflow
      </Button>

      {showBuilder && (
        <Card className="bg-black/40 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4">Workflow Builder</h3>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm">Workflow Name</label>
              <input
                type="text"
                placeholder="e.g., Custom Market Event Handler"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-white text-sm">Trigger Event</label>
              <select className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm mt-1">
                <option>Select trigger...</option>
                <option>Market volatility spike</option>
                <option>Device anomaly</option>
                <option>Agent training complete</option>
              </select>
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Create Workflow</Button>
          </div>
        </Card>
      )}
    </div>
  );
}