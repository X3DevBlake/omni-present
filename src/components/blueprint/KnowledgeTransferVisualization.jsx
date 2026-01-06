import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Users, Zap, BookOpen } from 'lucide-react';

export function KnowledgeTransferVisualization({ collectiveKnowledge, agents }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !collectiveKnowledge) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { nodes, links } = collectiveKnowledge.getKnowledgeTransferMap();
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const positions = new Map();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    
    // Position nodes in circle
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    });
    
    // Add collective center
    positions.set('collective', { x: centerX, y: centerY });
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw links
      links.forEach(link => {
        const source = positions.get(link.source);
        const target = positions.get(link.target);
        
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = link.type === 'skill' ? '#00f5ff40' : 
                           link.type === 'strategy' ? '#a855f740' : '#ec489940';
          ctx.lineWidth = Math.max(1, link.value / 5);
          ctx.stroke();
        }
      });
      
      // Draw nodes
      positions.forEach((pos, id) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, id === 'collective' ? 15 : 8, 0, Math.PI * 2);
        ctx.fillStyle = id === 'collective' ? '#00f5ff' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#00f5ff80';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [collectiveKnowledge, agents]);
  
  if (!collectiveKnowledge) return null;
  
  const stats = collectiveKnowledge.getStats();
  const topContributors = collectiveKnowledge.getTopContributors();
  const valuableKnowledge = collectiveKnowledge.getMostValuableKnowledge();
  const trendingStrategies = collectiveKnowledge.getTrendingStrategies();
  
  return (
    <div className="space-y-6">
      {/* Network Visualization */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h4 className="text-cyan-400 font-semibold">Knowledge Transfer Network</h4>
        </div>
        <canvas ref={canvasRef} className="w-full h-64 rounded-lg bg-black/20" />
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400" />
            <span className="text-white/60">Skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-400" />
            <span className="text-white/60">Strategies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-pink-400" />
            <span className="text-white/60">Norms</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs mb-1">Total Knowledge</div>
          <div className="text-white text-2xl font-bold">{stats.totalKnowledge}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-purple-400 text-xs mb-1">Strategies</div>
          <div className="text-white text-2xl font-bold">{stats.totalStrategies}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 text-xs mb-1">Transfers</div>
          <div className="text-white text-2xl font-bold">{stats.totalTransfers}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-3">
          <div className="text-orange-400 text-xs mb-1">Cultural Norms</div>
          <div className="text-white text-2xl font-bold">{stats.culturalNorms}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-yellow-400 text-xs mb-1">Innovations</div>
          <div className="text-white text-2xl font-bold">{stats.innovations}</div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-yellow-400" />
          <h4 className="text-yellow-400 font-semibold">Top Knowledge Contributors</h4>
        </div>
        <div className="space-y-2">
          {topContributors.map((contributor, i) => {
            const agent = agents?.find(a => a.id === contributor.id);
            return (
              <div key={contributor.id} className="flex items-center justify-between bg-white/5 rounded p-2">
                <div className="flex items-center gap-3">
                  <div className="text-yellow-400 font-bold text-sm">#{i + 1}</div>
                  <span className="text-white text-sm">{agent?.name || contributor.id}</span>
                </div>
                <span className="text-yellow-400 text-sm font-medium">{contributor.contributions} contributions</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Valuable Knowledge */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-green-400" />
          <h4 className="text-green-400 font-semibold">Most Valuable Knowledge</h4>
        </div>
        <div className="space-y-2">
          {valuableKnowledge.map(knowledge => (
            <div key={knowledge.skill} className="flex items-center justify-between bg-white/5 rounded p-2">
              <span className="text-white text-sm capitalize">{knowledge.skill.replace('_', ' ')}</span>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 text-xs">Level {knowledge.level.toFixed(0)}</span>
                <span className="text-green-400 text-xs">{knowledge.uses} uses</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Strategies */}
      {trendingStrategies.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h4 className="text-purple-400 font-semibold">Trending Strategies</h4>
          </div>
          <div className="space-y-2">
            {trendingStrategies.map(strategy => {
              const agent = agents?.find(a => a.id === strategy.contributor);
              return (
                <div key={strategy.id} className="bg-white/5 rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white text-sm">{strategy.strategy?.name || 'Unnamed Strategy'}</span>
                    <span className="text-purple-400 text-xs">{strategy.adoptions} adoptions</span>
                  </div>
                  <div className="text-white/60 text-xs">By: {agent?.name || strategy.contributor}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transfers */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h4 className="text-cyan-400 font-semibold">Recent Knowledge Transfers</h4>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {stats.recentTransfers.map((transfer, i) => {
            const fromAgent = agents?.find(a => a.id === transfer.from);
            const toAgent = agents?.find(a => a.id === transfer.to);
            return (
              <div key={i} className="flex items-center gap-2 text-xs bg-white/5 rounded p-2">
                <span className="text-white/80">{fromAgent?.name || transfer.from}</span>
                <span className="text-cyan-400">→</span>
                <span className="text-white/80">{toAgent?.name || transfer.to}</span>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                  transfer.type === 'skill' ? 'bg-cyan-500/20 text-cyan-300' :
                  transfer.type === 'strategy' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-pink-500/20 text-pink-300'
                }`}>
                  {transfer.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}