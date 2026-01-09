import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, Brain, ZoomIn, ZoomOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentMemoryNetwork({ agentId }) {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, [agentId]);

  const loadMemories = async () => {
    try {
      const data = await base44.entities.AgentMemory.filter(
        { agent_id: agentId },
        '-importance_score',
        100
      );
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const networkData = useMemo(() => {
    let filtered = memories;
    if (filter !== 'all') {
      filtered = memories.filter(m => m.memory_type === filter);
    }

    // Create node connections based on tags
    const nodes = filtered.map((m, i) => ({
      id: m.id,
      label: m.content.substring(0, 20) + '...',
      type: m.memory_type,
      importance: m.importance_score,
      x: Math.cos(i * ((2 * Math.PI) / filtered.length)) * 150,
      y: Math.sin(i * ((2 * Math.PI) / filtered.length)) * 150,
      data: m
    }));

    const edges = [];
    filtered.forEach((m, i) => {
      if (m.related_memories) {
        m.related_memories.forEach(relatedId => {
          const j = filtered.findIndex(mem => mem.id === relatedId);
          if (j !== -1) {
            edges.push({ source: i, target: j, strength: 0.5 });
          }
        });
      }
    });

    return { nodes, edges };
  }, [memories, filter]);

  const typeColors = {
    interaction: 'from-blue-400 to-cyan-400',
    learned_fact: 'from-green-400 to-emerald-400',
    user_preference: 'from-purple-400 to-pink-400',
    context: 'from-yellow-400 to-orange-400',
    behavior_pattern: 'from-red-400 to-pink-400'
  };

  if (loading) {
    return <div className="text-white/40">Loading memory network...</div>;
  }

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          Memory Network
        </h3>
        <span className="text-xs text-white/50">{networkData.nodes.length} memories</span>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'interaction', 'learned_fact', 'user_preference', 'context', 'behavior_pattern'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              filter === type
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 3D-like Network Visualization */}
      <div className="relative h-96 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="100%"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          className="transition-transform"
        >
          {/* Edges */}
          {networkData.edges.map((edge, i) => {
            const source = networkData.nodes[edge.source];
            const target = networkData.nodes[edge.target];
            return (
              <line
                key={`edge_${i}`}
                x1={source.x + 200}
                y1={source.y + 200}
                x2={target.x + 200}
                y2={target.y + 200}
                stroke="rgba(0, 245, 255, 0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Nodes */}
          {networkData.nodes.map(node => (
            <motion.g
              key={node.id}
              onClick={() => setSelectedMemory(node.data)}
              whileHover={{ scale: 1.2 }}
              className="cursor-pointer"
            >
              <circle
                cx={node.x + 200}
                cy={node.y + 200}
                r={5 + (node.importance / 20)}
                fill={`url(#grad_${node.type})`}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
            </motion.g>
          ))}

          {/* Gradients */}
          <defs>
            {Object.entries(typeColors).map(([type, colors]) => (
              <linearGradient key={`grad_${type}`} id={`grad_${type}`}>
                <stop offset="0%" stopColor={colors.split(' ')[1]} />
                <stop offset="100%" stopColor={colors.split(' ')[3]} />
              </linearGradient>
            ))}
          </defs>
        </svg>
      </div>

      {/* Zoom Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="p-2 bg-white/10 border border-white/20 rounded hover:bg-white/20"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <span className="text-white/60 text-sm px-2 flex items-center">{(zoom * 100).toFixed(0)}%</span>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="p-2 bg-white/10 border border-white/20 rounded hover:bg-white/20"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Selected Memory Details */}
      {selectedMemory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-cyan-500/30 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-cyan-400 text-xs font-bold uppercase">{selectedMemory.memory_type}</p>
            <p className="text-white/60 text-xs">Importance: {selectedMemory.importance_score}%</p>
          </div>
          <p className="text-white/80 text-sm break-words">{selectedMemory.content}</p>
          {selectedMemory.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {selectedMemory.tags.map(tag => (
                <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-white/50 text-xs">
            Accessed {selectedMemory.access_count} times • Last: {selectedMemory.last_accessed ? new Date(selectedMemory.last_accessed).toLocaleString() : 'Never'}
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-white/60 text-xs font-bold mb-2">Memory Types:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(typeColors).map(([type, _]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${typeColors[type]}`} />
              <span className="text-white/60 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}