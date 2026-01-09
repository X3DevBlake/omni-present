import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Zap, TrendingUp } from 'lucide-react';

export default function MultiAgentInteraction({ agents, isRunning }) {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        generateInteraction();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRunning, agents]);

  const generateInteraction = () => {
    if (agents.length < 2) return;

    const agent1 = agents[Math.floor(Math.random() * agents.length)];
    const agent2 = agents[Math.floor(Math.random() * agents.length)];
    
    if (agent1.id === agent2.id) return;

    const interactionTypes = [
      { type: 'knowledge_share', icon: MessageSquare, color: 'cyan', text: `${agent1.name} shared knowledge with ${agent2.name}` },
      { type: 'collaboration', icon: Users, color: 'purple', text: `${agent1.name} collaborated with ${agent2.name}` },
      { type: 'competition', icon: Zap, color: 'orange', text: `${agent1.name} competed with ${agent2.name}` },
      { type: 'learning', icon: TrendingUp, color: 'green', text: `${agent1.name} learned from ${agent2.name}` }
    ];

    const interaction = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
    
    setInteractions(prev => [
      { ...interaction, id: Date.now(), timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-xl">Multi-Agent Interactions</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-white/60 text-sm">{isRunning ? 'Active' : 'Paused'}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {interactions.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            {isRunning ? 'Waiting for interactions...' : 'Start simulation to see interactions'}
          </div>
        ) : (
          interactions.map((interaction) => {
            const Icon = interaction.icon;
            return (
              <motion.div
                key={interaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${interaction.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${interaction.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{interaction.text}</div>
                    <div className="text-white/40 text-xs mt-1">
                      {interaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}