import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Plus, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function KnowledgeGraphEditor() {
  const [nodes, setNodes] = useState([
    { id: 1, label: 'AI', x: 200, y: 100, connections: [2, 3] },
    { id: 2, label: 'Machine Learning', x: 100, y: 200, connections: [1] },
    { id: 3, label: 'Deep Learning', x: 300, y: 200, connections: [1] },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);

  const addNode = () => {
    setNodes([...nodes, {
      id: Date.now(),
      label: 'New Concept',
      x: 200 + Math.random() * 100,
      y: 150 + Math.random() * 100,
      connections: []
    }]);
  };

  const linkNodes = (nodeId) => {
    if (selectedNode && selectedNode !== nodeId) {
      setNodes(nodes.map(n => {
        if (n.id === selectedNode) {
          return { ...n, connections: [...n.connections, nodeId] };
        }
        if (n.id === nodeId) {
          return { ...n, connections: [...n.connections, selectedNode] };
        }
        return n;
      }));
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Network className="w-6 h-6 text-cyan-400" />
        Knowledge Graph Editor
      </h3>

      <div className="flex gap-2 mb-4">
        <Button onClick={addNode} size="sm" className="bg-cyan-500/20 hover:bg-cyan-500/30">
          <Plus className="w-4 h-4 mr-1" />
          Add Node
        </Button>
        <div className="text-white/60 text-sm flex items-center">
          {selectedNode ? 'Click another node to link' : 'Click node to select'}
        </div>
      </div>

      <div className="relative bg-black/20 rounded-xl border border-white/10 h-80 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              return target ? (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
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
            onClick={() => linkNodes(node.id)}
            style={{ left: node.x, top: node.y }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
          >
            <div className={`px-3 py-2 rounded-lg border-2 ${
              selectedNode === node.id ? 'border-cyan-500 bg-cyan-500/30' : 'border-cyan-500/30 bg-black/40'
            }`}>
              <div className="text-white text-xs font-bold text-center whitespace-nowrap">{node.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}