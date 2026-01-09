import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, CheckCircle, XCircle, Settings, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import IntegrationHub from '../components/integrations/IntegrationHub';

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Integrations', icon: '🌐', count: 200 },
    { id: 'ai', name: 'AI & ML', icon: '🧠', count: 45 },
    { id: 'data', name: 'Data & Analytics', icon: '📊', count: 38 },
    { id: 'communication', name: 'Communication', icon: '💬', count: 32 },
    { id: 'financial', name: 'Financial', icon: '💰', count: 28 },
    { id: 'productivity', name: 'Productivity', icon: '⚡', count: 35 },
    { id: 'security', name: 'Security', icon: '🔒', count: 22 }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">200+</span> Integrations
          </h1>
          <p className="text-white/60 text-lg">Connect your AI simulations to the entire digital ecosystem</p>
        </motion.div>

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/40 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-white text-sm font-medium mb-1">{cat.name}</div>
              <div className="text-cyan-400 text-xs">{cat.count}</div>
            </button>
          ))}
        </div>

        <IntegrationHub show={true} />
      </div>
    </AuroraBackground>
  );
}