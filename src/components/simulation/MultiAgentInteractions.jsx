import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Brain, Zap } from 'lucide-react';

export default function MultiAgentInteractions({ agents, knowledgeData }) {
  const interactions = agents.flatMap((agent1, i) =>
    agents.slice(i + 1).map((agent2) => {
      const sharedKnowledge = knowledgeData.filter(
        (k) =>
          (k.agent_id === agent1.id || k.agent_id === agent2.id) &&
          k.tags?.includes('shared')
      );

      return {
        from: agent1,
        to: agent2,
        strength: sharedKnowledge.length,
        type: sharedKnowledge.length > 3 ? 'strong' : 'weak',
      };
    })
  );

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        Multi-Agent Interactions
      </h3>

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="text-white/60 text-center py-8">
            No agent interactions detected. Agents will begin interacting as the simulation runs.
          </div>
        ) : (
          interactions.map((interaction, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-r ${
                interaction.type === 'strong'
                  ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  : 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
              } border rounded-xl p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {interaction.from.name} ↔ {interaction.to.name}
                    </div>
                    <div className="text-white/60 text-sm">
                      {interaction.strength} shared knowledge items
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-white/5 rounded-lg h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(interaction.strength * 10, 100)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>
                <span className="text-white/60 text-xs">
                  {interaction.type === 'strong' ? 'Strong' : 'Weak'} Connection
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}