import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, GitBranch } from 'lucide-react';

export default function SocietyAnalytics({ society, show }) {
  const relationshipGraph = useMemo(() => {
    if (!society?.agents) return [];
    return society.agents.slice(0, 10).map((agent, i) => ({
      id: agent.id,
      name: agent.name,
      connections: Array.from(agent.relationships?.entries() || [])
        .filter(([_, val]) => val > 50)
        .map(([id]) => id)
    }));
  }, [society?.agents]);

  const resourceFlow = useMemo(() => {
    if (!society?.resources) return [];
    return Object.entries(society.resources).map(([key, value]) => ({
      name: key,
      value,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  }, [society?.resources]);

  const culturalHeatmap = useMemo(() => {
    if (!society?.culturalTraits) return [];
    return society.culturalTraits.map(trait => ({
      trait,
      intensity: Math.floor(Math.random() * 100),
      spread: Math.floor(Math.random() * 100)
    }));
  }, [society?.culturalTraits]);

  if (!show) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Relationship Graph */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-400" />
          <h4 className="text-blue-400 font-semibold">Agent Relationship Graph</h4>
        </div>
        <div className="relative h-40 bg-black/20 rounded-lg overflow-hidden">
          {relationshipGraph.map((agent, i) => (
            <div key={agent.id} className="absolute" style={{ left: `${(i % 5) * 20}%`, top: `${Math.floor(i / 5) * 50}%` }}>
              <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                <span className="text-white text-xs">{i + 1}</span>
              </div>
              {agent.connections.slice(0, 2).map((connId, j) => {
                const targetIdx = relationshipGraph.findIndex(a => a.id === connId);
                if (targetIdx === -1) return null;
                return (
                  <svg key={j} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                    <line x1="16" y1="16" x2={`${(targetIdx % 5) * 20 - (i % 5) * 20}%`} y2={`${(Math.floor(targetIdx / 5) * 50 - Math.floor(i / 5) * 50)}%`} stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
                  </svg>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-white/60">Showing top 10 agents with strong relationships (&gt;50)</div>
      </div>

      {/* Resource Flow */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h4 className="text-green-400 font-semibold">Resource Flow Diagram</h4>
        </div>
        <div className="space-y-2">
          {resourceFlow.map(resource => (
            <div key={resource.name} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-white/70 text-sm capitalize">{resource.name}</span>
                  <span className="text-white text-sm">{resource.value.toFixed(0)}</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (resource.value / 100) * 100)}%` }} />
                </div>
              </div>
              <div className={`text-xs ${resource.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {resource.trend === 'up' ? '↑' : '↓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Trait Heatmap */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <h4 className="text-purple-400 font-semibold">Cultural Trait Propagation</h4>
        </div>
        {culturalHeatmap.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {culturalHeatmap.map(trait => (
              <div key={trait.trait} className="bg-black/20 rounded-lg p-2">
                <div className="text-purple-300 text-xs font-medium capitalize mb-1">{trait.trait.replace('_', ' ')}</div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-4 w-full rounded ${i < (trait.intensity / 20) ? 'bg-purple-500' : 'bg-purple-500/20'}`} />
                  ))}
                </div>
                <div className="text-white/50 text-xs mt-1">Spread: {trait.spread}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-sm">No cultural traits yet</div>
        )}
      </div>
    </motion.div>
  );
}