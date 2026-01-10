import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, GitBranch, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BehaviorTreeEditor({ agent, onSave }) {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'root', label: 'Root', x: 400, y: 50, children: [2, 3] },
    { id: 2, type: 'condition', label: 'Check Resource', x: 300, y: 150, children: [4] },
    { id: 3, type: 'action', label: 'Explore', x: 500, y: 150, children: [] },
    { id: 4, type: 'action', label: 'Gather', x: 300, y: 250, children: [] },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);

  const addNode = (parentId, type) => {
    const parent = nodes.find(n => n.id === parentId);
    const newNode = {
      id: Date.now(),
      type,
      label: `New ${type}`,
      x: parent.x + (Math.random() - 0.5) * 100,
      y: parent.y + 100,
      children: []
    };
    
    setNodes([
      ...nodes,
      newNode
    ].map(n => n.id === parentId ? { ...n, children: [...n.children, newNode.id] } : n));
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId).map(n => ({
      ...n,
      children: n.children.filter(c => c !== nodeId)
    })));
  };

  const nodeTypes = [
    { type: 'selector', icon: GitBranch, color: '#00f5ff', label: 'Selector' },
    { type: 'sequence', icon: CheckCircle, color: '#a855f7', label: 'Sequence' },
    { type: 'condition', icon: '?', color: '#f59e0b', label: 'Condition' },
    { type: 'action', icon: '▶', color: '#10b981', label: 'Action' },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">Behavior Tree Editor</h3>

      <div className="relative bg-black/20 rounded-xl border border-white/10 h-96 overflow-auto mb-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.children.map(childId => {
              const child = nodes.find(n => n.id === childId);
              return child ? (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={child.x}
                  y2={child.y}
                  stroke="#00f5ff"
                  strokeWidth="2"
                  opacity="0.3"
                />
              ) : null;
            })
          )}
        </svg>

        {nodes.map(node => (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => {
              setNodes(nodes.map(n => 
                n.id === node.id ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y } : n
              ));
            }}
            onClick={() => setSelectedNode(node)}
            style={{ left: node.x, top: node.y }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move`}
          >
            <div className={`px-4 py-2 rounded-lg border-2 ${
              selectedNode?.id === node.id ? 'border-cyan-500' : 'border-white/20'
            } ${
              node.type === 'root' ? 'bg-cyan-500/20' :
              node.type === 'selector' ? 'bg-purple-500/20' :
              node.type === 'sequence' ? 'bg-blue-500/20' :
              node.type === 'condition' ? 'bg-orange-500/20' :
              'bg-green-500/20'
            }`}>
              <div className="text-white text-xs font-bold text-center">{node.label}</div>
              <div className="text-white/40 text-xs text-center capitalize">{node.type}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedNode && (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <Input
              value={selectedNode.label}
              onChange={(e) => setNodes(nodes.map(n => 
                n.id === selectedNode.id ? { ...n, label: e.target.value } : n
              ))}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button
              onClick={() => deleteNode(selectedNode.id)}
              variant="ghost"
              size="sm"
              className="text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {nodeTypes.map(({ type, label }) => (
              <Button
                key={type}
                onClick={() => addNode(selectedNode.id, type)}
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={() => onSave?.(nodes)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
        Save Behavior Tree
      </Button>
    </div>
  );
}