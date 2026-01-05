import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Link as LinkIcon, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

const NodeTypes = {
  TRIGGER: { color: '#10b981', label: 'Trigger' },
  ACTION: { color: '#3b82f6', label: 'Action' },
  CONDITION: { color: '#f59e0b', label: 'Condition' },
  PERSONALITY: { color: '#a855f7', label: 'Personality' }
};

const AvailableNodes = {
  triggers: [
    { id: 'env_enter', label: 'Enter Environment', type: 'TRIGGER', outputs: ['next'] },
    { id: 'near_object', label: 'Near Object', type: 'TRIGGER', outputs: ['next'], params: ['objectType', 'distance'] },
    { id: 'timer', label: 'Timer', type: 'TRIGGER', outputs: ['next'], params: ['seconds'] },
    { id: 'agent_interaction', label: 'Agent Interaction', type: 'TRIGGER', outputs: ['next'] }
  ],
  actions: [
    { id: 'move_to', label: 'Move To', type: 'ACTION', inputs: ['in'], outputs: ['done'], params: ['target'] },
    { id: 'interact', label: 'Interact', type: 'ACTION', inputs: ['in'], outputs: ['done'], params: ['interactionType'] },
    { id: 'wait', label: 'Wait', type: 'ACTION', inputs: ['in'], outputs: ['done'], params: ['duration'] },
    { id: 'say', label: 'Say', type: 'ACTION', inputs: ['in'], outputs: ['done'], params: ['message'] },
    { id: 'push_object', label: 'Push Object', type: 'ACTION', inputs: ['in'], outputs: ['done'], params: ['object', 'force'] }
  ],
  conditions: [
    { id: 'random', label: 'Random Choice', type: 'CONDITION', inputs: ['in'], outputs: ['true', 'false'], params: ['probability'] },
    { id: 'check_distance', label: 'Check Distance', type: 'CONDITION', inputs: ['in'], outputs: ['true', 'false'], params: ['target', 'threshold'] },
    { id: 'check_state', label: 'Check State', type: 'CONDITION', inputs: ['in'], outputs: ['true', 'false'], params: ['stateName', 'value'] }
  ],
  personality: [
    { id: 'curiosity', label: 'Curiosity', type: 'PERSONALITY', modifier: 'explorationRate', range: [0, 1] },
    { id: 'caution', label: 'Caution', type: 'PERSONALITY', modifier: 'riskTolerance', range: [0, 1] },
    { id: 'sociability', label: 'Sociability', type: 'PERSONALITY', modifier: 'interactionFrequency', range: [0, 1] },
    { id: 'energy', label: 'Energy Level', type: 'PERSONALITY', modifier: 'movementSpeed', range: [0.5, 2] }
  ]
};

export default function VisualBehaviorEditor({ show, onClose, onSaveBehavior, existingBehavior }) {
  const [nodes, setNodes] = useState(existingBehavior?.nodes || []);
  const [connections, setConnections] = useState(existingBehavior?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [behaviorName, setBehaviorName] = useState(existingBehavior?.name || '');

  const addNode = (nodeTemplate) => {
    const newNode = {
      id: `node_${Date.now()}`,
      ...nodeTemplate,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      params: nodeTemplate.params?.reduce((acc, param) => ({ ...acc, [param]: '' }), {}) || {}
    };
    setNodes([...nodes, newNode]);
    setShowNodePalette(false);
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const startConnection = (nodeId, outputPort) => {
    setConnectingFrom({ nodeId, port: outputPort });
  };

  const completeConnection = (nodeId, inputPort) => {
    if (connectingFrom && connectingFrom.nodeId !== nodeId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: connectingFrom.nodeId,
        fromPort: connectingFrom.port,
        to: nodeId,
        toPort: inputPort
      };
      setConnections([...connections, newConnection]);
    }
    setConnectingFrom(null);
  };

  const saveBehavior = () => {
    if (!behaviorName.trim()) {
      toast.error('Enter behavior name');
      return;
    }

    const behavior = {
      name: behaviorName,
      nodes,
      connections,
      created: new Date().toISOString()
    };

    onSaveBehavior(behavior);
    toast.success('Behavior saved!');
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <input
                type="text"
                value={behaviorName}
                onChange={(e) => setBehaviorName(e.target.value)}
                placeholder="Behavior Name"
                className="bg-transparent text-xl font-bold text-white border-none outline-none"
              />
              <p className="text-white/60 text-sm">Visual Behavior Editor</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveBehavior} className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Node Palette */}
            <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
              <button onClick={() => setShowNodePalette(!showNodePalette)} className="w-full py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg mb-4 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Node
              </button>

              {showNodePalette && (
                <div className="space-y-3">
                  {Object.entries(AvailableNodes).map(([category, nodeList]) => (
                    <div key={category}>
                      <h4 className="text-white/70 text-xs uppercase mb-2">{category}</h4>
                      {nodeList.map(node => (
                        <button key={node.id} onClick={() => addNode(node)} className="w-full p-2 mb-1 bg-white/5 hover:bg-white/10 rounded text-left text-sm text-white border border-white/10" style={{ borderLeftColor: NodeTypes[node.type].color, borderLeftWidth: 3 }}>
                          {node.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-400 text-sm font-semibold mb-2">💡 Tips</h4>
                <ul className="text-white/60 text-xs space-y-1">
                  <li>• Start with triggers</li>
                  <li>• Connect nodes to create flow</li>
                  <li>• Use conditions for branching</li>
                  <li>• Set personality traits</li>
                </ul>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-auto">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              
              {nodes.map(node => (
                <div key={node.id} className="absolute bg-black/80 backdrop-blur border rounded-lg p-3 cursor-move" style={{ left: node.position.x, top: node.position.y, borderColor: NodeTypes[node.type].color, minWidth: 180 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{node.label}</span>
                    <button onClick={() => deleteNode(node.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {node.inputs?.map(input => (
                    <div key={input} onClick={() => completeConnection(node.id, input)} className="w-3 h-3 rounded-full border-2 border-white bg-black absolute -left-1.5 top-1/2 cursor-pointer hover:bg-cyan-400" />
                  ))}

                  {node.outputs?.map((output, i) => (
                    <div key={output} onClick={() => startConnection(node.id, output)} className="w-3 h-3 rounded-full border-2 border-white bg-black absolute -right-1.5 cursor-pointer hover:bg-cyan-400" style={{ top: `${30 + i * 20}px` }} />
                  ))}

                  {node.params && Object.keys(node.params).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.keys(node.params).map(param => (
                        <input key={param} type="text" placeholder={param} value={node.params[param]} onChange={(e) => {
                          const updated = nodes.map(n => n.id === node.id ? { ...n, params: { ...n.params, [param]: e.target.value } } : n);
                          setNodes(updated);
                        }} className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs" />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                
                return (
                  <svg key={conn.id} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                    <line x1={fromNode.position.x + 180} y1={fromNode.position.y + 30} x2={toNode.position.x} y2={toNode.position.y + 30} stroke="#00f5ff" strokeWidth="2" />
                  </svg>
                );
              })}

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Add nodes to start building behavior</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}