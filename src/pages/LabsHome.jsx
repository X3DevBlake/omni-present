import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, Layers, Users, Zap, BarChart3, Brain, Code, Cpu, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import AI3DBrain from '../components/3d/AI3DBrain';
import HubSpecificAgents from '../components/ai/HubSpecificAgents';
import InterAgentCommunication from '../components/ai/InterAgentCommunication';
import AICoachingSystem from '../components/ai/AICoachingSystem';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { usePersonalization } from '../components/personalization/PersonalizationContext';

export default function LabsHome() {
  const { trackPageVisit } = usePersonalization();

  useEffect(() => {
    trackPageVisit('LabsHome');
  }, []);

  return (
    <>
      <EnhancedHubNav currentHub="LabsHome" />
      <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden h-96">
            <AI3DBrain />
          </div>
          <div className="text-center mt-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              Omni <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Labs</span>
            </h1>
            <p className="text-white/60 text-lg">Create, test, and deploy AI agents with advanced neural processing</p>
          </div>
        </motion.div>

        {/* Hub-Specific Agents */}
        <div className="mb-12">
          <HubSpecificAgents hubType="labs" />
        </div>

        {/* Inter-Agent Communication */}
        <div className="mb-12">
          <InterAgentCommunication />
        </div>

        {/* AI Coaching */}
        <div className="mb-12">
          <AICoachingSystem />
        </div>

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
    </>
  );
}