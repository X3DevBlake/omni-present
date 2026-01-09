import React from 'react';
import { motion } from 'framer-motion';
import { Package, Download, Star } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AssetBrowser() {
  const assets = [
    { id: 1, name: 'Advanced Scout Agent', type: 'Agent', price: 49.99, rating: 4.8, downloads: 1240 },
    { id: 2, name: 'Urban Environment Pack', type: 'Environment', price: 29.99, rating: 4.9, downloads: 890 },
    { id: 3, name: 'Neural Blueprint Template', type: 'Blueprint', price: 19.99, rating: 4.7, downloads: 2100 },
    { id: 4, name: 'Voice Pack: Professional', type: 'Audio', price: 14.99, rating: 4.6, downloads: 560 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Asset Browser</h1>
          <p className="text-white/60">Discover and download premium AI assets</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assets.map((asset, i) => (
            <motion.div key={asset.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-12 h-12 text-white/40" />
              </div>
              <div className="mb-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{asset.type}</span>
              </div>
              <h3 className="text-white font-bold mb-2">{asset.name}</h3>
              <div className="flex items-center gap-2 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{asset.rating}</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{asset.downloads} downloads</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">${asset.price}</span>
                <button className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 text-sm">Buy</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}