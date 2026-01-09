import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function KnowledgeFlowVisualizer() {
  const [knowledgeFlow, setKnowledgeFlow] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledgeFlow();
  }, []);

  const loadKnowledgeFlow = async () => {
    try {
      const data = await base44.entities.SharedKnowledge.list('-times_accessed', 50);
      
      // Create flow visualization data
      const flowData = data.map((item, i) => ({
        id: item.id,
        title: item.title,
        publisher: item.publisher_agent_id,
        type: item.knowledge_type,
        accessed: item.times_accessed,
        adopters: (item.agents_incorporating || []).length,
        impact: item.impact_score,
        x: Math.cos(i * ((2 * Math.PI) / Math.max(data.length, 1))) * 200,
        y: Math.sin(i * ((2 * Math.PI) / Math.max(data.length, 1))) * 200,
        data: item
      }));

      setKnowledgeFlow(flowData);
    } catch (err) {
      console.error('Failed to load knowledge flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    discovery: 'from-cyan-400 to-blue-400',
    technique: 'from-green-400 to-emerald-400',
    insight: 'from-purple-400 to-pink-400',
    warning: 'from-red-400 to-orange-400',
    opportunity: 'from-yellow-400 to-amber-400',
    synthesis: 'from-indigo-400 to-purple-400'
  };

  if (loading) {
    return <div className="text-white/40">Loading knowledge network...</div>;
  }

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          Knowledge Flow Network
        </h3>
        <span className="text-xs text-white/50">{knowledgeFlow.length} items</span>
      </div>

      {/* Network Visualization */}
      <div className="relative h-96 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Center point */}
          <circle cx="50%" cy="50%" r="3" fill="#00f5ff" opacity="0.5" />

          {/* Knowledge nodes */}
          {knowledgeFlow.map((node) => {
            const x = parseInt(svg.getAttribute('width') || 0) / 2 + node.x;
            const y = parseInt(svg.getAttribute('height') || 0) / 2 + node.y;
            const colors = typeColors[node.type] || typeColors.discovery;
            
            return (
              <motion.g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.3 }}
                className="cursor-pointer"
              >
                {/* Connection line to center */}
                <line
                  x1={x}
                  y1={y}
                  x2="50%"
                  y2="50%"
                  stroke="rgba(0, 245, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={5 + (node.impact / 15)}
                  fill={`url(#grad_${node.type})`}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                />

                {/* Adoption indicator */}
                {node.adopters > 0 && (
                  <circle
                    cx={x}
                    cy={y}
                    r={5 + (node.impact / 15) + node.adopters}
                    fill="none"
                    stroke="rgba(0, 245, 255, 0.3)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </motion.g>
            );
          })}

          {/* Gradients */}
          <defs>
            {Object.entries(typeColors).map(([type, colors]) => {
              const [from, to] = colors.split(' ');
              return (
                <linearGradient key={`grad_${type}`} id={`grad_${type}`}>
                  <stop offset="0%" stopColor={from} />
                  <stop offset="100%" stopColor={to} />
                </linearGradient>
              );
            })}
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {Object.entries(typeColors).map(([type, _]) => (
          <div key={type} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${typeColors[type]}`} />
            <span className="text-white/60 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-cyan-500/30 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-cyan-400 text-sm font-bold">{selectedNode.data.title}</p>
            <span className={`text-xs bg-gradient-to-r ${typeColors[selectedNode.type]} bg-clip-text text-transparent font-bold`}>
              {selectedNode.type}
            </span>
          </div>

          <p className="text-white/80 text-sm">{selectedNode.data.content}</p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
            <div className="text-center">
              <p className="text-cyan-400 text-lg font-bold">{selectedNode.accessed}</p>
              <p className="text-white/60 text-xs">Accessed</p>
            </div>
            <div className="text-center">
              <p className="text-green-400 text-lg font-bold">{selectedNode.adopters}</p>
              <p className="text-white/60 text-xs">Adopters</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-lg font-bold">{selectedNode.impact}</p>
              <p className="text-white/60 text-xs">Impact</p>
            </div>
          </div>

          {selectedNode.data.agents_incorporating?.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-green-400 text-xs font-bold mb-1">Agents Using This:</p>
              <div className="flex gap-1 flex-wrap">
                {selectedNode.data.agents_incorporating.map(agent => (
                  <span key={agent} className="text-xs bg-green-500/20 px-2 py-0.5 rounded text-green-300">
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {knowledgeFlow.length === 0 && (
        <div className="text-center py-8 text-white/40">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No shared knowledge yet</p>
        </div>
      )}
    </div>
  );
}