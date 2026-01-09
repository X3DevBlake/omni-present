import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, GitBranch, Zap, Settings, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VisualWorkflowBuilder() {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Data Analysis Pipeline', nodes: 3, status: 'active', triggers: ['manual'] }
  ]);

  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', agent: 'System', action: 'On Data Upload', position: { x: 50, y: 100 } },
    { id: 2, type: 'agent', agent: 'Agent-Alpha', action: 'Analyze Data', position: { x: 300, y: 100 }, dependencies: [1] },
    { id: 3, type: 'condition', condition: 'If quality > 80%', position: { x: 550, y: 50 }, dependencies: [2] },
    { id: 4, type: 'agent', agent: 'Agent-Beta', action: 'Generate Report', position: { x: 800, y: 50 }, dependencies: [3] },
    { id: 5, type: 'agent', agent: 'Agent-Gamma', action: 'Request Cleanup', position: { x: 800, y: 150 }, dependencies: [3] }
  ]);

  const [availableAgents] = useState([
    'Agent-Alpha', 'Agent-Beta', 'Agent-Gamma', 'Agent-Delta'
  ]);

  const [availableActions] = useState([
    'Analyze Data', 'Process Information', 'Generate Report', 'Send Notification', 
    'Run Calculation', 'Archive Results', 'Trigger Alert'
  ]);

  const [executionLog, setExecutionLog] = useState([]);
  const [proactiveWorkflows, setProactiveWorkflows] = useState([
    { trigger: 'High CPU Usage Detected', workflow: 'Performance Optimization', lastTriggered: '2 hours ago' },
    { trigger: 'Error Rate > 5%', workflow: 'Error Investigation', lastTriggered: 'Never' }
  ]);

  const addNode = (type) => {
    const newNode = {
      id: nodes.length + 1,
      type: type,
      agent: type === 'agent' ? availableAgents[0] : 'System',
      action: type === 'agent' ? availableActions[0] : type === 'condition' ? 'If condition met' : 'On Event',
      position: { x: 100, y: nodes.length * 80 + 100 },
      dependencies: []
    };
    setNodes([...nodes, newNode]);
  };

  const executeWorkflow = async () => {
    setExecutionLog([]);
    const log = [];

    for (const node of nodes.sort((a, b) => a.id - b.id)) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const logEntry = {
        nodeId: node.id,
        agent: node.agent,
        action: node.action,
        status: Math.random() > 0.2 ? 'success' : 'pending',
        timestamp: new Date().toLocaleTimeString()
      };
      
      log.push(logEntry);
      setExecutionLog([...log]);
    }
  };

  const generateSmartWorkflow = async (goal) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a multi-agent workflow to achieve: "${goal}". Include agent assignments, actions, conditional logic, and dependencies.`,
      response_json_schema: {
        type: 'object',
        properties: {
          workflow_name: { type: 'string' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                agent: { type: 'string' },
                action: { type: 'string' },
                dependencies: { type: 'array', items: { type: 'number' } }
              }
            }
          }
        }
      }
    });

    const generatedNodes = response.nodes.map((n, idx) => ({
      id: idx + 1,
      type: n.type,
      agent: n.agent,
      action: n.action,
      position: { x: 100 + (idx % 3) * 300, y: 100 + Math.floor(idx / 3) * 150 },
      dependencies: n.dependencies
    }));

    setNodes(generatedNodes);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl">Visual Workflow Builder</h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => generateSmartWorkflow('Comprehensive data quality check and analysis')}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              AI Generate
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={executeWorkflow}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Execute
            </motion.button>
          </div>
        </div>

        {/* Node Types */}
        <div className="flex gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => addNode('trigger')}
            className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Trigger
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => addNode('agent')}
            className="px-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agent Task
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => addNode('condition')}
            className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Condition
          </motion.button>
        </div>

        {/* Workflow Canvas */}
        <div className="relative bg-black/20 border border-white/10 rounded-xl p-6 mb-6 min-h-[400px] overflow-auto">
          {nodes.map(node => (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                position: 'absolute', 
                left: node.position.x, 
                top: node.position.y 
              }}
              className={`w-48 p-3 rounded-lg border cursor-move ${
                node.type === 'trigger' ? 'bg-cyan-500/20 border-cyan-500/50' :
                node.type === 'agent' ? 'bg-purple-500/20 border-purple-500/50' :
                'bg-yellow-500/20 border-yellow-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${
                  node.type === 'trigger' ? 'text-cyan-400' :
                  node.type === 'agent' ? 'text-purple-400' :
                  'text-yellow-400'
                }`}>
                  {node.type.toUpperCase()}
                </span>
                <button className="p-1 hover:bg-white/10 rounded">
                  <Settings className="w-3 h-3 text-white/60" />
                </button>
              </div>
              <p className="text-white text-sm font-semibold mb-1">{node.agent}</p>
              <p className="text-white/70 text-xs">{node.action}</p>
              {node.dependencies && node.dependencies.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-white/40" />
                  <span className="text-white/40 text-xs">Depends on: {node.dependencies.join(', ')}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Execution Log */}
        {executionLog.length > 0 && (
          <div className="bg-black/20 border border-white/10 rounded-xl p-4">
            <h4 className="text-white font-bold mb-3 text-sm">Execution Log</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {executionLog.map((entry, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-white/5 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      entry.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-white/80 text-sm">{entry.agent}</span>
                    <span className="text-white/60 text-xs">→ {entry.action}</span>
                  </div>
                  <span className="text-white/40 text-xs">{entry.timestamp}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Proactive Workflows */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Proactive Workflow Triggers</h3>
        <div className="space-y-3">
          {proactiveWorkflows.map((pw, idx) => (
            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{pw.workflow}</p>
                  <p className="text-cyan-400 text-xs">🔔 {pw.trigger}</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs">
                  Active
                </span>
              </div>
              <p className="text-white/40 text-xs">Last triggered: {pw.lastTriggered}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}