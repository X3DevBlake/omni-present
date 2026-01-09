import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, Layers, Users, Zap, BarChart3, Brain, Code, Cpu, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Interactive3DBanner from '../components/3d/Interactive3DBanner';

export default function LabsHome() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Interactive3DBanner
            title="Labs Hub"
            subtitle="Create, test, and deploy AI agents"
            color="#a855f7"
            height="400px"
          />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Agent Creator', description: 'Build custom AI agents from scratch', icon: Bot, page: 'Labs', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Blueprint Designer', description: 'Design complex system architectures', icon: Layers, page: 'Labs', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { title: 'Agent Management', description: 'Monitor and control deployed agents', icon: Users, page: 'AgentManagement', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
            { title: 'Evolution Dashboard', description: 'Track agent learning and adaptation', icon: TrendingUp, page: 'EvolutionDashboardPage', gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
            { title: 'Agent Audio Studio', description: 'Create custom AI voice profiles', icon: Zap, page: 'AgentAudio', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { title: 'Behavior Analytics', description: 'Deep insights into agent performance', icon: BarChart3, page: 'Analytics', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
            { title: 'Environment Designer', description: 'Build immersive 3D test worlds', icon: Sparkles, page: 'EnvironmentDesigner', gradient: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' },
            { title: 'Code Editor', description: 'Write custom behavior scripts', icon: Code, page: 'CodeEditor', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
            { title: 'Scenario Testing', description: 'Validate agents in controlled environments', icon: Brain, page: 'ScenarioTesting', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30' },
            { title: 'Advanced Simulation', description: 'Multi-agent real-time physics', icon: Cpu, page: 'AdvancedSimulation', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}