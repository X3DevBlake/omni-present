import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Briefcase } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ServiceProviders() {
  const providers = [
    { id: 1, name: 'AI Solutions Inc', specialty: 'Enterprise AI Implementation', rating: 4.9, projects: 124 },
    { id: 2, name: 'Neural Consulting', specialty: 'Agent Training & Optimization', rating: 4.8, projects: 89 },
    { id: 3, name: 'Tech Bridge Co', specialty: 'System Integration', rating: 4.7, projects: 156 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Service Providers</h1>
          <p className="text-white/60">Find professional AI consultants and partners</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, i) => (
            <motion.div key={provider.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{provider.name}</h3>
              <p className="text-white/60 text-sm mb-3">{provider.specialty}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{provider.rating}</span>
                </div>
                <span className="text-white/60">{provider.projects} projects</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}