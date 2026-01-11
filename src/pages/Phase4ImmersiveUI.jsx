import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Immersive3DDashboard from '../components/immersive/Immersive3DDashboard';
import HolographicAdvisor from '../components/immersive/HolographicAdvisor';
import MultiModalInteraction from '../components/immersive/MultiModalInteraction';
import { Sparkles, Zap } from 'lucide-react';

export default function Phase4ImmersiveUI() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const handleCommand = (command) => {
    console.log('Command received:', command);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Phase 4: Immersive UI/UX
          </h1>
          <p className="text-white/60 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            3D Dashboards • Holographic Advisors • Multi-modal Interaction
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Dashboard - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">3D Analytics Dashboard</h2>
              </div>
              <Immersive3DDashboard data={{}} />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-6 backdrop-blur">
              <p className="text-white/60 text-sm mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-cyan-400">$124.5K</p>
              <p className="text-green-400 text-sm mt-2">↑ 2.4% Today</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-6 backdrop-blur">
              <p className="text-white/60 text-sm mb-1">Active Agents</p>
              <p className="text-3xl font-bold text-purple-400">3</p>
              <p className="text-white/60 text-sm mt-2">Trading & Optimizing</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-lg p-6 backdrop-blur">
              <p className="text-white/60 text-sm mb-1">Monthly Yield</p>
              <p className="text-3xl font-bold text-emerald-400">+$3.2K</p>
              <p className="text-white/60 text-sm mt-2">DeFi Operations</p>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: '3D Dashboards',
              desc: 'Interactive 3D visualizations of your portfolio and analytics',
              icon: '🎯'
            },
            {
              title: 'Holographic Advisor',
              desc: 'AI-powered financial advisor with real-time insights',
              icon: '🤖'
            },
            {
              title: 'Multi-modal Control',
              desc: 'Voice, gesture, eye-tracking, and keyboard interaction',
              icon: '🎮'
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Interactive Components */}
      <HolographicAdvisor />
      <MultiModalInteraction onCommand={handleCommand} />
    </div>
  );
}