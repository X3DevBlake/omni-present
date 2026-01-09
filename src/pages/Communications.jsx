import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import AgentCommunicationArena3D from '../components/communication/AgentCommunicationArena3D';

export default function Communications() {
  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <EnhancedHubNav currentHub="Communications" />

      <div className="max-w-7xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Communication Arena</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Interact with simulated agents in real-time. Visualize their thoughts, communications, and collaborative problem-solving in an immersive 3D environment.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Active Agents', value: '4', color: 'cyan' },
            { icon: MessageSquare, label: 'Messages Today', value: '127', color: 'purple' },
            { icon: Zap, label: 'System Activity', value: '89%', color: 'green' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const colorClasses = {
              cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
              purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
              green: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${colorClasses[stat.color]} border rounded-xl p-4`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3D Arena */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8"
        >
          <AgentCommunicationArena3D />
        </motion.div>

        {/* Communication Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid md:grid-cols-2 gap-4"
        >
          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-3">💡 Communication Tips</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>• Click on agents to select them for communication</li>
              <li>• Use voice input for natural language commands</li>
              <li>• Agents respond with real-time insights and analysis</li>
              <li>• Monitor agent activity through the visualization</li>
            </ul>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold mb-3">🎯 Agent Specializations</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>• <span className="text-cyan-400">AnalysisBot</span> - Market analysis & insights</li>
              <li>• <span className="text-green-400">TradeBot</span> - Trade execution & optimization</li>
              <li>• <span className="text-purple-400">ResearchBot</span> - Data research & discovery</li>
              <li>• <span className="text-yellow-400">OptimizeBot</span> - System optimization</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}