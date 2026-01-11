import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Play, Pause, Trash2, TrendingUp } from 'lucide-react';

export default function ZapierWorkflowManager() {
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const workflows = [
    {
      id: 1,
      name: 'Portfolio Rebalancing Alert to Slack',
      trigger: 'Rebalancing Recommended',
      actions: ['Send to Slack', 'Create Asana Task'],
      status: 'active',
      executions: 23,
      successRate: 100,
      lastRun: '2 hours ago',
    },
    {
      id: 2,
      name: 'Goal Progress to Google Sheets',
      trigger: 'Financial Goal Progress',
      actions: ['Log to Google Sheets'],
      status: 'active',
      executions: 156,
      successRate: 99.4,
      lastRun: '5 minutes ago',
    },
    {
      id: 3,
      name: 'Anomaly Detection Email',
      trigger: 'Behavior Anomaly Detected',
      actions: ['Send Email', 'Create Notion Page'],
      status: 'active',
      executions: 8,
      successRate: 100,
      lastRun: '1 day ago',
    },
    {
      id: 4,
      name: 'Market Alert Discord Notification',
      trigger: 'Market Alert Triggered',
      actions: ['Send Discord Message'],
      status: 'paused',
      executions: 45,
      successRate: 98.9,
      lastRun: '3 days ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Zapier Workflows
          </h2>
          <p className="text-white/60 text-sm mt-1">Automate actions based on financial events</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowNewWorkflow(!showNewWorkflow)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </motion.button>
      </div>

      {/* New Workflow Form */}
      <AnimatePresence>
        {showNewWorkflow && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-white font-bold mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g., Portfolio Update to Slack"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Trigger Event</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400">
                  <option value="">Select a trigger...</option>
                  <option value="portfolio">Portfolio Updated</option>
                  <option value="goal">Financial Goal Progress</option>
                  <option value="market">Market Alert Triggered</option>
                  <option value="rebalance">Rebalancing Recommended</option>
                  <option value="anomaly">Behavior Anomaly Detected</option>
                </select>
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Action</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400">
                  <option value="">Select an action...</option>
                  <option value="slack">Send Slack Message</option>
                  <option value="email">Send Email</option>
                  <option value="sheets">Log to Google Sheets</option>
                  <option value="discord">Send Discord Message</option>
                  <option value="asana">Create Asana Task</option>
                </select>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg text-yellow-300 hover:bg-yellow-500/30 font-semibold"
                >
                  Create Workflow
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowNewWorkflow(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {workflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedWorkflow(workflow)}
            className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-white/30 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-bold">{workflow.name}</h3>
                <p className="text-white/60 text-sm mt-1">Trigger: {workflow.trigger}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                workflow.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {workflow.status}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {workflow.actions.map((action, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white/10 rounded text-white/70 text-xs">
                    {action}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-white/60 text-xs">Executions</p>
                <p className="text-white font-bold">{workflow.executions}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Success Rate</p>
                <p className="text-green-400 font-bold">{workflow.successRate}%</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Last Run</p>
                <p className="text-white/80 text-sm">{workflow.lastRun}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
              >
                {workflow.status === 'active' ? (
                  <>
                    <Pause className="w-3 h-3" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Resume
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm transition-all flex items-center justify-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Analytics
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 bg-red-500/10 border border-red-400/30 rounded text-red-400/80 hover:border-red-400/50 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Workflow Details */}
      {selectedWorkflow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg p-6"
        >
          <h3 className="text-white font-bold mb-4">{selectedWorkflow.name} - Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Trigger</p>
              <p className="text-white font-semibold">{selectedWorkflow.trigger}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Status</p>
              <p className={`font-semibold ${
                selectedWorkflow.status === 'active' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {selectedWorkflow.status}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-white/60 text-sm mb-2">Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedWorkflow.actions.map((action, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}