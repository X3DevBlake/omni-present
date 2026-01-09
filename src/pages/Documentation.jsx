import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, Code, Zap, Cpu, Radio, ChevronRight } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const docs = {
    'getting-started': [
      { title: 'Quick Start Guide', desc: 'Get up and running in 5 minutes', icon: Zap },
      { title: 'Creating Your First Agent', desc: 'Build an AI agent step-by-step', icon: Cpu },
      { title: 'Device Setup', desc: 'Connect and configure physical devices', icon: Radio }
    ],
    'labs': [
      { title: 'Lab Blueprints', desc: 'Design complex AI architectures', icon: Code },
      { title: 'Agent Behaviors', desc: 'Program agent decision trees', icon: Cpu },
      { title: 'Environment Creation', desc: 'Build custom simulation worlds', icon: Zap }
    ],
    'devices': [
      { title: 'Device API', desc: 'Control devices programmatically', icon: Code },
      { title: 'Telemetry Streaming', desc: 'Real-time sensor data access', icon: Radio },
      { title: 'Fleet Management', desc: 'Manage multiple devices at scale', icon: Cpu }
    ],
    'integrations': [
      { title: 'Integration Hub', desc: 'Connect 500+ external services', icon: Zap },
      { title: 'Custom Integrations', desc: 'Build your own connectors', icon: Code },
      { title: 'Webhooks', desc: 'Real-time event notifications', icon: Radio }
    ]
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Book className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Documentation</h1>
              <p className="text-white/60">Everything you need to master Omni-Present</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/40"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-4">Categories</h3>
            <div className="space-y-2">
              {Object.keys(docs).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid gap-4">
            {docs[selectedCategory].map((doc, i) => {
              const Icon = doc.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">{doc.title}</h3>
                        <p className="text-white/60 text-sm">{doc.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}