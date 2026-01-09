import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Eye, Download, Star } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function BlueprintGallery() {
  const blueprints = [
    { id: 1, name: 'Vision System Architecture', author: 'Sarah Chen', views: 1240, downloads: 340, rating: 4.9 },
    { id: 2, name: 'Multi-Agent Coordinator', author: 'Alex Kumar', views: 890, downloads: 230, rating: 4.8 },
    { id: 3, name: 'Resource Management Core', author: 'Maria Garcia', views: 2100, downloads: 560, rating: 4.7 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Blueprint Gallery</h1>
          <p className="text-white/60">Community-shared AI architectures</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint, i) => (
            <motion.div key={blueprint.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="w-full h-40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                <Layers className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-white font-bold mb-2">{blueprint.name}</h3>
              <p className="text-white/60 text-sm mb-3">by {blueprint.author}</p>
              <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blueprint.views}</span>
                <span className="flex items-center gap-1"><Download className="w-3 h-3" />{blueprint.downloads}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{blueprint.rating}</span>
              </div>
              <button className="w-full py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/30">
                View Blueprint
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}