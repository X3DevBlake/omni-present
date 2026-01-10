import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Filter, Users, TrendingUp, Shield } from 'lucide-react';

export default function SocialNetworkGraph({ show, onClose, agents, factions, alliances, conflicts }) {
  const canvasRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!agents) return;

    const nodeData = agents.map((agent, i) => ({
      id: agent.id,
      x: Math.cos((i / agents.length) * Math.PI * 2) * 150 + 250,
      y: Math.sin((i / agents.length) * Math.PI * 2) * 150 + 250,
      vx: 0,
      vy: 0,
      agent,
      radius: 10 + (agent.reputation || 50) / 10
    }));

    const edgeData = [];
    
    // Add relationship edges
    agents.forEach(agent1 => {
      if (agent1.relationships && agent1.relationships instanceof window.Map) {
        agent1.relationships.forEach((strength, agent2Id) => {
          const agent2 = agents.find(a => a.id === agent2Id);
          if (agent2) {
            edgeData.push({
              source: agent1.id,
              target: agent2Id,
              type: strength > 50 ? 'alliance' : strength < -20 ? 'conflict' : 'neutral',
              strength: Math.abs(strength)
            });
          }
        });
      }
    });

    setNodes(nodeData);
    setEdges(edgeData);
  }, [agents]);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 500;
    const height = canvas.height = 500;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Apply forces
      nodes.forEach((node, i) => {
        let fx = 0, fy = 0;

        // Repulsion from other nodes
        nodes.forEach((other, j) => {
          if (i !== j) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 500 / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        });

        // Attraction to center
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        fx += dx * 0.01;
        fy += dy * 0.01;

        // Update velocity and position
        node.vx = (node.vx + fx) * 0.9;
        node.vy = (node.vy + fy) * 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });

      // Draw edges
      edges.forEach(edge => {
        if (!edge || filter !== 'all' && filter !== edge.type) return;

        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = edge.type === 'alliance' ? '#10b981' : edge.type === 'conflict' ? '#ef4444' : '#ffffff30';
        ctx.lineWidth = edge.strength / 50;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const agent = node.agent;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = agent.color || '#00f5ff';
        ctx.fill();
        
        // Border for selected
        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Hierarchy indicator
        if (agent.hierarchyTier === 'alpha') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, node.x, node.y + node.radius + 12);
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clicked = nodes.find(node => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.radius;
      });

      setSelectedNode(clicked || null);
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [nodes, edges, filter, selectedNode]);

  if (!show) return null;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Social Network</h3>
              <p className="text-white/60 text-sm">Agent relationships & dynamics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-4">
                {['all', 'alliance', 'conflict', 'neutral'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-sm ${filter === f ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl overflow-hidden">
                <canvas ref={canvasRef} width={500} height={500} className="w-full" />
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/70">Alliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-white/70">Conflict</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-400" />
                  <span className="text-white/70">Alpha Agent</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedNode ? (
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="text-cyan-400 font-semibold mb-3">{selectedNode.agent.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Type</span>
                      <span className="text-white">{selectedNode.agent.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Reputation</span>
                      <span className="text-cyan-400">{selectedNode.agent.reputation || 50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Hierarchy</span>
                      <span className="text-yellow-400">{selectedNode.agent.hierarchyTier || 'omega'}</span>
                    </div>
                    {selectedNode.agent.factionId && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Faction</span>
                        <span className="text-purple-400">Member</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-white/60 text-sm">
                  Click on an agent to view details
                </div>
              )}

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-400 font-semibold">Network Stats</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Agents</span>
                    <span className="text-white">{agents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Alliances</span>
                    <span className="text-green-400">{edges.filter(e => e.type === 'alliance').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Conflicts</span>
                    <span className="text-red-400">{edges.filter(e => e.type === 'conflict').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Factions</span>
                    <span className="text-purple-400">{factions?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}