import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plus, Zap, Brain, Settings, Trash2, Play, Pause } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AgentManagement() {
  const [agents] = useState([
    { id: 1, name: 'Explorer-Alpha', type: 'Scout', status: 'active', experience: 450 },
    { id: 2, name: 'Guardian-Beta', type: 'Defense', status: 'training', experience: 320 },
    { id: 3, name: 'Strategist-Gamma', type: 'Planning', status: 'active', experience: 580 },
    { id: 4, name: 'Innovator-Delta', type: 'Creative', status: 'idle', experience: 210 }
  ]);

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Agent Management</h1>
            <p className="text-white/60">Create, train, and deploy your AI agent fleet</p>
          </div>
          <Link to={createPageUrl('AgentAudio')}>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Agent
            </button>
          </Link>
        </motion.div>

        <div className="grid gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white/60">{agent.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                      <span className="text-yellow-400">{agent.experience} XP</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30">
                    {agent.status === 'active' ? <Pause className="w-5 h-5 text-blue-400" /> : <Play className="w-5 h-5 text-blue-400" />}
                  </button>
                  <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </button>
                  <button className="p-2 bg-gray-500/20 rounded-lg hover:bg-gray-500/30">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}