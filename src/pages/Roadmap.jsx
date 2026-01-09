import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Roadmap3DVisualizer from '../components/3d/Roadmap3DVisualizer';
import { useNavigate } from 'react-router-dom';

export default function Roadmap() {
  const navigate = useNavigate();
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const roadmapItems = [
    {
      title: 'Q1 2026',
      description: 'AI Integration Phase',
      details: 'Deep integration of LLM capabilities across the platform, advanced agent reasoning systems, and meta-analysis frameworks.'
    },
    {
      title: 'Q2 2026',
      description: 'DeFi Expansion',
      details: 'Enhanced liquidity pools, multi-chain support, advanced yield farming strategies, and risk assessment tools.'
    },
    {
      title: 'Q3 2026',
      description: 'Device Ecosystem',
      details: 'Full IoT integration, device marketplace launch, fleet management, and real-world integration capabilities.'
    },
    {
      title: 'Q4 2026',
      description: 'Full Integration',
      details: 'Complete platform unification, cross-hub capabilities, advanced analytics, and governance features.'
    }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Platform <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Roadmap</span>
            </h1>
            <p className="text-white/60">Explore our vision for 2026 across all platforms</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* 3D Roadmap Visualizer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="h-96 bg-black/40 rounded-2xl border border-white/10 overflow-hidden mb-12"
        >
          <Roadmap3DVisualizer
            roadmapItems={roadmapItems}
            onPlanetClick={(index, planet) => setSelectedPlanet(roadmapItems[index])}
          />
        </motion.div>

        {/* Selected Planet Details */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8 mb-12"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedPlanet.title}</h2>
                  <p className="text-cyan-400 text-lg">{selectedPlanet.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-white/70">{selectedPlanet.details}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {roadmapItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPlanet(item)}
              className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-105"
            >
              <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-cyan-400 mb-3">{item.description}</p>
              <p className="text-white/60 text-sm">{item.details}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}