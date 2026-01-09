import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Building } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Partnerships() {
  const partners = [
    { id: 1, name: 'TechCorp Global', category: 'Enterprise AI', logo: '🏢' },
    { id: 2, name: 'CloudNet Systems', category: 'Infrastructure', logo: '☁️' },
    { id: 3, name: 'Robotics Inc', category: 'Hardware', logo: '🤖' },
    { id: 4, name: 'DataVault', category: 'Storage', logo: '🗄️' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Our Partners</h1>
          <p className="text-white/60">Trusted by leading technology companies worldwide</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, i) => (
            <motion.div key={partner.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:scale-105 transition-all" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="text-5xl mb-3">{partner.logo}</div>
              <h3 className="text-white font-bold mb-1">{partner.name}</h3>
              <p className="text-white/60 text-sm">{partner.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}