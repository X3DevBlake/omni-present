import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Sparkles, Image as ImageIcon, FileUp, Zap } from 'lucide-react';
import TextGenerator from '../components/ai/TextGenerator';
import ImageGenerator from '../components/ai/ImageGenerator';
import DataExtractor from '../components/ai/DataExtractor';
import GlassCard from '../components/omni/GlassCard';

export default function AIPlayground() {
  const [activeTab, setActiveTab] = useState('text');

  const tabs = [
    { id: 'text', label: 'Text Generation', icon: Sparkles, component: TextGenerator },
    { id: 'image', label: 'Image Generation', icon: ImageIcon, component: ImageGenerator },
    { id: 'extract', label: 'Data Extraction', icon: FileUp, component: DataExtractor },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30">
              <Zap className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            AI <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Playground</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Experience the power of Omni-Present AI. Generate text, create images, and extract structured data from files.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-8 flex-wrap"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Active Component */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8">
            {ActiveComponent && <ActiveComponent />}
          </GlassCard>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4 mt-8"
        >
          {[
            { title: 'Real-Time Processing', desc: 'AI models respond in milliseconds', color: 'cyan' },
            { title: 'Advanced Models', desc: 'Powered by state-of-the-art AI', color: 'purple' },
            { title: 'Secure & Private', desc: 'Your data is encrypted end-to-end', color: 'pink' },
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 text-center" glowColor={item.color}>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </AuroraBackground>
  );
}