import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GitBranch, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BehaviorTreeVisualizer({ agentId }) {
  const [selectedTree, setSelectedTree] = useState(null);

  const { data: trees = [] } = useQuery({
    queryKey: ['behaviorTrees', agentId],
    queryFn: () => base44.entities.AgentBehaviorTree.filter({ agent_id: agentId }).catch(() => [])
  });

  const renderNode = (node, x = 0, y = 0, offset = 100) => {
    if (!node) return null;

    return (
      <motion.g
        key={`${x}-${y}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Node circle */}
        <circle cx={x} cy={y} r={25} fill="#0891b2" stroke="#06b6d4" strokeWidth={2} />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-white font-bold"
        >
          {node.type?.substring(0, 3).toUpperCase()}
        </text>

        {/* Lines to children */}
        {node.children?.map((child, idx) => {
          const childX = x + (idx - node.children.length / 2) * offset;
          const childY = y + 80;
          return (
            <g key={`line-${idx}`}>
              <line
                x1={x}
                y1={y + 25}
                x2={childX}
                y2={childY - 25}
                stroke="#666"
                strokeWidth={2}
              />
              {renderNode(child, childX, childY, offset / 2)}
            </g>
          );
        })}
      </motion.g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold">Behavior Trees</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {trees.map((tree, idx) => (
          <motion.button
            key={tree.id || idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedTree(tree)}
            className={`p-3 rounded-lg border transition ${
              selectedTree?.id === tree.id
                ? 'bg-purple-500/20 border-purple-500'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-white text-sm font-bold">{tree.name}</p>
            <p className="text-white/50 text-xs">
              Success: {(tree.success_rate || 0).toFixed(1)}%
            </p>
            <p className="text-white/40 text-xs mt-1">
              Executed: {tree.execution_count || 0}x
            </p>
          </motion.button>
        ))}
      </div>

      {selectedTree && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold">{selectedTree.name}</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Play className="w-3 h-3 mr-1" />
                Execute
              </Button>
              <Button size="sm" variant="outline">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>

          <svg width="100%" height={300} className="bg-black/20 rounded">
            {renderNode(selectedTree.root_node)}
          </svg>

          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-white/5 p-2 rounded">
              <p className="text-white/60">Nodes</p>
              <p className="text-white font-bold">{selectedTree.nodes?.length || 0}</p>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <p className="text-white/60">Status</p>
              <p className="text-cyan-400 font-bold">{selectedTree.status}</p>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <p className="text-white/60">Optimized</p>
              <p className={selectedTree.optimized ? 'text-green-400' : 'text-red-400'}>
                {selectedTree.optimized ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}