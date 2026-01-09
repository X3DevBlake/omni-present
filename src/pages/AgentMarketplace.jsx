import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Star, ShoppingCart } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AgentMarketplace() {
  const agents = [
    { id: 1, name: 'Advanced Scout Pro', type: 'Exploration', price: 49.99, rating: 4.9, sales: 1240 },
    { id: 2, name: 'Guardian Elite', type: 'Defense', price: 69.99, rating: 4.8, sales: 890 },
    { id: 3, name: 'Strategist Master', type: 'Planning', price: 59.99, rating: 4.7, sales: 670 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Agent Marketplace</h1>
          <p className="text-white/60">Pre-trained AI agents ready to deploy</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <motion.div key={agent.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                <Bot className="w-16 h-16 text-white/40" />
              </div>
              <div className="mb-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{agent.type}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{agent.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm">{agent.rating}</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/60 text-sm">{agent.sales} sales</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-xl">${agent.price}</span>
                <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}