import React from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

export default function AgentBehaviorNetwork({ agents, interactions }) {
  const getInteractionCount = (agentId) => {
    return interactions.filter(i => 
      i.agent_a_id === agentId || i.agent_b_id === agentId
    ).length;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Network className="w-5 h-5 text-cyan-400" />
        Agent Communication Network
      </h3>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {agents.slice(0, 10).map((agent, idx) => {
          const count = getInteractionCount(agent.id);
          const percentage = (count / Math.max(interactions.length, 1)) * 100;
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 rounded p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">{agent.name}</p>
                  {agent.tier && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                      agent.tier.tier === 'diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                      agent.tier.tier === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                      agent.tier.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      agent.tier.tier === 'silver' ? 'bg-gray-300/20 text-gray-300' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {agent.tier.tier}
                    </span>
                  )}
                </div>
                <span className="text-cyan-400 text-xs font-bold">{count} interactions</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {agent.personality_traits && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {Object.entries(agent.personality_traits).slice(0, 2).map(([trait, value]) => (
                    <span key={trait} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {trait}: {(value * 100).toFixed(0)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}