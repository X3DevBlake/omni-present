import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, HardDrive, Wifi, ChevronRight, X, Info, Layers, Plus, MessageCircle, Send, Users, History, Share2, Save, FolderOpen, Wand2, Gauge, Bot, Map as MapIcon, Box, GitBranch, Brain, Video, Award, Zap, Settings, Target, DollarSign, Sparkles, Beaker, BarChart3 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Labs() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">🧪 Labs Hub</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            AI Development
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Laboratory</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Build, train, and deploy intelligent agents. Design complex simulations, experiment with AI models, and push the boundaries of what's possible.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Active Experiments', value: '24', icon: Beaker, color: 'cyan' },
            { label: 'Trained Models', value: '156', icon: Brain, color: 'purple' },
            { label: 'Simulations', value: '89', icon: Zap, color: 'pink' },
            { label: 'Agents Created', value: '342', icon: Bot, color: 'blue' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Navigation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Blueprint Designer',
              description: 'Visual AI architecture builder with 3D component visualization',
              icon: Cpu,
              page: 'Blueprint',
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30',
              iconColor: 'text-cyan-400'
            },
            {
              title: 'AI Lab',
              description: 'Experiment with cutting-edge AI models and algorithms',
              icon: Brain,
              page: 'AILab',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30',
              iconColor: 'text-purple-400'
            },
            {
              title: 'Simulation World',
              description: 'Create immersive 3D environments for agent testing',
              icon: MapIcon,
              page: 'SimulationWorld',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30',
              iconColor: 'text-green-400'
            },
            {
              title: 'Agent Management',
              description: 'Create, train, and manage your AI agent fleet',
              icon: Bot,
              page: 'AgentManagement',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              border: 'border-blue-500/30',
              iconColor: 'text-blue-400'
            },
            {
              title: 'Agent Audio',
              description: 'Generate custom voices for your AI agents',
              icon: MessageCircle,
              page: 'AgentAudio',
              gradient: 'from-pink-500/20 to-red-500/20',
              border: 'border-pink-500/30',
              iconColor: 'text-pink-400'
            },
            {
              title: 'Evolution Dashboard',
              description: 'Track genetic algorithms and agent evolution',
              icon: GitBranch,
              page: 'EvolutionDashboardPage',
              gradient: 'from-orange-500/20 to-yellow-500/20',
              border: 'border-orange-500/30',
              iconColor: 'text-orange-400'
            },
            {
              title: 'Analytics',
              description: 'Deep insights into AI performance and behavior',
              icon: BarChart3,
              page: 'Analytics',
              gradient: 'from-indigo-500/20 to-purple-500/20',
              border: 'border-indigo-500/30',
              iconColor: 'text-indigo-400'
            },
            {
              title: 'Environment Designer',
              description: 'Build procedural 3D worlds and scenarios',
              icon: Box,
              page: 'EnvironmentDesigner',
              gradient: 'from-teal-500/20 to-cyan-500/20',
              border: 'border-teal-500/30',
              iconColor: 'text-teal-400'
            },
            {
              title: 'Code Editor',
              description: 'Advanced IDE for custom AI behavior scripting',
              icon: Settings,
              page: 'CodeEditor',
              gradient: 'from-gray-500/20 to-slate-500/20',
              border: 'border-gray-500/30',
              iconColor: 'text-gray-400'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          className="mt-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Recent Lab Activity
          </h3>
          <div className="space-y-3">
            {[
              { action: 'Blueprint "Advanced Vision System" updated', time: '2 minutes ago', type: 'blueprint' },
              { action: 'Agent "Explorer-7" completed training', time: '15 minutes ago', type: 'agent' },
              { action: 'Simulation "Urban Navigation" deployed', time: '1 hour ago', type: 'simulation' },
              { action: 'New voice model "Professional-Male-01" generated', time: '2 hours ago', type: 'audio' }
            ].map((activity, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'blueprint' ? 'bg-cyan-400' :
                    activity.type === 'agent' ? 'bg-purple-400' :
                    activity.type === 'simulation' ? 'bg-green-400' :
                    'bg-pink-400'
                  }`} />
                  <span className="text-white text-sm">{activity.action}</span>
                </div>
                <span className="text-white/40 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}